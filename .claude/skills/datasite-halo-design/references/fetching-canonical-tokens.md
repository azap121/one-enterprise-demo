# Fetching canonical Halo tokens

This skill does not hardcode colors, theme values, or stack versions. Halo has two canonical sources, and the agent should fetch from them on every non-trivial run rather than relying on memory.

## Canonical sources

1. **Figma library** (designer source of truth) — the [Halo Design System file](https://www.figma.com/design/MocqvKfuogd2Re1tyFr4d4/%E2%AD%90%EF%B8%8F--HALO--Design-System). Accessed via the **Figma MCP** if connected. File key: `MocqvKfuogd2Re1tyFr4d4`.
2. **GitHub repo** (engineering source of truth) — `MerrillCorporation/ds-ui-libraries`, where raw Halo tokens live in `ui-utilities` and the MUI theme, component overrides, alert/chip/file-icon tokens, and dark-mode palette live in `ui-common-react`.

Prefer **Figma** for visual primitives (colors, type, spacing, iconography).
Prefer the **repo** for theme wiring (semantic role mapping, MUI component overrides, alert backgrounds, file-icon colors, dark-mode ramps, stack versions).
Use **both** for anything non-trivial — they should agree. If they don't, surface the diff to the user.

### ⛔ Do NOT use these sources

- **`https://github.com/Datasite-POC/halo-ds`** — outdated and inaccurate. Do not read, fetch, or cite anything from this repo; it will give you wrong values and confuse the output. If a user points you there, redirect to the two canonical sources above.

Only the Figma file and `MerrillCorporation/ds-ui-libraries` count. If you find another Halo-looking repo or Figma file, verify with the user before using it.

## Step 0 — Try Figma MCP first

If the Figma MCP is connected in the runtime, use it to fetch live design tokens:

- **File URL:** https://www.figma.com/design/MocqvKfuogd2Re1tyFr4d4/%E2%AD%90%EF%B8%8F--HALO--Design-System
- **File key:** `MocqvKfuogd2Re1tyFr4d4`
- **Useful Figma MCP calls** (exact tool names vary by MCP server — adapt to what's exposed):
  - `get_variables` / `get_local_variables` — color, spacing, radius, type tokens with current values
  - `get_styles` — paint/text/effect styles
  - `get_file` / `get_node` — specific frames (Color Palette, Typography, Components)
  - `get_image` — rendered previews of components for reference
- **If Figma MCP is NOT connected:** skip to Step 1 and rely on the GitHub repo. Tell the user Figma wasn't reachable so values come from code only.

## Step 0.5 — Detect stack versions

Before generating component code or giving API advice, **read `packages/ui-common-react/package.json`** from the repo and surface to the user:

- `peerDependencies["@mui/material"]` — MUI major version. Affects API choices (e.g. `Grid` vs `Grid2`, `sx` patterns, theme `createTheme` signature, date-picker package name).
- `peerDependencies["react"]` — React version.
- `dependencies["@fortawesome/*"]` — FontAwesome major version. The canonical Halo source uses Pro Light. The `halo-app` repo vendors the Pro packs locally so designers don't need GAR auth — see `references/icons.md` for the full pack/weight/usage policy.
- `peerDependencies["@tanstack/react-query"]` and `@emotion/*` — for data-fetching and styled-component patterns.

Never say "MUI v5" or "MUI v6" from memory. Always quote what you just read, e.g. "Repo is on MUI ^6.0.0 at this commit."

## Step 1 — Fetch the theme source from GitHub

Use the GitHub tools (or `web_fetch` of raw.githubusercontent.com if GitHub tools are unavailable) to read these files from `MerrillCorporation/ds-ui-libraries` at ref `main`:

1. **`packages/ui-utilities/src/constants/ds-halo-design-tokens.ts`** — raw Halo token constants: Moondust neutrals + gemstone families (Amber, Ruby, Purpurite, Amethyst, Tanzanite, Turquoise, Emerald, Jade, Peridot, Citrine), accessible color ramp, typography, shape, and light/dark palette objects.
2. **`packages/ui-common-react/src/theme/ds-halo-theme.ts`** — MUI theme object: semantic palette mapping (primary/secondary/error/warning/info/success/text/background/action/chips/fileIcons), component overrides, dark mode, alert bg/fg.
3. **`packages/ui-utilities/src/constants/index.ts`** — constants barrel; confirms the raw Halo token exports.
4. **`packages/ui-common-react/src/theme/index.ts`** — theme barrel; confirms what's exported for React/MUI consumers.
5. **`packages/ui-common-react/src/theme/ds-theme-2025.ts`** — the current/in-transition theme. Read for typography, spacing, and anything not in `ds-halo-theme.ts`.
6. **`AGENTS.md`** (repo root) — repo-level conventions and peer-dep reference.

If the user mentions a branch, tag, or commit, use that ref instead of `main`.

## Step 2 — Detect newer theme files

The theme evolves. Before relying on `ds-halo-theme.ts`, list `packages/ui-common-react/src/theme/` and scan for newer files (e.g. `ds-theme-2026.ts`, `ds-halo-theme-v2.ts`, `ds-theme-accessibility.ts`, `ds-theme-<bu-name>.ts`). If present, prefer the newer file and note the version to the user.

## Step 3 — Parse and use

Parse `export const` declarations to extract hex values and `alpha()`-wrapped tokens (convert to `rgba()` or hex+alpha when emitting CSS). **Never quote a hex or token value from memory** — every value in your output must trace back to a Figma variable or code file you just read.

## Step 4 — Reconcile Figma vs. code

If you fetched both sources, cross-check key tokens (Moondust 50–900, primary, error, warning, success). They should agree. If they disagree, surface the diff to the user before proceeding. Default to Figma for visual artifacts; default to the code value for production work.

## Access model notes (future-facing)

- **Today:** designers can read `MerrillCorporation/ds-ui-libraries` on GitHub directly, so `github_read_file` works for live theme fetches.
- **Possible future state:** designers may lose direct repo read access and instead consume Halo via Google Artifact Registry (GAR) — installing `@ds/ui-utilities` for raw framework-agnostic Halo tokens and `@ds/ui-common-react` for the React/MUI Halo theme.
- **When that switch happens:** update this reference to read raw tokens from the installed `@ds/ui-utilities` package path or from a GAR tokens URL instead of `github_read_file`. Owner: Halo Team.
