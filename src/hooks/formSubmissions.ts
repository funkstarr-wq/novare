import { createHmac } from 'node:crypto'

import type { CollectionAfterChangeHook } from 'payload'

import type { Form, FormSubmission } from '@/payload-types'

/**
 * After an enquiry is stored (brief §9): email the routing address for its topic, and POST it to
 * `CRM_WEBHOOK_URL` when one is set. The sender's confirmation email is the form's own `emails`
 * setting (form-builder). Failures are logged and never lose the submission.
 */
const valueOf = (submission: FormSubmission, field: string) =>
  submission.submissionData?.find((entry) => entry.field === field)?.value ?? ''

/** Routing addresses for a topic: entries for that topic, else those for any topic (`*`). */
export function routesFor(form: Pick<Form, 'routing'>, topic: string): string[] {
  const routing = form.routing ?? []
  const exact = routing.filter((route) => route.topic === topic)
  const chosen = exact.length ? exact : routing.filter((route) => route.topic === '*')
  return [...new Set(chosen.map((route) => route.emailTo).filter(Boolean))]
}

export const routeSubmission: CollectionAfterChangeHook<FormSubmission> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  const formId = typeof doc.form === 'object' ? doc.form.id : doc.form
  const form = await req.payload
    .findByID({ collection: 'forms', id: formId, depth: 0, overrideAccess: true, req })
    .catch(() => null)
  if (!form) return doc

  const lines = (doc.submissionData ?? []).map((entry) => `${entry.field}: ${entry.value}`)
  const to = routesFor(form, valueOf(doc, 'topic'))
  if (to.length) {
    const replyTo = valueOf(doc, 'email')
    await req.payload
      .sendEmail({
        to,
        ...(replyTo ? { replyTo } : {}),
        subject: `New enquiry: ${form.title}`,
        text: `${lines.join('\n')}\n\nSubmitted ${doc.createdAt}.`,
      })
      .catch((error: unknown) =>
        req.payload.logger.error({ err: error, msg: 'Enquiry routing email failed' }),
      )
  }

  const webhook = process.env.CRM_WEBHOOK_URL
  if (webhook) {
    const body = JSON.stringify({
      form: { id: form.id, title: form.title },
      submittedAt: doc.createdAt,
      data: Object.fromEntries(
        (doc.submissionData ?? []).map((entry) => [entry.field, entry.value]),
      ),
    })
    const secret = process.env.CRM_WEBHOOK_SECRET
    await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret
          ? { 'X-Novare-Signature': createHmac('sha256', secret).update(body).digest('hex') }
          : {}),
      },
      body,
      signal: AbortSignal.timeout(5_000),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`CRM webhook answered ${response.status}`)
      })
      .catch((error: unknown) =>
        req.payload.logger.error({ err: error, msg: 'CRM webhook failed' }),
      )
  }
  return doc
}
