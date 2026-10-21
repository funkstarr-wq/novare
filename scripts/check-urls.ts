/**
 * The old-URL crawl (docs/launch-runbook.md): every URL in the old site's sitemap and in
 * docs/redirects.csv must answer 200 on the new site, or one permanent redirect to a 200.
 *
 *   CHECK_BASE_URL=https://novare.com pnpm check:urls
 *
 * CHECK_SITEMAP (default https://novare.com/wp-sitemap.xml) is read while the old site is still up;
 * after the cutover, keep the saved list instead: CHECK_PATHS=docs/old-urls.txt (one path a line).
 * CHECK_SAVE=docs/old-urls.txt saves the sitemap's paths for that. CHECK_REPORT=path writes the report
 * there too. Exits 1 when any URL fails.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { parseRedirectsCsv } from '../src/migration/redirects'
import { checkUrls, sitemapPaths, urlCheckMarkdown } from '../src/migration/urlCheck'

const base = process.env.CHECK_BASE_URL
if (!base) {
  console.error('Set CHECK_BASE_URL to the new site, e.g. https://web-staging-cae7.up.railway.app')
  process.exit(2)
}

const listFile = process.env.CHECK_PATHS
const paths = listFile
  ? readFileSync(listFile, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  : await sitemapPaths(process.env.CHECK_SITEMAP || 'https://novare.com/wp-sitemap.xml')

if (process.env.CHECK_SAVE) writeFileSync(process.env.CHECK_SAVE, `${paths.join('\n')}\n`)

const csv = 'docs/redirects.csv'
if (existsSync(csv)) paths.push(...parseRedirectsCsv(readFileSync(csv, 'utf8')).map((r) => r.from))

const results = await checkUrls(base, paths)
const markdown = urlCheckMarkdown(base, results)
if (process.env.CHECK_REPORT) writeFileSync(process.env.CHECK_REPORT, markdown)
console.log(markdown)
process.exit(results.every((result) => result.ok) ? 0 : 1)
