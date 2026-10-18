import { SolutionCard } from '@/components/cards/SolutionCard'
import { Section } from '@/components/Section'
import { listSolutions } from '@/lib/queries'
import type { SolutionCardsBlock } from '@/payload-types'

import type { SectionProps } from './types'

export async function SolutionCards({ block, draft }: SectionProps<SolutionCardsBlock>) {
  const ids =
    block.mode === 'manual'
      ? (block.solutions ?? []).map((item) => (typeof item === 'object' ? item.id : item))
      : undefined
  const solutions = await listSolutions(draft, ids)
  // Manual selection keeps the editor's order.
  const ordered = ids ? ids.flatMap((id) => solutions.filter((s) => s.id === id)) : solutions
  if (ordered.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((solution) => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </ul>
    </Section>
  )
}
