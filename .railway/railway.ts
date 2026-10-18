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
import {
  bucket,
  defineRailway,
  github,
  postgres,
  preserve,
  project,
  ref,
  service,
} from 'railway/iac'

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
      // Production refuses to deploy while published content still says TODO-CONTENT (brief §14
      // rule 3). Elsewhere `pnpm seed` runs, and is a no-op outside PR environments.
      preDeployCommand: [
        production
          ? 'pnpm payload migrate && pnpm check:content'
          : 'pnpm payload migrate && pnpm seed',
      ],
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
      PORT: '3000',
      NEXT_TELEMETRY_DISABLED: '1',
      S3_BUCKET: ref(media, 'BUCKET'),
      S3_ENDPOINT: ref(media, 'ENDPOINT'),
      S3_ACCESS_KEY_ID: ref(media, 'ACCESS_KEY_ID'),
      S3_SECRET_ACCESS_KEY: ref(media, 'SECRET_ACCESS_KEY'),
      S3_REGION: ref(media, 'REGION'),
      // The AI editor's model (brief §4). Its API key and budget are set by hand, on staging and
      // production only (docs/railway.md step 9).
      ANTHROPIC_MODEL: 'claude-sonnet-5-5',
      PAYLOAD_SECRET: preserve(),
      PREVIEW_SECRET: preserve(),
      REVALIDATE_SECRET: preserve(),
      CRON_SECRET: preserve(),
    },
  })

  return project('novare-web', { resources: [db, media, web] })
})
