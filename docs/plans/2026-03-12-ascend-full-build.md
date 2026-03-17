# Ascend App — Full Build Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the intro, add PWA config, build a 2-mode quiz, archetype reveal with hold-to-meet pet interaction, and a dashboard with auto-restart.

**Architecture:** Single-page React app with screen-based state machine in `App.jsx`. All data (questions, archetypes) lives in `src/data/`. No routing library — `useState` drives screen transitions. Animation via rAF + inline styles (no animation libraries).

**Tech Stack:** React 18, Vite, Tailwind CSS 3, DM Sans / Playfair Display (Google Fonts), vanilla CSS animations

---

## Task 1: PWA Setup

**Files:**
- Create: `public/manifest.json`
- Modify: `index.html`
- Shell: copy `src/assets/ascend-icon.png` → `public/ascend-icon.png`

**Step 1: Create the public directory and copy the icon**

```bash
mkdir -p public
cp src/assets/ascend-icon.png public/ascend-icon.png
```

**Step 2: Create `public/manifest.json`**

```json
{
  "name": "Ascend",
  "short_name": "Ascend",
  "description": "Your Strategic Operating System",
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#0A0E1A",
  "theme_color": "#0A0E1A",
  "icons": [
    {
      "src": "/ascend-icon.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/ascend-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Step 3: Update `index.html`**

Replace the existing `<meta name="viewport">` line and add manifest + Apple meta tags. The full `<head>` should be:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#0A0E1A" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Ascend" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/ascend-icon.png" />
  <title>Ascend — Your Strategic Operating System</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  />
</head>
```

**Step 4: Verify in browser**

Run `npm run dev`. Open DevTools → Application → Manifest. Confirm name "Ascend", icons load, display "standalone".

---

## Task 2: Intro Polishes

**Files:**
- Modify: `src/screens/Intro.jsx`
- Modify: `src/styles/globals.css`

**Step 1: Update logo size in `Intro.jsx`**

Find the `ascendLogoImg` `<img>` tag (currently `width: '280px', height: '280px'`). Replace with:

```jsx
<img
  src={ascendLogoImg}
  alt="Ascend"
  draggable={false}
  style={{
    width: 'clamp(300px, 72vw, 860px)',
    height: 'auto',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
    animation: 'fade-in 600ms ease-out forwards',
  }}
/>
```

**Step 2: Add `mixBlendMode: 'multiply'` to the ascend icon reveal (Beat 3)**

Find the `ascendIconRef` `<img>` tag. Add `mixBlendMode: 'multiply'` to its style:

```jsx
<img src={ascendIconImg} alt="" draggable={false}
  style={{
    width: '100%', height: '100%',
    objectFit: 'cover', display: 'block',
    mixBlendMode: 'multiply',
  }}
/>
```

**Step 3: Update the don't-press button in `globals.css`**

Replace the existing `.dont-press-btn` block with the oversized version:

```css
/* ===========================
   'DON'T PRESS' BUTTON
   Comically oversized.
   =========================== */

.dont-press-btn {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #e53e3e;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

/* Expanding pulse ring */
.dont-press-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: #e53e3e;
  animation: dont-press-ring 1.8s ease-out infinite;
}

@keyframes dont-press-ring {
  0%   { transform: scale(1);   opacity: 0.55; }
  100% { transform: scale(3.2); opacity: 0;    }
}
```

**Step 4: Update the "don't press" label in `Intro.jsx`**

Find the `<span>` with `don't press` text and scale it up:

```jsx
<span style={{
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: '0.95rem',
  color: '#1B3A6B',
  letterSpacing: '0.06em',
  userSelect: 'none',
}}>
  don't press
</span>
```

Also increase the gap between button and label from `gap: '5px'` to `gap: '10px'`.

**Step 5: Verify in browser**

