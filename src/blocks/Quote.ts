import type { Block } from 'payload'

export const QuoteBlock: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { name: 'person', type: 'relationship', relationTo: 'people' },
  ],
}
