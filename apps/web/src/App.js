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
    <main className="app-shell">
      <h1>frontend staging app</h1>
      <h1 className="app-title">{getTitle(health)}</h1>
      <p className="app-subtitle">
        Minimal frontend for backend health verification across environments.
      </p>

      <section className="health-card">
        <div className="health-title">API Health</div>
        <pre className="health-payload">
          {health ? JSON.stringify(health, null, 2) : '…'}
        </pre>
      </section>
    </main>
  );
}
