import { populated } from '@/lib/format'
import type { Award } from '@/payload-types'

export function AwardItem({ award }: { award: Award }) {
  const fund = populated(award.fund)
  return (
    <li className="flex flex-col gap-1 border-b border-border py-4">
      <p className="text-sm font-semibold text-brand">{award.year}</p>
      <h3 className="text-lg font-semibold">{award.title}</h3>
      <p className="text-ink-muted">
        {award.awardingBody}
        {fund && ` · ${fund.name}`}
      </p>
      {award.description && <p>{award.description}</p>}
    </li>
  )
}
