# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reference documents

Extended context lives in `.claude/docs/`. Read these before prototype work on anything related to the Reviewer Dashboard or the broader Datasite product direction:

- `.claude/docs/design-brief.*` — design brief covering goals, scope, and constraints
- `.claude/docs/ecosystem.*` — Datasite now vs. future ecosystem map
- `.claude/docs/upgrade-logic-path.*` — upgrade flow and decision logic

## What this repo is

A self-contained prototype gallery for the Datasite design team — part of **Halo OS**, the Agentic OS for design (sibling repos: `halo-tokens`, etc.). It is **not a typical Datasite MFE** — even though the original project-creation template stamped it with rsbuild + Module Federation + `@ds/*` tooling, that infrastructure has been deliberately removed. This repo:

- Installs from the public npm registry plus locally **vendored** Font Awesome Pro packages. No Google Artifact Registry credentials required for normal `npm install`.
- Has no `@ds/*` runtime dependencies and no Module Federation runtime.
- Has FA Pro icons (Light, Regular, Solid, Duotone, FA-7 Duotone Light) committed at `vendor/@fortawesome/` and consumed via `file:` deps in `package.json`. See "Vendored FA Pro" below.
- Is intended to be cloneable and runnable by any designer on any machine with Node ≥20.

The deployed bundle ships via Jenkins → NFS → public-gateway to an internal Datasite URL (path TBD until the platform team adds entries to `datasite-k8s-manifests`).

## Designer-driven workflow (critical)

Designers — not engineers — drive most changes here. The three skills under `.claude/skills/` encode the full workflow; **read them before doing prototype work**:

- `halo-prototype-workflow/SKILL.md` — scaffolding new prototypes (11 main steps + sub-steps, agent-driven)
- `halo-prototype-deploy/SKILL.md` — what happens after push, status checks, FAQ
- `datasite-halo-design/SKILL.md` — Halo tokens, components, icon system

Three non-obvious operating rules these skills encode:

1. **Push directly to `main`. No pull requests, no feature branches.** The PR review process is replaced by two skill-encoded gates the agent must satisfy before push: (a) `npm run build` succeeds, (b) the designer has explicitly approved the visual result in the browser. Don't open PRs for prototype work.
2. **Prototypes are test-free by design.** The shell harness has unit tests (filtering, sorting, breadcrumb, search); individual prototypes under `src/projects/<Designer>/<Name>/` never get `*.test.tsx` files. The CI also skips tests (`Jenkinsfile` has `testCommand = 'echo …'`).
3. **`halo-prototype-workflow` is always the entry point for any prototype request — no exceptions.** Whenever a designer uses the word "prototype", "mock up", "build", "design", or "explore" in this repo, invoke `halo-prototype-workflow` immediately. Do NOT interpret "prototype" as a general software engineering task (Python script, backend tool, CLI, etc.) — prototypes here are always React UI components built with Halo. Do NOT call `datasite-halo-design` directly; the workflow skill calls it at Step 2 internally.

## Commands

```bash
npm install       # public registry + local vendored FA Pro — no GAR auth needed
npm start         # rsbuild dev server, auto-opens http://localhost:9000
npm run build     # production rsbuild build
npm run preview   # serve the built bundle locally
npm test          # jest unit tests for the shell (19 tests, ~3 sec)
npm test -- <pattern>  # run tests matching pattern, e.g. `npm test -- breadcrumb`
npm run type-check     # tsc --noEmit
npx playwright test    # smoke E2E (1 test)
npx playwright test --list   # enumerate without running
```

There is no lint, prettier, knip, or husky pre-commit. The agent is expected to write prettier-clean code via `Edit`. There is no `npm run lint` or `npm run prettier` script.

## Architecture

### Single-bundle MFE

Despite the `-mfe` suffix, this repo no longer uses Module Federation. `rsbuild.config.ts` is a plain rsbuild config with `pluginReact()` only — no `moduleFederation` block, no `exposes`, no `remotes`. The "MFE" identity is purely the deployment target (Jenkins → NFS → public-gateway) and the npm package scope.

### Gallery shell + manifest-registered prototypes

```
src/
├── bootstrap/
│   ├── app.tsx          (federated mount entry — exports default App + mount())
│   └── local.tsx        (dev entry — auto-mounted by src/index.ts)
├── routes.tsx           (createBrowserRouter wired from registry)
├── shell/               (gallery wrapper — search, filter, breadcrumb, chrome)
│   ├── GalleryWrapper.tsx   (persistent breadcrumb chrome + <Outlet />)
│   ├── GalleryHome.tsx      (landing page with search/sort/filter chips)
│   ├── PrototypeFrame.tsx   (Suspense + ErrorBoundary wrapper)
│   ├── filterPrototypes.ts  (pure filter + sort helpers)
│   ├── breadcrumb.ts        (pure pathname → breadcrumb segments)
│   ├── hooks/useGalleryFilters.ts  (URL-state ↔ filter state)
│   └── chrome.css           (sticky breadcrumb + diagonal divider)
├── projects/
│   ├── types.ts          (PrototypeEntry, PrototypeType)
│   ├── registry.ts       (THE source of truth — load-bearing)
│   └── <Designer>/<PascalName>/  (one folder per prototype)
│       ├── index.tsx          (default-exported route component)
│       └── components/...     (the actual UI)
└── theme/
    └── halo/             (Halo theme + Halo-namespaced components)
        ├── theme.ts        (MUI theme — pinned April 2026 snapshot; ALL Halo styling lives here)
        └── components/             (HaloDialog, HaloEmptyState, HaloAlert, … — mostly thin wrappers around MUI primitives; a few are re-exports; all draw from theme.ts)
```

