import config from '@payload-config'
import { type CollectionSlug, getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { richText } from '@/lib/lexical'
import { runSeed } from '@/lib/seed'
import { findPublishedTodoContent } from '@/lib/todoContent'

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config })
  await runSeed(payload, {})
})

const contentCollections: CollectionSlug[] = [
  'pages',
  'solutions',
  'funds',
  'projects',
  'people',
  'offices',
  'awards',
  'jobs',
  'insights',
  'categories',
  'press-mentions',
  'research',
  'legal-documents',
]

describe('content collections', () => {
  it.each(contentCollections)(
    '%s has drafts, versions and seeded published content',
    async (slug) => {
      const collection = payload.collections[slug].config
      expect(collection.versions).toMatchObject({
        drafts: { autosave: expect.anything() },
        maxPerDoc: 50,
      })

      const published = await payload.count({
        collection: slug,
        where: { _status: { equals: 'published' } },
      })
      expect(published.totalDocs).toBeGreaterThan(0)
    },
  )

  it('keeps edits to a published document as a draft until they are published', async () => {
    const category = await payload.create({
      collection: 'categories',
      // No slug given: generating it is part of what this checks.
      data: { title: 'Draft flow check', _status: 'published' } as never,
    })
    expect(category.slug).toBe('draft-flow-check')

    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { description: 'Unpublished change' },
      draft: true,
    })
    const live = await payload.findByID({ collection: 'categories', id: category.id })
    const draft = await payload.findByID({ collection: 'categories', id: category.id, draft: true })
    expect(live.description).toBeFalsy()
    expect(draft.description).toBe('Unpublished change')

    const versions = await payload.findVersions({
      collection: 'categories',
      where: { parent: { equals: category.id } },
    })
    expect(versions.totalDocs).toBeGreaterThanOrEqual(2)

    await payload.delete({ collection: 'categories', id: category.id })
  })
})

describe('slugs', () => {
  it('rejects a slug outside ^[a-z0-9-]+$', async () => {
    const error = await payload
      .create({
        collection: 'categories',
        data: { title: 'Bad slug', slug: 'Bad Slug!', _status: 'published' },
      })
      .catch((caught: unknown) => caught)

    expect(JSON.stringify((error as { data?: unknown }).data)).toContain(
      'Use lowercase letters, numbers and hyphens only.',
    )
  })
})

describe('page paths', () => {
  it('nests under the parent and follows a parent slug change', async () => {
    const parent = await payload.create({
      collection: 'pages',
      data: { title: 'Path parent', _status: 'published' } as never,
    })
    const child = await payload.create({
      collection: 'pages',
      data: { title: 'Path child', parent: parent.id, _status: 'published' } as never,
    })
    expect(parent.path).toBe('/path-parent/')
    expect(child.path).toBe('/path-parent/path-child/')

    await payload.update({
      collection: 'pages',
      id: parent.id,
      data: { slug: 'renamed-parent', generateSlug: false },
    })
    const moved = await payload.findByID({ collection: 'pages', id: child.id })
    expect(moved.path).toBe('/renamed-parent/path-child/')

    await payload.delete({ collection: 'pages', id: child.id })
    await payload.delete({ collection: 'pages', id: parent.id })
  })

  it('gives blank drafts no path, so several can exist at once', async () => {
    // What the admin's autosave creates when someone opens "Create new page".
    const blank = () => payload.create({ collection: 'pages', data: {} as never, draft: true })
    const [first, second] = [await blank(), await blank()]
    expect(first.path ?? null).toBeNull()
    expect(second.path ?? null).toBeNull()

    await payload.delete({ collection: 'pages', id: first.id })
    await payload.delete({ collection: 'pages', id: second.id })
  })

  it('maps the top-level home page to /', async () => {
    const home = await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } } })
    expect(home.docs[0]?.path).toBe('/')
  })
})

describe('system collections', () => {
  it.each(['audit-log', 'ai-changesets'] as const)(
    '%s cannot be written through the API, even by an admin',
    async (collection) => {
      const admin = await payload.create({
        collection: 'users',
        data: {
          email: `${collection}-writer@example.test`,
          password: 'integration-only-password',
          name: 'Writer',
          roles: ['admin'],
        },
      })
      const data =
        collection === 'audit-log'
          ? {
              collection: 'pages',
              docId: '1',
              operation: 'update' as const,
              source: 'human' as const,
              timestamp: new Date().toISOString(),
            }
          : { prompt: 'p', user: admin.id, status: 'proposed' as const }

      await expect(
        payload.create({ collection, data: data as never, overrideAccess: false, user: admin }),
      ).rejects.toThrow(/not allowed/i)

      await payload.delete({ collection: 'users', id: admin.id })
    },
  )
})

describe('TODO-CONTENT check', () => {
  it('finds published placeholders and ignores drafts', async () => {
    const hits = await findPublishedTodoContent(payload)
    expect(hits.some((hit) => hit.collection === 'solutions')).toBe(true)

    const draft = await payload.create({
      collection: 'research',
      data: {
        title: 'Draft only',
        year: 2030,
        summary: 'TODO-CONTENT: unfinished',
        _status: 'draft',
      },
      draft: true,
    })
    const after = await findPublishedTodoContent(payload)
    expect(after.some((hit) => hit.collection === 'research' && hit.id === draft.id)).toBe(false)
    await payload.delete({ collection: 'research', id: draft.id })
  })

  it('reports nothing for a published document without placeholders', async () => {
    const clean = await payload.create({
      collection: 'categories',
      data: {
        title: 'Clean category',
        slug: 'clean-category',
        description: 'Finished copy.',
        _status: 'published',
      },
    })
    const hits = await findPublishedTodoContent(payload)
    expect(hits.some((hit) => hit.collection === 'categories' && hit.id === clean.id)).toBe(false)
    await payload.delete({ collection: 'categories', id: clean.id })
  })
})

describe('users', () => {
  it('creates later accounts as contributors by default', async () => {
    const first = await payload.create({
      collection: 'users',
      data: {
        email: 'first-account@example.test',
        password: 'integration-only-password',
        name: 'First',
        roles: ['editor'],
      },
    })
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'second-account@example.test',
        password: 'integration-only-password',
        name: 'Second',
      } as never, // no roles: the default is what this checks
    })
    expect(user.roles).toEqual(['contributor'])
    await payload.delete({ collection: 'users', id: user.id })
    await payload.delete({ collection: 'users', id: first.id })
  })

  it('stores rich text from the seed helper unchanged', async () => {
    const doc = await payload.create({
      collection: 'legal-documents',
      data: { title: 'Rich text round trip', body: richText('Hello'), _status: 'draft' },
      draft: true,
    })
    expect(JSON.stringify(doc.body)).toContain('"text":"Hello"')
    await payload.delete({ collection: 'legal-documents', id: doc.id })
  })
})
