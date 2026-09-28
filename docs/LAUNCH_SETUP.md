# Ascend Landing Page: Launch Setup Guide

**Target:** Go live at `https://ascend-app-one.vercel.app` with a working waitlist, confirmed signups in Mailchimp, and real-time conversion tracking in GA4.

**Total time estimate:** ~35 minutes (per-section estimates in each section).

---

## 1. Overview (2 min)

This guide walks you through three integrations that make the landing page functional:

- **Mailchimp** captures email signups and stores profile data (school, grad year, track) and referral tracking. Founding Cohort applicants get a confirmation email and can share a referral link.
- **Google Analytics 4 (GA4)** tracks when people sign up, what marketing channel brought them in (Instagram, email, etc.), and how they discovered the app (cold, referred, etc.).
- **Vercel** deploys the app and securely manages the API keys (Mailchimp credentials and GA4 ID) so they never leak into the browser.

Each section has numbered steps with time estimates. You'll need access to Drake's email (`hello@ascend.app` or your own) for Mailchimp and GA4. The entire setup takes about 30 minutes.

---

## 2. Mailchimp Signup and Audience Setup (15 min)

### Step 1: Create a Mailchimp account (2 min)
- [ ] Go to https://mailchimp.com and click **Sign Up**.
- [ ] Enter your email, set a password, and complete account setup.
- [ ] Verify your email address.

