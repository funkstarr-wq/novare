import { PressItem } from '@/components/cards/PressItem'
import { Section } from '@/components/Section'
import { listPress } from '@/lib/queries'
import type { PressListBlock } from '@/payload-types'

import type { SectionProps } from './types'

export async function PressList({ block, draft }: SectionProps<PressListBlock>) {
  const mentions = await listPress(draft, block.limit ?? 6)
  if (mentions.length === 0) return null
  return (
    <Section heading={block.heading}>
      <ul>
        {mentions.map((mention) => (
          <PressItem key={mention.id} mention={mention} />
        ))}
      </ul>
    </Section>
  )
}
