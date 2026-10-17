import type { Block } from 'payload'

export const PressListBlock: Block = {
  slug: 'pressList',
  interfaceName: 'PressListBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'limit', type: 'number', defaultValue: 6, min: 1, max: 50 },
  ],
}
