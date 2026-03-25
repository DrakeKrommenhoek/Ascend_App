import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import canvasIcon    from '../assets/icon-canvas.png'
import gcalIcon      from '../assets/icon-gcal.png'
import gmailIcon     from '../assets/icon-gmail.jpg'
import handshakeIcon from '../assets/icon-handshake.jpg'
import linkedinIcon  from '../assets/icon-linkedin.png'
import ascendLogo    from '../assets/ascend-logo.png'

// 5 integration icons scattered across the screen (offset from center in px)
const ICONS = [
  { id: 'canvas',    src: canvasIcon,    x: -220, y: -140 },
  { id: 'gcal',      src: gcalIcon,      x:  180, y: -170 },
  { id: 'gmail',     src: gmailIcon,     x: -250, y:   80 },
  { id: 'handshake', src: handshakeIcon, x:  210, y:  100 },
  { id: 'linkedin',  src: linkedinIcon,  x:   20, y:  190 },
]

// Circle arrangement — icons evenly spaced on a circle of radius 100px
const CIRCLE_RADIUS = 100
const CIRCLE_POSITIONS = ICONS.map((_, i) => {
  const angle = (i / ICONS.length) * 2 * Math.PI - Math.PI / 2
  return {
    x: Math.cos(angle) * CIRCLE_RADIUS,
    y: Math.sin(angle) * CIRCLE_RADIUS,
  }
})

/**
 * Cinematic intro animation — 4 phases, under 5s total, skip button always visible.
 *
 * Phase 0 → 1 (2s):   Icons appear as glowing stars at scattered positions
 * Phase 1 → 2 (1.5s): Icons converge and arrange into a perfect circle
 * Phase 2 → 3 (1s):   Circle collapses to a point, Ascend logo blooms from it
 * Phase 3 → done (0.5s): Logo holds, fade-to-light, then calls onComplete()
 */
export default function Intro({ onComplete, onSkipToDemo }) {
  const [phase, setPhase] = useState(0)

  // Auto-start: icons appear shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 300)
    return () => clearTimeout(t)
  }, [])

  function handleSkip() {
    if (typeof onSkipToDemo === 'function') {
      onSkipToDemo()
    } else if (typeof onComplete === 'function') {
      onComplete()
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Skip button — always visible from frame 1 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        onClick={handleSkip}
        whileHover={{ opacity: 1 }}
        style={{
          position: 'fixed',
          top: 20,
          right: 24,
          zIndex: 9999,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'rgba(255,255,255,0.7)',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        Skip →
      </motion.button>

      {/* ── Phase 0–1: Scattered icons appear, then converge to circle ── */}
      <AnimatePresence>
        {phase < 2 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {ICONS.map((icon, i) => (
              <motion.div
                key={icon.id}
                initial={{ opacity: 0, scale: 0, x: icon.x, y: icon.y }}
                animate={
                  phase >= 1
                    ? {
                        opacity: 1,
                        scale: 1,
                        x: CIRCLE_POSITIONS[i].x,
                        y: CIRCLE_POSITIONS[i].y,
                      }
                    : { opacity: 1, scale: 1, x: icon.x, y: icon.y }
                }
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                transition={
                  phase === 0
                    ? { duration: 0.7, delay: i * 0.15, ease: 'easeOut' }
                    : { duration: 1.5, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }
                }
                onAnimationComplete={() => {
                  // When the last icon finishes converging, advance to phase 2
                  if (phase === 1 && i === ICONS.length - 1) {
                    setTimeout(() => setPhase(2), 150)
                  }
                }}
                style={{
                  position: 'absolute',
                  width: 44,
                  height: 44,
                  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.45))',
                }}
              >
                <img
                  src={icon.src}
                  alt={icon.id}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '10px',
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Phase 2–3: Bloom collapse → Ascend logo ── */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.div
            key="bloom"
            initial={{ opacity: 0, scale: 0.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => {
              if (phase === 2) {
                // Hold for 500ms then advance to phase 3 (fade-out)
                setTimeout(() => setPhase(3), 500)
              }
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Radial glow bloom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.25] }}
              transition={{ duration: 1.0, times: [0, 0.25, 1] }}
              style={{
                position: 'absolute',
                width: 240,
                height: 240,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(74,127,212,0.6) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />

            {/* Ascend logo */}
            <motion.img
              src={ascendLogo}
              alt="Ascend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                width: 160,
                height: 'auto',
                position: 'relative',
                zIndex: 1,
                filter: 'brightness(1.1)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 3: Fade-to-light overlay → triggers quiz ── */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            key="fade-to-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onAnimationComplete={() => {
              if (typeof onComplete === 'function') onComplete()
            }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'var(--bg-primary)',
              zIndex: 100,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
