'use strict';
const { verifyAuth } = require('../_lib/verify-auth');
const { adminDb } = require('../_lib/firebase-admin');

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

  // Read Canvas integration from Firestore
  let doc;
  try {
    doc = await adminDb
      .collection('users').doc(uid)
      .collection('integrations').doc('canvas')
      .get();
  } catch (err) {
    console.error('Failed to read Canvas integration:', err.message);
    return res.status(500).json({ error: 'Failed to fetch assignments' });
  }

  if (!doc.exists) {
    return res.json({ events: [], connected: false });
  }

  const { baseUrl, apiToken } = doc.data();

  // Fetch planner items (upcoming assignments)
  const now = new Date();
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Canvas date format: YYYY-MM-DD
  const startDate = now.toISOString().split('T')[0];
  const endDate = thirtyDaysFromNow.toISOString().split('T')[0];

  let plannerData;
  try {
    const plannerRes = await fetch(
      `${baseUrl}/api/v1/planner/items?` +
      new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        per_page: '50',
      }),
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!plannerRes.ok) {
      if (plannerRes.status === 401) {
        // Token expired or revoked
        return res.json({ events: [], connected: false, reconnectRequired: true });
      }
      const errText = await plannerRes.text();
      console.error('Canvas planner error:', plannerRes.status, errText.substring(0, 200));
      return res.status(500).json({ error: 'Failed to fetch Canvas assignments' });
    }

    plannerData = await plannerRes.json();
  } catch (err) {
    console.error('Canvas planner network error:', err.message);
    return res.status(500).json({ error: 'Failed to reach Canvas' });
  }

  // Transform to unified event format
  // Canvas planner items have plannable_type: 'assignment', 'quiz', 'discussion_topic', etc.
  const events = (Array.isArray(plannerData) ? plannerData : [])
    .filter((item) => item.plannable_date) // must have a due date
    .map((item) => {
      const plannable = item.plannable || {};
      const title = plannable.title || plannable.name || item.plannable_type || 'Assignment';
      const dueAt = item.plannable_date;

      return {
        id: `canvas_${item.plannable_id || [item.plannable_type, item.course_id, item.plannable_date].filter(Boolean).join('_')}`,
        title,
        start: dueAt,
        end: dueAt, // Canvas assignments are point-in-time
        source: 'canvas',
        category: 'academic',
        isDeadline: true,
        url: plannable.html_url || null,
        courseName: item.context_name || null,
      };
    });

  res.json({ events, connected: true });
};
