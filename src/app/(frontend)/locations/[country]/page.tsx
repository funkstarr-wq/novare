import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { OfficeCard } from '@/components/cards/OfficeCard'
import { PageHeader } from '@/components/PageHeader'
import { Section } from '@/components/Section'
import { hubCrumbs } from '@/lib/crumbs'
import { listOffices } from '@/lib/queries'
import { countryPath } from '@/lib/urls'

type Props = { params: Promise<{ country: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const offices = await listOffices(draft, (await params).country)
  if (offices.length === 0) return {}
  return { title: `Offices in ${offices[0].country}` }
}

/** All offices in one country. LocalBusiness JSON-LD per office arrives with M4. */
export default async function CountryPage({ params }: Props) {
  const { country } = await params
  const { isEnabled: draft } = await draftMode()
  const offices = await listOffices(draft, country)
  if (offices.length === 0) notFound()
  const name = offices[0].country
  const crumbs = await hubCrumbs(draft, [['/locations/', 'Locations']], {
    href: countryPath(country),
    label: name,
  })
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <PageHeader title={`Offices in ${name}`} />
      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <OfficeCard key={office.id} office={office} />
          ))}
        </ul>
      </Section>
    </>
  )
}
