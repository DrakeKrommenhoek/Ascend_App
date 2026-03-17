# Ascend — Claude Code Project Guide

> **Audience**: W&L alumni demo (iPad/desktop). This is an interactive prototype, not a full app.
> **Goal**: Give alumni a taste of the full Ascend experience — intro → quiz → archetype reveal → dashboard preview.

---

## What Is Ascend?

Ascend is a **strategic operating system for ambitious college students** navigating recruiting, academics, and life simultaneously. It's not another task manager — it's a coordination platform that transforms overwhelmed students into strategic operators by unifying their calendars, recruiting timelines, and accountability systems into a single, personalized interface.

**Tagline ideas** (move away from "you have a problem" framing):
- *"Your edge, organized."*
- *"Built for students who mean it."*
- *"One place. Every priority. No excuses."*
- *"Strategy meets student life."*

---

## Prototype Scope (MVP Demo)

The demo has **4 screens** that flow sequentially:

1. **Splash / Intro Screen** — Brand impression, brief value prop, CTA to start quiz
2. **Onboarding Quiz** — 5–7 questions → assigns user to an archetype
3. **Archetype Reveal** — Personalized result card + accountability pet introduction
4. **Dashboard Preview** — Simplified mock of the actual Ascend interface

---

## Screen 1: Splash / Intro

**Purpose**: Impress in 5 seconds. Communicate what Ascend is and who it's for.

**Content**:
- Ascend logo + wordmark
- Tagline (pick from above or iterate)
- 2–3 sentence value prop: *"Recruiting season is relentless. Ascend brings your academics, recruiting deadlines, and accountability into one intelligent interface — so you spend less time managing and more time executing."*
- CTA button: "Find Your Strategy Style →"
- Subtle visual: convergence of app icons (Canvas, Google Cal, Outlook, LinkedIn) flowing into one Ascend mark

**Aesthetic Direction**:
- Dark background (deep navy or near-black)
- Accent color: electric blue or warm gold (not purple — avoid generic AI look)
- Font: editorial serif for the headline, clean sans for body
- Animated entrance: logo fades in, tagline slides up, CTA pulses

---

## Screen 2: Onboarding Quiz

**Purpose**: Segment the user into 1 of 3 archetypes via 5–7 questions. Make it feel fast, personal, and modern — not like a Google Form.

**Format**: One question at a time, progress bar at top, animated transitions between questions.

### Quiz Questions (in order)

**Q1 — Career Clarity** *(single select)*
> "Where are you in your recruiting journey?"
- 🧭 Still exploring — I'm figuring out what I want
- 📈 Locked in — I know my target industry and I'm preparing
- 🔄 Pivoting — I'm changing direction or considering multiple paths

**Q2 — Industry Target** *(single select)*
> "What industry are you focused on? (or closest to)"
- 💰 Investment Banking / Finance
- 🏢 Consulting (MBB, Big 4, boutique)
- 🚀 Tech / Startups
- 🌐 Other / Still deciding

**Q3 — Biggest Pain Point** *(single select)*
> "What makes recruiting feel overwhelming?"
- 📋 I lose track of deadlines and applications
- 🧠 I don't know where to start with prep
- ⚡ I procrastinate when pressure isn't immediate
- 📱 My tools are scattered everywhere

**Q4 — Current Tools** *(multi-select)*
> "What do you currently use to stay organized? (select all that apply)"
- Google Calendar
- Apple Calendar
- Canvas / LMS
- Outlook Calendar
- Notion
- Physical planner
- I'm figuring it out as I go

**Q5 — Accountability Style** *(single select)*
> "When you need to stay on track, what actually works?"
- 🔔 Firm reminders — don't let me off the hook
- 🤝 Encouragement — keep it positive and motivating
- 📊 Data — show me my progress and let me drive
- 🎮 Competition — I work better with stakes or a leaderboard

**Q6 — Pet / Personality Vibe** *(single select — this sets the accountability pet)*
> "Pick the vibe that fits you best"
- 🦅 Eagle — sharp, driven, focused on the top
- 🦊 Fox — clever, adaptable, always a step ahead
- 🐻 Bear — steady, disciplined, shows up every day
- 🐬 Dolphin — social, energetic, thrives in a team

