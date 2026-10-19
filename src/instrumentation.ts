import type { Instrumentation } from 'next'

import { errorLogLine } from './lib/monitoring'

/**
 * Server start-up and error reporting (brief §13 M7).
 *
 * - Starts Payload's job cron (form retention) in the running server only: CLI commands such as
 *   `payload migrate` and the build never start it, so they exit as usual.
 * - Reports every server error as one JSON line on stderr, which Railway's log view can filter
 *   and alert on (`level:error`); see docs/launch-checklist.md.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.PAYLOAD_JOBS === 'off') return
  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import('payload'),
      import('@payload-config'),
    ])
    await getPayload({ config, cron: true })
  } catch (error) {
    console.error(
      errorLogLine(error, { path: 'startup', method: 'INIT' }, { routeType: 'startup' }),
    )
  }
}

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  console.error(errorLogLine(error, request, context))
}
