import { InsightCard } from '@/components/cards/InsightCard'
import { Section } from '@/components/Section'
import { listInsights } from '@/lib/queries'
import type { InsightCardsBlock } from '@/payload-types'

import type { SectionProps } from './types'

const idOf = (value: number | { id: number } | null | undefined) =>
  value && typeof value === 'object' ? value.id : (value ?? undefined)

export async function InsightCards({ block, draft }: SectionProps<InsightCardsBlock>) {
  const { docs } = await listInsights(draft, {
    limit: block.limit ?? 3,
    category: block.mode === 'category' ? idOf(block.category) : undefined,
    solution: block.mode === 'solution' ? idOf(block.solution) : undefined,
  })
  if (docs.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </ul>
    </Section>
  )
}
