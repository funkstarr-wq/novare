import { resendAdapter } from '@payloadcms/email-resend'

/**
 * Transactional email through Resend (brief §2) when `RESEND_API_KEY` is set. Without it,
 * Payload writes emails to the server log, which is what local runs and CI want.
 */
export function emailAdapter() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return undefined
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.warn('RESEND_API_KEY is set without EMAIL_FROM; emails go to the log instead.')
    return undefined
  }
  const match = /^(.*)<([^>]+)>\s*$/.exec(from)
  return resendAdapter({
    apiKey,
    defaultFromAddress: (match ? match[2] : from).trim(),
    defaultFromName: (match ? match[1] : 'Novare').trim() || 'Novare',
  })
}
