import { useState } from 'react'
import { ARCHETYPES } from '../data/archetypes.js'

const HUMOR_OPTIONS = [
  { id: 'straight', emoji: '🎯', label: 'Straight shooter',  sub: 'Direct and no-nonsense' },
  { id: 'sarcastic', emoji: '😏', label: 'Sarcastic',         sub: 'I need a little roasting to stay motivated' },
  { id: 'hype',     emoji: '🙌', label: 'Hype man',          sub: 'Keep the energy dialed up' },
  { id: 'zen',      emoji: '🧘', label: 'Zen',               sub: 'Calm, steady, no pressure' },
]

export default function PetIntro({ archetypeId, name, onComplete }) {
  const archetype    = ARCHETYPES[archetypeId] || ARCHETYPES.eagle
  const [selected, setSelected] = useState(null)

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: 'clamp(20px, 4vw, 56px)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'clamp(28px, 5vw, 64px)',
        maxWidth: '960px',
        width: '100%',
        animation: 'fade-in 600ms ease-out forwards',
      }}>

        {/* Animal image */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
          <img
            src={archetype.image}
            alt={archetype.animal}
            draggable={false}
            style={{
              height: 'clamp(160px, 36vh, 300px)',
              width: 'auto',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 28px ${archetype.color}55)`,
            }}
          />
        </div>

        {/* Right column */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(14px, 2.5vh, 24px)',
        }}>

          {/* Archetype label */}
          <div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.7rem', color: archetype.color,
              letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500,
              margin: '0 0 6px 0',
            }}>
              Your {archetype.animal}
            </p>
            <div style={{ width: '32px', height: '2px', backgroundColor: archetype.color, opacity: 0.5 }} />
          </div>

          {/* Pet intro message */}
          <p style={{
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(0.95rem, 1.9vw, 1.25rem)',
            color: 'var(--text-primary)',
            lineHeight: 1.65, margin: 0, opacity: 0.9,
            animation: 'fade-in 600ms ease-out 200ms both',
          }}>
            "{archetype.petIntroMessage(name)}"
          </p>

          {/* Humor style question */}
          <div style={{ animation: 'fade-in 500ms ease-out 450ms both' }}>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(0.88rem, 1.7vw, 1.05rem)',
              color: 'var(--text-secondary)',
              margin: '0 0 clamp(10px, 2vh, 16px) 0',
            }}>
              Last thing, {name} — how hard should I push you this week?
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}>
              {HUMOR_OPTIONS.map(opt => {
                const isSelected = selected === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: 'clamp(10px, 1.8vh, 14px) clamp(12px, 2vw, 16px)',
                      borderRadius: '10px',
                      border: isSelected
                        ? `1px solid ${archetype.color}`
                        : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: isSelected
                        ? `${archetype.color}1A`
                        : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color 150ms ease, background-color 150ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{opt.emoji}</span>
                    <div>
                      <p style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 600,
                        fontSize: 'clamp(0.78rem, 1.4vw, 0.9rem)',
                        color: isSelected ? archetype.color : 'var(--text-primary)',
                        margin: '0 0 1px 0',
                        transition: 'color 150ms ease',
                      }}>
                        {opt.label}
                      </p>
                      <p style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 300,
                        fontSize: 'clamp(0.65rem, 1.2vw, 0.75rem)',
                        color: 'var(--text-secondary)',
                        margin: 0,
                      }}>
                        {opt.sub}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => selected && onComplete(selected)}
            disabled={!selected}
            style={{
              alignSelf: 'flex-start',
              padding: '13px 30px',
              backgroundColor: selected ? archetype.color : 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
              color: selected ? '#0A0E1A' : 'var(--text-secondary)',
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'background-color 200ms ease, color 200ms ease, transform 150ms ease',
              animation: 'fade-in 500ms ease-out 600ms both',
            }}
            onMouseEnter={e => { if (selected) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            onMouseDown={e => { if (selected) e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            Let's go →
          </button>
        </div>
      </div>
    </div>
  )
}
