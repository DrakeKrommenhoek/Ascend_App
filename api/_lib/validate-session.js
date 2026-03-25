const jwt = require('jsonwebtoken')
const kv = require('./kv')
const { decrypt } = require('./crypto')

/**
 * Reads the httpOnly session cookie, verifies the JWT,
 * and returns the decrypted user object from KV.
 *
 * Throws an error with .status = 401 if:
 *   - No session cookie is present
 *   - JWT is invalid or expired
 *   - User not found in KV
 */
async function validateSession(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  if (!match) {
    const err = new Error('No session cookie')
    err.status = 401
    throw err
  }

  let payload
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET)
  } catch {
    const err = new Error('Invalid or expired session')
    err.status = 401
    throw err
  }

  const raw = await kv.get(`users:${payload.email}`)
  if (!raw) {
    const err = new Error('User not found')
    err.status = 401
    throw err
  }

  return JSON.parse(decrypt(raw))
}

module.exports = validateSession
