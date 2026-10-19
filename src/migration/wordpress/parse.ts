import { plainText } from './html'

/**
 * Parsers for the old site's hand-built pages (brief §11): the press list on the articles page,
 * "Our Presence" on the home page and the awards list. They read only what the page says; where
 * a value cannot be read reliably it stays empty or TODO-CONTENT, and the import report lists it.
 */
const TODO = (what: string) => `TODO-CONTENT: ${what}`

// --- Press ---------------------------------------------------------------------------------

export type PressItem = { headline: string; url: string; outlet: string; imageUrl: string | null }

/** The outlet as its domain: `www.businesstech.co.za` → `businesstech.co.za`. */
export const outletOf = (url: string) => new URL(url).hostname.replace(/^www\./, '')

/**
 * Press mentions: each is a heading linking to an article on another site, usually after a
 * figure with its thumbnail. Links to the site itself are Novare's own articles, not press.
 * The summary paragraph is not imported: it paraphrases a third party's article (brief §11).
 */
export function parsePressItems(html: string, siteOrigin: string): PressItem[] {
  const items: PressItem[] = []
  const seen = new Set<string>()
  const pattern =
    /(?:<figure\b[^>]*>[\s\S]*?<img\b[^>]*\bsrc="([^"]+)"[\s\S]*?<\/figure>\s*)?<h[2-4]\b[^>]*>\s*<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  for (const [, image, url, title] of html.matchAll(pattern)) {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      continue
    }
    if (parsed.origin === siteOrigin || seen.has(url)) continue
    const headline = plainText(title)
    if (!headline) continue
    seen.add(url)
    items.push({ headline, url, outlet: outletOf(url), imageUrl: image ?? null })
  }
  return items
}

/** Links to the site's own pages from the articles page: Novare's articles published as pages. */
export function internalArticleSlugs(html: string, siteOrigin: string): string[] {
  const slugs = new Set<string>()
  for (const [, url] of html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)) {
    try {
      const parsed = new URL(url, siteOrigin)
      const slug = parsed.pathname.replace(/^\/|\/$/g, '')
      if (parsed.origin === siteOrigin && slug && !slug.includes('/') && !parsed.hash)
        slugs.add(slug)
    } catch {
      continue
    }
  }
  return [...slugs]
}

// --- Offices -------------------------------------------------------------------------------

export type ParsedOffice = {
  country: string
  city: string
  addressLines: string[]
  phone: string | null
  isHeadOffice: boolean
}

const titleCase = (value: string) =>
  value.toLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())

/** "Our Presence": `<h4>COUNTRY (City) [Head Office]</h4><p>line<br>line…<strong>Tel:</strong> …</p>`. */
export function parseOffices(html: string): ParsedOffice[] {
  const start = html.search(/Our Presence/i)
  if (start < 0) return []
  const section = html.slice(start)
  const offices: ParsedOffice[] = []
  for (const [, heading, body] of section.matchAll(
    /<h4\b[^>]*>([\s\S]*?)<\/h4>\s*<p\b[^>]*>([\s\S]*?)<\/p>/gi,
  )) {
    const title = plainText(heading)
    const match = /^(.+?)\s*\(([^)]+)\)\s*(head office)?/i.exec(title)
    if (!match) continue
    const [address, phonePart] = body.split(/<strong\b[^>]*>\s*Tel:?\s*<\/strong>|Tel:/i)
    const lines = address
      .split(/<br\s*\/?>/i)
      .map(plainText)
      .filter(Boolean)
    offices.push({
      country: titleCase(match[1].trim()),
      city: match[2].trim(),
      addressLines: lines,
      phone: phonePart ? plainText(phonePart) || null : null,
      isHeadOffice: Boolean(match[3]),
    })
  }
  return offices
}

// --- Awards --------------------------------------------------------------------------------

export type ParsedAward = {
  title: string
  year: number | null
  awardingBody: string
  description: string
  certain: boolean
}

/**
 * Each `<li>` on /awards/: the award's name in quotes, a year, and the awarding body after
 * "at the" or "in the". The full sentence is kept as the description, word for word.
 */
export function parseAwards(html: string): ParsedAward[] {
  const awards: ParsedAward[] = []
  for (const [, item] of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const description = plainText(item)
    const quoted = /[“"]([^”"]+)[”"]/.exec(description)
    if (!quoted) continue
    const title = quoted[1].trim()
    const years = [...description.matchAll(/\b(19|20)\d{2}\b/g)].map((year) => Number(year[0]))
    const short = /[’']\s?(\d{2})\b/.exec(description)
    const year = years.at(-1) ?? (short ? 2000 + Number(short[1]) : null)
    // The last "at the …" or "in the …" names the awards; the year and "ceremony" are trimmed.
    const rest = description.slice(quoted.index + quoted[0].length)
    const last = [...rest.matchAll(/\b(?:at|in) the\s+/gi)].at(-1)
    const phrase = last ? /^[^.,]+/.exec(rest.slice(last.index + last[0].length))?.[0] : undefined
    const body = phrase
      ?.replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\baward ceremony\b/i, '')
      .replace(/\s+(in|at|of)\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
    awards.push({
      title,
      year,
      awardingBody: body || TODO(`awarding body for "${title}"`),
      description,
      certain: Boolean(body && year),
    })
  }
  return awards
}
