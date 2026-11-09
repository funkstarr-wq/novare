import { RichText } from '@/components/RichText'
import type { IntroStatsBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function IntroStats({ block }: SectionProps<IntroStatsBlock>) {
  return (
    <section className="mx-auto flex w-full max-w-(--container-page) flex-col gap-12 px-6 py-16 md:py-24">
      <RichText data={block.intro} />
      {block.stats && block.stats.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-10 md:grid-cols-3 lg:grid-cols-6">
          {block.stats.map((stat, index) => (
            <div key={stat.id ?? index} className="flex flex-col-reverse gap-3">
              <dt className="text-ink-muted">{stat.label}</dt>
              <dd className="font-serif text-5xl leading-none">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
