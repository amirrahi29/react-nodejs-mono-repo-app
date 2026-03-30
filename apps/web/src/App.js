import React, { useEffect, useState } from 'react';

const App = () => {
  const [health, setHealth] = useState(null);
  const [creds, setCreds] = useState(null);
  const [loadingCreds, setLoadingCreds] = useState(false);
  const [credsError, setCredsError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ error: 'unreachable' }));
  }, []);

  const getCredentials = () => {
    setLoadingCreds(true);
    setCredsError(null);
    setCreds(null);
    fetch('/api/secret')
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(data.error || `HTTP ${r.status}`);
        }
        return data;
      })
      .then((data) => {
        setCreds({
          username: data.username ?? '',
          password: data.password ?? '',
        });
      })
      .catch((e) => {
        setCredsError(e.message || 'Request failed');
      })
      .finally(() => setLoadingCreds(false));
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 480 }}>
      <h1 style={{ fontSize: 20, margin: '0 0 16px' }}>App</h1>

      <section style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Health</div>
        <pre style={{ margin: 0, padding: 12, background: '#f4f4f5', borderRadius: 8, fontSize: 13 }}>
          {health ? JSON.stringify(health, null, 2) : 'loading…'}
        </pre>
      </section>

      <section>
        <button
          type="button"
          onClick={getCredentials}
          disabled={loadingCreds}
          style={{
            padding: '10px 18px',
            fontSize: 15,
            fontWeight: 600,
            cursor: loadingCreds ? 'wait' : 'pointer',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background: loadingCreds ? '#93c5fd' : '#2563eb',
            color: '#fff',
          }}
        >
          {loadingCreds ? 'Loading…' : 'Get credentials'}
        </button>

        {credsError && (
          <p style={{ color: '#b91c1c', marginTop: 12 }} role="alert">
            {credsError}
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
};

export default App;
