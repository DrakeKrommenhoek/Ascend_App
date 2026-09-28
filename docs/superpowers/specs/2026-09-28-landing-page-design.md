# Ascend Landing Page — Design Spec

**Date:** 2026-09-28 · **Branch:** `feature/landing-page` · **Status:** Approved by Drake

## 1. Intent

- **Outcome:** A marketing landing page at `/` whose primary job is waitlist signups (Mailchimp), with a secondary "Try the live demo" path into the existing onboarding flow.
- **Audience:** Ambitious college students recruiting for IB / consulting / tech. Must also read as credible to investors and pitch judges.
- **Success:** ≥8% visitor→signup on cold traffic, ≥20% on warm/referral traffic, measured in GA4 (`sign_up` key event). Mobile LCP < 2.5s.
- **Offer:** "Founding Cohort": early users get free Pro access (pre-existing promise).
- **Honesty rule:** No fabricated numbers, testimonials, school logos, or user counts. Placeholder social proof is not allowed.

## 2. Design Direction: "Summit Ledger"

Dark, disciplined, trading-terminal-meets-editorial. It extends the existing Premium navy and gold look.

- **Fonts (keep existing):** Playfair Display (display/headlines), DM Sans (body/UI), JetBrains Mono (labels, data, eyebrows). Already loaded in `index.html`. Do not add fonts. No Inter, Roboto, Arial, or system-font fallbacks as the visible face.
- **Palette** (landing-scoped CSS vars, prefix `--lp-`):
  - `--lp-bg: #0A0E1A` (matches `--bg-dark`), `--lp-surface: #111827`, `--lp-surface-2: #1A2238`
  - `--lp-ink: #EDE7DA` (bone, body text), `--lp-ink-soft: #9AA3B5`
  - `--lp-gold: #C9A84C` (brand gold; CTAs, key rules), `--lp-gold-bright: #E3C372` (hover)
  - `--lp-blue: #4F8EF7` (sparing: data/links), `--lp-ember: #B4532A` (sparing: "missed deadline" moments only)
  - `--lp-line: rgba(237,231,218,0.10)` (hairlines, contour strokes)
- **Contrast:** WCAG AA. Body text ≥4.5:1, large text/UI ≥3:1. Gold buttons use dark text (`#0A0E1A` on `#C9A84C`).
- **Signature visual:** Topographic contour lines as the structural spine. Inline SVG, generated procedurally (no raster, no mountain clipart). Sections are "checkpoints" labeled with mono elevation markers (e.g., `CP-01 · 1,200 FT`), not a uniform card stack. **Do not use bento grids.**
- **Motion (Framer Motion, already installed):**
  1. The contour lines stroke-draw once on load (≤1.2s).
  2. A brass sheen sweeps across the primary CTA on hover/focus.
  3. A "deadline board" in How It Works: tasks tick to done one by one as it scrolls into view, and one ember "missed" item flips to "rescheduled."
  - Everything is wrapped in `<MotionConfig reducedMotion="user">`. Under reduced motion, show the final states with no transforms.
- **Product visual:** A framed, static, CSS/HTML mock of the dashboard's "This Week" board in the hero, built in JSX (crisp, no image weight). No hero video.

## 3. Page Structure & Copy

Section order (component name in parentheses):

1. **Nav** (`LandingNav`): Ascend wordmark (use `/ascend-icon.png` at 28px plus the "ASCEND" wordmark in Playfair), anchor links (How it works · Features · FAQ), a small "Try the demo" text link, and a gold "Join the waitlist" button that scrolls to the hero form. On mobile: wordmark plus the gold button only.
2. **Hero** (`Hero`)
   - Eyebrow (mono): `YOUR EDGE, ORGANIZED.`
   - H1 (Playfair): **"Never miss the deadline that costs you the offer."**
   - Subhead: "Ascend pulls Canvas, your recruiting pipeline, and your calendar into one weekly game plan, built for students who mean it."
   - `WaitlistForm` (email only) plus the microcopy: "Founding Cohort gets Pro free. No spam, unsubscribe anytime."
   - Secondary link: "Or try the live demo →" goes to `/start`.
   - Right/below: the framed dashboard mock.
