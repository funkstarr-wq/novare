import { timingSafeEqual } from 'node:crypto'

/** A same-site path to redirect to: `/…`, never `//host` or anything with a backslash. */
export const isSitePath = (path: string) => /^\/(?![/\\])[^\s\\]*$/.test(path)

export function secretMatches(given: string, expected: string | undefined) {
  if (!expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** The admin's live preview URL for a document path (brief §8.5). Admins only ever see it. */
export const previewURL = (path: null | string) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/preview/?${new URLSearchParams({
    secret: process.env.PREVIEW_SECRET || '',
    path: path ?? '/',
  })}`
