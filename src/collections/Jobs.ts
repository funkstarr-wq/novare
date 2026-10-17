import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'location', 'closingDate', '_status'],
    group: adminGroups.company,
    description: 'Vacancies. Past their closing date they leave the listings.',
  },
  defaultSort: 'closingDate',
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Vacancy',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  type: 'relationship',
                  relationTo: 'offices',
                  admin: { width: '50%' },
                },
                { name: 'department', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contractType',
                  type: 'select',
                  options: [
                    { label: 'Permanent', value: 'permanent' },
                    { label: 'Fixed term', value: 'fixed-term' },
                    { label: 'Contract', value: 'contract' },
                    { label: 'Internship', value: 'internship' },
                  ],
                  admin: { width: '50%' },
                },
                { name: 'closingDate', type: 'date', admin: { width: '50%' } },
              ],
            },
            { name: 'body', type: 'richText' },
            {
              type: 'row',
              fields: [
                { name: 'applyEmail', type: 'email', admin: { width: '50%' } },
                {
                  name: 'applyUrl',
                  label: 'Apply URL',
                  type: 'text',
                  validate: (value: null | string | undefined) =>
                    !value ||
                    /^https?:\/\/\S+$/.test(value) ||
                    'Enter a full URL starting with https://',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
  ],
}