3. **Problem** (`Problem`): "Five tabs. Three calendars. One missed coffee chat." Show Canvas, Google Calendar, Gmail, LinkedIn, and Handshake icons (existing `/public/*.png`) scattered and misaligned, converging into one Ascend line on scroll.
4. **How it works** (`HowItWorks`): 3 checkpoints.
   - Connect: Canvas, calendars, inbox.
   - Plan: the Sunday Preview builds your week.
   - Execute: the deadline board plus accountability.
   - Contains the animated deadline board (Motion #3).
5. **Features** (`Features`): 4 items in a non-grid, staggered ledger layout.
   - This Week board
   - Sunday Preview (AI action items)
   - Accountability partner (the archetype pet; use `/eagle1.png`, `/fox1.png`, `/bear2.png`)
   - Networking tracker (with Excel export)
6. **Founding Cohort** (`FoundingCohort`): what founding members get (Pro free, direct line to the founder, shape the roadmap), plus a second `WaitlistForm` instance.
7. **FAQ** (`FAQ`): accessible disclosure (`<details>`/`<summary>` or a button with aria-expanded). Five questions:
   - What does it cost? (Founding Cohort gets Pro free; pricing announced before launch.)
   - When does it launch?
   - Which schools? (Any. Built at W&L.)
   - What do you do with my data? (Links to `/privacy`.)
   - Can I try it now? (Yes, the live demo.)
8. **Final CTA** (`FinalCta`): "Recruiting season doesn't wait. Neither should you." plus a `WaitlistForm`.
9. **Footer** (`LandingFooter`): © 2026 Ascend, Privacy, contact mailto (use `hello@ascend.app` as a clearly marked constant `CONTACT_EMAIL` in `src/landing/content.js` for Drake to replace).

All copy lives in `src/landing/content.js` so it can be edited without touching layout.

### WaitlistForm states

- **idle:** email input (type=email, autocomplete=email, required) plus the gold button "Join the waitlist". A hidden honeypot field is named `company` (tabIndex −1, aria-hidden, off-screen).
- **submitting:** the button is disabled and shows a spinner. A double submit is impossible.
- **success:** "Check your inbox to confirm your spot." The **ProfileStep** then appears inline. It has 3 optional fields: School (text), Grad year (select 2026–2031), Track (select: Investment Banking, Consulting, Private Equity, Tech, Other). There is a "Save" button and a "Skip" link. After save, it shows the **referral panel**: a copyable link `https://<origin>/?ref=<refCode>` plus the line "Every friend who joins moves the Founding Cohort forward."
- **error:** an inline message from the server (`error` field) or a generic "Something went wrong. Try again." Never fake a success.

## 4. Routing

- `/` is `Landing` (new), `/start` is the existing `OnboardingFlow` (moved unchanged), and `/login` and `/dashboard` are unchanged.
- `/privacy` is `Privacy` (new, simple page in the landing style).
- The `*` fallback redirects to `/`.
- `OnboardingFlow`'s internal "skip to demo" behavior is unchanged.
- Authenticated users visiting `/` still see the landing page; the nav shows "Open dashboard" instead of "Try the demo" when `useAuth().user` exists.
- `vercel.json`: remove the `/ascend-signup` → html rewrite. Add a permanent redirect `/ascend-signup` → `/`. Keep the SPA catch-all, with `api` excluded.
- `public/ascend-signup.html` and root `ascend-signup.html`: delete both (they contain a dead Formspree placeholder).
- `public/manifest.json`: set `start_url` to `/start`.
- **Service worker kill-switch:** The production build at HEAD registers a Workbox SW via vite-plugin-pwa. Drake's uncommitted working tree removes the plugin. Ship `public/sw.js` that, on install, calls `skipWaiting()`; on activate, deletes all caches, unregisters itself, and reloads open clients. This ensures returning visitors see the new `/`. Also remove the `VitePWA` block from `vite.config.js` on this branch, which matches Drake's WIP so the merge is trivial.

## 5. Waitlist API: `POST /api/waitlist`

A Vercel Node function in CommonJS (`api/waitlist.js`), matching the style of the existing `api/`. It uses global `fetch` (Node 18+) and has **no new dependencies**. Shared helpers go in `api/_lib/mailchimp.js`.

**Request (JSON):**
```json
{
  "email": "string (required)",
  "ref": "string | null (referrer's refCode from ?ref=)",
  "utm": { "source": "", "medium": "", "campaign": "" },
  "company": "string (honeypot, must be empty)",
  "t": 4120,
  "profile": { "school": "", "gradYear": "", "track": "" }
}
```
- `t` is the number of ms between form render and submit.
- `profile` is optional; it is present only on the ProfileStep update call.
- The ProfileStep re-POSTs the same `email`, `ref`, and `utm` plus `profile`, with `company: ""` and `t` measured from the original form render. The PUT upsert makes this an update.

**Behavior:**
1. Methods other than POST get 405. A body over 4KB gets 413.
2. If the honeypot is non-empty or `t < 1500`: return `200 {ok:true, refCode:<fake deterministic>}` silently and do not call Mailchimp.
3. Validate the email: trim, lowercase, basic RFC-ish regex, and length ≤254. On failure: `400 {ok:false, error:"Enter a valid email."}`.
4. `subscriber_hash = md5(email)` via `crypto`. `refCode` = the first 8 chars of base36 from `sha256(email + MAILCHIMP_AUDIENCE_ID)`, so it is deterministic and non-reversible.
5. `PUT https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${hash}`. Basic auth is `anystring:${MAILCHIMP_API_KEY}`. The body:
   - `email_address`
   - `status_if_new: "pending"` (double opt-in)
   - `merge_fields`: `REFCODE` (own code), `REFBY` (sanitized `ref`, `[a-z0-9]{1,16}`), `USOURCE`, `UMEDIUM`, `UCAMPAIGN` (each ≤50 chars), plus when `profile` is present `SCHOOL` (≤100), `GRADYR` (4-digit, 2026–2031), and `TRACK` (from the allowed list)
   - Only non-empty merge fields are sent.
6. Then `POST .../members/${hash}/tags` with `{tags:[{name:"waitlist",status:"active"},{name:"landing-v1",status:"active"}]}` (plus `{name:"referred"}` if `ref` is present). Tag failure is logged and does not fail the request.
7. Responses:
   - Success: `200 {ok:true, refCode}`.
   - Mailchimp `"Member In Compliance State"`: `200 {ok:true, refCode}`. Don't leak status; the user is told to check their inbox.
   - Mailchimp 400 "fake or invalid" email: `400 {ok:false, error:"That email looks invalid."}`.
   - Missing env vars: `500 {ok:false, error:"Waitlist is not configured yet."}` plus a console.error listing the missing var names (never values).
   - Other failures: `502 {ok:false, error:"Couldn't reach our list. Try again in a minute."}`.
8. The API key is never logged or returned.

**Env vars (server-only, no `VITE_` prefix):** `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX` (e.g. `us21`), and `MAILCHIMP_AUDIENCE_ID`. Add them to `.env.example`.

**Tests:** `api/__tests__/waitlist.test.js` using the built-in `node:test` plus `assert` with `fetch` mocked. Run with `node --test api/__tests__/`. Cover: 405, honeypot, fast submit, invalid email, happy path (URL, auth header, body shape), profile merge fields, compliance state, missing env, and tag failure being non-fatal.

## 6. Analytics

- **`src/lib/analytics.js`** exports:
  - `initAnalytics()`: if `import.meta.env.VITE_GA_MEASUREMENT_ID` is set and `import.meta.env.PROD`, it injects `gtag.js` async and calls `gtag('config', id, { send_page_view: false })`. Otherwise it is a no-op (with a console.debug in dev).
  - `trackPageView(path)`, which sends `page_view` with `page_path`, `page_location`, and `page_title`.
  - `track(eventName, params = {})`, which is a safe no-op if gtag is absent.
  - `getUtm()`, which reads `utm_source`, `utm_medium`, and `utm_campaign` from the URL on first load, persists them in `sessionStorage` (`ascend_utm`), and returns `{source, medium, campaign}`.
  - `getRef()`, the same pattern for `?ref=` (`ascend_ref`).
- **`src/components/RouteTracker.jsx`:** uses `useLocation()` and calls `trackPageView` on every pathname change. It renders null and is mounted inside `BrowserRouter` in `App.jsx`.
- **Events (the contract; UI agents call these exact names):**

  | Event | When | Params |
  |---|---|---|
  | `sign_up` | waitlist POST returns ok | `method: 'waitlist'`, `form_location: 'hero'\|'cohort'\|'final'` |
  | `profile_complete` | ProfileStep saved ok | `track` |
  | `cta_click` | any waitlist-scroll button or nav CTA | `cta_id`, `location` |
  | `demo_click` | any link to `/start` | `location` |
  | `referral_copy` | referral link copied | none |
  | `faq_open` | an FAQ item is opened | `question_id` |

- **Vercel Web Analytics:** add `@vercel/analytics` to the root `package.json` and render `<Analytics />` from `@vercel/analytics/react` in `App.jsx`.
- **Env:** `VITE_GA_MEASUREMENT_ID` goes in `.env.example`.
- **No cookie banner** (US audience, no ads). The Privacy page discloses GA4, Vercel Analytics, and Mailchimp.

## 7. SEO / Meta (`index.html`)

- Keep the existing fonts and tags, and remove `maximum-scale=1, user-scalable=no` (an accessibility fix).
- Add `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image` = `/og-image.png`, `og:type`, `og:url`), and `twitter:card=summary_large_image`.
- Title: "Ascend: Never miss the deadline that costs you the offer".
- Generate `public/og-image.png` at 1200×630: dark `#0A0E1A`, gold contour lines, the headline in Playfair.
  - Source file: `scripts/og-image.html`.
  - Render it once with headless Microsoft Edge (preinstalled on Windows, no npm deps): `msedge --headless --disable-gpu --window-size=1200,630 --screenshot=public/og-image.png file:///.../scripts/og-image.html`.
  - Commit the PNG.
  - If Edge headless fails, commit `public/og-image.svg`, point `og:image` at it, and report it (many platforms require PNG).
