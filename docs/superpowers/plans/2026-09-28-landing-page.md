# Ascend Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a "Summit Ledger" marketing landing page at `/` that captures waitlist emails into Mailchimp (via a Vercel function) and reports conversions to GA4, while moving the existing onboarding demo to `/start`.

**Architecture:** React route `/` renders `src/landing/Landing.jsx`. Its `WaitlistForm` POSTs to `api/waitlist.js`, which upserts into Mailchimp (Marketing API v3) with server-only env vars. `src/lib/analytics.js` wraps gtag.js, with `RouteTracker` firing SPA page views. Tasks 1–5 run **in parallel** in isolated worktrees with strict file ownership (spec §8). Task 6 integrates.

**Tech Stack:** Vite 6, React 18, react-router-dom 7, Tailwind 3, Framer Motion 12, Vercel Node functions (CommonJS, Node 18+ global fetch), `node:test`, GA4 gtag.js, `@vercel/analytics`.

**Spec:** `docs/superpowers/specs/2026-09-28-landing-page-design.md`. **Read it fully before starting your task.** It holds the copy, palette, event table, and API contract.

## Global Constraints

- Fonts: Playfair Display (display), DM Sans (body), JetBrains Mono (labels). Never Inter, Roboto, Arial, or system fonts as the visible face. No new font families.
- Palette: `--lp-bg #0A0E1A`, `--lp-surface #111827`, `--lp-surface-2 #1A2238`, `--lp-ink #EDE7DA`, `--lp-ink-soft #9AA3B5`, `--lp-gold #C9A84C`, `--lp-gold-bright #E3C372`, `--lp-blue #4F8EF7`, `--lp-ember #B4532A`, `--lp-line rgba(237,231,218,0.10)`.
- No purple gradients. No bento grids. No fabricated stats, testimonials, logos, or counts.
- WCAG AA contrast. All motion goes under `<MotionConfig reducedMotion="user">`.
- The API adds **no new npm dependencies**. The only new root dependency is `@vercel/analytics`.
- Mailchimp secrets live in server env only: `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_AUDIENCE_ID`. The client uses only `VITE_GA_MEASUREMENT_ID`.
- Production URL: `https://ascend-app-one.vercel.app`
- Only edit files your task owns (spec §8). If a dependency file from another task is missing in your worktree, you may create a **temporary stub to build locally, but never commit it**.
- In each worktree, run `npm install` first (node_modules is not shared).
- Commit messages end with: `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`

## Review Focus

1. **Email casing/whitespace:** `" Drake@WLU.edu "` must hash and store identically to `drake@wlu.edu`, or re-submits create duplicates. (Test in Task 1.)
2. **Non-JSON / network failure from `/api/waitlist`** (Vercel HTML 500, offline): the form must show the error state, never a fake success like the old Formspree page did. (Task 4 `parseResponse` + manual check in Task 6.)
3. **Double-click / Enter-spam on submit:** exactly one request. (Task 4 in-flight guard + Task 6 manual check.)
4. **Hostile `?ref=`** (e.g. `<script>`, 500 chars): REFBY must be sanitized to `[a-z0-9]{1,16}` and never rendered raw. (Test in Task 1.)
5. **Body delivered as a string** (client sends `text/plain` or a proxy strips the content type): the function must still parse it. (Test in Task 1.)

---

## Task 1: Waitlist API (Workstream B)

**Files:**
- Create: `api/_lib/mailchimp.js`
- Create: `api/waitlist.js`
- Create: `api/__tests__/waitlist.test.js` (the `__tests__` dir starts with `_`, so Vercel will not deploy it as a function)
- Modify: none

**Interfaces:**
- Produces: `POST /api/waitlist`. Request and response exactly per spec §5. Responses are `{ok:true, refCode}` or `{ok:false, error}`.
- Consumes: env `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_AUDIENCE_ID`.

- [ ] **Step 1: Write the failing tests**

