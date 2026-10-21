# Launch runbook

How novare.com moves from the old WordPress site to this one (brief §13 M8). Work through it in
order and tick each step. Earlier milestones' open items are in
[`launch-checklist.md`](launch-checklist.md); this runbook assumes they are done.

**The plan in one paragraph:**

1. Production is set up on Railway weeks ahead. It stays hidden from search engines and reachable
   only at its Railway address while the editors build the final content in it.
2. A week before launch, novare.com's DNS moves to Cloudflare. Every record still points at the
   old host, so nobody notices.
3. Two days before launch, the old site is frozen and its articles are imported one last time.
4. On launch day, the redirects go in, the site's own address is switched to novare.com, and two
   DNS records in Cloudflare are changed to point at Railway.
5. Rolling back means changing those two records back. The old host stays untouched for 30 days
   so that this always works.

## Roles

Fill these in before scheduling. Every step below names the role that does it.

| Role         | Who       | Needs                                                                |
| ------------ | --------- | -------------------------------------------------------------------- |
| Launch lead  | TODO name | Railway project access, GitHub write access, makes the go/no-go call |
| DNS owner    | TODO name | Login at the domain registrar and at Cloudflare                      |
| Content lead | TODO name | Admin account on production; signs off the content                   |
| Compliance   | TODO name | Compliance account on production; signs off regulated pages          |
| Old site     | TODO name | WordPress admin and the old host's control panel                     |

Launch window: TODO date and time. Choose a weekday morning (SAST) when all five people are
available for four hours. Avoid Fridays, month-end and public holidays.

---

## T−21 days: production on Railway

The `production` environment exists but has never been deployed. Launch lead:

1. **Apply the config.** In the repo, run `railway link` and choose `novare-web` / `production`.
   Then run `railway config plan` and `railway config apply` (see `docs/railway.md`). Before the
   first deploy:
   - Set the Postgres image to `ghcr.io/railwayapp-templates/postgres-ssl:16`.
   - Set the region to `europe-west4-drams3a`, as on staging.
2. **Generate a Railway domain** for `web` (Settings → Networking). Then set the variables on
   `web`:
   - `NEXT_PUBLIC_SERVER_URL`: `https://<that domain>`. The config file leaves production's value
     alone (`preserve()`), because it changes at the cutover.
   - `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `REVALIDATE_SECRET`, `CRON_SECRET`: fresh values
     (`openssl rand -hex 32`). Never copy staging's.
   - `ANTHROPIC_API_KEY` and `AI_MONTHLY_BUDGET_USD`, if the AI editor is wanted on day one.
   - `RESEND_API_KEY` and `EMAIL_FROM`.
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The widget's hostnames must
     include `novare.com` and the Railway domain.
   - The routing and CRM variables from `launch-checklist.md`.
3. **Backups:** Postgres → Backups → enable daily backups. Turn on **Wait for CI** on `web`.
4. **First deploy.** Push `main` (or redeploy). Check that
   `https://<railway domain>/api/health/` returns `"db":"ok"`.
5. **First admin account.** Open `/admin/`. With no users, Payload offers to create the first one,
   and the seed never runs on production. Set up 2FA, then invite the other accounts with the
   right roles (brief §6.1).
6. **Hidden from search engines.** While `NEXT_PUBLIC_SERVER_URL` is a `*.railway.app` address,
   production answers `robots.txt` with `Disallow: /` and marks every page `noindex`
   (`src/lib/site.ts`). Check this now: `curl https://<railway domain>/robots.txt`.
7. **Bring the articles in.** Set `WORDPRESS_IMPORT=true` and redeploy. The pre-deploy step
   imports from novare.com and prints the report in the deploy logs. Then set the variable back
   to `false`.

   The import publishes articles, press mentions and offices. Nothing it publishes contains
   TODO-CONTENT: the TODOs are on drafts and image alt texts, which `pnpm check:content` does not
   block on.

**Where editors work from now on: production, not staging.** Payload has no content export from
one environment to another, so pages built on staging would have to be rebuilt. Staging stays a
sandbox for trying things out and for testing code changes.

## T−21 to T−7: content and redirects

**Content lead and compliance**, in the production admin:

- Build the pages the new templates need: home, about, solutions, impact, contact and the rest.
- Work through the "For editors" list in the deploy log's migration report (`docs/migration-report.md`
  holds the latest local copy): alt texts, authors, awards, the Netherlands and Jersey offices,
  and the legal page texts.
- Fill in the globals: site settings (organisation and legal name, default disclaimer,
  cookie-banner wording), header and footer navigation. `pnpm check:content` checks them too.