Run `npm run dev`. Watch intro sequence. Confirm:
- Wordmark fills ~72% of screen width
- No white box halo around either logo on white background (multiply blending)
- Don't press button is visibly large and slightly absurd

---

## Task 3: Data Layer

**Files:**
- Create: `src/data/archetypes.js`
- Create: `src/data/quizData.js`

**Step 1: Create `src/data/archetypes.js`**

```js
export const ARCHETYPES = {
  eagle: {
    id: 'eagle',
    name: 'The Strategist',
    animal: 'Eagle',
    emoji: '🦅',
    color: '#4F8EF7',
    zodiac: `Like the eagle that circles high before it strikes, you see the full landscape before you move. You don't act without knowing where you'll land. The eagle doesn't chase — it positions, it waits, and when the moment is right, it moves with total precision. That is you: strategic, sharp, unhurried by noise.`,
    petMessage: `Your target list is locked. Stay sharp — the window opens Tuesday.`,
    streakQuip: `The eagle doesn't miss twice.`,
  },
  fox: {
    id: 'fox',
    name: 'The Explorer',
    animal: 'Fox',
    emoji: '🦊',
    color: '#F5C842',
    zodiac: `Like the fox that knows a hundred paths through the forest, you are never cornered and never bored. You find angles others miss, adapt when plans shift, and discover as you go. The fox doesn't have one den — it builds options. That is you: curious, agile, most dangerous when given room to roam.`,
    petMessage: `Three new angles this week. Keep exploring — the right path reveals itself to the curious.`,
    streakQuip: `Every path teaches the fox.`,
  },
  bear: {
    id: 'bear',
    name: 'The Operator',
    animal: 'Bear',
    emoji: '🐻',
    color: '#34D399',
    zodiac: `Like the bear that returns to the same river every season, you are steady and unshakeable. You don't rush. You build through repetition, through presence, through showing up when others don't. The river always yields to the patient bear — and the opportunities always yield to you.`,
    petMessage: `Day 12. Same river, same discipline. The streak holds.`,
    streakQuip: `The bear always comes back.`,
  },
}

/**
 * Score an array of answers and return the archetype id.
 * Alumni mode: each answer is 'eagle' | 'fox' | 'bear'
 * Student mode: each answer is 'a' | 'b' | 'c' | 'd' — mapped to archetype by question
 */
export function scoreAlumni(answers) {
  const counts = { eagle: 0, fox: 0, bear: 0 }
  answers.forEach(a => { if (counts[a] !== undefined) counts[a]++ })
  // Tiebreak: last answer wins
  const max = Math.max(...Object.values(counts))
  const tied = Object.keys(counts).filter(k => counts[k] === max)
  if (tied.length === 1) return tied[0]
  // Find last answer among tied archetypes (iterate answers in reverse)
  for (let i = answers.length - 1; i >= 0; i--) {
    if (tied.includes(answers[i])) return answers[i]
  }
  return 'eagle'
}

