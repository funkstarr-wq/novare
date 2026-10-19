# Decisions and assumptions

A running log of choices made during the build, newest milestone first. Deviations from
[`BUILD_BRIEF.md`](BUILD_BRIEF.md) are marked **Deviation** and flagged in the milestone's PR.
Open items that need an answer from Novare or the agency are marked **Needs decision**.

## M7 — Hardening (2026-10-19)

M6 (content migration) is paused: this environment cannot reach novare.com. M7 came first, at the
owner's request. The checklist is `docs/launch-checklist.md`.

1. **CSP without nonces.** **Deviation:** the brief asks for a nonce-based CSP. Next.js only adds
   nonces to pages rendered per request, which turns off the page cache (static rendering and
   on-demand ISR) and works against the performance budgets (Next.js CSP guide, "Static vs
   Dynamic Rendering"). The policy follows the guide's "without nonces" form instead:
   - scripts from the site only, plus Cloudflare Turnstile, with inline scripts allowed (Next.js
     streams page data in inline scripts);
   - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'self'`
     (live preview frames the site from the admin);
   - `upgrade-insecure-requests` on HTTPS.

   The admin also allows `cdn.jsdelivr.net`, where Payload's code editor (Monaco) loads from.
   Next.js's experimental SRI is not used: it is experimental and does not cover the inline
   scripts.

2. **HSTS:** one year, this host only, with no `includeSubDomains` or preload. Other
   novare.com subdomains are not this project's to commit to HTTPS. Revisit at launch.
3. **Forms** (brief §9):
   - **One way in.** Submissions arrive only through `POST /api/submit-form/`. Payload's own
     create is closed (`create: nobody`).
   - **Checks, in order:** a rate limit of 5 per IP per 10 minutes; a honeypot (a filled one
     gets a fake "ok" and nothing is stored); a signed time token (`GET /api/form-token/`,
     fetched by the browser because pages are cached), which refuses forms sent within
     2 seconds or older than 24 hours; Turnstile, when `TURNSTILE_SECRET_KEY` is set; then
     validation against the form's own fields.
   - **What is stored.** Unknown fields are dropped. A consent record (given, wording shown,
     time) is kept with each submission. IP addresses are not stored.
4. **Routing:** each form has an "Enquiry routing" list (topic value → address, `*` for the
   rest). The sender's confirmation is form-builder's own Emails setting. The CRM webhook
   (`CRM_WEBHOOK_URL`) gets the submission as JSON, signed with `CRM_WEBHOOK_SECRET`. Email and
   webhook failures are logged and never lose the submission.
5. **Email:** the official `@payloadcms/email-resend` adapter, used when `RESEND_API_KEY` and
   `EMAIL_FROM` are set; otherwise Payload writes emails to the log.
6. **Retention:** a Payload job (`delete-old-submissions`, queue `maintenance`) runs nightly at
   03:00 UTC and deletes submissions older than `FORM_RETENTION_MONTHS` (default 12).
   - The cron starts from `src/instrumentation.ts` when the server boots (Payload starts crons
     only on request), never in CLI commands or the build. `PAYLOAD_JOBS=off` switches it off.
   - The jobs collection is visible to admins under System.
   - **The in-process rate limiter counts per server instance** and resets on deploy;
     Cloudflare rate limiting is the outer layer.
7. **Cookie consent:** a banner driven by site settings (off by default, wording TODO-CONTENT),
   with Accept and Decline, a six-month first-party cookie, and "Cookie settings" in the footer
   to change the choice. **There is no analytics yet** (brief §15). Whatever is chosen must
   render inside `<ConsentGate>` and be added to the CSP; switch the banner on at the same
   time. With no optional cookies, showing a banner would ask about nothing.
8. **Error monitoring:** Railway logs rather than Sentry (no new paid account). Server errors
   go to stderr as one JSON line each (`src/lib/monitoring.ts`), without query strings or
   headers. Alerts for crashes and failed deploys are Railway webhooks (checklist).
9. **Redirects deferred.** At the owner's request, redirects and the old-URL crawl wait until
   the site is final and ready to go live. The work continues on the staging URL.
10. **Dependencies:**
    - sharp is upgraded to 0.35.5 (GHSA-wq5f-xc86-pv6w).
    - **Ignored:** GHSA-vfj7-8cjw-p6xm (braces, high). It reaches us only through
      `@payloadcms/next` → sass → chokidar, the build's file watcher, which never sees visitor
      input, and there is no patched version. Remove the ignore when Payload's dependency
      moves on.
    - The moderate esbuild advisory (drizzle-kit, development server only) and the low
      DOMPurify ones (the admin code editor) are below the CI gate.
11. **Backups:** the restore test is a Railway dashboard action that replaces a service's live
    data, so it is left to a person, on staging (checklist).

## M5 — AI editor (2026-10-18)

The brief's §10 as built, in `src/ai/` (server only) and `src/admin/ai/` (admin UI).

1. **Flow.** `POST /api/ai/plan/` runs a tool-use loop with Claude. Read tools run at once, as
   the requesting user. Write tools never run: each one is validated and applied to an
   in-memory copy of the document's latest draft, so later proposals see earlier ones and the
   person gets a field-level diff. The result is an `ai-changesets` record with status
   `proposed`. `POST /api/ai/apply/` replays the accepted proposals on fresh drafts and saves
   them through the Local API as that user (`overrideAccess: false`), in one transaction, with
   `source: ai` in the audit log. Publishing is the normal admin publish; a hook then marks the
   changeset `published` once every document it changed has been published. `POST
/api/ai/rollback/` restores each document's version from before the changeset as a new
   draft. `discard` rejects a proposal. All of them need a staff session verified with 2FA.
2. **Model and API use.** `claude-sonnet-5-5` (the brief's default, from `ANTHROPIC_MODEL` or
   AI settings) with adaptive thinking at `medium` effort, streamed, with prompt caching on the
   fixed system prompt and tool list. The server-side refusal fallback (`fallbacks: "default"`,
   beta `server-side-fallback-2026-07-01`) is on for models that support it; a refusal that
   still comes back ends the plan with a message. Forced tool choice is not used (Sonnet 5.5
   rejects it). The claims classifier is `claude-haiku-5-5` (`ANTHROPIC_CLASSIFIER_MODEL`).
   At most 12 model turns and 50 write proposals per request.
3. **What the assistant may touch** (`src/ai/whitelist.ts`): an editable field list per
   collection. Never: FSP licence numbers, disclaimers, the review group, the `regulated`
   switch, relationships to users, page parents and anything on legal documents (read-only).
   **Slugs (and a survey's year) only until the document is first published**, because a live
   URL change needs a redirect (§14 rule 8). Page sections go through the block tools.
4. **Schemas from the config.** The zod schema for every write is generated from the Payload
   field config (`src/ai/schema.ts`): types, selects, lengths, min/max, block types, array
   limits, unknown keys rejected. Invalid proposals go back to the model as tool errors and are
   stored as failed operations; they are never applied.
5. **Rich text** is the Markdown subset (paragraphs, `##`–`####`, lists, links, bold, italic),
   converted with Payload's own `convertMarkdownToLexical`. Anything else (HTML, images, code,
   tables, quotes, `javascript:` links, h1) is rejected before conversion, and the converted
   tree is checked again. Documents are shown to the model as Markdown the same way.
