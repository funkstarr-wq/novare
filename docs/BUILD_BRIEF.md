# Novare.com Rebuild — Build Brief for Claude Code

Version 1.0 · 12 October 2026
Source of truth for scope: the "Novare.com Rebuild — Scope of Work" doc. This brief turns it into build instructions.

---

## 1. What we are building

A headless rebuild of https://novare.com (currently WordPress 6.9 + Beaver Builder) for Novare, a pan-African investment solutions group.

- **Backend:** Payload CMS 3 on PostgreSQL.
- **Front end:** Next.js 16 (App Router), in the **same codebase** as Payload.
- **AI prompting editor:** a panel inside the Payload admin. Editors type an instruction, Claude proposes edits through a fixed set of tools, the edits land as a **draft**, a human previews and approves, and nothing publishes automatically.
- **SEO model:** one topic per URL, fully server-rendered, unique metadata and JSON-LD per page. Not a single-page app.
- **Hosting:** Railway (app + Postgres + bucket), deployed from GitHub. Cloudflare in front as CDN/WAF.

### Goals (in priority order)
1. Preserve and grow organic rankings: 1:1 301 redirects, no lost URLs.
2. Editors can change the site safely by prompt, with compliance approval on regulated content.
3. Core Web Vitals green: LCP < 2.0 s mobile, INP < 200 ms, CLS < 0.1, Lighthouse 95+.
4. WCAG 2.2 AA.

### Non-goals (v1)
- Client login / investor portal (keep architecture ready for it, do not build it).
- Multi-language (structure i18n-ready via Payload localization config, ship English only).
- Fund performance data feeds (factsheets are uploaded PDFs in v1).

---

## 2. Stack (pin these)

| Concern | Choice |
| --- | --- |
| Runtime | Node 22 LTS, pnpm |
| Framework | Next.js 16, App Router, React Server Components, TypeScript strict |
| CMS | Payload 3.x (latest stable), `@payloadcms/next` |
| Database | PostgreSQL 16 via `@payloadcms/db-postgres` |
| Rich text | `@payloadcms/richtext-lexical` |
| Media storage | `@payloadcms/storage-s3` → Railway Bucket (S3-compatible). Cloudflare R2 is an acceptable swap. |
| Plugins | `@payloadcms/plugin-seo`, `@payloadcms/plugin-redirects`, `@payloadcms/plugin-form-builder`, `@payloadcms/plugin-nested-docs` |
| Live preview | `@payloadcms/live-preview-react` + Next.js Draft Mode |
| Styling | Tailwind CSS v4, design tokens in CSS `@theme` |
| Interactivity | React client components only where needed; no jQuery, no sliders |
| AI | `@anthropic-ai/sdk`, model from env `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`) |
| Validation | `zod` |
| Email | Resend (or SMTP) via Payload email adapter |
| Testing | Vitest (unit/integration), Playwright (e2e), Lighthouse CI, axe-core |
| Lint/format | ESLint (next + typescript), Prettier |

Bootstrap with `pnpm create payload-app` using the **blank** template with Postgres, then restructure to the layout in §3. Do not use the website template wholesale; copy patterns only where they fit.

---

## 3. Repository layout

```
/
├─ CLAUDE.md
├─ railway.json
├─ .github/workflows/ci.yml
├─ .env.example
├─ docs/
│  ├─ BUILD_BRIEF.md          ← this file
│  ├─ redirects.csv           ← old URL → new URL (M6)
│  └─ decisions.md            ← log of decisions/assumptions made during build
├─ scripts/
│  ├─ import-wordpress.ts     ← WP REST → Payload import (M6)
│  └─ seed.ts                 ← dev seed data
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/          ← public site routes (§7)
│  │  ├─ (payload)/           ← Payload admin + REST/GraphQL (generated)
│  │  └─ api/
│  │     ├─ health/route.ts
│  │     ├─ preview/route.ts
│  │     └─ ai/…              ← AI editor endpoints (§10)
│  ├─ payload.config.ts
│  ├─ collections/            ← one file per collection
│  ├─ globals/
│  ├─ blocks/                 ← Payload block configs (page sections)
│  ├─ access/                 ← reusable access functions
│  ├─ hooks/                  ← revalidation, audit, approval guard
│  ├─ fields/                 ← reusable field groups (seo, disclaimer, cta…)
│  ├─ ai/                     ← tool definitions, schemas, prompts, guards
│  ├─ components/             ← front-end React components
│  │  └─ sections/            ← one component per block
│  ├─ admin/                  ← custom Payload admin components (AI panel)
│  ├─ lib/                    ← fetchers, seo/jsonld helpers, utils
│  └─ styles/
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ e2e/
```

