import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PORT ?? 3000)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: {
      // Lets a machine with a preinstalled Chromium run the suite without `playwright install`.
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // CI tests the production build (`pnpm build` first); locally the dev server is fine.
        command: process.env.CI ? 'pnpm start' : 'pnpm dev',
        url: `${baseURL}/api/health/`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
})
