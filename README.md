# mf-itm — Module Federation on Render

A **micro-frontend monorepo** using **Module Federation** (`@module-federation/vite`)
on **Render**, with **MUI** as the shared component library.

A pnpm-workspace monorepo with one **host** app and two **remote** micro-frontends
(MFEs). Each app is split into a `fe/` (Vite static site) and a `be/` (ASP.NET Core
service), and each half deploys as its own Render service — see
[`render.yaml`](render.yaml). The host loads the remotes at runtime from their own
origins, so remotes serve permissive CORS headers and the host's remote URLs are
baked in at build time.

## Layout

```
apps/host/      Host shell. Static site serving the SPA. Owns the MUI theme and the
                nav bar. Consumes the remotes at runtime.
remotes/em/     Employee Management. Static asset origin exposing ./Widget.
remotes/dtd/    Digital Training Delivery. Static asset origin exposing ./Widget.

<app>/fe        the Vite frontend (a pnpm workspace)
<app>/be        the .NET backend (part of MfItm.slnx; pnpm ignores it)
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

The host creates the one theme ([`apps/host/fe/src/theme.ts`](apps/host/fe/src/theme.ts))
and provides it in `bootstrap.tsx`. Remotes declare **no** `ThemeProvider` of their
own — they inherit it through the shared singletons above.

Each remote's own `bootstrap.tsx` is the **standalone** entry only (used when you run
that remote's dev server directly). It deliberately does *not* install the host theme,
so a widget can't come to depend on custom theme keys the host might not have.

Navigation lives in the host ([`apps/host/fe/src/App.tsx`](apps/host/fe/src/App.tsx)),
not in its own remote — nav has to know every route, which makes it the most coupled
part of the app and a poor fit for an independently-deployable remote.

## How the remote URLs resolve (dev + deployed)

The host registers remotes **at runtime**
([`apps/host/fe/src/moduleFederation/`](apps/host/fe/src/moduleFederation/)), with the
origins resolved in [`mfeUrls.ts`](apps/host/fe/src/moduleFederation/mfeUrls.ts):

| Environment | Remote entry URL | How it's served |
|-------------|------------------|-----------------|
| **dev** | `http://localhost:5174/remoteEntry.js` (em), `:5175` (dtd) | each remote's Vite dev server, cross-origin (CORS `*`) |
| **deployed** | `${VITE_EM_URL}/remoteEntry.js`, `${VITE_DTD_URL}/remoteEntry.js` | each remote's own Render static site, cross-origin — the remotes send `Access-Control-Allow-Origin: *` (set in [`render.yaml`](render.yaml)) |

`VITE_EM_URL` / `VITE_DTD_URL` set the remote origins. In dev they fall back to the
localhost dev servers, so you only need them to point dev at an already-deployed
remote — but a **build** requires them, and `vite.config.ts` fails the build if
they're missing rather than shipping a bundle that breaks in the browser.

Because Vite inlines `VITE_*` at **build** time, changing a remote's URL means
rebuilding the host, not just restarting it.

## Develop

Requires **Node 22+**, **.NET 10 SDK**, and a container runtime (**Docker Desktop**
or **Podman**) for the local database.

```bash
pnpm install
pnpm dev
```

That one command starts everything: Postgres, the three backends, the three
frontends. Open http://localhost:5173 — the host shell with each remote's `Widget`
mounted inside it, served with data from the local database.

| Service | Port | What it is |
|---------|------|------------|
| host | 5173 | the shell (Vite) |
| em | 5174 | Employee Management remote (Vite) |
| dtd | 5175 | Digital Training remote (Vite) |
| host-api | 5081 | user, permissions, navigation (.NET) |
| em-api | 5082 | worker roster (.NET) |
| dtd-api | 5083 | course catalog (.NET) |
| postgres | 55432 | local database (container) |

Backend ports live in each project's `Properties/launchSettings.json`, not in
`package.json`: a launch profile's `applicationUrl` **overrides** `ASPNETCORE_URLS`,
so setting the env var alongside it silently does nothing.

Run the halves separately when you only care about one:

```bash
pnpm dev:fe        # frontends only (no database needed)
pnpm dev:em-api    # one backend
```

```bash
pnpm typecheck
pnpm lint
pnpm build
```

### Database (local)

Local development runs Postgres in a container; **production is Neon** (below).
`pnpm dev` starts it for you — these are for when you need to drive it directly:

```bash
pnpm db:up        # start it
pnpm db:down      # stop it (data survives)
pnpm db:reset     # delete the data and re-seed from scratch
pnpm db:psql      # open a psql shell
```

