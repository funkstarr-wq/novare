import NextLink from 'next/link'

import { Media } from '@/components/Media'
import { formatDate, populated } from '@/lib/format'
import type { Insight } from '@/payload-types'

/** An image-led card after apollo.com (decision "Apollo-style theme"); the title is the link. */
export function InsightCard({ insight }: { insight: Insight }) {
  const category = populated(insight.category)
  return (
    <li className="group relative flex flex-col gap-4">
      <div className="overflow-hidden rounded-[10px] bg-surface-muted">
        <Media
          media={insight.heroImage}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[3/2] h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap gap-x-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          {category && <span>{category.title}</span>}
          {insight.publishedAt && (
            <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
          )}
        </p>
        <h3 className="text-2xl leading-tight">
          <NextLink
            href={`/insights/${insight.slug}/`}
            className="underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {insight.title}
          </NextLink>
        </h3>
        {insight.excerpt && <p className="line-clamp-3 text-ink-muted">{insight.excerpt}</p>}
      </div>
    </li>
  )
}
