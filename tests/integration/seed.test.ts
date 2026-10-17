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

  const seededEmails = [
    env.SEED_ADMIN_EMAIL,
    'editor@example.test',
    'compliance@example.test',
    'contributor@example.test',
  ]
  const deleteSeedUser = () =>
    payload.delete({ collection: 'users', where: { email: { in: seededEmails } } })

  beforeAll(async () => {
    payload = await getPayload({ config })
    await deleteSeedUser()
  })

  afterAll(async () => {
    await deleteSeedUser()
  })

  it('creates one user per role once, however often it runs', async () => {
    await runSeed(payload, env)
    await runSeed(payload, env)

    const users = await payload.find({
      collection: 'users',
      where: { email: { in: seededEmails } },
      depth: 0,
    })
    expect(users.docs.map((user) => [user.email, user.roles]).sort()).toEqual([
      ['compliance@example.test', ['compliance']],
      ['contributor@example.test', ['contributor']],
      ['editor@example.test', ['editor']],
      ['seed-integration@example.test', ['admin']],
    ])
  })

  it('creates nothing without admin credentials', async () => {
    const before = await payload.count({ collection: 'users' })
    await runSeed(payload, {})
    const after = await payload.count({ collection: 'users' })

    expect(after.totalDocs).toBe(before.totalDocs)
  })
})
