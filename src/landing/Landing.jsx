import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import './landing.css'

import LandingNav from './sections/LandingNav.jsx'
import Hero from './sections/Hero.jsx'
import Problem from './sections/Problem.jsx'
import HowItWorks from './sections/HowItWorks.jsx'
import Features from './sections/Features.jsx'
import FoundingCohort from './sections/FoundingCohort.jsx'
import FAQ from './sections/FAQ.jsx'
import FinalCta from './sections/FinalCta.jsx'
import LandingFooter from './sections/LandingFooter.jsx'

export default function Landing() {
  useEffect(() => {
    document.title = 'Ascend: Never miss the deadline that costs you the offer'
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="lp-root">
        <div className="lp-grain" />
        <div className="lp-content">
          <LandingNav />
          <Hero />
          <Problem />
          <HowItWorks />
          <Features />
          <FoundingCohort />
          <FAQ />
          <FinalCta />
          <LandingFooter />
        </div>
      </div>
    </MotionConfig>
  )
}
