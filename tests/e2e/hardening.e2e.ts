import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

import { authFile, sameOrigin, seeded } from './support/auth'

// M7 (brief §9, §12): security headers, a CSP the site and admin run under, the spam-checked
// contact form, and the cookie banner.
const cspViolations = (page: Page) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text())
  })
  return violations
}

test.describe('security headers', () => {
  test('are sent on the site and the admin', async ({ request }) => {
    for (const path of ['/', '/admin/login/']) {
      const response = await request.get(path)
      const headers = response.headers()
      expect(headers['content-security-policy'], path).toContain("default-src 'self'")
      expect(headers['content-security-policy'], path).toContain("frame-ancestors 'self'")
      expect(headers['x-content-type-options'], path).toBe('nosniff')
      expect(headers['referrer-policy'], path).toBe('strict-origin-when-cross-origin')
      expect(headers['permissions-policy'], path).toContain('camera=()')
      expect(headers['x-frame-options'], path).toBe('SAMEORIGIN')
    }
    const admin = (await request.get('/admin/login/')).headers()['content-security-policy']
    const site = (await request.get('/')).headers()['content-security-policy']
    expect(admin).toContain('https://cdn.jsdelivr.net')
    expect(site).not.toContain('https://cdn.jsdelivr.net')
  })

  test('the public site runs without CSP violations', async ({ page }) => {
    const violations = cspViolations(page)
    for (const path of ['/', '/contact/', '/insights/']) {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)
    }
    expect(violations).toEqual([])
  })

  test.describe('signed in', () => {
    test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
    test.use({ storageState: authFile('admin') })

    test('the admin runs without CSP violations', async ({ page }) => {
      const violations = cspViolations(page)
      await page.goto('/admin/')
      await expect(page.locator('.dashboard')).toBeVisible()
      await page.goto('/admin/collections/pages/')
      await expect(page.locator('.collection-list')).toBeVisible()
      expect(violations).toEqual([])
    })
  })
})

test.describe('contact form', () => {
  test.skip(!seeded, 'needs the seeded contact page (run `pnpm seed`)')

  test('sends an enquiry through the spam-checked endpoint', async ({ page }) => {
    await page.goto('/contact/')
    const form = page.locator('#contact-form form')
    const token = page.waitForResponse((response) => response.url().includes('/api/form-token/'))
    await token
    await form.getByLabel('Name').fill('E2E Visitor')
    await form.getByLabel('Email').fill('e2e-visitor@example.test')
    await form.getByLabel('Topic').selectOption({ index: 1 })
    await form.getByLabel('Message').fill('Hello from the end-to-end tests.')
    await form.getByRole('checkbox', { name: /I agree/ }).check()
    // The time-to-submit check refuses forms sent within two seconds of loading.
    await page.waitForTimeout(2_100)
    await form.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByRole('status')).toContainText('Thank you')
  })

  test('the hidden honeypot field is out of sight and out of the tab order', async ({ page }) => {
    await page.goto('/contact/')
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveAttribute('tabindex', '-1')
    await expect(honeypot).not.toBeInViewport()
  })
})

test.describe('cookie banner', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
  test.describe.configure({ mode: 'serial' })

  const setBanner = async (
    browser: import('@playwright/test').Browser,
    baseURL: string | undefined,
    enabled: boolean,
  ) => {
    const context = await browser.newContext({ storageState: authFile('admin'), baseURL })
    const response = await context.request.post('/api/globals/site-settings/', {
      headers: sameOrigin(baseURL),
      data: { cookieBanner: { enabled } },
    })
    expect(response.ok()).toBe(true)
    await context.close()
  }

  test.beforeAll(async ({ browser, baseURL }) => setBanner(browser, baseURL, true))
  test.afterAll(async ({ browser, baseURL }) => setBanner(browser, baseURL, false))

  test('asks once, remembers the choice, and can be reopened @a11y', async ({ page, context }) => {
    const banner = page.getByRole('region', { name: 'Cookie choices' })
    await expect(async () => {
      await page.goto('/about/')
      await expect(banner).toBeVisible({ timeout: 1_000 })
    }).toPass({ timeout: 15_000 })

    const results = await new AxeBuilder({ page })
      .include('section[aria-label="Cookie choices"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(
      results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
    ).toEqual([])

    await banner.getByRole('button', { name: 'Decline' }).click()
    await expect(banner).toHaveCount(0)
    const cookies = await context.cookies()
    expect(cookies.find((cookie) => cookie.name === 'novare_consent')?.value).toBe('declined')

    await page.reload()
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(banner).toHaveCount(0)

    await page.getByRole('button', { name: 'Cookie settings' }).click()
    await expect(banner).toBeVisible()
  })
})
