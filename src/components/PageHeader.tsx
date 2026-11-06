import type { ReactNode } from 'react'

import type { Media as MediaDoc, Page } from '@/payload-types'

import { buttonClass, CMSLink } from './CMSLink'
import { Media } from './Media'

type Props = {
  title: string
  intro?: null | string
  image?: MediaDoc | number | null
  children?: ReactNode
}

/**
 * The one `<h1>` of a template (brief §8.2): a large serif title beside its intro, and the image
 * full width below it, after apollo.com (decision "Apollo-style theme").
 */
export function PageHeader({ title, intro, image, children }: Props) {
  return (
    <header className="mx-auto w-full max-w-(--container-page) px-6 pb-12 pt-10 md:pt-16">
      <div className="grid gap-6 md:grid-cols-[7fr_5fr] md:items-end md:gap-12">
        <h1 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        {(intro || children) && (
          <div className="flex flex-col items-start gap-5">
            {intro && <p className="text-lg text-ink-muted">{intro}</p>}
            {children}
          </div>
        )}
      </div>
      {image && (
        <Media
          media={image}
          sizes="(min-width: 1376px) 1328px, 100vw"
          priority
          className="mt-10 aspect-[21/9] h-auto w-full rounded-[10px] object-cover md:mt-14"
        />
      )}
    </header>
  )
}

/** A page's own header: its `hero` group, falling back to the page title. */
export function PageHero({ page, title }: { page: Page | null; title: string }) {
  const hero = page?.hero
  return (
    <PageHeader title={hero?.heading || title} intro={hero?.subheading} image={hero?.image}>
      {hero?.cta?.label && (
        <p>
          <CMSLink link={hero.cta} className={buttonClass} />
        </p>
      )}
    </PageHeader>
  )
}