`api/__tests__/waitlist.test.js`:
```js
const { test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('crypto')

const ENV = { MAILCHIMP_API_KEY: 'key-us21', MAILCHIMP_SERVER_PREFIX: 'us21', MAILCHIMP_AUDIENCE_ID: 'aud123' }
let calls, responses, savedEnv, savedFetch

function mockRes() {
  return {
    statusCode: 200, body: undefined,
    status(c) { this.statusCode = c; return this },
    json(b) { this.body = b; return this },
    end() { return this },
  }
}
function req(body, method = 'POST') { return { method, body, headers: {} } }
const good = (extra = {}) => ({ email: 'drake@wlu.edu', ref: null, utm: {}, company: '', t: 5000, ...extra })

beforeEach(() => {
  savedEnv = { ...process.env }; savedFetch = global.fetch
  Object.assign(process.env, ENV)
  calls = []; responses = []
  global.fetch = async (url, opts) => {
    calls.push({ url, opts, body: opts.body ? JSON.parse(opts.body) : undefined })
    const r = responses.shift() || { status: 200, data: { id: 'x' } }
    return { ok: r.status < 300, status: r.status, json: async () => r.data }
  }
  delete require.cache[require.resolve('../waitlist')]
  delete require.cache[require.resolve('../_lib/mailchimp')]
})
afterEach(() => { process.env = savedEnv; global.fetch = savedFetch })

const handler = () => require('../waitlist')

test('405 on GET', async () => {
  const res = mockRes(); await handler()(req({}, 'GET'), res)
  assert.equal(res.statusCode, 405)
})

test('honeypot filled → silent 200, no Mailchimp call', async () => {
  const res = mockRes(); await handler()(req(good({ company: 'Acme' })), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
  assert.match(res.body.refCode, /^[a-z0-9]{8}$/); assert.equal(calls.length, 0)
})

test('submit faster than 1500ms → silent 200, no call', async () => {
  const res = mockRes(); await handler()(req(good({ t: 300 })), res)
  assert.equal(res.body.ok, true); assert.equal(calls.length, 0)
})

test('invalid email → 400', async () => {
  const res = mockRes(); await handler()(req(good({ email: 'not-an-email' })), res)
  assert.equal(res.statusCode, 400); assert.deepEqual(res.body, { ok: false, error: 'Enter a valid email.' })
})

test('happy path: PUT upsert with pending status, basic auth, tags call', async () => {
  const res = mockRes(); await handler()(req(good({ utm: { source: 'ig', medium: 'social', campaign: 'fall' } })), res)
  const hash = crypto.createHash('md5').update('drake@wlu.edu').digest('hex')
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
  assert.equal(calls[0].url, `https://us21.api.mailchimp.com/3.0/lists/aud123/members/${hash}`)
  assert.equal(calls[0].opts.method, 'PUT')
  assert.equal(calls[0].opts.headers.Authorization, 'Basic ' + Buffer.from('anystring:key-us21').toString('base64'))
  assert.equal(calls[0].body.email_address, 'drake@wlu.edu')
  assert.equal(calls[0].body.status_if_new, 'pending')
  assert.equal(calls[0].body.merge_fields.REFCODE, res.body.refCode)
  assert.equal(calls[0].body.merge_fields.USOURCE, 'ig')
  assert.equal(calls[0].body.merge_fields.REFBY, undefined)
  assert.equal(calls[1].url, `https://us21.api.mailchimp.com/3.0/lists/aud123/members/${hash}/tags`)
  assert.deepEqual(calls[1].body.tags.map(t => t.name), ['waitlist', 'landing-v1'])
})

test('email is trimmed + lowercased before hashing (Review Focus 1)', async () => {
  const a = mockRes(); await handler()(req(good({ email: '  Drake@WLU.edu ' })), a)
  const hash = crypto.createHash('md5').update('drake@wlu.edu').digest('hex')
  assert.ok(calls[0].url.endsWith(hash)); assert.equal(calls[0].body.email_address, 'drake@wlu.edu')
})

test('hostile ref is sanitized; referred tag added (Review Focus 4)', async () => {
  const res = mockRes(); await handler()(req(good({ ref: '<script>AbC123xyz!!' + 'z'.repeat(500) })), res)
  assert.match(calls[0].body.merge_fields.REFBY, /^[a-z0-9]{1,16}$/)
  assert.equal(calls[0].body.merge_fields.REFBY, 'scriptabc123xyzz')
  assert.ok(calls[1].body.tags.some(t => t.name === 'referred'))
})

test('string body is parsed (Review Focus 5)', async () => {
  const res = mockRes(); await handler()(req(JSON.stringify(good())), res)
  assert.equal(res.statusCode, 200); assert.equal(calls.length, 2)
})

test('profile merge fields validated and sent', async () => {
  const res = mockRes()
  await handler()(req(good({ profile: { school: 'Washington and Lee', gradYear: '2028', track: 'Private Equity' } })), res)
  const mf = calls[0].body.merge_fields
  assert.equal(mf.SCHOOL, 'Washington and Lee'); assert.equal(mf.GRADYR, '2028'); assert.equal(mf.TRACK, 'Private Equity')
})

test('invalid profile values are dropped', async () => {
  const res = mockRes()
  await handler()(req(good({ profile: { school: '', gradYear: '1999', track: 'Astronaut' } })), res)
  const mf = calls[0].body.merge_fields
  assert.equal(mf.SCHOOL, undefined); assert.equal(mf.GRADYR, undefined); assert.equal(mf.TRACK, undefined)
})

