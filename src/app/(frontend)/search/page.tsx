import type { Metadata } from 'next'
import NextLink from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { Section } from '@/components/Section'
import { routeMetadata } from '@/lib/metadata'
import { search } from '@/lib/search'

import { SearchForm } from './SearchForm'

type Props = { searchParams: Promise<{ q?: string | string[] }> }

// Search results are never indexed (brief §7).
export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata(false, { title: 'Search', path: '/search/', noindex: true })
}

const labels: Record<string, string> = {
  pages: 'Page',
  solutions: 'Solution',
  funds: 'Fund',
  projects: 'Project',
  people: 'Person',
  insights: 'Insight',
  research: 'Research',
  jobs: 'Vacancy',
  'legal-documents': 'Legal',
}

/** Site search (brief §7): per request, never indexed. */
export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
  const results = query ? await search(query) : []
  return (
    <>
      <Breadcrumbs items={[{ href: '/search/', label: 'Search' }]} />
      <PageHeader title="Search">
        <SearchForm defaultValue={query} />
      </PageHeader>
      {query && (
        <Section
          heading={`${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query}”`}
        >
          {results.length === 0 ? (
            <p className="text-ink-muted">Try different or fewer words.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border border-y border-border">
              {results.map((result) => (
                <li key={result.href} className="flex flex-col gap-1 py-4">
                  <p className="text-sm font-semibold text-brand">{labels[result.collection]}</p>
                  <h3 className="text-lg font-semibold">
                    <NextLink href={result.href} className="hover:underline">
                      {result.title}
                    </NextLink>
                  </h3>
                  {result.excerpt && <p className="text-ink-muted">{result.excerpt}</p>}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </>
  )
}
