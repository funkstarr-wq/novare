import type { CollectionSlug, Endpoint, PayloadRequest } from 'payload'

import { isStaff } from '@/access'
import type { RoleUser } from '@/access/roles'

/**
 * Marks a regulated document "in review" and emails everyone with the compliance role (brief
 * §6.2). The update runs as the requesting user, so access rules and the approval guard apply.
 * Returns how many reviewers were emailed.
 */
export async function submitForReview(
  req: PayloadRequest,
  collection: CollectionSlug,
  id: number | string,
): Promise<number> {
  const doc = await req.payload.update({
    collection,
    id,
    data: { review: { reviewStatus: 'in_review' } } as never,
    draft: true,
    overrideAccess: false,
    req,
  })

  const reviewers = await req.payload.find({
    collection: 'users',
    where: { roles: { contains: 'compliance' } },
    limit: 100,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const fields = doc as unknown as Record<string, unknown>
  const title = String(fields.title ?? fields.name ?? id)
  const adminUrl = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/admin/collections/${collection}/${id}/`
  const to = reviewers.docs.map((reviewer) => reviewer.email).filter(Boolean)

  if (to.length) {
    await req.payload.sendEmail({
      to,
      subject: `For compliance review: ${title}`,
      text: `${title} (${collection}) has been submitted for compliance review.\n\nReview it here: ${adminUrl}`,
    })
  }
  return to.length
}

/** POST /api/<collection>/<id>/submit-for-review/ */
export const submitForReviewEndpoint: Endpoint = {
  path: '/:id/submit-for-review',
  method: 'post',
  handler: async (req) => {
    const user = req.user as RoleUser
    // Payload adds the collection slug to the route params of collection endpoints.
    const collection = req.routeParams?.collection as CollectionSlug | undefined
    const id = req.routeParams?.id as number | string | undefined
    if (!user || !isStaff(user)) return Response.json({ error: 'Not allowed.' }, { status: 403 })
    if (!collection || !id) return Response.json({ error: 'Not found.' }, { status: 404 })

    const notified = await submitForReview(req, collection, id)
    return Response.json({ ok: true, notified })
  },
}
