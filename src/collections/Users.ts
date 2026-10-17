import type { CollectionConfig } from 'payload'

// Roles, 2FA and field-level access arrive in M1/M2 (brief §5.1, §6).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
  },
  auth: true,
  fields: [],
}
