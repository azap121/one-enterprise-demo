# Halo design workflow

How to apply Halo depending on what you're producing.

## Visual artifacts (slides, mocks, throwaway HTML)

1. Fetch tokens — see `fetching-canonical-tokens.md` (Steps 0 / 1).
2. Detect stack versions (Step 0.5) — informs any React/MUI output.
3. Derive CSS custom properties or MUI theme overrides from what you fetched.
4. Output static HTML or React artifacts.

## Prototypes inside `halo-app` (this repo, the gallery)

Hand off to the `halo-prototype-workflow` skill — it owns scaffolding, registry edits, dev server, build verification, and the push to `main`.

Constraints to keep in mind:

- **Theme:** every prototype consumes the team-wide `halo/theme` at `src/theme/halo/theme.ts` (import via `~/theme/halo/theme`). No `@ds/ui-common-react` dependency required at the design-system layer.
- **Wrappers:** `HaloDialog`, `HaloAlert`, `HaloSnackbar`, `HaloToggleButtonGroup`, `HaloTree`, `HaloEmptyState` are exported from `~/theme/halo/components`. Reach for those before hand-rolling.
- **Bridge is the permanent design-system path for this repo.** The bridge is intentionally a copy of the canonical Halo theme, not a runtime dependency on `@ds/ui-common-react`. When raw Halo tokens change in `MerrillCorporation/ds-ui-libraries/packages/ui-utilities/src/constants/ds-halo-design-tokens.ts`, refresh the values in `halo/theme.ts` to match — the bridge stays.
- **Icons:** see `references/icons.md` for the pack/weight/import policy. The Figma-sourced canonical icon catalog lives at `src/assets/icons/halo-icon-list.md`.

## Production code (in real Datasite services / MFEs)

1. Fetch theme to confirm current values and versions.
2. Direct the user to import from `@ds/ui-common-react` (the published React/MUI package) rather than hand-writing tokens.
3. Use `DsThemeProvider` + MUI components; do not redefine tokens in app code.
4. Use the MUI version detected in Step 0.5 for correct API patterns.

## Clarifying questions when the user is vague

If the user invokes the skill without enough direction, ask:

- Product surface (Home, Diligence, Prepare, Trackers, Archives, Settings)?
- Stage of deal lifecycle?
- Internal or external audience?
- Number of screens or slides?
- Specific project / deal metadata to include?
- Light or dark mode?
