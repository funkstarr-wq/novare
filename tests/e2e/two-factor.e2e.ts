import { expect, test } from '@playwright/test'

import { authFile, roleEmail, sameOrigin, seeded, submitLoginForm, totpCode } from './support/auth'

// 2FA (brief §6.1) through the admin UI: a password alone never gets anyone in.
test.describe('two-factor authentication', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')

  test('an enrolled account is asked for its code after the password', async ({
    page,
    baseURL,
  }) => {
    const email = roleEmail('editor')
    await submitLoginForm(page, email)
    await expect(page).toHaveURL(/\/admin\/verify-totp\/?/)

    // The password alone gives a session that cannot write; the same request works after the code.
    const headers = sameOrigin(baseURL)
    const writeDraft = () =>
      page.request.post('/api/categories/?draft=true', {
        data: { title: 'Written in a 2FA test', slug: `two-factor-${Date.now()}` },
        headers,
      })
    expect((await writeDraft()).status()).toBe(403)

    // The form submits itself once all six digits are in.
    await page.locator('input[maxlength="1"]').first().click()
    await page.keyboard.type(totpCode(email))
    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.locator('.dashboard')).toBeVisible()

    const written = await writeDraft()
    expect(written.status()).toBe(201)
    const { doc } = await written.json()
    await page.request.delete(`/api/categories/${doc.id}/`, { headers })
  })

  test.describe('a new account', () => {
    test.use({ storageState: authFile('admin') })

    test('must set up an authenticator app before anything else', async ({
      page,
      browser,
      baseURL,
    }) => {
      const headers = sameOrigin(baseURL)
      const email = `new-${Date.now()}@two-factor.example.test`
      const newPassword = `pw-${crypto.randomUUID()}`
      const created = await page.request.post('/api/users/', {
        data: { email, password: newPassword, name: 'New contributor', roles: ['contributor'] },
        headers,
      })
      expect(created.ok(), await created.text()).toBe(true)
      const { doc } = await created.json()

      const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
      try {
        const fresh = await context.newPage()
        await submitLoginForm(fresh, email, newPassword)
        await expect(fresh).toHaveURL(/\/admin\/setup-totp\/?/)
        await fresh.goto('/admin/collections/insights/')
        await expect(fresh).toHaveURL(/\/admin\/setup-totp\/?/)
      } finally {
        await context.close()
        await page.request.delete(`/api/users/${doc.id}/`, { headers })
      }
    })
  })
})
