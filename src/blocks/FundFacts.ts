import type { Block } from 'payload'

export const FundFactsBlock: Block = {
  slug: 'fundFacts',
  interfaceName: 'FundFactsBlock',
  fields: [{ name: 'fund', type: 'relationship', relationTo: 'funds', required: true }],
}
