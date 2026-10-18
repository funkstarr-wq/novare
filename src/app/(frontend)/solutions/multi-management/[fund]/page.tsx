import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { AwardItem } from '@/components/cards/AwardItem'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { Disclaimer } from '@/components/sections/DisclaimerStrip'
import { FundFactsTable } from '@/components/sections/FundFacts'
import { hubCrumbs } from '@/lib/crumbs'
import { populated } from '@/lib/format'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import { routeMetadata } from '@/lib/metadata'
import { redirectOrNotFound } from '@/lib/redirects'

type Props = { params: Promise<{ fund: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const fund = await getBySlug(draft, 'funds', (await params).fund)
  if (!fund) return {}
  return routeMetadata(draft, {
    title: fund.name,
    path: pathFor('funds', fund)!,
    meta: fund.meta,
    description: fund.summary,
  })
}

export default async function FundPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const { fund: slug } = await params
  const fund = await getBySlug(draft, 'funds', slug)
  if (!fund) return redirectOrNotFound(`/solutions/multi-management/${slug}/`)
  const solution = populated(fund.solution)
  const crumbs = await hubCrumbs(
    draft,
    [
      ['/solutions/', 'Solutions'],
      [
        pathFor('solutions', solution) ?? '/solutions/multi-management/',
        solution?.title ?? 'Multi-Management',
      ],
    ],
    { href: pathFor('funds', fund)!, label: fund.name },
  )
  const awards = (fund.awards ?? []).flatMap((award) => populated(award) ?? [])
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={fund.name} intro={fund.summary} />
      <Section heading="Fund facts">
        <FundFactsTable fund={fund} />
      </Section>
      {fund.body && (
        <Section>
          <RichText data={fund.body} />
        </Section>
      )}
      {awards.length > 0 && (
        <Section heading="Awards">
          <ul>
            {awards.map((award) => (
              <AwardItem key={award.id} award={award} />
            ))}
          </ul>
        </Section>
      )}
      <Disclaimer content={fund.disclaimer} />
    </>
  )
}
