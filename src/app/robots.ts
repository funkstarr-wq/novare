import type { MetadataRoute } from 'next'

import { absoluteURL, indexableHost } from '@/lib/site'

// Per request: staging and PR environments must never be crawled (src/lib/site.ts).
export const dynamic = 'force-dynamic'

/** robots.txt (brief §7): production allows crawling and names the sitemap; others block all. */
export default function robots(): MetadataRoute.Robots {
  if (!indexableHost()) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/preview/'] },
    sitemap: absoluteURL('/sitemap.xml'),
  }
}
