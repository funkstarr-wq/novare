import { RichText } from '@/components/RichText'
import type { IntroStatsBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function IntroStats({ block }: SectionProps<IntroStatsBlock>) {
  return (
    <section className="mx-auto flex max-w-(--container-page) flex-col gap-8 px-6 py-10">
      <RichText data={block.intro} />
      {block.stats && block.stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {block.stats.map((stat, index) => (
            <div key={stat.id ?? index} className="flex flex-col-reverse gap-1">
              <dt className="text-ink-muted">{stat.label}</dt>
              <dd className="text-3xl font-semibold text-brand-strong">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
