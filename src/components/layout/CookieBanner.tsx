import { populated } from '@/lib/format'
import { getSiteSettings } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

import { CookieBannerClient } from './CookieBannerClient'

/** The cookie banner, when switched on in site settings (brief §12). */
export async function CookieBanner({ draft }: { draft: boolean }) {
  const settings = await getSiteSettings(draft)
  const banner = settings.cookieBanner
  if (!banner?.enabled || !banner.message) return null
  const policy = populated(banner.policy)
  return (
    <CookieBannerClient
      message={banner.message}
      policyHref={policy ? pathFor('legal-documents', policy) : null}
    />
  )
}
