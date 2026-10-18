import { test as setup } from '@playwright/test'

import { authFile, ROLES, roleEmail, seeded, signIn } from './support/auth'

// Signs every seeded role in once (password + 2FA) and saves the session for the admin tests.
for (const role of ROLES) {
  setup(`sign in as ${role}`, async ({ request, baseURL }) => {
    setup.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
    await signIn(request, baseURL, roleEmail(role))
    await request.storageState({ path: authFile(role) })
  })
}
