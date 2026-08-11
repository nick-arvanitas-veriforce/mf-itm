/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set at build time from the VITE_APP_VERSION env var (see deploy:* scripts).
  // Undefined in local dev.
  readonly VITE_APP_VERSION?: string
  // Origin of each deployed remote MFE, read at BUILD time (see
  // ./moduleFederation/mfeUrls.ts). Required for a production build; optional in
  // local dev, where it falls back to the remote's localhost dev server.
  readonly VITE_EM_URL?: string
  readonly VITE_DTD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