export function scoreStudent(answers) {
  // answers[i] is index 0-3 (a/b/c/d) for each question
  // Eagle signals: Q0=a(0), Q1=a(0), Q4=a(0), Q5=a(0)
  // Fox signals:   Q0=b(1), Q1=b(1), Q4=b(1), Q5=b(1)
  // Bear signals:  Q1=c(2), Q3=b(1), Q4=d(3), Q5=c(2)
  const STUDENT_MAP = [
    ['eagle','fox','bear','eagle'],  // Q1: exploration=fox, applying=bear/eagle, interviews=eagle, offer=eagle
    ['eagle','fox','bear','bear'],   // Q2: structured=eagle, calendar=fox, email=bear, nothing=bear
    ['eagle','fox','bear','bear'],   // Q3: multiple=eagle, weekly=fox, urgent=bear, rarely=bear
    ['fox','bear','fox','eagle'],    // Q4: focus=fox, know-dont=bear, connections=fox, overwhelmed=eagle
    ['eagle','bear','fox','bear'],   // Q5: accomplished=eagle, frustrated=bear, mixed=fox, fine=bear
    ['eagle','fox','bear','fox'],    // Q6: specific=eagle, discover=fox, system=bear, options=fox
  ]
  const counts = { eagle: 0, fox: 0, bear: 0 }
  answers.forEach((answerIdx, qIdx) => {
    const archetype = STUDENT_MAP[qIdx]?.[answerIdx]
    if (archetype) counts[archetype]++
  })
  const max = Math.max(...Object.values(counts))
  const tied = Object.keys(counts).filter(k => counts[k] === max)
  if (tied.length === 1) return tied[0]
  for (let i = answers.length - 1; i >= 0; i--) {
    const archetype = STUDENT_MAP[i]?.[answers[i]]
    if (archetype && tied.includes(archetype)) return archetype
  }
  return 'eagle'
}
```

**Step 2: Create `src/data/quizData.js`**

```js
export const ALUMNI_QUESTIONS = [
  {
    id: 'q1',
    text: 'Right now, recruiting feels like…',
    options: [
      { label: 'I have a plan and I\'m executing it',          value: 'eagle' },
      { label: 'I\'m still mapping the landscape',              value: 'fox'   },
      { label: 'I know what to do — I just don\'t always do it', value: 'bear' },
    ],
  },
  {
    id: 'q2',
    text: 'You have a coffee chat in 3 days. First move?',
    options: [
      { label: 'Research them + draft talking points tonight',  value: 'eagle' },
      { label: 'Block time in my calendar to prep tomorrow',    value: 'fox'   },
      { label: 'I\'ll figure it out the morning of',           value: 'bear'  },
    ],
  },
  {
    id: 'q3',
    text: 'How do you track your recruiting pipeline?',
    options: [
      { label: 'Spreadsheet or tracker — I know every status', value: 'eagle' },
      { label: 'I have a rough mental list',                   value: 'fox'   },
      { label: 'What pipeline? It\'s all in my inbox',         value: 'bear'  },
    ],
  },
  {
    id: 'q4',
    text: 'At the end of a busy week, you usually feel…',
    options: [
      { label: 'I moved the right things forward',             value: 'eagle' },
      { label: 'I learned a lot but didn\'t close much',       value: 'fox'   },
      { label: 'I was busy but I\'m not sure what I actually did', value: 'bear' },
    ],
  },
  {
    id: 'q5',
    text: 'What does "winning" in recruiting look like for you?',
    options: [
      { label: 'Landing the specific role I\'ve already identified', value: 'eagle' },
      { label: 'Finding the right fit — wherever that leads',        value: 'fox'   },
      { label: 'Building the habits so I\'m consistently ready',     value: 'bear'  },
    ],
  },
]

