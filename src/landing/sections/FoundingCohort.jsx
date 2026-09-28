import Contours from '../Contours.jsx'
import WaitlistForm from '../WaitlistForm.jsx'
import { foundingCohort } from '../content.js'

export default function FoundingCohort() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--lp-line)' }}>
      <Contours
        className="lp-cohort-contours"
        seed={41}
        cx={220}
        cy={520}
        rings={11}
      />
      <div className="lp-shell" style={{ position: 'relative', zIndex: 2, padding: '84px 24px' }}>
        <div style={{
          border: '1px solid rgba(201,168,76,0.5)',
          borderRadius: 12,
          padding: '44px 32px',
          maxWidth: 760,
        }}>
          <p className="lp-checkpoint" style={{ marginBottom: 14 }}>{foundingCohort.checkpoint}</p>
          <h2 className="lp-h2" style={{ marginBottom: 14 }}>{foundingCohort.heading}</h2>
          <p className="lp-body" style={{ marginBottom: 24 }}>{foundingCohort.body}</p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 34 }}>
            {foundingCohort.perks.map((perk) => (
              <li key={perk} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'var(--lp-ink)' }}>
                <span style={{ color: 'var(--lp-gold)' }} aria-hidden="true">—</span>
                {perk}
              </li>
            ))}
          </ul>

          <WaitlistForm location="cohort" />
        </div>
      </div>

      <style>{`
        .lp-cohort-contours {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0.5;
        }
      `}</style>
    </section>
  )
}
