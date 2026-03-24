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

  // Delete Microsoft integration from Firestore.
  // Microsoft has no public token revocation endpoint — the access token
  // will expire naturally. Removing the Firestore doc is sufficient to
  // disconnect the integration from this app.
  const integrationRef = adminDb
    .collection('users').doc(uid)
    .collection('integrations').doc('microsoft');

  const doc = await integrationRef.get();
  if (doc.exists) {
    await integrationRef.delete();
  }

  res.json({ success: true });
};
