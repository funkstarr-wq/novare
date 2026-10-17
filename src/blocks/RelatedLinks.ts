import type { Block } from 'payload'

import { linkField } from '@/fields/link'

export const RelatedLinksBlock: Block = {
  slug: 'relatedLinks',
  interfaceName: 'RelatedLinksBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'links', type: 'array', minRows: 1, fields: [linkField()] },
  ],
}
