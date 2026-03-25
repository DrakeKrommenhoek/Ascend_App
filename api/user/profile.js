const validateSession = require('../_lib/validate-session')
const kv = require('../_lib/kv')
const { encrypt } = require('../_lib/crypto')

const ALLOWED_FIELDS = ['archetype', 'humorStyle', 'featurePrefs', 'isPremiumTheme']

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).end()

  try {
    const user = await validateSession(req)
    const updates = req.body || {}

    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) {
        user[field] = updates[field]
      }
    }

    await kv.set(`users:${user.email}`, encrypt(JSON.stringify(user)))
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message })
  }
}
