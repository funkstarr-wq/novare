/**
 * One JSON line per server error, for Railway's logs (brief §13 M7): searchable by `level`,
 * `path` and `digest` (the id Next.js shows on error pages), and short enough to alert on. Query
 * strings and headers are left out: they can carry personal data or tokens.
 */
type RequestInfo = { path: string; method: string }
type Context = { routeType?: string; routePath?: string }

export function errorLogLine(error: unknown, request: RequestInfo, context: Context = {}): string {
  const err = error instanceof Error ? error : new Error(String(error))
  const digest =
    typeof error === 'object' && error !== null && 'digest' in error
      ? String((error as { digest: unknown }).digest)
      : undefined
  return JSON.stringify({
    level: 'error',
    time: new Date().toISOString(),
    msg: err.message.slice(0, 500),
    name: err.name,
    digest,
    method: request.method,
    path: request.path.split('?')[0],
    routeType: context.routeType,
    routePath: context.routePath,
    stack: err.stack?.split('\n').slice(0, 8).join('\n'),
  })
}
