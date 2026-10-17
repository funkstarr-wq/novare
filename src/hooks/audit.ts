import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { stableStringify } from '@/lib/stableStringify'

type Doc = Record<string, unknown>
type Operation = 'create' | 'update' | 'delete' | 'publish' | 'unpublish'

// _status is reported through the operation (create/publish/update) instead.
const IGNORED_KEYS = new Set(['updatedAt', 'createdAt', 'id', 'generateSlug', '_status'])
const MAX_SUMMARY = 500

/** Top-level fields whose value differs between two versions of a document. */
export function changedFields(previous: Doc | undefined, next: Doc): string[] {
  const keys = new Set([...Object.keys(previous ?? {}), ...Object.keys(next)])
  return [...keys]
    .filter((key) => !IGNORED_KEYS.has(key))
    .filter((key) => stableStringify(previous?.[key]) !== stableStringify(next[key]))
    .sort()
}

export function summarise(operation: Operation, previous: Doc | undefined, next: Doc): string {
  if (operation === 'delete') return 'Deleted.'
  const status = next._status === 'published' ? 'published' : 'draft'
  const head =
    operation === 'create'
      ? `Created (${status}).`
      : operation === 'publish'
        ? 'Published.'
        : 'Saved as draft.'
  const fields = operation === 'create' ? [] : changedFields(previous, next)
  const summary = fields.length ? `${head} Changed: ${fields.join(', ')}.` : head
  return summary.length > MAX_SUMMARY ? `${summary.slice(0, MAX_SUMMARY - 1)}…` : summary
}

// The admin autosaves drafts every few seconds while someone types; those are not audit events.
const isAutosave = (req: PayloadRequest) => {
  const flag = (req.query as Record<string, unknown> | undefined)?.autosave
  return flag === true || flag === 'true'
}

async function writeEntry(
  req: PayloadRequest,
  entry: { collection: string; docId: number | string; operation: Operation; diffSummary: string },
) {
  const context = req.context as { auditSource?: 'ai' | 'human'; aiChangesetId?: number | string }
  await req.payload.create({
    collection: 'audit-log',
    data: {
      ...entry,
      docId: String(entry.docId),
      user: (req.user as { id?: number } | null)?.id ?? null,
      source: context.auditSource ?? 'human',
      changesetId: context.aiChangesetId ? Number(context.aiChangesetId) : null,
      timestamp: new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })
}

/** Records every create, save and publish of a content document (brief §6.3). */
export const auditAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (operation === 'update' && isAutosave(req)) return doc
  const kind: Operation =
    operation === 'create' ? 'create' : doc._status === 'published' ? 'publish' : 'update'
  await writeEntry(req, {
    collection: collection.slug,
    docId: doc.id,
    operation: kind,
    diffSummary: summarise(kind, previousDoc, doc),
  })
  return doc
}

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await writeEntry(req, {
    collection: collection.slug,
    docId: doc.id,
    operation: 'delete',
    diffSummary: 'Deleted.',
  })
  return doc
}

export const auditGlobalAfterChange: GlobalAfterChangeHook = async ({
  doc,
  global,
  previousDoc,
  req,
}) => {
  await writeEntry(req, {
    collection: `global:${global.slug}`,
    docId: global.slug,
    operation: 'update',
    diffSummary: summarise('update', previousDoc, doc),
  })
  return doc
}
