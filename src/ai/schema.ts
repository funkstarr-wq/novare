import type { FlattenedBlock, FlattenedField, RichTextField } from 'payload'
import { z } from 'zod'

import { lexicalToMarkdown, MarkdownError, markdownToLexical } from './markdown'
import { NEVER_EDITABLE } from './whitelist'

/**
 * zod schemas for AI write operations, generated from the Payload field config (brief §10.4),
 * so the assistant can only send values a field accepts. Rich text arrives as the Markdown subset
 * and leaves as Lexical; relationships are document ids. Groups and tabs merge into what is
 * stored; arrays and block lists replace it.
 */

const MAX_TEXT = 5_000
const MAX_TEXTAREA = 20_000

/** A document id: Postgres ids are integers; the model sometimes sends them as strings. */
export const docId = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/, 'Use the numeric document id.')
    .transform((value) => Number(value)),
])

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Use an ISO 8601 date, e.g. 2026-03-31.')

const richText = (field: RichTextField) =>
  z
    .string()
    .describe('Markdown subset')
    .transform((markdown, ctx) => {
      try {
        return markdownToLexical(markdown, field)
      } catch (error) {
        ctx.addIssue({
          code: 'custom',
          message: error instanceof MarkdownError ? error.message : 'Could not read this Markdown.',
        })
        return z.NEVER
      }
    })

const relationTargets = (relationTo: string | string[]) =>
  (Array.isArray(relationTo) ? relationTo : [relationTo]).filter((slug) => slug !== 'users')

function relation(field: Extract<FlattenedField, { type: 'relationship' | 'upload' }>) {
  const targets = relationTargets(field.relationTo)
  if (!targets.length) return null
  const one: z.ZodType = Array.isArray(field.relationTo)
    ? z.strictObject({ relationTo: z.enum(targets as [string, ...string[]]), value: docId })
    : docId
  const many = z.array(one).max(field.maxRows ?? 100)
  return (field.hasMany ? many : one.nullable()) as z.ZodType
}

function choices(field: Extract<FlattenedField, { type: 'radio' | 'select' }>) {
  const values = field.options.map((option) =>
    typeof option === 'string' ? option : option.value,
  ) as [string, ...string[]]
  const one = z.enum(values)
  if (field.type === 'select' && field.hasMany) return z.array(one)
  return one.nullable()
}

/** The schema for one field's value, or `null` when the assistant may not set it. */
export function fieldSchema(field: FlattenedField): z.ZodType | null {
  if (NEVER_EDITABLE.has(field.name)) return null
  switch (field.type) {
    case 'text':
      if (field.hasMany) return z.array(z.string().max(field.maxLength ?? MAX_TEXT))
      return z
        .string()
        .max(field.maxLength ?? MAX_TEXT)
        .nullable()
    case 'textarea':
      return z
        .string()
        .max(field.maxLength ?? MAX_TEXTAREA)
        .nullable()
    case 'email':
      return z.email().nullable()
    case 'number': {
      let number = z.number()
      if (typeof field.min === 'number') number = number.min(field.min)
      if (typeof field.max === 'number') number = number.max(field.max)
      return field.hasMany ? z.array(number) : number.nullable()
    }
    case 'checkbox':
      return z.boolean()
    case 'date':
      return isoDate.nullable()
    case 'select':
    case 'radio':
      return choices(field)
    case 'richText':
      return richText(field).nullable()
    case 'upload':
    case 'relationship':
      return relation(field)
    case 'group':
    case 'tab':
      return objectSchema(field.flattenedFields).optional()
    case 'array':
      return z
        .array(objectSchema(field.flattenedFields).extend({ id: z.string().max(64).optional() }))
        .max(field.maxRows ?? 100)
    case 'blocks':
      return blocksSchema(blocksOf(field))
    default:
      // json, code, point and join fields are not editable by the assistant.
      return null
  }
}

/** A strict object of the given fields, every one optional (drafts may be incomplete). */
export function objectSchema(fields: FlattenedField[], only?: readonly string[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    if (only && !only.includes(field.name)) continue
    const schema = fieldSchema(field)
    if (schema) shape[field.name] = schema.optional()
  }
  return z.strictObject(shape)
}

export const blocksOf = (field: Extract<FlattenedField, { type: 'blocks' }>): FlattenedBlock[] =>
  (field.blocks ?? []) as FlattenedBlock[]

