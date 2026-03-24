import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Intro       from './screens/Intro.jsx'
import NameCapture from './screens/NameCapture.jsx'
import Quiz        from './screens/Quiz.jsx'
import Reveal      from './screens/Reveal.jsx'
import PetIntro    from './screens/PetIntro.jsx'
// Dashboard lives at /dashboard route — not rendered inline here
// import Dashboard   from './screens/Dashboard.jsx'
import { useAuth } from './contexts/AuthContext'

// Simple ProtectedRoute — redirects to / if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Onboarding state machine — Intro → NameCapture → Quiz → Reveal → PetIntro → /signup
function Onboarding() {
  const navigate = useNavigate()
  const [screen,     setScreen]     = useState('intro')
  const [name,       setName]       = useState('')
  const [archetype,  setArchetype]  = useState(null)   // 'eagle' | 'fox' | 'bear'
  const [humorStyle, setHumorStyle] = useState('straight') // 'straight'|'sarcastic'|'hype'|'zen'

  const handleIntroComplete    = useCallback(() => setScreen('nameCapture'), [])
  const handleNameComplete     = useCallback((n) => { setName(n); setScreen('quiz') }, [])
  const handleQuizComplete     = useCallback((result) => { setArchetype(result); setScreen('reveal') }, [])
  const handleRevealComplete   = useCallback(() => setScreen('petIntro'), [])
  const handlePetIntroComplete = useCallback((hs) => {
    setHumorStyle(hs)
    // Navigate to /signup, passing onboarding data via location state
    navigate('/signup', { state: { name, archetype, humorStyle: hs } })
  }, [navigate, name, archetype])

  const handleSkipToDemo = useCallback(() => {
    navigate('/signup', {
      state: { name: 'Demo User', archetype: 'eagle', humorStyle: 'straight' },
    })
  }, [navigate])

  const handleQuizBack = useCallback(() => setScreen('nameCapture'), [])

  return (
    <div className="w-full h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {screen === 'intro' && (
        <Intro onComplete={handleIntroComplete} onSkipToDemo={handleSkipToDemo} />
      )}
      {screen === 'nameCapture' && (
        <NameCapture onComplete={handleNameComplete} />
      )}
      {screen === 'quiz' && (
        <Quiz name={name} onComplete={handleQuizComplete} onBack={handleQuizBack} />
      )}
      {screen === 'reveal' && (
        <Reveal archetypeId={archetype} name={name} onComplete={handleRevealComplete} />
      )}
      {screen === 'petIntro' && (
        <PetIntro archetypeId={archetype} name={name} onComplete={handlePetIntroComplete} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Onboarding flow */}
      <Route path="/" element={<Onboarding />} />

      {/* Auth screens — placeholders until Task 2 */}
      <Route path="/login" element={<div>Login screen coming in Task 2</div>} />
      <Route path="/signup" element={<div>Signup coming in Task 2</div>} />

      {/* Protected routes — placeholders until later tasks */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard coming</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div>Settings coming</div>
          </ProtectedRoute>
        }
      />

      {/* Catch-all → onboarding */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
