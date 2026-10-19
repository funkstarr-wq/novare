import { afterEach, describe, expect, it, vi } from 'vitest'

import { routesFor } from '@/hooks/formSubmissions'
import { retentionCutoff, retentionMonths } from '@/jobs/retention'
import { readConsent } from '@/lib/consent'
import {
  checkFormToken,
  honeypotFilled,
  issueFormToken,
  MAX_TOKEN_AGE_MS,
  verifyTurnstile,
} from '@/lib/forms/spam'
import { validateSubmission } from '@/lib/forms/validate'
import { errorLogLine } from '@/lib/monitoring'
import { clientIp, RateLimiter } from '@/lib/rateLimit'
import { contentSecurityPolicy, securityHeaders } from '@/lib/securityHeaders'
import type { Form } from '@/payload-types'

afterEach(() => vi.unstubAllEnvs())

describe('security headers (brief §12)', () => {
  const header = (options: Parameters<typeof securityHeaders>[0], key: string) =>
    securityHeaders(options).find((entry) => entry.key === key)?.value

  it('locks the public site to its own origin, plus Turnstile', () => {
    const csp = contentSecurityPolicy({ https: true })
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ]) {
      expect(csp).toContain(directive)
    }
    expect(csp).toContain('https://challenges.cloudflare.com')
    expect(csp).not.toContain('cdn.jsdelivr.net')
    expect(csp).not.toContain('unsafe-eval')
  })

  it('lets the admin load its code editor, and dev mode use eval', () => {
    expect(contentSecurityPolicy({ admin: true })).toContain('https://cdn.jsdelivr.net')
    expect(contentSecurityPolicy({ dev: true })).toContain("'unsafe-eval'")
    expect(contentSecurityPolicy({})).not.toContain('upgrade-insecure-requests')
  })

  it('sends HSTS only over HTTPS, and the other headers always', () => {
    expect(header({ https: true }, 'Strict-Transport-Security')).toBe('max-age=31536000')
    expect(header({}, 'Strict-Transport-Security')).toBeUndefined()
    expect(header({}, 'X-Content-Type-Options')).toBe('nosniff')
    expect(header({}, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(header({}, 'Permissions-Policy')).toContain('camera=()')
  })
})

describe('form spam checks (brief §9)', () => {
  it('accepts a token after the minimum fill time and refuses forged or stale ones', () => {
    vi.stubEnv('PAYLOAD_SECRET', 'unit-test-secret')
    const now = 1_800_000_000_000
    const token = issueFormToken(now)
    expect(checkFormToken(token, now + 5_000)).toBe('ok')
    expect(checkFormToken(token, now + 500)).toBe('too-fast')
    expect(checkFormToken(token, now + MAX_TOKEN_AGE_MS + 1)).toBe('expired')
    expect(
      checkFormToken(
        token.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')),
        now + 5_000,
      ),
    ).toBe('invalid')
    expect(checkFormToken(`${now - 60_000}.${token.split('.')[1]}`, now)).toBe('invalid')
    expect(checkFormToken(undefined, now)).toBe('invalid')
  })

  it('treats any honeypot value as a bot', () => {
    expect(honeypotFilled('http://spam.example')).toBe(true)
    expect(honeypotFilled('')).toBe(false)
    expect(honeypotFilled(null)).toBe(false)
  })

  it('verifies Turnstile only when configured, and fails closed', async () => {
    expect(await verifyTurnstile(undefined, null)).toBe(true)
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
    const answer = (success: boolean) =>
      vi.fn(async () => Response.json({ success })) as unknown as typeof fetch
    expect(await verifyTurnstile('token', '1.2.3.4', answer(true))).toBe(true)
    expect(await verifyTurnstile('token', '1.2.3.4', answer(false))).toBe(false)
    expect(await verifyTurnstile('', null, answer(true))).toBe(false)
    const broken = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    expect(await verifyTurnstile('token', null, broken)).toBe(false)
  })
})

