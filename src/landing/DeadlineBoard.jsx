import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { deadlineBoardTasks } from './content.js'

const STAGGER_MS = 350

function Check({ done }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="none" stroke={done ? 'var(--lp-gold)' : 'var(--lp-line)'} />
      {done && (
        <motion.path
          d="M4 8.2L7 11L12.2 5"
          fill="none"
          stroke="var(--lp-gold)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}
    </svg>
  )
}

// Scroll-triggered task tick-off. Item 4 flips from a missed flag to a
// rescheduled one, demonstrating the "accountability" behavior in miniature.
export default function DeadlineBoard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduce = useReducedMotion()
  const [rescheduled, setRescheduled] = useState(reduce ? true : false)

  const showDone = reduce || inView

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {deadlineBoardTasks.map((task, i) => {
        const isMissedItem = task.id === 't4'
        const done = showDone && !isMissedItem
        const delay = reduce ? 0 : i * (STAGGER_MS / 1000)
        return (
          <motion.div
            key={task.id}
            initial={reduce ? false : { opacity: 0.5 }}
            animate={showDone ? { opacity: 1 } : {}}
            transition={{ delay, duration: 0.25 }}
            onAnimationComplete={() => {
              if (isMissedItem && showDone && !reduce) {
                setTimeout(() => setRescheduled(true), 500)
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', rowGap: 6,
              padding: '9px 12px', border: '1px solid var(--lp-line)', borderRadius: 6,
              background: 'var(--lp-surface)', minWidth: 0,
            }}
          >
            <Check done={done} />
            <span style={{
              fontSize: 13.5, color: 'var(--lp-ink)',
              textDecoration: done ? 'line-through' : 'none',
              textDecorationColor: 'rgba(237,231,218,0.35)',
              flex: '1 1 120px',
              minWidth: 0,
            }}>
              {task.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--lp-ink-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
              {task.due}
            </span>
            {isMissedItem && showDone && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.04em',
                padding: '3px 8px', borderRadius: 20,
                color: rescheduled ? 'var(--lp-gold)' : 'var(--lp-ember)',
                border: `1px solid ${rescheduled ? 'rgba(201,168,76,0.45)' : 'rgba(180,83,42,0.5)'}`,
                whiteSpace: 'nowrap',
              }}>
                {rescheduled ? 'RESCHEDULED → TUE 9AM' : 'MISSED?'}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
