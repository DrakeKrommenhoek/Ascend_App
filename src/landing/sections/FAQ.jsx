import { Link } from 'react-router-dom'
import { track } from '../../lib/analytics.js'
import { faq } from '../content.js'

export default function FAQ() {
  return (
    <section id="faq" className="lp-shell" style={{ padding: '84px 24px', borderTop: '1px solid var(--lp-line)' }}>
      <h2 className="lp-h2" style={{ marginBottom: 40 }}>{faq.heading}</h2>

      <div>
        {faq.items.map((item, i) => (
          <details
            key={item.id}
            onToggle={(e) => { if (e.target.open) track('faq_open', { question_id: item.id }) }}
            style={{ padding: '20px 0', borderTop: i === 0 ? 'none' : '1px solid var(--lp-line)' }}
          >
            <summary style={{
              cursor: 'pointer', listStyle: 'none', fontFamily: 'DM Sans, sans-serif',
              fontSize: 16.5, fontWeight: 600, color: 'var(--lp-ink)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
            }}>
              {item.question}
              <span aria-hidden="true" style={{ color: 'var(--lp-gold)', fontSize: 18, flexShrink: 0 }}>+</span>
            </summary>
            <p className="lp-body" style={{ marginTop: 12, maxWidth: '56ch' }}>
              {item.answer}{' '}
              {item.link && (
                <Link to={item.link.to} style={{ color: 'var(--lp-blue)' }}>{item.link.label}</Link>
              )}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
