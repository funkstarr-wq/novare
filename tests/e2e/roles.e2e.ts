import { expect, type Page, test } from '@playwright/test'

import { authFile, seeded } from './support/auth'

// M2 (brief §6.1): the admin only offers Publish to roles that may publish the document.
// Each role's session (password + 2FA) comes from auth.setup.ts.
async function openNew(page: Page, collection: string) {
  await page.goto(`/admin/collections/${collection}/create/`)
  // Autosave collections show no Save Draft button; wait for the document controls instead.
  await expect(page.locator('.doc-controls')).toBeVisible()
}

test.describe('publish permissions in the admin', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')

  test.describe('contributor', () => {
    test.use({ storageState: authFile('contributor') })

    test('has no Publish button', async ({ page }) => {
      await openNew(page, 'insights')
      await expect(page.locator('#action-save')).toHaveCount(0)
    })
  })

  test.describe('editor', () => {
    test.use({ storageState: authFile('editor') })

    test('can publish insights but not solutions', async ({ page }) => {
      await openNew(page, 'insights')
      await expect(page.locator('#action-save')).toBeVisible()
      await openNew(page, 'solutions')
      await expect(page.locator('#action-save')).toHaveCount(0)
    })
  })

  test.describe('compliance', () => {
    test.use({ storageState: authFile('compliance') })

    test('can publish solutions', async ({ page }) => {
      await openNew(page, 'solutions')
      await expect(page.locator('#action-save')).toBeVisible()
    })
  })
})
