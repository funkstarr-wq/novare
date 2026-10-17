/**
 * Railway project `novare-web` (brief §4.1), as Railway Infrastructure as Code.
 *
 * Railway does not read this file during deploys: preview and apply it per environment with
 * `railway config plan` / `railway config apply` (see docs/railway.md). It replaces the brief's
 * `railway.json`, because Config as Code is deprecated and new services cannot use it.
 *
 * Secrets are never written here. `preserve()` keeps the value already set in Railway; set them
 * once per environment with `railway variables --set` as docs/railway.md describes.
 */
import { bucket, defineRailway, github, postgres, preserve, project, service } from 'railway/iac'

// EU West (Amsterdam): the closest Railway region to South Africa and Nigeria.
const REGION = 'europe-west4-drams3a'
const BUCKET_REGION = 'ams'

export default defineRailway((ctx) => {
  const production = ctx.isEnvironment('production')

  const db = postgres('Postgres', { region: REGION })
  const media = bucket('media', { region: BUCKET_REGION })

  const web = service('web', {
    source: github('funkstarr-wq/novare', { branch: production ? 'main' : 'staging' }),
    build: {
      builder: 'RAILPACK',
      buildCommand: 'pnpm install --frozen-lockfile && pnpm build',
    },
    deploy: {
      // `pnpm seed` is a no-op outside PR environments (src/lib/seed.ts).
      preDeployCommand: ['pnpm payload migrate && pnpm seed'],
      startCommand: 'pnpm start',
      // Trailing slash: `trailingSlash: true` 308s `/api/health`, and Railway's healthcheck
      // needs a direct 200.
      healthcheckPath: '/api/health/',
      healthcheckTimeout: 120,
      restartPolicyType: 'ON_FAILURE',
      restartPolicyMaxRetries: 5,
      region: REGION,
    },
    env: {
      DATABASE_URL: db.env.DATABASE_URL,
      NEXT_PUBLIC_SERVER_URL: 'https://${{RAILWAY_PUBLIC_DOMAIN}}',
      PAYLOAD_DB_PUSH: 'false',
      PAYLOAD_SECRET: preserve(),
      PREVIEW_SECRET: preserve(),
      REVALIDATE_SECRET: preserve(),
      CRON_SECRET: preserve(),
    },
  })

  return project('novare-web', { resources: [db, media, web] })
})
