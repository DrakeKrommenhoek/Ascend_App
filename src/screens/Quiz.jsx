import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ARCHETYPES = [
  { id: 'eagle',  emoji: '🦅', name: 'Eagle',  oneLiner: 'The Strategist. Always three moves ahead.' },
  { id: 'fox',    emoji: '🦊', name: 'Fox',    oneLiner: 'The Operator. Finds angles others miss.' },
  { id: 'bear',   emoji: '🐻', name: 'Bear',   oneLiner: 'The Grinder. Shows up every single day.' },
  { id: 'wolf',   emoji: '🐺', name: 'Wolf',   oneLiner: 'The Pack Leader. Wins and brings others with them.' },
  { id: 'owl',    emoji: '🦉', name: 'Owl',    oneLiner: 'The Analyst. Knows everything before deciding anything.' },
  { id: 'falcon', emoji: '🦅', name: 'Falcon', oneLiner: 'The Executor. Fastest from idea to done.' },
  { id: 'lion',   emoji: '🦁', name: 'Lion',   oneLiner: 'The Connector. Owns every room they walk into.' },
]

const HUMOR_OPTIONS = [
  { id: 'straight',  label: 'Dry',    desc: 'Keep it cold and clinical' },
  { id: 'hype',      label: 'Hype',   desc: 'I need the energy dialed up' },
  { id: 'zen',       label: 'Calm',   desc: 'Steady pressure, no screaming' },
  { id: 'sarcastic', label: 'Savage', desc: 'Roast me if I fall behind' },
]

const GOAL_OPTIONS = [
  'Land a finance internship',
  'Get into consulting recruiting',
  'Stay on top of classes and life',
  'All of the above, honestly',
]

const WALKTHROUGH_SLIDES = [
  {
    icon: '📅',
    title: 'Your unified command center',
    body: "Google Calendar, Outlook, and Canvas assignments — all in one timeline. Sorted by day. Color-coded by source. No more tab-switching.",
  },
  {
    icon: '🎯',
    title: 'Recruiting CRM built for W&L',
    body: "Track every contact, stage every application, and draft thank-you emails with AI. Your recruiting pipeline in one clean view.",
  },
  {
    icon: '🐾',
    title: 'Your accountability partner',
    body: "Your archetype shapes how your partner communicates. It learns your patterns and calls you out when it matters.",
  },
]

const BUTTON_COPY = ['Let\'s go', 'That\'s me', 'Lock it in', 'I\'m ready', 'Open my dashboard']

