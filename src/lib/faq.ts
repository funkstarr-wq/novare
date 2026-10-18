import type { LayoutBlock } from '@/components/RenderBlocks'

import { faqPage, type Thing } from './jsonld'

/** FAQPage JSON-LD from a document's `faq` sections (brief §5.3), or `null` without any. */
export function faqOf(blocks: LayoutBlock[] | null | undefined): Thing | null {
  const items = (blocks ?? []).flatMap((block) =>
    block.blockType === 'faq' ? (block.items ?? []) : [],
  )
  return items.length ? faqPage(items) : null
}
