import type { CollectionConfig } from 'payload'

import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'type', 'status', '_status'],
    group: adminGroups.solutions,
    description: 'Real estate developments.',
  },
  versions: draftVersions,
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'country', type: 'text', admin: { width: '50%' } },
                { name: 'city', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Retail', value: 'retail' },
                    { label: 'Office', value: 'office' },
                    { label: 'Mixed-use', value: 'mixed-use' },
                    { label: 'Residential', value: 'residential' },
                    { label: 'Industrial', value: 'industrial' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'status',
                  type: 'select',
                  // Own enum name: the default would collide with the drafts `_status` enum.
                  enumName: 'enum_projects_project_status',
                  options: [
                    { label: 'Planning', value: 'planning' },
                    { label: 'Under construction', value: 'under-construction' },
                    { label: 'Completed', value: 'completed' },
                  ],
                  admin: { width: '33%' },
                },
                {
                  name: 'sizeSqm',
                  label: 'Size (m²)',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'edgeCertified',
              label: 'EDGE certified',
              type: 'checkbox',
              defaultValue: false,
            },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
            { name: 'body', type: 'richText' },
          ],
        },
        seoTab,
      ],
    },
    slugField('name'),
  ],
}
