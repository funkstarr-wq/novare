import type { Block } from 'payload'

export const AwardListBlock: Block = {
  slug: 'awardList',
  interfaceName: 'AwardListBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'latest',
      options: [
        { label: 'Latest', value: 'latest' },
        { label: 'Year range', value: 'years' },
      ],
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 50,
      admin: { condition: (_, sibling) => sibling?.mode !== 'years' },
    },
    {
      type: 'row',
      admin: { condition: (_, sibling) => sibling?.mode === 'years' },
      fields: [
        { name: 'fromYear', type: 'number', min: 1900, max: 2100, admin: { width: '50%' } },
        { name: 'toYear', type: 'number', min: 1900, max: 2100, admin: { width: '50%' } },
      ],
    },
  ],
}
