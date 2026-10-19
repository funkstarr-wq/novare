import { randomBytes } from 'node:crypto'

import type { FlattenedBlock, FlattenedField, Payload } from 'payload'
import { z } from 'zod'

import { isRegulatedDocument } from '@/access'
import { pathFor } from '@/lib/urls'

import {
  blockSchema,
  blocksOf,
  docId,
  issuesText,
  objectSchema,
  readable,
  readableBlock,
} from './schema'
import {
  type AiCollection,
  BLOCK_COLLECTIONS,
  CREATABLE,
  EDITABLE_FIELDS,
  hasSeo,
  isAiCollection,
  urlFieldsOf,
} from './whitelist'

/**
 * The write tools (brief §10.4) never write. Each proposal is validated and applied to an
 * in-memory copy of the document (the latest draft), so later proposals in the same request see
 * earlier ones, and the person sees a field-level diff. Applying a changeset replays the accepted
 * proposals on fresh copies and saves the result as drafts (`src/ai/apply.ts`).
 */
export type Doc = Record<string, unknown>

export const WRITE_TOOLS = [
  'update_fields',
  'update_block',
  'insert_block',
  'remove_block',
  'move_block',
  'create_document',
  'set_media',
  'update_seo',
  'archive_document',
] as const
export type WriteTool = (typeof WRITE_TOOLS)[number]
export const isWriteTool = (name: string): name is WriteTool =>
  (WRITE_TOOLS as readonly string[]).includes(name)

export type Change = { path: string; before: string; after: string }

/** One proposal as stored on the changeset. */
export type OperationRecord = {
  index: number
  tool: WriteTool
  args: Record<string, unknown>
  ok: boolean
  error?: string
  summary?: string
  doc?: { collection: AiCollection; key: string; id: number | null; title: string }
  changes?: Change[]
  /** Text this operation writes, for the financial-claims check. */
  texts?: string[]
  /** For set_media with alt: the media item and its alt text before the change. */
  media?: { id: number; alt: string | null; previousAlt: string | null }
  /** The document needs compliance approval (a regulated collection or page). */
  regulated?: boolean
  accepted?: boolean
}

export type Entry = {
  key: string
  collection: AiCollection
  id: number | null
  title: string
  /** The latest draft when loaded; `null` for a document this changeset creates. */
  original: Doc | null
  current: Doc
  /** Whether the live (published) version exists. */
  published: boolean
  regulated: boolean
  archive: boolean
  touched: Set<string>
}

export type Loader = {
  /** The latest draft of a document, and whether it is live; `null` when missing or not readable. */
  load(collection: AiCollection, id: number): Promise<{ draft: Doc; published: boolean } | null>
  media(id: number): Promise<{ id: number; alt: string | null } | null>
}

export class OperationError extends Error {
  name = 'OperationError'
}

const clone = <T>(value: T): T => structuredClone(value)

const isPlain = (value: unknown): value is Doc =>
  Boolean(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !('root' in (value as object))

/** Groups and tabs merge into what is stored; everything else (arrays included) replaces it. */
function merge(target: Doc, patch: Doc) {
  for (const [key, value] of Object.entries(patch)) {
    if (isPlain(value) && isPlain(target[key])) merge(target[key] as Doc, value)
    else target[key] = value
  }
}

/** Every string in the proposal's input, for the claims check. */
export function textsOf(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value] : []
  if (Array.isArray(value)) return value.flatMap(textsOf)
  if (value && typeof value === 'object') return Object.values(value).flatMap(textsOf)
  return []
}

// --- Diffs ---------------------------------------------------------------------------------

const show = (value: unknown) =>
  value === null || value === undefined || value === ''
    ? '—'
    : typeof value === 'object'
      ? 'id' in (value as object)
        ? `#${(value as { id: unknown }).id}${(value as { title?: unknown }).title ? ` ${(value as { title: unknown }).title}` : ''}`
        : JSON.stringify(value)
      : String(value)

