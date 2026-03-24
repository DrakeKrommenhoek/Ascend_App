import { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Intro          from './screens/Intro.jsx'
import NameCapture    from './screens/NameCapture.jsx'
import Quiz           from './screens/Quiz.jsx'
import Reveal         from './screens/Reveal.jsx'
import PetIntro       from './screens/PetIntro.jsx'
import Login          from './screens/Login.jsx'
import SignUp         from './screens/SignUp.jsx'
import Dashboard      from './screens/Dashboard.jsx'
import Settings       from './screens/Settings.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

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

      {/* Auth screens */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all → onboarding */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
