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
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-(--container-page) gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {footer.columns?.map((column, index) => (
          <nav key={column.id ?? index} aria-label={column.heading} className="flex flex-col gap-3">
            <h2 className="font-semibold">{column.heading}</h2>
            <ul className="flex flex-col gap-2">
              {column.links?.map((item, linkIndex) => (
                <li key={item.id ?? linkIndex}>
                  <CMSLink link={item.link} className="text-ink-muted hover:underline" />
                </li>
              ))}
            </ul>
          </nav>
        ))}
        {offices.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold">Offices</h2>
            <ul className="flex flex-col gap-2 text-ink-muted">
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
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-6 py-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
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
