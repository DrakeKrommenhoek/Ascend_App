const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
let initialized = false

export function initAnalytics() {
  if (initialized) return
  if (!GA_ID || !import.meta.env.PROD) {
    if (import.meta.env.DEV) console.debug('[analytics] GA disabled (dev or no VITE_GA_MEASUREMENT_ID)')
    return
  }
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { send_page_view: false })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)
  initialized = true
}

export function track(name, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  } else if (import.meta.env.DEV) {
    console.debug('[analytics]', name, params)
  }
}

export function trackPageView(path) {
  track('page_view', { page_path: path, page_location: window.location.href, page_title: document.title })
}

function readPersisted(storageKey, read) {
  try {
    const fresh = read(new URLSearchParams(window.location.search))
    if (fresh) { sessionStorage.setItem(storageKey, JSON.stringify(fresh)); return fresh }
    const saved = sessionStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function getUtm() {
  const utm = readPersisted('ascend_utm', (p) => {
    const v = { source: p.get('utm_source') || '', medium: p.get('utm_medium') || '', campaign: p.get('utm_campaign') || '' }
    return v.source || v.medium || v.campaign ? v : null
  })
  return utm || { source: '', medium: '', campaign: '' }
}

export function getRef() {
  const ref = readPersisted('ascend_ref', (p) => {
    const raw = (p.get('ref') || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)
    return raw || null
  })
  return typeof ref === 'string' ? ref : ''
}