- Publish regulated content through compliance review (M2).
- Production refuses to deploy while any published document contains `TODO-CONTENT`
  (`pnpm check:content` in the pre-deploy step). This is the gate that keeps placeholders off the
  live site.

**Launch lead: the redirect map.** It lives in `docs/redirects.csv` (`old,new,status`). It already
holds:

- the redirects the brief requires (§11);
- every imported article's old URL → `/insights/<slug>/`;
- the old site's existing redirect `/novare-collective-investments-scheme/` →
  `https://www.novarecis.co.za/`.

The old URLs still without an entry need a decision from Novare about where each one goes. Run
`comm -23 <(grep '^/' docs/old-urls.txt | sort) <(cut -d, -f1 docs/redirects.csv | sort)` to list
them. As of 2026-10-19:

| Old URL                                                                                                 | Needs                                          |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `/`, `/contact/`, `/awards/`, `/search/`                                                                | Nothing, if the new site has these pages       |
| `/esg/`, `/africa-moms-rising/`                                                                         | A target page                                  |
| `/news/`, `/insights-investment-management/`, `/insights-market-news/`, `/insights-wealth-management/`  | A target (probably `/insights/` or a category) |
| `/wealth-invest-careers/`, `/wealth-invest-contact-us/`, `/wealth-invest-insights/`                     | A target                                       |
| `/category/news/`, `/category/jobs/`, `/category/uncategorized/`, `/category/2016/` … `/category/2023/` | A target (probably `/insights/`)               |

**Anchor links** such as `/about-us/#history` never reach the server, so they cannot be
redirected there (brief §11). If Novare wants them kept, a small script on `/about/` must forward
the known anchors. Build it once the about page's sections are final.

**Rules for the CSV:**

- Paths with trailing slashes; a full URL only for another site.
- `301` unless a move is temporary.
- No chains: a redirect's target must not itself be redirected. The import refuses the whole
  file on any bad row, a duplicate or a chain.
- Change it in a PR, like code.

## T−7 days: DNS to Cloudflare (no visible change)

Do this a week early, with every record still pointing at the old host. Launch day then only
changes records, which takes seconds and is undone just as fast.

**DNS owner:**

