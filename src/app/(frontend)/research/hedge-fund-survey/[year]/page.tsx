import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { DocumentList } from '@/components/sections/DocumentDownloads'
import { hubCrumbs } from '@/lib/crumbs'
import { getResearchByYear } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

type Props = { params: Promise<{ year: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

const parseYear = (value: string) => (/^\d{4}$/.test(value) ? Number(value) : null)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const year = parseYear((await params).year)
  const { isEnabled: draft } = await draftMode()
  const survey = year ? await getResearchByYear(draft, year) : null
  if (!survey) return {}
  return {
    title: survey.meta?.title || survey.title,
    description: survey.meta?.description ?? survey.summary ?? undefined,
  }
}

export default async function SurveyPage({ params }: Props) {
  const year = parseYear((await params).year)
  const { isEnabled: draft } = await draftMode()
  const survey = year ? await getResearchByYear(draft, year) : null
  if (!survey) notFound()
  const crumbs = await hubCrumbs(draft, [['/research/hedge-fund-survey/', 'Hedge fund survey']], {
    href: pathFor('research', survey)!,
    label: String(survey.year),
  })
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={survey.title} intro={survey.summary} />
      {survey.keyFindings && survey.keyFindings.length > 0 && (
        <Section heading="Key findings">
          <ul className="flex max-w-(--container-prose) list-disc flex-col gap-2 pl-6">
            {survey.keyFindings.map((item, index) => (
              <li key={item.id ?? index}>{item.finding}</li>
            ))}
          </ul>
        </Section>
      )}
      {survey.report && (
        <Section heading="Full report">
          <DocumentList documents={[survey.report]} />
        </Section>
      )}
      {survey.body && (
        <Section>
          <RichText data={survey.body} />
        </Section>
      )}
    </>
  )
}
