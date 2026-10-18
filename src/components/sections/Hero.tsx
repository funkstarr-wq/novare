import { buttonClass, CMSLink, secondaryButtonClass } from '@/components/CMSLink'
import { Media } from '@/components/Media'
import type { HeroBlock } from '@/payload-types'

import type { SectionProps } from './types'

/** The page's `<h1>` when it is the first section; an `<h2>` anywhere else. */
export function Hero({ block, first }: SectionProps<HeroBlock>) {
  const Heading = first ? 'h1' : 'h2'
  return (
    <section className="bg-surface-muted">
      <div className="mx-auto grid max-w-(--container-page) gap-8 px-6 py-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-5">
          <Heading className="text-3xl font-semibold text-brand-strong sm:text-4xl">
            {block.heading}
          </Heading>
          {block.subheading && <p className="text-lg text-ink-muted">{block.subheading}</p>}
          {block.ctas && block.ctas.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {block.ctas.map((cta, index) => (
                <CMSLink
                  key={cta.id ?? index}
                  link={cta.link}
                  className={index === 0 ? buttonClass : secondaryButtonClass}
                />
              ))}
            </div>
          )}
        </div>
        <Media
          media={block.image}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={first}
          className="h-auto w-full rounded-lg"
        />
      </div>
    </section>
  )
}
