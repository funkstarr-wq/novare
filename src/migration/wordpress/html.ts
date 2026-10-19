import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { RichTextField } from 'payload'

/**
 * Old-site HTML → the rich text editors here (brief §11). The HTML is cleaned first (page-builder
 * wrappers, scripts, styles, images, embeds and shortcodes go), then converted with Payload's
 * own converter, and the result is held to the same subset editors get: paragraphs, h2–h4,
 * lists, quotes, links, bold and italic.
 */
const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&#8217;': '’',
  '&#8216;': '‘',
  '&#8220;': '“',
  '&#8221;': '”',
  '&#8211;': '–',
  '&#8212;': '—',
  '&#8230;': '…',
  '&nbsp;': ' ',
}

/** Plain text from WordPress's rendered HTML (titles, excerpts). */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(
      /&#?[a-z0-9]+;/gi,
      (entity) =>
        ENTITIES[entity] ??
        (/^&#\d+;$/.test(entity) ? String.fromCodePoint(Number(entity.slice(2, -1))) : entity),
    )
    .replace(/\s+/g, ' ')
    .trim()
}

/** Strips everything the editors here cannot hold, keeping the article's text and structure. */
export function cleanHtml(html: string): string {
  return (
    html
      // Scripts, styles, embeds, forms and media are not article text.
      .replace(
        /<(script|style|noscript|iframe|object|form|svg|video|audio)\b[^>]*>[\s\S]*?<\/\1>/gi,
        '',
      )
      .replace(/<(img|source|input|hr|embed)\b[^>]*\/?>/gi, '')
      .replace(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi, '')
      // WordPress shortcodes such as [caption] or [fl_builder_insert_layout].
      .replace(/\[\/?[a-z_][\w-]*(?:\s[^\]]*)?\]/gi, '')
      // Page-builder wrappers carry no meaning; keep their content.
      .replace(/<\/?(div|section|span|article|header|footer|main|aside|font|center)\b[^>]*>/gi, '')
      // Headings: the page title is the only h1; nothing below h4.
      .replace(/<(\/?)h1\b[^>]*>/gi, '<$1h2>')
      .replace(/<(\/?)h[56]\b[^>]*>/gi, '<$1h4>')
      // Attributes other than a link's href.
      .replace(/<(?!a\b)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/gi, '<$1$2>')
      .replace(/<a\b[^>]*?href="([^"]*)"[^>]*>/gi, '<a href="$1">')
      // Empty paragraphs and leftover whitespace.
      .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

type Node = { type?: string; tag?: string; format?: number | string; children?: Node[] }
const ALLOWED = new Set([
  'root',
  'paragraph',
  'heading',
  'list',
  'listitem',
  'quote',
  'text',
  'link',
  'linebreak',
  'autolink',
])
const BOLD_ITALIC = 1 | 2

/** Drops nodes outside the subset (keeping their text) and formatting beyond bold and italic. */
function sanitize(nodes: Node[]): Node[] {
  return nodes.flatMap((node) => {
    if (node.type && !ALLOWED.has(node.type)) return node.children ? sanitize(node.children) : []
    const copy = { ...node }
    if (copy.type === 'text' && typeof copy.format === 'number') copy.format &= BOLD_ITALIC
    if (copy.children) copy.children = sanitize(copy.children)
    return [copy]
  })
}

export function htmlToLexical(html: string, field: RichTextField) {
  const state = convertHTMLToLexical({
    editorConfig: editorConfigFactory.fromField({ field }),
    html: cleanHtml(html),
    JSDOM,
  })
  const root = state.root as unknown as Node
  root.children = sanitize(root.children ?? []).filter(
    (node) => node.type !== 'paragraph' || (node.children?.length ?? 0) > 0,
  )
  return state
}
