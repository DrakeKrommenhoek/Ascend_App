import { useEffect, useRef, useState } from 'react'

import gcalImg       from '../assets/icon-gcal.png'
import outlookImg    from '../assets/icon-outlook.png'
import canvasImg     from '../assets/icon-canvas.png'
import linkedinImg   from '../assets/icon-linkedin.png'
import gmailImg      from '../assets/icon-gmail.jpg'
import handshakeImg  from '../assets/icon-handshake.jpg'
import ascendIconImg from '../assets/ascend-icon.png'
import ascendLogoImg from '../assets/ascend-logo.png'

/* ─────────────────────────────────────────────────────────────
   EASING
───────────────────────────────────────────────────────────── */
const easeOut   = t => 1 - (1 - t) * (1 - t)
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2

/* ─────────────────────────────────────────────────────────────
   TIMING
───────────────────────────────────────────────────────────── */
const T_ENTER    =  900
const T_CHAOS    = 3800
const T_CONVERGE = 2400
const T_BEAT3    = T_CHAOS + T_CONVERGE   // 6 200 ms

const ICON_SIZE = 64
const ICON_HALF = 32

/* ─────────────────────────────────────────────────────────────
   ICON PARAMS
   6 chaos icons — no Ascend in the chaos.
   off_edge  — which screen edge the icon enters from
   ccx, ccy  — chaos center (fraction of container)
   ax/ay     — drift amplitude (px)
   fx/fy     — drift frequency (Hz)
   px/py     — phase offset (rad) — starts each icon mid-drift
   ra/rf/rp  — rotation: amplitude (deg), freq (Hz), phase (rad)
───────────────────────────────────────────────────────────── */
const ICON_PARAMS = [
  { id: 'gcal',      src: gcalImg,      off_edge: 'left',
    ccx: 0.12, ccy: 0.18, ax: 44, ay: 32, fx: 0.70, fy: 0.55, px: 0.0, py: 1.0, ra: 13, rf: 0.58, rp: 0.0 },
  { id: 'outlook',   src: outlookImg,   off_edge: 'top',
    ccx: 0.80, ccy: 0.17, ax: 38, ay: 46, fx: 1.02, fy: 0.78, px: 2.1, py: 0.5, ra: 17, rf: 0.82, rp: 1.5 },
  { id: 'canvas',    src: canvasImg,    off_edge: 'left',
    ccx: 0.14, ccy: 0.56, ax: 40, ay: 42, fx: 0.80, fy: 0.65, px: 1.8, py: 0.8, ra: 14, rf: 0.65, rp: 0.8 },
  { id: 'linkedin',  src: linkedinImg,  off_edge: 'right',
    ccx: 0.86, ccy: 0.54, ax: 34, ay: 44, fx: 0.88, fy: 0.66, px: 0.8, py: 1.7, ra: 15, rf: 0.54, rp: 2.2 },
  { id: 'gmail',     src: gmailImg,     off_edge: 'bottom',
    ccx: 0.18, ccy: 0.78, ax: 48, ay: 30, fx: 0.62, fy: 0.88, px: 1.2, py: 2.8, ra: 11, rf: 0.70, rp: 1.4 },
  { id: 'handshake', src: handshakeImg, off_edge: 'right',
    ccx: 0.80, ccy: 0.78, ax: 36, ay: 42, fx: 0.95, fy: 0.60, px: 3.1, py: 1.1, ra: 16, rf: 0.75, rp: 2.8 },
]

/* ─────────────────────────────────────────────────────────────
   LABEL PARAMS
   5 text pill badges scattered in the gaps between icons.
   Positioned by CENTER point (CSS translate handles centering).
───────────────────────────────────────────────────────────── */
const LABEL_PARAMS = [
  { id: 'l-interview',  text: 'Interview Prep',
    off_edge: 'top',    ccx: 0.45, ccy: 0.09,
    ax: 42, ay: 20, fx: 0.78, fy: 0.60, px: 0.5, py: 1.2, ra: 8,  rf: 0.65, rp: 0.3 },
  { id: 'l-econ',       text: 'Econ Exam',
    off_edge: 'left',   ccx: 0.06, ccy: 0.44,
    ax: 25, ay: 38, fx: 0.92, fy: 0.72, px: 2.0, py: 0.6, ra: 10, rf: 0.55, rp: 1.8 },
  { id: 'l-networking', text: 'Networking Call',
    off_edge: 'right',  ccx: 0.88, ccy: 0.36,
    ax: 28, ay: 40, fx: 0.68, fy: 0.85, px: 1.2, py: 2.0, ra: 7,  rf: 0.78, rp: 2.4 },
  { id: 'l-resume',     text: 'Resume Draft',
    off_edge: 'bottom', ccx: 0.30, ccy: 0.65,
    ax: 38, ay: 28, fx: 1.05, fy: 0.62, px: 0.8, py: 1.8, ra: 9,  rf: 0.60, rp: 0.9 },
  { id: 'l-deadline',   text: 'Deadline Tomorrow',
    off_edge: 'bottom', ccx: 0.55, ccy: 0.88,
    ax: 35, ay: 22, fx: 0.82, fy: 0.90, px: 1.6, py: 0.4, ra: 11, rf: 0.70, rp: 2.0 },
]

