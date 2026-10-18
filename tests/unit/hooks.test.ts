import { describe, expect, it } from 'vitest'

import { contentChanged } from '@/hooks/approvalGuard'
import { changedFields, summarise } from '@/hooks/audit'
import { revalidationTargets } from '@/hooks/revalidate'

describe('contentChanged', () => {
  const original = {
    id: 1,
    title: 'A',
    review: { reviewStatus: 'approved' },
    nested: { b: 1, a: 2 },
  }

  it('ignores bookkeeping and key order', () => {
    expect(
      contentChanged({ _status: 'published', review: {}, nested: { a: 2, b: 1 } }, original),
    ).toBe(false)
  })

  it('spots a real edit', () => {
    expect(contentChanged({ title: 'B' }, original)).toBe(true)
  })
})

describe('audit summaries', () => {
  it('lists changed fields, ignoring timestamps', () => {
    expect(changedFields({ title: 'A', updatedAt: '1' }, { title: 'B', updatedAt: '2' })).toEqual([
      'title',
    ])
    expect(summarise('publish', { title: 'A' }, { title: 'B', _status: 'published' })).toBe(
      'Published. Changed: title.',
    )
    expect(summarise('create', undefined, { title: 'A', _status: 'draft' })).toBe(
      'Created (draft).',
    )
  })
})

describe('revalidationTargets (brief §6.4)', () => {
  it('covers the document, its old URL, listings and the sitemap', () => {
    const { paths, tags } = revalidationTargets(
      'insights',
      { slug: 'new-title' },
      { slug: 'old-title' },
    )
    expect(paths).toEqual(
      expect.arrayContaining([
        '/insights/',
        '/insights/new-title/',
        '/insights/old-title/',
        '/sitemap.xml',
        '/',
      ]),
    )
    expect(tags).toEqual(['insights'])
  })

  it('uses the stored path for pages and the country page for offices', () => {
    expect(revalidationTargets('pages', { path: '/about/history/' }).paths).toContain(
      '/about/history/',
    )
    expect(revalidationTargets('offices', { countrySlug: 'kenya' }).paths).toContain(
      '/locations/kenya/',
    )
  })
})
