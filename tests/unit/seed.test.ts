import { describe, expect, it } from 'vitest'

import { seedSkipReason } from '@/lib/seed'

describe('seedSkipReason', () => {
  it.each([
    ['local or CI (no Railway environment)', {}],
    ['a Railway PR environment', { RAILWAY_ENVIRONMENT_NAME: 'novare-web-pr-42' }],
    ['a bare pr-N environment name', { RAILWAY_ENVIRONMENT_NAME: 'pr-7' }],
    ['an explicit override', { RAILWAY_ENVIRONMENT_NAME: 'staging', ALLOW_SEED: 'true' }],
  ])('seeds in %s', (_label, env) => {
    expect(seedSkipReason(env)).toBeNull()
  })

  it.each(['production', 'staging', 'pr-review', 'production-pr-copy'])(
    'skips the persistent environment %s',
    (name) => {
      expect(seedSkipReason({ RAILWAY_ENVIRONMENT_NAME: name })).toMatch(
        /persistent Railway environment/,
      )
    },
  )
})
