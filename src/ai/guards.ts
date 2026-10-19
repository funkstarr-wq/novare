import type { Payload, PayloadRequest } from 'payload'
import { totpAccess } from 'payload-totp'

import { staff } from '@/access'
import type { RoleUser } from '@/access/roles'
import type { AiSetting } from '@/payload-types'

import { editorModel } from './model'

/**
 * Checks before any plan reaches the API (brief §10.3 step 2, §10.7): a verified staff session,
 * the editor switched on in AI settings, budget left this month and under 30 plans an hour.
 */
export const PLANS_PER_HOUR = 30

export class AiRefusal extends Error {
  constructor(
    message: string,
    readonly status = 403,
  ) {
    super(message)
  }
}

/** Staff who have entered their 2FA code in this session. */
export async function verifiedStaff(req: PayloadRequest): Promise<RoleUser & { id: number }> {
  const allowed = await totpAccess(staff)({ req })
  if (!allowed || !req.user)
    throw new AiRefusal('Sign in with your 2FA code to use the assistant.', 401)
  return req.user as RoleUser & { id: number }
}

export const loadSettings = (payload: Payload) =>
  payload.findGlobal({ slug: 'ai-settings', depth: 0, overrideAccess: true })

/** The monthly cap: AI settings, else `AI_MONTHLY_BUDGET_USD`; `null` when neither is set. */
export function monthlyBudget(settings: Pick<AiSetting, 'monthlyBudgetUSD'>): number | null {
  if (typeof settings.monthlyBudgetUSD === 'number') return settings.monthlyBudgetUSD
  const fromEnv = Number.parseFloat(process.env.AI_MONTHLY_BUDGET_USD ?? '')
  return Number.isFinite(fromEnv) ? fromEnv : null
}

const startOfMonth = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

/** What the assistant has cost this calendar month (UTC), from the changesets' token usage. */
export async function spentThisMonth(payload: Payload, now = new Date()): Promise<number> {
  const { docs } = await payload.find({
    collection: 'ai-changesets',
    where: { createdAt: { greater_than_equal: startOfMonth(now) } },
    select: { costUSD: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  return docs.reduce((sum, doc) => sum + (doc.costUSD ?? 0), 0)
}

export type AiStatus = {
  enabled: boolean
  configured: boolean
  model: string
  budgetUSD: number | null
  spentUSD: number
  remainingUSD: number | null
}

export async function aiStatus(payload: Payload, configured: boolean): Promise<AiStatus> {
  const settings = await loadSettings(payload)
  const budgetUSD = monthlyBudget(settings)
  const spentUSD = await spentThisMonth(payload)
  return {
    enabled: settings.enabled === true,
    configured,
    model: editorModel(settings.model),
    budgetUSD,
    spentUSD,
    remainingUSD: budgetUSD === null ? null : Math.max(0, budgetUSD - spentUSD),
  }
}

/** Throws AiRefusal when a new plan may not start. */
export async function checkCanPlan(payload: Payload, userId: number, configured: boolean) {
  const status = await aiStatus(payload, configured)
  if (!status.enabled) throw new AiRefusal('The AI assistant is switched off in AI settings.')
  if (!status.configured)
    throw new AiRefusal('The AI assistant has no API key on this server.', 503)
  if (status.budgetUSD === null) {
    throw new AiRefusal('Set a monthly budget in AI settings before using the assistant.')
  }
  if (status.remainingUSD !== null && status.remainingUSD <= 0) {
    throw new AiRefusal(
      `This month's AI budget ($${status.budgetUSD.toFixed(2)}) is used up. An admin can raise it in AI settings.`,
      429,
    )
  }
  const { totalDocs } = await payload.count({
    collection: 'ai-changesets',
    where: {
      and: [
        { user: { equals: userId } },
        { createdAt: { greater_than: new Date(Date.now() - 3_600_000).toISOString() } },
      ],
    },
    overrideAccess: true,
  })
  if (totalDocs >= PLANS_PER_HOUR) {
    throw new AiRefusal(
      `You have reached ${PLANS_PER_HOUR} requests this hour. Try again later.`,
      429,
    )
  }
  return status
}
