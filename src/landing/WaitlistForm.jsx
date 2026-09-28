import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { track, getUtm, getRef } from '../lib/analytics.js'
import { waitlistForm as copy } from './content.js'
import ProfileStep from './ProfileStep.jsx'
import ReferralPanel from './ReferralPanel.jsx'

// Never fakes success: only resolves ok:true when the server body actually
// says so. A non-JSON body (HTML 500 page, offline proxy, etc.) falls
// through to the generic error, exactly like a real server error would.
export async function parseResponse(res) {
  let data = null
  try { data = await res.json() } catch { data = null }
  if (res.ok && data && data.ok === true) return { ok: true, refCode: data.refCode || '' }
  return { ok: false, error: (data && data.error) || copy.genericError }
}

export async function postWaitlist(payload) {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return await parseResponse(res)
  } catch {
    return { ok: false, error: copy.genericError }
  }
}

export default function WaitlistForm({ location }) {
  const renderedAt = useRef(Date.now())
  const inFlight = useRef(false)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | success | profiled | error
  const [error, setError] = useState('')
  const [refCode, setRefCode] = useState('')

  const basePayload = () => ({
    email, ref: getRef() || null, utm: getUtm(), company, t: Date.now() - renderedAt.current,
  })

  async function onSubmit(e) {
    e.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setStatus('submitting'); setError('')
    const result = await postWaitlist(basePayload())
    inFlight.current = false
    if (result.ok) {
      setRefCode(result.refCode); setStatus('success')
      track('sign_up', { method: 'waitlist', form_location: location })
    } else {
      setError(result.error); setStatus('error')
    }
  }

  async function onProfileSave(profile) {
    const result = await postWaitlist({ ...basePayload(), profile })
    if (result.ok) track('profile_complete', { track: profile.track || 'none' })
    setStatus('profiled')
    return result
  }

  if (status === 'success') {
    return (
      <div>
        <p style={{ fontSize: 14, color: 'var(--lp-gold)', marginBottom: 14 }}>{copy.successHeading}</p>
        <ProfileStep onSave={onProfileSave} onSkip={() => setStatus('profiled')} />
      </div>
    )
  }
  if (status === 'profiled') return <ReferralPanel refCode={refCode} />

  return (
    <form onSubmit={onSubmit} aria-describedby={`wl-msg-${location}`} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
      {/* Honeypot — invisible to real visitors and screen readers, catches bots */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" name="company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      <div className="lp-wl-row">
        <div style={{ minWidth: 0 }}>
          <label htmlFor={`wl-email-${location}`} className="sr-only">Email address</label>
          <input
            id={`wl-email-${location}`}
            className="lp-input"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder={copy.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'submitting'}
          />
        </div>
        <motion.button
          type="submit"
          className="lp-btn-gold lp-wl-submit"
          disabled={status === 'submitting'}
          whileTap={{ scale: 0.98 }}
        >
          {status === 'submitting' ? copy.ctaSubmitting : copy.ctaIdle}
        </motion.button>
      </div>

      <p
        id={`wl-msg-${location}`}
        role={status === 'error' ? 'alert' : undefined}
        style={{ fontSize: 12.5, color: status === 'error' ? '#F2A65A' : 'var(--lp-ink-soft)', margin: 0 }}
      >
        {status === 'error' ? error : copy.microcopy}
      </p>
    </form>
  )
}
