import type { BlocksField } from 'payload'

import { layoutBlocks } from '@/blocks'

export const layoutField: BlocksField = {
  name: 'layout',
  label: 'Page sections',
  type: 'blocks',
  blocks: layoutBlocks,
}
