import { expect, type Page, test } from '@playwright/test'

// M2 (brief §6.1): the admin only offers Publish to roles that may publish the document.
// `pnpm seed` creates editor@, compliance@ and contributor@ on the admin's domain.
const adminEmail = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD
const roleEmail = (role: string) => `${role}@${adminEmail!.split('@')[1]}`

async function login(page: Page, email: string) {
  await page.goto('/admin/login/')
  await page.locator('#field-email').fill(email)
  await page.locator('#field-password').fill(password!)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin\/?$/)
}

async function openNew(page: Page, collection: string) {
  await page.goto(`/admin/collections/${collection}/create/`)
  // Autosave collections show no Save Draft button; wait for the document controls instead.
  await expect(page.locator('.doc-controls')).toBeVisible()
}

test.describe('publish permissions in the admin', () => {
  test.skip(
    !adminEmail || !password,
    'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)',
  )

  test('a contributor has no Publish button', async ({ page }) => {
    await login(page, roleEmail('contributor'))
    await openNew(page, 'insights')
    await expect(page.locator('#action-save')).toHaveCount(0)
  })

  test('an editor can publish insights but not solutions', async ({ page }) => {
    await login(page, roleEmail('editor'))
    await openNew(page, 'insights')
    await expect(page.locator('#action-save')).toBeVisible()
    await openNew(page, 'solutions')
    await expect(page.locator('#action-save')).toHaveCount(0)
  })

  test('compliance can publish solutions', async ({ page }) => {
    await login(page, roleEmail('compliance'))
    await openNew(page, 'solutions')
    await expect(page.locator('#action-save')).toBeVisible()
  })
})
