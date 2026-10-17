import type { CollectionSlug, GroupField } from 'payload'

/** Collections a link may point at: every document with its own URL. */
export const linkableCollections: CollectionSlug[] = [
  'pages',
  'solutions',
  'funds',
  'projects',
  'people',
  'insights',
  'categories',
  'research',
  'jobs',
  'legal-documents',
]

const HTTP_URL = /^https?:\/\/\S+$/

type LinkData = { type: 'external' | 'internal'; url: string }

/**
 * A labelled link to a document on this site or to an external URL. No styling options: how a
 * link looks is decided by the component that renders it.
 */
export const linkField = ({
  name = 'link',
  label,
  required = true,
}: { name?: string; label?: string; required?: boolean } = {}): GroupField => ({
  name,
  label,
  type: 'group',
  interfaceName: 'Link',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'internal',
          options: [
            { label: 'Page on this site', value: 'internal' },
            { label: 'External URL', value: 'external' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        {
          name: 'label',
          type: 'text',
          required,
          admin: { width: '50%' },
        },
      ],
    },
    // Not `required`: only the one matching `type` applies, so each validates itself.
    {
      name: 'reference',
      type: 'relationship',
      relationTo: linkableCollections,
      validate: (value: unknown, { siblingData }: { siblingData: Partial<LinkData> }) =>
        !required || siblingData.type === 'external' || Boolean(value) || 'Choose a page.',
      admin: { condition: (_, sibling) => sibling?.type !== 'external' },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      validate: (
        value: null | string | undefined,
        { siblingData }: { siblingData: Partial<LinkData> },
      ) => {
        if (siblingData.type !== 'external') return true
        if (!value) return required ? 'Enter a URL.' : true
        return HTTP_URL.test(value) || 'Enter a full URL starting with https://'
      },
      admin: { condition: (_, sibling) => sibling?.type === 'external' },
    },
  ],
})
