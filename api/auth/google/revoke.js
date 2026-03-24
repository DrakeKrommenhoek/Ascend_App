const { adminDb } = require('../../_lib/firebase-admin');
const { verifyAuth } = require('../../_lib/verify-auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let decoded;
  try {
    decoded = await verifyAuth(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { uid } = decoded;

  // Read token from Firestore
  const integrationRef = adminDb
    .collection('users').doc(uid)
    .collection('integrations').doc('google');

  const doc = await integrationRef.get();
  if (doc.exists) {
    const { accessToken } = doc.data();

    // Revoke with Google (best effort — continue even if revocation fails)
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Google token revocation failed:', err.message);
    }

    // Delete from Firestore
    await integrationRef.delete();
  }

  res.json({ success: true });
};
