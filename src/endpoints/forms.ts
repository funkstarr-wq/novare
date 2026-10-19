import type { Endpoint } from 'payload'

import {
  checkFormToken,
  HONEYPOT,
  honeypotFilled,
  issueFormToken,
  verifyTurnstile,
} from '@/lib/forms/spam'
import { validateSubmission } from '@/lib/forms/validate'
import { clientIp, RateLimiter } from '@/lib/rateLimit'

/**
 * The only way to send an enquiry (brief §9): `GET /api/form-token/` when the form loads, then
 * `POST /api/submit-form/`. Submissions cannot be created through Payload's REST API directly,
 * so every one passes the honeypot, time-to-submit, Turnstile, rate limit and field checks.
 */
const perIp = new RateLimiter(5, 10 * 60 * 1000)

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export const formEndpoints: Endpoint[] = [
  {
    path: '/form-token',
    method: 'get',
    handler: () => json({ token: issueFormToken() }),
  },
  {
    path: '/submit-form',
    method: 'post',
    handler: async (req) => {
      const ip = clientIp(req.headers)
      if (!perIp.take(ip ?? 'unknown')) {
        return json(
          { error: 'Too many messages from your connection. Please try again later.' },
          429,
        )
      }

      const body = (req.json ? await req.json().catch(() => null) : null) as Record<
        string,
        unknown
      > | null
      if (!body || typeof body.form !== 'number') return json({ error: 'Invalid request.' }, 400)

      // A filled honeypot is a bot: answer as if it worked, so it learns nothing, and keep nothing.
      if (honeypotFilled(body[HONEYPOT])) return json({ ok: true })

      const token = checkFormToken(body.token)
      if (token !== 'ok') {
        return json(
          {
            error:
              token === 'too-fast'
                ? 'That was quick. Please check your message and send it again.'
                : 'This form has expired. Please reload the page and try again.',
          },
          400,
        )
      }
      if (!(await verifyTurnstile(body.turnstileToken, ip))) {
        return json({ error: 'Please complete the security check and try again.' }, 400)
      }

      const form = await req.payload
        .findByID({ collection: 'forms', id: body.form, depth: 0, overrideAccess: true, req })
        .catch(() => null)
      if (!form) return json({ error: 'Invalid request.' }, 400)

      const { data, errors, consent } = validateSubmission(form, body.submissionData)
      if (errors.length) return json({ error: errors.join(' '), errors }, 400)

      await req.payload.create({
        collection: 'form-submissions',
        data: {
          form: form.id,
          submissionData: data,
          ...(consent ? { consent: { ...consent, at: new Date().toISOString() } } : {}),
        },
        overrideAccess: true,
        req,
      })
      return json({ ok: true })
    },
  },
]
