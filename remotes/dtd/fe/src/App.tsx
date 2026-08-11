import Widget from './Widget'

// Standalone shell so the remote can run on its own during development.
// The host does NOT use this — it loads <Widget /> directly over federation.
// The ThemeProvider/CssBaseline for this path live in bootstrap.tsx.
export default function App() {
  return <Widget />
}