test('compliance state → 200 ok without leaking status', async () => {
  responses.push({ status: 400, data: { title: 'Member In Compliance State', detail: 'unsubscribed' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
})

test('Mailchimp fake/invalid email → 400 friendly', async () => {
  responses.push({ status: 400, data: { title: 'Invalid Resource', detail: 'drake@wlu.edu looks fake or invalid, please enter a real email address.' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 400); assert.equal(res.body.error, 'That email looks invalid.')
})

test('Mailchimp 500 → 502', async () => {
  responses.push({ status: 500, data: { title: 'Internal' } })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 502); assert.equal(res.body.ok, false)
})

test('missing env → 500 not configured, no call', async () => {
  delete process.env.MAILCHIMP_API_KEY
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 500); assert.equal(res.body.error, 'Waitlist is not configured yet.'); assert.equal(calls.length, 0)
})

test('tag failure is non-fatal', async () => {
  responses.push({ status: 200, data: {} }, { status: 500, data: {} })
  const res = mockRes(); await handler()(req(good()), res)
  assert.equal(res.statusCode, 200); assert.equal(res.body.ok, true)
})

test('oversized body → 413', async () => {
  const res = mockRes(); await handler()(req(good({ utm: { source: 'x'.repeat(5000) } })), res)
  assert.equal(res.statusCode, 413)
})

test('refCode is deterministic per email', async () => {
  const a = mockRes(); await handler()(req(good()), a)
  const b = mockRes(); await handler()(req(good({ email: 'DRAKE@wlu.edu' })), b)
  assert.equal(a.body.refCode, b.body.refCode)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test api/__tests__/`
Expected: FAIL with `Cannot find module '../waitlist'`

- [ ] **Step 3: Implement `api/_lib/mailchimp.js`**

```js
const crypto = require('crypto')

const TRACKS = ['Investment Banking', 'Consulting', 'Private Equity', 'Tech', 'Other']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function normalizeEmail(raw) {
  if (typeof raw !== 'string') return null
  const email = raw.trim().toLowerCase()
  if (email.length > 254 || !EMAIL_RE.test(email)) return null
  return email
}

function subscriberHash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}

function refCodeFor(email, salt) {
  const hex = crypto.createHash('sha256').update(email + salt).digest('hex')
  return BigInt('0x' + hex.slice(0, 16)).toString(36).padStart(8, '0').slice(0, 8)
}

function sanitizeRef(ref) {
  if (typeof ref !== 'string') return ''
  return ref.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)
}

function clip(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function buildMergeFields({ refCode, ref, utm, profile }) {
  const fields = {
    REFCODE: refCode,
    REFBY: sanitizeRef(ref),
    USOURCE: clip(utm && utm.source, 50),
    UMEDIUM: clip(utm && utm.medium, 50),
    UCAMPAIGN: clip(utm && utm.campaign, 50),
  }
  if (profile && typeof profile === 'object') {
    fields.SCHOOL = clip(profile.school, 100)
    const year = Number(profile.gradYear)
    fields.GRADYR = Number.isInteger(year) && year >= 2026 && year <= 2031 ? String(year) : ''
    fields.TRACK = TRACKS.includes(profile.track) ? profile.track : ''
  }
  for (const key of Object.keys(fields)) if (!fields[key]) delete fields[key]
  return fields
}

function getConfig(env = process.env) {
  const config = {
    apiKey: env.MAILCHIMP_API_KEY,
    dc: env.MAILCHIMP_SERVER_PREFIX,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
  }
  const missing = [
    ['MAILCHIMP_API_KEY', config.apiKey],
    ['MAILCHIMP_SERVER_PREFIX', config.dc],
    ['MAILCHIMP_AUDIENCE_ID', config.audienceId],
  ].filter(([, v]) => !v).map(([k]) => k)
  return { ...config, missing }
}

async function mailchimpRequest(config, method, path, body) {
  const res = await fetch(`https://${config.dc}.api.mailchimp.com/3.0${path}`, {
    method,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`anystring:${config.apiKey}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = {}
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

module.exports = {
  TRACKS, normalizeEmail, subscriberHash, refCodeFor, sanitizeRef, buildMergeFields, getConfig, mailchimpRequest,
}
```

- [ ] **Step 4: Implement `api/waitlist.js`**

```js
const {
  normalizeEmail, subscriberHash, refCodeFor, buildMergeFields, getConfig, mailchimpRequest,
} = require('./_lib/mailchimp')

const MAX_BODY = 4096
const MIN_FILL_MS = 1500

function parseBody(raw) {
  if (raw && typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return null }
  }
  return null
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()

  const body = parseBody(req.body)
  if (!body) return res.status(400).json({ ok: false, error: 'Enter a valid email.' })
  if (JSON.stringify(body).length > MAX_BODY) return res.status(413).json({ ok: false, error: 'Request too large.' })

  // Bots: fill the honeypot or submit instantly. Pretend success, do nothing.
  if ((typeof body.company === 'string' && body.company.length > 0) || Number(body.t) < MIN_FILL_MS) {
    return res.status(200).json({ ok: true, refCode: refCodeFor(String(body.email || ''), 'honeypot') })
  }

  const email = normalizeEmail(body.email)
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a valid email.' })

  const config = getConfig()
  if (config.missing.length) {
    console.error('[waitlist] missing env vars:', config.missing.join(', '))
    return res.status(500).json({ ok: false, error: 'Waitlist is not configured yet.' })
  }

  const hash = subscriberHash(email)
  const refCode = refCodeFor(email, config.audienceId)
  const merge_fields = buildMergeFields({ refCode, ref: body.ref, utm: body.utm, profile: body.profile })
  const memberPath = `/lists/${config.audienceId}/members/${hash}`

  try {
    const put = await mailchimpRequest(config, 'PUT', memberPath, {
      email_address: email,
      status_if_new: 'pending',
      merge_fields,
    })

    if (put.status >= 400) {
      const title = put.data && put.data.title
      const detail = (put.data && put.data.detail) || ''
      if (title === 'Member In Compliance State' || title === 'Forgotten Email Not Subscribed') {
        return res.status(200).json({ ok: true, refCode })
      }
      if (put.status === 400 && /fake|invalid/i.test(detail)) {
        return res.status(400).json({ ok: false, error: 'That email looks invalid.' })
      }
      console.error('[waitlist] mailchimp error', put.status, title)
      return res.status(502).json({ ok: false, error: "Couldn't reach our list. Try again in a minute." })
    }

    const tags = [{ name: 'waitlist', status: 'active' }, { name: 'landing-v1', status: 'active' }]
    if (merge_fields.REFBY) tags.push({ name: 'referred', status: 'active' })
    try {
      const tagRes = await mailchimpRequest(config, 'POST', `${memberPath}/tags`, { tags })
      if (tagRes.status >= 400) console.error('[waitlist] tag error', tagRes.status)
    } catch (err) {
      console.error('[waitlist] tag request failed', err.message)
    }

    return res.status(200).json({ ok: true, refCode })
  } catch (err) {
    console.error('[waitlist] request failed', err.message)
    return res.status(502).json({ ok: false, error: "Couldn't reach our list. Try again in a minute." })
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test api/__tests__/`
Expected: all 17 tests PASS. If the hostile-ref expectation string differs, recompute it by hand from the sanitize rule (lowercase, strip non-alphanumerics, first 16 chars) and fix whichever side is wrong. Do not loosen the regex assertion.

- [ ] **Step 6: Commit**

```bash
git add api/waitlist.js api/_lib/mailchimp.js api/__tests__/waitlist.test.js
git commit -m "feat(api): Mailchimp waitlist endpoint with double opt-in, referral codes, bot filtering"
```

---

## Task 2: Analytics, Meta, OG Image (Workstream C)

**Files:**
- Create: `src/lib/analytics.js`, `src/components/RouteTracker.jsx`, `scripts/og-image.html`, `public/og-image.png`
- Modify: `index.html`, `package.json`, `package-lock.json`

**Interfaces:**
- Produces (named exports from `src/lib/analytics.js`): `initAnalytics(): void`, `track(name: string, params?: object): void`, `trackPageView(path: string): void`, `getUtm(): {source:string, medium:string, campaign:string}`, `getRef(): string`
- Produces: `src/components/RouteTracker.jsx`, default export, renders `null`, and must be rendered inside `BrowserRouter`
- Produces: the `@vercel/analytics` dependency (Task 3 imports `{ Analytics } from '@vercel/analytics/react'`)

- [ ] **Step 1: Install dependency**

Run: `npm install` then `npm install @vercel/analytics`
Expected: `package.json` dependencies include `@vercel/analytics`.

- [ ] **Step 2: Create `src/lib/analytics.js`**

```js
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
let initialized = false

export function initAnalytics() {
  if (initialized) return
  if (!GA_ID || !import.meta.env.PROD) {
    if (import.meta.env.DEV) console.debug('[analytics] GA disabled (dev or no VITE_GA_MEASUREMENT_ID)')
    return
  }
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)
  initialized = true
}

export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  } else if (import.meta.env.DEV) {
    console.debug('[analytics]', name, params)
  }
}

export function trackPageView(path) {
  track('page_view', { page_path: path, page_location: window.location.href, page_title: document.title })
}

function readPersisted(storageKey, read) {
  try {
    const fresh = read(new URLSearchParams(window.location.search))
    if (fresh) { sessionStorage.setItem(storageKey, JSON.stringify(fresh)); return fresh }
    const saved = sessionStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function getUtm() {
  const utm = readPersisted('ascend_utm', (p) => {
    const v = { source: p.get('utm_source') || '', medium: p.get('utm_medium') || '', campaign: p.get('utm_campaign') || '' }
    return v.source || v.medium || v.campaign ? v : null
  })
  return utm || { source: '', medium: '', campaign: '' }
}

export function getRef() {
  const ref = readPersisted('ascend_ref', (p) => {
    const raw = (p.get('ref') || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)
    return raw || null
  })
  return typeof ref === 'string' ? ref : ''
}
```

- [ ] **Step 3: Create `src/components/RouteTracker.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics.js'

export default function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  return null
}
```

- [ ] **Step 4: Update `index.html` `<head>`**

- Change the viewport to `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
- Keep the theme-color, apple tags, manifest, icon, and the existing Google Fonts links exactly.
- Replace the title and add the tags below after the title:

```html
<title>Ascend: Never miss the deadline that costs you the offer</title>
<meta name="description" content="Ascend pulls Canvas, your recruiting pipeline, and your calendar into one weekly game plan, built for students who mean it. Join the Founding Cohort." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://ascend-app-one.vercel.app/" />
<meta property="og:title" content="Ascend: Never miss the deadline that costs you the offer" />
<meta property="og:description" content="The strategic operating system for students recruiting while carrying a full course load. Founding Cohort gets Pro free." />
<meta property="og:image" content="https://ascend-app-one.vercel.app/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Ascend: Never miss the deadline that costs you the offer" />
<meta name="twitter:image" content="https://ascend-app-one.vercel.app/og-image.png" />
```

- [ ] **Step 5: Create `scripts/og-image.html` and render the PNG**

The HTML page is exactly 1200×630 with `margin:0`, `background:#0A0E1A`, and the Google Fonts link for Playfair Display 700 and JetBrains Mono 500.
- Draw an inline SVG of 9 concentric, irregular contour paths in `rgba(201,168,76,0.35)`, 1.25px stroke, offset to the right third.
- Add the mono eyebrow `YOUR EDGE, ORGANIZED.` in `#C9A84C`, letter-spacing 0.2em.
- Add the H1 "Never miss the deadline that costs you the offer." in Playfair 700, 68px, `#EDE7DA`, max-width 760px, left padding 80px.
- Add the wordmark "ASCEND" in mono at the bottom left.

Render it:
```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 --window-size=1200,630 --screenshot="$(pwd -W)/public/og-image.png" "file:///$(pwd -W)/scripts/og-image.html"
```
Expected: `public/og-image.png` exists and is 1200×630. View it with the Read tool to confirm the text rendered in Playfair (not a fallback serif) and nothing is clipped. If Edge fails, commit `public/og-image.svg`, change both image meta tags to `.svg`, and report it.

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: success. Analytics has no consumers yet, which is fine.

- [ ] **Step 7: Commit**

```bash
git add src/lib/analytics.js src/components/RouteTracker.jsx index.html package.json package-lock.json scripts/og-image.html public/og-image.png
git commit -m "feat(analytics): GA4 wrapper, SPA route tracking, OG/meta tags, Vercel Analytics dep"
```

---

## Task 3: Routing, Service-Worker Kill-Switch, Cleanup (Workstream D)

**Files:**
- Modify: `src/App.jsx`, `src/main.jsx`, `vercel.json`, `vite.config.js`, `public/manifest.json`, `.env.example`
- Create: `public/sw.js`
- Delete: `ascend-signup.html`, `public/ascend-signup.html`

**Interfaces:**
- Consumes (they may not exist in your worktree, so create uncommitted stubs to build):
  - `src/landing/Landing.jsx` (default export)
  - `src/screens/Privacy.jsx` (default export)
  - `src/components/RouteTracker.jsx` (default export)
  - `src/lib/analytics.js` (`initAnalytics`)
  - `@vercel/analytics/react` (`Analytics`). Install with `npm install @vercel/analytics --no-save` for the local build only. **Do not commit package.json/lockfile changes.** Task 2 owns them.

- [ ] **Step 1: Edit `src/App.jsx`**

Add the imports:
```jsx
import { Analytics } from '@vercel/analytics/react'
import RouteTracker from './components/RouteTracker.jsx'
import Landing     from './landing/Landing.jsx'
import Privacy     from './screens/Privacy.jsx'
```
- Change the comment `// ── Onboarding flow — lives at "/" ──` to `lives at "/start"`.
- Replace the root `App` return with:
```jsx
    <BrowserRouter>
      <RouteTracker />
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/start"     element={<OnboardingFlow />} />
            <Route path="/privacy"   element={<Privacy />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardWrapper /></ProtectedRoute>
            } />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
```
- Then grep for other hard-coded navigations to `'/'` that mean "restart onboarding": `grep -rn "navigate('/')\|to=\"/\"\|href=\"/\"" src --include=*.jsx`. For each hit in onboarding, login, or dashboard code where the intent is "go back to onboarding", change it to `/start`. Leave logout → `/` as is (landing is correct there). List every change in your report.

- [ ] **Step 2: Edit `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics.js'
import './styles/globals.css'

initAnalytics()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 3: Replace `vercel.json`**

```json
{
  "redirects": [
    { "source": "/ascend-signup", "destination": "/", "permanent": true },
    { "source": "/ascend-signup.html", "destination": "/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api|@vite|@react-refresh|node_modules|src).*)",
      "destination": "/index.html"
    }
  ]
}
```

- [ ] **Step 4: Remove the PWA plugin from `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
  ],
})
```

- [ ] **Step 5: Create `public/sw.js` (the kill-switch for the old Workbox SW)**

```js
// Replaces the retired vite-plugin-pwa service worker. Returning visitors'
// browsers fetch this on their next update check; it wipes caches,
// unregisters itself, and reloads open tabs so they get the live site.
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    clients.forEach((client) => client.navigate(client.url))
  })())
})
```

- [ ] **Step 6: Edit `public/manifest.json`**

Set `"start_url": "/start"`. Leave the rest unchanged.

- [ ] **Step 7: Append to `.env.example`**

```
# ══════════════════════════════════════════════════════════════════
# Landing page — Waitlist (Mailchimp) + Analytics
# Full walkthrough: docs/LAUNCH_SETUP.md
# ══════════════════════════════════════════════════════════════════

