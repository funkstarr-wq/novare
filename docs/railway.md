# Railway setup

Project `novare-web` (brief §4.1). The desired state lives in [`.railway/railway.ts`](../.railway/railway.ts)
(Railway Infrastructure as Code). Railway does **not** read that file during deploys: you apply it
with the Railway CLI (5.42.1 or newer), once per environment, and again whenever it changes.

| Environment     | Deploys from  | Notes                                                                      |
| --------------- | ------------- | -------------------------------------------------------------------------- |
| `production`    | `main`        | Created with the project.                                                  |
| `staging`       | `staging`     | Base environment for PR environments.                                      |
| PR environments | the PR branch | Ephemeral copy of `staging`, with its own Postgres. Seeded by `pnpm seed`. |

Every deploy runs `pnpm payload migrate && pnpm seed` before start. `pnpm seed` does nothing
outside PR environments (`src/lib/seed.ts`), so staging and production are never seeded.

## First-time setup

1. **Project and environments.** Create the project `novare-web` in the Railway dashboard, then add a
   `staging` environment (Settings → Environments → New Environment → Empty Environment).
2. **GitHub.** Give the Railway GitHub app access to `funkstarr-wq/novare`, and create the
   `staging` branch from `main`.
3. **Apply the config, per environment.** From the repo root:

   ```bash
   railway link                 # choose novare-web, then the environment
   railway config plan          # review: Postgres, media bucket, web service
   railway config apply
   ```

   Repeat for the other environment (`railway environment <name>` switches the linked one).

   **Postgres version.** Railway's Postgres template defaults to the latest major (18) in the
   account's default region. Before the first deploy, set the image to
   `ghcr.io/railwayapp-templates/postgres-ssl:16` and the region to `europe-west4-drams3a`. Once
   the volume holds data, changing the image tag does not convert it: the service crash-loops, and
   the only way out is a new volume (or a proper major-version upgrade).

4. **Secrets, per environment.** `.railway/railway.ts` only declares them (`preserve()`); set the
   values once on the `web` service in each environment, with fresh random values per environment
   (`openssl rand -hex 32`): `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`.
   Later milestones add the S3, Anthropic and Resend variables listed in `.env.example`.
5. **Domains.** Generate a Railway domain for `web` in each environment (service → Settings →
   Networking). PR environments only get domains automatically when the base environment's service
   uses a Railway-provided domain.
6. **PR environments.** Project Settings → Environments: enable PR Environments, set the base
   environment to `staging`, and enable Bot PR Environments if PRs are opened by Claude Code or other
   bots. On `staging`, set `SEED_ADMIN_EMAIL` and a throwaway `SEED_ADMIN_PASSWORD`: PR environments
   copy them and seed that admin user (staging itself ignores them).
7. **Backups.** Postgres service → Backups: enable daily backups in `production` and `staging`.
8. **Wait for CI.** On the `web` service, turn on Wait for CI so a deploy only starts once the
   GitHub Actions checks for that commit pass.

## Checking a deploy

- `https://<domain>/api/health/` returns `{"status":"ok","db":"ok"}` (it is also the healthcheck).
- `https://<domain>/` shows the placeholder home page; `https://<domain>/admin/` shows Payload.

Note the trailing slashes: the site runs with `trailingSlash: true`, so `/api/health` answers with a
308 redirect, which Railway's healthcheck does not follow.
