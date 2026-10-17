import type { Block } from 'payload'

export const ValuesListBlock: Block = {
  slug: 'valuesList',
  interfaceName: 'ValuesListBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
  ],
}
