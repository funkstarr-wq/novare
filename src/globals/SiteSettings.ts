import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Site' },
  access: { read: () => true },
  fields: [
    { name: 'organisationName', type: 'text', required: true, defaultValue: 'Novare' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'defaultOgImage',
      label: 'Default share image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used when a page has no share image of its own.' },
    },
    {
      name: 'defaultDisclaimer',
      type: 'richText',
      admin: { description: 'Shown where a page or block has no disclaimer of its own.' },
    },
    {
      name: 'organization',
      label: 'Organization (structured data)',
      type: 'group',
      admin: { description: 'Feeds the Organization JSON-LD on every page.' },
      fields: [
        { name: 'legalName', type: 'text' },
        { name: 'foundingYear', type: 'number', min: 1900, max: 2100 },
        {
          name: 'sameAs',
          label: 'Official profiles',
          type: 'array',
          fields: [
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
              validate: (value: null | string | undefined) =>
                !value ||
                /^https:\/\/\S+$/.test(value) ||
                'Enter a full URL starting with https://',
            },
          ],
        },
      ],
    },
  ],
}
