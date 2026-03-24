import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useIntegrations } from '../hooks/useIntegrations'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import ConnectionCard from '../components/settings/ConnectionCard'
import CanvasWalkthrough from '../components/settings/CanvasWalkthrough'

import gcalLogo    from '../assets/icon-gcal.png'
import outlookLogo from '../assets/icon-outlook.png'
import canvasLogo  from '../assets/icon-canvas.png'

const ARCHETYPE_LABELS = {
  eagle: 'Eagle — Strategic & Decisive',
  fox:   'Fox — Resourceful & Adaptive',
  bear:  'Bear — Steady & Dependable',
}

/* ── Section divider helper ── */
function SectionLabel({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        margin: '2rem 0 1rem',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      <span
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const { integrations, loading: integrationsLoading } = useIntegrations()
  const { refetch: refetchEvents } = useCalendarEvents()

  // Per-button loading states
  const [googleLoading,    setGoogleLoading]    = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)
  const [canvasLoading,    setCanvasLoading]    = useState(false)
  const [canvasError,      setCanvasError]      = useState(null)

  // User profile (from Firestore)
  const [profile, setProfile] = useState(null)

  // URL-param feedback: ?connected=google | ?error=…
  const [successBanner, setSuccessBanner] = useState(null)
  const [urlError,      setUrlError]      = useState(null)

  /* ── Load Firestore profile ── */
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => { if (snap.exists()) setProfile(snap.data()) })
      .catch((err) => console.error('Failed to load profile:', err.message))
  }, [user])

  /* ── Handle ?connected= / ?error= query params ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const connected = params.get('connected')
    const error     = params.get('error')

    if (connected) {
      const label =
        connected === 'google'    ? 'Google Calendar' :
        connected === 'microsoft' ? 'Outlook Calendar' :
        connected
      setSuccessBanner(`${label} connected successfully!`)
      // Clear the query string without a history entry
      navigate('/settings', { replace: true })
      // Auto-dismiss after 4 s
      const t = setTimeout(() => setSuccessBanner(null), 4000)
      return () => clearTimeout(t)
    }

    if (error) {
      setUrlError(decodeURIComponent(error))
      navigate('/settings', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])   // run once on mount

  /* ── Auto-dismiss urlError after 6 s ── */
  useEffect(() => {
    if (!urlError) return
    const timer = setTimeout(() => setUrlError(null), 6000)
    return () => clearTimeout(timer)
  }, [urlError])

  /* ── Connect / Disconnect handlers ── */

  async function handleGoogleConnect() {
    setGoogleLoading(true)
    try {
      const idToken = await user.getIdToken()
      window.location.href = `/api/auth/google/init?idToken=${idToken}`
    } catch (err) {
      console.error('Google connect error:', err)
      setGoogleLoading(false)
    }
  }

  async function handleGoogleDisconnect() {
    setGoogleLoading(true)
    try {
      const idToken = await user.getIdToken()
      await fetch('/api/auth/google/revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      await refetchEvents()
    } catch (err) {
      console.error('Google disconnect error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleMicrosoftConnect() {
    setMicrosoftLoading(true)
    try {
      const idToken = await user.getIdToken()
      window.location.href = `/api/auth/microsoft/init?idToken=${idToken}`
    } catch (err) {
      console.error('Microsoft connect error:', err)
      setMicrosoftLoading(false)
    }
  }

  async function handleMicrosoftDisconnect() {
    setMicrosoftLoading(true)
    try {
      const idToken = await user.getIdToken()
      await fetch('/api/auth/microsoft/revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      await refetchEvents()
    } catch (err) {
      console.error('Microsoft disconnect error:', err)
    } finally {
      setMicrosoftLoading(false)
    }
  }

  async function handleCanvasConnect(baseUrl, apiToken) {
    setCanvasLoading(true)
    setCanvasError(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/canvas/connect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseUrl, apiToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCanvasError(data.error || 'Failed to connect Canvas. Check your URL and token.')
      } else {
        await refetchEvents()
      }
    } catch (err) {
      setCanvasError('Network error. Please try again.')
      console.error('Canvas connect error:', err)
    } finally {
      setCanvasLoading(false)
    }
  }

  async function handleCanvasDisconnect() {
    setCanvasLoading(true)
    try {
      const idToken = await user.getIdToken()
      await fetch('/api/canvas/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      await refetchEvents()
    } catch (err) {
      console.error('Canvas disconnect error:', err)
    } finally {
      setCanvasLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        overflowY: 'auto',
        padding: '1.5rem 1rem 3rem',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
        }}
      >
        {/* ── Top bar: Back + Sign Out ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
          }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-blue)',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '0.4rem 0.85rem',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--danger)'
              e.currentTarget.style.color       = 'var(--danger)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.color       = 'var(--text-secondary)'
            }}
          >
            Sign Out
          </button>
        </div>

        {/* ── Page title ── */}
        <h1
          style={{
            color: 'var(--text-primary)',
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '0.25rem',
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 0 }}>
          Manage your connected calendars and account details.
        </p>

        {/* ── Success banner ── */}
        {successBanner && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--success)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>&#10003;</span>
            {successBanner}
          </div>
        )}

        {/* ── URL-param error banner ── */}
        {urlError && (
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--danger)',
              fontSize: '0.875rem',
            }}
          >
            {urlError}
          </div>
        )}

        {/* ══════════════ Integrations ══════════════ */}
        <SectionLabel label="Integrations" />

        {integrationsLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            Loading integrations…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Google Calendar */}
            <ConnectionCard
              name="Google Calendar"
              logo={gcalLogo}
              description="Sync your Google Calendar events to your Ascend dashboard."
              connected={!!integrations.google}
              connectedLabel="Connected"
              onConnect={handleGoogleConnect}
              onDisconnect={handleGoogleDisconnect}
              loading={googleLoading}
            />

            {/* Outlook / Microsoft */}
            <ConnectionCard
              name="Outlook Calendar"
              logo={outlookLogo}
              description="Sync your Microsoft Outlook or Office 365 calendar."
              connected={!!integrations.microsoft}
              connectedLabel="Connected"
              onConnect={handleMicrosoftConnect}
              onDisconnect={handleMicrosoftDisconnect}
              loading={microsoftLoading}
            />

            {/* Canvas */}
            {integrations.canvas ? (
              <ConnectionCard
                name="Canvas LMS"
                logo={canvasLogo}
                description="View upcoming assignments and deadlines from Canvas."
                connected
                connectedLabel={
                  integrations.canvas.canvasUserName
                    ? `Connected as ${integrations.canvas.canvasUserName}`
                    : 'Connected'
                }
                onConnect={() => {}}
                onDisconnect={handleCanvasDisconnect}
                loading={canvasLoading}
              />
            ) : (
              <div>
                {/* Canvas header row (logo + name) above walkthrough */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <img
                    src={canvasLogo}
                    alt="Canvas logo"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      objectFit: 'contain',
                      background: 'var(--bg-elevated)',
                      padding: '3px',
                    }}
                  />
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                    }}
                  >
                    Canvas LMS
                  </span>
                </div>

                <CanvasWalkthrough
                  onConnect={handleCanvasConnect}
                  loading={canvasLoading}
                  error={canvasError}
                />
              </div>
            )}
          </div>
        )}

        {/* ══════════════ Account ══════════════ */}
        <SectionLabel label="Account" />

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {/* Email */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
              {user?.email ?? '—'}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* Tier */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tier</span>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.6rem',
                background: 'rgba(245,200,66,0.12)',
                border: '1px solid rgba(245,200,66,0.3)',
                borderRadius: '999px',
                color: 'var(--accent-gold)',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {profile?.tier ?? 'Free'}
            </span>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* Archetype */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Archetype</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500' }}>
              {profile?.archetype
                ? (ARCHETYPE_LABELS[profile.archetype] ?? profile.archetype)
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
