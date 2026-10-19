import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  Forbidden,
} from 'payload'

import { canApprove, canPublish, isRegulatedDocument } from '@/access'
import { hasFlaggedChangeset } from '@/ai/apply'
import type { RoleUser } from '@/access/roles'
import type { ReviewStatus } from '@/fields/review'
import { stableStringify } from '@/lib/stableStringify'

type Doc = Record<string, unknown>
type Review = {
  reviewStatus?: null | ReviewStatus
  reviewNote?: null | string
  reviewedBy?: null | number | string | { id: number | string }
  reviewedAt?: null | string
}

// Bookkeeping that is not "content": changing only these does not withdraw an approval.
const NON_CONTENT_KEYS = new Set([
  'id',
  '_status',
  'review',
  'updatedAt',
  'createdAt',
  'generateSlug',
  'breadcrumbs',
  'path',
])

/** True when any content field in `data` differs from the stored document. */
export function contentChanged(data: Doc, original: Doc | undefined): boolean {
  if (!original) return true
  return Object.keys(data).some(
    (key) =>
      !NON_CONTENT_KEYS.has(key) && stableStringify(data[key]) !== stableStringify(original[key]),
  )
}

/**
 * Who may publish, and the compliance review workflow (brief §6.2). Runs on every content
 * collection; review bookkeeping applies to regulated documents. Server code without a user (seed,
 * imports, migrations) is trusted and passes through.
 */
export const approvalGuard =
  (collectionRegulated: boolean): CollectionBeforeChangeHook =>
  async ({ collection, data, originalDoc, req }) => {
    const user = req.user as RoleUser
    if (!user) return data

    const regulated = isRegulatedDocument(collectionRegulated, data, originalDoc)
    const publishing = data._status === 'published'

    if (publishing && !canPublish(user)) {
      throw new Forbidden(req.t)
    }
    if (publishing && regulated && !canApprove(user)) {
      throw new APIError(
        'This is regulated content: it needs compliance approval. Submit it for compliance review instead of publishing.',
        403,
        undefined,
        true,
      )
    }
    // An AI change that may contain a financial claim needs compliance, whatever the document
    // (brief §10.7). The flag clears when compliance publishes it or the change is rolled back.
    if (
      publishing &&
      !canApprove(user) &&
      originalDoc?.id !== undefined &&
      (await hasFlaggedChangeset(req, collection.slug, originalDoc.id as number))
    ) {
      throw new APIError(
        'An AI change to this document may contain a financial claim: compliance needs to approve and publish it.',
        403,
        undefined,
        true,
      )
    }
    if (!regulated) return data

    const previous: Review = (originalDoc?.review as Review | undefined) ?? {}
    const incoming: Review = (data.review as Review | undefined) ?? {}
    const previousStatus: ReviewStatus = previous.reviewStatus ?? 'draft'
    let status: ReviewStatus = incoming.reviewStatus ?? previousStatus

    // Reviewer fields only ever come from here, never from the request.
    let reviewedBy = previous.reviewedBy ?? null
    let reviewedAt = previous.reviewedAt ?? null
    const stamp = () => {
      reviewedBy = user.id ?? null
      reviewedAt = new Date().toISOString()
    }

    const decidingNow =
      status !== previousStatus && (status === 'approved' || status === 'changes_requested')
    if (decidingNow) {
      if (!canApprove(user)) {
        throw new APIError('Only compliance can approve or request changes.', 403, undefined, true)
      }
      stamp()
    } else if (previousStatus === 'approved' && contentChanged(data, originalDoc)) {
      // Any edit after approval needs a fresh review (brief §6.2).
      status = 'draft'
    }

    // Compliance publishing a regulated document is its approval.
    if (publishing && status !== 'approved') {
      status = 'approved'
      stamp()
    }

    data.review = {
      ...incoming,
      reviewStatus: status,
      reviewNote: incoming.reviewNote ?? previous.reviewNote ?? null,
      reviewedBy: typeof reviewedBy === 'object' && reviewedBy ? reviewedBy.id : reviewedBy,
      reviewedAt,
    }
    return data
  }

/** Regulated pages can only be deleted by compliance or an admin, like regulated collections. */
export const regulatedPageDeleteGuard: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const user = req.user as RoleUser
  if (!user || canApprove(user)) return
  const page = await req.payload.findByID({ collection: 'pages', id, depth: 0, req, draft: true })
  if (page?.regulated) {
    throw new APIError('Only compliance can delete a regulated page.', 403, undefined, true)
  }
}
