import type { BetaTool } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { Payload, PayloadRequest, Where } from 'payload'
import { z } from 'zod'

import { pathFor } from '@/lib/urls'

import { type Doc, isWriteTool, type Loader, OperationError, Workspace } from './operations'
import { issuesText, readable } from './schema'
import { AI_COLLECTIONS, BLOCK_COLLECTIONS, EDITABLE_FIELDS } from './whitelist'

/**
 * The tools the model may call (brief §10.4). Read tools run immediately, as the requesting
 * user, so the model sees only what that person may read. Write tools go to the workspace and
 * become proposals. The definitions are fixed, so the request prefix stays cacheable.
 */
const collection = {
  type: 'string',
  enum: [...AI_COLLECTIONS],
  description: 'Collection slug.',
} as const
const id = {
  type: ['integer', 'string'],
  description: 'Document id, or "new:<n>" for a document created earlier in this request.',
} as const
const fields = {
  type: 'object',
  description:
    'Field values, keyed by field name, as listed in the system prompt. Rich text is Markdown. Relationships and images are document ids. Groups merge; arrays replace.',
  additionalProperties: true,
} as const

const tool = (
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[],
): BetaTool => ({
  name,
  description,
  input_schema: { type: 'object', properties, required, additionalProperties: false },
})

export const TOOLS: BetaTool[] = [
  tool(
    'get_document',
    'Read one document (its latest draft, including changes you proposed in this request): the fields you may edit, its URL and whether it is live. Give id or slug.',
    { collection, id, slug: { type: 'string' } },
    ['collection'],
  ),
  tool(
    'search_documents',
    'Find documents in a collection by title or slug.',
    { collection, query: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 20 } },
    ['collection', 'query'],
  ),
  tool(
    'list_blocks',
    'List the page sections of a page or solution: block ids, types and a short summary.',
    { collection, id },
    ['collection', 'id'],
  ),
  tool(
    'find_media',
    'Find images in the media library by alt text or file name.',
    { query: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 20 } },
    ['query'],
  ),
  tool(
    'get_site_structure',
    'The page tree (titles, paths, status) and how many documents each collection has.',
    {},
    [],
  ),
  tool(
    'update_fields',
    'Propose new values for editable fields of a document.',
    { collection, id, fields },
    ['collection', 'id', 'fields'],
  ),
  tool(
    'update_block',
    'Propose new values for fields of one page section.',
    { collection, id, blockId: { type: 'string' }, fields },
    ['collection', 'id', 'blockId', 'fields'],
  ),
  tool(
    'insert_block',
    'Propose a new page section, after a given section or at a 0-based position (default: the end).',
    {
      collection,
      id,
      blockType: { type: 'string' },
      fields,
      afterBlockId: { type: 'string' },
      position: { type: 'integer', minimum: 0 },
    },
    ['collection', 'id', 'blockType', 'fields'],
  ),
  tool(
    'remove_block',
    'Propose removing one page section.',
    { collection, id, blockId: { type: 'string' } },
    ['collection', 'id', 'blockId'],
  ),
  tool(
    'move_block',
    'Propose moving one page section to a 0-based position.',
    { collection, id, blockId: { type: 'string' }, toIndex: { type: 'integer', minimum: 0 } },
    ['collection', 'id', 'blockId', 'toIndex'],
  ),
  tool(
    'create_document',
    'Propose a new document. It is always created as a draft. Returns an id like "new:1" that later calls can use.',
    { collection, data: fields },
    ['collection', 'data'],
  ),
  tool(
    'set_media',
    'Propose an image for an image field (e.g. "heroImage", "hero.image", "meta.image"), optionally with new alt text for that image.',
    {
      collection,
      id,
      field: { type: 'string' },
      mediaId: { type: 'integer' },
      alt: { type: 'string' },
    },
    ['collection', 'id', 'field', 'mediaId'],
  ),
  tool(
    'update_seo',
    'Propose a new SEO title, meta description or share image.',
    {
      collection,
      id,
      title: { type: 'string' },
      description: { type: 'string' },
      ogImageId: { type: ['integer', 'null'] },
    },
    ['collection', 'id'],
  ),
  tool(
    'archive_document',
    'Propose taking a live document off the site (unpublishing it). Nothing is ever deleted.',
    { collection, id },
    ['collection', 'id'],
  ),
]

// --- Reading -----------------------------------------------------------------------------

type Actor = { payload: Payload; user: PayloadRequest['user']; req?: Partial<PayloadRequest> }

/** Reads documents as the requesting user, for the workspace. */
export function loaderFor({ payload, user, req }: Actor): Loader {
  return {
    async load(slug, docID) {
      const draft = await payload
        .findByID({
          collection: slug,
          id: docID,
          draft: true,
          depth: 0,
          overrideAccess: false,
          user,
          req,
        })
        .catch(() => null)
      if (!draft) return null
      const live = await payload
        .findByID({ collection: slug, id: docID, depth: 0, overrideAccess: true, req })
        .catch(() => null)
      return {
        draft: draft as unknown as Doc,
        published: (live as { _status?: string } | null)?._status === 'published',
      }
    },
    async media(mediaID) {
      const media = await payload
        .findByID({ collection: 'media', id: mediaID, depth: 0, overrideAccess: false, user, req })
        .catch(() => null)
      return media ? { id: media.id, alt: media.alt ?? null } : null
    },
  }
}

const GetDocument = z.object({
  collection: z.string(),
  id: z.union([z.number(), z.string()]).optional(),
  slug: z.string().optional(),
})
const Search = z.object({
  collection: z.string(),
  query: z.string().max(200),
  limit: z.number().int().min(1).max(20).optional(),
})
const ListBlocks = z.object({ collection: z.string(), id: z.union([z.number(), z.string()]) })
const FindMedia = z.object({
  query: z.string().max(200),
  limit: z.number().int().min(1).max(20).optional(),
})

