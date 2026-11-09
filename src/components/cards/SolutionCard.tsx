import NextLink from 'next/link'

import { Media } from '@/components/Media'
import type { Solution } from '@/payload-types'

/** An image-led card after apollo.com (decision "Apollo-style theme"); the title is the link. */
export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <li className="group relative flex flex-col gap-4">
      <div className="overflow-hidden rounded-[10px] bg-surface-muted">
        <Media
          media={solution.heroImage}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="text-2xl leading-tight">
        <NextLink
          href={`/solutions/${solution.slug}/`}
          className="underline-offset-4 after:absolute after:inset-0 group-hover:underline"
        >
          {solution.title}
        </NextLink>
      </h3>
      {solution.summary && <p className="text-ink-muted">{solution.summary}</p>}
    </li>
  )
}
