import WaitlistForm from '../WaitlistForm.jsx'
import { finalCta } from '../content.js'

export default function FinalCta() {
  return (
    <section className="lp-shell" style={{ padding: '96px 24px', borderTop: '1px solid var(--lp-line)', textAlign: 'center' }}>
      <h2 className="lp-h2" style={{ margin: '0 auto 32px', maxWidth: '18ch', textAlign: 'center' }}>
        {finalCta.heading}
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <WaitlistForm location="final" />
      </div>
    </section>
  )
}
