import type { CollectionConfig } from 'payload'

import { adminGroups } from './shared'

const isAdmin = ({ req }: { req: { user?: unknown } }) =>
  Boolean((req.user as { roles?: string[] } | undefined)?.roles?.includes('admin'))

// Proposed and applied AI edits (brief §10.6). Written only by the server through the Local API;
// owner and compliance read access arrives with the AI editor (M5).
export const AiChangesets: CollectionConfig = {
  slug: 'ai-changesets',
  labels: { singular: 'AI changeset', plural: 'AI changesets' },
  admin: {
    useAsTitle: 'prompt',
    defaultColumns: ['prompt', 'user', 'status', 'createdAt'],
    group: adminGroups.system,
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'prompt', type: 'textarea', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'model', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'proposed',
      options: ['proposed', 'applied_to_draft', 'rejected', 'published', 'rolled_back', 'failed'],
    },
    { name: 'context', type: 'json' },
    { name: 'messages', type: 'json' },
    { name: 'operations', type: 'json' },
    {
      name: 'affectedDocs',
      type: 'array',
      fields: [
        { name: 'collection', type: 'text', required: true },
        { name: 'docId', type: 'text', required: true },
        { name: 'beforeVersionId', type: 'text' },
      ],
    },
    {
      name: 'flags',
      type: 'array',
      fields: [
        { name: 'type', type: 'text', required: true },
        { name: 'detail', type: 'textarea' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'inputTokens', type: 'number', min: 0 },
        { name: 'outputTokens', type: 'number', min: 0 },
        { name: 'costUSD', label: 'Cost (USD)', type: 'number', min: 0 },
      ],
    },
  ],
}
