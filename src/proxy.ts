import { type NextRequest, NextResponse } from 'next/server'

// payload-totp's admin provider decides whether to send someone to the 2FA setup or code page
// from the request path, which server components cannot read; this passes it as a request
// header. Overwriting it also stops a client from sending its own.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: '/admin/:path*',
}
