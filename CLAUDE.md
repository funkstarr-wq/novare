# CLAUDE.md

Novare.com rebuild: Payload CMS 3 + Next.js 16 (App Router) in one codebase, PostgreSQL, hosted on
Railway. The scope and milestones are in `docs/BUILD_BRIEF.md`; read the section for the milestone
you are working on. Decisions and deviations are logged in `docs/decisions.md`.

## Commands

```bash
pnpm dev                 # Next + Payload on http://localhost:3000 (admin at /admin/)
pnpm build && pnpm start # production build; must succeed with no DATABASE_URL
pnpm lint                # ESLint, zero warnings allowed
pnpm format:check        # Prettier (pnpm format to fix)
pnpm typecheck           # next typegen + tsc --noEmit
pnpm test                # Vitest: unit + integration (needs Postgres, TEST_DATABASE_URL)
pnpm test:unit           # unit only, no database
pnpm test:e2e            # Playwright (starts pnpm dev unless PLAYWRIGHT_BASE_URL is set)
pnpm test:a11y           # Playwright + axe, tests tagged @a11y
pnpm lhci                # Lighthouse CI against pnpm start (build first)
pnpm generate            # payload generate:types + generate:importmap
pnpm payload migrate:create <name>   # after any schema change
pnpm payload migrate     # apply migrations
pnpm seed                # dev content, fake names + TODO-CONTENT (local, CI, PR envs only)
pnpm check:content       # fail if published content still contains TODO-CONTENT
```

Local Postgres: copy `.env.example` to `.env`; create the dev and test databases it names.

## Rules (brief §14)

1. One milestone at a time, on a branch `m<n>/<short-name>`, ending in a PR with green CI. Write the
   plan and assumptions in the PR description or `docs/decisions.md` first. Conventional commits.
2. **Never invent Novare content**: names, numbers, dates, performance, awards, licence numbers.
   Use `TODO-CONTENT: …` placeholders.
3. Data model changes ship together: Payload config → `pnpm generate` → `pnpm payload migrate:create`
   → commit all three. CI fails on stale types, import map or migrations.
4. No secrets in code, logs, fixtures or commits. Railway holds them (`docs/railway.md`).
5. Prefer Payload built-ins and official plugins over custom code; server components over client.
6. Every route/template ships with metadata, JSON-LD where applicable, an e2e smoke test and an
   axe check (add it to `templates` in `tests/e2e/a11y.e2e.ts`).
7. When the brief conflicts with current Payload/Next/Railway docs, follow the docs, log the
   deviation in `docs/decisions.md` and flag it in the PR.
8. Ask (PR comment) rather than guess on compliance matters, URL changes outside the redirect map,
   and deleting content.

## Things that bite

- `trailingSlash: true`: every route, including `/api/*` and `/admin/*`, 308s to the slash form.
  Use slash URLs in links, tests and health checks (`/api/health/`).
- The build has no database (Railway builds have no private network). Anything that reads Payload
  must render dynamically, or use `generateStaticParams` that returns `[]` without a DB.
- Local dev pushes schema automatically; CI and Railway run migrations (`PAYLOAD_DB_PUSH=false`).
  A schema change without a migration passes locally and fails CI.
- Front-end styling uses only the tokens in `src/styles/globals.css`; Tailwind's default palette is
  cleared on purpose. Tailwind is loaded by the `(frontend)` layout only, never in the admin.
- `src/app/(payload)/`, `src/payload-types.ts` and `src/migrations/` are generated: regenerate,
  don't hand-edit.
- Railway config is `.railway/railway.ts` (IaC), applied with the Railway CLI, not read at deploy.
- A select field named `status` on a collection with drafts collides with Payload's `_status`
  enum in Postgres: give it its own `enumName`. Avoid `point` fields (they need PostGIS).
- Migrations are generated, but may be hand-edited for data backfills; mark the edit with a
  comment. Collections live in `src/collections/`, page sections in `src/blocks/`, shared field
  builders (slug, link, seo tab, rich text, layout) in `src/fields/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
