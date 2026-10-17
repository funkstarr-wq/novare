# Decisions and assumptions

A running log of choices made during the build, newest milestone first. Deviations from
[`BUILD_BRIEF.md`](BUILD_BRIEF.md) are marked **Deviation** and flagged in the milestone's PR.
Open items that need an answer from Novare or the agency are marked **Needs decision**.

## M2 — Roles, approval, audit (2026-10-17)

### Role matrix (brief §6.1)

| Action                                                                                | contributor | editor | compliance | admin |
| ------------------------------------------------------------------------------------- | :---------: | :----: | :--------: | :---: |
| Read drafts, save drafts                                                              |     yes     |  yes   |    yes     |  yes  |
| Publish / unpublish ordinary content                                                  |      –      |  yes   |    yes     |  yes  |
| Publish regulated content (solutions, funds, legal documents, pages marked regulated) |      –      |   –    |    yes     |  yes  |
| Approve or request changes                                                            |      –      |   –    |    yes     |  yes  |
| Edit FSP licence numbers and disclaimers                                              |      –      |   –    |    yes     |  yes  |
| Create or edit legal documents                                                        |      –      |   –    |    yes     |  yes  |
| Delete ordinary content, media, redirects, forms                                      |      –      |  yes   |    yes     |  yes  |
| Delete regulated content                                                              |      –      |   –    |    yes     |  yes  |
| Header, footer, site settings                                                         |      –      |  yes   |    yes     |  yes  |
| AI settings, users, roles                                                             |      –      |   –    |     –      |  yes  |
| Read the audit log                                                                    |      –      |   –    |    yes     |  yes  |

1. **Access lives in `src/access/`, applied by `withContentRules`** (`src/collections/shared.ts`) to
   every content collection, so the rules are written once. A collection's own `access` entries
   win (legal documents use that to restrict editing to compliance).
2. **Publishing is checked twice.** The `create`/`update` access functions refuse
   `_status: 'published'` to roles that may not publish. Payload calls the same functions to
   decide whether to show the Publish button, so contributors never see it. Because a stale admin
   tab or an API client can still send it, a `beforeChange` hook (`src/hooks/approvalGuard.ts`)
   checks again against the stored document, including whether a page is already marked regulated.
3. **Review state is enforced by the hook, not field access.** Payload strips fields a user may
   not write before hooks run, which would also hide the attempt. Instead the hook refuses
   `approved` / `changes_requested` from anyone but compliance and admins, always sets
   `reviewedBy` / `reviewedAt` itself, sends any edit to content after approval back to `draft`,
   and records a compliance publish as an approval.
4. **Submit for review** is a button in the review panel that calls
   `POST /api/<collection>/<id>/submit-for-review/`. It sets the draft to `in_review` with the
   caller's own permissions and emails every compliance user (through Payload's email, which logs
   to the console until Resend is set up in M7).
5. **Users cannot change their own roles.** Admins create accounts and assign roles. Everyone else
   may edit only their own name and password.
6. **Needs decision: 2FA for admin, editor and compliance (§6.1).** Payload 3 has no built-in
   2FA, and the brief prefers built-ins and official plugins. Default: put `/admin/*` behind
   Cloudflare Access with MFA in M7, which needs no code and covers every role. The alternative
   is the community `payload-totp` plugin (TOTP inside Payload). It was not adopted without
   approval, because it is third-party code on the login path of a regulated site.

### Audit log (brief §6.3)

7. **Every create, update, publish and delete is logged**, on collections and globals, with the
   user, the source (`human`, or `ai` when the AI editor applies a changeset in M5) and a short
   summary of which top-level fields changed. Globals are logged as `global:<slug>`. Entries are
   written with access overridden, and no role can edit or delete them through the API.
8. **Admin autosaves are not logged.** Autosave writes every few seconds while someone types; the
   explicit save or publish that follows is logged with the full change.
9. **Known limitation: unpublishing is logged as `update`.** Payload's hooks cannot tell an
   unpublish apart from saving a new draft over a published document.

### Revalidation (brief §6.4)

