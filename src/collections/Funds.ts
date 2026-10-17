import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions, regulated } from './shared'

export const Funds: CollectionConfig = {
  slug: 'funds',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'solution', 'investorType', '_status'],
    group: adminGroups.solutions,
  },
  custom: regulated,
  versions: draftVersions,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            { name: 'solution', type: 'relationship', relationTo: 'solutions', required: true },
            { name: 'strategy', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'inceptionDate', type: 'date', admin: { width: '33%' } },
                {
                  name: 'minimumInvestment',
                  type: 'text',
                  admin: { width: '33%', description: 'As displayed, e.g. "R 1 000 000".' },
                },
                {
                  name: 'investorType',
                  type: 'select',
                  options: [
                    { label: 'Qualified investors', value: 'qualified' },
                    { label: 'Retail investors', value: 'retail' },
                  ],
                  admin: { width: '33%' },
                },
              ],
            },
            { name: 'factsheet', type: 'relationship', relationTo: 'documents' },
            { name: 'summary', type: 'textarea' },
            { name: 'body', type: 'richText' },
            { name: 'awards', type: 'relationship', relationTo: 'awards', hasMany: true },
          ],
        },
        {
          label: 'Compliance',
          fields: [{ name: 'disclaimer', type: 'richText', required: true }],
        },
        seoTab,
      ],
    },
    slugField('name'),
  ],
}
