import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'
import { totpAccess } from 'payload-totp'

import { canApprove, canPublish, hasRole, isStaff, type RoleUser } from './roles'

export { canApprove, canPublish, hasRole, isStaff } from './roles'

const userOf = (req: PayloadRequest) => req.user as RoleUser

export const anyone: Access = () => true
export const nobody: Access = () => false
export const staff: Access = ({ req }) => isStaff(userOf(req))
export const publishers: Access = ({ req }) => canPublish(userOf(req))
export const approvers: Access = ({ req }) => canApprove(userOf(req))
export const admins: Access = ({ req }) => hasRole(userOf(req), 'admin')

const published: Access = () => ({ _status: { equals: 'published' } }) satisfies Where

/**
 * Read access for anything the public site shows. payload-totp refuses every request that lacks
 * a session verified with a code, so these operations opt out of its wrapper (see
 * `publicOperations`) and check the code here instead: visitors, and staff who have not entered
 * their code yet, get `publicAccess`; verified staff get `staffAccess`.
 */
export const publicOrVerified =
  (publicAccess: Access, staffAccess: Access): Access =>
  async (args) => {
    if (!args.req.user) return publicAccess(args)
    return (await totpAccess(staffAccess)(args)) || publicAccess(args)
  }

/** The public sees published documents; staff (with 2FA) also see drafts. */
export const publishedOrStaff = publicOrVerified(published, staff)

/**
 * Marks operations that must work without a login (public reads, form submissions), so
 * payload-totp leaves their access function alone. Put it in a collection or global's `custom`.
 */
export const publicOperations = (...operations: string[]) => ({
  totp: { disableAccessWrapper: Object.fromEntries(operations.map((op) => [op, true])) },
})

/**
 * Whether a document counts as regulated (brief §5 [R]): its collection is, or it is a page with
 * the `regulated` box ticked.
 */
export function isRegulatedDocument(
  collectionRegulated: boolean,
  ...docs: (Record<string, unknown> | null | undefined)[]
): boolean {
  return collectionRegulated || docs.some((doc) => doc?.regulated === true)
}

/**
 * Create and update for content collections. Saving drafts is open to every staff role;
 * publishing needs an editor, or compliance/admin for regulated documents (brief §6.1). Payload
 * also calls this with `_status: 'published'` to decide whether to show the Publish button.
 */
export const contentWrite =
  (collectionRegulated: boolean): Access =>
  ({ req, data }) => {
    const user = userOf(req)
    if (!isStaff(user)) return false
    if (data?._status !== 'published') return true
    return isRegulatedDocument(collectionRegulated, data) ? canApprove(user) : canPublish(user)
  }

/** Field-level: only compliance and admin may set it (FSP licence number, disclaimers). */
export const approversOnlyField: FieldAccess = ({ req }) => canApprove(userOf(req))

export const adminsOnlyField: FieldAccess = ({ req }) => hasRole(userOf(req), 'admin')

/** Users: admins manage everyone; anyone else may edit only their own account. */
export const adminsOrSelf: Access = ({ req }) => {
  const user = userOf(req)
  if (hasRole(user, 'admin')) return true
  if (!user?.id) return false
  return { id: { equals: user.id } } satisfies Where
}
