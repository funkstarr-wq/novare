import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { totpAccess } from 'payload-totp'

import { staff } from '@/access'
import { isSitePath, secretMatches } from '@/lib/preview'
import { payloadClient } from '@/lib/queries'

/**
 * Turns on Draft Mode for live preview (brief §8.5) and sends the browser to the page. Needs the
 * preview secret and a staff session that has entered its 2FA code, as for the admin itself.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  if (!secretMatches(params.get('secret') ?? '', process.env.PREVIEW_SECRET)) {
    return new Response('Invalid preview link.', { status: 401 })
  }
  const path = params.get('path') ?? ''
  if (!isSitePath(path)) return new Response('Invalid preview path.', { status: 400 })

  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  const allowed = user && (await totpAccess(staff)({ req: { payload, user } } as never)) === true
  if (!allowed) {
    return new Response('Sign in to the CMS, with your 2FA code, to preview drafts.', {
      status: 403,
    })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