export const STUDENT_QUESTIONS = [
  {
    id: 'sq1',
    text: 'Where are you in the recruiting process?',
    options: [
      { label: 'Early exploration — figuring out what I want' },
      { label: 'Actively applying — sending applications out' },
      { label: 'Deep in interviews or super days' },
      { label: 'Offer evaluation — deciding between options' },
    ],
  },
  {
    id: 'sq2',
    text: 'How do you manage your recruiting tasks?',
    options: [
      { label: 'Structured system — Notion, Sheets, or a tracker' },
      { label: 'Calendar + memory — I know what\'s coming' },
      { label: 'Email triage — if it\'s in my inbox, I handle it' },
      { label: 'Nothing consistent — it varies week to week' },
    ],
  },
  {
    id: 'sq3',
    text: 'How often do you reach out to new contacts or alumni?',
    options: [
      { label: 'Multiple times a week — it\'s a habit' },
      { label: 'About once a week' },
      { label: 'When it feels urgent or I remember to' },
      { label: 'Rarely — I\'m not sure how to start' },
    ],
  },
  {
    id: 'sq4',
    text: 'What\'s your biggest blocker right now?',
    options: [
      { label: 'I don\'t know where to focus' },
      { label: 'I know what to do — I just don\'t do it consistently' },
      { label: 'I need more connections or information' },
      { label: 'I\'m overwhelmed by the volume of things to do' },
    ],
  },
  {
    id: 'sq5',
    text: 'How do you feel at the end of a typical recruiting week?',
    options: [
      { label: 'Accomplished — I moved things forward' },
      { label: 'Frustrated — I meant to do more' },
      { label: 'Mixed — some wins, some slippage' },
      { label: 'Fine — I\'m making steady progress' },
    ],
  },
  {
    id: 'sq6',
    text: 'What would "winning" look like for you?',
    options: [
      { label: 'Landing the specific role I\'ve already identified' },
      { label: 'Discovering the right path and having options' },
      { label: 'Having a consistent system that keeps me moving' },
      { label: 'Multiple offers — I want to be choosing' },
    ],
  },
]
```

---

## Task 4: App.jsx State Machine

**Files:**
- Modify: `src/App.jsx`

**Step 1: Rewrite `App.jsx` with full state machine**

```jsx
import React, { useState, useCallback } from 'react'
import Intro     from './screens/Intro.jsx'
import Quiz      from './screens/Quiz.jsx'
import Reveal    from './screens/Reveal.jsx'
import Dashboard from './screens/Dashboard.jsx'

