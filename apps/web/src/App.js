import React, { useEffect, useState } from 'react';

const App = () => {
  const [api, setApi] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setApi)
      .catch(() => setApi({ error: 'unreachable' }));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div>App amir web react js</div>
      <pre style={{ marginTop: 12 }}>{api ? JSON.stringify(api, null, 2) : 'loading…'}</pre>
    </div>
  );
};

export default App;
