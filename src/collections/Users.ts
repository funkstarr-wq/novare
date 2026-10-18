import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { admins, adminsOnlyField, adminsOrSelf, isStaff, staff } from '@/access'

import { adminGroups } from './shared'

export const ROLES = ['admin', 'editor', 'compliance', 'contributor'] as const
export type Role = (typeof ROLES)[number]

/** The first account on a fresh database (the admin "create first user" screen) is an admin. */
export const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  if (totalDocs === 0) data.roles = ['admin']
  return data
}

// Roles and access per brief §6.1. 2FA comes from payload-totp (src/payload.config.ts).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'updatedAt'],
    group: adminGroups.system,
  },
  access: {
    // Only people with a role can use the admin panel.
    admin: ({ req }) => isStaff(req.user),
    read: staff,
    create: admins,
    update: adminsOrSelf,
    delete: admins,
    // Lifts a password or 2FA-code lockout; nobody can lift their own.
    unlock: admins,
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  hooks: { beforeChange: [firstUserIsAdmin] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['contributor'],
      saveToJWT: true,
      // Nobody can grant themselves a role.
      access: { create: adminsOnlyField, update: adminsOnlyField },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Contributor', value: 'contributor' },
      ],
      admin: {
        description:
          'Admin: everything. Editor: publish non-regulated content. Compliance: also approves and publishes regulated content. Contributor: drafts only.',
      },
    },
  ],
}
