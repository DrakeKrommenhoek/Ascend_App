import DeadlineBoard from '../DeadlineBoard.jsx'
import { howItWorks } from '../content.js'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-shell" style={{ padding: '84px 24px', borderTop: '1px solid var(--lp-line)' }}>
      <p className="lp-checkpoint" style={{ marginBottom: 14 }}>{howItWorks.checkpoint}</p>
      <h2 className="lp-h2" style={{ marginBottom: 48 }}>{howItWorks.heading}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 48 }} className="lp-hiw-grid">
        <div style={{ position: 'relative', paddingLeft: 30, minWidth: 0 }}>
          <div style={{
            position: 'absolute', left: 5, top: 6, bottom: 6, width: 0,
            borderLeft: '1px dashed var(--lp-line)',
          }} aria-hidden="true" />
          {howItWorks.checkpoints.map((cp, i) => (
            <div key={cp.id} style={{ position: 'relative', marginBottom: i < howItWorks.checkpoints.length - 1 ? 40 : 0 }}>
              <span style={{
                position: 'absolute', left: -30, top: 3,
                width: 11, height: 11, borderRadius: '50%',
                background: 'var(--lp-gold)', border: '2px solid var(--lp-bg)',
              }} aria-hidden="true" />
              <span className="lp-eyebrow" style={{ display: 'block', marginBottom: 6 }}>{cp.index}</span>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: 'var(--lp-ink)', marginBottom: 8 }}>
                {cp.title}
              </h3>
              <p className="lp-body" style={{ maxWidth: '48ch' }}>{cp.body}</p>
            </div>
          ))}
        </div>

        <div style={{ minWidth: 0 }}>
          <DeadlineBoard />
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .lp-hiw-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
        }
      `}</style>
    </section>
  )
}
