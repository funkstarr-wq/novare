import type { CollectionConfig } from 'payload'

import { adminGroups } from './shared'

const isAdminOrCompliance = ({ req }: { req: { user?: unknown } }) => {
  const roles = (req.user as { roles?: string[] } | undefined)?.roles ?? []
  return roles.includes('admin') || roles.includes('compliance')
}

// Append-only record of content changes (brief §6.3). Entries are written by hooks (M2) through
// the Local API; nobody can edit or delete one.
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'diffSummary',
    defaultColumns: ['timestamp', 'collection', 'operation', 'user', 'source'],
    group: adminGroups.system,
  },
  defaultSort: '-timestamp',
  access: {
    read: isAdminOrCompliance,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'collection', type: 'text', required: true, index: true },
        { name: 'docId', type: 'text', required: true, index: true },
      ],
    },
    {
      name: 'operation',
      type: 'select',
      required: true,
      options: ['create', 'update', 'delete', 'publish', 'unpublish'],
    },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'human',
      options: ['human', 'ai'],
    },
    { name: 'changesetId', type: 'relationship', relationTo: 'ai-changesets' },
    { name: 'diffSummary', type: 'textarea' },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date(),
    },
  ],
}
