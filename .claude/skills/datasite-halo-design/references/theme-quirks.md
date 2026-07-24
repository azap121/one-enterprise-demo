# Halo theme quirks

Non-obvious facts about the Halo theme that affect generated code.

## `alpha()` wrappers

The theme uses `alpha()` from MUI for transparency — e.g. `alpha(dsHaloMoondust[700], 0.04)` for hover states. When emitting CSS (not React), convert these to `rgba()` or hex+alpha. Don't strip the alpha channel.

## Gemstone ramps go 50–900

In `ds-ui-libraries` and the `halo-app` bridge, all 11 gemstone families have the full range:

```
amber · ruby · purpurite · amethyst · tanzanite · topaz ·
turquoise · emerald · jade · peridot · citrine
```

`moondust` is the only special one — it's also 50–900, AND it doubles as MUI's `palette.grey`. Use moondust for neutrals, gemstones for semantic signal only.

## Charts and data viz: use `accessibleColors`

**Always use `accessibleColors` from `~/theme/halo/halo/theme` for charts and data visualization.** Never invent hex values, never reach for gemstone ramps directly.

In `ds-ui-libraries`, the raw token source is `packages/ui-utilities/src/constants/ds-halo-design-tokens.ts` and exports this as `dsHaloAccessibleColors`; in the bridge it is `accessibleColors`. Both are identical named-pair objects:

```
darkYellow / lightYellow
darkOrange / lightOrange
darkRed    / lightRed
darkPurple / lightPurple
darkBlue   / lightBlue
darkGreen  / lightGreen
darkGray   / lightGray
```

This palette has been tested for contrast and distinguishability. Using arbitrary gem stops or custom hex values produces off-brand, potentially inaccessible output.

## Dark mode is first-class

Pull `colorSchemes.dark.palette` when the user asks for dark UIs. Don't try to derive dark mode from light mode — the dark ramp is hand-tuned, not algorithmic.

## `ds-halo-theme.ts` is not exported from the theme barrel

This is intentional, to keep Next.js RSC happy. Consuming apps get the theme via `resolveBaseDsTheme()`. Mention this if the user is wiring up Next.js — direct imports of `ds-halo-theme` will fail in server components.

## No `Ds*` wrapper components exist

There are no `DsButton`, `DsSwitch`, `DsTextField`, `DsLink`, or similar wrappers in `@ds/ui-common-react`. Halo styling is applied entirely via `components.MuiXxx.styleOverrides` in the theme.

**Always import from `@mui/material` directly.** Inventing `Ds*` imports will fail at runtime.

## Bridge components in `halo-app`

The `halo-app` repo has a small set of hand-built wrapper components at `~/theme/halo/components` that fill gaps where MUI alone is awkward:

- `HaloDialog` — built-in close button, sensible padding
- `HaloAlert` — alert with icon + title + actions
- `HaloEmptyState` — icon + title + body + actions
- `HaloSnackbar` — toast pattern
- `HaloToggleButtonGroup` — pill-style toggle group
- `HaloTree` — file tree

Use these for common patterns. For everything else, use raw MUI.

## Monorepo / publishing

`ds-ui-libraries` uses Lerna + NX. Local dev via `yalc` or `npm link`. Published to GAR on merge to `main`. Designers don't need to publish — production consumers pick up the GAR-published package.
