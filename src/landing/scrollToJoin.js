import { track } from '../lib/analytics.js'

// Shared behavior for every "Join the waitlist" nav/secondary button:
// scroll to the hero form (#join) and report which button was pressed.
export function scrollToJoin(ctaId, location) {
  track('cta_click', { cta_id: ctaId, location })
  const el = document.getElementById('join')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