Two architectural facts the file structure hides:

1. **`src/projects/registry.ts` is load-bearing.** There is no auto-discovery. A prototype folder that isn't registered in this array will not appear in the gallery. The workflow skill's Step 4 calls this out as the single biggest "gotcha" for new prototype work.

2. **The gallery wrapper owns theming and routing.** Prototypes are React components, not apps. They MUST NOT wrap themselves in `ThemeProvider`, `BrowserRouter`, or any MFE consumer contract — the gallery wrapper already provides all of that. A prototype that nests its own `ThemeProvider` will silently break Halo token inheritance.

### Halo bridge

The MUI theme + Halo components in `src/theme/halo/` are a hand-curated April 2026 snapshot copied from `Datasite-POC/Design/.claude/skills/datasite-halo-design/shared/`. Most `Halo*` components are thin wrappers around MUI primitives that add Halo-specific defaults or custom anatomy where Figma diverges from MUI (e.g., HaloDialog's `title`/`actions` slots). A few (like HaloButton) are pure re-exports where MUI's theme override system handles everything. In every case, the styling lives in `theme.ts` — that's where the design system actually lives. The bridge is intentionally a copy, not a dependency, because:

- The canonical raw Halo design tokens live in `@ds/ui-utilities`; the React/MUI theme integration lives in `@ds/ui-common-react`, which is published to GAR
- This repo is GAR-free so designers can run it without credentials
- The bridge is the permanent design-system path for this repo. When Halo tokens change in `MerrillCorporation/ds-ui-libraries/packages/ui-utilities/src/constants/ds-halo-design-tokens.ts`, refresh the values in `halo/theme.ts` to match — the bridge stays.

When refreshing the bridge, use `MerrillCorporation/ds-ui-libraries/packages/ui-utilities/src/constants/ds-halo-design-tokens.ts` for raw token values and `MerrillCorporation/ds-ui-libraries/packages/ui-common-react/src/theme/ds-halo-theme.ts` for React/MUI theme wiring. Keep the bridge GAR-free; copy values and local-compatible overrides instead of importing `@ds/*` packages.

### Vendored FA Pro

This repo commits the FA Pro icon packages (Light, Regular, Solid, Duotone, plus FA 7 `duotone-light`) at `vendor/@fortawesome/`. They're referenced from `package.json` as `"@fortawesome/pro-light-svg-icons": "file:./vendor/@fortawesome/pro-light-svg-icons"`-style deps so `npm install` picks them up locally without hitting any registry. **Designers don't need GAR auth for normal use.** This is what keeps the repo's clone-and-run property intact while still delivering Pro-fidelity icons.

Files are checked in. Do not add `@fortawesome:` registry pointers in `.npmrc` — that breaks the local resolution.

**Refreshing the vendored packs** (maintainer task, ~once a year on FA major bumps): run `~/scripts/vendor-fa-pro.sh`. It pulls from Datasite's GAR mirror (`utils-prod-ds01/ds-font-awesome`) using the maintainer's gcloud auth, copies unpacked packages into `vendor/@fortawesome/`, then commit and push. The script handles GAR's stale upstream-credential issues gracefully (skips packages it can't fetch). For packs GAR doesn't mirror, set `FA_TOKEN=…` to fall back to FA's own registry.

**Icon import policy and concept→icon vocabulary** live in `.claude/skills/datasite-halo-design/references/icons.md`. Default weight is Pro Light (matches Halo). Existing prototypes still using `@fortawesome/free-solid-svg-icons` keep working — don't churn-migrate them.

### Build + deploy

`Jenkinsfile` uses the shared `k8s-cicd-pipelines` Groovy library with `deploymentType = 'kubernetes'`. On push to `main`, Jenkins:

1. Runs `npm ci && npm run build` (rsbuild emits `dist/`)
2. Builds a Docker image from `Dockerfile.halo-app` — multi-stage: `harbor.dsite.io/datasite-docker/node:22-alpine` for the build, `harbor.dsite.io/datasite-docker/nginx:1.29-alpine` for runtime (current nginx mainline; same digest as the bare `alpine` and `mainline-alpine` tags)
3. Pushes the image to Datasite Harbor (`harbor.dsite.io/datasite/halo-app/main/halo-app:<tag>`)
4. Deploys to Kubernetes per the `services/halo-app/` config in the `datasite-k8s-manifests` repo

