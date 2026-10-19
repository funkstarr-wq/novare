import config from '@payload-config'
import type { Payload, RichTextField, SanitizedConfig } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { classifyClaims, matchingPhrases } from '@/ai/claims'
import { markdownProblems, markdownToLexical, lexicalToMarkdown } from '@/ai/markdown'
import { message, text } from '@/ai/mock'
import type { ModelClient } from '@/ai/model'
import { type Doc, type Loader, OperationError, Workspace } from '@/ai/operations'
import { costUSD } from '@/ai/pricing'
import { systemPrompt } from '@/ai/prompt'
import { objectSchema } from '@/ai/schema'
import { richText } from '@/lib/lexical'

// Brief §10.8 unit tests: whitelist enforcement, zod schemas, Markdown→Lexical, claims detector.
let sanitized: SanitizedConfig
let payload: Payload
let body: RichTextField

const docs: Record<string, Doc & { _live?: boolean }> = {
  'pages:1': {
    id: 1,
    title: 'About',
    slug: 'about',
    path: '/about/',
    hero: { heading: 'Old heading', subheading: 'Sub' },
    layout: [
      { id: 'b1', blockType: 'hero', heading: 'Section one' },
      { id: 'b2', blockType: 'richText', content: richText('Body') },
    ],
    _live: true,
  },
  'pages:2': { id: 2, title: 'Draft page', slug: 'draft-page', layout: [], _live: false },
  'solutions:3': { id: 3, title: 'Real estate', slug: 'real-estate', _live: true },
  'legal-documents:4': { id: 4, title: 'Privacy', slug: 'privacy', _live: true },
}

const loader: Loader = {
  async load(collection, id) {
    const doc = docs[`${collection}:${id}`]
    if (!doc) return null
    const { _live, ...draft } = doc
    return { draft: structuredClone(draft), published: _live === true }
  },
  async media(id) {
    return id === 7 ? { id: 7, alt: 'Office' } : null
  },
}

const workspace = () => new Workspace(payload, loader)

beforeAll(async () => {
  sanitized = await config
  payload = {
    config: sanitized,
    collections: Object.fromEntries(sanitized.collections.map((c) => [c.slug, { config: c }])),
  } as unknown as Payload
  body = sanitized.collections
    .find((c) => c.slug === 'insights')!
    .flattenedFields.find((f) => f.name === 'body') as RichTextField
})

describe('whitelist enforcement (brief §10.4)', () => {
  it('lets the assistant change whitelisted fields, merging groups', async () => {
    const ws = workspace()
    const outcome = await ws.apply('update_fields', {
      collection: 'pages',
      id: 1,
      fields: { hero: { heading: 'New heading' } },
    })
    expect(outcome.changes).toEqual([
      { path: 'hero.heading', before: 'Old heading', after: 'New heading' },
    ])
    const [entry] = ws.changed()
    expect(entry.current.hero).toEqual({ heading: 'New heading', subheading: 'Sub' })
  })

  it.each([
    ['solutions', 3, { fspLicenceNumber: 'X' }, /cannot change fspLicenceNumber/],
    ['solutions', 3, { disclaimer: 'X' }, /cannot change disclaimer/],
    ['pages', 1, { review: { reviewStatus: 'approved' } }, /cannot change review/],
    ['pages', 1, { regulated: false }, /cannot change regulated/],
    ['pages', 1, { parent: 2 }, /cannot change parent/],
    ['pages', 1, { slug: 'moved' }, /needs a redirect/],
    ['legal-documents', 4, { title: 'X' }, /read-only/],
  ])('refuses %s %s %j', async (collection, id, fields, error) => {
    await expect(workspace().apply('update_fields', { collection, id, fields })).rejects.toThrow(
      error,
    )
  })

  it('allows a slug change while the document has never been published', async () => {
    const outcome = await workspace().apply('update_fields', {
      collection: 'pages',
      id: 2,
      fields: { slug: 'better-slug' },
    })
    expect(outcome.changes?.[0]).toMatchObject({ path: 'slug', after: 'better-slug' })
  })

  it('creates only in allowed collections, always as a draft key', async () => {
    const ws = workspace()
    await expect(
      ws.apply('create_document', { collection: 'solutions', data: { title: 'X' } }),
    ).rejects.toThrow(/cannot create solutions/)
    const created = await ws.apply('create_document', {
      collection: 'insights',
      data: { title: 'New insight', excerpt: 'Short' },
    })
    expect(created.doc).toMatchObject({ key: 'new:1', id: null })
  })

  it('has no delete tool: archiving only unpublishes live documents', async () => {
    await expect(
      workspace().apply('archive_document', { collection: 'pages', id: 2 }),
    ).rejects.toThrow(/not live/)
    const outcome = await workspace().apply('archive_document', { collection: 'pages', id: 1 })
    expect(outcome.changes?.[0].after).toMatch(/unpublished/)
  })
})