---

## 4. Environments, Railway and GitHub

### 4.1 Railway project: `novare-web`

| Service | Type | Notes |
| --- | --- | --- |
| `web` | GitHub repo service | Next.js + Payload. Deploys from GitHub. |
| `Postgres` | Railway Postgres | Daily backups enabled. |
| `media` | Railway Bucket | S3-compatible media storage. |

Environments:
- **production** ← deploys from `main`
- **staging** ← deploys from `staging`
- **PR environments** enabled: each pull request gets an ephemeral environment with its own Postgres (seeded by `pnpm seed`).

Region: EU West (closest Railway region to South Africa and Nigeria); Cloudflare caches pages at its Johannesburg and Lagos edges.

### 4.2 `railway.json`

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "preDeployCommand": ["pnpm payload migrate"],
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

**Important:** Railway's private network is not available during the build step. `pnpm build` must succeed **without a database connection**. Route segments that read from Payload must render dynamically or use `generateStaticParams` that returns `[]` when the DB is unreachable, relying on ISR/on-demand revalidation at runtime. Add a CI job that builds with no `DATABASE_URL` to prove this.

### 4.3 Environment variables (`.env.example`)

| Variable | Value / source |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway reference variable) |
| `PAYLOAD_SECRET` | 32+ random bytes, per environment |
| `NEXT_PUBLIC_SERVER_URL` | e.g. `https://novare.com`, staging URL, PR URL (`https://${{RAILWAY_PUBLIC_DOMAIN}}`) |
| `PREVIEW_SECRET` | random, used to sign draft-mode links |
| `REVALIDATE_SECRET` | random |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION` | Railway Bucket credentials (reference variables from `media`) |
| `ANTHROPIC_API_KEY` | secret, production + staging only |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` |
| `AI_MONTHLY_BUDGET_USD` | default cap, overridable in the AI Settings global |
| `RESEND_API_KEY`, `EMAIL_FROM` | transactional email |
| `CRM_WEBHOOK_URL` | optional; form submissions forwarded here |
| `CRON_SECRET` | protects scheduled job endpoints |

Never commit real values. `.env` is git-ignored.

### 4.4 GitHub

- Default branch `main` (protected: PR + green CI required). `staging` branch protected likewise.
- Feature branches: `m<milestone>/<short-name>`, e.g. `m3/solution-template`.
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- One PR per coherent unit of work; PR description lists what changed, how to test, screenshots for UI, and any assumptions added to `docs/decisions.md`.

### 4.5 CI (`.github/workflows/ci.yml`)

Jobs on every PR and push to `main`/`staging`:
1. `install` – pnpm with cache.
2. `lint` – ESLint + Prettier check.
3. `typecheck` – `tsc --noEmit` (after `payload generate:types`; fail if generated types are stale).
4. `test` – Vitest with a Postgres service container.
5. `build-no-db` – `pnpm build` with `DATABASE_URL` unset (see §4.2).
6. `e2e` – Playwright against a built app + Postgres service, seeded.
7. `lighthouse` – Lighthouse CI on home, a solution page, an insight page; fail under budgets in §8.4.
8. `a11y` – axe-core via Playwright on every template; fail on serious/critical.

---

## 5. Data model (Payload)

Conventions:
- Every public-facing collection: `versions: { drafts: { autosave: true }, maxPerDoc: 50 }`.
- Every public-facing collection gets the shared `seo` field group (via plugin-seo) and a `slug` field (unique, auto from title, editable, validated `^[a-z0-9-]+$`).
- Every collection marked **[R]** is *regulated*: subject to the approval guard (§6).
- Add `admin.useAsTitle`, sensible `defaultColumns`, and descriptions on non-obvious fields.
- No content is invented. Where copy is unknown, seed with `TODO-CONTENT: …` placeholders that a test asserts are absent before launch.

### 5.1 Collections