**Q7 — Year / Timeline Context** *(single select)*
> "What year are you?"
- Freshman (recruiting feels far away)
- Sophomore (recruiting is real and coming fast)
- Junior or above (I'm deep in it)
- W&L Alumni (just exploring Ascend)

---

## Screen 3: Archetype Reveal

**Purpose**: Deliver a satisfying, personalized result. Make the user feel seen. Introduce their accountability pet.

### The 3 Archetypes

**Archetype A — The Strategist**
- *Triggered by*: Q1 = Locked in, Q2 = IB or Consulting, Q5 = Firm reminders or Data
- *Description*: "You know exactly where you're going. Ascend helps you build the bridge between ambition and execution — tracking every recruiting milestone, prep session, and deadline so nothing falls through the cracks."
- *Pet name suggestion*: Echo the Eagle — precise, focused, won't let you miss a window
- *Color*: Deep navy + gold
- *Icon*: 📈

**Archetype B — The Explorer**
- *Triggered by*: Q1 = Still exploring, Q2 = Other/Still deciding
- *Description*: "You're building the map as you go — and that takes real courage. Ascend helps you stay curious without losing momentum, surfacing the right opportunities at the right time."
- *Pet name suggestion*: Finn the Fox — clever, curious, always sniffing out the next best move
- *Color*: Warm amber + forest green
- *Icon*: 🧭

**Archetype C — The Operator**
- *Triggered by*: Q1 = Pivoting, Q3 = Scattered tools or Procrastination, Q5 = Encouragement or Competition
- *Description*: "You're juggling a lot — and you're doing it. Ascend brings structure to the chaos, turning your scattered commitments into a unified command center."
- *Pet name suggestion*: Dax the Dolphin — energetic, adaptable, best when things are moving
- *Color*: Electric teal + off-white
- *Icon*: ⚡

**Reveal card UI**:
- Full-screen animated reveal (card flips or slides in)
- Archetype name in large display font
- Pet illustration (simple, charming — Duolingo energy but more professional)
- 2–3 sentence description
- "Meet [Pet Name]" section with personality traits
- CTA: "See Your Dashboard →"

---

## Screen 4: Dashboard Preview

**Purpose**: Show what Ascend actually looks like. Not fully functional — but believable and impressive.

**Layout** (desktop/iPad optimized):
- Left sidebar: navigation (Dashboard, Recruiting, Academics, Weekly Plan, Accountability)
- Main area: split into 3 panels
  - **This Week** — color-coded task list (blue = academic, red = recruiting, green = personal)
  - **Sunday Preview** — "Your week ahead" summary card with 3–4 AI-generated action items
  - **Accountability Pet** — small card with pet status, streak counter, and an encouraging message

**Mock data to populate**:
- Academic: "ECON 301 midterm — Thursday", "Problem set due Monday"
- Recruiting: "Goldman Sachs app deadline — Friday", "Mock interview with career center — Wednesday"
- Personal: "Gym block — daily 7am", "Call home — Sunday"
- Sunday Preview action items: "Start Goldman app tonight", "Review DCF model Tuesday", "Schedule mock interview this week"

**Interaction**:
- Tabs in sidebar are clickable but show "Coming soon" modals for unbuilt sections
- Accountability pet card has a small animation / idle bounce
- Weekly tasks can be "checked off" with satisfying animation

---

## Design System

### Color Palette
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#0A0E1A` | Main background |
| `--bg-surface` | `#131929` | Cards, panels |
| `--bg-elevated` | `#1C2438` | Hover states, modals |
| `--accent-blue` | `#4F8EF7` | Primary CTA, links |
| `--accent-gold` | `#F5C842` | Highlights, archetype accents |
| `--accent-teal` | `#2DD4BF` | Secondary actions |
| `--text-primary` | `#F0F4FF` | Headlines |
| `--text-secondary` | `#8B95A8` | Body, labels |
| `--success` | `#34D399` | Completed tasks |
| `--warning` | `#FBBF24` | Upcoming deadlines |
| `--danger` | `#F87171` | Urgent items |

### Typography
- **Display / Headlines**: `Playfair Display` (Google Font) — editorial, ambitious
- **Body / UI**: `DM Sans` (Google Font) — clean, modern, readable
- **Code / Data**: `JetBrains Mono` — for metrics/numbers

### Motion
- Page transitions: 300ms ease-in-out slide
- Card reveals: 400ms staggered fade-up
- Button interactions: 150ms scale(0.97) press
- Pet idle animation: gentle bob loop (CSS keyframes)
- Quiz progress bar: smooth width transition

---

## File Structure

```
ascend-demo/
├── index.html          # Entry point (or main React file)
├── App.jsx             # Root component with screen routing
├── screens/
│   ├── Intro.jsx       # Screen 1: Splash
│   ├── Quiz.jsx        # Screen 2: Onboarding quiz
│   ├── Reveal.jsx      # Screen 3: Archetype reveal
│   └── Dashboard.jsx   # Screen 4: Dashboard preview
├── components/
│   ├── ProgressBar.jsx
│   ├── QuizCard.jsx
│   ├── ArchetypeCard.jsx
│   ├── PetWidget.jsx
│   ├── TaskList.jsx
│   └── SundayPreview.jsx
├── data/
│   ├── questions.js    # All quiz questions + options
│   ├── archetypes.js   # Archetype definitions + scoring logic
│   └── mockDashboard.js # Mock task/calendar data
├── styles/
│   └── globals.css     # Design tokens + base styles
└── CLAUDE.md           # This file
```

---

## Archetype Scoring Logic

Simple point-based system. Each answer adds points to one or more archetype buckets.

```js
// archetypes.js
const ARCHETYPES = {
  STRATEGIST: 'strategist',
  EXPLORER: 'explorer',
  OPERATOR: 'operator',
}

// Each question option maps to archetype weights
// e.g. Q1 "Locked in" → { strategist: 3 }
// e.g. Q1 "Still exploring" → { explorer: 3 }
// Tally all points, return highest bucket
```

Tiebreaker: Q4 (tools) → if multi-tool user → Operator. If no tools → Explorer.

---

## Iteration Roadmap (post-demo)

### Phase 1 (MVP PWA)
- [ ] Real auth (email or Google SSO)
- [ ] Canvas LMS OAuth integration
- [ ] Google/Outlook calendar sync
- [ ] Functional weekly planning UI
- [ ] Push notifications for accountability pet

### Phase 2
- [ ] IB / Consulting recruiting timeline data layer
- [ ] AI-generated Sunday preview (Claude API)
- [ ] Gamified streak tracking
- [ ] Referral / friend accountability pods

### Phase 3
- [ ] University ambassador program portal
- [ ] School-specific recruiting timeline overlays
- [ ] Premium paywall implementation
- [ ] Mobile PWA polish (iOS home screen install)

---

## Notes for Claude Code

- This is a **React** app (Vite scaffold preferred)
- Use **Tailwind CSS** for utility styling, but override with CSS variables from the design system above
- All quiz state lives in React context (no localStorage needed for demo)
- Archetype scoring happens client-side in `archetypes.js`
- Dashboard is **static mock data** — no real API calls in the prototype
- Pet animations are CSS keyframe only — no external animation libraries needed for prototype
- Fonts loaded via Google Fonts CDN in `index.html`
- Target screen: iPad Pro (1024px wide) and standard laptop (1280–1440px)

---

## Demo Script (for alumni pitch)

1. Show the Intro screen — let them read the tagline, don't explain it
2. Click "Find Your Strategy Style" — let them take the quiz themselves
3. Let them choose their own answers (no coaching) — the reveal is more impactful
4. Walk them through their archetype and introduce the pet
5. Transition to dashboard — point out the Sunday Preview and the color-coded task system
6. Close with: *"This is what recruiting season looks like when you actually have a system."*
