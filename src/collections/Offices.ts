import type { CollectionConfig, FieldHook } from 'payload'

import { slugField } from '@/fields/slug'
import { slugify } from '@/lib/slugify'

import { adminGroups, draftVersions } from './shared'

const countrySlugFromCountry: FieldHook = ({ siblingData, value }) =>
  value || (typeof siblingData.country === 'string' ? slugify(siblingData.country) : value)

export const Offices: CollectionConfig = {
  slug: 'offices',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'country', '_status'],
    group: adminGroups.company,
  },
  defaultSort: 'order',
  versions: draftVersions,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Johannesburg Head Office".' },
    },
    {
      type: 'row',
      fields: [
        { name: 'country', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'addressLines',
      type: 'array',
      fields: [{ name: 'line', type: 'text', required: true }],
    },
    {
      type: 'row',
      fields: [
        { name: 'postcode', type: 'text', admin: { width: '33%' } },
        { name: 'phone', type: 'text', admin: { width: '33%' } },
        { name: 'email', type: 'email', admin: { width: '33%' } },
      ],
    },
    {
      // Two numbers rather than a `point` field, which would need the PostGIS extension.
      name: 'geo',
      label: 'Location',
      type: 'group',
      admin: { description: 'For map links and LocalBusiness JSON-LD.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number', min: -90, max: 90, admin: { width: '50%' } },
            { name: 'longitude', type: 'number', min: -180, max: 180, admin: { width: '50%' } },
          ],
        },
      ],
    },
    { name: 'openingHours', type: 'textarea' },
    slugField('name'),
    {
      name: 'countrySlug',
      type: 'text',
      index: true,
      hooks: { beforeValidate: [countrySlugFromCountry] },
      admin: {
        position: 'sidebar',
        description: 'Groups offices under /locations/<country>/. Defaults from the country.',
      },
    },
    { name: 'isHeadOffice', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
