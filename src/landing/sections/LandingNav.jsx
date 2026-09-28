import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { track } from '../../lib/analytics.js'
import { scrollToJoin } from '../scrollToJoin.js'
import { nav } from '../content.js'

export default function LandingNav() {
  const auth = useAuth()
  const user = auth && auth.user

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(10,14,26,0.86)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--lp-line)',
    }}>
      <div className="lp-shell" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/ascend-icon.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
          <span style={{
            fontFamily: 'Playfair Display, serif', fontWeight: 700,
            fontSize: 17, letterSpacing: '0.02em', color: 'var(--lp-ink)',
          }}>
            {nav.wordmark}
          </span>
        </a>

        <nav aria-label="Section" style={{ display: 'flex', alignItems: 'center', gap: 26 }} className="lp-nav-links">
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} className="lp-btn-ghost" style={{ fontSize: 14 }}>
              {link.label}
            </a>
          ))}
          {user ? (
            <Link to="/dashboard" className="lp-btn-ghost" style={{ fontSize: 14 }}>
              {nav.dashboardLink}
            </Link>
          ) : (
            <Link
              to="/start"
              className="lp-btn-ghost"
              style={{ fontSize: 14 }}
              onClick={() => track('demo_click', { location: 'nav' })}
            >
              {nav.demoLink}
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="lp-btn-gold"
          style={{ padding: '9px 16px', fontSize: 13.5 }}
          onClick={() => scrollToJoin('nav-join', 'nav')}
        >
          {nav.cta}
        </button>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .lp-nav-links { display: none !important; }
        }
      `}</style>
    </header>
  )
}
