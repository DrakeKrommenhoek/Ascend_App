const jwt = require('jsonwebtoken')
const kv = require('../_lib/kv')
const { encrypt, decrypt } = require('../_lib/crypto')

module.exports = async (req, res) => {
  const { token } = req.query
  if (!token) {
    return res.status(400).send('Missing token. Please request a new sign-in link.')
  }

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res
      .status(400)
      .send('This sign-in link has expired or is invalid. Please request a new one.')
  }

  if (payload.type !== 'magic') {
    return res.status(400).send('Invalid token type.')
  }

  const { email } = payload
  const kvKey = `users:${email}`

  let user
  const existing = await kv.get(kvKey)

  if (existing) {
    user = JSON.parse(decrypt(existing))
    user.lastLoginAt = new Date().toISOString()
  } else {
    user = {
      email,
      tier: 'free',
      archetype: null,
      humorStyle: null,
      featurePrefs: {
        recruitingFocus: true,
        dailyCheckIns: true,
        weeklyReport: true,
      },
      isPremiumTheme: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
  }

  await kv.set(kvKey, encrypt(JSON.stringify(user)))

  const sessionToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.setHeader(
    'Set-Cookie',
    `session=${sessionToken}; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=604800`
  )

  const appUrl = process.env.APP_URL || 'https://ascend-app-one.vercel.app'
  return res.redirect(302, `${appUrl}/dashboard`)
}
