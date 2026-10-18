import type { Metadata } from 'next'
import { draftMode } from 'next/headers'

import { buttonClass } from '@/components/CMSLink'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { hubCrumbs } from '@/lib/crumbs'
import { formatDate, populated, todayISO } from '@/lib/format'
import { getBySlug, getSiteSettings } from '@/lib/queries'
import { pathFor } from '@/lib/urls'
import type { Job } from '@/payload-types'
import { routeMetadata } from '@/lib/metadata'
import { redirectOrNotFound } from '@/lib/redirects'
import { JsonLd } from '@/components/JsonLd'
import * as jsonld from '@/lib/jsonld'

type Props = { params: Promise<{ slug: string }> }

// Hourly, so a vacancy shows as closed soon after its closing date.
export const revalidate = 3600
export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const job = await getBySlug(draft, 'jobs', (await params).slug)
  if (!job) return {}
  return routeMetadata(draft, { title: job.title, path: pathFor('jobs', job)!, meta: job.meta })
}

const contractTypes: Record<NonNullable<Job['contractType']>, string> = {
  permanent: 'Permanent',
  'fixed-term': 'Fixed term',
  contract: 'Contract',
  internship: 'Internship',
}

export default async function JobPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const { slug } = await params
  const [job, settings] = await Promise.all([
    getBySlug(draft, 'jobs', slug),
    getSiteSettings(draft),
  ])
  if (!job) return redirectOrNotFound(`/careers/${slug}/`)
  const office = populated(job.location)
  const closed = Boolean(job.closingDate && job.closingDate.slice(0, 10) < todayISO())
  const crumbs = await hubCrumbs(draft, [['/careers/', 'Careers']], {
    href: pathFor('jobs', job)!,
    label: job.title,
  })
  const facts: [string, null | string | undefined][] = [
    ['Location', office && `${office.city}, ${office.country}`],
    ['Department', job.department],
    ['Contract', job.contractType && contractTypes[job.contractType]],
    ['Closing date', formatDate(job.closingDate)],
  ]
  const apply = job.applyUrl || (job.applyEmail && `mailto:${job.applyEmail}`)
  return (
    <>
      {/* A closed vacancy is no longer a job offer: no JobPosting (Google's guidance). */}
      {!closed && <JsonLd data={[jsonld.jobPosting(job, settings)]} />}
      <Breadcrumbs items={crumbs} />
      <PageHeader title={job.title}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {facts
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-semibold">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
        </dl>
      </PageHeader>
      {closed && (
        <Section>
          <p role="status" className="rounded-lg bg-surface-muted p-4 font-semibold">
            Applications for this vacancy have closed.
          </p>
        </Section>
      )}
      {job.body && (
        <Section>
          <RichText data={job.body} />
        </Section>
      )}
      {!closed && apply && (
        <Section>
          <p>
            <a href={apply} className={buttonClass} rel={job.applyUrl ? 'noopener' : undefined}>
              Apply for this vacancy
            </a>
          </p>
        </Section>
      )}
    </>
  )
}
