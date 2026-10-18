import { expect, test } from '@playwright/test'

import { authFile, seeded } from './support/auth'

// M1 "done when": every collection is editable in the admin (brief §13).
const editable = [
  'pages',
  'solutions',
  'funds',
  'projects',
  'people',
  'offices',
  'awards',
  'jobs',
  'insights',
  'categories',
  'press-mentions',
  'research',
  'legal-documents',
  'media',
  'documents',
  'users',
  'redirects',
  'forms',
]
// Server-written logs: listed for admins, never created by hand.
const readOnly = ['ai-changesets', 'audit-log', 'form-submissions']
const globals = ['header', 'footer', 'site-settings', 'ai-settings']

test.describe('admin collections', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
  // Signed in with password and 2FA by auth.setup.ts.
  test.use({ storageState: authFile('admin') })

  for (const slug of [...editable, ...readOnly]) {
    test(`${slug}: list view loads`, async ({ page }) => {
      const response = await page.goto(`/admin/collections/${slug}/`)
      expect(response?.status()).toBe(200)
      await expect(page.locator('.collection-list')).toBeVisible()
    })
  }

  for (const slug of editable) {
    test(`${slug}: edit form loads`, async ({ page }) => {
      await page.goto(`/admin/collections/${slug}/create/`)
      // Collections with autosave create the draft at once and move to its own URL.
      await expect(page).toHaveURL(new RegExp(`/admin/collections/${slug}/(create|\\d+)/?`))
      await expect(page.locator('.collection-edit')).toBeVisible()
      await expect(page.locator('.payload-toast-container .toast-error')).toHaveCount(0)
    })
  }

  for (const slug of globals) {
    test(`global ${slug}: edit form loads`, async ({ page }) => {
      const response = await page.goto(`/admin/globals/${slug}/`)
      expect(response?.status()).toBe(200)
      await expect(page.locator(`.global-edit--${slug}`)).toBeVisible()
    })
  }
})
