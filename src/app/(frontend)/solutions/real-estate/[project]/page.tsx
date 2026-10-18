import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { hubCrumbs } from '@/lib/crumbs'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import type { Project } from '@/payload-types'

type Props = { params: Promise<{ project: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const project = await getBySlug(draft, 'projects', (await params).project)
  if (!project) return {}
  return {
    title: project.meta?.title || project.name,
    description: project.meta?.description ?? undefined,
  }
}

const types: Record<NonNullable<Project['type']>, string> = {
  retail: 'Retail',
  office: 'Office',
  'mixed-use': 'Mixed use',
  residential: 'Residential',
  industrial: 'Industrial',
}
const statuses: Record<NonNullable<Project['status']>, string> = {
  planning: 'Planning',
  'under-construction': 'Under construction',
  completed: 'Completed',
}

export default async function ProjectPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const project = await getBySlug(draft, 'projects', (await params).project)
  if (!project) notFound()
  const crumbs = await hubCrumbs(
    draft,
    [
      ['/solutions/', 'Solutions'],
      ['/solutions/real-estate/', 'Real Estate'],
    ],
    { href: pathFor('projects', project)!, label: project.name },
  )
  const facts: [string, null | string | undefined][] = [
    ['Location', [project.city, project.country].filter(Boolean).join(', ')],
    ['Type', project.type && types[project.type]],
    ['Status', project.status && statuses[project.status]],
    ['Size', project.sizeSqm ? `${project.sizeSqm.toLocaleString('en-ZA')} m²` : null],
    ['EDGE certified', project.edgeCertified ? 'Yes' : null],
  ]
  const gallery = (project.gallery ?? []).filter((item) => typeof item === 'object')
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={project.name} image={gallery[0]} />
      <Section heading="Project facts">
        <dl className="grid max-w-(--container-prose) grid-cols-[auto_1fr] gap-x-6 gap-y-3">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-semibold">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      </Section>
      {project.body && (
        <Section>
          <RichText data={project.body} />
        </Section>
      )}
      {gallery.length > 1 && (
        <Section heading="Gallery">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(1).map((image) => (
              <li key={typeof image === 'object' ? image.id : image}>
                <Media
                  media={image}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full rounded-lg"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}
