const crypto = require('crypto')

const TRACKS = ['Investment Banking', 'Consulting', 'Private Equity', 'Tech', 'Other']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function normalizeEmail(raw) {
  if (typeof raw !== 'string') return null
  const email = raw.trim().toLowerCase()
  if (email.length > 254 || !EMAIL_RE.test(email)) return null
  return email
}

function subscriberHash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}

function refCodeFor(email, salt) {
  const hex = crypto.createHash('sha256').update(email + salt).digest('hex')
  return BigInt('0x' + hex.slice(0, 16)).toString(36).padStart(8, '0').slice(0, 8)
}

function sanitizeRef(ref) {
  if (typeof ref !== 'string') return ''
  return ref.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)
}

function clip(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function buildMergeFields({ refCode, ref, utm, profile }) {
  const fields = {
    REFCODE: refCode,
    REFBY: sanitizeRef(ref),
    USOURCE: clip(utm && utm.source, 50),
    UMEDIUM: clip(utm && utm.medium, 50),
    UCAMPAIGN: clip(utm && utm.campaign, 50),
  }
  if (profile && typeof profile === 'object') {
    fields.SCHOOL = clip(profile.school, 100)
    const year = Number(profile.gradYear)
    fields.GRADYR = Number.isInteger(year) && year >= 2026 && year <= 2031 ? String(year) : ''
    fields.TRACK = TRACKS.includes(profile.track) ? profile.track : ''
  }
  for (const key of Object.keys(fields)) if (!fields[key]) delete fields[key]
  return fields
}

function getConfig(env = process.env) {
  const config = {
    apiKey: env.MAILCHIMP_API_KEY,
    dc: env.MAILCHIMP_SERVER_PREFIX,
    audienceId: env.MAILCHIMP_AUDIENCE_ID,
  }
  const missing = [
    ['MAILCHIMP_API_KEY', config.apiKey],
    ['MAILCHIMP_SERVER_PREFIX', config.dc],
    ['MAILCHIMP_AUDIENCE_ID', config.audienceId],
  ].filter(([, v]) => !v).map(([k]) => k)
  return { ...config, missing }
}

async function mailchimpRequest(config, method, path, body) {
  const res = await fetch(`https://${config.dc}.api.mailchimp.com/3.0${path}`, {
    method,
    headers: {
      Authorization: 'Basic ' + Buffer.from(`anystring:${config.apiKey}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = {}
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

module.exports = {
  TRACKS, normalizeEmail, subscriberHash, refCodeFor, sanitizeRef, buildMergeFields, getConfig, mailchimpRequest,
}
