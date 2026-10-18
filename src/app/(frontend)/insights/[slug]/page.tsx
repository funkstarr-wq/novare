import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import NextLink from 'next/link'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { hubCrumbs } from '@/lib/crumbs'
import { formatDate, populated } from '@/lib/format'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import { routeMetadata } from '@/lib/metadata'
import { redirectOrNotFound } from '@/lib/redirects'
import { JsonLd } from '@/components/JsonLd'
import * as jsonld from '@/lib/jsonld'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const insight = await getBySlug(draft, 'insights', (await params).slug)
  if (!insight) return {}
  return routeMetadata(draft, {
    title: insight.title,
    path: pathFor('insights', insight)!,
    meta: insight.meta,
    description: insight.excerpt,
    image: insight.heroImage,
    type: 'article',
  })
}

export default async function InsightPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const insight = await getBySlug(draft, 'insights', slug)
  if (!insight) return redirectOrNotFound(`/insights/${slug}/`)
  const category = populated(insight.category)
  const author = populated(insight.author)
  const solutions = (insight.relatedSolutions ?? []).flatMap((item) => populated(item) ?? [])
  const crumbs = await hubCrumbs(draft, [['/insights/', 'Insights']], {
    href: pathFor('insights', insight)!,
    label: insight.title,
  })
  return (
    <>
      <JsonLd data={[jsonld.article(insight)]} />
      <Breadcrumbs items={crumbs} />
      <article className="mx-auto flex w-full max-w-(--container-page) flex-col gap-6 px-6 py-10">
        <header className="flex max-w-(--container-prose) flex-col gap-4">
          {category && (
            <p>
              <NextLink
                href={pathFor('categories', category)!}
                className="font-semibold text-brand hover:underline"
              >
                {category.title}
              </NextLink>
            </p>
          )}
          <h1 className="text-3xl font-semibold text-brand-strong sm:text-4xl">{insight.title}</h1>
          {insight.excerpt && <p className="text-lg text-ink-muted">{insight.excerpt}</p>}
          <p className="text-sm text-ink-muted">
            {author && (
              <>
                By{' '}
                <NextLink href={pathFor('people', author)!} className="underline">
                  {author.name}
                </NextLink>
                {insight.publishedAt && ' · '}
              </>
            )}
            {insight.publishedAt && (
              <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
            )}
          </p>
        </header>
        <Media
          media={insight.heroImage}
          sizes="(min-width: 1280px) 80rem, 100vw"
          priority
          className="h-auto w-full rounded-lg"
        />
        <RichText data={insight.body} />
        {solutions.length > 0 && (
          <aside className="flex flex-col gap-2 border-t border-border pt-6">
            <h2 className="text-xl font-semibold">Related solutions</h2>
            <ul className="flex flex-wrap gap-4">
              {solutions.map((solution) => (
                <li key={solution.id}>
                  <NextLink href={pathFor('solutions', solution)!} className="text-brand underline">
                    {solution.title}
                  </NextLink>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
    </>
  )
}
