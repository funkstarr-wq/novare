import {
  buttonClass,
  CMSLink,
  lightButtonClass,
  lightSecondaryButtonClass,
  secondaryButtonClass,
} from '@/components/CMSLink'
import { Media } from '@/components/Media'
import type { HeroBlock } from '@/payload-types'

import type { SectionProps } from './types'

/**
 * The page's `<h1>` when it is the first section; an `<h2>` anywhere else. With an image it is a
 * full-bleed photograph with the text over a dark gradient, after apollo.com (decision
 * "Apollo-style theme"); without one, a plain cream band.
 */
export function Hero({ block, first }: SectionProps<HeroBlock>) {
  const Heading = first ? 'h1' : 'h2'
  const hasImage = Boolean(block.image && typeof block.image === 'object' && block.image.url)

  const text = (
    <div className="flex max-w-3xl flex-col gap-6">
      <Heading className="font-sans text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-[4.25rem]">
        {block.heading}
      </Heading>
      {block.subheading && (
        <p
          className={`max-w-2xl text-lg sm:text-xl ${hasImage ? 'text-surface' : 'text-ink-muted'}`}
        >
          {block.subheading}
        </p>
      )}
      {block.ctas && block.ctas.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {block.ctas.map((cta, index) => (
            <CMSLink
              key={cta.id ?? index}
              link={cta.link}
              className={
                hasImage
                  ? index === 0
                    ? lightButtonClass
                    : lightSecondaryButtonClass
                  : index === 0
                    ? buttonClass
                    : secondaryButtonClass
              }
            />
          ))}
        </div>
      )}
    </div>
  )

  if (!hasImage) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto max-w-(--container-page) px-6 py-20 md:py-28">{text}</div>
      </section>
    )
  }

  return (
    <section
      className={`on-dark relative isolate flex min-h-[min(82vh,52rem)] items-end overflow-hidden bg-ink text-surface ${
        // The opening hero runs up under the see-through header.
        first ? '-mt-(--header-h)' : ''
      }`}
    >
      <Media
        media={block.image}
        sizes="100vw"
        priority={first}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      {/* Keeps the text readable on any photograph. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/85 via-ink/45 to-ink/10"
      />
      <div className="mx-auto w-full max-w-(--container-page) px-6 pb-16 pt-40 md:pb-24">
        {text}
      </div>
    </section>
  )
}
