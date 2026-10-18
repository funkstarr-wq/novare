import {
  type CollectionAfterChangeHook,
  type CollectionSlug,
  commitTransaction,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'

import { canApprove, canPublish, hasRole } from '@/access'
import type { RoleUser } from '@/access/roles'
import { submitForReview } from '@/endpoints/submitForReview'
import { pathFor } from '@/lib/urls'
import type { AiChangeset } from '@/payload-types'

import { AiRefusal } from './guards'
import { type Doc, type OperationRecord, Workspace } from './operations'
import { type Flag, needsCompliance, phraseFlags } from './plan'
import { loaderFor } from './tools'

/**
 * Applying, discarding and rolling back changesets (brief §10.3 steps 6–8). Every write runs
 * through the Local API as the requesting user (`overrideAccess: false`), so access control and
 * the approval guard apply, inside one transaction, and lands as a draft. The audit log records
 * each one with `source: ai` and the changeset id.
 */

type Actor = RoleUser & { id: number }

const userOf = (req: PayloadRequest) => {
  if (!req.user) throw new AiRefusal('Sign in to use the assistant.', 401)
  return req.user as unknown as Actor
}

async function ownChangeset(req: PayloadRequest, id: number, statuses: AiChangeset['status'][]) {
  const user = userOf(req)
  const changeset = await req.payload
    .findByID({ collection: 'ai-changesets', id, depth: 0, overrideAccess: true, req })
    .catch(() => null)
  if (!changeset) throw new AiRefusal('Changeset not found.', 404)
  const ownerId = typeof changeset.user === 'object' ? changeset.user.id : changeset.user
  if (ownerId !== user.id && !hasRole(user, 'admin')) {
    throw new AiRefusal('Only the person who asked (or an admin) can do this.')
  }
  if (!statuses.includes(changeset.status)) {
    throw new AiRefusal(`This changeset is ${changeset.status.replaceAll('_', ' ')}.`, 409)
  }
  return changeset
}

/** The latest version of a document: restoring it undoes everything saved after it. */
async function latestVersionId(req: PayloadRequest, collection: CollectionSlug, id: number) {
  const { docs } = await req.payload.findVersions({
    collection,
    where: { parent: { equals: id } },
    sort: '-updatedAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs[0] ? String(docs[0].id) : null
}

async function inTransaction<T>(req: PayloadRequest, run: () => Promise<T>): Promise<T> {
  const owns = await initTransaction(req)
  try {
    const result = await run()
    if (owns) await commitTransaction(req)
    return result
  } catch (error) {
    if (owns) await killTransaction(req)
    throw error
  }
}

const hasReviewGroup = (payload: Payload, collection: string) =>
  payload.collections[collection as CollectionSlug].config.flattenedFields.some(
    (field) => field.name === 'review',
  )

const pick = (doc: Doc, names: Set<string>) =>
  Object.fromEntries([...names].map((name) => [name, doc[name] ?? null]))

export type AppliedDoc = {
  collection: string
  id: number
  title: string
  url: string | null
  inReview: boolean
}

export async function applyChangeset(
  req: PayloadRequest,
  changesetId: number,
  accepted?: number[],
): Promise<{ changeset: AiChangeset; docs: AppliedDoc[] }> {
  const user = userOf(req)
  const changeset = await ownChangeset(req, changesetId, ['proposed'])
  const records = ((changeset.operations as OperationRecord[] | null) ?? []).filter((op) => op.ok)
  const chosen = new Set(accepted ?? records.map((op) => op.index))
  if (!records.some((op) => chosen.has(op.index)))
    throw new AiRefusal('Choose at least one change.', 400)

  // Re-validate on the current drafts: replay exactly the accepted proposals.
  const workspace = new Workspace(
    req.payload,
    loaderFor({ payload: req.payload, user: req.user, req }),
  )
  const operations: OperationRecord[] = []
  const problems: string[] = []
  for (const op of records) {
    if (!chosen.has(op.index)) {
      operations.push({ ...op, accepted: false })
      continue
    }
    try {
      const outcome = await workspace.apply(
        op.tool,
        op.args,
        op.doc?.id === null ? op.doc.key : undefined,
      )
      operations.push({
        ...op,
        ...outcome,
        accepted: true,
        regulated: workspace.isRegulated(outcome.doc!.key),
      })
    } catch (error) {
      problems.push(
        `${op.summary ?? op.tool}: ${error instanceof Error ? error.message : 'invalid'}`,
      )
    }
  }
  if (problems.length) {
    throw new AiRefusal(`Some changes no longer fit the current drafts: ${problems.join(' ')}`, 409)
  }

  const entries = workspace.changed()
  for (const entry of entries.filter((candidate) => candidate.archive)) {
    if (!canPublish(user) || (entry.regulated && !canApprove(user))) {
      throw new AiRefusal(
        `You cannot take ${entry.title} off the site: that needs publishing rights.`,
      )
    }
  }

  const planFlags = (changeset.flags ?? []) as Flag[]
  const flags = [
    ...(await phraseFlags(req.payload, operations)),
    ...planFlags.filter((flag) => flag.type === 'claims_check'),
  ]

  req.context = { ...req.context, auditSource: 'ai', aiChangesetId: changeset.id }

  const result = await inTransaction(req, async () => {
    const affected: NonNullable<AiChangeset['affectedDocs']> = []
    const docs: AppliedDoc[] = []
    const write = { req, overrideAccess: false as const }

    for (const entry of entries) {
      const collection = entry.collection
      let id = entry.id
      let beforeVersionId: null | string = null

      if (id === null) {
        const created = await req.payload.create({
          collection,
          data: { ...entry.current, _status: 'draft' } as never,
          draft: true,
          ...write,
        })
        id = created.id
      } else {
        beforeVersionId = await latestVersionId(req, collection, id)
        // Unpublish first: saving the live version as a draft supersedes the latest draft.
        if (entry.archive) {
          await req.payload.update({
            collection,
            id,
            data: { _status: 'draft' } as never,
            ...write,
          })
        }
        if (entry.touched.size) {
          await req.payload.update({
            collection,
            id,
            data: pick(entry.current, entry.touched) as never,
            draft: true,
            ...write,
          })
        }
      }

      // Regulated documents go to compliance review. A flagged claim on any other document
      // blocks publishing by non-compliance users instead (see the approval guard).
      const inReview = entry.regulated && hasReviewGroup(req.payload, collection)
      if (inReview) await submitForReview(req, collection, id)

      affected.push({ collection, docId: String(id), beforeVersionId })
      docs.push({
        collection,
        id,
        title: entry.title,
        url: pathFor(collection, entry.current),
        inReview,
      })
    }

    for (const op of operations) {
      if (op.accepted && op.media) {
        await req.payload.update({
          collection: 'media',
          id: op.media.id,
          data: { alt: op.media.alt ?? '' },
          ...write,
        })
      }
    }

    const updated = await req.payload.update({
      collection: 'ai-changesets',
      id: changeset.id,
      data: {
        status: 'applied_to_draft',
        operations,
        affectedDocs: affected,
        flags: dedupe(flags),
        appliedAt: new Date().toISOString(),
      },
      overrideAccess: true,
      req,
    })
    return { changeset: updated, docs }
  })
  return result
}

const dedupe = (flags: Flag[]) => {
  const seen = new Set<string>()
  return flags.filter((flag) => {
    const key = `${flag.type}:${flag.detail}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function discardChangeset(req: PayloadRequest, changesetId: number) {
  await ownChangeset(req, changesetId, ['proposed'])
  return req.payload.update({
    collection: 'ai-changesets',
    id: changesetId,
    data: { status: 'rejected' },
    overrideAccess: true,
    req,
  })
}

/**
 * Restores each changed document to the version it had before the changeset, as a new draft.
 * Documents the changeset created stay as drafts (nothing is deleted), and an unpublished
 * document stays unpublished until someone publishes it again.
 */
export async function rollbackChangeset(req: PayloadRequest, changesetId: number) {
  userOf(req)
  const changeset = await ownChangeset(req, changesetId, ['applied_to_draft', 'published'])
  const notes: string[] = []
  req.context = { ...req.context, auditSource: 'ai', aiChangesetId: changeset.id }

  const updated = await inTransaction(req, async () => {
    for (const doc of changeset.affectedDocs ?? []) {
      const collection = doc.collection as CollectionSlug
      if (!doc.beforeVersionId) {
        notes.push(
          `${collection} #${doc.docId} was created by this changeset; it stays as a draft.`,
        )
        continue
      }
      await req.payload.restoreVersion({
        collection,
        id: doc.beforeVersionId,
        draft: true,
        overrideAccess: false,
        req,
      } as Parameters<Payload['restoreVersion']>[0])
      // Payload leaves this flag on the shared request, and later updates then skip merging
      // the stored document (and fail validation).
      delete req.context.isRestoringVersion
    }
    for (const op of (changeset.operations as OperationRecord[] | null) ?? []) {
      if (op.accepted && op.media) {
        await req.payload.update({
          collection: 'media',
          id: op.media.id,
          data: { alt: op.media.previousAlt ?? '' },
          overrideAccess: false,
          req,
        })
      }
      if (op.accepted && op.tool === 'archive_document') {
        notes.push(
          `${op.doc?.title ?? 'A document'} was unpublished; publish it again to put it back.`,
        )
      }
    }
    return req.payload.update({
      collection: 'ai-changesets',
      id: changeset.id,
      data: { status: 'rolled_back', rolledBackAt: new Date().toISOString() },
      overrideAccess: true,
      req,
    })
  })
  return { changeset: updated, notes }
}