/** Leaf values by path, e.g. `hero.heading`, `layout[hero 66f…].heading`. */
function leaves(value: unknown, prefix: string, out: Map<string, string>) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const row = item as Doc
      const label =
        row && typeof row === 'object' && row.blockType ? `${row.blockType} ${row.id}` : index
      leaves(item, `${prefix}[${label}]`, out)
    })
    if (!value.length) out.set(prefix, '—')
    return
  }
  if (
    value &&
    typeof value === 'object' &&
    !('title' in value && 'id' in value && Object.keys(value).length === 2)
  ) {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'id' && prefix) continue
      leaves(child, prefix ? `${prefix}.${key}` : key, out)
    }
    return
  }
  out.set(prefix, show(value))
}

export function diff(before: Doc, after: Doc): Change[] {
  const a = new Map<string, string>()
  const b = new Map<string, string>()
  leaves(before, '', a)
  leaves(after, '', b)
  const paths = [...new Set([...a.keys(), ...b.keys()])]
  return paths
    .filter((path) => (a.get(path) ?? '—') !== (b.get(path) ?? '—'))
    .map((path) => ({ path, before: a.get(path) ?? '—', after: b.get(path) ?? '—' }))
}

// --- The workspace -------------------------------------------------------------------------

const ArgsBase = z.object({ collection: z.string(), id: z.union([z.number(), z.string()]) })

const UpdateFields = ArgsBase.extend({ fields: z.record(z.string(), z.unknown()) })
const UpdateBlock = ArgsBase.extend({
  blockId: z.string(),
  fields: z.record(z.string(), z.unknown()),
})
const InsertBlock = ArgsBase.extend({
  blockType: z.string(),
  fields: z.record(z.string(), z.unknown()).default({}),
  afterBlockId: z.string().optional(),
  position: z.number().int().min(0).optional(),
})
const RemoveBlock = ArgsBase.extend({ blockId: z.string() })
const MoveBlock = ArgsBase.extend({ blockId: z.string(), toIndex: z.number().int().min(0) })
const CreateDocument = z.object({
  collection: z.string(),
  data: z.record(z.string(), z.unknown()),
})
const SetMedia = ArgsBase.extend({
  field: z.string(),
  mediaId: docId,
  alt: z.string().max(300).optional(),
})
const UpdateSeo = ArgsBase.extend({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  ogImageId: docId.nullable().optional(),
})

const parse = <T extends z.ZodType>(schema: T, args: unknown): z.output<T> => {
  const result = schema.safeParse(args)
  if (!result.success) throw new OperationError(issuesText(result.error))
  return result.data
}

const titleOf = (doc: Doc, id: number | string) =>
  String(doc.title ?? doc.name ?? doc.headline ?? `#${id}`)

export class Workspace {
  private entries = new Map<string, Entry>()
  private created = 0

  constructor(
    private payload: Payload,
    private loader: Loader,
  ) {}

  isRegulated = (key: string) => this.entries.get(key)?.regulated === true

  /** Documents this changeset changes, in the order they were first touched. */
  changed(): Entry[] {
    return [...this.entries.values()].filter(
      (entry) => entry.touched.size > 0 || entry.archive || entry.id === null,
    )
  }

  fields(collection: AiCollection): FlattenedField[] {
    return this.payload.collections[collection].config.flattenedFields
  }

  blocks(collection: AiCollection): FlattenedBlock[] {
    const layout = this.fields(collection).find((field) => field.name === 'layout')
    return layout?.type === 'blocks' ? blocksOf(layout) : []
  }

  collectionOf(value: string): AiCollection {
    if (!isAiCollection(value)) throw new OperationError(`Unknown collection "${value}".`)
    return value
  }

  /** The working copy of a document; `new:<n>` names one created earlier in this changeset. */
  async entry(collection: AiCollection, id: number | string): Promise<Entry> {
    if (typeof id === 'string' && id.startsWith('new:')) {
      const created = this.entries.get(id)
      if (!created || created.collection !== collection) {
        throw new OperationError(`No document "${id}" has been created in ${collection}.`)
      }
      return created
    }
    const numeric = parse(docId, id)
    const key = `${collection}:${numeric}`
    const existing = this.entries.get(key)
    if (existing) return existing
    const loaded = await this.loader.load(collection, numeric)
    if (!loaded) throw new OperationError(`${collection} #${numeric} does not exist.`)
    const regulated = isRegulatedDocument(
      this.payload.collections[collection].config.custom?.regulated === true,
      loaded.draft,
    )
    const entry: Entry = {
      key,
      collection,
      id: numeric,
      title: titleOf(loaded.draft, numeric),
      original: clone(loaded.draft),
      current: clone(loaded.draft),
      published: loaded.published,
      regulated,
      archive: false,
      touched: new Set(),
    }
    this.entries.set(key, entry)
    return entry
  }

