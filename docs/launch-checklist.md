# Launch checklist

The security checklist M7 asks for (brief §12, §13), plus what must happen before go-live. Ticked
items are in the code and covered by tests; unticked items need a person, an account or a
decision. Tick them in this file as they are done.

## Security (M7)

### In the code

- [x] **Security headers** on every response (`src/lib/securityHeaders.ts`, `next.config.ts`):
      Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
      Permissions-Policy, Cross-Origin-Opener-Policy, and HSTS on HTTPS. `frame-ancestors 'self'`
      keeps live preview working. E2E: `tests/e2e/hardening.e2e.ts` checks the headers and that the
      site and admin run without CSP violations.
- [x] **CSP without nonces** (decision M7 §1): scripts from the site only, inline scripts
      allowed. A nonce would force every page to render per request.
- [x] **Payload CSRF and CORS** locked to `NEXT_PUBLIC_SERVER_URL`.
- [x] **Login rate limiting:** 5 failed attempts lock an account for 15 minutes. 2FA is required
      for every account (M2).
- [x] **Rate limits:** enquiry forms take 5 per connection per 10 minutes; the AI editor takes
      30 plans per person per hour (M5).
- [x] **Form spam protection:**
  - a honeypot field and a signed time-to-submit token;
  - Cloudflare Turnstile once its keys are set;
  - server-side validation, and the POPIA consent box is required.

  Submissions can only be created through `/api/submit-form/`.

- [x] **Form retention:** a nightly Payload job deletes enquiries older than
      `FORM_RETENTION_MONTHS` (default 12).
- [x] **Consent record:** each enquiry stores whether consent was given, the wording shown and
      when.
- [x] **Cookie consent:** a banner in site settings, off until analytics exists. Nothing optional
      may load before "Accept" (`<ConsentGate>`).
- [x] **Dependency audit in CI:** `pnpm audit --prod --audit-level high`. The ignored advisories
      and the reasons are in `docs/decisions.md` (M7).
- [x] **Error reporting:** every server error is one JSON line in the Railway logs
      (`level:error`, with the Next.js error digest). The form-routing email and the CRM webhook
      log their failures too.
- [x] **Secrets** stay in Railway variables, never in the repository (M0). The Anthropic key is
      server-only (M5).

### Needs a person

- [ ] **Backup restore test (staging).** Run it in the Railway dashboard:
  1. Postgres service → Backups → enable daily backups in `staging` and `production`.
  2. Make a backup, or wait for the first one.
  3. Choose **Restore** on it. Railway stages a new volume and keeps the old one, unmounted.
  4. Deploy the staged change.
  5. Check that `/api/health/` returns `"db":"ok"` and that the admin shows the content.
  6. Note the date and the time it took here.

  Restoring replaces the live data on the service, so do it on staging only. Guide:
  https://docs.railway.com/guides/postgres-backups-restores

- [ ] **Alerts.**
  - Railway project → Settings → Webhooks: send deploy failures and crashes to the team's
    channel (https://docs.railway.com/guides/alerts-crashes-failed-deploys).
  - Railway → Observability: save a log filter on `"level":"error"` for the `web` service.
  - If a paging service is wanted later, Sentry can be added (it is not built in, to avoid
    another paid account).
- [ ] **Email (Resend).** Set `RESEND_API_KEY` and `EMAIL_FROM` on staging and production, and
      verify the sending domain in Resend. Until then, emails are only written to the log.
- [ ] **Turnstile.** Create a widget for the site's domains in Cloudflare, then set
      `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (before the build) and `TURNSTILE_SECRET_KEY`.
- [ ] **Enquiry routing.** For each form in the admin, set who receives each topic (Forms → Enquiry
      routing) and the topics themselves. The seed uses `example.test` addresses.
- [ ] **CRM (optional).** Set `CRM_WEBHOOK_URL` and `CRM_WEBHOOK_SECRET`. The receiver checks
      `X-Novare-Signature`, which is the HMAC-SHA256 of the body.
- [ ] **Cookie and privacy wording** from Novare (TODO-CONTENT in site settings and the privacy
      notice). Turn the banner on together with analytics.
- [ ] **Cloudflare in front** (brief §1): WAF, rate limiting on `/api/submit-form/` and
      `/api/users/login/`, and optionally Cloudflare Access on `/admin/`.

## Before go-live (from earlier milestones)

- [ ] **Redirects and the old-URL crawl** (M6). Deferred until the site is final: build
      `docs/redirects.csv`, import it, and crawl the old site's URLs (decision M7 §9).
- [ ] **Content import from WordPress** (M6). Needs network access to novare.com.
- [ ] **AI editor manual check on staging with the real key** (M5).
- [ ] **No TODO-CONTENT in published content:** `pnpm check:content` passes on production.
- [ ] **Lighthouse on staging:** LCP < 2.0 s on mobile (the CI gate is 2.5 s, M3/PR #5).