**`users`** (auth)
- `name`, `email`, `roles` (multi-select: `admin`, `editor`, `compliance`, `contributor`), 2FA required for `admin`/`compliance` (implement TOTP or enforce via SSO later; document choice in decisions.md).

**`pages`** — hubs and generic content pages (About, History, Group structure, Impact, ESG, CSI, Contact, Locations hub, Solutions hub, Insights hub intro, etc.)
- `title`, `slug`, `parent` (nested-docs plugin → builds `path` + breadcrumbs), `hero` (group: heading, subheading, image, CTA), `layout` (blocks field, §5.3), `regulated` (checkbox) **[R if checked]**, `seo`.

**`solutions`** **[R]**
- `title`, `slug`, `shortName`, `summary` (≤ 200 chars), `heroImage`, `keyFacts` (array: label, value), `layout` (blocks), `fspLicenceNumber` (required), `disclaimer` (rich text, required), `contactPerson` (rel → people), `documents` (rel → documents, hasMany), `order`, `externalUrl` (optional, e.g. Novare CIS), `seo`.

**`funds`** **[R]**
- `name`, `slug`, `solution` (rel → solutions), `strategy`, `inceptionDate`, `minimumInvestment`, `investorType` (select: qualified, retail), `factsheet` (rel → documents), `summary`, `body` (rich text), `awards` (rel → awards, hasMany), `disclaimer` (required), `seo`.

**`projects`** (real estate)
- `name`, `slug`, `country` (rel → offices or select), `city`, `type` (select: retail, office, mixed-use, residential, industrial), `sizeSqm`, `status` (select: planning, under construction, completed), `edgeCertified` (checkbox), `gallery` (upload, hasMany), `body`, `seo`.

**`people`**
- `name`, `slug`, `role`, `division` (rel → solutions, optional), `photo`, `bio` (rich text), `linkedinUrl`, `isLeadership` (checkbox), `order`, `seo`.

**`offices`**
- `name` (e.g. "Johannesburg Head Office"), `slug`, `country`, `countrySlug`, `city`, `addressLines` (array), `postcode`, `phone`, `email`, `geo` (point), `isHeadOffice`, `openingHours`, `order`.

**`awards`**
- `year`, `title`, `awardingBody`, `logo`, `fund` (rel → funds, optional), `solution` (rel → solutions, optional), `description`.

**`insights`** (own articles)
- `title`, `slug`, `author` (rel → people), `publishedAt`, `category` (rel → categories), `heroImage`, `excerpt`, `body` (rich text with blocks: quote, image, chart image, callout), `relatedSolutions` (rel → solutions, hasMany), `seo`.

**`press-mentions`**
- `headline`, `outlet`, `publishedAt`, `url` (external), `thumbnail`, `excerpt` (own words, ≤ 300 chars), `people` (rel → people, hasMany).

**`research`** (Novare Hedge Fund Survey editions)
- `title`, `slug`, `year`, `summary`, `keyFindings` (array), `report` (rel → documents), `body`, `seo`.

**`jobs`**
- `title`, `slug`, `location` (rel → offices), `department`, `contractType` (select), `closingDate`, `body`, `applyEmail` or `applyUrl`, `seo`. Expired jobs (`closingDate` past) drop from listings and return 410 after 30 days.

**`documents`** — PDFs and downloadable files (upload collection)
- File, `title`, `type` (select: factsheet, legal, report, policy, other), `versionDate`, `owner`.

**`legal-documents`** **[R]**
- `title`, `slug`, `versionDate`, `body` (rich text) and/or `file` (rel → documents), `owner`. Rendered as HTML pages at `/legal/{slug}/` with a download link.

**`media`** (upload) — images; required `alt`; image sizes: 400, 800, 1200, 1600, 2400 wide; AVIF/WebP generated by Next Image at request time.

**`categories`** — for insights.

**`ai-changesets`** — see §10.6. Not public.

**`audit-log`** — see §6.3. Not public, append-only.

Plugin collections: `redirects` (plugin-redirects), `forms` + `form-submissions` (plugin-form-builder).

### 5.2 Globals
- **`header`**: primary nav (array of items with optional children; each item links to a document or URL), utility CTA.
- **`footer`**: link columns, social links, legal links (rel → legal-documents), office summary (rel → offices).
- **`site-settings`**: organisation name, logo, default OG image, default disclaimer, Organization JSON-LD fields (legal name, founding year 2000, sameAs links).
- **`ai-settings`**: `enabled`, `model` (defaults from env), `monthlyBudgetUSD`, `regulatedPhrases` (array of regex/strings for the financial-claims check), `systemPromptAddendum` (admin-only).

