import { expect, test } from '@playwright/test'

import { authFile, seeded } from './support/auth'

// Live preview (brief §8.5): the preview link needs the secret and a verified CMS session.
const secret = process.env.PREVIEW_SECRET
const previewURL = (path: string, key = secret!) =>
  `/api/preview/?${new URLSearchParams({ secret: key, path })}`

test.describe('live preview', () => {
  test.skip(!secret, 'PREVIEW_SECRET not set')

  test('refuses a wrong secret, an unsafe path and a visitor without a session', async ({
    request,
  }) => {
    expect((await request.get(previewURL('/', 'wrong'), { maxRedirects: 0 })).status()).toBe(401)
    expect((await request.get(previewURL('//evil.example/'), { maxRedirects: 0 })).status()).toBe(
      400,
    )
    expect((await request.get(previewURL('/'), { maxRedirects: 0 })).status()).toBe(403)
  })

  test.describe('signed in', () => {
    test.skip(!seeded, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set (run `pnpm seed`)')
    test.use({ storageState: authFile('editor') })

    test('turns on draft mode and back off', async ({ page }) => {
      await page.goto(previewURL('/about/'))
      await expect(page).toHaveURL(/\/about\/$/)
      const banner = page.getByText('You are viewing a draft preview.')
      await expect(banner).toBeVisible()

      await page.getByRole('button', { name: 'Exit preview' }).click()
      await expect(page).toHaveURL(/\/\?*$/)
      await expect(banner).toHaveCount(0)
    })
  })
})
