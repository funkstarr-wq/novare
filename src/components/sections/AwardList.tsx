import { AwardItem } from '@/components/cards/AwardItem'
import { Section } from '@/components/Section'
import { listAwards } from '@/lib/queries'
import type { AwardListBlock } from '@/payload-types'

import type { SectionProps } from './types'

export async function AwardList({ block, draft }: SectionProps<AwardListBlock>) {
  const awards = await listAwards(
    draft,
    block.mode === 'years'
      ? { fromYear: block.fromYear ?? undefined, toYear: block.toYear ?? undefined }
      : { limit: block.limit ?? 6 },
  )
  if (awards.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul>
        {awards.map((award) => (
          <AwardItem key={award.id} award={award} />
        ))}
      </ul>
    </Section>
  )
}