### 5.3 Blocks (page sections) — each has a Payload block config and a matching component in `src/components/sections/`
1. `hero` – heading, subheading, image, CTA(s)
2. `richText`
3. `introStats` – intro text + array of {value, label}
4. `solutionCards` – auto (all solutions ordered) or manual selection
5. `valuesList` – array of {title, text}
6. `timeline` – array of {year, title, text}
7. `teamGrid` – filter: leadership / by division
8. `officeCards` – all offices or by country, with map link
9. `awardList` – latest N or by year range
10. `pressList` – latest N press mentions
11. `insightCards` – latest N or by category/solution
12. `fundFacts` – rel → fund, renders facts table
13. `documentDownloads` – rel → documents
14. `quote` – text, person
15. `ctaBand` – heading, text, button
16. `faq` – array of {question, answer}; emits FAQPage JSON-LD
17. `contactForm` – rel → forms
18. `disclaimerStrip` – rich text (defaults from parent doc)
19. `relatedLinks` – manual links to documents

Blocks must be **strictly typed and minimal**: no free-form colour, spacing or HTML fields. Design is controlled by tokens, not editors (this is also what keeps the AI editor safe).

---

## 6. Roles, access and approval workflow

### 6.1 Roles
| Role | Can |
| --- | --- |
| `admin` | Everything, including users, ai-settings, redirects. Agency/IT. |
| `editor` | Create/edit/publish non-regulated content; use AI editor; edit redirects. |
| `compliance` | Everything an editor can + approve and publish regulated content. |
| `contributor` | Create/edit drafts; cannot publish; can use AI editor. |

Implement as reusable access functions in `src/access/`. Field-level: `fspLicenceNumber`, `disclaimer`, and all `legal-documents` fields writable only by `compliance` and `admin`.

### 6.2 Approval guard (regulated content)
- Add a `review` field group on regulated docs: `reviewStatus` (`draft` | `in_review` | `approved` | `changes_requested`), `reviewedBy` (rel → users, read-only), `reviewedAt`, `reviewNote`.
- `beforeChange` hook on regulated collections (and `pages` where `regulated = true`): if the operation would set `_status: 'published'` and the user is not `compliance`/`admin`, throw a 403-style `APIError` with a clear message.
- Any edit to a regulated doc after approval resets `reviewStatus` to `draft`.
- Admin UI: a "Submit for compliance review" button (custom component) that sets `in_review` and emails users with the `compliance` role.

### 6.3 Audit log
- `afterChange` and `afterDelete` hooks on all content collections write to `audit-log`: `collection`, `docId`, `operation`, `user`, `source` (`human` | `ai`), `changesetId` (if AI), `diffSummary`, `timestamp`.
- `audit-log` is append-only: create via hooks only; no update/delete access for anyone.

### 6.4 Revalidation
- `afterChange` on publish (and unpublish/delete): call an internal function that runs `revalidatePath` for the doc's own URL plus dependent pages (hubs, listings, home), and `revalidateTag` for shared data (e.g. `offices`, `awards`, `header`, `footer`). Keep a single dependency map in `src/hooks/revalidate.ts`.

---

## 7. Routes (Next.js `(frontend)`)

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `pages` doc with slug `home` | |
| `/[...path]` | `pages` by nested `path` | About, History, Group structure, Impact, ESG, CSI, Contact, hubs |
| `/about/leadership/` | `pages` + `teamGrid` | |
| `/about/leadership/[slug]/` | `people` | Person JSON-LD |
| `/solutions/` | `pages` (hub) | |
| `/solutions/[slug]/` | `solutions` | FinancialService JSON-LD |
| `/solutions/multi-management/[fund]/` | `funds` | |
| `/solutions/real-estate/[project]/` | `projects` | |
| `/research/hedge-fund-survey/` and `/[year]/` | `research` | Report JSON-LD |
| `/insights/` | listing, paginated `?page=` with rel=next/prev canonical rules | |
| `/insights/[slug]/` | `insights` | Article JSON-LD |
| `/insights/category/[slug]/` | `categories` | |
| `/news/in-the-press/` | `press-mentions` | links out with `rel="noopener"` |
| `/awards/` | `awards` | |
| `/locations/` | `offices` hub | |
| `/locations/[country]/` | `offices` grouped by country | LocalBusiness JSON-LD per office |
| `/careers/`, `/careers/[slug]/` | `jobs` | JobPosting JSON-LD |
| `/contact/` | `pages` + `contactForm` | |
| `/legal/[slug]/` | `legal-documents` | |
| `/sitemap.xml`, `/robots.txt` | generated | exclude drafts, noindex pages, expired jobs |
| `/search/` | server-side search over titles/excerpts (Postgres full-text) | noindex |