  /** Field names a write may set on this document (URL keys only while never published). */
  private editable(entry: Entry): readonly string[] {
    const fields = EDITABLE_FIELDS[entry.collection]
    if (!entry.published) return fields
    const urlFields = urlFieldsOf(entry.collection)
    return fields.filter((name) => !urlFields.includes(name))
  }

  private checkNames(entry: Entry, names: string[]) {
    const allowed = this.editable(entry)
    const refused = names.filter((name) => !allowed.includes(name))
    if (!refused.length) return
    const urlFields = urlFieldsOf(entry.collection)
    const reason = refused.some((name) => urlFields.includes(name) && entry.published)
      ? ' It is live, and changing its URL needs a redirect: ask a person to do it.'
      : ''
    throw new OperationError(
      allowed.length
        ? `You cannot change ${refused.join(', ')} on ${entry.collection}.${reason} Editable fields: ${allowed.join(', ')}.`
        : `${entry.collection} is read-only for the assistant.`,
    )
  }

  private ensureNotArchived(entry: Entry) {
    if (entry.archive)
      throw new OperationError(`${entry.title} is being archived in this changeset.`)
  }

  private layoutOf(entry: Entry): Doc[] {
    if (!BLOCK_COLLECTIONS.includes(entry.collection)) {
      throw new OperationError(`${entry.collection} has no page sections.`)
    }
    if (!Array.isArray(entry.current.layout)) entry.current.layout = []
    return entry.current.layout as Doc[]
  }

  private blockIndex(entry: Entry, blockId: string) {
    const index = this.layoutOf(entry).findIndex((block) => block.id === blockId)
    if (index < 0) {
      throw new OperationError(
        `No section with id "${blockId}" on ${entry.title}. Use list_blocks.`,
      )
    }
    return index
  }

  /** Readable values of the touched top-level fields, for a diff. */
  private snapshot(entry: Entry, names: string[]): Doc {
    const fields = this.fields(entry.collection)
    return readable(entry.current, fields, names)
  }

  private record(entry: Entry, names: string[], run: () => void) {
    const before = this.snapshot(entry, names)
    run()
    for (const name of names) entry.touched.add(name)
    return diff(before, this.snapshot(entry, names))
  }

  private ref(entry: Entry): NonNullable<OperationRecord['doc']> {
    return { collection: entry.collection, key: entry.key, id: entry.id, title: entry.title }
  }

