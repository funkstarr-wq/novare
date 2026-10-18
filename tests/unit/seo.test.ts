import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as jsonld from '@/lib/jsonld'
import { richText } from '@/lib/lexical'
import { pageMetadata } from '@/lib/seo'
import type { Insight, Job, Office, SiteSetting } from '@/payload-types'

const SITE = 'https://www.example.test'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SERVER_URL', SITE))
afterEach(() => vi.unstubAllEnvs())

const settings = {
  id: 1,
  organisationName: 'Novare',
  logo: { id: 1, alt: 'Logo', url: '/api/media/file/logo.png/', width: 200, height: 60 },
  organization: {
    legalName: 'TODO-CONTENT: legal name',
    sameAs: [{ url: 'https://www.linkedin.com/company/x' }],
  },
} as unknown as SiteSetting

const clean = (thing: jsonld.Thing) => JSON.parse(jsonld.serialize([thing])!)

// Required properties per Google's rich result documentation for each type (brief §13 M4).
describe('JSON-LD shapes', () => {
  it('Organization: name, url and logo, without placeholders', () => {
    const org = clean(jsonld.organization(settings))
    expect(org).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Novare',
      url: `${SITE}/`,
      logo: `${SITE}/api/media/file/logo.png`,
      sameAs: ['https://www.linkedin.com/company/x'],
    })
    expect(org).not.toHaveProperty('legalName')
  })

  it('WebSite with a SearchAction pointing at /search/', () => {
    expect(clean(jsonld.website(settings)).potentialAction).toEqual({
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/search/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    })
  })

  it('Article: headline, image, datePublished, dateModified and author', () => {
    const insight = {
      id: 1,
      title: 'Market commentary',
      slug: 'market-commentary',
      excerpt: 'Short',
      publishedAt: '2026-10-01T08:00:00.000Z',
      createdAt: '2026-09-30T08:00:00.000Z',
      updatedAt: '2026-10-02T08:00:00.000Z',
      heroImage: { id: 2, alt: 'x', url: `${SITE}/api/media/file/hero.png/` },
      author: { id: 3, name: 'Alex Example', slug: 'alex-example' },
    } as unknown as Insight
    expect(clean(jsonld.article(insight))).toMatchObject({
      '@type': 'Article',
      headline: 'Market commentary',
      image: [`${SITE}/api/media/file/hero.png`],
      datePublished: '2026-10-01T08:00:00.000Z',
      dateModified: '2026-10-02T08:00:00.000Z',
      author: {
        '@type': 'Person',
        name: 'Alex Example',
        url: `${SITE}/about/leadership/alex-example/`,
      },
      mainEntityOfPage: `${SITE}/insights/market-commentary/`,
    })
  })

  it('JobPosting: title, description, datePosted, hiringOrganization, jobLocation', () => {
    const office = {
      id: 4,
      name: 'Head office',
      city: 'Cape Town',
      country: 'South Africa',
      addressLines: [{ line: '1 Example Road' }],
    } as unknown as Office
    const job = {
      id: 5,
      title: 'Analyst',
      slug: 'analyst',
      body: richText('Work on research.'),
      createdAt: '2026-10-01T08:00:00.000Z',
      closingDate: '2026-11-30T00:00:00.000Z',
      contractType: 'permanent',
      location: office,
    } as unknown as Job
    expect(clean(jsonld.jobPosting(job, settings))).toMatchObject({
      '@type': 'JobPosting',
      title: 'Analyst',
      description: 'Work on research.',
      datePosted: '2026-10-01',
      validThrough: '2026-11-30T00:00:00.000Z',
      employmentType: 'FULL_TIME',
      hiringOrganization: { '@type': 'Organization', name: 'Novare', sameAs: `${SITE}/` },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1 Example Road',
          addressLocality: 'Cape Town',
          addressCountry: 'South Africa',
        },
      },
    })
  })

  it('FAQPage: every question with an accepted answer', () => {
    expect(
      clean(jsonld.faqPage([{ question: 'How do I invest?', answer: richText('Contact us.') }])),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I invest?',
          acceptedAnswer: { '@type': 'Answer', text: 'Contact us.' },
        },
      ],
    })
  })

  it('BreadcrumbList with absolute URLs in order', () => {
    expect(
      clean(
        jsonld.breadcrumbList([
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about/' },
        ]),
      ).itemListElement,
    ).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE}/about/` },
    ])
  })

  it('offices carry address, phone and coordinates', () => {
    const doc = {
      id: 9,
      name: 'Head office',
      city: 'Cape Town',
      country: 'South Africa',
      countrySlug: 'south-africa',
      phone: '+27 21 000 0000',
      geo: { latitude: -33.9, longitude: 18.4 },
    } as unknown as Office
    expect(clean(jsonld.office(doc))).toMatchObject({
      '@type': 'FinancialService',
      telephone: '+27 21 000 0000',
      url: `${SITE}/locations/south-africa/`,
      geo: { '@type': 'GeoCoordinates', latitude: -33.9, longitude: 18.4 },
    })
  })

  it('drops placeholders, combines several things into a graph and escapes <', () => {
    const json = jsonld.serialize([
      { '@type': 'Thing', name: 'TODO-CONTENT: name', description: '</script><script>x' },
      { '@type': 'Thing', name: 'Second' },
    ])!
    expect(json).not.toContain('</script>')
    const parsed = JSON.parse(json)
    expect(parsed['@graph']).toHaveLength(2)
    expect(parsed['@graph'][0]).not.toHaveProperty('name')
    expect(jsonld.serialize([null, undefined])).toBeNull()
  })
})

describe('pageMetadata (brief §8.3)', () => {
  const base = { title: 'About', path: '/about/' }

  it('gives an absolute canonical with a trailing slash, Open Graph and Twitter', () => {
    const meta = pageMetadata({ ...base, description: 'Who we are' })
    expect(meta.alternates?.canonical).toBe(`${SITE}/about/`)
    expect(meta.title).toBe('About')
    expect(meta.openGraph).toMatchObject({ url: `${SITE}/about/`, title: 'About | Novare' })
    expect(meta.twitter).toMatchObject({ card: 'summary', title: 'About | Novare' })
    expect(meta.robots).toEqual({ index: true, follow: true })
  })

  it('prefers the SEO tab, and falls back to the default share image', () => {
    const meta = pageMetadata({
      ...base,
      meta: { title: 'Our story', description: 'From the SEO tab' },
      defaultImage: {
        id: 1,
        alt: 'Share',
        url: '/api/media/file/og.png',
        width: 1200,
        height: 630,
      } as never,
    })
    expect(meta.title).toBe('Our story')
    expect(meta.description).toBe('From the SEO tab')
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [`${SITE}/api/media/file/og.png`],
    })
  })

  it('is noindex when asked, when the page hides itself, and off production', () => {
    expect(pageMetadata({ ...base, noindex: true }).robots).toEqual({ index: false, follow: true })
    expect(pageMetadata({ ...base, meta: { noindex: true } }).robots).toEqual({
      index: false,
      follow: true,
    })
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'staging')
    expect(pageMetadata(base).robots).toEqual({ index: false, follow: true })
    vi.stubEnv('RAILWAY_ENVIRONMENT_NAME', 'production')
    expect(pageMetadata(base).robots).toEqual({ index: true, follow: true })
  })
})
