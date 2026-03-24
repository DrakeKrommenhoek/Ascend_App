const { adminDb } = require('./firebase-admin.js');

/**
 * Checks if an OAuth integration's access token is expired or expires within 5 minutes.
 * If so, refreshes using the provider's token endpoint and updates Firestore.
 *
 * @param {string} uid - Firebase user UID
 * @param {'google' | 'microsoft'} provider - Integration provider
 * @param {object} integration - Current integration doc from Firestore
 * @returns {string} - Valid access token (refreshed if necessary)
 */
async function getValidAccessToken(uid, provider, integration) {
  const { accessToken, refreshToken, expiresAt } = integration;

  // Check if token expires within 5 minutes
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  const expiresAtMs = expiresAt?.toMillis ? expiresAt.toMillis() : expiresAt;

  if (expiresAtMs > fiveMinutesFromNow) {
    return accessToken; // Token is still valid
  }

  // Token is expired or expiring soon — refresh it
  let tokenEndpoint, params;

  if (provider === 'google') {
    tokenEndpoint = 'https://oauth2.googleapis.com/token';
    params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
  } else if (provider === 'microsoft') {
    const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
    tokenEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'Calendars.Read offline_access',
    });
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed for ${provider}: ${error}`);
  }

  const data = await response.json();
  const newAccessToken = data.access_token;
  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000);

  // Update Firestore with the new token
  const integrationRef = adminDb
    .collection('users')
    .doc(uid)
    .collection('integrations')
    .doc(provider);

  await integrationRef.update({
    accessToken: newAccessToken,
    expiresAt: newExpiresAt,
    // Only update refreshToken if a new one was provided (Google sometimes does, Microsoft usually doesn't)
    ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
  });

  return newAccessToken;
}

module.exports = { getValidAccessToken };
