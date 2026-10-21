import { createHash } from 'node:crypto'

import type { CollectionSlug, Payload, RichTextField } from 'payload'

import { richText } from '@/lib/lexical'
import { slugify } from '@/lib/slugify'
import { pathFor } from '@/lib/urls'

import { type WpCategory, type WpMedia, type WpPost, WordPressClient } from './client'
import { htmlToLexical, plainText } from './html'
import { internalArticleSlugs, parseAwards, parseOffices, parsePressItems } from './parse'

/**
 * The WordPress import (brief §11). Reads the old site's public REST API and upserts by
 * `sourceUrl`, so it can run again at any time (for the final import before launch) without
 * duplicating anything. It never deletes. What it could not read reliably is imported as a draft
 * or with TODO-CONTENT, and listed in the report.
 *
 * Imported as published (the text is on the live site today): posts and article pages as
 * insights, press mentions, offices. As drafts, for review: awards (parsed from sentences),
 * the expired vacancy, Netherlands and Jersey offices, legal document pages (no text yet).
 */
const TODO = (what: string) => `TODO-CONTENT: ${what}`

/** Listing pages on the old site whose links lead to Novare's articles published as pages. */
const LISTING_PAGES = [
  'articles-news-and-blogs',
  'wealth-invest-insights',
  'insights-market-news',
  'insights-investment-management',
  'insights-wealth-management',
]
const LEGAL_PDF = /(disclaimer|conflict|paia|privacy|popi|terms|cookie)/i
const NEWS_CATEGORIES = new Set(['news', 'all-news'])
const JOB_CATEGORIES = new Set(['jobs'])
/** Offices the footer names without an address (brief §11). */
const ADDRESSLESS_OFFICES = ['Netherlands', 'Jersey']

type Status = 'created' | 'updated' | 'unchanged'
export type Section = { created: number; updated: number; unchanged: number; notes: string[] }
export type ImportReport = {
  source: string
  startedAt: string
  finishedAt?: string
  sections: Record<string, Section>
  todos: string[]
  urlMap: { from: string; to: string }[]
  leftBehind: string[]
}

type Options = {
  client?: WordPressClient
  log?: (line: string) => void
  /**
   * Overwrite documents imported earlier with the old site's current version. Off by default:
   * once editors have worked on the imported content (alt texts, awards, offices), a re-run only
   * adds what is new on the old site (decision M8 §2).
   */
  overwrite?: boolean
}