# ── Mailchimp (server-only — never prefix with VITE_) ─────────────
# API key: Profile → Account & billing → Extras → API keys → Create A Key
MAILCHIMP_API_KEY=your_mailchimp_api_key-us21
# The part after the dash in your API key (e.g. us21)
MAILCHIMP_SERVER_PREFIX=us21
# Audience → Settings → Audience name and defaults → Audience ID
MAILCHIMP_AUDIENCE_ID=your_audience_id

# ── Google Analytics 4 (public by design — safe in the client) ────
# GA4 Admin → Data streams → Web → Measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

- [ ] **Step 8: Delete the dead Formspree pages**

Run: `git rm ascend-signup.html public/ascend-signup.html`

- [ ] **Step 9: Verify with stubs (uncommitted)**

Create temporary stubs for any missing consumer files. Example: `export default function Landing(){return <div>landing</div>}`. The analytics stub is `export const initAnalytics=()=>{}` plus a `RouteTracker` returning null. Then:

- Run `npm install` and `npm install @vercel/analytics --no-save`.
- Run `npm run build`. Expected: success.
- Run `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'));JSON.parse(require('fs').readFileSync('public/manifest.json','utf8'))"`. Expected: no output.
- **Delete the stubs** and run `git checkout -- package.json package-lock.json` if either changed. `git status` must show only your owned files.