The deployed URL is `https://halo.dev.dsite.io` (dev). The hostname is set by `services/halo-app/00-k8s-vars.yaml` in `MerrillCorporation/datasite-k8s-manifests`. The K8s ingress + TLS cert are provisioned automatically (`tlsCert: soteria-namespace-cert`).

`rsbuild.config.ts` still reads `process.env.BASE_PATH` (default `/`), but with the custom hostname there's no path prefix — leave `BASE_PATH` unset so the bundle resolves at `/`. `nginx.conf` does an SPA fallback (`try_files $uri $uri/ /index.html`) so react-router routes resolve correctly.

**Why fully-qualified Harbor paths in the Dockerfile?** Datasite's CI build container (Buildah/Podman) only resolves shortnames listed in `/etc/containers/registries.conf.d/shortnames.conf`. `node` is aliased there but `nginx` isn't, so a bare `FROM nginx:1.27-alpine` fails with "did not resolve to an alias" inside CI. Harbor *does* proxy-cache nginx (verified via `docker pull harbor.dsite.io/datasite-docker/nginx:1.27-alpine`), so we use the fully-qualified path for both stages. The Harbor API search returns empty for un-pulled images because the proxy cache only populates on first pull — don't trust the search alone.

**This repo does NOT use the NFS deployment pattern.** Datasite has two patterns for static MFE-style apps: (a) NFS for federated MFEs loaded by the customer-facing app shell at `app.<env>.datasite.com`, (b) K8s + custom hostname for browsable internal tools at `*.dev.dsite.io`. We're firmly in (b) — the bundle isn't a federated remote, it's a standalone internal tool.

## Tooling caveats

- **TypeScript:** standalone `tsconfig.json` (no extends). Path alias `~/*` → `./src/*`. JSX transform is `react-jsx` (React 19 automatic runtime).
- **Jest:** standalone `jest.config.js` using `@swc/jest` for TS transform. `setupFilesAfterEach` is **`setupFilesAfterEnv`** — the docs spec was wrong; the working config has the right key. `react-jsx` runtime requires `jsc.transform.react.runtime: 'automatic'` in the SWC config (already set), otherwise tests fail with `React is not defined`.
- **Husky / lint-staged / commitlint / knip / eslint / prettier:** all removed. The repo intentionally has no pre-commit hooks. Don't try to add `npm run lint` or `npm run prettier:write` — those scripts don't exist.
- **`.npmrc`:** intentionally empty (one comment line). Don't add registry pointers — that's how GAR re-creeps in. Vendored FA Pro packs are referenced as `file:` deps in `package.json`, not via a registry redirect.
- **Mocks:** `__mocks__/fileMock.js` returns an empty string for CSS/SVG imports during jest runs.

## Sister repo

`Datasite-POC/Design` is the *original* prototype gallery — a separate repo that publishes to GitHub Pages via `node scripts/publish.mjs`. It uses a fundamentally different shape (each prototype is its own Vite app, the bridge lives under `.claude/skills/`, designers run a manual publish step, gh-pages branch). **Don't borrow its commands or workflow.** They look similar but differ in critical ways:

| Concern | `Datasite-POC/Design` | `halo-app` (this repo) |
|---|---|---|
| Per-prototype `package.json` | yes | no — all in one bundle |
| Per-prototype `vite.config.ts` | yes (with @shared aliases) | no |
| Theme provider | each prototype wraps its own | shell provides one |
| Publish | `node scripts/publish.mjs` (local) | Jenkins on push to main |
| FA Pro icons | optional (Pro icons need GAR) | vendored at `vendor/@fortawesome/`; `file:` deps; FA Free Solid still available for back-compat |
| `@ds/ui-common-react` | not used (uses bridge); reachable via opt-in | never used; bridge is the only path |
| URL | `datasite-poc.github.io/Design/...` | `app.<env>.datasite.com/...` (TBD) |

If asked about workflow that doesn't match this repo's reality, double-check whether the question is about the sister repo and respond accordingly.

## Adding a prototype (TL;DR)

The full procedure is in `.claude/skills/halo-prototype-workflow/SKILL.md`. The agent does all of this without the designer typing any of it:

1. `git pull origin main` (no branch)
2. Ask the designer: name, prototype title, design question
3. Invoke `datasite-halo-design` to confirm tokens
4. Create `src/projects/<Designer>/<PascalName>/index.tsx` + `components/...`
5. **Add an entry to `src/projects/registry.ts`** (the gallery has no auto-discovery)
6. `npm start`, share URL with designer for review
7. Wait for explicit "ship it" / "looks good" / etc.
8. `npm run build` to confirm clean
9. `git add` + `git commit` + `git push origin main` (no PR)
10. Tell the designer: "Pushed. Live in ~5 min via Jenkins."