export async function importWordPress(
  payload: Payload,
  options: Options = {},
): Promise<ImportReport> {
  const client = options.client ?? new WordPressClient()
  const log = options.log ?? ((line: string) => payload.logger.info(`WordPress import: ${line}`))
  const origin = new URL(client.base).origin
  const report: ImportReport = {
    source: client.base,
    startedAt: new Date().toISOString(),
    sections: {},
    todos: [],
    urlMap: [],
    leftBehind: [],
  }
  const section = (name: string) =>
    (report.sections[name] ??= { created: 0, updated: 0, unchanged: 0, notes: [] })
  const count = (name: string, status: Status) => (section(name)[status] += 1)

  const richTextField = (collection: CollectionSlug, name: string) =>
    payload.collections[collection].config.flattenedFields.find(
      (field) => field.name === name,
    ) as RichTextField

  /** Creates the document imported from `sourceUrl`, or updates it when overwriting. */
  async function upsert(
    collection: CollectionSlug,
    sourceUrl: string,
    data: Record<string, unknown>,
    file?: { data: Buffer; mimetype: string; name: string },
  ): Promise<{ id: number; status: Status }> {
    const { docs } = await payload.find({
      collection,
      where: { sourceUrl: { equals: sourceUrl } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })
    const draft = data._status === 'draft'
    const payloadFile = file ? { ...file, size: file.data.length } : undefined
    if (docs[0] && !options.overwrite) return { id: docs[0].id as number, status: 'unchanged' }
    if (docs[0]) {
      // Files are not uploaded again: an existing upload keeps its file.
      const doc = await payload.update({
        collection,
        id: docs[0].id,
        data: data as never,
        overrideAccess: true,
        draft,
      })
      return { id: doc.id as number, status: 'updated' }
    }
    const doc = await payload.create({
      collection,
      data: { ...data, sourceUrl } as never,
      file: payloadFile,
      overrideAccess: true,
      draft,
    })
    return { id: doc.id as number, status: 'created' }
  }

  /** An image or PDF from the old site in media/documents, named after what it shows. */
  const uploaded = new Map<string, number>()
  async function upload(
    collection: 'documents' | 'media',
    url: string,
    name: string,
    data: Record<string, unknown>,
  ): Promise<number | null> {
    const known = uploaded.get(url)
    if (known) return known
    const existing = await payload.find({
      collection,
      where: { sourceUrl: { equals: url } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      uploaded.set(url, existing.docs[0].id)
      return existing.docs[0].id
    }
    try {
      const file = await client.file(url)
      const extension = new URL(url, client.base).pathname.split('.').pop()?.toLowerCase() ?? 'bin'
      const { id } = await upsert(collection, url, data, {
        data: file.data,
        mimetype: file.mimetype,
        name: `${slugify(name).slice(0, 80) || 'file'}.${extension}`,
      })
      count(collection, 'created')
      uploaded.set(url, id)
      return id
    } catch (error) {
      section(collection).notes.push(`Could not import ${url}: ${(error as Error).message}`)
      return null
    }
  }

  /** Alt text from WordPress, unless it is just a file name ("fa-nws", "IMG_0042"). */
  let missingAlt = 0
  const altText = (alt: string | undefined, context: string) => {
    const value = plainText(alt ?? '')
    if (value && /\s/.test(value)) return value
    missingAlt += 1
    return TODO(`alt text for the image of ${context}`)
  }

  /** The first image of an article on the old site, as its hero image (posts have no featured image). */
  async function firstImage(html: string, context: string): Promise<number | null> {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
      const src = /\bsrc="([^"]+)"/i.exec(tag)?.[1]
      if (!src || new URL(src, client.base).origin !== origin) continue
      const alt = /\balt="([^"]*)"/i.exec(tag)?.[1]
      return upload('media', new URL(src, client.base).toString(), context, {
        alt: altText(alt, context),
      })
    }
    return null
  }

  async function featuredImage(id: number | undefined, context: string): Promise<number | null> {
    if (!id) return null
    const media = await client.one<WpMedia>('media', id)
    if (!media?.source_url || !media.mime_type.startsWith('image/')) return null
    return upload('media', media.source_url, context, { alt: altText(media.alt_text, context) })
  }

  // --- Insights: posts and article pages ---------------------------------------------------

  log('reading posts, pages and categories')
  const [posts, pages, categories] = await Promise.all([
    client.all<WpPost>('posts'),
    client.all<WpPost>('pages'),
    client.all<WpCategory>('categories'),
  ])
  const categorySlug = new Map(categories.map((category) => [category.id, category.slug]))
  const inCategory = (post: WpPost, slugs: Set<string>) =>
    (post.categories ?? []).some((id) => slugs.has(categorySlug.get(id) ?? ''))

  let newsCategory: number | null = null
  if (posts.some((post) => inCategory(post, NEWS_CATEGORIES))) {
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'news' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    newsCategory =
      docs[0]?.id ??
      (
        await payload.create({
          collection: 'categories',
          data: { title: 'News', slug: 'news', _status: 'published' },
          overrideAccess: true,
        })
      ).id
  }

  const slugs = new Set(posts.map((post) => post.slug))
  const duplicate = (post: WpPost) =>
    /-\d+$/.test(post.slug) && slugs.has(post.slug.replace(/-\d+$/, ''))
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  const articlePages = [
    ...new Set(
      LISTING_PAGES.flatMap((slug) =>
        internalArticleSlugs(pageBySlug.get(slug)?.content.rendered ?? '', origin),
      ),
    ),
  ]
    .filter((slug) => !LISTING_PAGES.includes(slug) && pageBySlug.has(slug) && !slugs.has(slug))
    .map((slug) => pageBySlug.get(slug)!)

  const bodyField = richTextField('insights', 'body')
  const insightSources = [
    ...posts.filter((post) => !inCategory(post, JOB_CATEGORIES)),
    ...articlePages,
  ]
  for (const post of insightSources) {
    if (duplicate(post)) {
      section('insights').notes.push(
        `Skipped duplicate ${post.link} (same article as /${post.slug.replace(/-\d+$/, '')}/)`,
      )
      report.urlMap.push({
        from: new URL(post.link).pathname,
        to: `/insights/${post.slug.replace(/-\d+$/, '')}/`,
      })
      continue
    }
    const title = plainText(post.title.rendered)
    const data = {
      title,
      slug: post.slug,
      publishedAt: new Date(post.date).toISOString(),
      excerpt: excerptOf(post, title),
      body: htmlToLexical(withoutTitleHeading(post.content.rendered, title), bodyField),
      heroImage:
        (await featuredImage(post.featured_media, `"${title}"`)) ??
        (await firstImage(post.content.rendered, `"${title}"`)),
      category: inCategory(post, NEWS_CATEGORIES) ? newsCategory : null,
      _status: 'published',
    }
    const { status } = await upsert('insights', post.link, data)
    count('insights', status)
    report.urlMap.push({ from: new URL(post.link).pathname, to: pathFor('insights', data)! })
  }
  report.todos.push(
    'Authors of imported insights: the old site does not publish them; set each article’s author by hand',
  )
  const withImages = insightSources.filter(
    (post) => (post.content.rendered.match(/<img\b/gi) ?? []).length > 1,
  ).length
  if (withImages) {
    section('insights').notes.push(
      `${withImages} articles had more than one image: the first is the hero image; rich text here holds no images, so the others were left out`,
    )
  }
  const { created, updated, unchanged } = section('insights')
  log(`insights: ${created} created, ${updated} updated, ${unchanged} left as they were`)

  // --- Vacancies -----------------------------------------------------------------------------

  const jobBody = richTextField('jobs', 'body')
  for (const post of posts.filter((candidate) => inCategory(candidate, JOB_CATEGORIES))) {
    const data = {
      title: plainText(post.title.rendered),
      slug: post.slug,
      body: htmlToLexical(post.content.rendered, jobBody),
      // Posted in the past and almost certainly closed (brief §11): kept as a draft.
      _status: 'draft',
    }
    const { status } = await upsert('jobs', post.link, data)
    count('jobs', status)
    section('jobs').notes.push(
      `${data.title}: imported as a draft (posted ${post.date.slice(0, 10)})`,
    )
    report.urlMap.push({ from: new URL(post.link).pathname, to: '/careers/' })
  }

  // --- Press mentions ------------------------------------------------------------------------

  const press = parsePressItems(
    pageBySlug.get('articles-news-and-blogs')?.content.rendered ?? '',
    origin,
  )
  for (const item of press) {
    const thumbnail = item.imageUrl
      ? await upload('media', item.imageUrl, `${item.outlet} ${item.headline}`, {
          alt: altText(undefined, `the ${item.outlet} article "${item.headline}"`),
        })
      : null
    const { status } = await upsert('press-mentions', item.url, {
      headline: item.headline,
      outlet: item.outlet,
      url: item.url,
      thumbnail,
      // Not copied: the summary paraphrases the third party's article (brief §11).
      excerpt: null,
      _status: 'published',
    })
    count('press-mentions', status)
  }
  if (press.length) {
    report.todos.push('Publication dates of press mentions: not on the old site')
    report.todos.push(
      'Outlet names of press mentions are their domains (e.g. businesstech.co.za); edit if wanted',
    )
  }

  // --- Offices -------------------------------------------------------------------------------

  const home = pages.find((page) => new URL(page.link).pathname === '/')
  const offices = parseOffices(home?.content.rendered ?? '')
  for (const [index, office] of offices.entries()) {
    const { status } = await upsert(
      'offices',
      `${origin}/#our-presence/${slugify(`${office.country}-${office.city}`)}`,
      {
        name: office.city,
        country: office.country,
        city: office.city,
        addressLines: office.addressLines.map((line) => ({ line })),
        phone: office.phone,
        isHeadOffice: office.isHeadOffice,
        order: index,
        _status: 'published',
      },
    )
    count('offices', status)
  }
  for (const country of ADDRESSLESS_OFFICES) {
    const { status } = await upsert('offices', `${origin}/#footer/${slugify(country)}`, {
      name: country,
      country,
      city: TODO(`${country} office city`),
      addressLines: [{ line: TODO(`${country} office address`) }],
      _status: 'draft',
    })
    count('offices', status)
    report.todos.push(
      `${country} office: address, city and phone (listed on the old site without them)`,
    )
  }

  // --- Awards --------------------------------------------------------------------------------

  const awards = parseAwards(pageBySlug.get('awards')?.content.rendered ?? '')
  for (const award of awards) {
    if (!award.year) {
      section('awards').notes.push(`Skipped (no year found): ${award.description}`)
      continue
    }
    // Keyed by the whole sentence: two awards can share a title and a year.
    const key = createHash('sha256').update(award.description).digest('hex').slice(0, 16)
    const { status } = await upsert('awards', `${origin}/awards/#${award.year}-${key}`, {
      title: award.title,
      year: award.year,
      awardingBody: award.awardingBody,
      description: award.description,
      // Parsed from a sentence: an editor checks each one before publishing.
      _status: 'draft',
    })
    count('awards', status)
    if (!award.certain)
      report.todos.push(`Awarding body for the ${award.year} award "${award.title}"`)
  }

  // --- Legal documents -----------------------------------------------------------------------

  const pdfs = await client.all<WpMedia>('media', { mime_type: 'application/pdf' })
  const legalBody = richText(TODO('the HTML version of this document, from Novare'))
  for (const pdf of pdfs) {
    const title = humanTitle(plainText(pdf.title.rendered) || pdf.slug)
    if (!LEGAL_PDF.test(`${title} ${pdf.source_url}`)) {
      report.leftBehind.push(`${title} (${pdf.source_url})`)
      continue
    }
    const documentId = await upload('documents', pdf.source_url, title, { title, type: 'legal' })
    const { status } = await upsert('legal-documents', `${origin}/legal/${pdf.slug}`, {
      title,
      slug: slugify(title).slice(0, 80),
      body: legalBody,
      file: documentId,
      _status: 'draft',
    })
    count('legal-documents', status)
    report.todos.push(`${title}: the text of the legal page (the PDF is attached)`)
  }

  if (missingAlt) {
    report.todos.push(
      `Alt text for ${missingAlt} imported images (each says TODO-CONTENT; the old site had file names, not descriptions)`,
    )
  }
  report.finishedAt = new Date().toISOString()
  log('done')
  return report
}

