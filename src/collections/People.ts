import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

export const People: CollectionConfig = {
  slug: 'people',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'isLeadership', '_status'],
    group: adminGroups.company,
  },
  defaultSort: 'order',
  versions: draftVersions,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            { name: 'role', type: 'text', admin: { description: 'Job title, as displayed.' } },
            { name: 'division', type: 'relationship', relationTo: 'solutions' },
            { name: 'photo', type: 'upload', relationTo: 'media' },
            { name: 'bio', type: 'richText' },
            {
              name: 'linkedinUrl',
              label: 'LinkedIn URL',
              type: 'text',
              validate: (value: null | string | undefined) =>
                !value ||
                /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/.test(value) ||
                'Enter a full linkedin.com URL.',
            },
          ],
        },
        seoTab,
      ],
    },
    slugField('name'),
    {
      name: 'isLeadership',
      label: 'Leadership team',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
