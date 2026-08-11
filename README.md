# mf-itm — Module Federation on Cloudflare Workers

A **micro-frontend monorepo** using **Module Federation** (`@module-federation/vite`)
on **Cloudflare Workers**, with **MUI** as the shared component library.

A pnpm-workspace monorepo with one **host** app and two **remote** micro-frontends
(MFEs), each deployed as its own Cloudflare Worker. The host loads the remotes at
runtime and proxies their assets same-origin, so there's no CORS in production and a
single host build works across every environment.

## Layout

```
apps/host/      Host shell. Cloudflare Worker serving the SPA. Owns the MUI theme
                and the nav bar. Consumes the remotes at runtime and proxies
                /em/* and /dtd/* to them.
remotes/em/     Employee Management. Static-assets-only Worker exposing ./Widget.
remotes/dtd/    Digital Training Delivery. Static-assets-only Worker exposing ./Widget.
```

## Shared dependencies

Two mechanisms, for two different problems:

**Versions** — the `catalog:` block in [`pnpm-workspace.yaml`](pnpm-workspace.yaml) is
the single source of truth. Each `package.json` still lists the deps it actually
imports, but the version is declared exactly once.

**Runtime singletons** — `react`, `react-dom`, `@mui/material`, `@emotion/react`, and
`@emotion/styled` are declared `singleton: true` in **every** `vite.config.ts`. This
is not optional for MUI: two copies of emotion means two style caches (duplicate
`<style>` injection, class-name collisions) and two React contexts for the theme, so
a remote would silently render with the default theme instead of the host's.

**Adding a shared dep:** add it to the catalog, add `"pkg": "catalog:"` to each
package.json that imports it, and — if it holds React context or global state — add
it to the `shared` block of all three vite configs.

## Theming

The host creates the one theme ([`apps/host/src/theme.ts`](apps/host/src/theme.ts))
and provides it in `bootstrap.tsx`. Remotes declare **no** `ThemeProvider` of their
own — they inherit it through the shared singletons above.

Each remote's own `bootstrap.tsx` is the **standalone** entry only (used when you run
that remote's dev server directly). It deliberately does *not* install the host theme,
so a widget can't come to depend on custom theme keys the host might not have.

Navigation lives in the host ([`components/NavBar.tsx`](apps/host/src/components/NavBar.tsx)),
not in its own remote — nav has to know every route, which makes it the most coupled
part of the app and a poor fit for an independently-deployable remote.

## How the remote URLs resolve (dev + deployed)

The host registers remotes **at runtime**
([`apps/host/src/moduleFederation/`](apps/host/src/moduleFederation/)), so a single
build loads each remote from the right place per environment:

| Environment | Remote entry URL | How it's served |
|-------------|------------------|-----------------|
| **dev** | `http://localhost:5174/remoteEntry.js` (em), `:5175` (dtd) | each remote's Vite dev server, cross-origin (CORS `*`) |
| **deployed** | `/em/remoteEntry.js`, `/dtd/remoteEntry.js` | **same-origin**; the host Worker proxies `/em/*` and `/dtd/*` to the remote Workers (service bindings `EM` / `DTD`) — no CORS |

Override a dev origin with `VITE_EM_URL` / `VITE_DTD_URL` (e.g. point dev at an
already-deployed remote).

## Develop

```bash
pnpm install
pnpm dev          # runs em (5174) + dtd (5175) + host (5173) together
```

Open http://localhost:5173 — the host shell with each remote's `Widget` mounted inside it.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Deploy

Deploy per environment — `qa` or `prod`. `VITE_APP_VERSION` is required: it tags the
deployed version (used for rollback) and is baked into the build.

```bash
VITE_APP_VERSION=v1.0.1 pnpm deploy:qa        # or deploy:prod
```

Each `deploy:<env>` deploys the **remotes first, then the host** — the host's service
bindings must point at remotes that already exist in that env.

> **Before you deploy:** set your own Worker names and custom domains in the
> `wrangler.jsonc` files. Without a `routes` block the Workers serve on `*.workers.dev`.

### Rollback

Each deploy creates an immutable version tagged with `VITE_APP_VERSION`. Rollback is
per-Worker — target it with `--name`.

```bash
# Roll back to the PREVIOUS version, recording a reason:
pnpm exec wrangler rollback --name mf-itm-host-qa -m "revert: bad qa release"
```

`wrangler rollback` takes a **version id**, not a tag — so to roll back to a specific
tagged version, look up its id first (the `Tag` column is the `VITE_APP_VERSION`):

```bash
pnpm exec wrangler versions list --name mf-itm-host-qa
pnpm exec wrangler rollback <version-id> --name mf-itm-host-qa -m "pin qa back to v1.0.1"
```

Remotes roll back the same way — `--name mf-itm-em-qa` / `mf-itm-dtd-qa`.

## Preview URLs

`preview_urls` is enabled on every Worker, so you can upload a build as a new
**version** and get a URL for it **without touching production traffic**. Use
`--preview-alias` for a stable, readable URL.

Host — the env is baked in at build time via `CLOUDFLARE_ENV`, so build against the
env whose remotes you want bound, then upload:

```bash
cd apps/host
CLOUDFLARE_ENV=qa pnpm build
pnpm exec wrangler versions upload --preview-alias pr-123
```

Remotes — env via `--env`:

```bash
cd remotes/em
pnpm build
pnpm exec wrangler versions upload --env qa --preview-alias pr-123
```

- Promote a previewed version to live traffic with `wrangler versions deploy`.
- **MFE caveat:** a host preview's service bindings point at the *deployed* remotes,
  not preview versions — so it previews host changes against the live remotes. To
  preview a remote change, upload a preview of that remote and open its own URL.

## Notes / gotchas baked into this setup

- The **remote** Workers use `not_found_handling: "none"` — MFE asset origins must
  404 on missing chunks, never SPA-fallback to `index.html`.
- The **host** Worker uses `run_worker_first` for `/em/*`, `/dtd/*`, and `/api/*` so it
  can proxy/handle those; everything else is served straight from static assets.
- The host Worker sets cache headers itself (`worker/index.ts`) because `_headers`
  files don't apply to responses a Worker returns via `env.ASSETS.fetch`. The remotes
  are assets-only Workers, so their own `public/_headers` apply.
- The host uses `@cloudflare/vite-plugin`, which selects the wrangler env at **build**
  time via `CLOUDFLARE_ENV` — so `wrangler deploy --env` does *not* work for the host.
  The remotes are plain wrangler and do use `--env`.
- `dts: false` on the federation plugin disables remote type generation. Widget props
  are currently structurally typed on the host side in `RemoteWidget.tsx`.