// --- Publishing ----------------------------------------------------------------------------

const isAutosave = (req: PayloadRequest) => {
  const flag = (req.query as Record<string, unknown> | undefined)?.autosave
  return flag === true || flag === 'true'
}

/** Changesets applied to a document that are still waiting for it to be published. */
export async function openChangesetsFor(
  req: PayloadRequest,
  collection: string,
  id: number | string,
) {
  const { docs } = await req.payload.find({
    collection: 'ai-changesets',
    where: {
      and: [
        { status: { equals: 'applied_to_draft' } },
        { 'affectedDocs.collection': { equals: collection } },
        { 'affectedDocs.docId': { equals: String(id) } },
      ],
    },
    depth: 0,
    limit: 50,
    overrideAccess: true,
    req,
  })
  // The two conditions can match different rows of the array: check the pair.
  return docs.filter((changeset) =>
    (changeset.affectedDocs ?? []).some(
      (doc) => doc.collection === collection && doc.docId === String(id),
    ),
  )
}

/**
 * When a document is published, marks the changesets applied to it `published` once every
 * document they changed has been published since (brief §10.3 step 7).
 */
export const markAiChangesetsPublished: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
}) => {
  // A restore hands this hook the restored version's status even when it restores a draft.
  if (doc._status !== 'published' || isAutosave(req) || req.context?.isRestoringVersion) return doc
  const open = await openChangesetsFor(req, collection.slug, doc.id)
  for (const changeset of open) {
    const since = changeset.appliedAt ?? changeset.updatedAt
    const archived = new Set(
      ((changeset.operations as OperationRecord[] | null) ?? [])
        .filter((op) => op.accepted && op.tool === 'archive_document' && op.doc)
        .map((op) => `${op.doc!.collection}:${op.doc!.id}`),
    )
    let all = true
    for (const affected of changeset.affectedDocs ?? []) {
      if (archived.has(`${affected.collection}:${affected.docId}`)) continue
      if (affected.collection === collection.slug && affected.docId === String(doc.id)) continue
      const other = await req.payload
        .findByID({
          collection: affected.collection as CollectionSlug,
          id: affected.docId,
          depth: 0,
          overrideAccess: true,
          req,
        })
        .catch(() => null)
      const published = (other as { _status?: string; updatedAt?: string } | null) ?? null
      if (published?._status !== 'published' || (published.updatedAt ?? '') < since) {
        all = false
        break
      }
    }
    if (all) {
      await req.payload.update({
        collection: 'ai-changesets',
        id: changeset.id,
        data: { status: 'published', publishedAt: new Date().toISOString() },
        overrideAccess: true,
        req,
      })
    }
  }
  return doc
}

/** True when an applied AI changeset flagged a possible financial claim on this document. */
export async function hasFlaggedChangeset(
  req: PayloadRequest,
  collection: string,
  id: number | string,
) {
  const open = await openChangesetsFor(req, collection, id)
  return open.some((changeset) => needsCompliance((changeset.flags ?? []) as Flag[]))
}
