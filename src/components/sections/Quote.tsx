import { populated } from '@/lib/format'
import type { QuoteBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function Quote({ block }: SectionProps<QuoteBlock>) {
  const person = populated(block.person)
  return (
    <section className="mx-auto w-full max-w-(--container-page) px-6 py-16 md:py-24">
      <figure className="flex max-w-4xl flex-col gap-6 border-l-2 border-accent pl-8">
        <blockquote className="font-serif text-3xl leading-snug sm:text-4xl">
          {block.text}
        </blockquote>
        {person && (
          <figcaption className="text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
            {person.name}
            {person.role && `, ${person.role}`}
          </figcaption>
        )}
      </figure>
    </section>
  )
}
