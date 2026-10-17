import type { Block } from 'payload'

export const InsightCardsBlock: Block = {
  slug: 'insightCards',
  interfaceName: 'InsightCardsBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'latest',
      options: [
        { label: 'Latest', value: 'latest' },
        { label: 'One category', value: 'category' },
        { label: 'One solution', value: 'solution' },
      ],
    },
    { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 12 },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { condition: (_, sibling) => sibling?.mode === 'category' },
    },
    {
      name: 'solution',
      type: 'relationship',
      relationTo: 'solutions',
      required: true,
      admin: { condition: (_, sibling) => sibling?.mode === 'solution' },
    },
  ],
}
