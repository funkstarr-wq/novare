import { expect, test } from '@playwright/test'

import { adminEmail, seeded, submitLoginForm, totpCode } from './support/auth'

test.describe('home', () => {
  test('renders one h1 with title and description', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle('Novare')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('h1')).toHaveCount(1)
  })
})

test.describe('health', () => {
  test('reports ok with the database connected', async ({ request }) => {
    const response = await request.get('/api/health/')

    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok', db: 'ok' })
  })

  test('redirects the slashless path, as trailingSlash is on', async ({ request }) => {
    const response = await request.get('/api/health', { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(response.headers()['location']).toBe('/api/health/')
  })
})

test.describe('admin', () => {
  test('serves the Payload login screen', async ({ page }) => {
    await page.goto('/admin/')

    // A fresh database shows "create first user"; a seeded one shows the login form.
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('lets the seeded admin reach the dashboard with password and 2FA code', async ({ page }) => {
    test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')

    // auth.setup.ts has already set up the admin's authenticator.
    await submitLoginForm(page, adminEmail!)
    await expect(page).toHaveURL(/\/admin\/verify-totp\/?/)
    await page.locator('input[maxlength="1"]').first().click()
    await page.keyboard.type(totpCode(adminEmail!))

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.locator('a[href*="/admin/collections/users"]').first()).toBeVisible()
  })
})
