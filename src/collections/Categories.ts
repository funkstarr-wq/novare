import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    group: adminGroups.insights,
    description: 'Topics for insights, each with a page at /insights/category/<slug>/.',
  },
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [{ label: 'Details', fields: [{ name: 'description', type: 'textarea' }] }, seoTab],
    },
    slugField(),
  ],
}
