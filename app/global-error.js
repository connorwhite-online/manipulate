"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Application Error</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error?.message || String(error)}</pre>
      <button onClick={() => reset?.()}>Reload</button>
    </div>
  );
} 