- [ ] **Step 10: Commit**

```bash
git add src/App.jsx src/main.jsx vercel.json vite.config.js public/manifest.json public/sw.js .env.example
git commit -m "feat(routing): landing at /, onboarding at /start, SW kill-switch, retire Formspree page"
```
(The `git rm` from Step 8 is already staged.)

---

## Task 4: Landing UI (Workstream A)

**Before writing any UI, invoke the `frontend-design:frontend-design` skill.** Then follow the spec §2–§3 exactly. The design is already decided (Summit Ledger); the skill governs execution quality, not direction.

**Files (all Create):**
- `src/landing/landing.css`: `--lp-*` vars scoped to `.lp-root`, the grain/noise overlay, the CTA sheen keyframes, and focus-visible rings (gold 2px, offset 3px)
- `src/landing/content.js`: all copy from spec §3, the FAQ items (with `id`s), features, the `CONTACT_EMAIL`, and `TRACKS`
- `src/landing/Landing.jsx`: default export. Wraps everything in `<MotionConfig reducedMotion="user"><div className="lp-root">…`, composing the sections in spec order, and sets `document.title` on mount
- `src/landing/Contours.jsx`: procedural topographic SVG
- `src/landing/DashboardMock.jsx`: framed "This Week" board mock in JSX
- `src/landing/DeadlineBoard.jsx`: the scroll-triggered task tick-off animation
- `src/landing/WaitlistForm.jsx`, `src/landing/ProfileStep.jsx`, `src/landing/ReferralPanel.jsx`
- `src/landing/sections/LandingNav.jsx`, `Hero.jsx`, `Problem.jsx`, `HowItWorks.jsx`, `Features.jsx`, `FoundingCohort.jsx`, `FAQ.jsx`, `FinalCta.jsx`, `LandingFooter.jsx`
- `src/screens/Privacy.jsx`: default export in the landing style. It discloses GA4 (usage analytics, cookies), Vercel Web Analytics (cookieless), and Mailchimp (stores email plus optional school, grad year, track; double opt-in; unsubscribe link in every email); says data is never sold; gives the contact via `CONTACT_EMAIL`; and has the effective date 2026-09-28

