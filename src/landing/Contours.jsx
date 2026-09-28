import { motion } from 'framer-motion'

// Deterministic pseudo-random so hydration and every visit look identical.
function rng(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function ring(cx, cy, r, wobble, rand, points = 72) {
  const phases = [rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2]
  const pts = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const d = r * (1 + wobble * (0.5 * Math.sin(3 * a + phases[0]) + 0.3 * Math.sin(5 * a + phases[1]) + 0.2 * Math.sin(2 * a + phases[2])))
    pts.push([cx + d * Math.cos(a), cy + d * Math.sin(a) * 0.72])
  }
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z'
}

// Procedural topographic contour field — the page's signature visual.
// Renders once per mount; strokes draw in on load, then hold still.
export default function Contours({ seed = 7, rings = 14, cx = 900, cy = 380, className = '' }) {
  const rand = rng(seed)
  const paths = Array.from({ length: rings }, (_, i) => ring(cx, cy, 40 + i * 42, 0.08 + i * 0.006, rand))
  return (
    <svg className={className} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={i % 5 === 0 ? 'rgba(201,168,76,0.28)' : 'var(--lp-line)'}
          strokeWidth={i % 5 === 0 ? 1.25 : 1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </svg>
  )
}
