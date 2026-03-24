import { useState } from 'react'

/**
 * CanvasWalkthrough — inline 3-step guide + token form shown when Canvas
 * is not yet connected.
 *
 * Props:
 *   onConnect  {function(baseUrl: string, apiToken: string)}
 *   loading    {bool}
 *   error      {string | null}
 */
export default function CanvasWalkthrough({ onConnect, loading = false, error = null }) {
  const [baseUrl, setBaseUrl]   = useState('')
  const [apiToken, setApiToken] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!baseUrl.trim() || !apiToken.trim()) return
    onConnect(baseUrl.trim(), apiToken.trim())
  }

  const steps = [
    {
      number: 1,
      html: 'Go to your Canvas account → click your profile picture → <strong>Account</strong> → <strong>Settings</strong>',
    },
    {
      number: 2,
      html: 'Scroll down to <strong>Approved Integrations</strong>, click <strong>+ New Access Token</strong>',
    },
    {
      number: 3,
      html: 'Paste your token and Canvas base URL below',
    },
  ]

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    background: 'var(--bg-elevated)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}
    >
      {/* Header row with Canvas logo placeholder / label */}
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          marginBottom: '1.25rem',
          lineHeight: '1.5',
        }}
      >
        Canvas uses personal access tokens instead of OAuth. Follow these steps:
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, idx) => (
          <div key={step.number}>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              {/* Step circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(79,142,247,0.15)',
                  border: '1.5px solid var(--accent-blue)',
                  color: 'var(--accent-blue)',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {step.number}
              </div>

              {/* Step text */}
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: '1.55',
                  paddingTop: '3px',
                }}
                dangerouslySetInnerHTML={{ __html: step.html }}
              />
            </div>

            {/* Divider between steps (not after last) */}
            {idx < steps.length - 1 && (
              <div
                style={{
                  marginLeft: '13px',   /* centre of the 28px circle */
                  width: '1.5px',
                  height: '20px',
                  background: 'rgba(79,142,247,0.25)',
                  marginTop: '4px',
                  marginBottom: '4px',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Divider before form */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255,255,255,0.06)',
          margin: '1.25rem 0',
        }}
      />

      {/* Token form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div>
          <label
            htmlFor="canvas-base-url"
            style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              marginBottom: '0.35rem',
            }}
          >
            Canvas Base URL
          </label>
          <input
            id="canvas-base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://canvas.yourschool.edu"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        <div>
          <label
            htmlFor="canvas-api-token"
            style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              marginBottom: '0.35rem',
            }}
          >
            API Token
          </label>
          <input
            id="canvas-api-token"
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Paste your Canvas token here"
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '8px',
              padding: '0.7rem 0.9rem',
              color: 'var(--danger)',
              fontSize: '0.82rem',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !baseUrl.trim() || !apiToken.trim()}
          style={{
            padding: '0.7rem 1.25rem',
            background:
              loading || !baseUrl.trim() || !apiToken.trim()
                ? 'rgba(79,142,247,0.5)'
                : 'var(--accent-blue)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor:
              loading || !baseUrl.trim() || !apiToken.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            alignSelf: 'flex-start',
          }}
        >
          {loading && (
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }}
            />
          )}
          {loading ? 'Connecting…' : 'Connect Canvas'}
        </button>
      </form>
    </div>
  )
}
