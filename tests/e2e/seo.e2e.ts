import { expect, type Page, test } from '@playwright/test'

import { authFile, sameOrigin, seeded } from './support/auth'
import { templates } from './support/templates'

// M4 "done when": canonical and meta on each template, JSON-LD where it applies (brief §8.3).
const jsonLdTypes = async (page: Page) => {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  return scripts.flatMap((text) => {
    const data = JSON.parse(text)
    return (data['@graph'] ?? [data]).map((thing: { '@type': string }) => thing['@type'])
  })
}

test.describe('SEO tags', () => {
  for (const { name, path, jsonld = [], canonical } of templates) {
    test(`${name}: canonical, Open Graph, robots and JSON-LD`, async ({ page, baseURL }) => {
      await page.goto(path)
      const origin = new URL(baseURL!).origin
      const expected = `${origin}${canonical ?? path}`

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expected)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expected)
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Novare/)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', /summary/)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        name === 'search' ? /noindex/ : /^index/,
      )

      const types = await jsonLdTypes(page)
      expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', ...jsonld]))
      if (path !== '/') expect(types).toContain('BreadcrumbList')
    })
  }

  test('paginated insights point to their neighbours', async ({ page, request }) => {
    await page.goto('/insights/')
    // The seed has fewer insights than a page holds, so there is no next page.
    await expect(page.locator('link[rel="prev"]')).toHaveCount(0)
    expect((await request.get('/insights/?page=2')).status()).toBe(404)
  })
})

test.describe('sitemap and robots', () => {
  test('the sitemap lists published pages with lastmod', async ({ request, baseURL }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.ok()).toBe(true)
    const xml = await response.text()
    const origin = new URL(baseURL!).origin
    for (const path of [
      '/',
      '/about/',
      '/solutions/investment-consulting/',
      '/insights/placeholder-article-one/',
      '/careers/example-analyst/',
      '/locations/exampleland/',
    ]) {
      expect(xml, path).toContain(`<loc>${origin}${path}</loc>`)
    }
    expect(xml).toContain('<lastmod>')
    expect(xml).not.toContain('/search/')
  })

  test('robots.txt allows crawling and names the sitemap', async ({ request, baseURL }) => {
    const text = await (await request.get('/robots.txt')).text()
    expect(text).toContain('Allow: /')
    expect(text).toContain('Disallow: /admin/')
    expect(text).toContain(`Sitemap: ${new URL(baseURL!).origin}/sitemap.xml`)
  })
})

test.describe('redirects', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
  test.use({ storageState: authFile('admin') })

  test('an unknown URL follows its redirect, others answer 404', async ({ page, baseURL }) => {
    const headers = sameOrigin(baseURL)
    const from = `/old-site-page-${Date.now()}/`
    const created = await page.request.post('/api/redirects/', {
      data: { from, to: { type: 'custom', url: '/about/' }, type: '301' },
      headers,
    })
    expect(created.ok(), await created.text()).toBe(true)
    const { doc } = await created.json()
    try {
      const response = await page.request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(308)
      // Next.js sends the Location header twice (same value); clients join them with ", ".
      expect(response.headers()['location'].split(', ')[0]).toBe('/about/')
      await page.goto(from)
      await expect(page).toHaveURL(/\/about\/$/)
      expect((await page.request.get('/no-redirect-here/', { maxRedirects: 0 })).status()).toBe(404)
    } finally {
      await page.request.delete(`/api/redirects/${doc.id}/`, { headers })
    }
  })
})

test.describe('draft mode', () => {
  test('preview responses carry X-Robots-Tag: noindex', async ({ request }) => {
    const response = await request.get('/about/', { headers: { Cookie: '__prerender_bypass=1' } })
    expect(response.headers()['x-robots-tag']).toBe('noindex')
    expect((await request.get('/about/')).headers()['x-robots-tag']).toBeUndefined()
  })
})
