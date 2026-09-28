import { useState } from 'react'
import { track } from '../lib/analytics.js'
import { referralPanel as copy } from './content.js'

export default function ReferralPanel({ refCode }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/?ref=${refCode}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      const el = document.createElement('textarea')
      el.value = link
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      try { document.execCommand('copy') } catch {}
      document.body.removeChild(el)
    }
    track('referral_copy')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <p style={{ fontSize: 13.5, color: 'var(--lp-ink-soft)', marginBottom: 10 }}>{copy.heading}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="lp-input" type="text" readOnly value={link} onFocus={(e) => e.target.select()} />
        <button type="button" className="lp-btn-gold" onClick={handleCopy} style={{ flexShrink: 0 }}>
          {copied ? copy.copiedLabel : copy.copyLabel}
        </button>
      </div>
    </div>
  )
}
