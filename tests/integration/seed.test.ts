import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { runSeed } from '@/lib/seed'

const env = {
  SEED_ADMIN_EMAIL: 'seed-integration@example.test',
  SEED_ADMIN_PASSWORD: 'integration-only-password',
}

describe('runSeed', () => {
  let payload: Payload

  const deleteSeedUser = () =>
    payload.delete({ collection: 'users', where: { email: { equals: env.SEED_ADMIN_EMAIL } } })

  beforeAll(async () => {
    payload = await getPayload({ config })
    await deleteSeedUser()
  })

  afterAll(async () => {
    await deleteSeedUser()
  })

  it('creates the admin user once, however often it runs', async () => {
    await runSeed(payload, env)
    await runSeed(payload, env)

    const users = await payload.count({
      collection: 'users',
      where: { email: { equals: env.SEED_ADMIN_EMAIL } },
    })
    expect(users.totalDocs).toBe(1)
  })

  it('creates nothing without admin credentials', async () => {
    const before = await payload.count({ collection: 'users' })
    await runSeed(payload, {})
    const after = await payload.count({ collection: 'users' })

    expect(after.totalDocs).toBe(before.totalDocs)
  })
})
