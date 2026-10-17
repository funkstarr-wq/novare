import type { Role } from '@/collections/Users'

/** The slice of the logged-in user the access rules need. */
export type RoleUser =
  | { id?: number | string; roles?: (null | Role | string)[] | null }
  | null
  | undefined

export function hasRole(user: RoleUser, ...roles: Role[]): boolean {
  return Boolean(user?.roles?.some((role) => roles.includes(role as Role)))
}

/** Anyone with a role: admin, editor, compliance or contributor. */
export const isStaff = (user: RoleUser) =>
  hasRole(user, 'admin', 'editor', 'compliance', 'contributor')

/** May publish non-regulated content (brief §6.1). */
export const canPublish = (user: RoleUser) => hasRole(user, 'admin', 'editor', 'compliance')

/** May approve and publish regulated content, and edit compliance fields (brief §6.1, §6.2). */
export const canApprove = (user: RoleUser) => hasRole(user, 'admin', 'compliance')
