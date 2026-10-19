/**
 * Security headers (brief §12), applied by `next.config.ts` to every response.
 *
 * The Content-Security-Policy allows scripts from this origin only. Inline scripts stay allowed
 * (`'unsafe-inline'`): Next.js streams each page's data in inline scripts, and the nonce that
 * would replace them forces every page to render per request, which turns off the page cache the
 * performance budgets rely on (see the Next.js CSP guide and docs/decisions.md M7). The admin
 * also loads its code editor from jsDelivr, which Payload's Monaco loader uses.
 */
const TURNSTILE = 'https://challenges.cloudflare.com'
const MONACO = 'https://cdn.jsdelivr.net'

type Options = { dev?: boolean; https?: boolean; admin?: boolean }

export function contentSecurityPolicy({ dev = false, https = false, admin = false }: Options) {
  const extra = admin ? [MONACO] : []
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      ...(dev ? ["'unsafe-eval'"] : []),
      TURNSTILE,
      ...extra,
    ],
    'style-src': ["'self'", "'unsafe-inline'", ...extra],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'", 'data:', ...extra],
    'connect-src': ["'self'", TURNSTILE, ...(dev ? ['ws:'] : []), ...extra],
    'frame-src': ["'self'", TURNSTILE],
    'worker-src': ["'self'", 'blob:'],
    'media-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    // Live preview shows the site in an iframe inside the admin, on the same origin.
    'frame-ancestors': ["'self'"],
  }
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`)
  if (https) policy.push('upgrade-insecure-requests')
  return policy.join('; ')
}

export function securityHeaders(options: Options) {
  return [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(options) },
    // One year, this host only: novare.com subdomains elsewhere are not ours to commit to HTTPS.
    ...(options.https ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ]
}
