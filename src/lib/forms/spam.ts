import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Spam checks for the enquiry forms (brief §9): a honeypot field, a time-to-submit check and,
 * when Cloudflare Turnstile is configured, its challenge.
 *
 * The time check uses a signed token the browser fetches when the form loads (pages are cached,
 * so a token rendered into the page would carry the cache's time, not the visitor's).
 */
export const HONEYPOT = 'website'
export const MIN_FILL_MS = 2_000
export const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000

const secret = () => {
  const value = process.env.PAYLOAD_SECRET
  if (!value) throw new Error('PAYLOAD_SECRET is not set')
  return value
}

const sign = (issuedAt: string) =>
  createHmac('sha256', secret()).update(`form-token:${issuedAt}`).digest('base64url')

/** A token recording when the form was shown: `<time>.<signature>`. */
export const issueFormToken = (now = Date.now()) => `${now}.${sign(String(now))}`

export type TokenCheck = 'ok' | 'invalid' | 'too-fast' | 'expired'

export function checkFormToken(token: unknown, now = Date.now()): TokenCheck {
  if (typeof token !== 'string') return 'invalid'
  const [issuedAt, signature] = token.split('.')
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) return 'invalid'
  const expected = Buffer.from(sign(issuedAt))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'
  const age = now - Number(issuedAt)
  if (age < MIN_FILL_MS) return 'too-fast'
  if (age > MAX_TOKEN_AGE_MS) return 'expired'
  return 'ok'
}

/** True when the hidden honeypot field was filled in, which people never do. */
export const honeypotFilled = (value: unknown) => typeof value === 'string' && value.trim() !== ''

export const turnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY)

/** Verifies a Turnstile response with Cloudflare. Passes when Turnstile is not configured. */
export async function verifyTurnstile(
  response: unknown,
  ip: string | null,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const key = process.env.TURNSTILE_SECRET_KEY
  if (!key) return true
  if (typeof response !== 'string' || !response) return false
  const body = new URLSearchParams({ secret: key, response })
  if (ip) body.set('remoteip', ip)
  try {
    const result = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5_000),
    })
    const data = (await result.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
