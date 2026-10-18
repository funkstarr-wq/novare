import { populated } from '@/lib/format'
import type { QuoteBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function Quote({ block }: SectionProps<QuoteBlock>) {
  const person = populated(block.person)
  return (
    <section className="mx-auto max-w-(--container-page) px-6 py-10">
      <figure className="flex max-w-(--container-prose) flex-col gap-3 border-l-4 border-brand pl-6">
        <blockquote className="text-2xl">{block.text}</blockquote>
        {person && (
          <figcaption className="text-ink-muted">
            {person.name}
            {person.role && `, ${person.role}`}
          </figcaption>
        )}
      </figure>
    </section>
  )
}
