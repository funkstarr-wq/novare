import type { Block } from 'payload'

export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'filter',
      type: 'radio',
      defaultValue: 'leadership',
      options: [
        { label: 'Leadership', value: 'leadership' },
        { label: 'A division', value: 'division' },
      ],
    },
    {
      name: 'division',
      type: 'relationship',
      relationTo: 'solutions',
      required: true,
      admin: { condition: (_, sibling) => sibling?.filter === 'division' },
    },
  ],
}