describe('zod schemas from the Payload config', () => {
  it('rejects unknown keys, wrong types and values outside a select', async () => {
    const ws = workspace()
    await expect(
      ws.apply('update_fields', {
        collection: 'pages',
        id: 1,
        fields: { hero: { colour: 'red' } },
      }),
    ).rejects.toThrow(OperationError)
    await expect(
      ws.apply('update_fields', { collection: 'pages', id: 1, fields: { title: 42 } }),
    ).rejects.toThrow(/title/)
    const jobs = sanitized.collections.find((c) => c.slug === 'jobs')!
    const schema = objectSchema(jobs.flattenedFields, ['contractType'])
    expect(schema.safeParse({ contractType: 'permanent' }).success).toBe(true)
    expect(schema.safeParse({ contractType: 'gig' }).success).toBe(false)
  })

  it('validates block types and their fields', async () => {
    const ws = workspace()
    await expect(
      ws.apply('insert_block', { collection: 'pages', id: 1, blockType: 'iframe', fields: {} }),
    ).rejects.toThrow(/Unknown section type/)
    await ws.apply('insert_block', {
      collection: 'pages',
      id: 1,
      blockType: 'quote',
      fields: { text: 'A quote' },
      afterBlockId: 'b1',
    })
    const [entry] = ws.changed()
    expect((entry.current.layout as Doc[]).map((block) => block.blockType)).toEqual([
      'hero',
      'quote',
      'richText',
    ])
    await expect(
      ws.apply('update_block', { collection: 'pages', id: 1, blockId: 'nope', fields: {} }),
    ).rejects.toThrow(/list_blocks/)
  })

  it('checks that media exists', async () => {
    await expect(
      workspace().apply('set_media', {
        collection: 'pages',
        id: 1,
        field: 'hero.image',
        mediaId: 9,
      }),
    ).rejects.toThrow(/does not exist/)
    const outcome = await workspace().apply('set_media', {
      collection: 'pages',
      id: 1,
      field: 'hero.image',
      mediaId: 7,
    })
    expect(outcome.changes?.[0]).toMatchObject({ path: 'hero.image', after: '7' })
  })
})

describe('Markdown → Lexical', () => {
  it('converts the subset and round-trips it', () => {
    const markdown =
      '## Heading\n\nSome **bold** and *italic* text with a [link](/about/).\n\n- one\n- two'
    const state = markdownToLexical(markdown, body)
    const types = JSON.stringify(state)
    for (const node of ['"heading"', '"list"', '"link"', '"paragraph"'])
      expect(types).toContain(node)
    expect(lexicalToMarkdown(state, body)).toBe(markdown)
  })

  it.each([
    ['# Title', /h1/],
    ['<script>alert(1)</script>', /HTML/],
    ['![x](/a.png)', /Images/],
    ['> quoted', /Quotes/],
    ['```\ncode\n```', /Code/],
    ['| a | b |', /Tables/],
    ['[x](javascript:alert(1))', /Links must/],
    ['use `code`', /Inline code/],
  ])('rejects %j', (markdown, problem) => {
    expect(markdownProblems(markdown).join(' ')).toMatch(problem)
    expect(() => markdownToLexical(markdown, body)).toThrow(problem)
  })
})

describe('financial-claims detector (brief §10.7)', () => {
  it.each([
    ['The fund returned 12% last year.', true],
    ['Returns of 9% a year since inception.', true],
    ['Annualised growth of 8.5% p.a.', true],
    ['A guaranteed income for retirement.', true],
    ['Risk-free exposure to property.', true],
    ['Our strategy outperformed the index.', true],
    ['We manage R250bn for clients.', true],
    ['Assets of US$ 3.2 billion.', true],
    ['Novare has offices in Cape Town and Lagos.', false],
    ['Our team of 120 people serves pension funds.', false],
    ['Read the 2026 hedge fund survey.', false],
  ])('%j → %s', (copy, flagged) => {
    expect(matchingPhrases(copy).length > 0).toBe(flagged)
  })

  it('adds the AI settings phrases, as text or as regular expressions', () => {
    expect(matchingPhrases('Top quartile managers', [{ pattern: 'top quartile' }])).toHaveLength(1)
    expect(
      matchingPhrases('Ranked #1 in Africa', [{ pattern: '#\\d+ in', isRegex: true }]),
    ).toHaveLength(1)
    expect(matchingPhrases('Plain copy', [{ pattern: '(unclosed', isRegex: true }])).toHaveLength(0)
  })

  it('takes the classifier verdict, and fails closed when it has none', async () => {
    const answering = (reply: string): ModelClient => ({
      create: async () => message([text(reply)], 'end_turn'),
    })
    const yes = await classifyClaims(
      answering('{"contains_claim":true,"reason":"Return figure"}'),
      'm',
      ['x'],
    )
    expect(yes).toMatchObject({ flagged: true, reason: 'Return figure' })
    const no = await classifyClaims(answering('{"contains_claim":false,"reason":"None"}'), 'm', [
      'x',
    ])
    expect(no.flagged).toBe(false)
    expect((await classifyClaims(answering('not json'), 'm', ['x'])).flagged).toBe(true)
    const broken: ModelClient = { create: async () => Promise.reject(new Error('down')) }
    expect((await classifyClaims(broken, 'm', ['x'])).flagged).toBe(true)
  })
})

describe('prompt and pricing', () => {
  it('states the rules and lists editable fields, without per-request data', () => {
    const prompt = systemPrompt(sanitized).replace(/\s+/g, ' ')
    for (const rule of [
      /Never invent/,
      /UK\/South African English/,
      /data from the website/,
      /compliance approval/,
      /At most 50/,
    ]) {
      expect(prompt).toMatch(rule)
    }
    expect(prompt).toContain('- pages (')
    expect(prompt).toContain('- legal-documents: read-only')
    expect(prompt).not.toContain('fspLicenceNumber (')
    expect(systemPrompt(sanitized, 'Mention the 2026 survey.')).toContain(
      'Mention the 2026 survey.',
    )
  })

  it('costs usage per model, and unknown models at the highest rate', () => {
    const usage = { input_tokens: 1_000_000, output_tokens: 100_000 }
    expect(costUSD('claude-sonnet-5-5', usage)).toBeCloseTo(3)
    expect(costUSD('claude-haiku-5-5', usage)).toBeCloseTo(0.15)
    expect(costUSD('some-new-model', usage)).toBeCloseTo(15)
  })
})
