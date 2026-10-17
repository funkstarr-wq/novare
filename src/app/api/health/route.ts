import config from '@payload-config'
import { getPayload } from 'payload'

import { checkHealth } from '@/lib/health'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const report = await checkHealth({
    databaseUrl: process.env.DATABASE_URL,
    probeDatabase: async () => {
      const payload = await getPayload({ config })
      await payload.db.pool.query('select 1')
    },
  })

  return Response.json(report, {
    status: report.status === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
