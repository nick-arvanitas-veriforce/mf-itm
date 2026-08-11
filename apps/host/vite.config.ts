import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare(),
    federation({
      dts: false,
      name: 'host',
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
})
