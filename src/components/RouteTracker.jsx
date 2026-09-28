import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics.js'

export default function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
  return null
}
