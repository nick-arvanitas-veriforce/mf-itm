import Widget from './Widget'

// Standalone shell so the remote can run on its own during development.
// The host does NOT use this — it loads <Widget /> directly over federation.
export default function App() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Employee Management (standalone)</h1>
      <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#888' }}>
        em app version: {import.meta.env.VITE_APP_VERSION ?? 'dev'}
      </p>
      <p>Running Employee Management on its own dev server. The host loads the widget below remotely.</p>
      <Widget greeting="Hello from the standalone EM" />
    </main>
  )
}
