const { adminAuth } = require('./firebase-admin.js');

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the decoded token ({ uid, email, ... }) or throws an error.
 */
async function verifyAuth(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }
  const idToken = authHeader.split('Bearer ')[1];
  const decoded = await adminAuth.verifyIdToken(idToken);
  return decoded; // decoded.uid is the Firebase UID
}

module.exports = { verifyAuth };
