import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { countryPath, pathFor } from '@/lib/urls'

type Doc = Record<string, unknown> | null | undefined
export type Targets = { paths: string[]; tags: string[] }

/** The document's own URL (src/lib/urls.ts), when it has one. */
const own = (collection: string) => (doc: Doc) => {
  const path = pathFor(collection, doc)
  return path ? [path] : []
}

/**
 * The single dependency map (brief §6.4): which URLs (routes from §7) a change to a document
 * touches, besides its own. Listings and blocks that show a collection (cards, team grids, office
 * lists) read it under the collection's cache tag, so one tag refreshes them all.
 */
const LISTINGS: Record<string, (doc: Doc) => string[]> = {
  pages: () => [],
  solutions: () => ['/', '/solutions/'],
  funds: () => ['/solutions/multi-management/'],
  projects: () => ['/solutions/real-estate/'],
  people: () => ['/about/leadership/'],
  offices: (doc) => [
    '/locations/',
    ...(typeof doc?.countrySlug === 'string' && doc.countrySlug
      ? [countryPath(doc.countrySlug)]
      : []),
  ],
  awards: () => ['/awards/'],
  jobs: () => ['/careers/'],
  insights: () => ['/', '/insights/'],
  categories: () => ['/insights/'],
  'press-mentions': () => ['/news/in-the-press/'],
  research: () => ['/research/hedge-fund-survey/'],
  'legal-documents': () => [],
}

const dependencies = (collection: string, doc: Doc) =>
  collection in LISTINGS ? [...(LISTINGS[collection]?.(doc) ?? []), ...own(collection)(doc)] : []

/**
 * Paths and tags to refresh after a change. The previous version counts too, so a renamed or
 * moved document's old URL stops serving stale content. The sitemap lists every public URL.
 */
export function revalidationTargets(collection: string, doc: Doc, previousDoc?: Doc): Targets {
  const paths = new Set([
    ...dependencies(collection, doc),
    ...dependencies(collection, previousDoc),
    '/sitemap.xml',
  ])
  return { paths: [...paths], tags: [collection] }
}

export async function revalidate(req: PayloadRequest, { paths, tags }: Targets) {
  if ((req.context as { disableRevalidate?: boolean }).disableRevalidate) return
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag, { expire: 0 })
    for (const path of paths) revalidatePath(path)
  } catch (error) {
    // Outside a Next.js server (scripts, tests) there is no cache to revalidate.
    req.payload.logger.debug({ err: error, msg: 'Revalidation skipped' })
  }
}

const touchesPublished = (doc: Doc, previousDoc: Doc) =>
  doc?._status === 'published' || previousDoc?._status === 'published'

export const revalidateAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  previousDoc,
  req,
}) => {
  if (touchesPublished(doc, previousDoc)) {
    await revalidate(req, revalidationTargets(collection.slug, doc, previousDoc))
  }
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  await revalidate(req, revalidationTargets(collection.slug, doc))
  return doc
}

/** Header, footer and site settings appear on every page: refresh the whole site layout. */
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, global, req }) => {
  if ((req.context as { disableRevalidate?: boolean }).disableRevalidate) return doc
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidateTag(global.slug, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch (error) {
    req.payload.logger.debug({ err: error, msg: 'Revalidation skipped' })
  }
  return doc
}
