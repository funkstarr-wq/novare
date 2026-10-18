import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Link } from '@/payload-types'
import { isSitePath, previewURL, secretMatches } from '@/lib/preview'
import { fileURL, linkHref, pathFor } from '@/lib/urls'

describe('pathFor (brief §7)', () => {
  it.each([
    ['pages', { path: '/about/history/' }, '/about/history/'],
    ['solutions', { slug: 'real-estate' }, '/solutions/real-estate/'],
    ['funds', { slug: 'a-fund' }, '/solutions/multi-management/a-fund/'],
    ['projects', { slug: 'a-project' }, '/solutions/real-estate/a-project/'],
    ['people', { slug: 'alex' }, '/about/leadership/alex/'],
    ['insights', { slug: 'note' }, '/insights/note/'],
    ['categories', { slug: 'macro' }, '/insights/category/macro/'],
    ['research', { year: 2025 }, '/research/hedge-fund-survey/2025/'],
    ['jobs', { slug: 'analyst' }, '/careers/analyst/'],
    ['legal-documents', { slug: 'privacy' }, '/legal/privacy/'],
  ])('%s → %s', (collection, doc, path) => {
    expect(pathFor(collection, doc)).toBe(path)
  })

  it('has no URL without a slug, or for collections without pages', () => {
    expect(pathFor('solutions', { slug: '' })).toBeNull()
    expect(pathFor('pages', {})).toBeNull()
    expect(pathFor('offices', { slug: 'cape-town' })).toBeNull()
  })
})

describe('linkHref', () => {
  it('resolves internal links through the target document', () => {
    const link = {
      type: 'internal',
      label: 'Funds',
      reference: { relationTo: 'solutions', value: { id: 1, slug: 'multi-management' } },
    } as unknown as Link
    expect(linkHref(link)).toBe('/solutions/multi-management/')
  })

  it('passes external URLs through and drops unresolved references', () => {
    expect(linkHref({ type: 'external', label: 'X', url: 'https://example.test/' })).toBe(
      'https://example.test/',
    )
    expect(
      linkHref({ type: 'internal', label: 'Gone', reference: { relationTo: 'pages', value: 7 } }),
    ).toBeNull()
  })
})

describe('preview helpers (brief §8.5)', () => {
  it('only redirects to paths on this site', () => {
    expect(isSitePath('/about/')).toBe(true)
    expect(isSitePath('/insights/?page=2')).toBe(true)
    for (const path of [
      '//evil.example/',
      '/\\evil.example',
      'https://evil.example/',
      'about/',
      '/a b/',
    ]) {
      expect(isSitePath(path), path).toBe(false)
    }
  })

  it('compares secrets exactly and never accepts a missing one', () => {
    expect(secretMatches('abc', 'abc')).toBe(true)
    expect(secretMatches('abd', 'abc')).toBe(false)
    expect(secretMatches('ab', 'abc')).toBe(false)
    expect(secretMatches('', undefined)).toBe(false)
  })

  it('builds the admin preview URL with the path', () => {
    expect(previewURL('/about/')).toContain('/api/preview/?')
    expect(new URL(previewURL('/about/'), 'http://x').searchParams.get('path')).toBe('/about/')
  })
})

describe('fileURL', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('turns Payload file URLs into plain same-site paths', () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://site.example.test')
    expect(fileURL('https://site.example.test/api/media/file/hero.png/')).toBe(
      '/api/media/file/hero.png',
    )
    expect(fileURL('/api/media/file/hero.png')).toBe('/api/media/file/hero.png')
    expect(fileURL('/api/documents/file/report.pdf/?download=1')).toBe(
      '/api/documents/file/report.pdf?download=1',
    )
  })

  it('leaves files on other hosts alone', () => {
    expect(fileURL('https://cdn.example.test/hero.png')).toBe('https://cdn.example.test/hero.png')
    expect(fileURL(null)).toBeNull()
  })
})
