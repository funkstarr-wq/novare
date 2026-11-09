import type { Payload } from 'payload'

import type { AiCollection } from './whitelist'

/**
 * The document a site URL shows (the inverse of `pathFor` in src/lib/urls.ts), so the live AI bar
 * can tell the assistant which document "this page" is. Drafts count: the bar runs in draft mode.
 */
export type LocatedDocument = { collection: AiCollection; id: number; title: string }

const ROUTES: [RegExp, AiCollection, 'slug' | 'year'][] = [
  [/^\/solutions\/multi-management\/([^/]+)\/$/, 'funds', 'slug'],
  [/^\/solutions\/real-estate\/([^/]+)\/$/, 'projects', 'slug'],
  [/^\/solutions\/([^/]+)\/$/, 'solutions', 'slug'],
  [/^\/insights\/category\/([^/]+)\/$/, 'categories', 'slug'],
  [/^\/insights\/([^/]+)\/$/, 'insights', 'slug'],
  [/^\/about\/leadership\/([^/]+)\/$/, 'people', 'slug'],
  [/^\/careers\/([^/]+)\/$/, 'jobs', 'slug'],
  [/^\/legal\/([^/]+)\/$/, 'legal-documents', 'slug'],
  [/^\/research\/hedge-fund-survey\/(\d{4})\/$/, 'research', 'year'],
]

const titleOf = (doc: Record<string, unknown>) =>
  String(doc.title ?? doc.name ?? doc.headline ?? doc.year ?? doc.id)

async function first(payload: Payload, collection: AiCollection, field: string, value: unknown) {
  const { docs } = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const doc = docs[0] as unknown as Record<string, unknown> | undefined
  return doc ? { collection, id: doc.id as number, title: titleOf(doc) } : null
}

export async function documentForPath(
  payload: Payload,
  rawPath: string,
): Promise<LocatedDocument | null> {
  const path = rawPath.endsWith('/') ? rawPath : `${rawPath}/`
  for (const [pattern, collection, key] of ROUTES) {
    const match = pattern.exec(path)
    if (!match) continue
    const located = await first(
      payload,
      collection,
      key,
      key === 'year' ? Number(match[1]) : decodeURIComponent(match[1]),
    )
    if (located) return located
  }
  // Everything else is a page by its nested path ("/", "/about/", "/about/history/").
  return first(payload, 'pages', 'path', path)
}
