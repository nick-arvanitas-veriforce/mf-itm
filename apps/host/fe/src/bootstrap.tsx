import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import { theme } from './theme'
import { initializeModuleFederationRuntime } from './moduleFederation/moduleFederationRuntime'

initializeModuleFederationRuntime()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provides the theme for the host AND every remote — remotes read it
        through the shared @mui/material + @emotion/react singletons. */}
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