**Interfaces:**
- Consumes: `{ track, getUtm, getRef }` from `../lib/analytics.js` (Task 2). If it's missing in your worktree, create an uncommitted stub with the same signatures.
- Consumes: `POST /api/waitlist` (Task 1). Request shape per spec §5; response `{ok, refCode?, error?}`.
- Consumes: `useAuth()` from `../contexts/AuthContext.jsx`, which returns `{ user }`. The nav swaps in "Open dashboard" → `/dashboard` when `user` is present.
- Produces: `src/landing/Landing.jsx` and `src/screens/Privacy.jsx` default exports (consumed by Task 3).
- The whole landing page must render at `/` outside any theme dependency. Use only `--lp-*` vars and don't rely on `body.premium`.

- [ ] **Step 1: `WaitlistForm.jsx`, the conversion-critical component. Implement exactly this logic (styling is yours):**

```jsx
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { track, getUtm, getRef } from '../lib/analytics.js'
import ProfileStep from './ProfileStep.jsx'
import ReferralPanel from './ReferralPanel.jsx'

export async function parseResponse(res) {
  let data = null
  try { data = await res.json() } catch { data = null }
  if (res.ok && data && data.ok === true) return { ok: true, refCode: data.refCode || '' }
  return { ok: false, error: (data && data.error) || 'Something went wrong. Try again.' }
}

export async function postWaitlist(payload) {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return await parseResponse(res)
  } catch {
    return { ok: false, error: 'Something went wrong. Try again.' }
  }
}

export default function WaitlistForm({ location }) {
  const renderedAt = useRef(Date.now())
  const inFlight = useRef(false)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | profiled | error
  const [error, setError] = useState('')
  const [refCode, setRefCode] = useState('')

  const basePayload = () => ({
    email, ref: getRef() || null, utm: getUtm(), company, t: Date.now() - renderedAt.current,
  })

  async function onSubmit(e) {
    e.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setStatus('submitting'); setError('')
    const result = await postWaitlist(basePayload())
    inFlight.current = false
    if (result.ok) {
      setRefCode(result.refCode); setStatus('success')
      track('sign_up', { method: 'waitlist', form_location: location })
    } else {
      setError(result.error); setStatus('error')
    }
  }

  async function onProfileSave(profile) {
    const result = await postWaitlist({ ...basePayload(), profile })
    if (result.ok) track('profile_complete', { track: profile.track || 'none' })
    setStatus('profiled')
    return result
  }

  if (status === 'success') return <ProfileStep onSave={onProfileSave} onSkip={() => setStatus('profiled')} />
  if (status === 'profiled') return <ReferralPanel refCode={refCode} />

  return (
    <form onSubmit={onSubmit} noValidate={false} aria-describedby={`wl-msg-${location}`}>
      {/* honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>Company<input tabIndex={-1} autoComplete="off" name="company" value={company} onChange={(e) => setCompany(e.target.value)} /></label>
      </div>
      <label htmlFor={`wl-email-${location}`} className="sr-only">Email address</label>
      <input id={`wl-email-${location}`} type="email" name="email" autoComplete="email" inputMode="email" required
        placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'submitting'} />
      <motion.button type="submit" disabled={status === 'submitting'} whileTap={{ scale: 0.98 }}>
        {status === 'submitting' ? 'Joining…' : 'Join the waitlist'}
      </motion.button>
      <p id={`wl-msg-${location}`} role={status === 'error' ? 'alert' : undefined}>
        {status === 'error' ? error : 'Founding Cohort gets Pro free. No spam, unsubscribe anytime.'}
      </p>
    </form>
  )
}
```

The success message "Check your inbox to confirm your spot." is shown at the top of `ProfileStep`.

**ProfileStep** takes `onSave(profile) => Promise<{ok}>` and `onSkip()`.
- It has 3 optional fields: School (text, maxLength 100), Grad year (select 2026–2031, blank default), and Track (select from `TRACKS` in content.js, blank default).
- "Save" is disabled while saving; "Skip" is a text button.
- A profile save failure is still non-blocking: the user proceeds to the referral panel either way.

**ReferralPanel** takes `refCode`.
- It shows `${window.location.origin}/?ref=${refCode}` in a read-only input, rendered as text in JSX (never `dangerouslySetInnerHTML`).
- The "Copy link" button uses `navigator.clipboard.writeText`, falling back to select plus `document.execCommand('copy')`. It shows "Copied" for 2s and fires `track('referral_copy')`.

