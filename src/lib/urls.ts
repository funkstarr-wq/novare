import type { Link } from '@/payload-types'

type Fields = Record<string, unknown> | null | undefined
/** Any document, typed (`Page`, `Fund`…) or raw hook data. */
type Doc = object | null | undefined

const slugOf = (doc: Fields) => (typeof doc?.slug === 'string' && doc.slug ? doc.slug : null)

/**
 * The public URL of one document (brief §7), with a trailing slash. `null` when it has none yet
 * (no slug) or its collection has no pages of its own (offices, awards, press mentions).
 */
export function pathFor(collection: string, document: Doc): string | null {
  const doc = document as Fields
  if (collection === 'pages') return typeof doc?.path === 'string' && doc.path ? doc.path : null
  if (collection === 'research') {
    return typeof doc?.year === 'number' ? `/research/hedge-fund-survey/${doc.year}/` : null
  }
  const slug = slugOf(doc)
  if (!slug) return null
  switch (collection) {
    case 'solutions':
      return `/solutions/${slug}/`
    case 'funds':
      return `/solutions/multi-management/${slug}/`
    case 'projects':
      return `/solutions/real-estate/${slug}/`
    case 'people':
      return `/about/leadership/${slug}/`
    case 'insights':
      return `/insights/${slug}/`
    case 'categories':
      return `/insights/category/${slug}/`
    case 'jobs':
      return `/careers/${slug}/`
    case 'legal-documents':
      return `/legal/${slug}/`
    default:
      return null
  }
}

/** The country page of an office (`/locations/<country>/`). */
export const countryPath = (countrySlug: string) => `/locations/${countrySlug}/`

/** Where a `link` field points, or `null` when its target is missing or has no URL. */
export function linkHref(link: Link | null | undefined): string | null {
  if (!link) return null
  if (link.type === 'external') return link.url || null
  const reference = link.reference
  if (!reference || typeof reference.value !== 'object') return null
  return pathFor(reference.relationTo, reference.value)
}

export const isExternal = (href: string) => /^https?:\/\//.test(href)

/**
 * An uploaded file's URL as the site serves it. Payload returns absolute URLs with a trailing
 * slash (it follows `trailingSlash`), which `next/image` rejects and file links answer with a
 * redirect; files on this site become a plain path (`/api/media/file/x.png`).
 */
export function fileURL(url: null | string | undefined): null | string {
  if (!url) return null
  const parsed = new URL(url, 'http://site.invalid')
  const own =
    parsed.origin === 'http://site.invalid' ||
    parsed.origin === new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://site.invalid').origin
  if (!own) return url
  return `${parsed.pathname.replace(/\/+$/, '')}${parsed.search}`
}