  /**
   * Validates one proposal and applies it to the working copy. Throws OperationError with a
   * message for the model when the proposal is not allowed.
   */
  async apply(
    tool: WriteTool,
    args: Record<string, unknown>,
    createdKey?: string,
  ): Promise<Omit<OperationRecord, 'index' | 'tool' | 'args' | 'ok'>> {
    switch (tool) {
      case 'update_fields': {
        const input = parse(UpdateFields, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const names = Object.keys(input.fields)
        if (!names.length) throw new OperationError('Give at least one field to change.')
        this.checkNames(entry, names)
        const values = parse(
          objectSchema(this.fields(entry.collection), this.editable(entry)),
          input.fields,
        )
        const changes = this.record(entry, names, () => merge(entry.current, values))
        return {
          summary: `Update ${names.join(', ')} on ${entry.title}`,
          doc: this.ref(entry),
          changes,
          texts: textsOf(input.fields),
        }
      }

      case 'update_seo': {
        const input = parse(UpdateSeo, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        if (!hasSeo(entry.collection)) {
          throw new OperationError(`${entry.collection} has no SEO fields you can change.`)
        }
        const meta: Doc = {}
        if (input.title !== undefined) meta.title = input.title
        if (input.description !== undefined) meta.description = input.description
        if (input.ogImageId !== undefined) {
          if (input.ogImageId !== null) await this.requireMedia(input.ogImageId)
          meta.image = input.ogImageId
        }
        if (!Object.keys(meta).length)
          throw new OperationError('Give a title, description or image.')
        const values = parse(objectSchema(this.fields(entry.collection), ['meta']), { meta })
        const changes = this.record(entry, ['meta'], () => merge(entry.current, values))
        return {
          summary: `Update SEO on ${entry.title}`,
          doc: this.ref(entry),
          changes,
          texts: textsOf([input.title, input.description]),
        }
      }

      case 'set_media': {
        const input = parse(SetMedia, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const path = input.field.split('.')
        const top = path[0]
        this.checkNames(entry, [top])
        const field = this.uploadField(this.fields(entry.collection), path)
        if (!field) {
          throw new OperationError(
            `"${input.field}" is not an image field on ${entry.collection}. For a page section use update_block.`,
          )
        }
        const media = await this.requireMedia(input.mediaId)
        const patch: Doc = {}
        let cursor = patch
        path.slice(0, -1).forEach((part) => {
          cursor = cursor[part] = {} as Doc
        })
        cursor[path[path.length - 1]] = input.mediaId
        const values = parse(objectSchema(this.fields(entry.collection), [top]), patch)
        const changes = this.record(entry, [top], () => merge(entry.current, values))
        const altChange =
          input.alt !== undefined && input.alt !== media.alt
            ? { id: media.id, alt: input.alt, previousAlt: media.alt }
            : undefined
        if (altChange) {
          changes.push({
            path: `media #${media.id} alt`,
            before: media.alt ?? '—',
            after: input.alt!,
          })
        }
        return {
          summary: `Set ${input.field} on ${entry.title} to media #${media.id}`,
          doc: this.ref(entry),
          changes,
          texts: textsOf(input.alt),
          media: altChange,
        }
      }

      case 'update_block': {
        const input = parse(UpdateBlock, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const layout = this.layoutOf(entry)
        const index = this.blockIndex(entry, input.blockId)
        const block = this.blocks(entry.collection).find(
          (candidate) => candidate.slug === layout[index].blockType,
        )
        if (!block) throw new OperationError('This section type cannot be edited.')
        const values = parse(blockSchema(block).omit({ blockType: true, id: true }), input.fields)
        const changes = this.record(entry, ['layout'], () => merge(layout[index], values))
        return {
          summary: `Edit the ${block.slug} section on ${entry.title}`,
          doc: this.ref(entry),
          changes,
          texts: textsOf(input.fields),
        }
      }

      case 'insert_block': {
        const input = parse(InsertBlock, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const layout = this.layoutOf(entry)
        const block = this.blocks(entry.collection).find(
          (candidate) => candidate.slug === input.blockType,
        )
        if (!block) {
          const types = this.blocks(entry.collection).map((candidate) => candidate.slug)
          throw new OperationError(
            `Unknown section type "${input.blockType}". Use one of: ${types.join(', ')}.`,
          )
        }
        const id = randomBytes(12).toString('hex')
        const values = parse(blockSchema(block), { ...input.fields, blockType: block.slug, id })
        const at =
          input.afterBlockId !== undefined
            ? this.blockIndex(entry, input.afterBlockId) + 1
            : Math.min(input.position ?? layout.length, layout.length)
        const changes = this.record(entry, ['layout'], () => layout.splice(at, 0, values))
        return {
          summary: `Add a ${block.slug} section to ${entry.title} at position ${at + 1}`,
          doc: this.ref(entry),
          changes,
          texts: textsOf(input.fields),
        }
      }

      case 'remove_block': {
        const input = parse(RemoveBlock, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const index = this.blockIndex(entry, input.blockId)
        const type = String(this.layoutOf(entry)[index].blockType)
        const changes = this.record(entry, ['layout'], () => this.layoutOf(entry).splice(index, 1))
        return {
          summary: `Remove the ${type} section from ${entry.title}`,
          doc: this.ref(entry),
          changes,
        }
      }

      case 'move_block': {
        const input = parse(MoveBlock, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        this.ensureNotArchived(entry)
        const layout = this.layoutOf(entry)
        const index = this.blockIndex(entry, input.blockId)
        const to = Math.min(input.toIndex, layout.length - 1)
        const type = String(layout[index].blockType)
        const order = () => layout.map((block) => `${block.blockType}`).join(' → ')
        const before = order()
        entry.touched.add('layout')
        const [moved] = layout.splice(index, 1)
        layout.splice(to, 0, moved)
        return {
          summary: `Move the ${type} section on ${entry.title} to position ${to + 1}`,
          doc: this.ref(entry),
          changes: [{ path: 'layout (order)', before, after: order() }],
        }
      }

      case 'create_document': {
        const input = parse(CreateDocument, args)
        const collection = this.collectionOf(input.collection)
        if (!CREATABLE.includes(collection)) {
          throw new OperationError(
            `You cannot create ${collection}. You can create: ${CREATABLE.join(', ')}.`,
          )
        }
        const allowed = [
          ...EDITABLE_FIELDS[collection],
          ...(BLOCK_COLLECTIONS.includes(collection) ? ['layout'] : []),
        ]
        const refused = Object.keys(input.data).filter((name) => !allowed.includes(name))
        if (refused.length) {
          throw new OperationError(
            `You cannot set ${refused.join(', ')}. Allowed: ${allowed.join(', ')}.`,
          )
        }
        const values = parse(objectSchema(this.fields(collection), allowed), input.data)
        if (Array.isArray(values.layout)) {
          for (const block of values.layout as Doc[]) block.id = randomBytes(12).toString('hex')
        }
        const key = createdKey ?? `new:${(this.created += 1)}`
        if (createdKey) this.created = Math.max(this.created, Number(createdKey.slice(4)) || 0)
        const entry: Entry = {
          key,
          collection,
          id: null,
          title: titleOf(values, key),
          original: null,
          current: values,
          published: false,
          regulated: isRegulatedDocument(false, values),
          archive: false,
          touched: new Set(Object.keys(values)),
        }
        this.entries.set(key, entry)
        return {
          summary: `Create a draft in ${collection}: ${entry.title}`,
          doc: this.ref(entry),
          changes: diff({}, readable(values, this.fields(collection), allowed)),
          texts: textsOf(input.data),
        }
      }

      case 'archive_document': {
        const input = parse(ArgsBase, args)
        const entry = await this.entry(this.collectionOf(input.collection), input.id)
        if (entry.id === null)
          throw new OperationError('A document created in this request is already a draft.')
        if (!entry.published)
          throw new OperationError(`${entry.title} is not live, so there is nothing to archive.`)
        if (entry.collection === 'legal-documents')
          throw new OperationError('Legal documents are read-only for you.')
        entry.archive = true
        const url = pathFor(entry.collection, entry.current)
        return {
          summary: `Unpublish ${entry.title}${url ? ` (${url})` : ''}`,
          doc: this.ref(entry),
          changes: [{ path: 'status', before: 'published', after: 'unpublished (draft)' }],
        }
      }
    }
  }

  private uploadField(fields: FlattenedField[], path: string[]): FlattenedField | null {
    const [head, ...rest] = path
    const field = fields.find((candidate) => candidate.name === head)
    if (!field) return null
    if (!rest.length) return field.type === 'upload' && !field.hasMany ? field : null
    if (field.type === 'group' || field.type === 'tab')
      return this.uploadField(field.flattenedFields, rest)
    return null
  }

  private async requireMedia(id: number) {
    const media = await this.loader.media(id)
    if (!media) throw new OperationError(`Media #${id} does not exist. Use find_media.`)
    return media
  }

  /** A block list in the shape the model reads (for list_blocks and get_document). */
  readableLayout(entry: Entry) {
    const blocks = this.blocks(entry.collection)
    return ((entry.current.layout as Doc[] | undefined) ?? []).map((row) =>
      readableBlock(row, blocks),
    )
  }
}
