import type { CollectionConfig } from 'payload'

import { adminGroups, draftVersions } from './shared'

export const PressMentions: CollectionConfig = {
  slug: 'press-mentions',
  admin: {
    useAsTitle: 'headline',
    defaultColumns: ['headline', 'outlet', 'publishedAt', '_status'],
    group: adminGroups.insights,
    description: 'Coverage of Novare in other publications. Links out; never copy their text.',
  },
  defaultSort: '-publishedAt',
  versions: draftVersions,
  fields: [
    { name: 'headline', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'outlet', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'publishedAt', type: 'date', admin: { width: '50%' } },
      ],
    },
    {
      name: 'url',
      label: 'Article URL',
      type: 'text',
      required: true,
      validate: (value: null | string | undefined) =>
        !value || /^https?:\/\/\S+$/.test(value) || 'Enter a full URL starting with https://',
    },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
      admin: { description: "In our own words: don't paste the publication's text." },
    },
    { name: 'people', type: 'relationship', relationTo: 'people', hasMany: true },
  ],
}