Route precedence: explicit segments win over the `[...path]` catch-all. Unknown paths → check `redirects` collection → else 404 page with search and links.

Trailing slash: **on** (matches current site URLs). Set `trailingSlash: true`.

---

## 8. Front end requirements

### 8.1 Design
- No final designs yet. Build with a **neutral token-based theme** in Tailwind v4 `@theme`: colours (`--color-brand`, `--color-ink`, `--color-surface`, …), type scale, spacing, radii. All components read tokens only.
- When designs are approved (gate in the roadmap), the swap must be token + component styling only, no data model changes.

### 8.2 Layout and components
- Header with accessible mega-menu (keyboard, `aria-expanded`, escape to close), mobile drawer.
- Footer from `footer` global.
- Breadcrumbs on every page except home (visible + BreadcrumbList JSON-LD).
- Every template renders exactly one `<h1>`.
- Images via `next/image` with explicit `sizes`; hero image `priority`; everything else lazy.
- Fonts via `next/font` (self-hosted), `display: swap`.
- Client JS only where needed (menu, filters, forms, live preview). Target < 90 KB JS gzipped on a content page.
- `disclaimerStrip` auto-renders at the foot of every solution/fund page from the doc's `disclaimer` field.

### 8.3 SEO layer (`src/lib/seo.ts`, `src/lib/jsonld.ts`)
- `generateMetadata` on every route: title (`{page title} | Novare`, ≤ 60 chars warning in admin), description, canonical (absolute, trailing slash), Open Graph + Twitter cards, `robots` (noindex for drafts, search, paginated pages beyond 1 if chosen).
- JSON-LD: Organization (site-wide), WebSite + SearchAction, BreadcrumbList, FinancialService (solutions), Person, Article (insights), LocalBusiness/FinancialService per office with geo + phone, JobPosting, FAQPage (from `faq` block).
- XML sitemap with `lastmod` from `updatedAt`.
- Draft mode responses send `X-Robots-Tag: noindex`.

### 8.4 Performance budgets (enforced in Lighthouse CI)
- Performance ≥ 95, SEO = 100, Accessibility ≥ 95, Best Practices ≥ 95 (mobile emulation).
- LCP < 2.0 s, CLS < 0.1, TBT < 150 ms.

### 8.5 Live preview
- Configure `admin.livePreview` on all public collections with breakpoints (mobile 375, tablet 768, desktop 1440).
- `/api/preview` validates `PREVIEW_SECRET`, enables Draft Mode, redirects to the doc URL. Draft pages fetch with `draft: true` and are never cached.

---

## 9. Forms
- Use plugin-form-builder. Seed forms: General enquiry, Wealth & Invest enquiry, Institutional enquiry, Careers enquiry.
- Fields: name, email, phone (optional), organisation (optional), division/topic (select), message, **POPIA consent checkbox (required)** with link to privacy notice.
- Spam: honeypot field + time-to-submit check + Cloudflare Turnstile.
- On submit: email to the routing address for the selected topic (configured in the form), confirmation email to the sender, optional POST to `CRM_WEBHOOK_URL`.
- Retention: a scheduled Payload job deletes `form-submissions` older than 12 months (configurable).

---

## 10. AI prompting editor (the key custom feature)

### 10.1 Principle
Claude **never writes to published content and never writes raw HTML/CSS/code**. It may only call typed tools that change typed fields and blocks on a **draft**. A human reviews a diff and live preview, then publishes (subject to §6.2).