6. **Financial claims.** Every string a proposal writes is checked against built-in patterns
   (percentages near return/yield/growth, "guaranteed", "risk-free", "outperform", "beat the
   market", currency amounts) plus `ai-settings.regulatedPhrases`, and by one Haiku call per
   plan over all the text. Either one flags the changeset. The classifier fails closed: no
   clear answer counts as a flag. On apply, **regulated documents always go to compliance
   review** (status "in review" and the usual email). **A flagged claim on any other document
   blocks publishing by anyone but compliance or an admin**, enforced in the approval guard
   until compliance publishes it or the change is rolled back. Many collections have no review
   group, so this is how "forces `in_review`" works for them. **Deviation (interpretation)**,
   flagged in the PR.
7. **Archiving** (`archive_document`) unpublishes a live document; there is no delete tool and
   no schema change for an `archived` flag. Applying an archive needs publishing rights for that
   document. Rollback leaves it unpublished and says so. **Deviation (interpretation).**
8. **Budget and rate limit.** Cost is computed from token usage with list prices
   (`src/ai/pricing.ts`; unknown models cost at the highest rate) and stored per changeset. A
   plan is refused when this month's spend (UTC) has reached the budget, after 30 plans by the
   same person in an hour, **and when no budget is set at all** (fail closed:
   `AI_MONTHLY_BUDGET_USD` or AI settings). One plan can overshoot the remaining budget by its
   own cost; the turn and proposal caps bound that. The panel shows the budget left.
9. **Data minimisation and injection.** The model only sees document content, media alt text and
   file names, the page tree and counts, and the user's roles (not their name or email). Users, form submissions,
   the audit log, settings and secrets never leave the server. Document data arrives inside
   `<document_data>` tags, and the system prompt says it is data, not instructions.
10. **Conversation.** A follow-up message continues the same conversation (stored in full on the
    changeset, append-only, so thinking blocks replay unchanged). The new changeset carries the
    earlier proposals forward and the old one is marked `rejected` (`supersededBy`). A
    conversation over 400 kB is not stored in full and cannot be continued.
11. **UI.** "AI assistant" sits next to Save/Publish on every public collection (a drawer with
    the panel), and `/admin/assistant/` has the site-wide panel plus the user's history with
    rollback. Closing the drawer after applying reloads the editor, so its form cannot autosave
    stale values over the AI's draft. "Open live preview" is the same preview link the admin's
    own live preview uses.
12. **Tests.** Unit tests cover the whitelist, schemas, Markdown conversion, the claims detector
    and pricing. Integration tests replay recorded tool calls through a mock client (plan →
    apply → publish, contributor cannot publish, regulated review, flagged claims, budget and
    switch-off refusals, rollback). The e2e test runs against `AI_MOCK=1`, a scripted model in
    `src/ai/mock.ts` that the server uses instead of the API. It is ignored whenever
    `RAILWAY_ENVIRONMENT_NAME` is set, so a deployed site always uses the real API. CI sets it
    for the e2e job.
13. **Payload quirks.** On a draft restore Payload passes the restored version's `_status` to
    `afterChange` and leaves `isRestoringVersion` on the request. The publish hook skips
    restores, and rollback clears the flag before its next write. The audit log still records a
    rollback's restore as "publish" (an existing M2 hook reads `_status`). **Needs decision:**
    fix that in the audit hook, or accept it.
14. **Manual check (the brief's "done when").** Still to do on staging with a real key: set
    `ANTHROPIC_API_KEY` and `AI_MONTHLY_BUDGET_USD`, tick AI settings → Enabled, and change a
    page by prompt end to end. A typical request should cost a few US cents; the history shows each one's cost.

## M4 — SEO layer (2026-10-18)

1. **One metadata helper for every route** (`pageMetadata` in `src/lib/seo.ts`, used through
   `routeMetadata`): title (`{title} | Novare`; the home page uses its SEO title or "Novare"),
   description, an absolute canonical URL with a trailing slash, Open Graph and Twitter cards
   (the share image falls back to the site settings' default), and robots. The SEO tab's title
   and description win over the document's own. The SEO plugin's admin fields already warn
   about titles over 60 characters.
2. **What is `noindex`:**
   - draft previews (also sent as an `X-Robots-Tag: noindex` header whenever the draft-mode
     cookie is present, from `next.config.ts`);
   - search results and the 404 page;
   - documents with the new **"Hide from search engines"** switch on their SEO tab (a schema
     change, with a migration, on every collection with an SEO tab);
   - **every host but production.** Railway sets `RAILWAY_ENVIRONMENT_NAME`, so staging and PR
     environments are `noindex` and their robots.txt blocks all crawling. Local and CI runs
     behave like production, so the tests and Lighthouse see the real tags. Lighthouse on
     staging therefore reports SEO below 100 ("page is blocked from indexing"), which is
     intended.
3. **Pagination:** each page of `/insights/` is its own canonical URL (`?page=2`), so every insight
   stays reachable for crawlers, with `rel=prev` and `rel=next` links (rendered in the page,
   hoisted into `<head>` by React 19).
4. **JSON-LD** (`src/lib/jsonld.ts`):
   - Site-wide: Organization and WebSite (with a SearchAction for `/search/`).
   - BreadcrumbList on every page but home, from the same trail as the visible breadcrumbs.
   - FinancialService on solutions, Person on people, Article on insights, Report on research
     years, a FinancialService (a LocalBusiness subtype) per office on country pages, and
     FAQPage wherever a page has FAQ sections.
   - JobPosting on open vacancies only: once the closing date has passed there is no
     JobPosting, as Google asks.
   - **Placeholder values (`TODO-CONTENT`) are dropped from JSON-LD**, so unfinished content
     never reaches search engines as fact. The seed no longer sets a founding year: it was an
     invented number, and it would have appeared as `foundingDate`.
5. **Rich Results:** unit tests check the properties Google requires for Organization, Article,
   JobPosting and FAQPage (`tests/unit/seo.test.ts`). Google's Rich Results Test can only run
   on a public URL: run it on staging or production once real content is in (M6).
6. **Sitemap** (`/sitemap.xml`): every published document with a URL, `lastmod` from
   `updatedAt`, plus the listing hubs and country pages. Hidden documents and closed vacancies
   are left out; drafts never appear. **robots.txt** allows everything except `/admin/` and
   `/api/preview/` and names the sitemap. Both are built per request from cached queries.
7. **Redirects:** a URL that matches no document checks the redirects collection before the 404
   (`redirectOrNotFound` in `src/lib/redirects.ts`, used by every route): 301 entries answer 308
   and 302 entries answer 307, the equivalents Next.js sends. Saving or deleting a redirect
   refreshes its old URL, which may have been cached as a 404. **Known quirk:** Next.js sends the
   `Location` header twice with the same value; browsers and crawlers accept that. M6's crawl
   check should read the first value.
8. **Next.js 16 detail:** the layout must not await the database itself. Routes that read the
   query string (`/insights/`, `/search/`) have to reach that read before any database call, or
   the build (which has no database) tries to prerender them. The site-wide JSON-LD therefore
   lives in its own component, like the header and footer.

## M3 — Front end (2026-10-18)

### Rendering and caching

1. **Pages render on first request, then stay cached until their content changes.** The build has
   no database, so every content route has a `generateStaticParams` that returns `[]`: Next.js
   renders each URL on its first request and caches it (on-demand ISR). Publishing revalidates the
   URLs and cache tags in `src/hooks/revalidate.ts`. Pages with a closing date (vacancies) and the
   catch-all also revalidate hourly as a safety net.
2. **All reads go through `src/lib/queries.ts`.** Each query is wrapped in `unstable_cache` under
   the tags of the collections it reads, so a block that lists solutions on any page refreshes
   when a solution is published. Reads use the public's access (`overrideAccess: false`, no
   user), so a draft can't leak into a cached page, even through a relationship. Next.js 16's
   Cache Components (`use cache`) were not adopted: the previous model is documented as
   supported, and Payload's admin is not tested with `cacheComponents`.
3. **`/insights/` and `/search/` render per request**, because they read the query string
   (`?page=`, `?q=`); the queries behind `/insights/` are still cached.
4. **One URL map.** `src/lib/urls.ts` (`pathFor`) gives each document's URL (brief §7). Routes,
   links, rich-text links, live preview and the revalidation map all use it.

### Routes

5. **An optional catch-all (`[[...path]]`) serves the home page and every `pages` document** by
   its nested `path`. Explicit routes (solutions, funds, insights…) win over it, as §7 says.
6. **Listing hubs without a section block** (`/careers/`, `/research/hedge-fund-survey/`,
   `/awards/`, `/news/in-the-press/`) are rendered by the catch-all from a small registry
   (`src/components/hubs`). Each shows its `pages` document's content above the listing when the
   page exists, or works on its own. Hubs that do have a block (`/solutions/`,
   `/about/leadership/`, `/locations/`) are ordinary pages with that block.
7. **Funds are listed on their solution's page**; real-estate projects on `/solutions/real-estate/`
   (the projects collection has no solution field, and §7 puts them under that URL).
8. **Search is Postgres full-text search** (`websearch_to_tsquery`, English) over the titles and
   short texts of published documents (`src/lib/search.ts`). The query text is a bound
   parameter. No search index yet; at a few hundred documents a scan is fast, and a GIN index can
   come with M6 if the migrated content needs it.
9. **Known issue: Next.js 16.3.8 sends 404 pages as an empty HTML shell.** `notFound()` answers
   with status 404 and `noindex`, but the HTML is Next's error shell, and the browser then renders
   `not-found.tsx` (with search and links). Reproduced in a minimal app without Payload, with one
   or two root layouts; `global-not-found.js` covers only URLs no route matches, and our catch-all
   matches every URL. Visitors with JavaScript see the full 404 page; crawlers get the 404 status.
   Re-check on Next.js upgrades.

### Front end

10. **Only the menu, the contact form and live preview run on the client.** Everything else is
    server components. The header menu is a disclosure menu (`aria-expanded`, Escape closes and
    returns focus, click outside closes), and the same list becomes a drawer below the `md`
    breakpoint.
11. **Deviation: no web font yet (§8.2 asks for `next/font`).** The neutral theme uses the system
    font stack. A web font costs LCP and there is no brand typeface to load; add it with
    `next/font/local` when the designs arrive.
12. **Uploaded files are linked as plain paths** (`fileURL` in `src/lib/urls.ts`). Payload returns
    absolute URLs with a trailing slash (it follows `trailingSlash`), which `next/image` rejects
    and which cost file downloads a redirect.
13. **Seed changes:** the Insights page holds an intro instead of an insight-cards block (the route
    lists insights itself), and the seeded header has Insights, Locations and a Contact us button.

### Live preview (brief §8.5)

14. **`admin.livePreview`** is on for every collection with pages, and for the header and footer,
    with the three breakpoints from the brief. The preview URL is `/api/preview/?secret=…&path=…`.
15. **`/api/preview/` turns on Draft Mode only with the secret _and_ a staff session that has
    entered its 2FA code** (the plugin's own `totpAccess`), and only redirects to a path on this
    site. Draft pages read the latest drafts and are never cached; listings around them stay as
    published. A banner offers "Exit preview" (`/api/preview/exit/`).

### Left for later milestones

16. **M4 (SEO layer):** canonical URLs, Open Graph, JSON-LD (Organization, BreadcrumbList,
    FinancialService, Person, Article, LocalBusiness, JobPosting, FAQPage), sitemap, robots,
    `rel=prev/next` in the head, `X-Robots-Tag: noindex` in draft mode, and the redirects lookup
    for unknown URLs. M3 ships titles and descriptions only, and visible breadcrumbs.
17. **M7 (hardening):** form spam protection (honeypot, timing, Turnstile), consent logging and
    submission retention. The contact form posts to the form-builder endpoint as it is.
18. **Payload's client-hint headers are limited to the admin** (`next.config.ts`). `withPayload`
    sends `Critical-CH: Sec-CH-Prefers-Color-Scheme` on every route, for the admin's colour
    scheme; Critical-CH makes a browser that didn't send the hint repeat the request, which cost
    every new visitor a round trip. Removing it from public pages cut the median LCP by 150–250 ms
    (now 1.56–1.67 s locally against the 2.0 s budget, mobile emulation).
    `experimental.inlineCss` was tried and dropped: no LCP gain, and 1.3 MB of admin CSS in every
    admin page's HTML. The hero image loads with `loading="eager"` and `fetchPriority="high"`
    (Next.js 16 deprecates `priority`).
    **Lighthouse CI measures cached pages:** `scripts/lhci-server.mjs` starts the server and
    requests each audited page and its images once before the runs, since pages are rendered
    once after a publish and then served from cache to every visitor.
    **Timing budgets use the median of the 5 runs** (`aggregationMethod: "median"` for LCP, CLS
    and TBT; the category scores keep `median-run`). `median-run` asserts the LCP of the run with
    the median performance score, so one noisy run decides; runs of the same build swing by
    ±400 ms here, and CI runners by more.
    **Deviation: the CI gate for LCP is 2.5 s; the 2.0 s target (§8.4) is checked on staging.**
    On the CI runner, simulated LCP lands in two groups on every template, about 1.65 s or about
    2.25 s, and the slower group is the majority. The 600 ms step comes from Lighthouse's
    simulated throttling: in some runs Next's startup scripts run before the hero paints, and
    their cost, slowed 4× for CPU throttling, is added to LCP. It comes from the framework's
    startup JavaScript, not from page content (M0's text-only placeholder had the same spikes).
    2.5 s is Google's "good" Core Web Vitals threshold. Every other budget is unchanged.
19. **Needs decision: Lighthouse on staging (M3 "done when").** Staging has no content (the seed
    only runs in PR environments), so its templates have nothing to render until M6 imports the
    real content. Options: run `pnpm seed` once on staging (fake, clearly marked content, removed
    before M6), or measure staging after M6. CI runs the same budgets against a seeded build on
    every PR.

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
6. **2FA (§6.1) uses the community `payload-totp` plugin**, chosen by Novare over Cloudflare
   Access MFA. Payload 3 has no built-in 2FA. Details under "Two-factor authentication" below.

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

### Two-factor authentication (brief §6.1)

11. **Deviation: every account must use 2FA, contributors included.** The brief asks for 2FA on
    admin, editor and compliance accounts; the plugin can only require it for all accounts or
    none (`forceSetup`). Requiring it everywhere is the stricter reading. After the password,
    an account without an authenticator app is sent to set one up; until it has done so, and
    until it enters a code in each session, every API operation is refused (REST, GraphQL and
    the Local API with `overrideAccess: false`).
12. **Public reads check the code themselves.** The plugin wraps the access functions of every
    collection and global and refuses requests without a verified session, which would also
    block the public site. Operations the public needs opt out with `publicOperations(...)`
    (content reads, media and documents, header/footer/site settings, forms, form submissions).
    Content reads use `publicOrVerified`: visitors, and staff who have only entered a password,
    see published documents; verified staff also see drafts. **Any new public operation must
    opt out the same way**, or the public site gets 403s.
13. **`src/proxy.ts` passes the request path to the plugin** as the `x-pathname` request header
    (Next 16's `proxy` replaces `middleware`), on `/admin/*` only. The plugin's README sets it
    on the response; its code reads it from the request, so this sets the request header, which
    also overwrites any value a client sends.
14. **What the plugin stores.** Each user's TOTP secret is in `users.totp_secret`; no API
    returns it (field access is closed to everyone). Wrong codes count towards the same
    lockout as passwords (5 tries, 15 minutes), kept in the plugin's `totp_attempts` table.
    Only admins can unlock an account. Codes use the plugin's defaults (SHA-1, 6 digits, 30 s,
    issuer "Novare CMS"), which every authenticator app supports.
15. **Needs decision: recovery when someone loses their authenticator.** With 2FA required, the
    plugin offers no way to remove it, in the admin or by API. Until there is a decision, an
    admin with Railway access clears that user's `totp_secret` in the database, and the user
    sets up a new app at their next login. Proposal: an admin-only "Reset 2FA" action on the
    user screen, written to the audit log.
16. **Tests.** Integration tests pass a verified session (`_strategy: 'totp'`, as the plugin's
    auth strategy sets it) and also check password-only and enrolled-but-unverified sessions.
    Playwright's `setup` project signs each seeded role in through the API (password, then
    setting up or entering a code with `otpauth`) and saves the session for the admin tests.
    The secrets are throwaway, kept in the git-ignored `playwright/.auth/`. API calls in tests
    send an `Origin` header, because Payload ignores the session cookie on requests that don't
    show they come from the site (its CSRF check), and Playwright's API client sends none.

### Fixed along the way

17. **Blank page drafts no longer collide.** Opening "Create new page" autosaves an empty draft,
    which used to get the path `/undefined/`, so a second blank draft failed the unique `path`
    index. A page without a slug now has no path until it gets one.

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
