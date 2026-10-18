import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { InsightCard } from '@/components/cards/InsightCard'
import { PageHeader } from '@/components/PageHeader'
import { Section } from '@/components/Section'
import { hubCrumbs } from '@/lib/crumbs'
import { getBySlug, listInsights } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import { routeMetadata } from '@/lib/metadata'
import { redirectOrNotFound } from '@/lib/redirects'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const category = await getBySlug(draft, 'categories', (await params).slug)
  if (!category) return {}
  return routeMetadata(draft, {
    title: category.title,
    path: pathFor('categories', category)!,
    meta: category.meta,
    description: category.description,
  })
}

// The latest insights in the category; the full archive is the paginated /insights/ listing.
const CATEGORY_LIMIT = 48

export default async function CategoryPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const category = await getBySlug(draft, 'categories', slug)
  if (!category) return redirectOrNotFound(`/insights/category/${slug}/`)
  const { docs } = await listInsights(draft, { category: category.id, limit: CATEGORY_LIMIT })
  const crumbs = await hubCrumbs(draft, [['/insights/', 'Insights']], {
    href: pathFor('categories', category)!,
    label: category.title,
  })
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={category.title} intro={category.description} />
      <Section>
        {docs.length === 0 ? (
          <p className="text-ink-muted">Nothing has been published in this category yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
