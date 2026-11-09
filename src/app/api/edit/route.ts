import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { totpAccess } from 'payload-totp'

import { staff } from '@/access'
import { isSitePath } from '@/lib/preview'
import { payloadClient } from '@/lib/queries'

/**
 * "Edit the site with AI": turns on Draft Mode for a signed-in staff member and opens the page,
 * where the live AI bar appears (src/components/layout/LiveAssistantBar.tsx). Without a session
 * verified with 2FA it sends the browser to the admin login, which comes back here.
 */
export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get('path') ?? '/'
  const path = isSitePath(requested) ? requested : '/'

  const payload = await payloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  const allowed = user && (await totpAccess(staff)({ req: { payload, user } } as never)) === true
  if (!allowed) {
    redirect(`/admin/login/?redirect=${encodeURIComponent(`/api/edit/?path=${path}`)}`)
  }

  ;(await draftMode()).enable()
  redirect(path)
}
