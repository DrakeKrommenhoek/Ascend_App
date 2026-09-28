import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../landing/landing.css'
import { CONTACT_EMAIL } from '../landing/content.js'

const EFFECTIVE_DATE = 'September 28, 2026'

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy — Ascend'
  }, [])

  return (
    <div className="lp-root">
      <div className="lp-grain" />
      <div className="lp-content">
        <header style={{ borderBottom: '1px solid var(--lp-line)' }}>
          <div className="lp-shell" style={{ height: 64, display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <img src="/ascend-icon.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 17, color: 'var(--lp-ink)' }}>
                ASCEND
              </span>
            </Link>
          </div>
        </header>

        <main className="lp-shell" style={{ padding: '56px 24px 96px', maxWidth: 760 }}>
          <p className="lp-eyebrow" style={{ marginBottom: 14 }}>PRIVACY</p>
          <h1 className="lp-h2" style={{ maxWidth: '100%', marginBottom: 8 }}>How Ascend handles your data</h1>
          <p style={{ fontSize: 13, color: 'var(--lp-ink-soft)', marginBottom: 40 }}>Effective {EFFECTIVE_DATE}</p>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              The short version
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              We collect the minimum needed to run the waitlist and understand how people use this
              page: your email, the optional profile details you choose to share, and anonymous
              usage analytics. We never sell your data to anyone.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              Mailchimp — the waitlist
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              When you join the waitlist, your email address and any optional profile fields you
              provide (school, grad year, track) are stored in our Mailchimp audience. Signup uses
              double opt-in, meaning you must confirm your email before you're added to the list.
              Every email we send includes an unsubscribe link, and unsubscribing removes you
              immediately.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              Google Analytics 4
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              We use GA4 to understand traffic and page usage — things like which pages are
              visited and which buttons are clicked. GA4 uses cookies and may collect device and
              approximate location information. This data is aggregated and is not used to
              identify you personally.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              Vercel Web Analytics
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              We also use Vercel's Web Analytics for basic traffic metrics. It's cookieless — it
              doesn't track you across sites and doesn't store any personal identifiers.
            </p>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              What we don't do
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              We never sell your data. We don't share your email with third parties beyond the
              service providers named above, who process it only to run the waitlist and this
              site.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--lp-ink)', marginBottom: 10 }}>
              Questions
            </h2>
            <p className="lp-body" style={{ maxWidth: '68ch' }}>
              Reach out any time at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--lp-blue)' }}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </main>

        <footer className="lp-shell" style={{ padding: '24px 24px 48px', borderTop: '1px solid var(--lp-line)' }}>
          <Link to="/" className="lp-btn-ghost" style={{ fontSize: 13, padding: 0 }}>← Back to Ascend</Link>
        </footer>
      </div>
    </div>
  )
}
