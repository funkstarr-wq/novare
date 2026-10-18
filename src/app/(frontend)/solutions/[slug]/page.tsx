import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import NextLink from 'next/link'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { RenderBlocks } from '@/components/RenderBlocks'
import { Section } from '@/components/Section'
import { Disclaimer } from '@/components/sections/DisclaimerStrip'
import { DocumentList } from '@/components/sections/DocumentDownloads'
import { hubCrumbs } from '@/lib/crumbs'
import { populated } from '@/lib/format'
import { getBySlug, listFunds, listProjects } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const solution = await getBySlug(draft, 'solutions', (await params).slug)
  if (!solution) return {}
  return {
    title: solution.meta?.title || solution.title,
    description: solution.meta?.description ?? solution.summary ?? undefined,
  }
}

// Real-estate projects live under this solution's URL (brief §7).
const REAL_ESTATE = 'real-estate'

export default async function SolutionPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const solution = await getBySlug(draft, 'solutions', (await params).slug)
  if (!solution) notFound()
  const [funds, projects] = await Promise.all([
    listFunds(draft, solution.id),
    solution.slug === REAL_ESTATE ? listProjects(draft) : Promise.resolve([]),
  ])
  const contact = populated(solution.contactPerson)
  const crumbs = await hubCrumbs(draft, [['/solutions/', 'Solutions']], {
    href: pathFor('solutions', solution)!,
    label: solution.title,
  })
  const hasDisclaimerBlock = solution.layout?.some((block) => block.blockType === 'disclaimerStrip')

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={solution.title} intro={solution.summary} image={solution.heroImage}>
        {solution.externalUrl && (
          <p>
            <a href={solution.externalUrl} rel="noopener" className="text-brand underline">
              Visit the {solution.shortName || solution.title} website
            </a>
          </p>
        )}
      </PageHeader>
      {solution.keyFacts && solution.keyFacts.length > 0 && (
        <Section>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solution.keyFacts.map((fact, index) => (
              <div key={fact.id ?? index} className="flex flex-col-reverse gap-1">
                <dt className="text-ink-muted">{fact.label}</dt>
                <dd className="text-2xl font-semibold text-brand-strong">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}
      <RenderBlocks blocks={solution.layout} draft={draft} parent={solution} />
      {funds.length > 0 && (
        <Section heading="Funds">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {funds.map((fund) => (
              <li key={fund.id} className="flex flex-col gap-2 rounded-lg border border-border p-6">
                <h3 className="text-xl font-semibold">
                  <NextLink href={pathFor('funds', fund)!} className="hover:underline">
                    {fund.name}
                  </NextLink>
                </h3>
                {fund.summary && <p className="text-ink-muted">{fund.summary}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {projects.length > 0 && (
        <Section heading="Projects">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-6"
              >
                <h3 className="text-xl font-semibold">
                  <NextLink href={pathFor('projects', project)!} className="hover:underline">
                    {project.name}
                  </NextLink>
                </h3>
                <p className="text-ink-muted">
                  {[project.city, project.country].filter(Boolean).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {solution.documents && solution.documents.length > 0 && (
        <Section heading="Documents">
          <DocumentList documents={solution.documents} />
        </Section>
      )}
      {contact && (
        <Section heading="Contact">
          <p>
            <NextLink href={pathFor('people', contact)!} className="text-brand underline">
              {contact.name}
            </NextLink>
            {contact.role && `, ${contact.role}`}
          </p>
        </Section>
      )}
      {/* Every solution page ends with its disclaimer (brief §8.2). */}
      {!hasDisclaimerBlock && <Disclaimer content={solution.disclaimer} />}
    </>
  )
}
