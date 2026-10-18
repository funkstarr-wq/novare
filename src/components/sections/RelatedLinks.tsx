import { CMSLink } from '@/components/CMSLink'
import { Section } from '@/components/Section'
import type { RelatedLinksBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function RelatedLinks({ block }: SectionProps<RelatedLinksBlock>) {
  return (
    <Section heading={block.heading ?? 'Related links'}>
      <ul className="flex flex-col gap-2">
        {block.links?.map((item, index) => (
          <li key={item.id ?? index}>
            <CMSLink link={item.link} className="text-brand underline" />
          </li>
        ))}
      </ul>
    </Section>
  )
}
