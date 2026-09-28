import { motion, useReducedMotion } from 'framer-motion'

// A static, framed HTML/CSS recreation of the dashboard's "This Week" board.
// No image weight, sized by its own content (no aspect-ratio padding that
// would leave the lower half empty), one gentle rise-in on scroll.
const DAYS = [
  {
    label: 'MON',
    tasks: [
      { cat: 'academic', text: 'Econ 210 problem set' },
      { cat: 'recruiting', text: 'Evercore chat: prep 3 Qs' },
    ],
  },
  {
    label: 'TUE',
    tasks: [
      { cat: 'recruiting', text: 'Evercore coffee chat' },
      { cat: 'personal', text: 'Lift, upper body' },
    ],
  },
  {
    label: 'WED',
    tasks: [
      { cat: 'academic', text: 'Canvas: Phil 101 reading' },
      { cat: 'recruiting', text: 'Follow up: JPM info session' },
      { cat: 'personal', text: '30 min run' },
    ],
  },
  {
    label: 'THU',
    tasks: [
      { cat: 'recruiting', text: 'Submit Bain app' },
      { cat: 'academic', text: 'Stats 220 quiz' },
    ],
  },
  {
    label: 'FRI',
    tasks: [
      { cat: 'academic', text: 'Problem set due' },
      { cat: 'personal', text: 'Lift + long run' },
    ],
  },
]

const CAT_COLOR = {
  academic: 'var(--lp-blue)',
  recruiting: 'var(--lp-gold)',
  personal: 'var(--lp-teal)',
}

export default function DashboardMock() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--lp-surface)',
        border: '1px solid var(--lp-line)',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
      }}
    >
      {/* URL bar */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, rowGap: 6,
        padding: '10px 14px', borderBottom: '1px solid var(--lp-line)',
        background: 'var(--lp-surface-2)',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lp-ember)', flexShrink: 0 }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lp-gold)', flexShrink: 0 }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lp-teal)', flexShrink: 0 }} />
        <span style={{
          marginRight: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: 'var(--lp-ink-soft)', letterSpacing: '0.02em', whiteSpace: 'nowrap',
        }}>
          ascend / this-week
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'var(--lp-gold)', border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 20, padding: '2px 9px', whiteSpace: 'nowrap',
        }}>
          3 actions this week
        </span>
      </div>

      {/* Day columns */}
      <div style={{ display: 'flex', minWidth: 0 }}>
        {DAYS.map((day, i) => (
          <div
            key={day.label}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '10px 7px',
              borderRight: i < DAYS.length - 1 ? '1px solid var(--lp-line)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.08em', color: 'var(--lp-ink-soft)',
            }}>
              {day.label}
            </span>
            {day.tasks.map((task, j) => (
              <div
                key={j}
                style={{
                  fontSize: 10.5,
                  lineHeight: 1.3,
                  color: 'var(--lp-ink)',
                  background: 'rgba(255,255,255,0.03)',
                  borderLeft: `2px solid ${CAT_COLOR[task.cat]}`,
                  borderRadius: 3,
                  padding: '5px 6px',
                  overflowWrap: 'break-word',
                }}
              >
                {task.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
