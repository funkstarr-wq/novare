import NextLink from 'next/link'

import { CMSLink } from '@/components/CMSLink'
import { CookieSettingsButton } from '@/components/layout/CookieBannerClient'
import { populated } from '@/lib/format'
import { getFooter, getSiteSettings } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

const platforms = {
  linkedin: 'LinkedIn',
  x: 'X',
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
} as const

/** Site footer from the `footer` global (brief §8.2). */
export async function Footer({ draft }: { draft: boolean }) {
  const [footer, settings] = await Promise.all([getFooter(draft), getSiteSettings(draft)])
  const legal = (footer.legalLinks ?? []).flatMap((doc) => {
    const item = populated(doc)
    const href = item && pathFor('legal-documents', item)
    return item && href ? [{ label: item.title, href }] : []
  })
  const offices = (footer.offices ?? []).flatMap((office) => populated(office) ?? [])
  const cookieSettings = Boolean(settings.cookieBanner?.enabled && settings.cookieBanner.message)

  return (
    <footer className="on-dark mt-auto bg-ink text-surface">
      <div className="mx-auto max-w-(--container-page) px-6 pt-16">
        <p className="font-serif text-4xl">{settings.organisationName}</p>
      </div>
      <div className="mx-auto grid max-w-(--container-page) gap-10 px-6 pb-14 pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {footer.columns?.map((column, index) => (
          <nav key={column.id ?? index} aria-label={column.heading} className="flex flex-col gap-3">
            <h2 className="border-t border-ink-muted pt-4 text-xl">{column.heading}</h2>
            <ul className="flex flex-col gap-2">
              {column.links?.map((item, linkIndex) => (
                <li key={item.id ?? linkIndex}>
                  <CMSLink
                    link={item.link}
                    className="text-sm text-border hover:text-surface hover:underline"
                  />
                </li>
              ))}
            </ul>
          </nav>
        ))}
        {offices.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="border-t border-ink-muted pt-4 text-xl">Offices</h2>
            <ul className="flex flex-col gap-2 text-sm text-border">
              {offices.map((office) => (
                <li key={office.id}>
                  {office.city}, {office.country}
                  {office.phone && (
                    <>
                      {' · '}
                      <a
                        href={`tel:${office.phone.replace(/\s+/g, '')}`}
                        className="hover:underline"
                      >
                        {office.phone}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-ink-muted">
        <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-6 py-6 text-sm text-border md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.organisationName}
          </p>
          {(legal.length > 0 || cookieSettings) && (
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-4">
                {legal.map((item) => (
                  <li key={item.href}>
                    <NextLink href={item.href} className="hover:underline">
                      {item.label}
                    </NextLink>
                  </li>
                ))}
                {cookieSettings && (
                  <li>
                    <CookieSettingsButton />
                  </li>
                )}
              </ul>
            </nav>
          )}
          {footer.socialLinks && footer.socialLinks.length > 0 && (
            <ul className="flex gap-4" aria-label="Social media">
              {footer.socialLinks.map((social) => (
                <li key={social.id ?? social.url}>
                  <a href={social.url} rel="noopener" className="hover:underline">
                    {platforms[social.platform]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
