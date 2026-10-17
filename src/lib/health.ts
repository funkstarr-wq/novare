export type HealthReport = {
  status: 'ok' | 'error'
  db: 'ok' | 'not_configured' | 'unreachable'
}

export const DB_PROBE_TIMEOUT_MS = 10_000

/**
 * Health of the running app. The database is only probed when one is configured, so a build or
 * preview without `DATABASE_URL` still reports healthy; a configured but unreachable database
 * reports an error so Railway holds back a broken deploy.
 */
export async function checkHealth({
  databaseUrl,
  probeDatabase,
  timeoutMs = DB_PROBE_TIMEOUT_MS,
}: {
  databaseUrl: string | undefined
  probeDatabase: () => Promise<unknown>
  timeoutMs?: number
}): Promise<HealthReport> {
  if (!databaseUrl) {
    return { status: 'ok', db: 'not_configured' }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Database probe timed out after ${timeoutMs}ms`)),
      timeoutMs,
    )
  })

  try {
    await Promise.race([probeDatabase(), timeout])
    return { status: 'ok', db: 'ok' }
  } catch (error) {
    console.error(
      'Health check: database unreachable:',
      error instanceof Error ? error.message : error,
    )
    return { status: 'error', db: 'unreachable' }
  } finally {
    clearTimeout(timer)
  }
}
