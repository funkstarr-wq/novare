import type { Access, CollectionConfig, Where } from 'payload'

import { canApprove, hasRole, nobody } from '@/access'
import type { RoleUser } from '@/access/roles'

import { adminGroups } from './shared'

/** Admins and compliance read every changeset; everyone else only their own (brief §10.6). */
const ownerOrApprover: Access = ({ req }) => {
  const user = req.user as RoleUser
  if (!user?.id) return false
  if (canApprove(user) || hasRole(user, 'admin')) return true
  return { user: { equals: user.id } } satisfies Where
}

// Proposed and applied AI edits (brief §10.6). Written only by the server through the Local API
// (`src/ai`); nobody can create or change one through the API or the admin.
export const AiChangesets: CollectionConfig = {
  slug: 'ai-changesets',
  labels: { singular: 'AI changeset', plural: 'AI changesets' },
  admin: {
    useAsTitle: 'prompt',
    defaultColumns: ['prompt', 'user', 'status', 'costUSD', 'createdAt'],
    group: adminGroups.system,
    description:
      'Every request to the AI assistant: what it proposed, what was applied, and what it cost.',
  },
  access: {
    read: ownerOrApprover,
    create: nobody,
    update: nobody,
    delete: nobody,
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
    { name: 'reply', label: 'Assistant reply', type: 'textarea' },
    { name: 'error', type: 'textarea' },
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
    {
      type: 'row',
      fields: [
        { name: 'appliedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'publishedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'rolledBackAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'supersededBy',
      type: 'relationship',
      relationTo: 'ai-changesets',
      admin: { description: 'A follow-up request that replaced this proposal.' },
    },
  ],
}
