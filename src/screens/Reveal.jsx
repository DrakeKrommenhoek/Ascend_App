import { useState, useEffect, useRef } from 'react'
import { ARCHETYPES } from '../data/archetypes.js'

export default function Reveal({ archetypeId, name, onComplete }) {
  const archetype = ARCHETYPES[archetypeId] || ARCHETYPES.eagle
  const [phase, setPhase] = useState(0)  // 0=intro text, 1=archetype name, 2=full reveal

  const t1 = useRef(null)
  const t2 = useRef(null)
  const t3 = useRef(null)

  useEffect(() => {
    t1.current = setTimeout(() => setPhase(1), 1500)
    t2.current = setTimeout(() => setPhase(2), 2800)
    return () => { clearTimeout(t1.current); clearTimeout(t2.current); clearTimeout(t3.current) }
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'stretch',
      overflow: 'hidden',
    }}>

      {/* Left panel — text */}
      <div style={{
        flex: '0 0 46%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 72px)',
      }}>

        {/* Phase 0+: "We've assessed the situation, [name]." */}
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.04em',
          margin: '0 0 clamp(12px, 2vh, 20px) 0',
          animation: 'fade-in 600ms ease-out forwards',
        }}>
          We've assessed the situation, {name}.
        </p>

        {/* Phase 1+: "You're a [Archetype Name]." */}
        {phase >= 1 && (
          <>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontWeight: 700,
              fontSize: 'clamp(2.8rem, 6vw, 4.4rem)',
              color: archetype.color,
              letterSpacing: '0.02em',
              lineHeight: 1.05,
              margin: '0 0 0.35rem 0',
              animation: 'slide-up-fade 500ms ease-out forwards',
            }}>
              {archetype.name}
            </h1>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(0.7rem, 1.3vw, 0.88rem)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              margin: '0 0 1.6rem 0',
              animation: 'fade-in 500ms ease-out 150ms both',
            }}>
              {archetype.subtitle}
            </p>
          </>
        )}

        {/* Phase 2: key phrase + description + CTA */}
        {phase >= 2 && (
          <>
            <p style={{
              fontFamily: 'Playfair Display, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(0.95rem, 1.7vw, 1.12rem)',
              color: archetype.color,
              lineHeight: 1.55,
              margin: '0 0 1.5rem 0',
              opacity: 0.9,
              animation: 'fade-in 500ms ease-out forwards',
            }}>
              "{archetype.keyPhrase}"
            </p>

            <div style={{
              width: '40px', height: '1px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              margin: '0 0 1.5rem 0',
              animation: 'fade-in 500ms ease-out 100ms both',
            }} />

            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.55vw, 1.02rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.72,
              opacity: 0.85,
              margin: '0 0 1.5rem 0',
              animation: 'fade-in 500ms ease-out 200ms both',
            }}>
              {archetype.description}
            </p>

            {/* Weekly strategy — compact, 3 bullets */}
            {archetype.weeklyStrategy && (
              <div style={{
                borderLeft: `2px solid ${archetype.color}`,
                paddingLeft: '14px',
                margin: '0 0 2rem 0',
                animation: 'fade-in 500ms ease-out 350ms both',
              }}>
                <p style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  color: archetype.color,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                }}>
                  Your strategy this week
                </p>
                {archetype.weeklyStrategy.map((bullet, i) => (
                  <p key={i} style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)',
                    color: 'var(--text-primary)',
                    opacity: 0.82,
                    lineHeight: 1.5,
                    margin: i < archetype.weeklyStrategy.length - 1 ? '0 0 4px 0' : 0,
                  }}>
                    {bullet}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={onComplete}
              style={{
                alignSelf: 'flex-start',
                padding: '13px 30px',
                backgroundColor: archetype.color,
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                color: '#0A0E1A',
                cursor: 'pointer',
                animation: 'fade-in 500ms ease-out 400ms both',
                transition: 'opacity 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              Meet your accountability partner →
            </button>
          </>
        )}
      </div>

      {/* Right panel — animal image */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 4vw, 56px)',
        animation: 'fade-in 700ms ease-out 300ms both',
      }}>
        <img
          src={archetype.image}
          alt={archetype.animal}
          draggable={false}
          style={{
            maxHeight: '82%',
            maxWidth: '100%',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 48px ${archetype.color}44)`,
          }}
        />
      </div>
    </div>
  )
}
