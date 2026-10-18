import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { isSitePath } from '@/lib/preview'

/** Leaves Draft Mode and returns to the published page (`?path=`, else the home page). */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '/'
  ;(await draftMode()).disable()
  redirect(isSitePath(path) ? path : '/')
}
