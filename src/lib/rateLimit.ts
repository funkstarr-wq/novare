/**
 * A small in-memory rate limiter (brief §12): at most `max` hits per key in a sliding window.
 * It lives in the server process, so it resets on deploy and counts per instance; Cloudflare's
 * rate limiting in front of the site is the outer layer.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>()

  constructor(
    private max: number,
    private windowMs: number,
  ) {}

  /** Records a hit; returns false when the key is over its limit (the hit is not counted). */
  take(key: string, now = Date.now()): boolean {
    const since = now - this.windowMs
    const recent = (this.hits.get(key) ?? []).filter((at) => at > since)
    if (recent.length >= this.max) {
      this.hits.set(key, recent)
      return false
    }
    recent.push(now)
    this.hits.set(key, recent)
    if (this.hits.size > 10_000) this.prune(since)
    return true
  }

  private prune(since: number) {
    for (const [key, times] of this.hits) {
      if (!times.some((at) => at > since)) this.hits.delete(key)
    }
  }
}

/**
 * The visitor's IP, as Cloudflare or Railway's proxy report it. Headers can be forged when the
 * site is reached without Cloudflare, so this only ever feeds rate limits, never access checks.
 */
export function clientIp(headers: Headers): string | null {
  const direct = headers.get('cf-connecting-ip') ?? headers.get('x-real-ip')
  if (direct) return direct.trim()
  const forwarded = headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() || null : null
}
