import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Unified event shape returned by this hook:
 * {
 *   id: string,
 *   title: string,
 *   start: ISO8601 string or null,
 *   end: ISO8601 string or null,
 *   source: 'google' | 'microsoft' | 'canvas',
 *   category: 'academic' | 'personal' | 'recruiting' | null,
 *   isDeadline: boolean,
 *   url: string | null,
 *   courseName: string | null,   // Canvas only
 * }
 */
export function useCalendarEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ google: null, microsoft: null, canvas: null });
  const [connected, setConnected] = useState({ google: false, microsoft: false, canvas: false });

  const fetchEvents = useCallback(async (isMounted = true) => {
    if (!user) return;

    setLoading(true);

    // Get fresh Firebase ID token
    let idToken;
    try {
      idToken = await user.getIdToken();
    } catch (err) {
      console.error('Failed to get ID token:', err.message);
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${idToken}` };

    // Fetch from all three sources in parallel
    const [googleResult, microsoftResult, canvasResult] = await Promise.allSettled([
      fetch('/api/calendar/google-events', { headers }).then((r) => r.json()),
      fetch('/api/calendar/microsoft-events', { headers }).then((r) => r.json()),
      fetch('/api/calendar/canvas-assignments', { headers }).then((r) => r.json()),
    ]);

    const allEvents = [];
    const newErrors = { google: null, microsoft: null, canvas: null };
    const newConnected = { google: false, microsoft: false, canvas: false };

    if (googleResult.status === 'fulfilled') {
      const data = googleResult.value;
      newConnected.google = data.connected ?? false;
      if (data.events) allEvents.push(...data.events);
      if (data.error) newErrors.google = data.error;
    } else {
      newErrors.google = 'Failed to fetch Google Calendar';
    }

    if (microsoftResult.status === 'fulfilled') {
      const data = microsoftResult.value;
      newConnected.microsoft = data.connected ?? false;
      if (data.events) allEvents.push(...data.events);
      if (data.error) newErrors.microsoft = data.error;
    } else {
      newErrors.microsoft = 'Failed to fetch Outlook Calendar';
    }

    if (canvasResult.status === 'fulfilled') {
      const data = canvasResult.value;
      newConnected.canvas = data.connected ?? false;
      if (data.events) allEvents.push(...data.events);
      if (data.error) newErrors.canvas = data.error;
    } else {
      newErrors.canvas = 'Failed to fetch Canvas assignments';
    }

    // Sort by start date (nulls go to end)
    allEvents.sort((a, b) => {
      if (!a.start) return 1;
      if (!b.start) return -1;
      return new Date(a.start) - new Date(b.start);
    });

    if (!isMounted) return;
    setEvents(allEvents);
    setErrors(newErrors);
    setConnected(newConnected);
    setLoading(false);
  }, [user]);

  // Auto-fetch when user changes
  useEffect(() => {
    if (user) {
      let isMounted = true;
      fetchEvents(isMounted);
      return () => { isMounted = false; };
    } else {
      setEvents([]);
      setLoading(false);
      setErrors({ google: null, microsoft: null, canvas: null });
      setConnected({ google: false, microsoft: false, canvas: false });
    }
  }, [user, fetchEvents]);

  return { events, loading, errors, connected, refetch: fetchEvents };
}
