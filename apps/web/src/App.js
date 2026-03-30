import React, { useEffect, useState } from 'react';
import { fetchHealth, fetchSecret } from './api';

export default function App() {
  const [health, setHealth] = useState(null);
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ error: 'unreachable' }));
  }, []);

  const loadCreds = () => {
    setLoading(true);
    setErr(null);
    setCreds(null);
    fetchSecret()
      .then(setCreds)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 480 }}>
      <h1 style={{ fontSize: 20, margin: '0 0 16px' }}>Frontend Dev Branch App</h1>

      <section style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Health</div>
        <pre style={{ margin: 0, padding: 12, background: '#f4f4f5', borderRadius: 8, fontSize: 13 }}>
          {health ? JSON.stringify(health, null, 2) : '…'}
        </pre>
      </section>

      <section>
        <button
          type="button"
          onClick={loadCreds}
          disabled={loading}
          style={{
            padding: '10px 18px',
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff',
          }}
        >
          {loading ? 'Loading…' : 'Get credentials'}
        </button>
        {err && (
          <p style={{ color: '#b91c1c', marginTop: 12 }} role="alert">
            {err}
          </p>
        )}
        {creds && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              background: '#f4f4f5',
              borderRadius: 8,
              border: '1px solid #e4e4e7',
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 600, color: '#52525b' }}>Username</span>
              <div style={{ marginTop: 4, wordBreak: 'break-all' }}>{creds.username || '(empty)'}</div>
            </div>
            <div>
              <span style={{ fontWeight: 600, color: '#52525b' }}>Password</span>
              <div style={{ marginTop: 4, wordBreak: 'break-all' }}>{creds.password || '(empty)'}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
