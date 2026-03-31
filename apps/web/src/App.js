import React, { useEffect, useState } from 'react';
import { fetchHealth } from './api';

function getTitle(health) {
  if (!health || health.error) return 'Chat App';
  const env = health.env ? String(health.env).toUpperCase() : 'APP';
  return `Chat App | ${env}`;
}

export default function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => setHealth({ error: 'unreachable' }));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, margin: '0 0 16px' }}>{getTitle(health)}</h1>
      <p style={{ margin: '0 0 24px', color: '#52525b' }}>
        Minimal frontend for backend health verification across environments.
      </p>

      <section style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>API Health</div>
        <pre style={{ margin: 0, padding: 16, background: '#f4f4f5', borderRadius: 8, fontSize: 13 }}>
          {health ? JSON.stringify(health, null, 2) : '…'}
        </pre>
      </section>
    </div>
  );
}