10. **Publishing, unpublishing or deleting revalidates** the document's own URL, its old URL if the
    slug changed, the listing and home pages that show it (a map per collection in
    `src/hooks/revalidate.ts`), and `/sitemap.xml`. It also revalidates a cache tag named after
    the collection, which M3's data fetching will use. Draft saves of unpublished documents do
    nothing. Globals revalidate the whole site layout. The seed turns revalidation off.

## M1 — Data model (2026-10-17)

### Deviations from the brief

1. **Deviation: office `geo` is two numbers (latitude, longitude), not a `point` field.** Payload's
   `point` type needs the PostGIS extension, which neither Railway's standard Postgres nor CI's
   `postgres:16` image provides. Map links and LocalBusiness JSON-LD only need the two numbers.
2. **Deviation: the SEO field group is named `meta`** (the SEO plugin's own name, shown as an "SEO"
   tab), not `seo`.
3. **Deviation: `relatedLinks` holds links (to any page on the site or an external URL), not only
   links to uploaded documents.** Uploaded files have their own block, `documentDownloads`.

### Data model

4. **Localization is configured, English only, and no field is marked `localized` yet.** Every
   locale-aware API is in place, but marking fields localized now would put every text field in
   per-locale tables for a language that may never come. **Needs decision** when a second language
   is confirmed: which fields to translate. Retrofitting `localized: true` needs a data migration.
5. **Drafts with autosave and 50 versions apply to every content collection**, including offices,
   awards, press mentions and categories (the brief asks for "public-facing" ones). Slug and SEO
   go only to collections with their own URL. Users, media, documents and the system collections
   have no drafts.
6. **Regulated collections** (solutions, funds, legal documents) carry `custom.regulated: true`;
   pages have a `regulated` checkbox. The approval guard and `review` field group arrive in M2.
7. **Slugs use Payload's built-in `slugField`** (generated from the title until edited or published)
   with our own slugify: ASCII, lowercase, hyphens only, so "Wealth & Invest" → `wealth-invest`
   as in the redirect map. A missing slug is filled before collection hooks run, so documents
   created through the API get correct page paths (the nested-docs breadcrumbs need the slug).
8. **Pages have a stored, unique `path`** (`/about/history/`, home is `/`), computed from the
   nested-docs breadcrumbs and updated when a parent moves, so routing (M3) is one indexed lookup.
9. **Rich text is limited to the AI editor's subset** (§10.4): paragraphs, h2–h4, bold, italic,
   lists, quotes and links. Insights additionally embed quote, image, chart and callout blocks.
10. **Links are a shared `link` field**: a label plus either a reference to any document with a URL
    or an external `https://` URL. No styling options.
11. **`users`**: `name` and `roles` (admin, editor, compliance, contributor; default contributor).
    The first account on an empty database becomes admin. The M1 migration gives existing accounts
    (the staging owner) the admin role and their email as name. 2FA, per-role access and field-level
    rules are M2.
12. **`ai-changesets` and `audit-log` exist now but cannot be written through the API**; they are
    read-only to admins (audit log: admins and compliance). M2 and M5 write to them from the server.
13. **Media and documents use S3 storage only when `S3_BUCKET` is set**, so local dev and CI keep
    using local disk. `alwaysInsertFields` keeps the database schema identical either way.
14. **Login lockout** (5 attempts, 15 minutes) is set on users now, as it's one line of config
    (§12).
15. **`funds.minimumInvestment` is text**, so it can be shown exactly as Novare writes it
    ("R 1 000 000"). `projects.country` is free text until the offices' country list is known.

### Seed and content checks

16. **`pnpm seed` creates development content**: every collection, all 19 blocks, the four §9 enquiry
    forms and the globals. Names are obviously fake ("Alex Example") and every fact is a
    `TODO-CONTENT:` placeholder. The five solution names come from the brief's redirect map.
    Items are created once and never overwritten. `SEED_CONTENT=false` seeds only the admin user.
17. **`pnpm check:content` fails when published content contains `TODO-CONTENT`** (§14 rule 3). It
    is production's pre-deploy step in `.railway/railway.ts`, so placeholder copy cannot reach the
    live site. Drafts are ignored.

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
