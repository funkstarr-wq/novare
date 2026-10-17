# Decisions and assumptions

A running log of choices made during the build, newest milestone first. Deviations from
[`BUILD_BRIEF.md`](BUILD_BRIEF.md) are marked **Deviation** and flagged in the milestone's PR.
Open items that need an answer from Novare or the agency are marked **Needs decision**.

## M0 — Bootstrap (2026-10-17)

### Deviations from the brief

1. **Deviation: `.railway/railway.ts` instead of `railway.json`.** Railway has deprecated Config as
   Code (`railway.json` / `railway.toml`): new services cannot use it, and existing files stop being
   read on 2026-12-01. Its replacement, Infrastructure as Code, is a TypeScript file applied with the
   Railway CLI (`railway config plan` / `apply`); Railway does not read it during deploys. The file
   carries the brief's §4.2 settings: Railpack, the same build, pre-deploy, start, healthcheck timeout
   and restart policy. Setup steps are in [`railway.md`](railway.md).
2. **Deviation: healthcheck path is `/api/health/`, not `/api/health`.** With `trailingSlash: true`
   (§7), `/api/health` answers with a 308, and Railway's healthcheck requires a direct 200 and does
   not follow redirects. Payload's REST API and admin work with trailing slashes (covered by e2e).
3. **Deviation: the pre-deploy command also runs `pnpm seed`.** The brief wants PR environments
   seeded, but IaC cannot target ephemeral environments, and PR environments copy their base
   environment's settings. So every deploy runs `pnpm payload migrate && pnpm seed`, and the seed
   script only acts when `RAILWAY_ENVIRONMENT_NAME` looks like a PR environment (`…-pr-<n>`), or
   locally/in CI. Staging and production skip it. _Verify the PR environment naming on the first
   PR environment; `ALLOW_SEED=true` is the escape hatch._
4. **Deviation: the codebase starts from the blank template, but without its Docker files,
   `.vscode`, `.npmrc` and demo route.** Railway builds with Railpack, and pnpm needs no
   `legacy-peer-deps`.

### Stack and tooling

5. **Pinned versions.** Payload 3.91.0 (latest stable), Next.js 16.3.8, React 19.2.6, TypeScript
   5.9.3, ESLint 9, Vitest 4, Playwright 1.58.2, Tailwind 4.3.3, Node 22 (`.nvmrc`, `engines`),
   pnpm 10.28 (`packageManager`). Next 16.4.x and TypeScript 7 are out, but Payload 3.91's template
   is built on Next 16.3 and TypeScript 5; 16.4.2 was two days old. Upgrades go through a PR with
   green CI.
6. **Schema push locally, migrations everywhere else.** Local `pnpm dev` pushes schema changes
   (Payload's default). CI and every Railway environment set `PAYLOAD_DB_PUSH=false` and run the
   committed migrations in `src/migrations/`. CI fails if generated types, the admin import map or
   migrations are stale (`payload migrate:create --skip-empty` must produce nothing).
7. **The build never touches the database.** Routes that read Payload are dynamic; the placeholder
   home page is static. CI's `build-no-db` job builds with no `DATABASE_URL` and no
   `PAYLOAD_SECRET`, and the e2e, a11y and Lighthouse jobs run _that_ build against Postgres, which
   proves the Railway build works once deployed.
8. **Tests.** Vitest has two projects: `unit` (no I/O) and `integration` (real Postgres; locally
   `TEST_DATABASE_URL` keeps them off dev data). Playwright runs against `pnpm dev` locally and
   against the production build in CI; tests tagged `@a11y` form the a11y job.
9. **Lighthouse CI** runs via `pnpm dlx @lhci/cli@0.15.1` (pinned in the `lhci` script) rather than
   a dev dependency, to keep installs lean. Median of 5 runs, mobile emulation, budgets from §8.4.
   In M0 it covers `/` only; the solution and insight templates join in M3.
10. **Payload telemetry is off** (`telemetry: false`).
11. **Tailwind's default palette is cleared** in `src/styles/globals.css`, so components can only
    use the theme tokens (§8.1). The tokens are a neutral placeholder.
12. **Placeholder favicon** (a plain "N" monogram in the placeholder brand colour) until brand assets
    arrive; without one, Lighthouse loses best-practice points for the `/favicon.ico` 404.
13. **No email adapter yet.** Payload logs emails to the console until Resend is configured (M7).
14. **`pnpm audit --prod` in CI is left to M7 (hardening)**, where §12 and the M7 checklist put it.

### Measured budgets and risks (placeholder home page, local, mobile emulation)

15. **Needs decision: the < 90 KB JS target (§8.2) is below Next 16's baseline.** The placeholder
    has no client components, yet ships about 135 KB of gzipped JS (React DOM ~71 KB, Next runtime
    ~43 KB, the rest small chunks). Proposal: measure our own client JS on top of that baseline
    (e.g. ≤ 25 KB per content page) and re-check in M3 whether a webpack build is lighter.
16. **TBT and LCP have little headroom.** Lighthouse gives the placeholder 98–99 performance, but
    TBT ranged 84–139 ms (budget 150 ms) and LCP 1.7–1.8 s (budget 2.0 s) across runs. M3 must keep
    client JS minimal and should consider inlining the front end's critical CSS.
17. **Staging and PR environments are indexable for now.** M4 should send `noindex` on every host
    except production, so no Railway domain gets indexed.
