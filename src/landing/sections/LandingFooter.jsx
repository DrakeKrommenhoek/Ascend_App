import { Link } from 'react-router-dom'
import { footer, CONTACT_EMAIL } from '../content.js'

export default function LandingFooter() {
  return (
    <footer className="lp-shell" style={{
      padding: '32px 24px 48px',
      borderTop: '1px solid var(--lp-line)',
      display: 'flex', flexWrap: 'wrap', gap: 20,
      alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 13, color: 'var(--lp-ink-soft)' }}>{footer.copyright}</span>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link to="/privacy" className="lp-btn-ghost" style={{ fontSize: 13, padding: 0 }}>{footer.privacyLabel}</Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="lp-btn-ghost" style={{ fontSize: 13, padding: 0 }}>{footer.contactLabel}</a>
      </div>
    </footer>
  )
}
