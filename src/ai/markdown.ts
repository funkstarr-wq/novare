import {
  convertLexicalToMarkdown,
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'
import type { RichTextField } from 'payload'

/**
 * Rich text for the AI editor (brief §10.4): the assistant writes a small Markdown subset
 * (paragraphs, ## to #### headings, lists, links, bold and italic) and the server converts it to
 * Lexical with Payload's own converter. Anything outside the subset is rejected, never passed
 * through, so the assistant cannot write raw HTML, images, code or tables.
 */
export const MAX_MARKDOWN = 20_000

const LINE_RULES: [RegExp, string][] = [
  [/^\s{0,3}#(?!#)/, 'Use ## to #### for headings; the page title is the only h1.'],
  [/^\s{0,3}#{5,}/, 'Headings go down to #### only.'],
  [/^\s*>/, 'Quotes are not allowed.'],
  [/^\s*(```|~~~)/, 'Code blocks are not allowed.'],
  [/^\s*\|.*\|\s*$/, 'Tables are not allowed.'],
  [/^\s*([-*_])(\s*\1){2,}\s*$/, 'Horizontal rules are not allowed.'],
  [/^(\t| {4,})(?!\s*([-*]|\d+\.)\s)/, 'Indented code is not allowed.'],
]

const INLINE_RULES: [RegExp, string][] = [
  [/!\[/, 'Images are not allowed in rich text; use set_media.'],
  [/<\/?[a-z!][^>]*>/i, 'HTML is not allowed.'],
  [/`/, 'Inline code is not allowed.'],
  [/~~/, 'Strikethrough is not allowed.'],
]

const LINK = /\[([^\]]*)\]\(([^)\s]*)(?:\s+"[^"]*")?\)/g
const SAFE_URL = /^(https?:\/\/[^\s]+|mailto:[^\s@]+@[^\s]+|\/(?![/\\])[^\s\\]*)$/i

/** Problems with a Markdown string, or an empty list when it is inside the subset. */
export function markdownProblems(markdown: string): string[] {
  const problems = new Set<string>()
  if (markdown.length > MAX_MARKDOWN)
    problems.add(`Keep rich text under ${MAX_MARKDOWN} characters.`)
  for (const line of markdown.split(/\r?\n/)) {
    for (const [rule, message] of LINE_RULES) if (rule.test(line)) problems.add(message)
    for (const [rule, message] of INLINE_RULES) if (rule.test(line)) problems.add(message)
    for (const [, , url] of line.matchAll(LINK)) {
      if (!SAFE_URL.test(url)) {
        problems.add(`Links must be https://…, mailto: or a site path starting with /: "${url}".`)
      }
    }
  }
  return [...problems]
}

type Node = { type?: string; tag?: string; format?: number | string; children?: Node[] }

const ALLOWED_NODES = new Set([
  'root',
  'paragraph',
  'heading',
  'list',
  'listitem',
  'text',
  'link',
  'linebreak',
])
const BOLD_ITALIC = 1 | 2

/** Checks the converted tree too, so nothing the converter adds slips outside the subset. */
function treeProblems(node: Node, problems: Set<string>) {
  if (node.type && !ALLOWED_NODES.has(node.type)) problems.add(`"${node.type}" is not allowed.`)
  if (node.type === 'heading' && !['h2', 'h3', 'h4'].includes(node.tag ?? '')) {
    problems.add('Use ## to #### for headings.')
  }
  if (node.type === 'text' && typeof node.format === 'number' && node.format & ~BOLD_ITALIC) {
    problems.add('Only bold and italic text formatting is allowed.')
  }
  for (const child of node.children ?? []) treeProblems(child, problems)
}

export class MarkdownError extends Error {}

const editorConfigs = new WeakMap<RichTextField, ReturnType<typeof editorConfigFactory.fromField>>()
const configFor = (field: RichTextField) => {
  let config = editorConfigs.get(field)
  if (!config) {
    config = editorConfigFactory.fromField({ field })
    editorConfigs.set(field, config)
  }
  return config
}

/** Markdown (the subset) → the Lexical document for one rich text field. Throws MarkdownError. */
export function markdownToLexical(markdown: string, field: RichTextField) {
  const problems = markdownProblems(markdown)
  if (problems.length) throw new MarkdownError(problems.join(' '))
  const state = convertMarkdownToLexical({ editorConfig: configFor(field), markdown })
  const found = new Set<string>()
  treeProblems(state.root as Node, found)
  if (found.size) throw new MarkdownError([...found].join(' '))
  return state
}

/** A stored Lexical document as Markdown, for the assistant to read. */
export function lexicalToMarkdown(value: unknown, field: RichTextField): string {
  if (!value || typeof value !== 'object' || !('root' in value)) return ''
  try {
    return convertLexicalToMarkdown({
      data: value as Parameters<typeof convertLexicalToMarkdown>[0]['data'],
      editorConfig: configFor(field),
    }).trim()
  } catch {
    return ''
  }
}
