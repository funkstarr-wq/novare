import type { Payload, TaskConfig } from 'payload'

/**
 * Deletes enquiries older than `FORM_RETENTION_MONTHS` (default 12), every night (brief §9).
 * Submissions hold personal data (POPIA), so they are kept no longer than needed.
 */
export const DEFAULT_RETENTION_MONTHS = 12

export function retentionMonths(): number {
  const months = Number.parseInt(process.env.FORM_RETENTION_MONTHS ?? '', 10)
  return Number.isFinite(months) && months > 0 ? months : DEFAULT_RETENTION_MONTHS
}

export function retentionCutoff(now: Date, months: number): Date {
  const cutoff = new Date(now)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months)
  return cutoff
}

export async function deleteOldSubmissions(payload: Payload, now = new Date()) {
  const cutoff = retentionCutoff(now, retentionMonths())
  const { docs } = await payload.delete({
    collection: 'form-submissions',
    where: { createdAt: { less_than: cutoff.toISOString() } },
    overrideAccess: true,
  })
  return { deleted: docs.length, cutoff: cutoff.toISOString() }
}

export const retentionTask: TaskConfig<{
  input: object
  output: { deleted: number; cutoff: string }
}> = {
  slug: 'delete-old-submissions',
  label: 'Delete old form submissions',
  retries: 2,
  outputSchema: [
    { name: 'deleted', type: 'number', required: true },
    { name: 'cutoff', type: 'text', required: true },
  ],
  schedule: [{ cron: '0 3 * * *', queue: 'maintenance' }],
  handler: async ({ req }) => ({ output: await deleteOldSubmissions(req.payload) }),
}
