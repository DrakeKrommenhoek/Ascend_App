const { adminDb } = require('../../_lib/firebase-admin');

module.exports = async (req, res) => {
  const { code, state: returnedState, error } = req.query;

  // Handle user denying consent
  if (error) {
    return res.redirect(302, `/settings?error=google_denied`);
  }

  if (!code || !returnedState) {
    return res.redirect(302, `/settings?error=google_invalid`);
  }

  // Parse cookie to get state and uid
  const cookies = parseCookies(req.headers.cookie || '');
  const cookieValue = cookies['google_oauth_state'];
  if (!cookieValue) {
    return res.redirect(302, `/settings?error=google_state_missing`);
  }

  const colonIndex = cookieValue.indexOf(':');
  if (colonIndex === -1) {
    return res.redirect(302, `/settings?error=google_state_missing`);
  }
  const storedState = cookieValue.substring(0, colonIndex);
  const uid = cookieValue.substring(colonIndex + 1);

  // Verify state to prevent CSRF
  if (returnedState !== storedState) {
    return res.redirect(302, `/settings?error=google_csrf`);
  }

  // Exchange authorization code for tokens
  let tokenData;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', tokenRes.status);
      return res.redirect(302, `/settings?error=google_token_exchange`);
    }
    tokenData = await tokenRes.json();
  } catch (err) {
    console.error('Google token exchange error:', err.message);
    return res.redirect(302, `/settings?error=google_token_exchange`);
  }

  const { access_token, refresh_token, expires_in } = tokenData;
  const expiresAt = new Date(Date.now() + expires_in * 1000);

  // Write tokens to Firestore (server-side write — never reaches client)
  try {
    await adminDb
      .collection('users').doc(uid)
      .collection('integrations').doc('google')
      .set({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        connectedAt: new Date(),
      });
  } catch (err) {
    console.error('Failed to write Google tokens to Firestore:', err.message);
    return res.redirect(302, `/settings?error=google_firestore`);
  }

  // Clear the state cookie
  res.setHeader('Set-Cookie', 'google_oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');

  // Redirect back to settings with success indicator
  res.redirect(302, `/settings?connected=google`);
};

function parseCookies(cookieHeader) {
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, ...val] = cookie.trim().split('=');
    acc[key] = val.join('=');
    return acc;
  }, {});
}
