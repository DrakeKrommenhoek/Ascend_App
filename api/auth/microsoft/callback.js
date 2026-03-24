const { adminDb } = require('../../_lib/firebase-admin');

module.exports = async (req, res) => {
  const { code, state: returnedState, error } = req.query;

  // Handle user denying consent
  if (error) {
    return res.redirect(302, `/settings?error=microsoft_denied`);
  }

  if (!code || !returnedState) {
    return res.redirect(302, `/settings?error=microsoft_invalid`);
  }

  // Parse cookie to get state and uid
  const cookies = parseCookies(req.headers.cookie || '');
  const cookieValue = cookies['microsoft_oauth_state'];
  if (!cookieValue) {
    return res.redirect(302, `/settings?error=microsoft_state_missing`);
  }

  const colonIndex = cookieValue.indexOf(':');
  if (colonIndex === -1) {
    return res.redirect(302, `/settings?error=microsoft_state_missing`);
  }
  const storedState = cookieValue.substring(0, colonIndex);
  const uid = cookieValue.substring(colonIndex + 1);

  // Verify state to prevent CSRF
  if (returnedState !== storedState) {
    return res.redirect(302, `/settings?error=microsoft_csrf`);
  }

  // Exchange authorization code for tokens
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
  let tokenData;
  try {
    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
        grant_type: 'authorization_code',
        scope: 'Calendars.Read offline_access',
      }),
    });
    if (!tokenRes.ok) {
      console.error('Microsoft token exchange failed:', tokenRes.status);
      return res.redirect(302, `/settings?error=microsoft_token_exchange`);
    }
    tokenData = await tokenRes.json();
  } catch (err) {
    console.error('Microsoft token exchange error:', err.message);
    return res.redirect(302, `/settings?error=microsoft_token_exchange`);
  }

  const { access_token, refresh_token, expires_in } = tokenData;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  // Write tokens to Firestore (server-side write — never reaches client)
  try {
    await adminDb
      .collection('users').doc(uid)
      .collection('integrations').doc('microsoft')
      .set({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope: 'Calendars.Read offline_access',
        connectedAt: new Date(),
      });
  } catch (err) {
    console.error('Failed to write Microsoft tokens to Firestore:', err.message);
    return res.redirect(302, `/settings?error=microsoft_firestore`);
  }

  // Clear the state cookie
  res.setHeader('Set-Cookie', 'microsoft_oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');

  // Redirect back to settings with success indicator
  res.redirect(302, `/settings?connected=microsoft`);
};

function parseCookies(cookieHeader) {
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...val] = cookie.trim().split('=');
    acc[key] = val.join('=');
    return acc;
  }, {});
}
