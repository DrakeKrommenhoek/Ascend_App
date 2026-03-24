/**
 * ConnectionCard — reusable card for a single calendar/service integration.
 *
 * Props:
 *   name           {string}          display name, e.g. "Google Calendar"
 *   logo           {string}          imported image src
 *   description    {string}          one-line description
 *   connected      {bool}
 *   connectedLabel {string | null}   optional "Connected as …" override
 *   onConnect      {function}
 *   onDisconnect   {function}
 *   loading        {bool}            button-level loading state
 */
export default function ConnectionCard({
  name,
  logo,
  description,
  connected,
  connectedLabel,
  onConnect,
  onDisconnect,
  loading = false,
}) {
  const spinnerStyle = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      {/* Logo */}
      <img
        src={logo}
        alt={`${name} logo`}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          objectFit: 'contain',
          flexShrink: 0,
          background: 'var(--bg-elevated)',
          padding: '4px',
        }}
      />

      {/* Name + description + status */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '0.95rem',
            }}
          >
            {name}
          </span>

          {connected && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.2rem 0.55rem',
                background: 'rgba(52, 211, 153, 0.12)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: '500',
                color: 'var(--success)',
              }}
            >
              {/* green dot */}
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  flexShrink: 0,
                }}
              />
              {connectedLabel || 'Connected'}
            </span>
          )}
        </div>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            marginTop: '0.2rem',
            lineHeight: '1.4',
          }}
        >
          {description}
        </p>
      </div>

      {/* Action button */}
      {connected ? (
        <button
          onClick={onDisconnect}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: '1px solid var(--danger)',
            borderRadius: '8px',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexShrink: 0,
          }}
        >
          {loading && <span style={{ ...spinnerStyle, borderTopColor: 'var(--danger)' }} />}
          {loading ? 'Disconnecting…' : 'Disconnect'}
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: loading ? 'rgba(79,142,247,0.5)' : 'var(--accent-blue)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexShrink: 0,
          }}
        >
          {loading && <span style={spinnerStyle} />}
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      )}
    </div>
  )
}
