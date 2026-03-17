# Ascend App — Full Build Design
**Date:** 2026-03-12

## Overview

Complete implementation plan for the Ascend App: intro animation polish, PWA config, quiz with two modes, archetype reveal with hold-to-meet pet interaction, dashboard, and auto-restart.

---

## 1. Intro Updates

**Logo size**: `width: clamp(320px, 72vw, 900px)` on `Ascend_Logo_1.png`, `height: auto`. Up from 280px — dominates the white screen.

**mix-blend-mode: multiply** on both logo images:
- `ascendIconImg` (Beat 3 icon reveal, z:13)
- `ascendLogoImg` (wordmark phase, z:20)
Eliminates off-white box bleed against white background.

**Don't Press button**: Upgraded from 14px to 52px circle. Large, red, absurd. Label scales to `0.95rem`, `font-weight: 600`, `#1B3A6B`. CSS `::before` ring pulse stays, just scales to match.

---

## 2. PWA Configuration

**`public/manifest.json`**:
```json
{
  "name": "Ascend",
  "short_name": "Ascend",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#0A0E1A",
  "theme_color": "#0A0E1A",
  "icons": [
    { "src": "/ascend-icon.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/ascend-icon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`index.html`** additions:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

Copy `src/assets/ascend-icon.png` → `public/ascend-icon.png` for PWA manifest access.

**Viewport units audit**:
- Quiz question font: `clamp(1.1rem, 2.5vw, 1.6rem)`
- Quiz answer options: `padding: clamp(12px, 2vh, 20px) clamp(16px, 3vw, 28px)`
- Dashboard section headers: `clamp(0.85rem, 1.5vw, 1.1rem)`
- Progress bar height: `3px` (intentionally fixed, thin rule)
- Animation icon sizes (`64px`) stay px — physics-based, not layout

---

## 3. Quiz Architecture

### App State Machine (`App.jsx`)
```
intro → quiz → reveal → dashboard
```
State: `{ screen, quizMode, answers, archetype }`

`quizMode`: `'alumni'` | `'student'` — default `'alumni'`

### Quiz Component (`src/screens/Quiz.jsx`)

**Mode toggle**: Tiny 6px dot cluster (2×2 grid) in top-right of first question screen. `opacity: 0.15`, `cursor: pointer`. Single tap cycles `alumni ↔ student`, resets question index to 0, shows brief "Alumni / Student" flash (opacity 0→1→0 over 800ms).

**Flow per question**:
- Progress bar: thin line at very top, fills based on `currentQ / totalQ`
- Question text centered, large
- Answer options as vertical card list (tap to select + advance)
- Back button: bottom-left, `←`, `--text-secondary`, goes to previous question (or back to intro if Q1)
- No submit button — selecting an answer auto-advances after 200ms

### Alumni Mode (5 questions)

| # | Question | A (Eagle) | B (Fox) | C (Bear) |
|---|----------|-----------|---------|---------|
| 1 | "Right now, recruiting feels like…" | I have a plan and I'm executing it | I'm still mapping the landscape | I know what to do — I just don't always do it |
| 2 | "You have a coffee chat in 3 days. First move?" | Research them + draft talking points tonight | Block time in my calendar to prep tomorrow | I'll figure it out the morning of |
| 3 | "How do you track your recruiting pipeline?" | Spreadsheet or tracker — I know every status | I have a rough mental list | What pipeline? It's all in my inbox |
| 4 | "At the end of a busy week, you usually feel…" | I moved the right things forward | I learned a lot but didn't close much | I was busy but I'm not sure what I actually did |
| 5 | "What does 'winning' in recruiting look like?" | Landing the specific role I've already identified | Finding the right fit — wherever that leads | Building the habits so I'm consistently ready |

**Scoring**: A=Eagle, B=Fox, C=Bear. Most-counted wins. Tiebreak: last answer.

### Student Mode (6 questions)

| # | Question | A | B | C | D |
|---|----------|---|---|---|---|
| 1 | "Where are you in the process?" | Early exploration | Actively applying | Deep in interviews | Offer evaluation |
| 2 | "How do you manage recruiting tasks?" | Structured system (Notion/Sheets) | Calendar + memory | Email triage | Nothing consistent |
| 3 | "How often do you reach out to new contacts?" | Multiple times/week | Weekly | When it feels urgent | Rarely |
| 4 | "Biggest blocker right now?" | Don't know where to focus | Know what to do, don't do it | Need more connections | Volume is overwhelming |
| 5 | "How do you feel at the end of a typical week?" | Accomplished | Frustrated — meant to do more | Mixed | Fine — steady |
| 6 | "What would 'winning' look like?" | Specific role already in mind | Discover the right path | Consistent system | Options — I want to be choosing |

**Scoring** (student mode weights):
- Eagle signals: A1=structure/precision, A5=accomplished, A6=specific
- Fox signals: A1=exploration, B6=discover, C2=adapting
- Bear signals: C1=consistency, B4=know-but-don't, C6=system
- Most-matched category wins

---

## 4. Archetypes

Defined in `src/data/archetypes.js`:

```js
export const ARCHETYPES = {
  eagle: {
    id: 'eagle',
    name: 'The Strategist',
    animal: 'Eagle',
    emoji: '🦅',
    color: '#4F8EF7',
    zodiac: `Like the eagle that circles high before it strikes, you see the full landscape before you move. You don't act without knowing where you'll land. The eagle doesn't chase — it positions, it waits, and when the moment is right, it moves with total precision. That is you: strategic, sharp, unhurried by noise.`,
    petMessage: 'Your target list is locked. Stay sharp — the window opens Tuesday.',
    streakQuip: 'The eagle doesn\'t miss twice.',
  },
  fox: {
    id: 'fox',
    name: 'The Explorer',
    animal: 'Fox',
    emoji: '🦊',
    color: '#F5C842',
    zodiac: `Like the fox that knows a hundred paths through the forest, you are never cornered and never bored. You find angles others miss, adapt when plans shift, and discover as you go. The fox doesn't have one den — it builds options. That is you: curious, agile, most dangerous when given room to roam.`,
    petMessage: 'Three new angles this week. Keep exploring — the right path reveals itself to the curious.',
    streakQuip: 'Every path teaches the fox.',
  },
  bear: {
    id: 'bear',
    name: 'The Operator',
    animal: 'Bear',
    emoji: '🐻',
    color: '#34D399',
    zodiac: `Like the bear that returns to the same river every season, you are steady and unshakeable. You don't rush. You build through repetition, through presence, through showing up when others don't. The river always yields to the patient bear — and the opportunities always yield to you.`,
    petMessage: 'Day 12. Same river, same discipline. The streak holds.',
    streakQuip: 'The bear always comes back.',
  },
}
```

---

## 5. Reveal Screen (`src/screens/Reveal.jsx`)

**Phase 1 — Archetype reveal** (dark background):
- Emoji large (6rem) fades in first
- Animal name in Playfair Display, 700, large, archetype color
- `The Strategist` / `The Explorer` / `The Operator` in DM Sans, muted
- Zodiac description paragraph fades in 600ms later
- After 1200ms: hold-ring appears with instruction

**Phase 2 — Hold-to-meet interaction**:
- Large circular button (96px) — outline ring at `opacity: 0.3`, animal emoji at center
- Instruction: `"hold to meet your partner"` in small caps beneath
- On `pointerdown`: JS interval increments `holdProgress` 0→1 over 1800ms, ring fills via `conic-gradient`
- On `pointerup` before complete: ring resets to 0
- At 100%: ring pulses (`scale(1.15)` → `scale(1)`), then reveals:
  - `"Your [Animal] is ready."` fades in large
  - Archetype color glow behind emoji
- Auto-advance to dashboard 1800ms after reveal completes

---

## 6. Dashboard (`src/screens/Dashboard.jsx`)

Dark scheme. `display: grid` — two columns on landscape iPad, single column on small.

**Today's Priorities** (left column):
Mock tasks, toggle checkable:
- ☐ Follow up — John Kim, Goldman Sachs [Networking]
- ☐ Submit Citadel application — deadline today [Application — highlighted `--warning`]
- ☐ Case study review for tomorrow's prep [Prep]

**Week Ahead** (right column):
5-day strip:
- Mon: Coffee chat — Sarah Chen, McKinsey
- Tue: App deadline — Morgan Stanley
- Wed: Case prep session
- Thu: Alumni panel (W&L)
- Fri: Weekly review + plan

**Accountability Pet Widget** (bottom-right card):
- Animal emoji (large, 3rem)
- Name: `"Your [Animal]"` + streak: `"Day 12 🔥"`
- Personality-matched one-liner from archetype data
- Card background: `--bg-elevated`, soft border `--accent-[color]` at low opacity

**Auto-restart button**:
- Bottom-right corner, below pet widget
- `↺ Restart Demo` — `opacity: 0.35`, `font-size: 0.75rem`, `--text-secondary`
- Hover: `opacity: 0.8`
- Click: `onRestart()` → resets App state to `{ screen: 'intro', quizMode: 'alumni', answers: [], archetype: null }`

---

## File Manifest

| File | Action |
|------|--------|
| `src/screens/Intro.jsx` | Update: logo size, blend mode, button size |
| `src/screens/Quiz.jsx` | New: quiz flow, two modes, progress bar, back button |
| `src/screens/Reveal.jsx` | New: archetype reveal + hold-to-meet pet |
| `src/screens/Dashboard.jsx` | New: priorities, week view, pet widget, restart button |
| `src/data/archetypes.js` | New: Eagle/Fox/Bear data |
| `src/data/quizData.js` | New: alumni + student question sets |
| `src/App.jsx` | Update: full state machine, reset handler |
| `src/styles/globals.css` | Update: dont-press-btn size, hold ring styles |
| `public/manifest.json` | New: PWA manifest |
| `public/ascend-icon.png` | New: copy from src/assets |
| `index.html` | Update: manifest link, viewport meta, apple meta |
