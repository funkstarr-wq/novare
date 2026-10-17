import type { Block } from 'payload'

export const OfficeCardsBlock: Block = {
  slug: 'officeCards',
  interfaceName: 'OfficeCardsBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'scope',
      type: 'radio',
      defaultValue: 'all',
      options: [
        { label: 'All offices', value: 'all' },
        { label: 'One country', value: 'country' },
      ],
    },
    {
      name: 'countrySlug',
      label: 'Country',
      type: 'text',
      required: true,
      admin: {
        condition: (_, sibling) => sibling?.scope === 'country',
        description: "The office's country slug, e.g. south-africa.",
      },
    },
  ],
}
