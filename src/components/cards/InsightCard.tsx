import NextLink from 'next/link'

import { Media } from '@/components/Media'
import { formatDate, populated } from '@/lib/format'
import type { Insight } from '@/payload-types'

export function InsightCard({ insight }: { insight: Insight }) {
  const category = populated(insight.category)
  return (
    <li className="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-surface">
      <Media
        media={insight.heroImage}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-video h-auto w-full object-cover"
      />
      <div className="flex flex-col gap-2 p-6 pt-3">
        {category && <p className="text-sm font-semibold text-brand">{category.title}</p>}
        <h3 className="text-xl font-semibold">
          <NextLink href={`/insights/${insight.slug}/`} className="hover:underline">
            {insight.title}
          </NextLink>
        </h3>
        {insight.excerpt && <p className="text-ink-muted">{insight.excerpt}</p>}
        {insight.publishedAt && (
          <p className="text-sm text-ink-muted">
            <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
          </p>
        )}
      </div>
    </li>
  )
}
