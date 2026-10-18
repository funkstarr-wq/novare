import { sql } from '@payloadcms/db-postgres'

import { payloadClient } from './queries'
import { pathFor } from './urls'

/** What search looks in: each collection's title and short text (brief §7, `/search/`). */
const SOURCES = [
  { collection: 'pages', table: 'pages', title: 'title', text: null },
  { collection: 'solutions', table: 'solutions', title: 'title', text: 'summary' },
  { collection: 'funds', table: 'funds', title: 'name', text: 'summary' },
  { collection: 'projects', table: 'projects', title: 'name', text: null },
  { collection: 'people', table: 'people', title: 'name', text: 'role' },
  { collection: 'insights', table: 'insights', title: 'title', text: 'excerpt' },
  { collection: 'research', table: 'research', title: 'title', text: 'summary' },
  { collection: 'jobs', table: 'jobs', title: 'title', text: null },
  { collection: 'legal-documents', table: 'legal_documents', title: 'title', text: null },
] as const

export type SearchResult = {
  collection: string
  title: string
  excerpt: null | string
  href: string
}

export const MAX_QUERY_LENGTH = 100
const MAX_RESULTS = 30

/**
 * Postgres full-text search over published documents, best matches first. Table and column names
 * come from `SOURCES` above; only the query text comes from the visitor, as a bound parameter.
 */
export async function search(query: string): Promise<SearchResult[]> {
  const q = query.trim().slice(0, MAX_QUERY_LENGTH)
  if (!q) return []
  const selects = SOURCES.map(({ collection, table, title, text }) => {
    const document = text
      ? sql.raw(`coalesce("${title}", '') || ' ' || coalesce("${text}", '')`)
      : sql.raw(`coalesce("${title}", '')`)
    const vector = sql`to_tsvector('english', ${document})`
    const tsquery = sql`websearch_to_tsquery('english', ${q})`
    return sql`
      select ${collection} as collection, ${sql.raw(`"${title}"`)} as title,
        ${text ? sql.raw(`"${text}"`) : sql`null`} as excerpt,
        ${sql.raw(table === 'pages' ? 'path' : 'null')} as path,
        ${sql.raw(table === 'research' ? 'year' : 'null::numeric')} as year,
        slug,
        ts_rank(${vector}, ${tsquery}) as rank
      from ${sql.raw(`"${table}"`)}
      where "_status" = 'published' and ${vector} @@ ${tsquery}`
  })
  const payload = await payloadClient()
  const result = await payload.db.drizzle.execute(
    sql`${sql.join(selects, sql` union all `)} order by rank desc limit ${MAX_RESULTS}`,
  )
  type Row = {
    collection: string
    title: string
    excerpt: null | string
    path: null | string
    year: null | number | string
    slug: null | string
  }
  return (result.rows as Row[]).flatMap((row) => {
    const href = pathFor(row.collection, {
      slug: row.slug,
      path: row.path,
      year: row.year === null ? null : Number(row.year),
    })
    return href
      ? [{ collection: row.collection, title: row.title, excerpt: row.excerpt, href }]
      : []
  })
}
