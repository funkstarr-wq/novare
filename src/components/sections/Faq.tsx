import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import type { FaqBlock } from '@/payload-types'

import type { SectionProps } from './types'

/** Questions as native disclosure widgets. FAQPage JSON-LD arrives with the SEO layer (M4). */
export function Faq({ block }: SectionProps<FaqBlock>) {
  return (
    <Section heading={block.heading ?? 'Frequently asked questions'}>
      <div className="flex max-w-(--container-prose) flex-col divide-y divide-border border-y border-border">
        {block.items?.map((item, index) => (
          <details key={item.id ?? index} className="group py-4">
            <summary className="cursor-pointer text-lg font-semibold">{item.question}</summary>
            <div className="pt-3">
              <RichText data={item.answer} />
            </div>
          </details>
        ))}
      </div>
    </Section>
  )
}
