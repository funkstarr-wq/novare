import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { firstUserIsAdmin } from '@/collections/Users'

const run = (operation: 'create' | 'update', existingUsers: number) =>
  firstUserIsAdmin({
    data: { roles: ['contributor'] },
    operation,
    req: {
      payload: { count: async () => ({ totalDocs: existingUsers }) },
    } as unknown as PayloadRequest,
  } as unknown as Parameters<typeof firstUserIsAdmin>[0])

describe('firstUserIsAdmin', () => {
  it('makes the first account on an empty database an admin', async () => {
    await expect(run('create', 0)).resolves.toMatchObject({ roles: ['admin'] })
  })

  it('leaves later accounts and updates alone', async () => {
    await expect(run('create', 3)).resolves.toMatchObject({ roles: ['contributor'] })
    await expect(run('update', 0)).resolves.toMatchObject({ roles: ['contributor'] })
  })
})
