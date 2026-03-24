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
    .collection('integrations').doc('microsoft');

  let doc;
  try {
    doc = await integrationRef.get();
  } catch (err) {
    console.error('Failed to read Microsoft integration from Firestore:', err.message);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
  if (!doc.exists) {
    return res.json({ events: [], connected: false });
  }

  const integration = doc.data();

  // Get a valid access token (refreshes if expired)
  let accessToken;
  try {
    accessToken = await getValidAccessToken(uid, 'microsoft', integration);
  } catch (err) {
    console.error('Failed to get valid Microsoft access token:', err.message);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }

  // Fetch events from Microsoft Graph calendarView API (next 30 days)
  const now = new Date().toISOString();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let calendarRes;
  try {
    calendarRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?` +
      new URLSearchParams({
        startDateTime: now,
        endDateTime: thirtyDaysFromNow,
        $select: 'id,subject,start,end,webLink',
        $orderby: 'start/dateTime',
        $top: '100',
      }),
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  } catch (err) {
    console.error('Microsoft Graph API network error:', err.message);
    return res.status(500).json({ error: 'Failed to reach Microsoft Graph API' });
  }

  if (!calendarRes.ok) {
    if (calendarRes.status === 401) {
      // Token was revoked or expired beyond refresh — prompt user to reconnect
      return res.status(200).json({ events: [], connected: false, reconnectRequired: true });
    }
    const errText = await calendarRes.text();
    console.error('Microsoft Graph API error:', calendarRes.status, errText.substring(0, 200));
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }

  const data = await calendarRes.json();

  // Transform to unified event format
  const events = (data.value || []).map((item) => ({
    id: `microsoft_${item.id}`,
    title: item.subject || '(No title)',
    start: item.start?.dateTime || null,
    end: item.end?.dateTime || null,
    source: 'microsoft',
    category: null,
    isDeadline: false,
    url: item.webLink || null,
  }));

  res.json({ events, connected: true });
};
