import type { Payload } from 'payload'

import { seedContent } from './content'

type Env = Record<string, string | undefined>

// Railway names ephemeral PR environments `<base>-pr-<number>`.
const PR_ENVIRONMENT = /(^|-)pr-\d+$/

/**
 * Seeding only runs where the data is disposable: local machines, CI, and Railway PR
 * environments. It is chained after migrations in every Railway pre-deploy, so on staging and
 * production it must skip rather than fail. Returns why seeding is skipped, or null to seed.
 */
export function seedSkipReason(env: Env): string | null {
  if (env.ALLOW_SEED === 'true') return null

  const railwayEnvironment = env.RAILWAY_ENVIRONMENT_NAME
  if (!railwayEnvironment || PR_ENVIRONMENT.test(railwayEnvironment)) return null

  return `"${railwayEnvironment}" is a persistent Railway environment; only local, CI and PR environments are seeded (set ALLOW_SEED=true to override)`
}

/** Idempotent: safe to run on every deploy of a PR environment. */
export async function runSeed(payload: Payload, env: Env): Promise<void> {
  await seedAdminUser(payload, env)
  if (env.SEED_CONTENT !== 'false') await seedContent(payload)
}

const ROLE_USERS = [
  { role: 'admin', name: 'Seed Admin' },
  { role: 'editor', name: 'Seed Editor' },
  { role: 'compliance', name: 'Seed Compliance' },
  { role: 'contributor', name: 'Seed Contributor' },
] as const

/**
 * One account per role, all with SEED_ADMIN_PASSWORD: the admin at SEED_ADMIN_EMAIL, the others at
 * <role>@<same domain> (brief §15: "seed one test compliance user"). Only ever on disposable data.
 */
async function seedAdminUser(payload: Payload, env: Env): Promise<void> {
  const adminEmail = env.SEED_ADMIN_EMAIL
  const password = env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !password) {
    payload.logger.info('Seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set, no users created')
    return
  }

  const domain = adminEmail.split('@')[1]
  for (const { role, name } of ROLE_USERS) {
    const email = role === 'admin' ? adminEmail : `${role}@${domain}`
    const existing = await payload.count({
      collection: 'users',
      where: { email: { equals: email } },
    })
    if (existing.totalDocs > 0) continue
    await payload.create({ collection: 'users', data: { email, password, name, roles: [role] } })
    payload.logger.info(`Seed: created ${role} user ${email}`)
  }
}
