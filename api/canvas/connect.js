'use strict';
const { verifyAuth } = require('../_lib/verify-auth');
const { adminDb } = require('../_lib/firebase-admin');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Firebase auth
  let decoded;
  try {
    decoded = await verifyAuth(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { uid } = decoded;

  // Parse request body
  const { baseUrl, apiToken } = req.body || {};
  if (!baseUrl || !apiToken) {
    return res.status(400).json({ error: 'Missing baseUrl or apiToken' });
  }

  // Normalize baseUrl: remove trailing slash
  const normalizedUrl = baseUrl.replace(/\/$/, '');

  // Validate token by calling Canvas API
  let canvasUser;
  try {
    const testRes = await fetch(`${normalizedUrl}/api/v1/users/self`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
    });
    if (!testRes.ok) {
      if (testRes.status === 401) {
        return res.status(400).json({ error: 'Invalid Canvas token. Please generate a new one.' });
      }
      return res.status(400).json({ error: `Canvas returned ${testRes.status}. Check your base URL.` });
    }
    canvasUser = await testRes.json();
  } catch (err) {
    console.error('Canvas validation error:', err.message);
    return res.status(400).json({ error: 'Could not reach Canvas. Check your base URL.' });
  }

  // Store in Firestore
  try {
    await adminDb
      .collection('users').doc(uid)
      .collection('integrations').doc('canvas')
      .set({
        baseUrl: normalizedUrl,
        apiToken,
        connectedAt: new Date(),
        canvasUserName: canvasUser.name || null,
      });
  } catch (err) {
    console.error('Failed to write Canvas token to Firestore:', err.message);
    return res.status(500).json({ error: 'Failed to save Canvas connection' });
  }

  res.json({ success: true, userName: canvasUser.name || null });
};
