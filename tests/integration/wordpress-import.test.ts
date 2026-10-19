import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { WordPressClient } from '@/migration/wordpress/client'
import { importWordPress, reportMarkdown } from '@/migration/wordpress/import'

// M6 (brief §11): the whole import against a stubbed WordPress site (made-up content), twice.
const ORIGIN = 'https://wp.example.test'
let payload: Payload
let png: Buffer
const pdf = Buffer.from(
  [
    '%PDF-1.1',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R>>endobj',
    'xref',
    '0 1',
    '0000000000 65535 f ',
    'trailer<</Root 1 0 R/Size 4>>',
    '%%EOF',
    '',
  ].join('\n'),
)
const requested: string[] = []

const post = (id: number, slug: string, extra: Record<string, unknown> = {}) => ({
  id,
  slug,
  date: '2021-04-16T10:00:00',
  link: `${ORIGIN}/${slug}/`,
  title: { rendered: `Test article ${id}` },
  excerpt: { rendered: `<p>Summary of article ${id} […]</p>` },
  content: {
    rendered: `<p>Body of <strong>article ${id}</strong>.</p><img src="${ORIGIN}/wp-content/uploads/a${id}.png" alt="A chart for article ${id}">`,
  },
  categories: [1],
  featured_media: 0,
  ...extra,
})

const site: Record<string, unknown> = {
  posts: [
    post(1, 'wp-test-first'),
    post(2, 'wp-test-first-2'),
    post(3, 'wp-test-vacancy', { categories: [2], title: { rendered: 'TEST VACANCY' } }),
  ],
  pages: [
    {
      ...post(10, '', { link: `${ORIGIN}/` }),
      content: {
        rendered: `<h2>Our Presence</h2><h4>SOUTH AFRICA (Test City) Head Office</h4><p>1 Test Road<br />Test City<strong>Tel:</strong> +27 00 000 0000</p>`,
      },
    },
    {
      ...post(11, 'articles-news-and-blogs'),
      content: {
        rendered: `<figure><img src="${ORIGIN}/wp-content/uploads/press.png" alt="press"></figure><h2><a href="https://paper.example.test/story">A test story</a></h2><a href="${ORIGIN}/wp-test-page-article/">ours</a>`,
      },
    },
    {
      ...post(12, 'awards'),
      content: {
        rendered: `<ul><li>Test was awarded <strong>“Test Award”</strong> at the Example Awards 2020.</li></ul>`,
      },
    },
    post(13, 'wp-test-page-article', {
      title: { rendered: 'Page article' },
      content: { rendered: '<h2>Page article</h2><p>Article published as a page.</p>' },
    }),
  ],
  categories: [
    { id: 1, slug: 'news', name: 'news' },
    { id: 2, slug: 'jobs', name: 'jobs' },
  ],
  pdfs: [
    {
      id: 50,
      slug: 'test-disclaimer',
      date: '2020-03-11',
      source_url: `${ORIGIN}/wp-content/uploads/test-disclaimer.pdf`,
      mime_type: 'application/pdf',
      title: { rendered: 'TestDisclaimer' },
    },
    {
      id: 51,
      slug: 'factsheet',
      date: '2020-03-11',
      source_url: `${ORIGIN}/wp-content/uploads/factsheet.pdf`,
      mime_type: 'application/pdf',
      title: { rendered: 'Factsheet' },
    },
  ],
}

const fetcher = (async (input: RequestInfo | URL) => {
  const url = new URL(String(input))
  requested.push(url.pathname)
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json', 'x-wp-totalpages': '1' },
    })
  if (url.pathname.endsWith('.png'))
    return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } })
  if (url.pathname.endsWith('.pdf'))
    return new Response(new Uint8Array(pdf), { headers: { 'content-type': 'application/pdf' } })
  const type = url.pathname.replace('/wp-json/wp/v2/', '')
  if (type === 'media') return json(url.searchParams.get('mime_type') ? site.pdfs : [])
  if (type in site) return json(site[type])
  return new Response('not found', { status: 404 })
}) as typeof fetch

const run = () =>
  importWordPress(payload, { client: new WordPressClient(ORIGIN, fetcher), log: () => undefined })

