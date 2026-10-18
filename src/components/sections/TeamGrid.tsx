import { PersonCard } from '@/components/cards/PersonCard'
import { Section } from '@/components/Section'
import { listPeople } from '@/lib/queries'
import type { TeamGridBlock } from '@/payload-types'

import type { SectionProps } from './types'

export async function TeamGrid({ block, draft }: SectionProps<TeamGridBlock>) {
  const division = typeof block.division === 'object' ? block.division?.id : block.division
  const people = await listPeople(
    draft,
    block.filter === 'division' && division ? { division } : { leadership: true },
  )
  if (people.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </ul>
    </Section>
  )
}