export default function App() {
  const [screen,    setScreen]    = useState('intro')
  const [quizMode,  setQuizMode]  = useState('alumni')   // 'alumni' | 'student'
  const [archetype, setArchetype] = useState(null)        // 'eagle' | 'fox' | 'bear'

  const handleIntroComplete = useCallback(() => {
    setScreen('quiz')
  }, [])

  const handleQuizComplete = useCallback((result, mode) => {
    setQuizMode(mode)
    setArchetype(result)
    setScreen('reveal')
  }, [])

  const handleRevealComplete = useCallback(() => {
    setScreen('dashboard')
  }, [])

  const handleRestart = useCallback(() => {
    setScreen('intro')
    setQuizMode('alumni')
    setArchetype(null)
  }, [])

  return (
    <div className="w-full h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {screen === 'intro' && (
        <Intro onComplete={handleIntroComplete} />
      )}
      {screen === 'quiz' && (
        <Quiz
          initialMode={quizMode}
          onComplete={handleQuizComplete}
          onBack={() => setScreen('intro')}
        />
      )}
      {screen === 'reveal' && (
        <Reveal
          archetypeId={archetype}
          onComplete={handleRevealComplete}
        />
      )}
      {screen === 'dashboard' && (
        <Dashboard
          archetypeId={archetype}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
```

---

## Task 5: Quiz Screen

**Files:**
- Create: `src/screens/Quiz.jsx`

**Step 1: Create `src/screens/Quiz.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'
import { ALUMNI_QUESTIONS, STUDENT_QUESTIONS } from '../data/quizData.js'
import { scoreAlumni, scoreStudent } from '../data/archetypes.js'

const TOGGLE_TAPS_REQUIRED = 1

export default function Quiz({ initialMode, onComplete, onBack }) {
  const [mode,       setMode]       = useState(initialMode)
  const [qIndex,     setQIndex]     = useState(0)
  const [answers,    setAnswers]    = useState([])
  const [selecting,  setSelecting]  = useState(null)   // index of option being selected (for flash)
  const [modeFlash,  setModeFlash]  = useState(null)   // 'Alumni' | 'Student' — shown briefly on toggle

  const questions = mode === 'alumni' ? ALUMNI_QUESTIONS : STUDENT_QUESTIONS

  // Reset question index when mode switches
  useEffect(() => {
    setQIndex(0)
    setAnswers([])
  }, [mode])

  function handleToggleMode() {
    const next = mode === 'alumni' ? 'student' : 'alumni'
    setMode(next)
    setModeFlash(next === 'alumni' ? 'Alumni Mode' : 'Student Mode')
    setTimeout(() => setModeFlash(null), 1000)
  }

  function handleAnswer(optionIndex) {
    if (selecting !== null) return  // debounce
    setSelecting(optionIndex)

    setTimeout(() => {
      const newAnswers = [...answers, mode === 'alumni'
        ? questions[qIndex].options[optionIndex].value
        : optionIndex
      ]
      setAnswers(newAnswers)
      setSelecting(null)

      if (qIndex < questions.length - 1) {
        setQIndex(qIndex + 1)
      } else {
        // Score and complete
        const result = mode === 'alumni'
          ? scoreAlumni(newAnswers)
          : scoreStudent(newAnswers)
        onComplete(result, mode)
      }
    }, 200)
  }

  function handleBack() {
    if (qIndex === 0) {
      onBack()
    } else {
      setQIndex(qIndex - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const progress = (qIndex / questions.length) * 100

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--accent-blue)',
          transition: 'width 300ms ease-out',
        }} />
      </div>

      {/* Hidden mode toggle — top-right, barely visible */}
      <button
        onClick={handleToggleMode}
        aria-label="Toggle quiz mode"
        style={{
          position: 'absolute', top: '12px', right: '14px',
          width: '20px', height: '20px',
          background: 'none', border: 'none', cursor: 'pointer',
          opacity: 0.15, zIndex: 20,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '3px', padding: '3px',
        }}
      >
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '5px', height: '5px',
            borderRadius: '50%',
            backgroundColor: 'white',
          }} />
        ))}
      </button>

      {/* Mode flash indicator */}
      {modeFlash && (
        <div style={{
          position: 'absolute', top: '36px', right: '10px',
          fontSize: '0.65rem',
          fontFamily: 'DM Sans, sans-serif',
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          animation: 'fade-in 200ms ease-out forwards',
          zIndex: 20,
          userSelect: 'none',
        }}>
          {modeFlash}
        </div>
      )}

      {/* Main question area — centered */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 80px)',
      }}>

        {/* Question counter */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          {qIndex + 1} / {questions.length}
        </p>

        {/* Question text */}
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 600,
          fontSize: 'clamp(1.3rem, 3vw, 2rem)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          maxWidth: '640px',
          lineHeight: 1.35,
          marginBottom: 'clamp(2rem, 4vh, 3.5rem)',
        }}>
          {questions[qIndex].text}
        </h2>

        {/* Answer options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 1.5vh, 16px)',
          width: '100%',
          maxWidth: '520px',
        }}>
          {questions[qIndex].options.map((opt, i) => {
            const isSelecting = selecting === i
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                style={{
                  padding: 'clamp(14px, 2vh, 20px) clamp(18px, 3vw, 28px)',
                  backgroundColor: isSelecting
                    ? 'rgba(79, 142, 247, 0.18)'
                    : 'var(--bg-elevated)',
                  border: `1px solid ${isSelecting
                    ? 'rgba(79, 142, 247, 0.5)'
                    : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  color: isSelecting ? 'var(--accent-blue)' : 'var(--text-primary)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
                  fontWeight: 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => {
                  if (selecting === null) {
                    e.currentTarget.style.backgroundColor = 'rgba(79, 142, 247, 0.10)'
                    e.currentTarget.style.borderColor = 'rgba(79, 142, 247, 0.3)'
                  }
                }}
                onMouseLeave={e => {
                  if (selecting !== i) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                  }
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Back button — bottom left */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute', bottom: 'clamp(16px, 3vh, 28px)', left: 'clamp(16px, 3vw, 28px)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          padding: '8px',
          opacity: 0.7,
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
      >
        ← back
      </button>
    </div>
  )
}
```

**Step 2: Verify quiz flow in browser**

- All 5 alumni questions appear one at a time
- Selecting an answer advances to next question
- Progress bar fills incrementally
- Back button on Q1 returns to intro, on Q2+ returns to previous question
- After Q5: `console.log` in App.jsx fires with archetype result
- Tap the 4-dot cluster → "Alumni Mode" / "Student Mode" flash appears top-right
- Student mode shows 6 questions

---

## Task 6: Reveal Screen

**Files:**
- Create: `src/screens/Reveal.jsx`

**Step 1: Create `src/screens/Reveal.jsx`**

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { ARCHETYPES } from '../data/archetypes.js'

const HOLD_DURATION = 1800   // ms to hold for full reveal
const TICK_INTERVAL = 16     // ~60fps

export default function Reveal({ archetypeId, onComplete }) {
  const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.eagle

  const [phase, setPhase] = useState('archetype')  // 'archetype' | 'hold' | 'revealed'
  const [holdProgress, setHoldProgress] = useState(0)   // 0 to 1
  const holdStartRef  = useRef(null)
  const holdIntervalRef = useRef(null)
  const timerRef = useRef(null)

  // Phase 1: show archetype, then reveal hold ring after 1200ms
  useEffect(() => {
    timerRef.current = setTimeout(() => setPhase('hold'), 1800)
    return () => clearTimeout(timerRef.current)
  }, [])

  // Auto-advance to dashboard 1800ms after pet is revealed
  useEffect(() => {
    if (phase === 'revealed') {
      timerRef.current = setTimeout(() => onComplete(), 1800)
      return () => clearTimeout(timerRef.current)
    }
  }, [phase, onComplete])

  function startHold() {
    if (phase !== 'hold') return
    holdStartRef.current = Date.now()
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(progress)
      if (progress >= 1) {
        clearInterval(holdIntervalRef.current)
        setPhase('revealed')
      }
    }, TICK_INTERVAL)
  }

  function cancelHold() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setHoldProgress(0)
  }

  // Conic gradient fill for hold ring
  const deg = Math.round(holdProgress * 360)
  const ringGradient = `conic-gradient(${archetype.color} ${deg}deg, rgba(255,255,255,0.12) ${deg}deg)`

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 5vw, 80px)',
      overflow: 'hidden',
    }}>

      {/* Archetype reveal — phase: archetype or later */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(10px, 2vh, 20px)',
        animation: 'fade-in 600ms ease-out forwards',
        textAlign: 'center',
        maxWidth: '540px',
      }}>
        <span style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1 }}>
          {archetype.emoji}
        </span>

        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          color: archetype.color,
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}>
          {archetype.animal}
        </h1>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {archetype.name}
        </p>

        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
          color: 'var(--text-primary)',
          lineHeight: 1.65,
          marginTop: 'clamp(6px, 1vh, 12px)',
          opacity: 0.88,
          animation: 'fade-in 600ms ease-out 400ms both',
        }}>
          {archetype.zodiac}
        </p>
      </div>

      {/* Hold-to-meet ring — phase: hold or revealed */}
      {(phase === 'hold' || phase === 'revealed') && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          marginTop: 'clamp(2rem, 5vh, 3.5rem)',
          animation: 'fade-in 400ms ease-out forwards',
        }}>
          {/* Ring button */}
          <button
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            style={{
              position: 'relative',
              width: '96px', height: '96px',
              borderRadius: '50%',
              background: phase === 'revealed'
                ? `radial-gradient(circle, ${archetype.color}33 0%, transparent 70%)`
                : 'none',
              border: 'none',
              cursor: phase === 'hold' ? 'pointer' : 'default',
              padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: phase === 'revealed' ? 'logo-pop 400ms ease-out forwards' : 'none',
            }}
          >
            {/* Ring track */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: phase === 'revealed'
                ? archetype.color
                : ringGradient,
              mask: 'radial-gradient(transparent 38px, black 39px)',
              WebkitMask: 'radial-gradient(transparent 38px, black 39px)',
              transition: phase === 'revealed' ? 'background 300ms ease' : 'none',
            }} />
            {/* Emoji center */}
            <span style={{
              fontSize: phase === 'revealed' ? '3.5rem' : '2.5rem',
              lineHeight: 1,
              transition: 'font-size 300ms ease',
              zIndex: 1,
              filter: phase === 'revealed'
                ? `drop-shadow(0 0 16px ${archetype.color})`
                : 'none',
            }}>
              {archetype.emoji}
            </span>
          </button>

          {/* Instruction / revealed text */}
          {phase === 'hold' && (
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}>
              hold to meet your partner
            </p>
          )}
          {phase === 'revealed' && (
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 600,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              color: archetype.color,
              animation: 'slide-up-fade 400ms ease-out forwards',
            }}>
              Your {archetype.animal} is ready.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify reveal screen in browser**

- Emoji + archetype name + zodiac text fade in
- After 1.8s, hold ring appears with instruction text
- Hold → ring fills clockwise with archetype color
- Release before complete → ring resets to 0
- Full hold → ring fills, emoji scales up, "Your Eagle is ready." appears
- 1.8s later → transitions to dashboard

---

## Task 7: Dashboard Screen

**Files:**
- Create: `src/screens/Dashboard.jsx`

**Step 1: Create `src/screens/Dashboard.jsx`**

```jsx
import { useState } from 'react'
import { ARCHETYPES } from '../data/archetypes.js'