/** One page section: its `blockType` and that block's fields. */
export function blockSchema(block: FlattenedBlock) {
  return objectSchema(block.flattenedFields).extend({
    blockType: z.literal(block.slug),
    blockName: z.string().max(200).nullable().optional(),
    id: z.string().max(64).optional(),
  })
}

export function blocksSchema(blocks: FlattenedBlock[]) {
  const [first, ...rest] = blocks.map(blockSchema)
  if (!first) return z.array(z.never())
  return z.array(rest.length ? z.discriminatedUnion('blockType', [first, ...rest]) : first)
}

/** zod issues as short sentences the model can act on. */
export const issuesText = (error: z.ZodError) =>
  error.issues
    .map((issue) => `${issue.path.length ? `${issue.path.join('.')}: ` : ''}${issue.message}`)
    .join('; ')

// --- Describing fields to the model ------------------------------------------------------

const typeLabel = (field: FlattenedField): string => {
  switch (field.type) {
    case 'upload':
    case 'relationship': {
      const targets = relationTargets(field.relationTo).join('|')
      return `${field.hasMany ? 'ids of ' : 'id of '}${targets}`
    }
    case 'select':
    case 'radio':
      return field.options.map((o) => (typeof o === 'string' ? o : o.value)).join('|')
    case 'richText':
      return 'markdown'
    default:
      return field.type
  }
}

/** A compact outline of fields, e.g. `title (text), hero { heading (text), … }`. */
export function describeFields(fields: FlattenedField[], only?: readonly string[]): string {
  return fields
    .filter((field) => (!only || only.includes(field.name)) && fieldSchema(field))
    .map((field) => {
      if (field.type === 'group' || field.type === 'tab') {
        return `${field.name} { ${describeFields(field.flattenedFields)} }`
      }
      if (field.type === 'array') {
        return `${field.name} [ { ${describeFields(field.flattenedFields)} } ]`
      }
      if (field.type === 'blocks') return `${field.name} (page sections)`
      return `${field.name} (${typeLabel(field)})`
    })
    .join(', ')
}

// --- Reading documents for the model -------------------------------------------------------

const titleOf = (value: Record<string, unknown>) =>
  value.title ?? value.name ?? value.headline ?? value.alt ?? value.filename ?? null

/** A relationship as the model sees it: id plus a title, never the whole related document. */
const brief = (value: unknown): unknown => {
  if (value && typeof value === 'object' && 'id' in value) {
    const doc = value as Record<string, unknown>
    return { id: doc.id, title: titleOf(doc) }
  }
  return value
}

/**
 * A stored value in the shape the write tools take: rich text as Markdown, relationships as
 * `{ id, title }`. Fields the assistant may not set are left out (`only` limits the top level).
 */
export function readable(
  value: Record<string, unknown> | null | undefined,
  fields: FlattenedField[],
  only?: readonly string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (!value) return out
  for (const field of fields) {
    if (only && !only.includes(field.name)) continue
    if (!fieldSchema(field) || !(field.name in value)) continue
    const raw = value[field.name]
    out[field.name] = readableValue(raw, field)
  }
  return out
}

function readableValue(raw: unknown, field: FlattenedField): unknown {
  if (raw === null || raw === undefined) return raw
  switch (field.type) {
    case 'richText':
      return lexicalToMarkdown(raw, field)
    case 'upload':
    case 'relationship':
      return Array.isArray(raw) ? raw.map(brief) : brief(raw)
    case 'group':
    case 'tab':
      return readable(raw as Record<string, unknown>, field.flattenedFields)
    case 'array':
      return (raw as Record<string, unknown>[]).map((row) => ({
        id: row.id,
        ...readable(row, field.flattenedFields),
      }))
    case 'blocks':
      return (raw as Record<string, unknown>[]).map((row) => readableBlock(row, blocksOf(field)))
    default:
      return raw
  }
}

export function readableBlock(row: Record<string, unknown>, blocks: FlattenedBlock[]) {
  const block = blocks.find((candidate) => candidate.slug === row.blockType)
  return {
    id: row.id,
    blockType: row.blockType,
    ...(row.blockName ? { blockName: row.blockName } : {}),
    ...(block ? readable(row, block.flattenedFields) : {}),
  }
}