const parse = <T extends z.ZodType>(schema: T, input: unknown): z.output<T> => {
  const result = schema.safeParse(input)
  if (!result.success) throw new OperationError(issuesText(result.error))
  return result.data
}

const titleField = (payload: Payload, slug: string) =>
  payload.collections[slug as 'pages'].config.admin?.useAsTitle ?? 'id'

const summaryOf = (block: Doc) => {
  const text = [block.heading, block.title, block.text, block.intro].find(
    (value) => typeof value === 'string' && value.trim(),
  ) as string | undefined
  return text ? text.slice(0, 100) : ''
}

const data = (label: string, value: unknown) =>
  `<document_data source="${label}">\n${JSON.stringify(value, null, 1)}\n</document_data>`

export class ToolRunner {
  readonly workspace: Workspace

  constructor(private actor: Actor) {
    this.workspace = new Workspace(actor.payload, loaderFor(actor))
  }

  private find = (args: Parameters<Payload['find']>[0]) =>
    this.actor.payload.find({
      depth: 0,
      overrideAccess: false,
      user: this.actor.user,
      req: this.actor.req,
      ...args,
    } as Parameters<Payload['find']>[0])

  /** Runs a read tool. Returns the tool result text; throws OperationError for the model. */
  async read(name: string, input: Record<string, unknown>): Promise<string> {
    switch (name) {
      case 'get_document': {
        const args = parse(GetDocument, input)
        const slug = this.workspace.collectionOf(args.collection)
        let target: number | string | undefined = args.id
        if (target === undefined && args.slug) {
          const { docs } = await this.find({
            collection: slug,
            where: { slug: { equals: args.slug } },
            limit: 1,
            draft: true,
          })
          target = docs[0]?.id
          if (target === undefined) throw new OperationError(`No ${slug} with slug "${args.slug}".`)
        }
        if (target === undefined) throw new OperationError('Give an id or a slug.')
        const entry = await this.workspace.entry(slug, target)
        const doc = entry.current
        const editable = EDITABLE_FIELDS[slug]
        return data(`${slug}:${entry.id ?? entry.key}`, {
          collection: slug,
          id: entry.id ?? entry.key,
          title: entry.title,
          url: pathFor(slug, doc),
          live: entry.published,
          regulated: entry.regulated,
          editableFields: editable,
          fields: readable(doc, this.workspace.fields(slug), editable),
          ...(BLOCK_COLLECTIONS.includes(slug)
            ? { sections: this.workspace.readableLayout(entry) }
            : {}),
        })
      }

      case 'search_documents': {
        const args = parse(Search, input)
        const slug = this.workspace.collectionOf(args.collection)
        const title = titleField(this.actor.payload, slug)
        const or: Where[] = [{ [title]: { like: args.query } }]
        if (this.workspace.fields(slug).some((field) => field.name === 'slug')) {
          or.push({ slug: { like: args.query } })
        }
        const { docs } = await this.find({
          collection: slug,
          where: { or },
          limit: args.limit ?? 10,
          draft: true,
        })
        return data(
          `search:${slug}`,
          (docs as unknown as Doc[]).map((doc) => ({
            id: doc.id,
            title: doc[title],
            url: pathFor(slug, doc),
            status: doc._status,
          })),
        )
      }

      case 'list_blocks': {
        const args = parse(ListBlocks, input)
        const slug = this.workspace.collectionOf(args.collection)
        if (!BLOCK_COLLECTIONS.includes(slug))
          throw new OperationError(`${slug} has no page sections.`)
        const entry = await this.workspace.entry(slug, args.id)
        const layout = (entry.current.layout as Doc[] | undefined) ?? []
        return data(
          `${slug}:${entry.id ?? entry.key}:sections`,
          layout.map((block, index) => ({
            position: index,
            id: block.id,
            blockType: block.blockType,
            summary: summaryOf(block),
          })),
        )
      }

      case 'find_media': {
        const args = parse(FindMedia, input)
        const { docs } = await this.find({
          collection: 'media',
          where: { or: [{ alt: { like: args.query } }, { filename: { like: args.query } }] },
          limit: args.limit ?? 10,
        })
        return data(
          'media',
          docs.map((doc) => {
            const media = doc as unknown as Doc
            return {
              id: media.id,
              alt: media.alt,
              filename: media.filename,
              width: media.width,
              height: media.height,
            }
          }),
        )
      }

      case 'get_site_structure': {
        const { docs } = await this.find({
          collection: 'pages',
          limit: 500,
          sort: 'path',
          draft: true,
          select: { title: true, path: true, _status: true },
        })
        const counts: Record<string, number> = {}
        for (const slug of AI_COLLECTIONS) {
          const { totalDocs } = await this.actor.payload.count({
            collection: slug,
            overrideAccess: false,
            user: this.actor.user,
            req: this.actor.req,
          })
          counts[slug] = totalDocs
        }
        return data('site-structure', {
          pages: (docs as unknown as Doc[]).map((doc) => ({
            id: doc.id,
            title: doc.title,
            path: doc.path,
            status: doc._status,
          })),
          counts,
        })
      }

      default:
        throw new OperationError(`Unknown tool "${name}".`)
    }
  }
}

export const READ_TOOLS = [
  'get_document',
  'search_documents',
  'list_blocks',
  'find_media',
  'get_site_structure',
]
export const isReadTool = (name: string) => READ_TOOLS.includes(name)
export { isWriteTool }
