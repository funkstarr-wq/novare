import NextLink from 'next/link'

import { OfficeCard } from '@/components/cards/OfficeCard'
import { Section } from '@/components/Section'
import { listOffices } from '@/lib/queries'
import { countryPath } from '@/lib/urls'
import type { Office, OfficeCardsBlock } from '@/payload-types'

import type { SectionProps } from './types'

/** Offices grouped by country, each group linking to its country page. */
export async function OfficeCards({ block, draft }: SectionProps<OfficeCardsBlock>) {
  const offices = await listOffices(
    draft,
    block.scope === 'country' ? (block.countrySlug ?? undefined) : undefined,
  )
  if (offices.length === 0) return null
  const byCountry = new Map<string, Office[]>()
  for (const office of offices) {
    byCountry.set(office.country, [...(byCountry.get(office.country) ?? []), office])
  }
  return (
    <Section heading={block.heading}>
      {[...byCountry].map(([country, group]) => (
        <div key={country} className="flex flex-col gap-4">
          {block.scope !== 'country' && (
            <h3 className="text-xl font-semibold">
              {group[0].countrySlug ? (
                <NextLink href={countryPath(group[0].countrySlug)} className="hover:underline">
                  {country}
                </NextLink>
              ) : (
                country
              )}
            </h3>
          )}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.map((office) => (
              <OfficeCard key={office.id} office={office} />
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}
