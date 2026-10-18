import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { getRedirect } from './queries'
import { pathFor } from './urls'

/**
 * For a path that matched no document: follow its entry in the redirects collection (301 or 302,
 * as set by the editor), or answer 404. Use instead of `notFound()` in every public route.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const entry = await getRedirect(false, path)
  const to = entry?.to
  const target =
    to?.type === 'custom'
      ? to.url
      : to?.reference && typeof to.reference.value === 'object'
        ? pathFor(to.reference.relationTo, to.reference.value)
        : null
  if (target && target !== path) {
    if (entry?.type === '302') redirect(target)
    permanentRedirect(target)
  }
  notFound()
}
