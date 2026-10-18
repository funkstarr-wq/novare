import fs from 'node:fs'
import path from 'node:path'

import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { Secret, TOTP } from 'otpauth'

import type { Role } from '@/collections/Users'

// Signed-in sessions for the seeded users (`pnpm seed`), made once by `auth.setup.ts`.
// Everything here is throwaway test state: local e2e databases and CI only.
export const adminEmail = process.env.SEED_ADMIN_EMAIL
export const password = process.env.SEED_ADMIN_PASSWORD
export const seeded = Boolean(adminEmail && password)
export const ROLES = ['admin', 'editor', 'compliance', 'contributor'] as const satisfies Role[]

const authDir = path.resolve('playwright/.auth')
const secretsFile = path.join(authDir, 'totp-secrets.json')

export const roleEmail = (role: Role) =>
  role === 'admin' ? adminEmail! : `${role}@${adminEmail!.split('@')[1]}`

export const authFile = (role: Role) => path.join(authDir, `${role}.json`)

function readSecrets(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(secretsFile, 'utf8'))
  } catch {
    return {}
  }
}

function saveSecret(email: string, secret: string) {
  fs.mkdirSync(authDir, { recursive: true })
  fs.writeFileSync(secretsFile, JSON.stringify({ ...readSecrets(), [email]: secret }, null, 2))
}

// Matches payload-totp's defaults (SHA1, 6 digits, 30 s).
const totpFor = (secret: string) => new TOTP({ secret: Secret.fromBase32(secret) })

/** The current code for an account `enroll` has set up. */
export function totpCode(email: string): string {
  const secret = readSecrets()[email]
  if (!secret) {
    throw new Error(
      `No 2FA secret for ${email} in ${secretsFile}. Recreate the e2e database and seed it again.`,
    )
  }
  return totpFor(secret).generate()
}

/**
 * Headers for API calls made with a session cookie. Payload ignores the cookie on requests that
 * don't show they come from the site itself (CSRF protection); browsers send `Origin` or
 * `Sec-Fetch-Site`, Playwright's API client sends neither.
 */
export const sameOrigin = (baseURL: string | undefined) => ({ Origin: new URL(baseURL!).origin })

/** Signs in with a password, then sets up or enters the 2FA code, through the API. */
export async function signIn(
  request: APIRequestContext,
  baseURL: string | undefined,
  email: string,
  pass = password!,
) {
  const headers = sameOrigin(baseURL)
  const login = await request.post('/api/users/login/', {
    data: { email, password: pass },
    headers,
  })
  expect(login.ok(), `password login for ${email}`).toBe(true)

  // An account that has set up 2FA but not entered a code yet cannot even read itself, so the
  // saved secret is what says whether it is enrolled.
  let result: { ok?: boolean }
  if (readSecrets()[email]) {
    const res = await request.post('/api/verify-totp/', {
      data: { token: totpCode(email) },
      headers,
    })
    result = await res.json()
  } else {
    const secret = new Secret().base32
    const res = await request.post('/api/setup-totp/', {
      data: { secret, token: totpFor(secret).generate() },
      headers,
    })
    result = await res.json()
    if (result.ok) saveSecret(email, secret)
  }
  expect(result, `2FA for ${email}: ${JSON.stringify(result)}`).toMatchObject({ ok: true })
}

/** Fills the admin login form; what follows depends on the account's 2FA state. */
export async function submitLoginForm(page: Page, email: string, pass = password!) {
  await page.goto('/admin/login/')
  await page.locator('#field-email').fill(email)
  await page.locator('#field-password').fill(pass)
  await page.locator('button[type="submit"]').click()
}
