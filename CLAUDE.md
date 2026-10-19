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
- 2FA (payload-totp) wraps every access function and refuses requests without a verified
  session. A new collection, global or operation the public site needs must opt out with
  `custom: publicOperations(...)` (`src/access`), or visitors get 403s. Keep the plugin last.
- Front end: read Payload only through `src/lib/queries.ts` (cached per collection tag, drafts
  bypass the cache) and build URLs with `src/lib/urls.ts` (`pathFor`, `fileURL`). Payload's file
  URLs are absolute with a trailing slash; `next/image` rejects them, so use `fileURL`.
- Every public route: `generateMetadata` through `routeMetadata` (`src/lib/metadata.ts`), JSON-LD
  through `src/lib/jsonld.ts` + `<JsonLd>`, and `redirectOrNotFound(path)` instead of `notFound()`
  so the redirects collection is checked first. The frontend layout must not await data itself.
- Content routes render on first request and are cached (`generateStaticParams` returns `[]`).
  Locally, `.next/cache` outlives a database reset: delete `.next` after reseeding.
- Next.js 16 sends `notFound()` pages as an empty shell that the browser fills in: test 404 UI
  in Playwright, not with `curl`.
- Admin e2e tests reuse sessions made by `tests/e2e/auth.setup.ts`; API calls in tests need
  `headers: sameOrigin(baseURL)`, or Payload ignores the session cookie.
- AI editor (`src/ai/`): the model only proposes; `src/ai/apply.ts` writes drafts as the user.
  A new editable field goes in `src/ai/whitelist.ts`; its zod schema comes from the Payload
  config. Tests never call the API: integration tests pass a mock `ModelClient`, e2e runs the
  server with `AI_MOCK=1` (ignored on Railway). Without an enabled switch and a monthly budget
  (AI settings or `AI_MONTHLY_BUDGET_USD`) every plan is refused.
- Security headers and the CSP live in `src/lib/securityHeaders.ts` (applied in `next.config.ts`).
  A new third-party script, frame or API host must be added there, or the browser blocks it.
  Analytics must render inside `<ConsentGate>`.
- Form submissions only arrive through `/api/submit-form/` (spam checks, `src/endpoints/forms.ts`);
  Payload's own create is closed. The job cron starts in `src/instrumentation.ts`, never in CLI
  commands.
- Migrations are generated, but may be hand-edited for data backfills; mark the edit with a
  comment. Collections live in `src/collections/`, page sections in `src/blocks/`, shared field
  builders (slug, link, seo tab, rich text, layout) in `src/fields/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