### 10.2 UI
1. **Document panel:** a custom component in the edit view of every public collection (Payload `admin.components` for the edit view). Chat input, conversation thread, "Proposed changes" list with per-change accept/reject, a field-level diff, and buttons: *Apply to draft*, *Discard*, *Open live preview*.
2. **Site assistant view:** custom admin view at `/admin/assistant` for site-wide requests ("update the Lagos phone number everywhere", "add the 2026 ABSIP award"). Shows a changeset spanning multiple documents.
3. **History:** list of the user's changesets with status and rollback.

### 10.3 Flow
1. User submits a prompt → `POST /api/ai/plan` with `{ prompt, context: { collection?, id? } }`.
2. Server checks auth, role, `ai-settings.enabled`, monthly budget.
3. Server builds the system prompt (§10.5) + tool list (§10.4) + current doc snapshot (draft version if one exists).
4. Claude runs a tool-use loop. **Read tools execute immediately. Write tools do not execute**; they are collected into a proposed changeset and validated.
5. Server stores an `ai-changesets` record with `status: proposed` and returns the proposed operations + human-readable diff, streamed to the UI.
6. User accepts some or all ops → `POST /api/ai/apply` → server re-validates and applies ops via Payload Local API with `draft: true`, **as the requesting user** (`overrideAccess: false`, `user` set) so access control applies. Status → `applied_to_draft`. Audit log entries with `source: ai`.
7. User reviews live preview, then publishes normally (approval guard applies). A hook marks the changeset `published`.
8. Rollback: `POST /api/ai/rollback` restores the pre-changeset version for each affected doc (versions API) as a new draft.

### 10.4 Tools (define in `src/ai/tools.ts`; JSON schemas generated from Payload config + zod)

Read tools:
- `get_document({ collection, id | slug })` → doc (draft-aware), trimmed to editable fields.
- `search_documents({ collection, query, limit })`
- `list_blocks({ collection, id })` → block ids, types, summaries.
- `find_media({ query })` → media items with alt and dimensions.
- `get_site_structure()` → page tree + collection counts.

Write tools (proposals only):
- `update_fields({ collection, id, fields })` – only fields in the per-collection **editable whitelist** (`src/ai/whitelist.ts`). Excludes slugs of published docs, `fspLicenceNumber`, `disclaimer`, review fields, relationships to users, anything on `legal-documents`.
- `update_block({ collection, id, blockId, fields })`
- `insert_block({ collection, id, afterBlockId | position, blockType, fields })` – blockType must be one of §5.3.
- `remove_block({ collection, id, blockId })`
- `move_block({ collection, id, blockId, toIndex })`
- `create_document({ collection, data })` – allowed collections: pages, insights (draft), press-mentions, awards, jobs, people, projects, offices. Always created as draft.
- `set_media({ collection, id, field, mediaId, alt? })`
- `update_seo({ collection, id, title?, description?, ogImageId? })`
- `archive_document({ collection, id })` – sets an `archived` flag/unpublishes; **no hard delete tool**.

Rich text: tools accept a constrained Markdown subset (paragraphs, h2–h4, lists, links, bold/italic) that the server converts to Lexical JSON. Reject anything else.

### 10.5 System prompt (in `src/ai/prompt.ts`)
Must state: who Novare is; the editor's role and permissions; that it may only use tools; never invent facts, figures, dates, names, returns or awards — ask the user instead; keep brand voice (clear, factual, no hype); UK/South African English spelling; when touching regulated content, say it will require compliance approval; respond with a short plan before proposing writes; at most N write ops per changeset (default 50). Append `ai-settings.systemPromptAddendum`.

### 10.6 `ai-changesets` collection
`prompt`, `user`, `model`, `context`, `messages` (JSON, truncated), `operations` (JSON array: tool, args, validation result), `affectedDocs` (array {collection, id, beforeVersionId}), `status` (`proposed` | `applied_to_draft` | `rejected` | `published` | `rolled_back` | `failed`), `flags` (array, §10.7), `inputTokens`, `outputTokens`, `costUSD`, timestamps. Read: owner + admin + compliance. Write: server only.

