import type { CollectionConfig } from 'payload'

import { adminGroups, draftVersions } from './shared'

export const Awards: CollectionConfig = {
  slug: 'awards',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'awardingBody', '_status'],
    group: adminGroups.company,
  },
  defaultSort: '-year',
  versions: draftVersions,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'year',
          type: 'number',
          required: true,
          min: 1990,
          max: 2100,
          admin: { width: '25%' },
        },
        { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
    { name: 'awardingBody', type: 'text', required: true },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'fund', type: 'relationship', relationTo: 'funds', admin: { width: '50%' } },
        {
          name: 'solution',
          type: 'relationship',
          relationTo: 'solutions',
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'description', type: 'textarea' },
  ],
}
