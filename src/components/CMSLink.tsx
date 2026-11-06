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

// Pill buttons after apollo.com (decision "Apollo-style theme"). The arrow is decoration: its
// empty alternative text keeps screen readers from announcing it.
export const buttonClass =
  "inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-on-brand transition-colors hover:bg-brand-strong after:content-['→'_/_''] after:transition-transform hover:after:translate-x-0.5"
export const secondaryButtonClass =
  'inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-medium text-brand transition-colors hover:bg-brand hover:text-on-brand'
/** For a dark band: the same buttons in cream. */
export const lightButtonClass =
  "inline-flex items-center gap-2 rounded-full bg-surface px-6 py-3 font-medium text-ink transition-colors hover:bg-surface-muted after:content-['→'_/_''] after:transition-transform hover:after:translate-x-0.5"
export const lightSecondaryButtonClass =
  'inline-flex items-center gap-2 rounded-full border border-surface px-6 py-3 font-medium text-surface transition-colors hover:bg-surface hover:text-ink'
