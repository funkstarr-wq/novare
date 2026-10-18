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

/** The one `<h1>` of a template (brief §8.2), with an optional intro and image. */
export function PageHeader({ title, intro, image, children }: Props) {
  return (
    <header className="mx-auto grid max-w-(--container-page) gap-8 px-6 py-10 md:grid-cols-2 md:items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-brand-strong sm:text-4xl">{title}</h1>
        {intro && <p className="text-lg text-ink-muted">{intro}</p>}
        {children}
      </div>
      {image && (
        <Media
          media={image}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="h-auto w-full rounded-lg"
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
