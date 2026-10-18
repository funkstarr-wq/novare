import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import type { Insight, Job, Office, Person, Research, SiteSetting, Solution } from '@/payload-types'

import { populated } from './format'
import { absoluteFileURL, absoluteURL, siteURL } from './site'
import { TODO_MARKER } from './todoContent'
import { countryPath, pathFor } from './urls'

/**
 * Structured data (brief §8.3), one builder per schema.org type. Builders return plain objects;
 * `JsonLd` adds `@context` and renders them. Placeholder values (`TODO-CONTENT`) are dropped, so
 * unfinished content never reaches search engines as fact.
 */
export type Thing = { '@type': string } & Record<string, unknown>

const orgId = () => `${siteURL()}/#organization`
const organizationRef = () => ({ '@id': orgId() })

/** Drops empty values and placeholders, recursively. */
export function clean<T>(value: T): T | undefined {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'string') return value.includes(TODO_MARKER) ? undefined : value
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((item) => item !== undefined)
    return (items.length ? items : undefined) as T | undefined
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).flatMap(([key, item]) => {
      const cleaned = clean(item)
      return cleaned === undefined ? [] : [[key, cleaned]]
    })
    return (entries.length ? Object.fromEntries(entries) : undefined) as T | undefined
  }
  return value
}

const text = (data: SerializedEditorState | null | undefined) =>
  data ? convertLexicalToPlaintext({ data }).trim() : undefined

const date = (value: null | string | undefined) => (value ? value.slice(0, 10) : undefined)

export function organization(settings: SiteSetting): Thing {
  const logo = populated(settings.logo)
  return {
    '@type': 'Organization',
    '@id': orgId(),
    name: settings.organisationName,
    legalName: settings.organization?.legalName,
    url: `${siteURL()}/`,
    logo: absoluteFileURL(logo?.url),
    foundingDate: settings.organization?.foundingYear
      ? String(settings.organization.foundingYear)
      : undefined,
    sameAs: settings.organization?.sameAs?.map((item) => item.url),
  }
}

export function website(settings: SiteSetting): Thing {
  return {
    '@type': 'WebSite',
    '@id': `${siteURL()}/#website`,
    url: `${siteURL()}/`,
    name: settings.organisationName,
    publisher: organizationRef(),
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteURL()}/search/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbList(trail: { label: string; href: string }[]): Thing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absoluteURL(crumb.href),
    })),
  }
}

export function financialService(solution: Solution): Thing {
  return {
    '@type': 'FinancialService',
    name: solution.title,
    description: solution.summary,
    url: absoluteURL(pathFor('solutions', solution) ?? '/'),
    image: absoluteFileURL(populated(solution.heroImage)?.url),
    parentOrganization: organizationRef(),
  }
}

export function person(doc: Person): Thing {
  return {
    '@type': 'Person',
    name: doc.name,
    jobTitle: doc.role,
    url: absoluteURL(pathFor('people', doc) ?? '/'),
    image: absoluteFileURL(populated(doc.photo)?.url),
    sameAs: doc.linkedinUrl ? [doc.linkedinUrl] : undefined,
    worksFor: organizationRef(),
  }
}

export function article(insight: Insight): Thing {
  const author = populated(insight.author)
  const image = absoluteFileURL(populated(insight.heroImage)?.url)
  return {
    '@type': 'Article',
    headline: insight.title.slice(0, 110),
    description: insight.excerpt,
    image: image ? [image] : undefined,
    datePublished: insight.publishedAt ?? insight.createdAt,
    dateModified: insight.updatedAt,
    author: author
      ? { '@type': 'Person', name: author.name, url: absoluteURL(pathFor('people', author) ?? '/') }
      : organizationRef(),
    publisher: organizationRef(),
    mainEntityOfPage: absoluteURL(pathFor('insights', insight) ?? '/'),
  }
}

const postalAddress = (office: Office) => ({
  '@type': 'PostalAddress',
  streetAddress: office.addressLines?.map((item) => item.line).join(', '),
  addressLocality: office.city,
  postalCode: office.postcode,
  addressCountry: office.country,
})

/** An office: a FinancialService (a LocalBusiness) with its address, phone and position. */
export function office(doc: Office): Thing {
  const { latitude, longitude } = doc.geo ?? {}
  return {
    '@type': 'FinancialService',
    '@id': `${siteURL()}/#office-${doc.id}`,
    name: doc.name,
    url: doc.countrySlug ? absoluteURL(countryPath(doc.countrySlug)) : undefined,
    address: postalAddress(doc),
    telephone: doc.phone,
    email: doc.email,
    geo:
      typeof latitude === 'number' && typeof longitude === 'number'
        ? { '@type': 'GeoCoordinates', latitude, longitude }
        : undefined,
    openingHours: doc.openingHours,
    parentOrganization: organizationRef(),
  }
}

const employmentTypes: Record<NonNullable<Job['contractType']>, string> = {
  permanent: 'FULL_TIME',
  'fixed-term': 'TEMPORARY',
  contract: 'CONTRACTOR',
  internship: 'INTERN',
}

export function jobPosting(job: Job, settings: SiteSetting): Thing {
  const location = populated(job.location)
  return {
    '@type': 'JobPosting',
    title: job.title,
    description: text(job.body) || job.title,
    datePosted: date(job.createdAt),
    validThrough: job.closingDate ?? undefined,
    employmentType: job.contractType ? employmentTypes[job.contractType] : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: settings.organisationName,
      sameAs: `${siteURL()}/`,
      logo: absoluteFileURL(populated(settings.logo)?.url),
    },
    jobLocation: location ? { '@type': 'Place', address: postalAddress(location) } : undefined,
    url: absoluteURL(pathFor('jobs', job) ?? '/'),
  }
}

export function faqPage(items: { question: string; answer: SerializedEditorState }[]): Thing {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: text(item.answer) },
    })),
  }
}

export function report(survey: Research): Thing {
  return {
    '@type': 'Report',
    name: survey.title,
    description: survey.summary,
    datePublished: String(survey.year),
    url: absoluteURL(pathFor('research', survey) ?? '/'),
    publisher: organizationRef(),
  }
}

/** The JSON-LD document for one or more things, as the script tag's text. */
export function serialize(things: (Thing | null | undefined)[]): null | string {
  const graph = things.flatMap((thing) => clean(thing) ?? [])
  if (graph.length === 0) return null
  const data =
    graph.length === 1
      ? { '@context': 'https://schema.org', ...graph[0] }
      : { '@context': 'https://schema.org', '@graph': graph }
  // `<` escaped so a value can never close the script element.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
