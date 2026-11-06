import { CMSLink, lightButtonClass } from '@/components/CMSLink'
import type { CtaBandBlock } from '@/payload-types'

import type { SectionProps } from './types'

/** A black band with a serif statement and a cream pill button (decision "Apollo-style theme"). */
export function CtaBand({ block }: SectionProps<CtaBandBlock>) {
  return (
    <section className="on-dark bg-ink text-surface">
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-8 px-6 py-20 md:flex-row md:items-end md:justify-between md:py-24">
        <div className="flex max-w-3xl flex-col gap-4">
          <h2 className="text-4xl leading-tight sm:text-5xl">{block.heading}</h2>
          {block.text && <p className="text-lg text-border">{block.text}</p>}
        </div>
        <CMSLink
          link={block.button}
          className={`${lightButtonClass} shrink-0 self-start md:self-auto`}
        />
      </div>
    </section>
  )
}
