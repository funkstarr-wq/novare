import { RichText } from '@/components/RichText'
import type { RichTextBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function RichTextSection({ block }: SectionProps<RichTextBlock>) {
  return (
    <section className="mx-auto max-w-(--container-page) px-6 py-8">
      <RichText data={block.content} />
    </section>
  )
}
