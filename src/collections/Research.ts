import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

export const Research: CollectionConfig = {
  slug: 'research',
  labels: { singular: 'Research report', plural: 'Research' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', '_status'],
    group: adminGroups.insights,
    description: 'Novare Hedge Fund Survey editions.',
  },
  defaultSort: '-year',
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Report',
          fields: [
            { name: 'summary', type: 'textarea' },
            {
              name: 'keyFindings',
              type: 'array',
              fields: [{ name: 'finding', type: 'textarea', required: true }],
            },
            { name: 'report', type: 'relationship', relationTo: 'documents' },
            { name: 'body', type: 'richText' },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    {
      name: 'year',
      type: 'number',
      required: true,
      min: 2000,
      max: 2100,
      admin: { position: 'sidebar' },
    },
  ],
}
