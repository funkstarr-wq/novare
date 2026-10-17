# novare-web

Headless rebuild of [novare.com](https://novare.com): Payload CMS 3 + Next.js 16 on PostgreSQL,
hosted on Railway.

- Brief and milestones: [`docs/BUILD_BRIEF.md`](docs/BUILD_BRIEF.md)
- Decisions and deviations: [`docs/decisions.md`](docs/decisions.md)
- Railway setup: [`docs/railway.md`](docs/railway.md)
- Working conventions and commands: [`CLAUDE.md`](CLAUDE.md)

## Local development

Requires Node 22, pnpm 10 (`corepack enable`) and PostgreSQL 16.

```bash
cp .env.example .env          # set DATABASE_URL, TEST_DATABASE_URL, PAYLOAD_SECRET
createdb novare && createdb novare_test
pnpm install
pnpm dev                      # http://localhost:3000, admin at http://localhost:3000/admin/
```

The first visit to `/admin/` asks you to create the first user (or set `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` and run `pnpm seed`).

## Checks

`pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm test:a11y`
and `pnpm lhci` mirror the CI jobs in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
