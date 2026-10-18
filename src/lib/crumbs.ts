import type { Crumb } from '@/components/Breadcrumbs'

import { getPageByPath } from './queries'

/**
 * Breadcrumbs for a document under hub pages, e.g. `/about/` → `/about/leadership/` → a person.
 * Each hub's label is its page's title when the page exists, else the fallback given.
 */
export async function hubCrumbs(
  draft: boolean,
  hubs: [path: string, fallbackLabel: string][],
  current: Crumb,
): Promise<Crumb[]> {
  const pages = await Promise.all(hubs.map(([path]) => getPageByPath(draft, path)))
  return [
    ...hubs.map(([path, label], index) => ({ href: path, label: pages[index]?.title ?? label })),
    current,
  ]
}

/** A page's own trail from the nested-docs breadcrumbs (`/about/history` → `/about/history/`). */
export function pageCrumbs(
  breadcrumbs: { url?: null | string; label?: null | string }[] | null | undefined,
): Crumb[] {
  return (breadcrumbs ?? []).flatMap((crumb) =>
    crumb.url && crumb.label ? [{ href: `${crumb.url}/`, label: crumb.label }] : [],
  )
}
