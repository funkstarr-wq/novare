import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

type Doc = Record<string, unknown> | null | undefined
export type Targets = { paths: string[]; tags: string[] }

const slugOf = (doc: Doc) => (typeof doc?.slug === 'string' && doc.slug ? doc.slug : null)
const each = (doc: Doc, path: (slug: string) => string) => {
  const slug = slugOf(doc)
  return slug ? [path(slug)] : []
}

/**
 * The single dependency map (brief §6.4): which URLs (routes from §7) and cache tags a change to
 * a document touches. Listings and blocks that show a collection (cards, team grids, office
 * lists) read it under the collection's tag, so one tag refreshes them all.
 */
const DEPENDENCIES: Record<string, (doc: Doc) => string[]> = {
  pages: (doc) => (typeof doc?.path === 'string' ? [doc.path] : []),
  solutions: (doc) => ['/', '/solutions/', ...each(doc, (s) => `/solutions/${s}/`)],
  funds: (doc) => [
    '/solutions/multi-management/',
    ...each(doc, (s) => `/solutions/multi-management/${s}/`),
  ],
  projects: (doc) => [
    '/solutions/real-estate/',
    ...each(doc, (s) => `/solutions/real-estate/${s}/`),
  ],
  people: (doc) => ['/about/leadership/', ...each(doc, (s) => `/about/leadership/${s}/`)],
  offices: (doc) => [
    '/locations/',
    ...(typeof doc?.countrySlug === 'string' && doc.countrySlug
      ? [`/locations/${doc.countrySlug}/`]
      : []),
  ],
  awards: () => ['/awards/'],
  jobs: (doc) => ['/careers/', ...each(doc, (s) => `/careers/${s}/`)],
  insights: (doc) => ['/', '/insights/', ...each(doc, (s) => `/insights/${s}/`)],
  categories: (doc) => ['/insights/', ...each(doc, (s) => `/insights/category/${s}/`)],
  'press-mentions': () => ['/news/in-the-press/'],
  research: (doc) => [
    '/research/hedge-fund-survey/',
    ...(typeof doc?.year === 'number' ? [`/research/hedge-fund-survey/${doc.year}/`] : []),
  ],
  'legal-documents': (doc) => each(doc, (s) => `/legal/${s}/`),
}

/**
 * Paths and tags to refresh after a change. The previous version counts too, so a renamed or
 * moved document's old URL stops serving stale content. The sitemap lists every public URL.
 */
export function revalidationTargets(collection: string, doc: Doc, previousDoc?: Doc): Targets {
  const pathsFor = DEPENDENCIES[collection] ?? (() => [])
  const paths = new Set([...pathsFor(doc), ...pathsFor(previousDoc), '/sitemap.xml'])
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
