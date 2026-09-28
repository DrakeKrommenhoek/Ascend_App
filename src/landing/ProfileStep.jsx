import { useState } from 'react'
import { profileStep as copy, TRACKS, GRAD_YEARS } from './content.js'

// Optional 3-field profile capture shown right after a successful signup.
// A save failure is non-blocking — the user still proceeds to the referral
// panel either way, since the waitlist entry itself already succeeded.
export default function ProfileStep({ onSave, onSkip }) {
  const [school, setSchool] = useState('')
  const [gradYear, setGradYear] = useState('')
  const [trackValue, setTrackValue] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    try {
      await onSave({ school, gradYear, track: trackValue })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 420 }}>
      <p style={{ fontSize: 13.5, color: 'var(--lp-ink-soft)', marginBottom: 14 }}>{copy.heading}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label className="lp-label" htmlFor="ps-school">{copy.schoolLabel}</label>
          <input
            id="ps-school"
            className="lp-input"
            type="text"
            maxLength={100}
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            disabled={saving}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="lp-label" htmlFor="ps-grad">{copy.gradYearLabel}</label>
            <select id="ps-grad" className="lp-select" value={gradYear} onChange={(e) => setGradYear(e.target.value)} disabled={saving}>
              <option value="" />
              {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="lp-label" htmlFor="ps-track">{copy.trackLabel}</label>
            <select id="ps-track" className="lp-select" value={trackValue} onChange={(e) => setTrackValue(e.target.value)} disabled={saving}>
              <option value="" />
              {TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button type="submit" className="lp-btn-gold" disabled={saving}>
          {saving ? copy.savingLabel : copy.saveLabel}
        </button>
        <button type="button" className="lp-btn-ghost" onClick={onSkip} disabled={saving}>
          {copy.skipLabel}
        </button>
      </div>
    </form>
  )
}