const STREAK = 12

const TODAY_TASKS = [
  { id: 't1', label: 'Follow up — John Kim, Goldman Sachs', tag: 'Networking',   tagColor: 'var(--accent-blue)' },
  { id: 't2', label: 'Submit Citadel application',           tag: 'Deadline Today', tagColor: 'var(--warning)', urgent: true },
  { id: 't3', label: 'Case study review for tomorrow\'s prep', tag: 'Prep',        tagColor: 'var(--accent-teal)' },
]

const WEEK_EVENTS = [
  { day: 'Mon', label: 'Coffee chat — Sarah Chen, McKinsey' },
  { day: 'Tue', label: 'App deadline — Morgan Stanley' },
  { day: 'Wed', label: 'Case prep session' },
  { day: 'Thu', label: 'Alumni panel (W&L)' },
  { day: 'Fri', label: 'Weekly review + plan' },
]

export default function Dashboard({ archetypeId, onRestart }) {
  const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.eagle
  const [checked, setChecked] = useState({})

  function toggleTask(id) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
      gridTemplateRows: '1fr auto',
      gap: 'clamp(16px, 3vw, 32px)',
      padding: 'clamp(20px, 4vw, 48px)',
      overflowY: 'auto',
      boxSizing: 'border-box',
      animation: 'fade-in 400ms ease-out forwards',
    }}>

      {/* ── TODAY'S PRIORITIES ─────────────────────────────── */}
      <section>
        <h2 style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 600,
          fontSize: 'clamp(0.7rem, 1.3vw, 0.85rem)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 'clamp(12px, 2vh, 20px)',
        }}>
          Today's Priorities
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {TODAY_TASKS.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: 'clamp(12px, 2vh, 16px) clamp(14px, 2vw, 18px)',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '10px',
                border: task.urgent
                  ? '1px solid rgba(251, 191, 36, 0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'opacity 200ms ease',
                opacity: checked[task.id] ? 0.45 : 1,
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: '18px', height: '18px', flexShrink: 0, marginTop: '1px',
                borderRadius: '4px',
                border: `2px solid ${checked[task.id] ? task.tagColor : 'rgba(255,255,255,0.25)'}`,
                backgroundColor: checked[task.id] ? task.tagColor : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
              }}>
                {checked[task.id] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 'clamp(0.88rem, 1.6vw, 1rem)',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.4,
                  textDecoration: checked[task.id] ? 'line-through' : 'none',
                }}>
                  {task.label}
                </p>
                <span style={{
                  fontSize: '0.68rem',
                  color: task.tagColor,
                  fontFamily: 'DM Sans, sans-serif',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                }}>
                  {task.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEK AHEAD ─────────────────────────────────────── */}
      <section>
        <h2 style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 600,
          fontSize: 'clamp(0.7rem, 1.3vw, 0.85rem)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: 'clamp(12px, 2vh, 20px)',
        }}>
          Week Ahead
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {WEEK_EVENTS.map((ev, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: '14px',
              padding: 'clamp(10px, 1.8vh, 14px) clamp(14px, 2vw, 18px)',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.68rem',
                color: 'var(--accent-blue)',
                letterSpacing: '0.06em',
                minWidth: '30px',
                flexShrink: 0,
              }}>
                {ev.day}
              </span>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 'clamp(0.82rem, 1.5vw, 0.95rem)',
                color: 'var(--text-primary)',
                opacity: 0.85,
              }}>
                {ev.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── ACCOUNTABILITY PET WIDGET ───────────────────── */}
        <div style={{
          marginTop: 'clamp(16px, 3vh, 28px)',
          padding: 'clamp(14px, 2.5vh, 22px) clamp(16px, 2.5vw, 22px)',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '12px',
          border: `1px solid ${archetype.color}33`,
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <span style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1 }}>
            {archetype.emoji}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(0.85rem, 1.6vw, 1rem)',
                color: archetype.color,
              }}>
                Your {archetype.animal}
              </span>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
              }}>
                Day {STREAK} 🔥
              </span>
            </div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {archetype.petMessage}
            </p>
          </div>
        </div>
      </section>

      {/* ── RESTART BUTTON (full grid width) ──────────────── */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '4px',
      }}>
        <button
          onClick={onRestart}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            opacity: 0.35,
            letterSpacing: '0.06em',
            padding: '6px 2px',
            transition: 'opacity 200ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
        >
          ↺ Restart Demo
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Verify dashboard in browser**

