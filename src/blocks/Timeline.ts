import type { Block } from 'payload'

export const TimelineBlock: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'year',
              type: 'number',
              required: true,
              min: 1900,
              max: 2100,
              admin: { width: '25%' },
            },
            { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
          ],
        },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}
