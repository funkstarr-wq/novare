import type { Payload } from 'payload'

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
}

async function seedAdminUser(payload: Payload, env: Env): Promise<void> {
  const email = env.SEED_ADMIN_EMAIL
  const password = env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    payload.logger.info(
      'Seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set, no admin user created',
    )
    return
  }

  const existing = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (existing.totalDocs > 0) {
    payload.logger.info(`Seed: admin user ${email} already exists`)
    return
  }

  await payload.create({ collection: 'users', data: { email, password } })
  payload.logger.info(`Seed: created admin user ${email}`)
}