- Preload the Playfair Display 700 woff2 is **not** required (Google Fonts CSS with `display=swap` is sufficient).

## 8. File Ownership (parallel build)

| Workstream | Owns (creates/edits) |
|---|---|
| A: Landing UI | `src/landing/**` (all section components, `Landing.jsx`, `WaitlistForm.jsx`, `ProfileStep.jsx`, `ReferralPanel.jsx`, `DashboardMock.jsx`, `DeadlineBoard.jsx`, `Contours.jsx`, `content.js`, `landing.css`), `src/screens/Privacy.jsx` |
| B: Waitlist API | `api/waitlist.js`, `api/_lib/mailchimp.js`, `api/__tests__/**` |
| C: Analytics + Meta | `src/lib/analytics.js`, `src/components/RouteTracker.jsx`, `index.html`, `public/og-image.*`, `scripts/og-image.html`, root `package.json` (+ lockfile) for `@vercel/analytics` |
| D: Routing + Cleanup | `src/App.jsx`, `src/main.jsx` (only to call `initAnalytics()`), `vercel.json`, `vite.config.js`, `public/manifest.json`, `public/sw.js`, deleting both `ascend-signup.html`, `.env.example` |
| E: Setup Guide | `docs/LAUNCH_SETUP.md` |

**Interfaces between workstreams:**
- A imports `{ track, getUtm, getRef }` from `src/lib/analytics.js` (C) and POSTs to `/api/waitlist` (B) with the §5 request shape.
- D imports `Landing` from `src/landing/Landing.jsx` (default export), `Privacy` from `src/screens/Privacy.jsx` (default export), `RouteTracker` from `src/components/RouteTracker.jsx` (default export), and `initAnalytics` from `src/lib/analytics.js`.

Agents must not edit files owned by another workstream. If a file you need doesn't exist yet in your worktree, code against the interface above.

## 9. Verification

- `npm run build` succeeds with no errors.
- `node --test api/__tests__/` passes.
- Manual smoke test via `npm run preview`:
  - `/` renders the landing page.
  - `/start` renders onboarding.
  - `/privacy` renders.
  - Unknown routes redirect to `/`.
  - The form shows its error state when the API is unreachable (no fake success).
- Lighthouse mobile (if available): Performance ≥90, Accessibility ≥95.
- No secrets in client bundle: grep `dist/` for `MAILCHIMP` gives zero hits.

## 10. Out of Scope (v2)

- Queue position / leaderboard (needs Vercel KV)
- A live signup counter
- A/B testing
- A cookie consent banner and Consent Mode v2 (add if running ads or getting EU traffic)
- Custom domain
