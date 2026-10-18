import type { CollectionConfig } from 'payload'

import { approvers } from '@/access'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions, regulated } from './shared'

export const LegalDocuments: CollectionConfig = {
  slug: 'legal-documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'versionDate', '_status'],
    group: adminGroups.library,
    description: 'Shown as a page at /legal/<slug>/, with a download link when a file is attached.',
  },
  custom: regulated,
  // Every field is compliance-only (brief §6.1), so the whole document is.
  access: { create: approvers, update: approvers },
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Document',
          fields: [
            { name: 'body', type: 'richText' },
            { name: 'file', type: 'relationship', relationTo: 'documents' },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    { name: 'versionDate', type: 'date', admin: { position: 'sidebar' } },
    { name: 'owner', type: 'text', admin: { position: 'sidebar' } },
  ],
}
