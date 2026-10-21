import { afterEach, describe, expect, it, vi } from 'vitest'

import { indexableHost } from '@/lib/site'
import { normalisePath, parseRedirectsCsv } from '@/migration/redirects'
import { checkUrl, checkUrls, sitemapPaths, urlCheckMarkdown } from '@/migration/urlCheck'

// M8 (brief §13): the go-live tooling. Made-up URLs only.
const NEW = 'https://new.example.test'

afterEach(() => vi.unstubAllEnvs())

describe('indexing before and after the cutover', () => {
  it('hides production while it is served from its Railway address', () => {
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'production')
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://web-production-0000.up.railway.app')
    expect(indexableHost()).toBe(false)
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://www.example.test')
    expect(indexableHost()).toBe(true)
  })

  it('never indexes staging, and indexes local and CI runs', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://www.example.test')
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'staging')
    expect(indexableHost()).toBe(false)
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', '')
    expect(indexableHost()).toBe(true)
  })
})

describe('redirects CSV', () => {
  it('normalises paths to the slash form the lookup matches', () => {
    expect(normalisePath('/about-us')).toBe('/about-us/')
    expect(normalisePath('https://old.example.test/a/b/')).toBe('/a/b/')
    expect(normalisePath('/files/report.pdf')).toBe('/files/report.pdf')
    expect(normalisePath('/search?q=x')).toBe('/search/?q=x')
    expect(() => normalisePath('/about-us/#history')).toThrow(/anchors/)
  })

  it('parses rows, skipping the header, blanks and comments', () => {
    const rows = parseRedirectsCsv(
      'old,new,status\n/a/,/b/,301\n\n# note\n/c,/d/,302\n/e/,https://other.example.test/,301\n',
    )
    expect(rows).toEqual([
      { from: '/a/', to: '/b/', type: '301', line: 2 },
      { from: '/c/', to: '/d/', type: '302', line: 5 },
      { from: '/e/', to: 'https://other.example.test/', type: '301', line: 6 },
    ])
  })

  it('rejects the whole file on bad rows, duplicates and chains', () => {
    expect(() => parseRedirectsCsv('/a/,/b/,307\n/a/,/c/\n/x/,/x/\n/y/,/z/\n/z/,/q/')).toThrow(
      /line 1: status "307"[\s\S]*line 3: redirects to itself[\s\S]*line 4: \/z\/ is itself redirected/,
    )
    expect(() => parseRedirectsCsv('/a/,/b/\n/a/,/c/')).toThrow(/\/a\/ is already on line 1/)
  })
})

const site = (routes: Record<string, number | [number, string]>) =>
  (async (input: RequestInfo | URL) => {
    const route = routes[new URL(String(input)).pathname] ?? 404
    const [status, location] = Array.isArray(route) ? route : [route]
    const headers = new Headers()
    for (const value of location?.split('|') ?? []) headers.append('location', value)
    return new Response(null, { status, headers })
  }) as typeof fetch

describe('old-URL check', () => {
  const fetcher = site({
    '/same/': 200,
    // Next.js sends the header twice on a page's first render (decision M4 §7).
    '/moved/': [308, '/insights/moved/|/insights/moved/'],
    '/split/': [308, '/a/|/b/'],
    '/insights/moved/': 200,
    '/chain/': [301, '/step/'],
    '/step/': [301, '/end/'],
    '/end/': 200,
    '/temp/': [302, '/same/'],
    '/broken/': [301, '/missing/'],
    '/away/': [301, 'https://other.example.test/'],
  })

  it('passes a 200 or one permanent hop to a 200, and fails everything else', async () => {
    const results = await checkUrls(
      NEW,
      [
        '/same/',
        '/moved/',
        '/split/',
        '/chain/',
        '/temp/',
        '/broken/',
        '/gone/',
        '/away/',
        '/same/',
      ],
      { fetcher },
    )
    expect(results.map(({ path, ok, problem }) => [path, ok, problem])).toEqual([
      ['/same/', true, undefined],
      ['/moved/', true, undefined],
      ['/split/', false, 'conflicting Location headers'],
      ['/chain/', false, 'more than one hop'],
      ['/temp/', false, 'temporary redirect'],
      ['/broken/', false, 'redirect target does not answer 200'],
      ['/gone/', false, 'not found or error'],
      ['/away/', true, undefined],
    ])
    const markdown = urlCheckMarkdown(NEW, results, new Date('2026-01-01T00:00:00Z'))
    expect(markdown).toContain('8 old URLs')
    expect(markdown).toContain('| /chain/ | 301 → 301 | /step/ | more than one hop |')
    expect(markdown).toContain('- /away/ → https://other.example.test/')
  })

  it('reports a failed request instead of stopping', async () => {
    const failing = (async () => {
      throw new Error('connection refused')
    }) as typeof fetch
    expect(await checkUrl(NEW, '/x/', failing).catch((error: Error) => error.message)).toBe(
      'connection refused',
    )
    expect((await checkUrls(NEW, ['/x/'], { fetcher: failing }))[0]).toMatchObject({
      ok: false,
      problem: 'connection refused',
    })
  })

  it('reads a WordPress sitemap index and its sitemaps', async () => {
    const xml = (body: string) => new Response(body, { headers: { 'content-type': 'text/xml' } })
    const files: Record<string, string> = {
      '/wp-sitemap.xml':
        '<sitemapindex><sitemap><loc>https://old.example.test/wp-sitemap-posts-post-1.xml</loc></sitemap><sitemap><loc>https://old.example.test/wp-sitemap-posts-page-1.xml</loc></sitemap></sitemapindex>',
      '/wp-sitemap-posts-post-1.xml':
        '<urlset><url><loc>https://old.example.test/a-post/</loc></url></urlset>',
      '/wp-sitemap-posts-page-1.xml':
        '<urlset><url><loc>https://old.example.test/</loc></url><url><loc>https://old.example.test/about-us/</loc></url></urlset>',
    }
    const fetcher = (async (input: RequestInfo | URL) =>
      xml(files[new URL(String(input)).pathname])) as typeof fetch
    expect(await sitemapPaths('https://old.example.test/wp-sitemap.xml', fetcher)).toEqual([
      '/a-post/',
      '/',
      '/about-us/',
    ])
  })
})
