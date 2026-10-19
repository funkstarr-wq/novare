import AxeBuilder from '@axe-core/playwright'
import { type APIRequestContext, expect, test } from '@playwright/test'

import { authFile, sameOrigin, seeded } from './support/auth'

// M5 (brief §10.8): an editor changes a hero heading by prompt, previews the draft, publishes,
// and the page shows the new heading. The server runs the scripted model (AI_MOCK=1), so no
// API key or credit is needed.
const mocked = process.env.AI_MOCK === '1'

async function asAdmin(
  browser: import('@playwright/test').Browser,
  baseURL: string | undefined,
  run: (request: APIRequestContext) => Promise<void>,
) {
  const context = await browser.newContext({ storageState: authFile('admin'), baseURL })
  try {
    await run(context.request)
  } finally {
    await context.close()
  }
}

test.describe('AI editor', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
  test.skip(!mocked, 'AI_MOCK=1 not set on the server')
  test.use({ storageState: authFile('editor') })

  const slug = `ai-e2e-${Date.now()}`
  let pageId: number

  test.beforeAll(async ({ browser, baseURL }) => {
    await asAdmin(browser, baseURL, async (request) => {
      const headers = sameOrigin(baseURL)
      const settings = await request.post('/api/globals/ai-settings/', {
        headers,
        data: { enabled: true, monthlyBudgetUSD: 5 },
      })
      expect(settings.ok()).toBe(true)
      const created = await request.post('/api/pages/', {
        headers,
        data: {
          title: 'AI e2e page',
          slug,
          hero: { heading: 'Heading before' },
          _status: 'published',
        },
      })
      expect(created.ok()).toBe(true)
      pageId = ((await created.json()) as { doc: { id: number } }).doc.id
    })
  })

  test.afterAll(async ({ browser, baseURL }) => {
    await asAdmin(browser, baseURL, async (request) => {
      const headers = sameOrigin(baseURL)
      if (pageId) await request.delete(`/api/pages/${pageId}/`, { headers })
      await request.post('/api/globals/ai-settings/', { headers, data: { enabled: false } })
    })
  })

  test('changes a hero heading by prompt, previews, publishes', async ({ page, context }) => {
    await page.goto(`/admin/collections/pages/${pageId}/`)
    await page.getByRole('button', { name: 'AI assistant' }).click()
    const panel = page.getByRole('region', { name: 'AI assistant' })
    await expect(panel.getByText(/Budget left this month/)).toBeVisible()

    await panel.getByLabel('What should change?').fill('Change the hero heading to "Heading after"')
    await panel.getByRole('button', { name: 'Send' }).click()

    await expect(panel.getByRole('heading', { name: 'Proposed changes' })).toBeVisible()
    const row = panel.getByRole('row', { name: /hero\.heading/ })
    await expect(row).toContainText('Heading before')
    await expect(row).toContainText('Heading after')

    await panel.getByRole('button', { name: 'Apply to draft' }).click()
    await expect(panel.getByText(/Saved as a draft/)).toBeVisible()

    // The draft is in the preview; the live page is unchanged.
    const preview = await panel
      .getByRole('link', { name: 'Open live preview' })
      .getAttribute('href')
    const previewTab = await context.newPage()
    await previewTab.goto(preview!)
    await expect(previewTab.locator('h1')).toHaveText('Heading after')
    await previewTab.getByRole('button', { name: 'Exit preview' }).click()
    await previewTab.goto(`/${slug}/`)
    await expect(previewTab.locator('h1')).toHaveText('Heading before')

    // Closing the assistant reloads the editor with the draft; publishing makes it live.
    await page.keyboard.press('Escape')
    await expect(page.locator('#field-hero__heading')).toHaveValue('Heading after')
    await page.locator('#action-save').click()
    await expect(page.getByText(/published successfully|Updated successfully/i)).toBeVisible()

    await expect(async () => {
      await previewTab.goto(`/${slug}/`)
      await expect(previewTab.locator('h1')).toHaveText('Heading after', { timeout: 1000 })
    }).toPass({ timeout: 15_000 })
  })
})

test.describe('AI assistant page @a11y', () => {
  test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
  test.use({ storageState: authFile('editor') })

  test('has no serious or critical axe violations in the assistant', async ({ page }) => {
    await page.goto('/admin/assistant/')
    await expect(page.getByRole('heading', { name: 'AI assistant', level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Your requests' })).toBeVisible()

    const results = await new AxeBuilder({ page })
      .include('.ai-view')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(blocking.map(({ id, help, nodes }) => ({ id, help, nodes: nodes.length }))).toEqual([])
  })
})
