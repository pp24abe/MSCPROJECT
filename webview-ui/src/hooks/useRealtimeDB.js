// src/hooks/useRealtimeDB.js
import { useEffect, useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

/**
 * Reinitializes a named Firebase app whenever apiKey or databaseURL changes.
 * Ensures old app is deleted cleanly to avoid stale connections/listeners.
 */
export function useRealtimeDB({ apiKey, databaseURL }) {
  const [rtDB, setRtDB] = useState(null);
  const APP_NAME = 'FormCraftDB';
  const prevKeyRef = useRef('');

  useEffect(() => {
    const key = `${apiKey || ''}|${databaseURL || ''}`;

    // If creds are missing, tear down any existing app and clear DB
    if (!apiKey || !databaseURL) {
      try {
        const existing = firebase.apps.find(a => a.name === APP_NAME);
        if (existing?.delete) {
          existing.delete().catch(() => {});
        }
      } catch {}
      setRtDB(null);
      prevKeyRef.current = key;
      return;
    }

    // If creds changed, delete old app (if any) and init a new one
    const credsChanged = prevKeyRef.current !== key;
    const init = async () => {
      try {
        const existing = firebase.apps.find(a => a.name === APP_NAME);
        if (existing) {
          const opts = existing.options || {};
          const same =
            opts.apiKey === apiKey &&
            // databaseURL lives directly on options for compat
            (opts.databaseURL === databaseURL ||
              // some envs may store it under options.databaseURL or options.databaseURL from config object
              opts['databaseURL'] === databaseURL);

          if (!same && existing.delete) {
            await existing.delete().catch(() => {});
          }
        }

        let app = firebase.apps.find(a => a.name === APP_NAME);
        if (!app) {
          app = firebase.initializeApp({ apiKey, databaseURL }, APP_NAME);
        }
        setRtDB(app.database());
      } catch (e) {
        console.error('Firebase init error:', e);
        setRtDB(null);
      } finally {
        prevKeyRef.current = key;
      }
    };

    // Only (re)init when creds changed
    if (credsChanged) {
      init();
    } else {
      // First mount or same creds but no db set
      const app = firebase.apps.find(a => a.name === APP_NAME);
      setRtDB(app ? app.database() : null);
    }
  }, [apiKey, databaseURL]);

  return rtDB;
}
