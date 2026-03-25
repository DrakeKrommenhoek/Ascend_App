const jwt = require('jsonwebtoken')
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

// In-memory rate limit: email → array of timestamps
// Resets on function cold start — acceptable for MVP (3 req/hr per email)
const rateLimitMap = new Map()

const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body || {}
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Rate limit check
  const now = Date.now()
  const attempts = (rateLimitMap.get(normalizedEmail) || []).filter(
    (t) => now - t < RATE_WINDOW_MS
  )
  if (attempts.length >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Try again in an hour.' })
  }
  rateLimitMap.set(normalizedEmail, [...attempts, now])

  // Generate magic link JWT (15 min expiry)
  const token = jwt.sign(
    { email: normalizedEmail, type: 'magic' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const appUrl = process.env.APP_URL || 'https://ascend-app-one.vercel.app'
  const link = `${appUrl}/api/auth/verify?token=${token}`
  const fromDomain = process.env.RESEND_FROM_DOMAIN || 'resend.dev'

  try {
    await resend.emails.send({
      from: `Ascend <noreply@${fromDomain}>`,
      to: normalizedEmail,
      subject: 'Your Ascend sign-in link',
      html: `
        <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="color: #0F1A3A; font-size: 24px; margin-bottom: 8px;">Sign in to Ascend</h1>
          <p style="color: #4A5568; margin-bottom: 32px;">Click the button below to sign in. This link expires in 15 minutes.</p>
          <a href="${link}" style="display: inline-block; background: #4A7FD4; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Sign in to Ascend</a>
          <p style="color: #A0AEC0; font-size: 13px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    })
  } catch (err) {
    // Never log the token or email credentials
    console.error('Resend error:', err.message)
    return res.status(500).json({ error: 'Failed to send email. Try again.' })
  }

  return res.status(200).json({ ok: true })
}