- [ ] **Step 2: `Contours.jsx`, the procedural topography**

```jsx
import { motion } from 'framer-motion'

// Deterministic pseudo-random so SSR/hydration and every visit look identical.
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647 }

function ring(cx, cy, r, wobble, rand, points = 72) {
  const phases = [rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2]
  const pts = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const d = r * (1 + wobble * (0.5 * Math.sin(3 * a + phases[0]) + 0.3 * Math.sin(5 * a + phases[1]) + 0.2 * Math.sin(2 * a + phases[2])))
    pts.push([cx + d * Math.cos(a), cy + d * Math.sin(a) * 0.72])
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'
}

export default function Contours({ seed = 7, rings = 14, cx = 900, cy = 380, className = '' }) {
  const rand = rng(seed)
  const paths = Array.from({ length: rings }, (_, i) => ring(cx, cy, 40 + i * 42, 0.08 + i * 0.006, rand))
  return (
    <svg className={className} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke={i % 5 === 0 ? 'rgba(201,168,76,0.28)' : 'var(--lp-line)'}
          strokeWidth={i % 5 === 0 ? 1.25 : 1}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }} />
      ))}
    </svg>
  )
}
```
Use it once behind the hero and once (different `seed`, `cx`, `cy`) behind Founding Cohort. Place checkpoint labels in the section headers in mono, e.g. `CP-01 · PROBLEM`, `CP-02 · SYSTEM`. Style them with `--lp-ink-soft` and a gold tick mark.

- [ ] **Step 3: `DashboardMock.jsx` and `DeadlineBoard.jsx`**

**DashboardMock** is a browser-framed card:
- A mono URL bar reading `ascend / this-week`, plus a sidebar strip.
- 5 day columns (Mon–Fri). Tasks are color-coded by category: academic `--lp-blue`, recruiting `--lp-gold`, personal teal `#2DD4BF`.
- Example tasks (realistic, not claims): "Econ 210 problem set", "Evercore coffee chat: prep 3 Qs", "Submit Bain app", "Canvas: Phil 101 reading", "Lift + 30 min run".
- A "Sunday Preview" chip reading "3 actions this week".
- It is static, with no motion except a subtle 1-time rise-in. Fixed aspect ratio, so there is no layout shift.

**DeadlineBoard** is a vertical list of 5 tasks.
- Use `useInView` (once, amount 0.5). The tasks' checkboxes tick with a 350ms stagger, drawing an SVG checkmark path.
- Item 4 ("Submit Bain app, due 11:59pm") first shows an ember `MISSED?` flag, then flips to a gold `RESCHEDULED → TUE 9AM` flag.
- Under `useReducedMotion()`, render the final state immediately.

- [ ] **Step 4: Sections, per spec §3 copy and order**

- **Hero:**
  - Desktop: asymmetric 7/5 split (text left, `DashboardMock` right, overlapping the contour field). Mobile: text, then form, then mock.
  - The form sits above the fold on a 390×844 viewport.
  - Style the H1 with `font-family: 'Playfair Display'` and `clamp(2.6rem, 6vw, 5.2rem)`, with line-height 1.02 and letter-spacing -0.02em.
- **Problem:** the tool icons (`/Canvas.png`, `/GC.png`, `/Gmail.png`, `/LinkedIn.png`, `/Handshake.png`) start scattered with random rotations. `whileInView`, they settle into a single row joined by a gold line.
- **HowItWorks:** 3 checkpoints connected by a vertical dashed "trail" line, with `DeadlineBoard` beside checkpoint 3.
- **Features:** a staggered ledger. Rows alternate indent, each has a mono index `01`–`04`, and a hairline rule sits between rows. Pet images go in the accountability row. **Not a grid of cards.**
- **FoundingCohort:** a gold-bordered panel with 3 perks and `WaitlistForm location="cohort"`.
- **FAQ:** `<details>`/`<summary>`. Fire `track('faq_open', { question_id })` on the `toggle` event when open.
- **FinalCta:** `WaitlistForm location="final"`.
- **LandingFooter:** © 2026 Ascend, `/privacy`, and `mailto:${CONTACT_EMAIL}`.

**Analytics wiring (exact event names from spec §6):**
- Every "Join the waitlist" nav or secondary button scrolls to `#join` (the hero form) and fires `track('cta_click', { cta_id, location })`.
- Every link to `/start` uses react-router `<Link>` and fires `track('demo_click', { location })`.

- [ ] **Step 5: Verify**

Run: `npm install && npm run build`. Expected: success, no warnings about missing modules (stubs allowed, uncommitted).

Then run `npm run preview` in the background and screenshot with headless Edge at desktop (1440×900) and mobile (390×844):
```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=390,844 --screenshot="$(pwd -W)/.lp-mobile.png" http://localhost:4173/
```
Read both screenshots. Confirm:
- The hero form is visible above the fold on mobile.
- Fonts are Playfair and DM Sans, not fallbacks.
- No horizontal scroll and no overlapping text.
- Contrast looks AA.

Fix issues. Delete the screenshots before committing. **Also verify the error path:** in preview, the `/api` route doesn't exist, so submitting the form must show "Something went wrong. Try again." and NOT a success state (Review Focus 2). Confirm by clicking via a quick headless check or by reasoning through `parseResponse` on a 404 HTML response. State which you did.

- [ ] **Step 6: Commit**

