const base = '/api';

export async function fetchHealth() {
  const r = await fetch(`${base}/health`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
