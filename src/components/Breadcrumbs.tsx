import NextLink from 'next/link'

import { breadcrumbList } from '@/lib/jsonld'

import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href: string }

/**
 * The trail from home to the current page (brief §8.2), visible and as BreadcrumbList JSON-LD
 * (§8.3); the last item is the current page.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ label: 'Home', href: '/' }, ...items]
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-(--container-page) px-6 pt-6">
      <JsonLd data={[breadcrumbList(trail)]} />
      <ol className="flex flex-wrap gap-x-2 text-sm text-ink-muted">
        {trail.map((crumb, index) => {
          const current = index === trail.length - 1
          return (
            <li key={crumb.href} className="flex items-center gap-x-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {current ? (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              ) : (
                <NextLink href={crumb.href} className="underline-offset-2 hover:underline">
                  {crumb.label}
                </NextLink>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
