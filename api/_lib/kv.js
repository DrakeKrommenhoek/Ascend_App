const { createClient } = require('@vercel/kv')

// KV key conventions:
//   users:{email}              — encrypted user object (JSON string)
//   ratelimit:sendlink:{email} — array of ISO timestamp strings

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

module.exports = kv
