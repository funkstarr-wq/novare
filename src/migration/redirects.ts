import { readFileSync } from 'node:fs'

import type { Payload } from 'payload'

/**
 * The go-live redirect map (brief §11 "Redirects", docs/launch-runbook.md): `docs/redirects.csv`
 * with the columns `old,new,status`, imported into the redirects collection. Like the WordPress
 * import it upserts (by the old path) and never deletes.
 */
export type RedirectRow = { from: string; to: string; type: '301' | '302'; line: number }

/** A site path in the form the redirect lookup matches: leading and trailing slash. */
export const normalisePath = (value: string) => {
  const path = value.trim().replace(/^https?:\/\/[^/]+/i, '')
  if (!path.startsWith('/')) throw new Error(`"${value}" is not a site path`)
  if (path.includes('#')) throw new Error(`"${value}": anchors cannot be redirected by the server`)
  const [pathname, query] = path.split('?')
  const slashed =
    /\.[a-z0-9]+$/i.test(pathname) || pathname.endsWith('/') ? pathname : `${pathname}/`
  return query ? `${slashed}?${query}` : slashed
}

/** Parses the CSV, rejecting the whole file on any bad row so a typo never half-imports. */
export function parseRedirectsCsv(csv: string): RedirectRow[] {
  const rows: RedirectRow[] = []
  const errors: string[] = []
  const seen = new Map<string, number>()

  csv.split(/\r?\n/).forEach((raw, index) => {
    const line = index + 1
    const text = raw.trim()
    if (!text || text.startsWith('#') || (line === 1 && /^old\s*,/i.test(text))) return
    const [old, target, status = '301', ...rest] = text.split(',').map((cell) => cell.trim())
    try {
      if (!old || !target || rest.length) throw new Error('expected old,new,status')
      if (status !== '301' && status !== '302') throw new Error(`status "${status}" (301 or 302)`)
      const from = normalisePath(old)
      const to = /^https?:\/\//i.test(target) ? target : normalisePath(target)
      if (to === from) throw new Error('redirects to itself')
      const previous = seen.get(from)
      if (previous) throw new Error(`${from} is already on line ${previous}`)
      seen.set(from, line)
      rows.push({ from, to, type: status, line })
    } catch (error) {
      errors.push(`line ${line}: ${(error as Error).message}`)
    }
  })

  // A redirect whose target is itself redirected costs visitors and crawlers a second hop.
  const sources = new Set(rows.map((row) => row.from))
  for (const row of rows) {
    if (sources.has(row.to)) errors.push(`line ${row.line}: ${row.to} is itself redirected`)
  }

  if (errors.length) throw new Error(`docs/redirects.csv:\n${errors.join('\n')}`)
  return rows
}

export type RedirectImport = { created: number; updated: number; unchanged: number }

export async function importRedirects(
  payload: Payload,
  rows: RedirectRow[],
): Promise<RedirectImport> {
  const result: RedirectImport = { created: 0, updated: 0, unchanged: 0 }
  for (const row of rows) {
    const data = { from: row.from, to: { type: 'custom' as const, url: row.to }, type: row.type }
    const { docs } = await payload.find({
      collection: 'redirects',
      where: { from: { equals: row.from } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const existing = docs[0]
    if (!existing) {
      await payload.create({ collection: 'redirects', data, overrideAccess: true })
      result.created += 1
    } else if (
      existing.to?.type === 'custom' &&
      existing.to.url === row.to &&
      existing.type === row.type
    ) {
      result.unchanged += 1
    } else {
      await payload.update({
        collection: 'redirects',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      result.updated += 1
    }
  }
  return result
}

/** Reads and imports a redirects CSV, logging the counts (scripts/import-redirects.ts, seed). */
export async function importRedirectsFile(payload: Payload, file: string) {
  const rows = parseRedirectsCsv(readFileSync(file, 'utf8'))
  const result = await importRedirects(payload, rows)
  return `Redirects from ${file}: ${result.created} created, ${result.updated} updated, ${result.unchanged} unchanged.`
}
