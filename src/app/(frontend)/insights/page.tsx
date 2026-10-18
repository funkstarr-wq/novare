import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { InsightCard } from '@/components/cards/InsightCard'
import { PageHero } from '@/components/PageHeader'
import { opensWithHero, RenderBlocks } from '@/components/RenderBlocks'
import { Section } from '@/components/Section'
import { routeMetadata } from '@/lib/metadata'
import { getPageByPath, listInsights } from '@/lib/queries'
import { absoluteURL } from '@/lib/site'

type Props = { searchParams: Promise<{ page?: string }> }

// Reads `?page=`, so it renders per request; the queries behind it are cached.
const pageHref = (n: number) => (n === 1 ? '/insights/' : `/insights/?page=${n}`)

const parsePage = (value: string | undefined) => {
  if (value === undefined) return 1
  return /^[1-9]\d*$/.test(value) ? Number(value) : null
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const page = await getPageByPath(draft, '/insights/')
  const number = parsePage((await searchParams).page) ?? 1
  const title = page?.title || 'Insights'
  // Each page of the listing is its own canonical URL (`?page=2`), so every insight stays
  // reachable for crawlers; rel=prev/next are in the page body (hoisted to <head> by React).
  return routeMetadata(draft, {
    title: number > 1 ? `${title} (page ${number})` : title,
    path: pageHref(number),
    meta: number > 1 ? { ...page?.meta, title: null } : page?.meta,
    description: page?.hero?.subheading,
  })
}

export default async function InsightsPage({ searchParams }: Props) {
  const number = parsePage((await searchParams).page)
  if (!number) notFound()
  const { isEnabled: draft } = await draftMode()
  const [page, insights] = await Promise.all([
    getPageByPath(draft, '/insights/'),
    listInsights(draft, { page: number }),
  ])
  if (number > Math.max(1, insights.totalPages)) notFound()
  const title = page?.title ?? 'Insights'
  const heroTitle = opensWithHero(page?.layout)

  return (
    <>
      {number > 1 && <link rel="prev" href={absoluteURL(pageHref(number - 1))} />}
      {number < insights.totalPages && <link rel="next" href={absoluteURL(pageHref(number + 1))} />}
      <Breadcrumbs items={[{ href: '/insights/', label: title }]} />
      {!heroTitle && <PageHero page={page} title={title} />}
      {number === 1 && <RenderBlocks blocks={page?.layout} draft={draft} hasTitle={!heroTitle} />}
      <Section heading={number === 1 ? 'Latest insights' : `Page ${number}`}>
        {insights.docs.length === 0 ? (
          <p className="text-ink-muted">No insights have been published yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.docs.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </ul>
        )}
        {insights.totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
            {number > 1 ? (
              <NextLink href={pageHref(number - 1)} rel="prev" className="text-brand underline">
                Newer insights
              </NextLink>
            ) : (
              <span />
            )}
            <p className="text-ink-muted">
              Page {number} of {insights.totalPages}
            </p>
            {number < insights.totalPages ? (
              <NextLink href={pageHref(number + 1)} rel="next" className="text-brand underline">
                Older insights
              </NextLink>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Section>
    </>
  )
}
