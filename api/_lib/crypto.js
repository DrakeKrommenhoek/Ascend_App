const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret || secret.length !== 64) {
    throw new Error('ENCRYPTION_SECRET must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(secret, 'hex')
}

/**
 * Encrypt plaintext string.
 * Returns "ivHex:authTagHex:ciphertextHex"
 * A fresh random 12-byte IV is generated per call — never reuse IVs with GCM.
 */
function encrypt(plaintext) {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt a payload produced by encrypt().
 * Throws on tampered or invalid ciphertext (GCM auth tag verification).
 */
function decrypt(payload) {
  const key = getKey()
  const [ivHex, tagHex, encHex] = payload.split(':')
  if (!ivHex || !tagHex || !encHex) throw new Error('Invalid encrypted payload format')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

module.exports = { encrypt, decrypt }
