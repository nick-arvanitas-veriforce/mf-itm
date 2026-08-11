import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { theme } from './theme'

// STANDALONE ENTRY ONLY — not used when the host loads this remote over
// federation (that path starts at Widget.tsx, inside the host's ThemeProvider).
// The theme here is built from the same @alcumus/design-tokens options the host
// uses, so standalone dev matches production.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
