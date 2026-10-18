import NextLink from 'next/link'
import type { ReactNode } from 'react'

import type { Link } from '@/payload-types'
import { isExternal, linkHref } from '@/lib/urls'

type Props = { link: Link | null | undefined; className?: string; children?: ReactNode }

/** A `link` field. Renders nothing when its target is gone or unpublished. */
export function CMSLink({ link, className, children }: Props) {
  const href = linkHref(link)
  if (!link || !href) return null
  if (isExternal(href)) {
    return (
      <a href={href} className={className} rel="noopener">
        {children ?? link.label}
      </a>
    )
  }
  return (
    <NextLink href={href} className={className}>
      {children ?? link.label}
    </NextLink>
  )
}

export const buttonClass =
  'inline-flex items-center rounded-md bg-brand px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-strong'
export const secondaryButtonClass =
  'inline-flex items-center rounded-md border border-brand px-5 py-2.5 font-semibold text-brand hover:bg-surface-muted'
