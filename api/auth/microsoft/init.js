const { randomBytes } = require('crypto');
const { adminAuth } = require('../../_lib/firebase-admin');

module.exports = async (req, res) => {
  // 1. Get idToken from query param
  const { idToken } = req.query;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing idToken' });
  }

  // 2. Verify Firebase ID token to get uid
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: 'Invalid ID token' });
  }
  const uid = decoded.uid;

  // 3. Generate random state value
  const state = randomBytes(16).toString('hex');

  // 4. Store state+uid in a short-lived HttpOnly cookie
  const cookieValue = `${state}:${uid}`;
  res.setHeader('Set-Cookie', `microsoft_oauth_state=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);

  // 5. Build Microsoft OAuth URL
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    scope: 'Calendars.Read offline_access',
    response_type: 'code',
    state,
  });

  // 6. Redirect to Microsoft
  res.redirect(302, `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`);
};
