import type { MetadataRoute } from 'next'

import { HUBS } from '@/components/hubs'
import { todayISO } from '@/lib/format'
import { listSitemapDocs } from '@/lib/queries'
import { absoluteURL } from '@/lib/site'
import { countryPath, pathFor } from '@/lib/urls'

// Built per request from cached queries (the build has no database).
export const dynamic = 'force-dynamic'

/**
 * XML sitemap (brief §8.3): every published document with a URL, `lastmod` from `updatedAt`.
 * Leaves out documents marked "Hide from search engines" and vacancies whose closing date has
 * passed. Drafts never appear: the queries read with the public's access.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { docs, offices } = await listSitemapDocs(false)
  const today = todayISO()
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()

  for (const { collection, doc } of docs) {
    const meta = doc.meta as { noindex?: boolean | null } | undefined
    if (meta?.noindex) continue
    if (
      collection === 'jobs' &&
      typeof doc.closingDate === 'string' &&
      doc.closingDate.slice(0, 10) < today
    ) {
      continue
    }
    const path = pathFor(collection, doc)
    if (!path) continue
    entries.set(path, {
      url: absoluteURL(path),
      lastModified: typeof doc.updatedAt === 'string' ? doc.updatedAt : undefined,
    })
  }
  // Listing pages that work without a `pages` document of their own.
  for (const path of [...Object.keys(HUBS), '/insights/']) {
    if (!entries.has(path)) entries.set(path, { url: absoluteURL(path) })
  }
  for (const office of offices) {
    if (!office.countrySlug) continue
    const path = countryPath(office.countrySlug)
    const previous = entries.get(path)?.lastModified
    const lastModified =
      previous && String(previous) > office.updatedAt ? String(previous) : office.updatedAt
    entries.set(path, { url: absoluteURL(path), lastModified })
  }
  return [...entries.values()]
}
