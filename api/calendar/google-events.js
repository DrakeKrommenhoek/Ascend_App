const { adminDb } = require('../_lib/firebase-admin');
const { verifyAuth } = require('../_lib/verify-auth');
const { getValidAccessToken } = require('../_lib/token-refresh');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let decoded;
  try {
    decoded = await verifyAuth(req);
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { uid } = decoded;

  // Read integration from Firestore
  const integrationRef = adminDb
    .collection('users').doc(uid)
    .collection('integrations').doc('google');

  const doc = await integrationRef.get();
  if (!doc.exists) {
    return res.json({ events: [], connected: false });
  }

  const integration = doc.data();

  // Get a valid access token (refreshes if expired)
  let accessToken;
  try {
    accessToken = await getValidAccessToken(uid, 'google', integration);
  } catch (err) {
    console.error('Failed to get valid Google access token:', err.message);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }

  // Fetch events from Google Calendar API (next 30 days)
  const now = new Date().toISOString();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const calendarRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    new URLSearchParams({
      timeMin: now,
      timeMax: thirtyDaysFromNow,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!calendarRes.ok) {
    const errText = await calendarRes.text();
    console.error('Google Calendar API error:', calendarRes.status, errText.substring(0, 200));
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }

  const calendarData = await calendarRes.json();

  // Transform to unified event format
  const events = (calendarData.items || []).map((item) => ({
    id: `google_${item.id}`,
    title: item.summary || '(No title)',
    start: item.start?.dateTime || item.start?.date || null,
    end: item.end?.dateTime || item.end?.date || null,
    source: 'google',
    category: null,
    isDeadline: false,
    url: item.htmlLink || null,
  }));

  res.json({ events, connected: true });
};
