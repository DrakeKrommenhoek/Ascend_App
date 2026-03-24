import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Subscribes to the user's integrations subcollection in Firestore.
 * Returns { google, microsoft, canvas } — each is either null (not connected)
 * or an object with at least { connectedAt }.
 * Also returns { loading } while the first snapshot loads.
 */
export function useIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState({ google: null, microsoft: null, canvas: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIntegrations({ google: null, microsoft: null, canvas: null });
      setLoading(false);
      return;
    }

    const integrationsRef = collection(db, 'users', user.uid, 'integrations');

    const unsubscribe = onSnapshot(
      integrationsRef,
      (snapshot) => {
        const data = { google: null, microsoft: null, canvas: null };
        snapshot.forEach((doc) => {
          const id = doc.id; // 'google', 'microsoft', or 'canvas'
          if (id in data) {
            // Return minimal status info — NOT the raw tokens
            const docData = doc.data();
            data[id] = {
              connectedAt: docData.connectedAt,
              // For Canvas: include canvasUserName
              ...(id === 'canvas' ? { canvasUserName: docData.canvasUserName } : {}),
            };
          }
        });
        setIntegrations(data);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to subscribe to integrations:', err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { integrations, loading };
}
