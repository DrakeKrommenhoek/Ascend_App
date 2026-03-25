const validateSession = require('../_lib/validate-session')

module.exports = async (req, res) => {
  try {
    const user = await validateSession(req)

    // Return only the safe subset — never include raw tokens or secrets
    return res.status(200).json({
      email: user.email,
      tier: user.tier,
      archetype: user.archetype,
      humorStyle: user.humorStyle,
      featurePrefs: user.featurePrefs,
      isPremiumTheme: user.isPremiumTheme,
    })
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message })
  }
}
