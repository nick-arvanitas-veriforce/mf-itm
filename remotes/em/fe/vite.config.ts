import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      dts: false,
      name: 'em',
      // Emitted as dist/remoteEntry.js — the container entry the host loads.
      filename: 'remoteEntry.js',
      exposes: {
        './Widget': './src/Widget.tsx',
      },
      // Must match the host's shared config — see apps/host/fe/vite.config.ts.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@mui/material': { singleton: true },
        '@emotion/react': { singleton: true },
        '@emotion/styled': { singleton: true },
      },
    }),
  ],
  build: {
    // Module Federation emits top-level await; needs a modern target.
    target: 'esnext',
  },
  // The host always loads this remote cross-origin — from this server in dev and
  // preview, and from the remote's own onrender.com origin once deployed — so it
  // must allow CORS here. Deployed, the same header comes from render.yaml.
  server: {
    port: 5174,
    strictPort: true,
    cors: { origin: '*' },
  },
  preview: {
    port: 5174,
    strictPort: true,
    cors: { origin: '*' },
  },
})
