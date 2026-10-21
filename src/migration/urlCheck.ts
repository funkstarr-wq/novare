/**
 * The old-URL crawl (brief §13 M6 "done when", docs/launch-runbook.md): every URL the old site
 * published must answer 200 on the new site, or redirect once, permanently, to a page that
 * answers 200.
 */
export type UrlCheck = {
  path: string
  ok: boolean
  status: number
  location?: string
  finalStatus?: number
  /** A permanent redirect to another site: passes, but isn't followed, so check it by hand. */
  external?: boolean
  problem?: string
}

type Fetcher = typeof fetch

const locs = (xml: string) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1].replace(/&amp;/g, '&'))

/** Paths from a sitemap or sitemap index (WordPress: /wp-sitemap.xml), in sitemap order. */
export async function sitemapPaths(url: string, fetcher: Fetcher = fetch): Promise<string[]> {
  const response = await fetcher(url)
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  const xml = await response.text()
  const entries = locs(xml)
  if (!/<sitemapindex\b/.test(xml)) return entries.map((entry) => new URL(entry).pathname)
  const nested = await Promise.all(entries.map((entry) => sitemapPaths(entry, fetcher)))
  return nested.flat()
}

const PERMANENT = new Set([301, 308])

export async function checkUrl(base: string, path: string, fetcher: Fetcher = fetch) {
  const origin = new URL(base).origin
  const first = await fetcher(new URL(path, origin), { redirect: 'manual' })
  const result: UrlCheck = { path, ok: false, status: first.status }
  if (first.status === 200) return { ...result, ok: true }
  if (first.status < 300 || first.status >= 400) return { ...result, problem: 'not found or error' }

  // Next.js 16.3 sends a redirect's Location header twice the first time it renders the page
  // (decision M4 §7); fetch joins the copies with ", ". Browsers follow identical copies.
  const copies = first.headers.get('location')?.split(/,\s*/) ?? []
  const location = copies.every((copy) => copy === copies[0]) ? copies[0] : null
  if (!location) {
    return {
      ...result,
      problem: copies.length
        ? 'conflicting Location headers'
        : 'redirect without a Location header',
    }
  }
  const target = new URL(location, origin)
  result.location = target.origin === origin ? `${target.pathname}${target.search}` : target.href
  if (!PERMANENT.has(first.status)) return { ...result, problem: 'temporary redirect' }
  if (target.origin !== origin) return { ...result, ok: true, external: true }

  const second = await fetcher(target, { redirect: 'manual' })
  result.finalStatus = second.status
  if (second.status === 200) return { ...result, ok: true }
  if (second.status >= 300 && second.status < 400)
    return { ...result, problem: 'more than one hop' }
  return { ...result, problem: 'redirect target does not answer 200' }
}

/** Checks every path, a few at a time so the new site isn't flooded. */
export async function checkUrls(
  base: string,
  paths: string[],
  { fetcher = fetch, concurrency = 4 }: { fetcher?: Fetcher; concurrency?: number } = {},
): Promise<UrlCheck[]> {
  const unique = [...new Set(paths)]
  const results: UrlCheck[] = new Array(unique.length)
  let next = 0
  const worker = async () => {
    while (next < unique.length) {
      const index = next++
      results[index] = await checkUrl(base, unique[index], fetcher).catch((error: Error) => ({
        path: unique[index],
        ok: false,
        status: 0,
        problem: error.message,
      }))
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker))
  return results
}

export function urlCheckMarkdown(base: string, results: UrlCheck[], at = new Date()) {
  const failed = results.filter((result) => !result.ok)
  const lines = [
    '# Old-URL check',
    '',
    `Checked ${results.length} old URLs against ${base} at ${at.toISOString()}: ${
      results.length - failed.length
    } pass, ${failed.length} fail.`,
    '',
  ]
  if (failed.length) {
    lines.push('| Old URL | Status | Goes to | Problem |', '| --- | ---: | --- | --- |')
    for (const result of failed) {
      const status = result.finalStatus
        ? `${result.status} → ${result.finalStatus}`
        : String(result.status)
      lines.push(
        `| ${result.path} | ${status} | ${result.location ?? ''} | ${result.problem ?? ''} |`,
      )
    }
    lines.push('')
  }
  const external = results.filter((result) => result.external)
  if (external.length) {
    lines.push('Redirects to other sites (not followed; check them by hand):', '')
    for (const result of external) lines.push(`- ${result.path} → ${result.location}`)
    lines.push('')
  }
  return lines.join('\n')
}
