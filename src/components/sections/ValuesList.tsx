import { Section } from '@/components/Section'
import type { ValuesListBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function ValuesList({ block }: SectionProps<ValuesListBlock>) {
  return (
    <Section heading={block.heading}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.items?.map((item, index) => (
          <li key={item.id ?? index} className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-ink-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