Each service owns a **separate database** (`mfitm_host`, `mfitm_em`, `mfitm_dtd`),
mirroring the deployed setup — no service can read another's tables directly.
They are created on the container's first boot by
[`scripts/init-databases.sql`](scripts/init-databases.sql).

Each service applies its **own EF Core migrations at startup** and seeds demo data
if its tables are empty, so there is no separate migrate step. The seed is
idempotent — it does nothing when data already exists.

> The `db:*` scripts resolve `docker` or `podman` via
> [`scripts/container-cli.sh`](scripts/container-cli.sh). `docker` is commonly a
> shell *alias* for podman, and aliases don't exist in the non-interactive shell
> that runs pnpm scripts — hence the wrapper.

### Changing the schema

Edit the entity classes, then generate a migration for that service:

```bash
cd remotes/em/be
dotnet ef migrations add AddSomeColumn --context EmDbContext -o Data/Migrations
```

It applies automatically on the next start. Generating a migration does **not**
need a running database — each service has a design-time factory for that.

## Database (Neon)

Production data lives on **Neon**, not Render — so it is *not* declared in
`render.yaml`. Each service reads a single `DATABASE_URL` env var.

1. Create a Neon project, then create three databases in it: `mfitm_host`,
   `mfitm_em`, `mfitm_dtd`.
2. For each Render backend service, set `DATABASE_URL` to that database's Neon
   connection string. It is marked `sync: false` in `render.yaml`, which means
   **Render prompts for the value and never stores it in the repo** — do not paste
   a connection string into that file.
3. Deploy. Each service migrates and seeds itself on first boot.

Either connection-string form works. Neon hands out a URI
(`postgresql://user:pass@host/db?sslmode=require`), which Npgsql does not accept
natively, so the services normalise it — including honouring its `sslmode`, which
is why the same code works against local Postgres (`sslmode=disable`) and Neon
(`require`).

> Neon's free tier **suspends a database after inactivity**; the first request
> afterwards pays a cold start. Render's free tier does the same to the services
> themselves, so an idle demo's first load is slow. Neither is a bug.

## Deploy

There is no deploy script. All six services are declared in
[`render.yaml`](render.yaml) as a **Render Blueprint** — point a Render Blueprint at
this repo once, and every push to the tracked branch builds and deploys the services
whose files changed.

What has to be set by hand, because it can't live in the file:

- **`DATABASE_URL`** on each of the three backends — marked `sync: false`, so Render
  prompts for it and never stores it in the repo. See [Database (Neon)](#database-neon).
- **`VITE_EM_URL` / `VITE_DTD_URL`** on the host. Render's generated `.onrender.com`
  hostnames carry a random suffix and so don't match the `name:` fields; `fromService`
  can't resolve them for static sites, and its host properties are private-network
  addresses a browser can't reach. Copy each remote's real hostname from its dashboard
  page into `render.yaml`, and update them if you attach custom domains.

Deploy order doesn't matter for the remotes, but the host's build needs the remote
URLs to already be known — its `vite build` fails if they're unset.

### Rollback

Render keeps every deploy: open the service → **Deploys** → **Rollback** on a previous
one. Rollback is per service, so a bad host release and a bad remote release are rolled
back independently.

Because the host loads remotes at runtime, rolling back the **host** alone leaves it
pointing at the current remotes. If a remote's federated chunks changed
incompatibly, roll that remote back too.

## Notes / gotchas baked into this setup

- **Remotes must 404 on missing chunks.** They declare no catch-all rewrite, so
  Render's default 404 stands. An SPA fallback here would hand back `index.html` for a
  missing chunk and Module Federation would fail later with a confusing JS parse error
  instead of a clean 404.
- **The host does declare the SPA rewrite** (`/*` → `/index.html`), so client-side
  routes survive a hard refresh.
- **Caching:** content-hashed `/assets/*` are `immutable`; `remoteEntry.js` is
  `no-cache` because its filename is stable while its contents change every deploy —
  without that, a browser pins an old container pointing at chunks that no longer
  exist. Both are set in `render.yaml`; Render does not read a `_headers` file.
- **CORS is required in production**, unlike a same-origin setup: the browser fetches
  each remote's entry from the remote's own origin, so remotes send
  `Access-Control-Allow-Origin: *`, and each backend allows the calling FE origins via
  `CORS_ALLOWED_ORIGINS`. A remote widget runs *inside the host page*, so the origin
  its API calls carry is the **host's**, not the remote's.
- `dts: false` on the federation plugin disables remote type generation. Widget props
  are currently structurally typed on the host side in `RemoteWidget.tsx`.
- Render's free tier **spins services down when idle**, so the first request after a
  quiet period is slow. Neon does the same to the database. Neither is a bug.
