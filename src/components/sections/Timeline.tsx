import { Section } from '@/components/Section'
import type { TimelineBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function Timeline({ block }: SectionProps<TimelineBlock>) {
  const items = [...(block.items ?? [])].sort((a, b) => a.year - b.year)
  return (
    <Section heading={block.heading}>
      <ol className="flex flex-col border-l-2 border-border">
        {items.map((item, index) => (
          <li key={item.id ?? index} className="flex flex-col gap-1 py-4 pl-6">
            <p className="text-sm font-semibold text-brand">{item.year}</p>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.text && <p className="text-ink-muted">{item.text}</p>}
          </li>
        ))}
      </ol>
    </Section>
  )
}
