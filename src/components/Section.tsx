import type { ReactNode } from 'react'

type Props = { heading?: null | string; children: ReactNode; muted?: boolean; id?: string }

/** A page section: full-width band, page-width content, optional `<h2>`. */
export function Section({ heading, children, muted = false, id }: Props) {
  return (
    <section id={id} className={muted ? 'bg-surface-muted' : undefined}>
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-6 px-6 py-10">
        {heading && <h2 className="text-2xl font-semibold text-brand-strong">{heading}</h2>}
        {children}
      </div>
    </section>
  )
}
