'use strict';
const { verifyAuth } = require('../_lib/verify-auth');
const { adminDb } = require('../_lib/firebase-admin');

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

  try {
    await adminDb
      .collection('users').doc(uid)
      .collection('integrations').doc('canvas')
      .delete();
  } catch (err) {
    console.error('Failed to delete Canvas integration:', err.message);
    return res.status(500).json({ error: 'Failed to disconnect' });
  }

  res.json({ success: true });
};
