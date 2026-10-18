import NextLink from 'next/link'

import type { Solution } from '@/payload-types'

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-6">
      <h3 className="text-xl font-semibold">
        <NextLink href={`/solutions/${solution.slug}/`} className="hover:underline">
          {solution.title}
        </NextLink>
      </h3>
      {solution.summary && <p className="text-ink-muted">{solution.summary}</p>}
    </li>
  )
}