/** Page articles open with their title as a heading; the page shows the title already. */
export function withoutTitleHeading(html: string, title: string): string {
  const first = /^\s*(?:<[^>]+>\s*)*?<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i.exec(html)
  const same = (value: string) => plainText(value).toLowerCase().replace(/\W+/g, '')
  return first && same(first[1]) === same(title)
    ? html.replace(first[0], (match) => match.replace(/<h[1-3]\b[\s\S]*$/i, ''))
    : html
}

/** WordPress's excerpt, without the trailing "[…]" or a repeated title at the start. */
export function excerptOf(post: { excerpt?: { rendered: string } }, title: string): string | null {
  let text = plainText(post.excerpt?.rendered ?? '').replace(/\s*\[…\]\s*$/, '')
  if (text.toLowerCase().startsWith(title.toLowerCase())) text = text.slice(title.length).trim()
  return text.slice(0, 500) || null
}

/** A PDF's file-name title as words: "PAIAManualDecember2014" → "PAIA Manual December 2014". */
export function humanTitle(fileTitle: string): string {
  return fileTitle
    .replace(/[-_]+/g, ' ')
    .replace(/FINAL\s*\d*$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d{4})\b/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

// --- Report ------------------------------------------------------------------------------

export function reportMarkdown(report: ImportReport): string {
  const lines = [
    '# WordPress migration report',
    '',
    `Source: ${report.source}. Run ${report.startedAt} to ${report.finishedAt ?? '(unfinished)'}.`,
    'Generated by `MIGRATION_REPORT=docs/migration-report.md pnpm import:wp` (brief §11). Re-running the',
    'import adds what is new and leaves imported documents as editors left them (unless',
    '`WORDPRESS_IMPORT_OVERWRITE=true`); it never deletes.',
    '',
    '## Imported',
    '',
    '| Collection | Created | Updated | Unchanged |',
    '| --- | ---: | ---: | ---: |',
    ...Object.entries(report.sections).map(
      ([name, counts]) =>
        `| ${name} | ${counts.created} | ${counts.updated} | ${counts.unchanged} |`,
    ),
    '',
  ]
  const notes = Object.entries(report.sections).flatMap(([name, counts]) =>
    counts.notes.map((note) => `- ${name}: ${note}`),
  )
  if (notes.length) lines.push('## Notes', '', ...notes, '')
  lines.push(
    '## For editors (TODO-CONTENT)',
    '',
    ...[...new Set(report.todos)].map((todo) => `- [ ] ${todo}`),
    '',
    '## Old URLs → new URLs',
    '',
    'For the redirects CSV at go-live (deferred, decision M7 §9).',
    '',
    '| Old | New |',
    '| --- | --- |',
    ...report.urlMap.map(({ from, to }) => `| ${from} | ${to} |`),
    '',
    `## Not imported (${report.leftBehind.length} PDFs)`,
    '',
    'Fund factsheets, application forms, surveys and brochures stay on the old site until Novare',
    'decides which belong on the new one (Documents and Research collections).',
    '',
    ...report.leftBehind.map((item) => `- ${item}`),
    '',
  )
  return lines.join('\n')
}
