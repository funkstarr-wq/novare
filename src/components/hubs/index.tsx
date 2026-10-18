import NextLink from 'next/link'

import { AwardItem } from '@/components/cards/AwardItem'
import { PressItem } from '@/components/cards/PressItem'
import { Section } from '@/components/Section'
import { formatDate, populated, todayISO } from '@/lib/format'
import { listAwards, listJobs, listPress, listResearch } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

type HubProps = { draft: boolean }

async function JobsHub({ draft }: HubProps) {
  const jobs = await listJobs(draft, todayISO())
  return (
    <Section heading="Current vacancies">
      {jobs.length === 0 ? (
        <p className="text-ink-muted">There are no open vacancies at the moment.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {jobs.map((job) => {
            const office = populated(job.location)
            return (
              <li key={job.id} className="flex flex-col gap-1 py-4">
                <h3 className="text-lg font-semibold">
                  <NextLink href={pathFor('jobs', job)!} className="hover:underline">
                    {job.title}
                  </NextLink>
                </h3>
                <p className="text-ink-muted">
                  {[
                    job.department,
                    office?.city,
                    job.closingDate && `Closes ${formatDate(job.closingDate)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}

async function ResearchHub({ draft }: HubProps) {
  const surveys = await listResearch(draft)
  if (surveys.length === 0) return null
  return (
    <Section heading="Surveys by year">
      <ul className="flex flex-col gap-3">
        {surveys.map((survey) => (
          <li key={survey.id}>
            <NextLink href={pathFor('research', survey)!} className="text-lg text-brand underline">
              {survey.year}: {survey.title}
            </NextLink>
          </li>
        ))}
      </ul>
    </Section>
  )
}

async function AwardsHub({ draft }: HubProps) {
  const awards = await listAwards(draft, {})
  if (awards.length === 0) return null
  return (
    <Section>
      <ul>
        {awards.map((award) => (
          <AwardItem key={award.id} award={award} />
        ))}
      </ul>
    </Section>
  )
}

async function PressHub({ draft }: HubProps) {
  const mentions = await listPress(draft, 200)
  if (mentions.length === 0) return null
  return (
    <Section>
      <ul>
        {mentions.map((mention) => (
          <PressItem key={mention.id} mention={mention} />
        ))}
      </ul>
    </Section>
  )
}

/**
 * Listing pages (brief §7) whose content is a collection with no section block of its own. Each
 * renders below its `pages` document when there is one, or on its own with this title.
 */
export const HUBS: Record<
  string,
  { title: string; Component: (props: HubProps) => Promise<React.ReactNode> }
> = {
  '/careers/': { title: 'Careers', Component: JobsHub },
  '/research/hedge-fund-survey/': { title: 'Hedge fund survey', Component: ResearchHub },
  '/awards/': { title: 'Awards', Component: AwardsHub },
  '/news/in-the-press/': { title: 'In the press', Component: PressHub },
}
