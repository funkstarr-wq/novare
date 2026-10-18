import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { type CollectionSlug, getPayload, type Where } from 'payload'

import type { Config } from '@/payload-types'

/**
 * Every read the public site makes. Published content is cached under the tags of the
 * collections it reads; `src/hooks/revalidate.ts` revalidates those tags (and the pages built
 * from them) on publish. Draft mode (live preview) reads the latest drafts and is never cached.
 *
 * Reads run with the public's access (`overrideAccess: false`, no user), so a draft or a hidden
 * document can't leak into a cached page, even through a relationship.
 */
export const payloadClient = () => getPayload({ config })

type Docs = Config['collections']

function cachedQuery<A extends unknown[], R>(
  key: string,
  tags: string[],
  run: (draft: boolean, ...args: A) => Promise<R>,
) {
  const published = unstable_cache((...args: A) => run(false, ...args), [key], { tags })
  return (draft: boolean, ...args: A): Promise<R> =>
    draft ? run(true, ...args) : published(...args)
}

const access = (draft: boolean) =>
  draft ? { draft: true, overrideAccess: true } : { draft: false, overrideAccess: false }

async function first<S extends CollectionSlug>(
  draft: boolean,
  collection: S,
  where: Where,
  depth = 2,
): Promise<Docs[S] | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection,
    where,
    depth,
    limit: 1,
    pagination: false,
    ...access(draft),
  })
  return (docs[0] as Docs[S] | undefined) ?? null
}

/**
 * Listings always show published documents, in draft mode too: a preview shows the document
 * being edited as a draft, and everything around it as it is live.
 */
async function list<S extends CollectionSlug>(
  _draft: boolean,
  collection: S,
  options: { where?: Where; sort?: string | string[]; limit?: number; depth?: number } = {},
): Promise<Docs[S][]> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection,
    where: options.where,
    sort: options.sort,
    depth: options.depth ?? 1,
    limit: options.limit ?? 100,
    pagination: false,
    ...access(false),
  })
  return docs as Docs[S][]
}

// --- Globals -------------------------------------------------------------------------------

export const getHeader = cachedQuery('header', ['header'], async (draft) => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'header', depth: 1, ...access(draft) })
})

export const getFooter = cachedQuery('footer', ['footer'], async (draft) => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'footer', depth: 1, ...access(draft) })
})

export const getSiteSettings = cachedQuery('site-settings', ['site-settings'], async (draft) => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1, ...access(draft) })
})

// --- Single documents ----------------------------------------------------------------------

export const getPageByPath = cachedQuery('page-by-path', ['pages'], (draft, path: string) =>
  first(draft, 'pages', { path: { equals: path } }),
)

type SlugCollection =
  | 'solutions'
  | 'funds'
  | 'projects'
  | 'people'
  | 'insights'
  | 'categories'
  | 'jobs'
  | 'legal-documents'

export const getBySlug = cachedQuery(
  'by-slug',
  // One tag per collection would be tighter, but the tag list is fixed per cached function.
  ['solutions', 'funds', 'projects', 'people', 'insights', 'categories', 'jobs', 'legal-documents'],
  <S extends SlugCollection>(draft: boolean, collection: S, slug: string) =>
    first(draft, collection, { slug: { equals: slug } }) as Promise<Docs[S] | null>,
) as <S extends SlugCollection>(
  draft: boolean,
  collection: S,
  slug: string,
) => Promise<Docs[S] | null>

export const getResearchByYear = cachedQuery(
  'research-by-year',
  ['research'],
  (draft, year: number) => first(draft, 'research', { year: { equals: year } }),
)

// --- Listings ------------------------------------------------------------------------------

export const listSolutions = cachedQuery('solutions', ['solutions'], (draft, ids?: number[]) =>
  list(draft, 'solutions', {
    where: ids ? { id: { in: ids } } : undefined,
    sort: ['order', 'title'],
  }),
)

export const listFunds = cachedQuery('funds', ['funds'], (draft, solutionId?: number) =>
  list(draft, 'funds', {
    where: solutionId ? { solution: { equals: solutionId } } : undefined,
    sort: 'name',
  }),
)

export const listProjects = cachedQuery('projects', ['projects'], (draft) =>
  list(draft, 'projects', { sort: 'name' }),
)

export const listPeople = cachedQuery(
  'people',
  ['people'],
  (draft, filter: { leadership: true } | { division: number }) =>
    list(draft, 'people', {
      where:
        'division' in filter
          ? { division: { equals: filter.division } }
          : { isLeadership: { equals: true } },
      sort: ['order', 'name'],
    }),
)

export const listOffices = cachedQuery('offices', ['offices'], (draft, countrySlug?: string) =>
  list(draft, 'offices', {
    where: countrySlug ? { countrySlug: { equals: countrySlug } } : undefined,
    sort: ['order', 'country', 'city'],
  }),
)

export const listAwards = cachedQuery(
  'awards',
  ['awards'],
  (draft, filter: { limit: number } | { fromYear?: number; toYear?: number }) =>
    list(draft, 'awards', {
      where:
        'limit' in filter
          ? undefined
          : {
              and: [
                ...(filter.fromYear ? [{ year: { greater_than_equal: filter.fromYear } }] : []),
                ...(filter.toYear ? [{ year: { less_than_equal: filter.toYear } }] : []),
              ],
            },
      sort: ['-year', 'title'],
      limit: 'limit' in filter ? filter.limit : 200,
    }),
)

export const listPress = cachedQuery('press', ['press-mentions'], (draft, limit: number) =>
  list(draft, 'press-mentions', { sort: '-publishedAt', limit }),
)

export const INSIGHTS_PER_PAGE = 12

/** Paginated insights, newest first. */
export const listInsights = cachedQuery(
  'insights',
  ['insights'],
  async (
    _draft,
    filter: { category?: number; solution?: number; limit?: number; page?: number } = {},
  ) => {
    const payload = await payloadClient()
    const where: Where[] = []
    if (filter.category) where.push({ category: { equals: filter.category } })
    if (filter.solution) where.push({ relatedSolutions: { in: [filter.solution] } })
    const result = await payload.find({
      collection: 'insights',
      where: { and: where },
      sort: '-publishedAt',
      depth: 1,
      limit: filter.limit ?? INSIGHTS_PER_PAGE,
      page: filter.page ?? 1,
      ...access(false),
    })
    return { docs: result.docs, page: result.page ?? 1, totalPages: result.totalPages }
  },
)

/** Open vacancies: no closing date, or one that has not passed. */
export const listJobs = cachedQuery('jobs', ['jobs'], (draft, today: string) =>
  list(draft, 'jobs', {
    where: {
      or: [{ closingDate: { exists: false } }, { closingDate: { greater_than_equal: today } }],
    },
    sort: ['closingDate', 'title'],
  }),
)

export const listResearch = cachedQuery('research', ['research'], (draft) =>
  list(draft, 'research', { sort: '-year' }),
)
