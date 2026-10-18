import { RichText } from '@/components/RichText'
import type { DisclaimerStripBlock } from '@/payload-types'

import type { SectionProps } from './types'

/** The block's own text, or else the disclaimer of the document it sits on. */
export function DisclaimerStrip({ block, parent }: SectionProps<DisclaimerStripBlock>) {
  const content = block.content ?? parent.disclaimer
  if (!content) return null
  return <Disclaimer content={content} />
}

export function Disclaimer({
  content,
}: {
  content: SectionProps<unknown>['parent']['disclaimer']
}) {
  if (!content) return null
  return (
    <aside aria-label="Disclaimer" className="border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-(--container-page) px-6 py-8 text-sm text-ink-muted">
        <RichText data={content} />
      </div>
    </aside>
  )
}