describe('rate limits', () => {
  it('allows max hits per window, then refuses until the window moves on', () => {
    const limiter = new RateLimiter(2, 1_000)
    expect([limiter.take('a', 0), limiter.take('a', 10), limiter.take('a', 20)]).toEqual([
      true,
      true,
      false,
    ])
    expect(limiter.take('b', 20)).toBe(true)
    expect(limiter.take('a', 1_011)).toBe(true)
  })

  it('reads the client IP from Cloudflare, then the proxy', () => {
    expect(
      clientIp(new Headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })),
    ).toBe('1.1.1.1')
    expect(clientIp(new Headers({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' }))).toBe('3.3.3.3')
    expect(clientIp(new Headers())).toBeNull()
  })
})

describe('submission validation', () => {
  const form = {
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true },
      { blockType: 'email', name: 'email', label: 'Email', required: true },
      {
        blockType: 'select',
        name: 'topic',
        label: 'Topic',
        required: true,
        options: [{ label: 'General', value: 'general' }],
      },
      { blockType: 'textarea', name: 'message', label: 'Message' },
      { blockType: 'checkbox', name: 'popiaConsent', label: 'I agree.', required: true },
    ],
  } as unknown as Pick<Form, 'fields'>
  const valid = [
    { field: 'name', value: ' Ada ' },
    { field: 'email', value: 'ada@example.test' },
    { field: 'topic', value: 'general' },
    { field: 'popiaConsent', value: 'true' },
    { field: 'injected', value: 'x' },
  ]

  it('keeps only the form’s fields, trimmed, and records consent', () => {
    const result = validateSubmission(form, valid)
    expect(result.errors).toEqual([])
    expect(result.data.map((entry) => entry.field)).toEqual([
      'name',
      'email',
      'topic',
      'message',
      'popiaConsent',
    ])
    expect(result.data[0].value).toBe('Ada')
    expect(result.consent).toEqual({ given: true, text: 'I agree.' })
  })

  it.each([
    [{ field: 'name', value: '' }, /Name is required/],
    [{ field: 'email', value: 'not-an-email' }, /must be an email/],
    [{ field: 'topic', value: 'other' }, /Choose one of the options/],
    [{ field: 'popiaConsent', value: 'false' }, /must be ticked/],
    [{ field: 'message', value: 'x'.repeat(5_001) }, /too long/],
  ])('rejects %j', (change, error) => {
    const input = [...valid.filter((entry) => entry.field !== change.field), change]
    expect(validateSubmission(form, input).errors.join(' ')).toMatch(error)
  })
})

describe('routing, retention, consent, logging', () => {
  it('routes by topic, falling back to *', () => {
    const form = {
      routing: [
        { topic: 'wealth', emailTo: 'wealth@example.test' },
        { topic: '*', emailTo: 'hello@example.test' },
      ],
    } as Pick<Form, 'routing'>
    expect(routesFor(form, 'wealth')).toEqual(['wealth@example.test'])
    expect(routesFor(form, 'other')).toEqual(['hello@example.test'])
    expect(routesFor({ routing: [] }, 'x')).toEqual([])
  })

  it('keeps submissions 12 months unless configured', () => {
    expect(retentionMonths()).toBe(12)
    vi.stubEnv('FORM_RETENTION_MONTHS', '6')
    expect(retentionMonths()).toBe(6)
    vi.stubEnv('FORM_RETENTION_MONTHS', 'nonsense')
    expect(retentionMonths()).toBe(12)
    expect(retentionCutoff(new Date('2026-10-19T00:00:00Z'), 12).toISOString()).toBe(
      '2025-10-19T00:00:00.000Z',
    )
  })

  it('reads the consent cookie', () => {
    expect(readConsent('a=1; novare_consent=accepted; b=2')).toBe('accepted')
    expect(readConsent('novare_consent=declined')).toBe('declined')
    expect(readConsent('novare_consent=maybe')).toBeNull()
    expect(readConsent('')).toBeNull()
  })

  it('logs errors as one JSON line without the query string', () => {
    const error = Object.assign(new Error('Boom'), { digest: 'abc123' })
    const line = JSON.parse(
      errorLogLine(
        error,
        { path: '/contact/?email=ada@example.test', method: 'GET' },
        { routeType: 'render' },
      ),
    )
    expect(line).toMatchObject({ level: 'error', msg: 'Boom', digest: 'abc123', path: '/contact/' })
    expect(JSON.stringify(line)).not.toContain('ada@example.test')
  })
})