- Two-column grid on wide screens, single column on narrow
- Tasks toggle checked state on click
- Deadline Today task has amber border
- Accountability pet widget shows correct animal/color/message for each archetype
- "Restart Demo" button is barely visible, brightens on hover, resets to intro on click

---

## Task 8: Final CSS Polish

**Files:**
- Modify: `src/styles/globals.css`

**Step 1: Add hold-ring and reveal animation styles**

Append to `globals.css`:

```css
/* ===========================
   HOLD RING — pointer-events fix
   The ring button needs touch-action none
   to prevent scroll interference on iPad.
   =========================== */

.hold-ring-btn {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
```

Note: The `touch-action: none` needs to be applied inline in Reveal.jsx on the hold button:
```jsx
style={{ ..., touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
```

Add this to the `<button>` in Reveal.jsx's hold ring section.

**Step 2: Smoke test on iPad viewport in DevTools**

Set DevTools to iPad Pro (1024×1366). Confirm:
- Intro: wordmark fills ~72vw, no halo
- Quiz: question text and options scale with `clamp()`
- Reveal: ring is holdable via pointer events
- Dashboard: grid layout works, pet widget aligned

**Step 3: Full run-through**

1. `npm run dev`
2. Watch full intro animation → don't press button (big, red, absurd)
3. Quiz in alumni mode → 5 questions → archetype result
4. Reveal: archetype appears → hold ring fills → pet revealed → auto-advances
5. Dashboard: tasks, week, pet widget, restart
6. Tap 4-dot toggle on Q1 → switch to student mode (6 questions)
7. Click "↺ Restart Demo" → resets to intro

---

## Build Verification

```bash
npm run build
```

Expected: no errors, all assets bundled. Check output mentions `ascend-logo.png`, `ascend-icon.png`, icon PNGs.

```bash
npm run preview
```

Open `http://localhost:4173` and run through full demo once more to confirm production build matches dev.