### 10.7 Guardrails
- **Schema validation** of every op (zod) and **whitelist** check; invalid ops are returned to the model as tool errors, never applied.
- **Financial-claims check** on any text written by an op: regex/phrase list from `ai-settings.regulatedPhrases` (e.g. percentages near "return", "guaranteed", "risk-free", "outperform", currency amounts) plus a cheap second Claude call classifying "contains performance/return claim: yes/no + reason". A positive result adds a flag and forces `in_review` on the doc, even if the collection is not regulated.
- **Budget:** track monthly spend from token usage; refuse new plans when over `monthlyBudgetUSD`, show remaining budget in the panel.
- **Rate limit:** 30 plans per user per hour.
- **Data minimisation:** only document content and site structure go to the API. Never send `users`, `form-submissions`, `audit-log` or secrets.
- **Prompt injection:** document content is passed inside clearly delimited data sections; the system prompt says content is data, not instructions.
- Server-side only: the API key never reaches the browser.

### 10.8 Tests (required)
- Unit: whitelist enforcement, zod schemas, Markdown→Lexical conversion, claims detector (table-driven cases).
- Integration (mock Anthropic client with recorded tool-call fixtures): plan → apply → publish; contributor cannot publish; regulated doc forced to review; budget refusal; rollback restores previous version.
- E2E (Playwright, mocked AI): editor changes a hero heading by prompt, previews, publishes, page shows new heading after revalidation.

---

## 11. Content migration (from current WordPress)

- `scripts/import-wordpress.ts` reads the live site's WP REST API (`/wp-json/wp/v2/posts`, `/pages`, `/media`) and imports:
  - Own posts (~25, 2015–2026) → `insights` (clean HTML → Lexical, strip Beaver Builder markup, map author by name to `people` or leave null with a TODO).
  - Press items on the media page (~50 external links) → `press-mentions` (headline, outlet from domain, URL, thumbnail; excerpt left empty for editors — do not copy third-party article text).
  - Job post "Assistant Accountant" → `jobs` (likely expired; import as draft).
  - Detect and skip the duplicate HedgeNews Africa 2020 post (`-2` slug); redirect it.
- Images: download, rename to descriptive kebab-case from title/alt, upload to `media` with alt text (flag missing alt as TODO).
- Offices: seed from the current home page "Our Presence" (7 offices). Netherlands and Jersey are listed in the footer without addresses: create as drafts with TODO-CONTENT.
- Awards: seed from `/awards/`.
- Legal PDFs: import into `documents`; create `legal-documents` pages (bodies TODO-CONTENT pending HTML versions from Novare).
- Script is idempotent (upsert by source URL stored in a hidden `sourceUrl` field) and logs a migration report to `docs/migration-report.md`.

### Redirects
`docs/redirects.csv` (old,new,status) seeded from the scope's sitemap table, then completed from a crawl. Must include at least:

```
/about-us/,/about/,301
/actuaries-and-consultants/,/solutions/investment-consulting/,301
/novare-actuaries-and-consultants/,/solutions/investment-consulting/,301
/novare-investment-services/,/solutions/multi-management/,301
/equity-partners/,/solutions/real-estate/,301
/commercial-real-estate-development/,/solutions/real-estate/,301
/novare-impact-investment-partners/,/solutions/impact-investments/,301
/wealth-invest/,/solutions/wealth-invest/,301
/our-impact/,/impact/,301
/our-corporate-social-investment/,/impact/corporate-social-investment/,301
/articles-news-and-blogs/,/insights/,301
/articles/,/insights/,301
/assistant-accountant/,/careers/,301
/the-novare-mayibentsha-moderate-qualified-fund-of-hedge-funds-scoops-prize-at-the-prestigious-hedgenews-africa-awards-2020-2/,/insights/the-novare-mayibentsha-moderate-qualified-fund-of-hedge-funds-scoops-prize-at-the-prestigious-hedgenews-africa-awards-2020/,301
```
Old post URLs `/{slug}/` → `/insights/{slug}/`. Import the CSV into the `redirects` collection via a script; enforce in Next.js middleware (cached lookup) so redirects resolve before rendering. Note: anchor URLs (`/about-us/#history`) cannot be redirected server-side; handle with a small client script on `/about/` that forwards known hashes to the new pages.

---

## 12. Security
- Payload: `csrf` and `cors` locked to `NEXT_PUBLIC_SERVER_URL`; admin at `/admin` behind Cloudflare Access (optional, recommended).
- Security headers via `next.config` / middleware: CSP (nonce-based for scripts), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors restricted (allow self for live preview).
- Login rate limiting (`maxLoginAttempts`, `lockTime`).
- Dependency audit in CI (`pnpm audit --prod`, fail on high).
- Cookie consent: no analytics cookies before consent; POPIA/GDPR copy TODO-CONTENT.

