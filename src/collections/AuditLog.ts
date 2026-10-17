import type { CollectionConfig } from 'payload'

import { approvers, nobody } from '@/access'

import { adminGroups } from './shared'

// Append-only record of content changes (brief §6.3), written by `src/hooks/audit.ts` through the
// Local API. Nobody can create, edit or delete an entry through the API.
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
    read: approvers,
    create: nobody,
    update: nobody,
    delete: nobody,
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
