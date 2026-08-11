import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// The host loads its remotes cross-origin from absolute URLs that Vite inlines
// at BUILD time (see src/moduleFederation/mfeUrls.ts). A production build with
// these unset would otherwise ship a bundle that fails in the browser, so fail
// the build here instead — a broken deploy should never reach Render.
const assertRemoteOriginsConfigured = (mode: string) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const missing = ['VITE_EM_URL', 'VITE_DTD_URL'].filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(
      `Host production build requires ${missing.join(' and ')}. ` +
        `Set each to the corresponding remote's public origin, e.g. ` +
        `VITE_EM_URL=https://mf-itm-em.onrender.com`,
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Dev falls back to the remotes' localhost dev servers, so only a real build
  // needs the explicit origins.
  if (command === 'build') assertRemoteOriginsConfigured(mode)

  return {
    plugins: [
      react(),
      federation({
        dts: false,
        name: 'host',
        // Remotes are registered at RUNTIME instead (see
        // src/moduleFederation/moduleFederationRuntime.ts) so that one build can
        // point at different remote origins per environment. This must still be
        // declared for the plugin to set up the shared-scope runtime.
        remotes: {},
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
          '@mui/material': { singleton: true },
          '@emotion/react': { singleton: true },
          '@emotion/styled': { singleton: true },
        },
        shareStrategy: 'loaded-first',
      }),
    ],
    build: {
      // Module Federation emits top-level await; needs a modern target.
      target: 'esnext',
    },
  }
})