1. **Export the current DNS zone** from the current DNS provider (TODO: name it). Save the
   export to the team's shared drive, not this repository. Note every record, especially:
   - **Email:** MX, SPF (`TXT v=spf1`), DKIM, DMARC, autodiscover. Email breaks if any of them is
     missing.
   - **The web records:** the apex `A`/`AAAA` record (the old host's IP address) and `www`.
     **These are the rollback values. Write them into the "Rollback" section below.**
   - Any other subdomains and verification `TXT` records.
2. **Add the zone to Cloudflare.** The Free plan is enough; don't buy a paid plan without
   sign-off. Cloudflare scans the existing records: compare them line by line with the export
   and add whatever it missed.
   - Web records (apex, `www`): **proxied** (orange cloud).
   - Mail and verification records: **DNS only** (grey cloud).
3. **Cloudflare settings:**
   - SSL/TLS → Overview → **Full**. Not "Full (strict)": Railway's docs say strict does not work
     with its certificates. Check first that the old host serves HTTPS, or Full breaks the old
     site.
   - SSL/TLS → Edge Certificates → Universal SSL **on**.
   - **Caching: leave the default.** Cloudflare caches static files and not HTML. Do **not** add
     a "Cache Everything" rule. The new site's pages tell caches they may keep them for up to a
     year (`s-maxage`), and publishing in Payload clears only the site's own cache, not
     Cloudflare's. Edits would not appear (decision M8 §3).
4. **At the registrar, switch the nameservers** to the two Cloudflare gives you. Wait until
   Cloudflare shows the zone as **Active**.
5. **Check:** the old site still loads, and an email sent to and from a novare.com address
   arrives.
6. **Railway, prepared ahead.** In production → `web` → Settings → Networking → **+ Custom
   Domain**, add `novare.com`. Railway shows a `CNAME` target and a `TXT` record.
   - **Add only the `TXT` record in Cloudflare now.** It proves ownership and changes nothing.
   - Keep the `CNAME` target for launch day.
   - `www` is redirected by Cloudflare, so Railway needs just the one custom domain.
7. **Security rules** from `launch-checklist.md`: WAF managed rules, and rate limiting on
   `/api/submit-form/` and `/api/users/login/` (within what the plan includes).
8. **Lower the TTL** of the apex and `www` records to 5 minutes (proxied records already behave
   that way).

## T−2 days: content freeze and final import

1. **Old site lead:** announce the freeze. From now on nobody edits the WordPress site, and any
   urgent change is made on the new site too.
2. **Launch lead:** save the old site's URL list as it stands:

   ```bash
   CHECK_BASE_URL=https://<production railway domain> CHECK_SAVE=docs/old-urls.txt pnpm check:urls
   ```

   This reads `https://novare.com/wp-sitemap.xml`, saves its paths and checks them against
   production. Commit `docs/old-urls.txt`. After the cutover the old sitemap is gone, and the
   check runs from this file instead.

3. **Final import:** set `WORDPRESS_IMPORT=true` on production and redeploy, then set it back to
   `false`.
   - It adds whatever the old site gained since the first import: new articles, press mentions,
     awards. Documents imported earlier are left exactly as the editors left them (decision M8
     §2). The report counts them as "unchanged".
   - Read the report in the deploy log. New items need the same editor pass as before.
   - If Novare changed an existing article on the old site after the first import, copy the
     change by hand. `WORDPRESS_IMPORT_OVERWRITE=true` would re-import every imported document
     from the old site and **undo the editors' work** on all of them, so use it only before
     editing has started.
4. **Content lead and compliance:** sign off on production at its Railway address.
5. **Launch lead: final checks**, all on production at its Railway address:
   - Every item in `launch-checklist.md` is ticked.
   - `pnpm lhci` against production: LCP under 2.0 s on mobile.
   - A test enquiry reaches the right inbox.
   - Admin login with 2FA works for every role.
   - A backup has been taken and a restore tested (checklist).

## T0: cutover

Budget two hours; the switch itself takes minutes. The launch lead runs it, with the DNS owner on
the call.

1. **Go/no-go.** Launch lead and content lead confirm the T−2 checks still hold, and nobody has
   edited the old site since the freeze.
2. **Backups.**
   - Railway: Postgres → Backups → **Create backup**.
   - Old site lead: a full backup of the WordPress files and database from the old host.
3. **Redirects in.** Merge the final `docs/redirects.csv` to `main`. Set `REDIRECTS_IMPORT=true`
   on production and let the deploy run. The pre-deploy log shows `Redirects from
docs/redirects.csv: N created …`. Set it back to `false`.
4. **Switch the site's address.** Set `NEXT_PUBLIC_SERVER_URL=https://novare.com` on production
   and redeploy. The value is built into the site, so a rebuild is needed. The new deployment
   starts with an empty page cache, so no page keeps a `noindex` from before.

   From this moment:
   - the admin only accepts logins at `https://novare.com/admin/` (CSRF is locked to that
     address);
   - the Railway address answers with canonical links to novare.com.

5. **Point DNS at Railway.** DNS owner, in Cloudflare:
   - Apex (`@`): replace the old `A`/`AAAA` records with a `CNAME` to Railway's target from
     T−7 step 6, **proxied**. Cloudflare flattens it at the apex.
   - `www`: `CNAME` to `@`, **proxied**.
   - Rules → Redirect Rules (or Bulk Redirects): `https://www.novare.com/*` →
     `https://novare.com/${1}`, 301, keeping the path and query string.
6. **Wait for Railway to verify the domain** (a green check and "Cloudflare proxy detected" on
   the custom domain). It usually takes minutes; Railway's docs allow up to 72 hours.
7. **Check, in order:**
   - `https://novare.com/api/health/` returns `{"status":"ok","db":"ok"}`.
   - The home page, a solution, an insight, `/careers/` and `/contact/` load, with no console
     errors.
   - `https://www.novare.com/about-us/` takes one 301 to `https://novare.com/about-us/` and then
     one more to `/about/`. The `www` hop happens at Cloudflare, so it does not count against
     the redirect map.
   - **The redirect crawl.** Every line must pass:

     ```bash
     CHECK_BASE_URL=https://novare.com CHECK_PATHS=docs/old-urls.txt CHECK_REPORT=docs/url-check.md pnpm check:urls
     ```

     It checks the saved old URLs plus every old path in `docs/redirects.csv`. Each must answer
     200, or one permanent redirect to a 200. Redirects to other sites are listed for checking
     by hand.

   - `https://novare.com/robots.txt` allows crawling and names
     `https://novare.com/sitemap.xml`. A page's source has
     `<link rel="canonical" href="https://novare.com/…">` and no `noindex`.
   - A test enquiry arrives; the confirmation email arrives.
   - Admin login at `https://novare.com/admin/` with 2FA; publish a small change and see it live.
   - Email to and from novare.com still works (the MX records were not touched).

8. **Announce** the launch to the team. Keep the old host running (see "Rollback").

If anything in step 7 fails and cannot be fixed within 30 minutes, **roll back** (below) and fix
it on the Railway address.

## T0 to T+1 day: search engines

The site's own address does not change (novare.com before and after), so Google needs no "change
of address". It needs the new sitemap and the redirects.

1. **Google Search Console**, by someone with access (brief §15: access is still an open
   question, TODO who). Use a **Domain** property for `novare.com`, verified with a `TXT` record
   in Cloudflare (DNS only).
   - Sitemaps → submit `https://novare.com/sitemap.xml`. Leave old WordPress sitemaps listed
     there in place: Google will see them fail and drop them.
   - URL inspection → test the home page and one insight live → **Request indexing**.
2. **Bing Webmaster Tools** (optional): import the property from Search Console, then submit the
   sitemap.
3. Note the Search Console numbers on launch day (indexed pages, impressions) to compare
   against later.

## T0 to T+30 days: 404 monitoring

The first week, check daily; then weekly until day 30. Record each check in the log below.

| Where                                                                                            | What to look at                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Railway HTTP logs:** production → `web` → Observability, or `railway logs --http --status 404` | Requests that answered 404. Railway logs every request because Cloudflare does not cache HTML. Ignore bots probing `/wp-login.php`, `/xmlrpc.php` and the like. Railway keeps HTTP logs for a limited time, depending on the plan, so check at least weekly. |
| Railway deploy logs, filter `"level":"error"`                                                    | Server errors (M7)                                                                                                                                                                                                                                           |
| Search Console → Pages → **Not found (404)** and **Page with redirect**                          | Old URLs Google still knows about. It reports with a delay of a few days.                                                                                                                                                                                    |
| Cloudflare → Analytics → **4xx**                                                                 | Spikes, and paths that come up often                                                                                                                                                                                                                         |
| Form submissions in the admin                                                                    | Enquiries keep arriving at the usual rate                                                                                                                                                                                                                    |

**For every real old URL that 404s**, add it to `docs/redirects.csv` in a PR, then deploy with
`REDIRECTS_IMPORT=true`. For a quick fix, an editor can also add it under Site → Redirects in the
admin, but then add it to the CSV as well, so the file stays complete. Then re-run the crawl.

### Monitoring log

| Date | Checked by | 404s seen (real ones) | Redirects added | Notes |
| ---- | ---------- | --------------------- | --------------- | ----- |
|      |            |                       |                 |       |

## Rollback

**When:** the site is down or broken for visitors and cannot be fixed within 30 minutes; forms or
email stop working; or compliance asks for it. The launch lead decides, with the content lead.

**Why it is quick:** after T−7 the DNS is at Cloudflare and proxied, so changing a record takes
effect in seconds. The old host is not touched at any point.

**Rollback values**, filled in at T−7 step 1 from the zone export:

| Record           | Type     | Old value                           |
| ---------------- | -------- | ----------------------------------- |
| `novare.com`     | A / AAAA | TODO: the old host's IP address(es) |
| `www.novare.com` | TODO     | TODO                                |

**Steps (DNS owner):**

1. In Cloudflare, delete the apex `CNAME` to Railway and restore the old `A`/`AAAA` records,
   proxied.
2. Point `www` back to its old value.
3. Turn off the `www` → apex redirect rule if the old site served `www` itself.
4. Check that the old site loads at `https://novare.com/` (in a private window).
5. **Tell the team, and lift the freeze on the old site** if the rollback will last.

Then:

- **Enquiries sent to the new site** during the launch stay in its admin (Forms → Submissions).
  Someone answers them from there.
- **Content changed on the new site** since launch must also be made on the old site, if the
  rollback lasts longer than a day.
- **Search engines** need nothing: the address did not change. The new sitemap simply fails until
  the next attempt.
- **The new site** stays up at its Railway address; fix the problem there. If the fix will take
  more than a day, set `NEXT_PUBLIC_SERVER_URL` back to the Railway address and redeploy: that
  hides the site from search engines again and lets the admin log in there.
- **Try again** from T0 step 1 once the cause is fixed and checked on the Railway address.

**Keep the old host running and unchanged for 30 days after launch**, so this section stays
possible.

## T+30 days: wrap up

1. Last monitoring check; tick the checklist's go-live items.
2. **Retire the old site.** This means deleting the WordPress site and its hosting, so it needs
   Novare's written OK (brief §14 rule 9). Before that, take a final full backup and keep it.
3. Remove the old host's records from Cloudflare. Keep the mail records.
4. Remove the Railway address from the Turnstile widget's hostnames if it is no longer used.
