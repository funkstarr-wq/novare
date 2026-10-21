import Image from 'next/image'
import NextLink from 'next/link'

import { fileURL, linkHref } from '@/lib/urls'
import { getHeader, getSiteSettings } from '@/lib/queries'

import { type NavItem, NavMenu } from './NavMenu'

/** Site header from the `header` global (brief §8.2). Only the menu runs on the client. */
export async function Header({ draft }: { draft: boolean }) {
  const [header, settings] = await Promise.all([getHeader(draft), getSiteSettings(draft)])
  const items: NavItem[] = (header.navItems ?? []).flatMap((item) => {
    const href = linkHref(item.link)
    const children = (item.children ?? []).flatMap((child) => {
      const childHref = linkHref(child.link)
      return childHref ? [{ label: child.link.label, href: childHref }] : []
    })
    return href || children.length ? [{ label: item.link.label, href, children }] : []
  })
  const ctaHref = linkHref(header.utilityCta)
  const cta =
    ctaHref && header.utilityCta ? { label: header.utilityCta.label, href: ctaHref } : null

  // The logo from site settings, 40px tall; the organisation's name until one is uploaded.
  const logo = typeof settings.logo === 'object' ? settings.logo : null
  const logoSrc = fileURL(logo?.url)
  const logoWidth = logo?.width && logo.height ? Math.round((40 * logo.width) / logo.height) : null

  return (
    <header className="relative border-b-2 border-accent bg-surface">
      <div className="mx-auto flex max-w-(--container-page) items-center justify-between gap-6 px-6 py-4">
        <NextLink href="/" className="text-xl font-bold text-brand-strong">
          {logoSrc && logoWidth ? (
            <Image
              src={logoSrc}
              alt={settings.organisationName}
              width={logoWidth}
              height={40}
              sizes={`${logoWidth}px`}
              loading="eager"
              className="h-10 w-auto"
            />
          ) : (
            settings.organisationName
          )}
          <span className="sr-only"> home page</span>
        </NextLink>
        <NavMenu items={items} cta={cta} />
      </div>
    </header>
  )
}
