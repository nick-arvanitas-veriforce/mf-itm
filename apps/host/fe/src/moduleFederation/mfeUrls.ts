// Single source of truth for remote MFE entry URLs across environments.
//
// Remotes are deployed as independent static sites on their own origins, so the
// host always loads them CROSS-ORIGIN from an absolute URL. The origin comes
// from a build-time env var, with a localhost fallback for local dev:
//
//   VITE_EM_URL  -> the em remote's origin
//   VITE_DTD_URL -> the dtd remote's origin
//
// Because these are cross-origin, each remote's host must serve
// `Access-Control-Allow-Origin` on remoteEntry.js and its chunks.
//
// NOTE: Vite inlines `import.meta.env.VITE_*` as string literals at BUILD time,
// so these must be present in the host's build environment — setting them only
// at runtime has no effect on an already-built static bundle.

const remoteEntry = (origin: string) => `${origin.replace(/\/$/, '')}/remoteEntry.js`

// Fail loudly at startup rather than letting Module Federation fetch
// `undefined/remoteEntry.js` and surface a confusing parse error much later.
const requireOrigin = (name: string, value: string | undefined, devFallback: string) => {
  const origin = value ?? (import.meta.env.DEV ? devFallback : undefined)
  if (!origin) {
    throw new Error(
      `Missing ${name}. Set it in the host's build environment to the remote's origin ` +
        `(e.g. https://mf-itm-em.onrender.com).`,
    )
  }
  return origin
}

// Keys are the federation container names declared in each remote's
// vite.config.ts (`federation({ name })`), so they must stay in sync.
export const mfeUrls: Record<string, string> = {
  em: remoteEntry(requireOrigin('VITE_EM_URL', import.meta.env.VITE_EM_URL, 'http://localhost:5174')),
  dtd: remoteEntry(
    requireOrigin('VITE_DTD_URL', import.meta.env.VITE_DTD_URL, 'http://localhost:5175'),
  ),
}
