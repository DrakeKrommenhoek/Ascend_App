import { useState } from 'react'
import ascendLogo from '../assets/ascend-logo.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok && data.ok) {
        setStatus('sent')
      } else if (res.status === 429) {
        setStatus('error')
        setErrorMsg('Too many attempts. Try again in an hour.')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Check your connection and try again.')
    }
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <img
            src={ascendLogo}
            alt="Ascend"
            style={{ height: 40, objectFit: 'contain' }}
          />
        </div>

        {status !== 'sent' ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '32px 28px',
            }}
          >
            <h1
              style={{
                color: '#F4F6FA',
                fontSize: 22,
                fontWeight: 700,
                fontFamily: 'Playfair Display, serif',
                marginBottom: 8,
              }}
            >
              Sign in to Ascend
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 28 }}>
              Enter your email and we'll send you a sign-in link. No password needed.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                style={{
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#F4F6FA',
                  fontSize: 15,
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
              />

              {errorMsg && (
                <p style={{ color: '#F87171', fontSize: 13 }}>{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending' || !email.includes('@')}
                style={{
                  padding: '13px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: status === 'sending' ? 'rgba(74,127,212,0.5)' : 'var(--accent)',
                  color: 'var(--accent-text)',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: status === 'sending' || !email.includes('@') ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, system-ui, sans-serif',
                  transition: 'background-color 0.15s ease',
                  opacity: !email.includes('@') ? 0.5 : 1,
                }}
              >
                {status === 'sending' ? 'Sending...' : 'Send me a link'}
              </button>
            </form>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '32px 28px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <h2 style={{ color: '#F4F6FA', fontSize: 20, fontWeight: 700, marginBottom: 12, fontFamily: 'Playfair Display, serif' }}>
              Check your email
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              We sent a sign-in link to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{email}</strong>.
              Click the link in the email to sign in. It expires in 15 minutes.
            </p>
            <button
              onClick={() => { setStatus('idle'); setEmail('') }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'DM Sans, system-ui, sans-serif',
              }}
            >
              ← Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
