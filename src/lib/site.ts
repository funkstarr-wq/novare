import { fileURL } from './urls'

/** The site's own origin, e.g. `https://www.novare.com` (NEXT_PUBLIC_SERVER_URL). */
export const siteURL = () =>
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '')

/** An absolute URL for a site path (`/about/` → `https://…/about/`). */
export const absoluteURL = (path: string) =>
  `${siteURL()}${path.startsWith('/') ? path : `/${path}`}`

/** An absolute URL for an uploaded file, for Open Graph images and JSON-LD. */
export const absoluteFileURL = (url: null | string | undefined) => {
  const file = fileURL(url)
  if (!file) return null
  return /^https?:\/\//.test(file) ? file : absoluteURL(file)
}

/**
 * Whether search engines may index this host. Railway sets RAILWAY_ENVIRONMENT_NAME on every
 * deployment: only `production` is indexed, so staging and PR environments never are. Local and
 * CI runs (no Railway environment) behave like production, so tests see the real tags.
 *
 * Production stays hidden too while it is served from its `*.up.railway.app` address, before the
 * DNS cutover sets NEXT_PUBLIC_SERVER_URL to the real domain (docs/launch-runbook.md).
 */
export const indexableHost = () => {
  const environment = process.env.RAILWAY_ENVIRONMENT_NAME
  if (!environment) return true
  return environment === 'production' && !new URL(siteURL()).hostname.endsWith('.railway.app')
}
