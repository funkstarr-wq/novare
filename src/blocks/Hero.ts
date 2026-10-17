import type { Block } from 'payload'

import { linkField } from '@/fields/link'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'ctas',
      label: 'Calls to action',
      type: 'array',
      maxRows: 2,
      fields: [linkField()],
    },
  ],
}
