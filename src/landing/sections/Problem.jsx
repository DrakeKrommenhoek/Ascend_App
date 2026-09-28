import { motion, useReducedMotion } from 'framer-motion'
import { problem } from '../content.js'

// Deterministic scatter offsets/rotations per icon, so the layout never
// jitters between renders.
const SCATTER = [
  { x: -60, y: -22, rot: -14 },
  { x: 30, y: 18, rot: 10 },
  { x: -20, y: 26, rot: -8 },
  { x: 55, y: -14, rot: 12 },
  { x: 5, y: -30, rot: -5 },
]

export default function Problem() {
  const reduce = useReducedMotion()

  return (
    <section className="lp-shell" style={{ padding: '84px 24px' }}>
      <p className="lp-checkpoint" style={{ marginBottom: 14 }}>{problem.checkpoint}</p>
      <h2 className="lp-h2" style={{ marginBottom: 14 }}>{problem.heading}</h2>
      <p className="lp-body" style={{ marginBottom: 48 }}>{problem.body}</p>

      <motion.div
        className="lp-problem-row"
        initial="scattered"
        whileInView="settled"
        viewport={{ once: true, amount: 0.6 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px 0',
        }}
      >
        {problem.icons.map((icon, i) => (
          <motion.div
            key={icon.id}
            className="lp-problem-icon"
            variants={{
              scattered: reduce ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: 0.55, x: SCATTER[i].x, y: SCATTER[i].y, rotate: SCATTER[i].rot },
              settled: { opacity: 1, x: 0, y: 0, rotate: 0 },
            }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderRadius: 10,
              background: 'var(--lp-surface)', border: '1px solid var(--lp-line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={icon.src} alt={icon.label} className="lp-problem-icon-img" style={{ objectFit: 'contain' }} />
          </motion.div>
        ))}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: reduce ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            height: 1, background: 'var(--lp-gold)', opacity: 0.4,
            transformOrigin: 'center', zIndex: -1,
          }}
        />
      </motion.div>

      <style>{`
        .lp-problem-row { gap: 28px; }
        .lp-problem-icon { width: 52px; height: 52px; }
        .lp-problem-icon-img { width: 28px; height: 28px; }
        @media (max-width: 420px) {
          .lp-problem-row { gap: 12px; }
          .lp-problem-icon { width: 40px; height: 40px; }
          .lp-problem-icon-img { width: 22px; height: 22px; }
        }
      `}</style>
    </section>
  )
}
