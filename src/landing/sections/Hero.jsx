import { Link } from 'react-router-dom'
import { track } from '../../lib/analytics.js'
import Contours from '../Contours.jsx'
import DashboardMock from '../DashboardMock.jsx'
import WaitlistForm from '../WaitlistForm.jsx'
import { hero } from '../content.js'

export default function Hero() {
  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', paddingTop: 56 }}>
      <Contours className="lp-hero-contours" seed={7} cx={980} cy={340} rings={13} />

      <div className="lp-shell lp-hero-grid" style={{
        position: 'relative', zIndex: 2,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 32,
        paddingTop: 40,
        paddingBottom: 56,
      }}>
        <div style={{ order: 1, minWidth: 0 }}>
          <p className="lp-eyebrow" style={{ marginBottom: 18 }}>{hero.eyebrow}</p>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontSize: 'clamp(2.6rem, 6vw, 5.2rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: 'var(--lp-ink)',
            maxWidth: '14ch',
            marginBottom: 22,
          }}>
            {hero.headline}
          </h1>
          <p className="lp-body" style={{ marginBottom: 30, maxWidth: '46ch' }}>{hero.subhead}</p>
        </div>

        <div id="join" style={{ order: 2, minWidth: 0 }}>
          <WaitlistForm location="hero" />
          <Link
            to="/start"
            onClick={() => track('demo_click', { location: 'hero' })}
            style={{
              display: 'inline-block', marginTop: 18, fontSize: 14,
              color: 'var(--lp-blue)', textDecoration: 'none',
            }}
          >
            {hero.demoLink}
          </Link>
        </div>

        <div style={{ order: 3, minWidth: 0, maxWidth: 460, width: '100%', justifySelf: 'center' }}>
          <DashboardMock />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lp-hero-grid {
            grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
            align-items: center;
          }
          .lp-hero-grid > div:nth-child(1) { order: 1; grid-column: 1; grid-row: 1; }
          .lp-hero-grid > div:nth-child(2) { order: 2; grid-column: 1; grid-row: 2; }
          .lp-hero-grid > div:nth-child(3) { order: 3; grid-column: 2; grid-row: 1 / span 2; justify-self: end; max-width: 460px; }
        }
        .lp-hero-contours {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0.9;
        }
      `}</style>
    </section>
  )
}
