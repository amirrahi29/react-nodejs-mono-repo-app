const base = '/api';

export async function fetchHealth() {
  const r = await fetch(`${base}/health`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function fetchSecret() {
  const r = await fetch(`${base}/secret`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return { username: data.username ?? '', password: data.password ?? '' };
}