**Free plan limits (as of 2026):** [Source: Mailchimp Pricing](https://mailchimp.com/help/about-mailchimp-pricing-plans/)
- Up to 250 contacts
- 500 emails sent per month
- Note: If you exceed 250 contacts, Mailchimp will pause sending until you upgrade or reduce contacts.

### Step 2: Create an Audience (3 min)
- [ ] From the Mailchimp dashboard, click **Audience** in the left sidebar.
- [ ] Click **Create Audience** and name it `Ascend Waitlist`.
- [ ] Fill in the required fields:
  - **Campaign name:** Ascend Waitlist
  - **Default "From" email:** Use a company email (e.g., `hello@ascend.app`)
  - **Physical address:** Enter a real address (a PO box or virtual address like Google's is fine; this is required by US anti-spam law and Mailchimp's terms).
- [ ] Under **Contact preferences**, ensure **Double opt-in** is enabled. [Source: Double Opt-in Explanation](https://mailchimp.com/help/about-double-opt-in/) This means new signups must confirm their email before they're fully subscribed—critical for list quality.
- [ ] Click **Save**.

### Step 3: Add merge fields (4 min)
Merge fields let Mailchimp store extra data about each contact. These must be created before the API starts sending data, or the data will be silently dropped.

- [ ] In the Audience settings (click **Settings** from the audience dropdown, then **Audience fields and merge tags**), scroll to **Merge tags**.
- [ ] Click **Add merge field** for each. Use **exactly** these tag names (UPPERCASE) and types:

| Merge Tag | Type | Max Length | Purpose |
|-----------|------|------------|---------|
| REFCODE | Text | 8 | Your unique referral code |
| REFBY | Text | 16 | Who referred you (sanitized) |
| USOURCE | Text | 50 | UTM source (e.g., "instagram") |
| UMEDIUM | Text | 50 | UTM medium (e.g., "social") |
| UCAMPAIGN | Text | 50 | UTM campaign (e.g., "founding-cohort") |
| SCHOOL | Text | 100 | Your school name |
| GRADYR | Text | 4 | Grad year (e.g., "2028") |
| TRACK | Text | 50 | Career track (e.g., "Private Equity") |

**Important:** Tag names are case-sensitive. If you enter `refcode` instead of `REFCODE`, the API will silently fail to store the data. [Source: Mailchimp Merge Fields API](https://mailchimp.com/developer/marketing/docs/merge-fields/)

### Step 4: Find your Audience ID (1 min)
- [ ] In the same **Audience fields and merge tags** page, at the top, you'll see your **Audience ID** (starts with letters, like `a1b2c3d4e5`).
- [ ] Copy it and save it somewhere safe (you'll use it in Vercel).

### Step 5: Create an API key (2 min)
- [ ] Click your **profile icon** (top right) → **Profile** → **Extras** → **API keys**. [Source: Mailchimp API Keys](https://mailchimp.com/help/about-api-keys/)
- [ ] Click **Create A Key**.
- [ ] Name it `ascend-prod` (or similar).
- [ ] Click **Generate Key** and copy the entire key immediately (you'll only see it once).
- [ ] The key looks like `a1b2c3d4e5f6g7h8i9j0k1l2-us21`. The part **after the dash** (`us21`) is the **server prefix**—save that separately.

**Note:** As of June 22, 2026, new API keys expire 1 year after creation. [Source: Mailchimp API Keys](https://mailchimp.com/help/about-api-keys/)

### Step 6: Set up double opt-in confirmation email (1 min)
- [ ] Still in Audience settings, click **Notifications & confirmations** (or **Signup notifications**).
- [ ] Enable the double opt-in confirmation email and optionally customize the subject line. Mailchimp will send this automatically when someone enters their email.

### Step 7: Create a Welcome Journey (2 min)
With automation removed from Mailchimp's free plan as of January 2026 [Source: Mailchimp Free Plan Changes 2026](https://blog.groupmail.io/mailchimp-free-plan-changes-2026/), you'll set up a **Welcome Flow** (Mailchimp's new name for automations available on paid plans) or manually send a welcome email after launch. For now, you can:

- [ ] Go to **Flows** or **Automations** (if available on your plan).
- [ ] Create a new Journey triggered by **Signs up** or **Joins audience**.
- [ ] Add a step to **Send email** and use this template:

---

### Welcome Email Draft

**Subject:** Your Ascend access is ready (Founding Cohort)

**Body:**

```
Hi,

You're in. You've joined the Founding Cohort, and Pro is yours—free, for as long as you're building with us.

Starting now:
• Check your dashboard at https://ascend-app-one.vercel.app/start to set up your system
• Share your referral link: https://ascend-app-one.vercel.app/?ref=*|REFCODE|*
  (Every friend who joins moves the whole cohort forward.)
• Reply to this email if you hit any walls

Recruiting season doesn't wait. You're set up to not miss it.

—Drake
Ascend
hello@ascend.app
```

**Instructions:**
- Paste this into your welcome email template.
- Replace `*|REFCODE|*` with the merge tag `*|REFCODE|*` (Mailchimp will auto-fill each person's code).
- Send this as the final confirmation email or as a separate welcome email triggered immediately after signup.

---

## 3. Google Analytics 4 Setup (8 min)

### Step 1: Create a GA4 property (2 min)
- [ ] Go to https://analytics.google.com and sign in with your Google account.
- [ ] Click **Create** (or the + icon) and select **Create property**.
- [ ] Name it `Ascend`.
- [ ] Set the time zone to **United States** and currency to **USD**.
- [ ] Click **Next**.

### Step 2: Create a Web data stream (2 min)
- [ ] Select **Web** as the platform.
- [ ] Enter the website URL as `https://ascend-app-one.vercel.app`.
- [ ] Name the stream `Main Website`.
- [ ] Click **Create stream**.
- [ ] **Copy the Measurement ID** (starts with `G-`, like `G-ABC123XYZ`). Save it—you'll need it for Vercel.

[Source: GA4 Measurement ID Setup](https://support.google.com/analytics/answer/9304153?hl=en)

### Step 3: Enable Enhanced Measurement (1 min)
- [ ] In the data stream you just created, scroll down to **Enhanced Measurement**.
- [ ] Ensure these are **ON**:
  - Page views
  - Scrolls (tracks when users scroll 90% down the page)
  - Outbound clicks
  - File downloads
  - Video engagement

[Source: GA4 Enhanced Measurement and Scroll Depth](https://www.semrush.com/blog/google-analytics-scroll-depth/)

### Step 4: Create a "sign_up" Key Event (2 min)
In GA4, Key Events are what Universal Analytics called "Goals." They mark important user actions.

- [ ] Go to **Admin** (gear icon, bottom left) → **Events** (under "Data collection and modification").
- [ ] Click **Create event** or **New key event**.
- [ ] Set the event name to exactly: `sign_up`
- [ ] (Optional but recommended) Also register these custom event dimensions for deeper tracking:
  - `form_location` (e.g., hero, cohort, final)
  - `cta_id` (button identifier)
  - `location` (where the user was on the page)

The API will send `sign_up` events when someone confirms their email. GA4 will flag them as Key Events automatically after a few have been received. [Source: GA4 Key Events Setup 2026](https://www.analyticsmania.com/post/track-key-events-with-google-analytics-4/)

**Note:** It can take up to 24 hours for Key Events to activate.

### Step 5: Verify GA4 is working (1 min)
- [ ] Go to **Reports** → **Realtime** to see a live dashboard.
- [ ] Leave this page open after you deploy; when the first person signs up, you should see `sign_up` events here within seconds.
- [ ] For deeper debugging, also check **Admin → DebugView** (requires a special GA4 Debugger browser extension, but it shows in-flight events).

[Source: GA4 DebugView](https://support.google.com/analytics/answer/7201382)

---

## 4. Vercel Environment Variables (5 min)

### Step 1: Open the Vercel project settings (1 min)
- [ ] Go to https://vercel.com and navigate to your **ascend-app** project.
- [ ] Click **Settings** (top navigation).
- [ ] Click **Environment Variables** (left sidebar).

### Step 2: Add Mailchimp credentials (2 min)
Add these three variables exactly as shown. Copy the values from the previous sections.

- [ ] Click **Add New** and enter:
  - **Name:** `MAILCHIMP_API_KEY`
  - **Value:** Paste your full API key (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2-us21`)
  - **Environments:** Check **Production** and **Preview**
  - This is a **secret** (Vercel will mask it)

- [ ] Click **Add New** and enter:
  - **Name:** `MAILCHIMP_SERVER_PREFIX`
  - **Value:** The part after the dash in your API key (e.g., `us21`)
  - **Environments:** Check **Production** and **Preview**

- [ ] Click **Add New** and enter:
  - **Name:** `MAILCHIMP_AUDIENCE_ID`
  - **Value:** Your Audience ID from Mailchimp (e.g., `a1b2c3d4e5`)
  - **Environments:** Check **Production** and **Preview**

[Source: Vercel Environment Variables](https://vercel.com/docs/environment-variables)

### Step 3: Add the GA4 Measurement ID (1 min)
- [ ] Click **Add New** and enter:
  - **Name:** `VITE_GA_MEASUREMENT_ID`
  - **Value:** Your Measurement ID from GA4 (e.g., `G-ABC123XYZ`)
  - **Environments:** Check **Production** and **Preview**
  - This does **NOT** need to be a secret (it's public by design in GA4).

### Step 4: Redeploy the project (1 min)
- [ ] Go back to the **Deployments** tab.
- [ ] Find the most recent deployment and click the three-dot menu → **Redeploy**.
- [ ] Vercel will rebuild the app with your new environment variables baked in.
- [ ] Wait for the deployment to complete (usually 1–2 minutes). The status will show "Ready".

**Why redeploy?** The `VITE_` prefix variables are embedded at **build time**, not runtime. Env vars alone won't work until the next build. [Source: Vercel Deployments](https://vercel.com/docs/deployments/environments)

### Step 5: Enable Vercel Web Analytics (1 min)
- [ ] From the project home, click the **Analytics** tab.
- [ ] Click **Enable Web Analytics**.
- [ ] This gives you a second analytics dashboard with data on traffic, bounce rates, and top pages—no extra setup needed.

[Source: Vercel Web Analytics](https://vercel.com/docs/analytics)

---

## 5. Test End-to-End (5 min)

### Step 1: Sign up on the live site (2 min)
- [ ] Go to https://ascend-app-one.vercel.app in an incognito/private window.
- [ ] In the URL, add test UTM parameters: `?utm_source=test&utm_medium=email&utm_campaign=launch&ref=abc123`.
- [ ] Fill in the form with a **real email address** you control (not a fake one).
- [ ] Click **Join the waitlist**.
- [ ] You should see "Check your inbox to confirm your spot."
- [ ] Fill in the profile (School, Grad year, Track) and click **Save**.
- [ ] You should see your referral link `https://ascend-app-one.vercel.app/?ref=XXXX`.

### Step 2: Confirm the email (1 min)
- [ ] Check your inbox (and spam) for the Mailchimp double opt-in confirmation email.
- [ ] Click the confirmation link to verify your address.
- [ ] You should be redirected or see a confirmation page.

### Step 3: Check Mailchimp (1 min)
- [ ] Log into Mailchimp and go to your **Ascend Waitlist** audience.
- [ ] Click **Contacts** and find your email.
- [ ] Verify:
  - Status is **Subscribed** (not Pending).
  - Merge fields are populated:
    - `REFCODE`: A deterministic code (same every time for your email)
    - `REFBY`: `abc123` (from your ?ref= parameter)
    - `USOURCE`: `test`
    - `UMEDIUM`: `email`
    - `UCAMPAIGN`: `launch`
    - `SCHOOL`, `GRADYR`, `TRACK`: Your entries
  - Tags include `waitlist`, `landing-v1`, and `referred`.

### Step 4: Check GA4 Realtime (1 min)
- [ ] Go to Google Analytics 4 → **Reports** → **Realtime**.
- [ ] Within 30 seconds, you should see:
  - 1 active user on `/`
  - A `sign_up` event in the events list
  - Event details showing `form_location: 'hero'` (or `'cohort'` / `'final'` depending on which form you used)

### Troubleshooting Table

| Problem | Cause | Fix |
|---------|-------|-----|
| "Waitlist is not configured yet" error on submit | Missing env var in Vercel | Check all 3 Mailchimp vars are added and the project is redeployed. |
| No GA4 data after signing up | Ad blocker blocking gtag.js OR ID is wrong OR not in Production build | Disable ad blocker, verify Measurement ID is correct, confirm you redeployed after adding the env var. GA4 only works in the production build. |
| Email never arrives in Mailchimp | Contact is still Pending | Click the confirmation link in the opt-in email. Double opt-in requires confirmation. |
| Merge fields are blank in Mailchimp | Merge tag names don't match exactly (e.g., `refcode` vs. `REFCODE`) | Check the exact UPPERCASE names in Mailchimp match the API spec: REFCODE, REFBY, USOURCE, UMEDIUM, UCAMPAIGN, SCHOOL, GRADYR, TRACK. |
| Referral link isn't copying correctly | Browser doesn't support `navigator.clipboard` | Try a different browser or manually select and copy the link text. |

---

## 6. Sharing Links with UTMs (Ready to Copy) (2 min)

Use these links to promote the Ascend landing page. Copy the entire URL and paste into your channel. Each is pre-tagged so GA4 knows where the traffic came from.

### Base URL
```
https://ascend-app-one.vercel.app
```

### Pre-Built Links

| Channel | Link | Note |
|---------|------|------|
| **Instagram Bio** | `https://ascend-app-one.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=founding-cohort` | Use in Linktree or bio. |
| **GroupMe/iMessage** | `https://ascend-app-one.vercel.app/?utm_source=text&utm_medium=social&utm_campaign=founding-cohort` | Works for any texting app. |
| **LinkedIn Post** | `https://ascend-app-one.vercel.app/?utm_source=linkedin&utm_medium=social&utm_campaign=founding-cohort` | Add to your post caption. |
| **Email Signature** | `https://ascend-app-one.vercel.app/?utm_source=email&utm_medium=email&utm_campaign=founding-cohort` | Use in your .sig. |
| **Referral Link (Personalized)** | `https://ascend-app-one.vercel.app/?ref=<REFCODE>` | Replace `<REFCODE>` with your own code (shown in the referral panel after you sign up). |

**UTM Parameters Explained** [Source: UTM Parameters Guide](https://agencyanalytics.com/blog/utm-tracking)
- `utm_source`: Where the traffic comes from (instagram, email, linkedin, text, etc.)
- `utm_medium`: The type of channel (social, email, organic, cpc, etc.)
- `utm_campaign`: The specific campaign name (founding-cohort, fall-launch, etc.)

---

## 7. Metrics That Matter (Review Weekly) (3 min)

### The Conversion Funnel

Track this in GA4:
1. Users land on `/` → count in Realtime report
2. Users click "Join the waitlist" button → `cta_click` events
3. Users submit email → `sign_up` events (Key Event)
4. Users confirm email in Mailchimp → mark as **Subscribed**

**Signup rate = `sign_up` events / users on `/`**

### Targets
- **Cold traffic** (no referral, no UTM): ≥8% signup rate
- **Warm/referred traffic** (from your referral link or tagged with utm_campaign=founding-cohort): ≥20% signup rate

### Where to See It in GA4
- [ ] Go to **Reports** → **Engagement** → **Events**.
- [ ] Filter by event `sign_up`.
- [ ] See count per day and per utm_source.

- [ ] (Optional, advanced) Create an **Explore** funnel:
  - **Step 1:** Segment = page_path = `/`
  - **Step 2:** Event = `cta_click`
  - **Step 3:** Event = `sign_up`
  - This shows what % of visitors convert at each step.

[Source: GA4 Events Reporting](https://developers.google.com/analytics/devguides/collection/ga4/events)

### Weekly 10-Minute Review Ritual
Every Monday (or your preferred day):

- [ ] Open GA4 Realtime and Mailchimp **Contacts**.
- [ ] Note:
  - New signups (total count)
  - Signup rate from each source (Instagram, email, referrals, etc.)
  - Any drop in Mailchimp deliverability (bounces, complaints)
- [ ] If signup rate is low (<5%), check:
  - Is the form rendering? (Visit the site and try it.)
  - Are GA4 events firing? (Check Realtime.)
  - Is Mailchimp quota hit? (Max 250 contacts on free plan—if you're near it, contacts will be rejected.)

---

## 8. Later (v2+): Future Enhancements

These features require more setup and are **not needed** for launch:

- **Queue position / leaderboard** (v2): Requires Vercel KV (key-value store). Rank referrals and show real-time queue position on the landing page.
- **Live signup counter** (v2): Display `X people joined today` using Vercel KV.
- **A/B testing** (v2): Test different headlines, CTAs, or offers to optimize conversion rate.
- **Cookie consent banner** (v2): Only needed if you run paid ads or get EU traffic. If deploying GDPR, add a banner and enable Consent Mode v2 in GA4.
- **Custom domain** (v2): Once you have a domain (e.g., `ascend.so`), point it to the Vercel project and update `og:url` in `index.html`.

---

## Summary: What You Just Built

✓ Visitors sign up with their email on the Ascend landing page.
✓ Mailchimp captures their email, school, grad year, and track—double opt-in to ensure quality.
✓ They get a unique referral code to share and track friends.
✓ GA4 tracks every signup, showing you which channels (Instagram, email, etc.) are working.
✓ Vercel deploys it all securely without leaking API keys.

You're live. Welcome early builders.

---

**Questions?** Email `hello@ascend.app` or check the [Mailchimp Help Center](https://mailchimp.com/help/), [GA4 Docs](https://support.google.com/analytics), or [Vercel Docs](https://vercel.com/docs).

**Last updated:** 2026-09-28
