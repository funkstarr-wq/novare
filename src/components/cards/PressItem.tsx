import { formatDate } from '@/lib/format'
import type { PressMention } from '@/payload-types'

/** A press mention links out to the publisher's article (brief §7). */
export function PressItem({ mention }: { mention: PressMention }) {
  return (
    <li className="flex flex-col gap-1 border-b border-border py-4">
      <p className="text-sm text-ink-muted">
        {mention.outlet}
        {mention.publishedAt && (
          <>
            {' · '}
            <time dateTime={mention.publishedAt}>{formatDate(mention.publishedAt)}</time>
          </>
        )}
      </p>
      <h3 className="text-lg font-semibold">
        <a href={mention.url} rel="noopener" className="hover:underline">
          {mention.headline}
          <span className="sr-only"> (on {mention.outlet})</span>
        </a>
      </h3>
      {mention.excerpt && <p className="text-ink-muted">{mention.excerpt}</p>}
    </li>
  )
}
