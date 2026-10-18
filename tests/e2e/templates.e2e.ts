import { expect, test } from '@playwright/test'

import { templates } from './support/templates'

// M3 "done when": every template renders seeded data with one h1 (brief §13).
test.describe('templates', () => {
  for (const { name, path } of templates) {
    test(`${name} renders with one h1, a title and breadcrumbs`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)

      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page).toHaveTitle(/Novare/)
      await expect(page.getByRole('banner')).toBeVisible()
      await expect(page.getByRole('contentinfo')).toBeVisible()

      const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
      if (path === '/') {
        await expect(breadcrumbs).toHaveCount(0)
      } else {
        await expect(breadcrumbs.locator('[aria-current="page"]')).toHaveCount(1)
      }
    })
  }

  test('a missing page answers 404 with search and links', async ({ page }) => {
    const response = await page.goto('/no-such-page/')
    expect(response?.status()).toBe(404)
    // Next.js 16 renders the 404 UI in the browser (docs/decisions.md, M3).
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
    await expect(page.getByRole('searchbox', { name: 'Search the site' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home page', exact: true })).toBeVisible()
  })

  test('an unknown document under a template answers 404', async ({ request }) => {
    for (const path of [
      '/solutions/no-such-solution/',
      '/insights/?page=999',
      '/research/hedge-fund-survey/abcd/',
    ]) {
      expect((await request.get(path)).status(), path).toBe(404)
    }
  })
})

test.describe('images', () => {
  test('load through next/image on the home page', async ({ page }) => {
    await page.goto('/')
    const image = page.getByRole('main').locator('img').first()
    await expect(image).toBeVisible()
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
      .toBeGreaterThan(0)
  })
})

test.describe('navigation', () => {
  test('menus open with aria-expanded and close with Escape', async ({ page }) => {
    await page.goto('/')
    const toggle = page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('button', { name: 'Solutions' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('link', { name: 'Investment Consulting' }).first()).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toBeFocused()
  })

  test('the menu is a drawer on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main' })
    const menu = nav.getByRole('button', { name: 'Menu' })
    await expect(nav.getByRole('link', { name: 'Insights' })).toBeHidden()

    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await nav.getByRole('link', { name: 'Insights' }).click()
    await expect(page).toHaveURL(/\/insights\/$/)
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('forms and search', () => {
  test('the contact form sends a submission and shows the confirmation', async ({ page }) => {
    await page.goto('/contact/')
    const form = page.locator('#contact-form form')
    await form.getByLabel('Name').fill('E2E Visitor')
    await form.getByLabel('Email').fill('visitor@example.test')
    await form.getByRole('combobox').selectOption({ index: 1 })
    await form.getByLabel('Message').fill('Sent by the end-to-end tests.')
    await form.getByRole('checkbox').check()
    await form.getByRole('button').click()
    await expect(page.locator('#contact-form [role="status"]')).toBeVisible()
  })

  test('search finds published content', async ({ page }) => {
    await page.goto('/search/')
    await page.getByRole('searchbox', { name: 'Search the site' }).fill('placeholder')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/\/search\/\?q=placeholder/)
    await expect(page.getByRole('link', { name: 'Placeholder article one' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