/* ─────────────────────────────────────────────────────────────
   INTRO SCREEN
───────────────────────────────────────────────────────────── */
export default function Intro({ onComplete, onSkipToDemo }) {
  const containerRef    = useRef(null)
  const iconRefs        = useRef({})
  const labelRefs       = useRef({})
  const ascendIconRef   = useRef(null)
  const whiteOverlayRef = useRef(null)
  const rafRef          = useRef(null)
  const startTimeRef    = useRef(null)

  const [dim, setDim] = useState({ w: 0, h: 0 })

  // Phase 3 states — controls post-convergence DOM
  const [showWordmark,    setShowWordmark]    = useState(false)
  const [showTagline,     setShowTagline]     = useState(false)
  const [showDontPress,   setShowDontPress]   = useState(false)
  const [showEagleOverlay, setShowEagleOverlay] = useState(false)

  // Auto-advance to dashboard after Eagle overlay shows
  useEffect(() => {
    if (!showEagleOverlay || !onSkipToDemo) return
    const t = setTimeout(onSkipToDemo, 2500)
    return () => clearTimeout(t)
  }, [showEagleOverlay, onSkipToDemo])

  /* Measure container */
  useEffect(() => {
    if (!containerRef.current) return
    const measure = () => setDim({
      w: containerRef.current.offsetWidth,
      h: containerRef.current.offsetHeight,
    })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  /* Main animation */
  useEffect(() => {
    if (dim.w === 0) return

    const { w, h } = dim
    const iconCX = w / 2 - ICON_HALF   // icon top-left at center
    const iconCY = h / 2 - ICON_HALF
    const lblCX  = w / 2               // label center at center
    const lblCY  = h / 2

    /* Off-screen start for icons (positioned by top-left) */
    function iconOff(p) {
      const dx = p.ccx * w - ICON_HALF
      const dy = p.ccy * h - ICON_HALF
      switch (p.off_edge) {
        case 'left':   return { ox: -ICON_SIZE - 20, oy: dy }
        case 'right':  return { ox: w + 20,           oy: dy }
        case 'top':    return { ox: dx,               oy: -ICON_SIZE - 20 }
        case 'bottom': return { ox: dx,               oy: h + 20 }
        default:       return { ox: dx,               oy: dy }
      }
    }

    /* Off-screen start for labels (positioned by center) */
    function lblOff(p) {
      const dx = p.ccx * w
      const dy = p.ccy * h
      switch (p.off_edge) {
        case 'left':   return { ox: -130, oy: dy }
        case 'right':  return { ox: w + 130, oy: dy }
        case 'top':    return { ox: dx, oy: -30 }
        case 'bottom': return { ox: dx, oy: h + 30 }
        default:       return { ox: dx, oy: dy }
      }
    }

    const delay = setTimeout(() => {
      function animate(ts) {
        if (!startTimeRef.current) startTimeRef.current = ts
        const elapsed = ts - startTimeRef.current
        const t_sec   = elapsed / 1000

        /* ── Icons ─────────────────────────────────────────── */
        ICON_PARAMS.forEach(p => {
          const el = iconRefs.current[p.id]
          if (!el) return

          const ccx = p.ccx * w - ICON_HALF
          const ccy = p.ccy * h - ICON_HALF
          const dx  = p.ax * Math.sin(p.fx * 2 * Math.PI * t_sec + p.px)
          const dy  = p.ay * Math.sin(p.fy * 2 * Math.PI * t_sec + p.py)
          const dr  = p.ra * Math.sin(p.rf * 2 * Math.PI * t_sec + p.rp)

          let x, y, rot, opacity

          if (elapsed <= T_ENTER) {
            const { ox, oy } = iconOff(p)
            const b = easeOut(elapsed / T_ENTER)
            x = ox + (ccx + dx - ox) * b; y = oy + (ccy + dy - oy) * b
            rot = dr * (elapsed / T_ENTER); opacity = b
          } else if (elapsed <= T_CHAOS) {
            x = ccx + dx; y = ccy + dy; rot = dr; opacity = 1
          } else if (elapsed <= T_BEAT3) {
            const b = easeInOut((elapsed - T_CHAOS) / T_CONVERGE)
            x = ccx + dx * (1 - b) + (iconCX - ccx) * b
            y = ccy + dy * (1 - b) + (iconCY - ccy) * b
            rot = dr * (1 - b); opacity = 1
          } else {
            x = iconCX; y = iconCY; rot = 0; opacity = 1
          }

          el.style.left      = `${x}px`
          el.style.top       = `${y}px`
          el.style.transform = `rotate(${rot}deg)`
          el.style.opacity   = opacity
        })

        /* ── Labels ────────────────────────────────────────── */
        LABEL_PARAMS.forEach(p => {
          const el = labelRefs.current[p.id]
          if (!el) return

          const ccx = p.ccx * w
          const ccy = p.ccy * h
          const dx  = p.ax * Math.sin(p.fx * 2 * Math.PI * t_sec + p.px)
          const dy  = p.ay * Math.sin(p.fy * 2 * Math.PI * t_sec + p.py)
          const dr  = p.ra * Math.sin(p.rf * 2 * Math.PI * t_sec + p.rp)

          let x, y, rot, opacity

          if (elapsed <= T_ENTER) {
            const { ox, oy } = lblOff(p)
            const b = easeOut(elapsed / T_ENTER)
            x = ox + (ccx + dx - ox) * b; y = oy + (ccy + dy - oy) * b
            rot = dr * (elapsed / T_ENTER); opacity = b
          } else if (elapsed <= T_CHAOS) {
            x = ccx + dx; y = ccy + dy; rot = dr; opacity = 1
          } else if (elapsed <= T_BEAT3) {
            const b = easeInOut((elapsed - T_CHAOS) / T_CONVERGE)
            x = (ccx + dx) * (1 - b) + lblCX * b
            y = (ccy + dy) * (1 - b) + lblCY * b
            rot = dr * (1 - b); opacity = 1
          } else {
            x = lblCX; y = lblCY; rot = 0; opacity = 1
          }

          el.style.left      = `${x}px`
          el.style.top       = `${y}px`
          el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`
          el.style.opacity   = opacity
        })

        if (elapsed < T_BEAT3) {
          rafRef.current = requestAnimationFrame(animate)
          return
        }

        /* ── Beat 3: REVEAL SEQUENCE ────────────────────────── */

        // Dissolve all icons + labels
        ;[...Object.values(iconRefs.current), ...Object.values(labelRefs.current)].forEach(el => {
          if (el) { el.style.transition = 'opacity 600ms ease-out'; el.style.opacity = '0' }
        })

        // 1. Ascend icon fades in — clean and still
        setTimeout(() => {
          const el = ascendIconRef.current
          if (el) { el.style.transition = 'opacity 800ms ease-in-out'; el.style.opacity = '1' }
        }, 300)

        // 2. White overlay appears instantly at icon size, just beneath the icon
        setTimeout(() => {
          const el = whiteOverlayRef.current
          if (el) { el.style.display = 'block'; el.style.clipPath = 'circle(72px at 50% 50%)' }
        }, 400)

        // 3. White expands outward to fill the screen
        setTimeout(() => {
          const el = whiteOverlayRef.current
          if (el) {
            el.style.transition = 'clip-path 1000ms cubic-bezier(0.4, 0, 0.8, 1)'
            el.style.clipPath   = 'circle(160% at 50% 50%)'
          }
        }, 1600)

        // 4. Show Ascend_Logo_1.png on white screen
        setTimeout(() => setShowWordmark(true), 2700)

        // 5. Tagline — 500ms after wordmark
        setTimeout(() => setShowTagline(true), 3200)

        // 6. Don't press button
        setTimeout(() => setShowDontPress(true), 3700)
      }

      rafRef.current = requestAnimationFrame(animate)
    }, 100)

    return () => {
      clearTimeout(delay)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
    }
  }, [dim, onComplete])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* ── Skip to demo button ─────────────────────────────── */}
      {!showEagleOverlay && (
        <button
          onClick={() => setShowEagleOverlay(true)}
          style={{
            position: 'fixed', top: 20, right: 24, zIndex: 9999,
            background: 'none',
            border: showWordmark
              ? '1px solid rgba(27,58,107,0.35)'
              : '1px solid rgba(255,255,255,0.35)',
            borderRadius: '6px',
            color: showWordmark
              ? 'rgba(27,58,107,0.6)'
              : 'rgba(255,255,255,0.7)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            padding: '6px 14px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Skip to demo →
        </button>
      )}

      {/* ── Eagle overlay — shown when skip is clicked ──────── */}
      {showEagleOverlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          backgroundColor: '#0D1B2A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ fontSize: '2.8rem' }}>🦅</div>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.5rem',
            color: '#fff',
            margin: 0,
          }}>
            Skipping the intro?
          </p>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 360,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.7,
          }}>
            Noted. Protecting your time is the Eagle's highest discipline.<br />
            You're already thinking like one.
          </p>
        </div>
      )}

      {/* Subtle depth vignette on dark phase */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)',
      }} />

      {/* ── App icons (6) ──────────────────────────────────── */}
      {ICON_PARAMS.map(({ id, src }) => (
        <div
          key={id}
          ref={el => { iconRefs.current[id] = el }}
          aria-hidden="true"
          style={{
            position: 'absolute', width: `${ICON_SIZE}px`, height: `${ICON_SIZE}px`,
            borderRadius: '14px', overflow: 'hidden', opacity: 0,
            willChange: 'transform, left, top, opacity',
            pointerEvents: 'none', userSelect: 'none', zIndex: 5,
          }}
        >
          <img src={src} alt="" draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      ))}

      {/* ── Text pill labels (5) ──────────────────────────── */}
      {LABEL_PARAMS.map(({ id, text }) => (
        <div
          key={id}
          ref={el => { labelRefs.current[id] = el }}
          aria-hidden="true"
          style={{
            position: 'absolute', opacity: 0,
            willChange: 'transform, left, top, opacity',
            pointerEvents: 'none', userSelect: 'none', zIndex: 5,
            whiteSpace: 'nowrap',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '20px',
            padding: '5px 13px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.80)',
            letterSpacing: '0.02em',
          }}
        >
          {text}
        </div>
      ))}

      {/* ── Ascend icon — Beat 3 reveal (z above white overlay) */}
      <div
        ref={ascendIconRef}
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140px', height: '140px',
          borderRadius: '28px', overflow: 'hidden',
          opacity: 0,
          zIndex: 13,
          pointerEvents: 'none',
        }}
      >
        <img src={ascendIconImg} alt="" draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* ── White expansion overlay ──────────────────────────
          Starts at icon size, expands to fill screen.
          z:10 — beneath Ascend icon (z:13), above chaos (z:5).  */}
      <div
        ref={whiteOverlayRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'white',
          display: 'none',
          clipPath: 'circle(0px at 50% 50%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* ── WORDMARK PHASE: white screen, logo, tagline, button */}
      {showWordmark && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'white',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 20,
        }}>
          {/* Ascend_Logo_1.png — centered on white */}
          <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
            <img
              src={ascendLogoImg}
              alt="Ascend"
              draggable={false}
              style={{
                width: 'clamp(300px, 72vw, 860px)',
                height: 'auto',
                display: 'block',
                filter: 'brightness(1.15) contrast(1.2)',
                animation: 'fade-in 600ms ease-out forwards',
              }}
            />

            {/* 'Don't Press' button — at the tip of the A's arrow */}
            {showDontPress && (
              <div style={{
                position: 'absolute',
                left: '33%', top: '10%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '10px',
                animation: 'fade-in 400ms ease-out forwards',
              }}>
                <button
                  className="dont-press-btn"
                  onClick={onComplete}
                  aria-label="Continue to quiz"
                />
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
              </div>
            )}
          </div>

          {/* Tagline */}
          {showTagline && (
            <>
              <p style={{
                marginTop: '18px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem',
                color: '#1B3A6B',
                letterSpacing: '0.02em',
                animation: 'fade-in 400ms ease-out forwards',
                opacity: 0,
                margin: '18px 0 0',
              }}>
                Classes. Recruiting. Life. Finally in one place.
              </p>
              <p style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 400,
                fontSize: '0.75rem',
                color: '#999',
                letterSpacing: '0.03em',
                margin: '16px 0 0',
                animation: 'fade-in 400ms ease-out forwards',
              }}>
                🎓 117 students on early access
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
