import NextLink from 'next/link'

import { Section } from '@/components/Section'
import { formatDate, populated } from '@/lib/format'
import { fileURL, pathFor } from '@/lib/urls'
import type { Fund, FundFactsBlock } from '@/payload-types'

import type { SectionProps } from './types'

const investorTypes: Record<NonNullable<Fund['investorType']>, string> = {
  qualified: 'Qualified investors',
  retail: 'Retail investors',
}

/** The facts table of one fund; also used on the fund's own page. */
export function FundFactsTable({ fund }: { fund: Fund }) {
  const factsheet = populated(fund.factsheet)
  const rows: [string, React.ReactNode][] = [
    ['Strategy', fund.strategy],
    ['Inception date', formatDate(fund.inceptionDate)],
    ['Minimum investment', fund.minimumInvestment],
    ['Investor type', fund.investorType ? investorTypes[fund.investorType] : null],
    [
      'Factsheet',
      factsheet?.url ? (
        <a href={fileURL(factsheet.url)!} className="text-brand underline">
          {factsheet.title} (PDF)
        </a>
      ) : null,
    ],
  ]
  return (
    <table className="w-full max-w-(--container-prose) border-collapse text-left">
      <caption className="sr-only">Fund facts: {fund.name}</caption>
      <tbody>
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <tr key={label} className="border-b border-border">
              <th scope="row" className="py-3 pr-6 font-semibold">
                {label}
              </th>
              <td className="py-3">{value}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )
}

export function FundFacts({ block }: SectionProps<FundFactsBlock>) {
  const fund = populated(block.fund)
  if (!fund) return null
  const href = pathFor('funds', fund)
  return (
    <Section heading={fund.name}>
      <FundFactsTable fund={fund} />
      {href && (
        <p>
          <NextLink href={href} className="text-brand underline">
            More about {fund.name}
          </NextLink>
        </p>
      )}
    </Section>
  )
}
