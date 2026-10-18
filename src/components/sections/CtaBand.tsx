import { CMSLink } from '@/components/CMSLink'
import type { CtaBandBlock } from '@/payload-types'

import type { SectionProps } from './types'

export function CtaBand({ block }: SectionProps<CtaBandBlock>) {
  return (
    <section className="bg-brand text-on-brand">
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{block.heading}</h2>
          {block.text && <p>{block.text}</p>}
        </div>
        <CMSLink
          link={block.button}
          className="inline-flex items-center rounded-md bg-surface px-5 py-2.5 font-semibold text-brand-strong hover:bg-surface-muted"
        />
      </div>
    </section>
  )
}
