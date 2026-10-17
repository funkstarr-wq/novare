import type { CollectionConfig } from 'payload'

import { layoutField } from '@/fields/layout'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions, regulated } from './shared'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', '_status', 'updatedAt'],
    group: adminGroups.solutions,
    description: "Novare's businesses, each with its own page under /solutions/.",
  },
  custom: regulated,
  defaultSort: 'order',
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'shortName',
              type: 'text',
              admin: { description: 'Used on cards and in navigation.' },
            },
            { name: 'summary', type: 'textarea', maxLength: 200 },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'keyFacts',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'value', type: 'text', required: true, admin: { width: '50%' } },
                  ],
                },
              ],
            },
          ],
        },
        { label: 'Content', fields: [layoutField] },
        {
          label: 'Compliance',
          fields: [
            { name: 'fspLicenceNumber', label: 'FSP licence number', type: 'text', required: true },
            { name: 'disclaimer', type: 'richText', required: true },
          ],
        },
        {
          label: 'Related',
          fields: [
            { name: 'contactPerson', type: 'relationship', relationTo: 'people' },
            { name: 'documents', type: 'relationship', relationTo: 'documents', hasMany: true },
            {
              name: 'externalUrl',
              label: 'External site',
              type: 'text',
              admin: { description: 'A separate website for this business, if it has one.' },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