const bySource = <S extends 'insights' | 'awards' | 'offices' | 'jobs' | 'legal-documents'>(
  collection: S,
) =>
  payload.find({
    collection,
    where: { sourceUrl: { like: ORIGIN } },
    depth: 0,
    draft: true,
    overrideAccess: true,
  })

beforeAll(async () => {
  payload = await getPayload({ config })
  png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#336699' } })
    .png()
    .toBuffer()
})

afterAll(async () => {
  await payload.delete({
    collection: 'press-mentions',
    where: { sourceUrl: { equals: 'https://paper.example.test/story' } },
    overrideAccess: true,
  })
  for (const collection of [
    'insights',
    'press-mentions',
    'jobs',
    'awards',
    'offices',
    'legal-documents',
    'media',
    'documents',
  ] as const) {
    await payload.delete({
      collection,
      where: { sourceUrl: { like: ORIGIN } },
      overrideAccess: true,
    })
  }
})

describe('WordPress import', () => {
  it('imports posts, page articles, press, a vacancy, offices, awards and legal PDFs', async () => {
    const report = await run()

    const insights = (await bySource('insights')).docs
    expect(insights.map((doc) => doc.slug).sort()).toEqual([
      'wp-test-first',
      'wp-test-page-article',
    ])
    const first = insights.find((doc) => doc.slug === 'wp-test-first')!
    expect(first).toMatchObject({
      title: 'Test article 1',
      _status: 'published',
      excerpt: 'Summary of article 1',
    })
    expect(JSON.stringify(first.body)).toContain('article 1')
    expect(first.heroImage).toBeTruthy()
    const pageArticle = insights.find((doc) => doc.slug === 'wp-test-page-article')!
    expect(JSON.stringify(pageArticle.body)).not.toContain('"heading"')
    expect(report.sections.insights.notes.join(' ')).toContain('Skipped duplicate')

    expect((await bySource('jobs')).docs[0]).toMatchObject({
      title: 'TEST VACANCY',
      _status: 'draft',
    })
    // Press mentions are keyed by the article they point to.
    const press = await payload.find({
      collection: 'press-mentions',
      where: { sourceUrl: { equals: 'https://paper.example.test/story' } },
      depth: 0,
    })
    expect(press.docs[0]).toMatchObject({
      headline: 'A test story',
      outlet: 'paper.example.test',
      url: 'https://paper.example.test/story',
      excerpt: null,
    })
    const offices = (await bySource('offices')).docs
    expect(offices.find((office) => office.city === 'Test City')).toMatchObject({
      country: 'South Africa',
      isHeadOffice: true,
      phone: '+27 00 000 0000',
      _status: 'published',
    })
    expect(
      offices
        .filter((office) => office._status === 'draft')
        .map((office) => office.name)
        .sort(),
    ).toEqual(['Jersey', 'Netherlands'])
    expect((await bySource('awards')).docs[0]).toMatchObject({
      title: 'Test Award',
      year: 2020,
      awardingBody: 'Example Awards',
      _status: 'draft',
    })
    const legal = (await bySource('legal-documents')).docs
    expect(legal).toHaveLength(1)
    expect(legal[0]).toMatchObject({ title: 'Test Disclaimer', _status: 'draft' })
    expect(legal[0].file).toBeTruthy()
    expect(report.leftBehind.join(' ')).toContain('factsheet.pdf')

    const markdown = reportMarkdown(report)
    expect(markdown).toContain('| /wp-test-first/ | /insights/wp-test-first/ |')
    expect(markdown).toContain('TODO-CONTENT')
    // Only the stub site was read.
    expect(requested.every((path) => path.startsWith('/wp-'))).toBe(true)
  })

  it('updates the same documents when run again, creating nothing new', async () => {
    const before = (await bySource('insights')).totalDocs + (await bySource('awards')).totalDocs
    const media = await payload.count({
      collection: 'media',
      where: { sourceUrl: { like: ORIGIN } },
    })
    const report = await run()
    expect(report.sections.insights).toMatchObject({ created: 0, updated: 2 })
    expect((await bySource('insights')).totalDocs + (await bySource('awards')).totalDocs).toBe(
      before,
    )
    expect(
      (await payload.count({ collection: 'media', where: { sourceUrl: { like: ORIGIN } } }))
        .totalDocs,
    ).toBe(media.totalDocs)
  })
})
