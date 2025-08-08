"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error?.message || String(error)}</pre>
      <button onClick={() => reset?.()}>Try again</button>
    </div>
  );
} 