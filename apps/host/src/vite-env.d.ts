/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set at build time from the VITE_APP_VERSION env var (see deploy:* scripts).
  // Undefined in local dev.
  readonly VITE_APP_VERSION?: string
  // Dev-only overrides for each remote's origin — e.g. point local dev at an
  // already-deployed remote instead of its localhost dev server.
  readonly VITE_EM_URL?: string
  readonly VITE_DTD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