---

## 13. Milestones (do them in order; each ends with a PR and green CI)

**M0 — Bootstrap**
- Create app, repo layout, ESLint/Prettier, Vitest, Playwright, CI workflow, `railway.json`, `.env.example`, `/api/health` (checks DB when available).
- Deploy to Railway staging; PR environments working.
- *Done when:* staging URL shows Payload admin and a placeholder home page; CI green including `build-no-db`.

**M1 — Data model**
- All collections, globals, blocks, field groups, image sizes, S3 storage, plugins configured. Migrations created (`payload migrate:create`). Generated types committed.
- `pnpm seed` creates realistic dev data (clearly fake names, TODO markers).
- *Done when:* every collection is editable in admin with drafts/versions; types compile.

**M2 — Roles, approval, audit, revalidation**
- Access functions, field-level rules, approval guard, review UI button + email, audit log, revalidation map.
- *Done when:* integration tests prove a contributor cannot publish, a regulated doc cannot publish without compliance, audit entries are written.

**M3 — Front end**
- Layout, header/footer, all routes in §7, all section components in §5.3 with the neutral theme, live preview, 404, search.
- *Done when:* every template renders seeded data, one H1 per page, axe passes, Lighthouse budgets met on staging.

**M4 — SEO layer**
- Metadata, JSON-LD, sitemap, robots, canonical rules, redirects middleware.
- *Done when:* unit tests validate JSON-LD shapes; e2e checks canonical/meta on each template; Rich Results-valid output for Organization, Article, JobPosting, FAQPage.

**M5 — AI editor**
- Everything in §10, including tests in §10.8.
- *Done when:* the E2E scenario passes with the mocked client, and a manual run on staging with the real API key changes a page by prompt end to end.

**M6 — Migration**
- Import script, media import, redirects CSV + import, migration report.
- *Done when:* staging contains all migrated content; a crawl of the old site's URL list returns 200 or a single 301 hop to a 200 for every URL.

**M7 — Hardening**
- Security headers, rate limits, consent banner, form spam protection + retention job, error monitoring (Sentry or Railway logs/alerts), backups verified by a restore test.
- *Done when:* security checklist in `docs/launch-checklist.md` is ticked.

**M8 — Launch runbook** (`docs/launch-runbook.md`)
- Freeze content on old site, final import, DNS cutover via Cloudflare, Search Console sitemap submission, 404 monitoring for 30 days, rollback plan (DNS back to old host).

---

## 14. Working rules for Claude Code

1. Work one milestone at a time, on a branch, ending in a PR. Do not start the next milestone until the PR is merged.
2. Before coding a milestone, write a short plan in the PR description (or `docs/decisions.md`) and list assumptions.
3. **Never invent Novare content** (names, numbers, dates, performance, awards, licence numbers). Use `TODO-CONTENT:` placeholders. A test fails the production build if any published doc contains `TODO-CONTENT`.
4. Keep the data model the single source of truth: change Payload config → generate types → create migration → commit all three together.
5. No secrets in code, logs, fixtures or commits.
6. Prefer Payload built-ins and official plugins over custom code; prefer server components over client components.
7. Every new route/template ships with: metadata, JSON-LD (if applicable), an e2e smoke test, and axe check.
8. If something in this brief conflicts with how the current Payload/Next.js versions work, follow the current official docs, record the deviation in `docs/decisions.md`, and flag it in the PR.
9. Ask (via PR comment) rather than guess on: anything compliance-related, URL changes not in the redirect map, deleting content.

---

## 15. Open questions (do not block the build; use defaults and flag)

| Question | Default until answered |
| --- | --- |
| Which users get compliance role? | Seed one test compliance user |
| Brand refresh or keep identity? | Neutral token theme (M3) |
| Second language? | English only, localization config ready |
| Fund data feed vs manual? | Manual + PDF factsheets |
| Netherlands and Jersey office details | Draft offices with TODO-CONTENT |
| CRM for form leads | Email routing; webhook optional |
| Data residency requirements | Railway EU West; revisit if SA residency required |
| Search Console / Analytics access | Needed before M6 crawl |
