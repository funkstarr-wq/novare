import type { Block } from 'payload'

export const IntroStatsBlock: Block = {
  slug: 'introStats',
  interfaceName: 'IntroStatsBlock',
  fields: [
    { name: 'intro', type: 'richText' },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { width: '40%', description: 'As displayed, e.g. "25+" or "R 10bn".' },
            },
            { name: 'label', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
  ],
}
