import { useState, useRef, useEffect } from 'react'

export default function NameCapture({ onComplete }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    // Auto-focus the input after the fade-in
    const t = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(t)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onComplete(trimmed)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(32px, 8vw, 96px)',
      animation: 'fade-in 300ms ease-out forwards',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(20px, 4vh, 32px)',
        animation: 'slide-up-fade 400ms ease-out forwards',
      }}>

        {/* Deadpan copy */}
        <div>
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 2.8vw, 1.9rem)',
            color: '#1B3A6B',
            lineHeight: 1.35,
            margin: '0 0 clamp(10px, 2vh, 16px) 0',
          }}>
            Oh no. You pressed it.
          </p>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            color: '#3A5A8A',
            lineHeight: 1.65,
            margin: 0,
          }}>
            We told you not to. Well, now you're here and there's no going back.
            At least tell us your name so we know who to blame.
          </p>
        </div>

        {/* Name form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="First name..."
            autoComplete="off"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#1B3A6B',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '2px solid #C5D5EA',
              borderRadius: 0,
              padding: '10px 2px',
              outline: 'none',
              width: '100%',
              transition: 'border-color 200ms ease',
            }}
            onFocus={e => { e.target.style.borderBottomColor = '#4F8EF7' }}
            onBlur={e => { e.target.style.borderBottomColor = '#C5D5EA' }}
          />

          <button
            type="submit"
            disabled={!value.trim()}
            style={{
              alignSelf: 'flex-start',
              marginTop: '6px',
              padding: '12px 28px',
              backgroundColor: value.trim() ? '#1B3A6B' : '#A0B4CC',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
              color: 'white',
              cursor: value.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 200ms ease, transform 150ms ease',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (value.trim()) e.currentTarget.style.backgroundColor = '#2A5298' }}
            onMouseLeave={e => { if (value.trim()) e.currentTarget.style.backgroundColor = '#1B3A6B' }}
            onMouseDown={e => { if (value.trim()) e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            Fine, let's go →
          </button>
        </form>
      </div>
    </div>
  )
}
