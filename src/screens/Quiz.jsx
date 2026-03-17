import { useState, useRef, useEffect } from 'react'
import { QUESTIONS } from '../data/quizData.js'
import { scoreQuiz } from '../data/archetypes.js'

export default function Quiz({ name, onComplete, onBack }) {
  const [qIndex,    setQIndex]    = useState(-1)   // -1 = intro screen
  const [answers,   setAnswers]   = useState([])
  const [selecting, setSelecting] = useState(null)

  const answerTimerRef = useRef(null)
  useEffect(() => () => clearTimeout(answerTimerRef.current), [])

  const question = qIndex >= 0 ? QUESTIONS[qIndex] : null
  const progress = qIndex < 0 ? 0 : (qIndex / QUESTIONS.length) * 100

  function handleStartQuiz() {
    setQIndex(0)
  }

  function handleAnswer(optionIndex) {
    if (selecting !== null) return
    setSelecting(optionIndex)

    answerTimerRef.current = setTimeout(() => {
      const newAnswers = [...answers.slice(0, qIndex), optionIndex]
      setAnswers(newAnswers)
      setSelecting(null)

      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(qIndex + 1)
      } else {
        onComplete(scoreQuiz(newAnswers))
      }
    }, 200)
  }

  function handleBack() {
    if (qIndex <= 0) {
      onBack()
    } else {
      setQIndex(qIndex - 1)
    }
  }

  const selectedStyle = {
    backgroundColor: 'rgba(79, 142, 247, 0.18)',
    border: '1px solid rgba(79, 142, 247, 0.5)',
    color: 'var(--accent-blue)',
  }
  const defaultStyle = {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 10,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--accent-blue)',
          transition: 'width 300ms ease-out',
        }} />
      </div>

      {/* ── Intro screen (qIndex === -1) ─────────────────────── */}
      {qIndex === -1 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 5vw, 80px)',
          animation: 'fade-in 400ms ease-out forwards',
        }}>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 600,
            fontSize: 'clamp(1.4rem, 3.2vw, 2.2rem)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            maxWidth: '580px',
            lineHeight: 1.35,
            margin: '0 0 clamp(0.75rem, 1.5vh, 1.25rem) 0',
          }}>
            Before we build your game plan, {name} — a few quick questions.
          </h2>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(0.95rem, 1.9vw, 1.15rem)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
            margin: '0 0 clamp(2rem, 4vh, 3.5rem) 0',
            textAlign: 'center',
          }}>
            90 seconds. This shapes your weekly dashboard.
          </p>
          <button
            onClick={handleStartQuiz}
            style={{
              padding: '13px 32px',
              backgroundColor: 'var(--accent-blue)',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
              color: 'white',
              cursor: 'pointer',
              transition: 'opacity 150ms ease, transform 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            Let's go →
          </button>
        </div>
      )}

      {/* ── Question screen ─────────────────────────────────── */}
      {qIndex >= 0 && question && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(24px, 5vw, 80px)',
        }}>

          {/* Counter */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 1.25rem 0',
          }}>
            QUESTION {qIndex + 1} OF {QUESTIONS.length}
          </p>

          {/* Question */}
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontWeight: 600,
            fontSize: 'clamp(1.3rem, 3vw, 2rem)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: 1.35,
            margin: '0 0 clamp(2rem, 4vh, 3.5rem) 0',
          }}>
            {question.text}
          </h2>

          {/* Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 1.5vh, 16px)',
            width: '100%',
            maxWidth: '520px',
          }}>
            {question.options.map((opt, i) => {
              const isHighlighted = selecting === i
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  style={{
                    padding: 'clamp(14px, 2vh, 20px) clamp(18px, 3vw, 28px)',
                    borderRadius: '10px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
                    fontWeight: 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    width: '100%',
                    transition: 'background-color 150ms ease, border-color 150ms ease, color 150ms ease',
                    ...(isHighlighted ? selectedStyle : defaultStyle),
                  }}
                  onMouseEnter={e => {
                    if (selecting === null) {
                      e.currentTarget.style.backgroundColor = 'rgba(79, 142, 247, 0.10)'
                      e.currentTarget.style.borderColor = 'rgba(79, 142, 247, 0.3)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (selecting !== i) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          bottom: 'clamp(16px, 3vh, 28px)',
          left: 'clamp(16px, 3vw, 28px)',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          padding: '8px',
          opacity: 0.7,
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.7' }}
      >
        ← back
      </button>
    </div>
  )
}
