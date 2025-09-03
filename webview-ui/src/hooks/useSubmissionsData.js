import { useEffect, useState, useCallback } from 'react';

export function useSubmissionsData({ integrationConfig, rtDB }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fbPath = (integrationConfig?.firebase && integrationConfig.firebase.path) || 'submissions';

  useEffect(() => {
    setError('');
    setLoading(true);
    setSubmissions([]);

    const type = integrationConfig?.type;

    if (type === 'firebase') {
      if (!rtDB) {
        setLoading(false);
        return;
      }
      const ref = rtDB.ref(fbPath);
      const handle = ref.on(
        'value',
        snap => {
          const data = snap.val() || {};
          const arr = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setSubmissions(arr);
          setLoading(false);
        },
        err => {
          setError(err?.message || 'Firebase read error');
          setLoading(false);
        }
      );
      return () => ref.off('value', handle);
    }

    if (type === 'mongodb') {
      const cfg = integrationConfig?.mongodb || {};
      if (!cfg.uri || !cfg.database || !cfg.collection) {
        setLoading(false);
        return;
      }
      const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4001';
      const url = `${base}/submissions?uri=${encodeURIComponent(cfg.uri)}&database=${cfg.database}&collection=${cfg.collection}`;
      fetch(url)
        .then(r => r.json())
        .then(data => {
          const arr = Array.isArray(data) ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
          setSubmissions(arr);
          setLoading(false);
        })
        .catch(e => {
          setError(e?.message || 'MongoDB fetch error');
          setLoading(false);
        });
      return;
    }

    setLoading(false);
  }, [integrationConfig, rtDB, fbPath]);

  const pushSubmission = useCallback(async (record) => {
    const type = integrationConfig?.type;
    try {
      if (type === 'firebase') {
        if (!rtDB) throw new Error('Firebase not configured');
        await rtDB.ref(fbPath).push(record);
        return true;
      }
      if (type === 'mongodb') {
        const cfg = integrationConfig?.mongodb || {};
        if (!cfg.uri || !cfg.database || !cfg.collection) throw new Error('MongoDB not configured');
        const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4001';
        const url = `${base}/api/submit/mongodb`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record, _config: cfg }),
        });
        setSubmissions(s => [record, ...s]);
        return true;
      }
      setSubmissions(s => [record, ...s]);
      return true;
    } catch (e) {
      setError(e?.message || 'Failed to push submission');
      setSubmissions(s => [record, ...s]);
      return false;
    }
  }, [integrationConfig, rtDB, fbPath]);

  return { submissions, setSubmissions, pushSubmission, loading, error };
}
