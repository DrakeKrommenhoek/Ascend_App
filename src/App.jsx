import { useState, useCallback } from 'react'
import Intro       from './screens/Intro.jsx'
import NameCapture from './screens/NameCapture.jsx'
import Quiz        from './screens/Quiz.jsx'
import Reveal      from './screens/Reveal.jsx'
import PetIntro    from './screens/PetIntro.jsx'
import Dashboard   from './screens/Dashboard.jsx'

export default function App() {
  const [screen,     setScreen]     = useState('intro')
  const [name,       setName]       = useState('')
  const [archetype,  setArchetype]  = useState(null)   // 'eagle' | 'fox' | 'bear'
  const [humorStyle, setHumorStyle] = useState('straight') // 'straight'|'sarcastic'|'hype'|'zen'

  const handleIntroComplete    = useCallback(() => setScreen('nameCapture'), [])
  const handleNameComplete     = useCallback((n) => { setName(n); setScreen('quiz') }, [])
  const handleQuizComplete     = useCallback((result) => { setArchetype(result); setScreen('reveal') }, [])
  const handleRevealComplete   = useCallback(() => setScreen('petIntro'), [])
  const handlePetIntroComplete = useCallback((hs) => { setHumorStyle(hs); setScreen('dashboard') }, [])
  const handleSkipToDemo       = useCallback(() => {
    setName('Drake')
    setArchetype('eagle')
    setHumorStyle('straight')
    setScreen('dashboard')
  }, [])
  const handleQuizBack         = useCallback(() => setScreen('nameCapture'), [])
  const handleRestart          = useCallback(() => {
    setScreen('intro')
    setName('')
    setArchetype(null)
    setHumorStyle('straight')
  }, [])

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
      {screen === 'dashboard' && (
        <Dashboard
          archetypeId={archetype}
          name={name}
          humorStyle={humorStyle}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