// Reusable cloud card wrapper
function CloudCard({ children, key: _key }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 32px rgba(15,26,58,0.08)',
        padding: 'clamp(28px, 5vw, 48px)',
        width: '100%',
        maxWidth: 580,
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Quiz({ name, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({
    goal: null,
    archetype: null,
    humorStyle: null,
    featurePrefs: { recruitingFocus: true, dailyCheckIns: true, weeklyReport: true },
  })
  const [slideIndex, setSlideIndex] = useState(0)

  const canAdvance =
    (step === 0 && answers.goal !== null) ||
    (step === 1 && answers.archetype !== null) ||
    (step === 2 && answers.humorStyle !== null) ||
    step === 3 ||
    step === 4

  function handleNext() {
    if (step === 4) {
      // Quiz complete — pass archetype, humorStyle, and featurePrefs to parent
      if (typeof onComplete === 'function') {
        onComplete({
          archetype: answers.archetype,
          humorStyle: answers.humorStyle,
          featurePrefs: answers.featurePrefs,
        })
      }
    } else if (step === 3 && slideIndex < WALKTHROUGH_SLIDES.length - 1) {
      setSlideIndex((s) => s + 1)
    } else {
      setStep((s) => s + 1)
      setSlideIndex(0)
    }
  }

  const isLastSlide = step === 3 && slideIndex === WALKTHROUGH_SLIDES.length - 1

  const buttonLabel =
    step === 3 && !isLastSlide
      ? 'Next slide'
      : BUTTON_COPY[Math.min(step, BUTTON_COPY.length - 1)]

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: 24,
        overflowY: 'auto',
      }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <CloudCard key="step0">
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 1 of 4
            </p>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, marginBottom: 24, fontFamily: 'Playfair Display, serif' }}>
              What's your main goal this semester?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOAL_OPTIONS.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, goal: i }))}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: `2px solid ${answers.goal === i ? 'var(--accent)' : 'var(--border)'}`,
                    background: answers.goal === i ? `color-mix(in srgb, var(--accent) 8%, transparent)` : 'transparent',
                    color: answers.goal === i ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: answers.goal === i ? 600 : 400,
                    fontSize: 15,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    fontFamily: 'DM Sans, system-ui, sans-serif',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </CloudCard>
        )}

        {step === 1 && (
          <CloudCard key="step1">
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 2 of 4
            </p>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, marginBottom: 8, fontFamily: 'Playfair Display, serif' }}>
              Pick your archetype.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              This shapes how your accountability partner communicates with you.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 10,
              }}
            >
              {ARCHETYPES.map((arch) => {
                const selected = answers.archetype === arch.id
                return (
                  <button
                    key={arch.id}
                    onClick={() => setAnswers((a) => ({ ...a, archetype: arch.id }))}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 14,
                      border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? `color-mix(in srgb, var(--accent) 10%, white)` : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{arch.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: selected ? 'var(--accent)' : 'var(--text-primary)', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {arch.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {arch.oneLiner}
                    </span>
                  </button>
                )
              })}
            </div>
          </CloudCard>
        )}

        {step === 2 && (
          <CloudCard key="step2">
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 3 of 4
            </p>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, marginBottom: 8, fontFamily: 'Playfair Display, serif' }}>
              How should your partner talk to you?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Pick the communication style that actually gets you moving.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {HUMOR_OPTIONS.map((opt) => {
                const selected = answers.humorStyle === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers((a) => ({ ...a, humorStyle: opt.id }))}
                    style={{
                      padding: '18px 14px',
                      borderRadius: 14,
                      border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? `color-mix(in srgb, var(--accent) 10%, white)` : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16, color: selected ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 4, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {opt.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </CloudCard>
        )}

        {step === 3 && (
          <CloudCard key="step3">
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Step 4 of 4
            </p>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, marginBottom: 24, fontFamily: 'Playfair Display, serif' }}>
              Turn on the features that matter.
            </h2>

            {/* Feature toggles */}
            {[
              { key: 'recruitingFocus', label: 'Recruiting focus mode', desc: 'Surfaces recruiting deadlines and contacts daily' },
              { key: 'dailyCheckIns',   label: 'Daily check-ins',       desc: 'Morning nudge from your accountability partner' },
              { key: 'weeklyReport',    label: 'Weekly performance report', desc: 'Sunday summary of your progress and gaps' },
            ].map(({ key, label, desc }) => {
              const on = answers.featurePrefs[key]
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--border)',
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {desc}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setAnswers((a) => ({
                        ...a,
                        featurePrefs: { ...a.featurePrefs, [key]: !on },
                      }))
                    }
                    style={{
                      width: 48,
                      height: 26,
                      borderRadius: 13,
                      border: 'none',
                      background: on ? 'var(--accent)' : 'var(--border)',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: on ? 25 : 3,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                </div>
              )
            })}
          </CloudCard>
        )}

        {step === 4 && (
          <CloudCard key="step4">
            <AnimatePresence mode="wait">
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: 56, marginBottom: 16 }}>
                  {WALKTHROUGH_SLIDES[slideIndex].icon}
                </div>
                <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, marginBottom: 12, fontFamily: 'Playfair Display, serif' }}>
                  {WALKTHROUGH_SLIDES[slideIndex].title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
                  {WALKTHROUGH_SLIDES[slideIndex].body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
              {WALKTHROUGH_SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === slideIndex ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === slideIndex ? 'var(--accent)' : 'var(--border)',
                    transition: 'all 0.25s',
                  }}
                />
              ))}
            </div>
          </CloudCard>
        )}
      </AnimatePresence>

      {/* CTA button */}
      <motion.button
        onClick={handleNext}
        disabled={!canAdvance}
        animate={{ opacity: canAdvance ? 1 : 0.4 }}
        whileHover={canAdvance ? { scale: 1.02 } : {}}
        whileTap={canAdvance ? { scale: 0.98 } : {}}
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-text)',
          border: 'none',
          borderRadius: 14,
          padding: '16px 40px',
          fontSize: 16,
          fontWeight: 700,
          cursor: canAdvance ? 'pointer' : 'not-allowed',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          letterSpacing: '0.01em',
          minWidth: 200,
        }}
      >
        {buttonLabel}
      </motion.button>
    </div>
  )
}
