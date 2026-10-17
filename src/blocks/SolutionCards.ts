import type { Block } from 'payload'

export const SolutionCardsBlock: Block = {
  slug: 'solutionCards',
  interfaceName: 'SolutionCardsBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'all',
      options: [
        { label: 'All solutions, in their set order', value: 'all' },
        { label: 'Choose solutions', value: 'manual' },
      ],
    },
    {
      name: 'solutions',
      type: 'relationship',
      relationTo: 'solutions',
      hasMany: true,
      required: true,
      admin: { condition: (_, sibling) => sibling?.mode === 'manual' },
    },
  ],
}
