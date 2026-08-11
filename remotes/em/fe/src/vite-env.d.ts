/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Set at build time from the VITE_APP_VERSION env var (see deploy:* scripts).
  // Undefined in local dev.
  readonly VITE_APP_VERSION?: string
  // Origin of the EM backend (remotes/em/be). Inlined at BUILD time; falls back
  // to the local dev port when unset. See render.yaml.
  readonly VITE_EM_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