```bash
git add src/landing src/screens/Privacy.jsx
git commit -m "feat(landing): Summit Ledger landing page with waitlist, profile step, referral link"
```

---

## Task 5: Launch Setup Guide (Workstream E)

**Files:**
- Create: `docs/LAUNCH_SETUP.md`

**Interfaces:**
- Consumes: env var names and event names from spec §5–§6 (copy them exactly).
- Consumes: the prod URL `https://ascend-app-one.vercel.app`.

- [ ] **Step 1: Write `docs/LAUNCH_SETUP.md`**

Audience: Drake, non-technical for these tools. Use numbered click-paths, a time estimate per section, and a checkbox per step. Before writing any claim about current UI labels or free-plan limits, verify it with WebSearch/WebFetch against the official docs, and cite the doc URL under each section. Sections:

1. **Overview (2 min):** what each tool does here, and a 30-minute total estimate.
2. **Mailchimp (15 min):**
   - Create an account (note free-plan contact and send limits as of today, with the source).
   - Create or rename the Audience ("Ascend Waitlist"), set the required physical address (explain that a PO box or a virtual address is allowed), and turn on double opt-in.
   - Add merge fields with exact tags and types: `REFCODE` (text), `REFBY` (text), `USOURCE` (text), `UMEDIUM` (text), `UCAMPAIGN` (text), `SCHOOL` (text), `GRADYR` (text), `TRACK` (text). Explain that merge tags must match exactly or the data is silently dropped.
   - Find the Audience ID.
   - Create an API key and read the server prefix from it.
   - Customize the opt-in confirmation email, then build a Welcome journey: trigger "Signs up / joins audience", and write a welcome email draft in Ascend's voice (confident, concise; include the referral link using the merge tag `https://ascend-app-one.vercel.app/?ref=*|REFCODE|*`).
   - Optional: a segment "Referred" (tag = referred).
3. **Google Analytics 4 (8 min):**
   - Create the property (US timezone/currency) and a Web data stream for the prod URL, and copy the Measurement ID.
   - Confirm Enhanced Measurement is on (scroll depth).
   - Admin → Events → mark `sign_up` as a **Key event** (it appears after its first occurrence; explain how to create it in advance via Admin → Key events → New key event).
   - Optionally register the custom dimensions `form_location`, `cta_id`, and `location` (event-scoped).
   - Verify with the Realtime and DebugView reports.
4. **Vercel (5 min):**
   - Project `ascend-app` → Settings → Environment Variables: add the 4 vars (`MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX`, `MAILCHIMP_AUDIENCE_ID`, `VITE_GA_MEASUREMENT_ID`) with the correct environments (Production + Preview), and state which are secret.
   - Redeploy (explain why: env changes and `VITE_` vars are baked in at build time).
   - Enable Web Analytics in the Analytics tab.
5. **Test it end-to-end (5 min):**
   - Visit the site with `?utm_source=test&ref=abc123`, sign up with a real address, and confirm the email.
   - Check Mailchimp: the contact appears as Subscribed with REFBY=abc123 and USOURCE=test, and tags `waitlist`, `landing-v1`, `referred`.
   - Check GA4 Realtime for `sign_up`.
   - Include a troubleshooting table covering: "Waitlist is not configured yet", no GA data (ad blockers; the ID only works in the production build), a contact that never appears (pending until confirmed), and merge fields that are blank.
6. **Sharing links with UTMs:** a table of ready-made links for Instagram bio, GroupMe/iMessage, LinkedIn post, and email signature, each using `utm_source`/`utm_medium`/`utm_campaign=founding-cohort`.
7. **Metrics that matter:**
   - Signup rate = `sign_up` / users on `/`.
   - Targets: ≥8% cold, ≥20% warm.
   - Where to see it in GA4 (Reports → Engagement → Events, and a simple Explore funnel: page_view `/` → cta_click → sign_up).
   - The weekly 10-minute review ritual.
8. **Later (v2):** queue position via KV, a cookie banner if you run ads or get EU traffic, a custom domain (and updating `og:url`).

- [ ] **Step 2: Self-check**

`grep -n "TODO\|TBD\|XXX" docs/LAUNCH_SETUP.md` must return nothing, except that the `G-XXXXXXXXXX` example is allowed. Confirm every env var and event name matches the spec exactly.

- [ ] **Step 3: Commit**

```bash
git add docs/LAUNCH_SETUP.md
git commit -m "docs: Mailchimp, GA4, and Vercel launch setup guide"
```

---

## Task 6: Integrate, Verify, Review (orchestrator)

**Files:** merge only. Fixes go wherever a finding points.

- [ ] **Step 1:** Merge the 5 worktree branches into `feature/landing-page` in order: B, C, D, A, E. Resolve conflicts (none expected, given file ownership).
- [ ] **Step 2:** `npm install && npm run build`. Expected: success.
- [ ] **Step 3:** `node --test api/__tests__/`. Expected: all pass.
- [ ] **Step 4:** `grep -r "MAILCHIMP" dist/`. Expected: no output.
- [ ] **Step 5:** `npm run preview`. Headless-screenshot `/`, `/start`, `/privacy`, and `/nope` (it should redirect to `/`). Confirm the form error state on submit (no API in preview) and single-request behavior on double submit (Review Focus 2 & 3).
- [ ] **Step 6:** Dispatch a fresh reviewer subagent over `git diff master...feature/landing-page` against the spec. Fix confirmed findings.
- [ ] **Step 7:** Push the branch and share the Vercel preview URL with Drake. Do **not** merge to master or deploy to production without his go-ahead.
