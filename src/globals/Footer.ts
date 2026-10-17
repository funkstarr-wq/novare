import type { GlobalConfig } from 'payload'

import { linkField } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Site' },
  access: { read: () => true },
  fields: [
    {
      name: 'columns',
      label: 'Link columns',
      type: 'array',
      maxRows: 5,
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'links', type: 'array', fields: [linkField()] },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: ['linkedin', 'x', 'facebook', 'instagram', 'youtube'],
              admin: { width: '30%' },
            },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
              validate: (value: null | string | undefined) =>
                !value ||
                /^https:\/\/\S+$/.test(value) ||
                'Enter a full URL starting with https://',
              admin: { width: '70%' },
            },
          ],
        },
      ],
    },
    { name: 'legalLinks', type: 'relationship', relationTo: 'legal-documents', hasMany: true },
    {
      name: 'offices',
      label: 'Office summary',
      type: 'relationship',
      relationTo: 'offices',
      hasMany: true,
    },
  ],
}
