import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import RouteTracker from './components/RouteTracker.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

import Intro       from './screens/Intro.jsx'
import NameCapture from './screens/NameCapture.jsx'
import Quiz        from './screens/Quiz.jsx'
import Reveal      from './screens/Reveal.jsx'
import PetIntro    from './screens/PetIntro.jsx'
import Dashboard   from './screens/Dashboard.jsx'
import Login       from './screens/Login.jsx'
import Landing     from './landing/Landing.jsx'
import Privacy     from './screens/Privacy.jsx'

// ── Onboarding flow — lives at "/start" ─────────────────────────────────────
// Keeps the existing state-machine intact. After the quiz + reveal, the user
// is navigated to /login (if not authenticated) or /dashboard (if already authed).
function OnboardingFlow() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [screen,     setScreen]     = useState('intro')
  const [name,       setName]       = useState('')
  const [archetype,  setArchetype]  = useState(null)   // 'eagle'|'fox'|'bear'|'wolf'|'owl'|'falcon'|'lion'
  const [humorStyle, setHumorStyle] = useState('straight')

  // If already authenticated, skip onboarding
  if (user) return <Navigate to="/dashboard" replace />

  const handleIntroComplete  = useCallback(() => setScreen('nameCapture'), [])
  const handleNameComplete   = useCallback((n) => { setName(n); setScreen('quiz') }, [])
  const handleQuizComplete   = useCallback((result) => {
    if (result && typeof result === 'object') {
      setArchetype(result.archetype)
      setHumorStyle(result.humorStyle || 'straight')
    } else {
      setArchetype(result)
    }
    setScreen('reveal')
  }, [])
  // After reveal → go to login; quiz results carried in sessionStorage for post-auth save
  const handleRevealComplete = useCallback(() => {
    if (archetype) {
      try {
        sessionStorage.setItem('onboarding', JSON.stringify({ name, archetype, humorStyle }))
      } catch {}
    }
    navigate('/login')
  }, [archetype, name, humorStyle, navigate])

  const handleSkipToDemo = useCallback(() => {
    setName('Drake')
    setArchetype('eagle')
    setHumorStyle('straight')
    setScreen('dashboard')
  }, [])

  const handleQuizBack = useCallback(() => setScreen('nameCapture'), [])

  // Dev shortcut: skip directly to dashboard without auth
  const handleRestart = useCallback(() => {
    setScreen('intro')
    setName('')
    setArchetype(null)
    setHumorStyle('straight')
  }, [])

  if (screen === 'dashboard') {
    return (
      <Dashboard
        archetypeId={archetype}
        name={name}
        humorStyle={humorStyle}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: 'var(--bg-dark)' }}>
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
        <PetIntro archetypeId={archetype} name={name} onComplete={(hs) => { setHumorStyle(hs); navigate('/login') }} />
      )}
    </div>
  )
}

// ── Dashboard wrapper — saves onboarding data from sessionStorage after auth ─
function DashboardWrapper() {
  const { user, setUser } = useAuth()

  // If user has no archetype yet, save any onboarding data stored before login
  if (user && !user.archetype) {
    const stored = (() => {
      try { return JSON.parse(sessionStorage.getItem('onboarding') || 'null') } catch { return null }
    })()

    if (stored?.archetype) {
      // Fire-and-forget PATCH to save onboarding profile
      fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          archetype: stored.archetype,
          humorStyle: stored.humorStyle,
        }),
      }).then(() => {
        sessionStorage.removeItem('onboarding')
        setUser((u) => ({ ...u, archetype: stored.archetype, humorStyle: stored.humorStyle }))
      })
    }
  }

  return (
    <Dashboard
      archetypeId={user?.archetype}
      name={user?.email?.split('@')[0] || 'there'}
      humorStyle={user?.humorStyle || 'straight'}
      onRestart={() => {}}
    />
  )
}

// ── Root app ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/start"     element={<OnboardingFlow />} />
            <Route path="/privacy"   element={<Privacy />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardWrapper /></ProtectedRoute>
            } />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  )
}
