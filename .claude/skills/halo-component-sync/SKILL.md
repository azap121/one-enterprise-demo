---
name: halo-component-sync
description: >
  Use this skill whenever changes are made to any design-related skill file in `.claude/skills/datasite-halo-design/` — including SKILL.md, component-anatomy.md, theme-quirks.md, fetching-canonical-tokens.md, icons.md, or workflow.md — and you need to ensure the Halo components in `src/theme/halo/` stay in sync with the updated spec.

  Trigger on any of these signals:
  - "I updated the halo design skill" / "the component-anatomy changed" / "sync the halo components"
  - "the Figma spec changed for [component]" / "new tokens landed" / "update the Halo components"
  - "I edited theme-quirks / icons / component-anatomy" and there are now discrepancies with the halo directory
  - Any time you detect a diff in `.claude/skills/datasite-halo-design/**` that touches design principles, token values, component properties, Figma node IDs, sizing, spacing, color, or iconography

  When in doubt about whether halo components need an update after a skill edit, activate this skill rather than skipping it — a stale component library is worse than an unnecessary sync check.
user-invocable: true
---

# Halo Component Sync

When the `datasite-halo-design` skill files are updated, the Halo components at `src/theme/halo/` need to be reviewed and potentially updated to match. This skill is the playbook for doing that cleanly, safely, and in one pass.

## Showing progress

Designers don't watch tool calls — they watch chat. **Post this checklist as soon as you've identified what changed in Step 1, then update it inline as each step completes** so the designer can see exactly where things stand.

Use checkbox syntax (`- [ ] **Step N:**`). Mark items `- [x]` only after they're actually done — never pre-check ahead of work, and never mark Step 6 done without explicit designer sign-off.

Template to post after Step 1:

```markdown
- [x] **Step 1:** Identify what changed
- [ ] **Step 2:** Fetch live token values (if tokens changed)
- [ ] **Step 3:** Read → compare → propose changes
- [ ] **Step 4:** Apply edits
- [ ] **Step 5:** Verify build passes
- [ ] **Step 6:** Visual confirmation ← stops here for sign-off
- [ ] **Step 7:** Commit and push to main
```

Re-post the updated checklist each time a step flips to `[x]` — the designer should always be able to find the current status in your most recent message without scrolling.

---

## The halo library lives here

```
src/theme/halo/
├── theme.ts                         ← MUI theme: tokens, palette, component overrides
└── components/
    ├── HaloAccordion.tsx
    ├── HaloAlert.tsx
    ├── HaloAutocomplete.tsx
    ├── HaloAvatar.tsx
    ├── HaloBackdrop.tsx
    ├── HaloBadge.tsx
    ├── HaloBreadcrumbs.tsx
    ├── HaloButton.tsx
    ├── HaloButtonGroup.tsx
    ├── HaloCheckbox.tsx
    ├── HaloChip.tsx
    ├── HaloDatePicker.tsx
    ├── HaloDialog.tsx
    ├── HaloDivider.tsx
    ├── HaloEmptyState.tsx
    ├── HaloLink.tsx
    ├── HaloList.tsx
    ├── HaloMenu.tsx
    ├── HaloPagination.tsx
    ├── HaloPaper.tsx
    ├── HaloPopover.tsx
    ├── HaloProgress.tsx
    ├── HaloRadioGroup.tsx
    ├── HaloRating.tsx
    ├── HaloSelect.tsx
    ├── HaloSkeleton.tsx
    ├── HaloSlider.tsx
    ├── HaloSnackbar.tsx
    ├── HaloStepper.tsx
    ├── HaloSwitch.tsx
    ├── HaloTabs.tsx
    ├── HaloTextField.tsx
    ├── HaloToggleButtonGroup.tsx
    ├── HaloTooltip.tsx
    ├── HaloTree.tsx
    └── index.ts
```

This is a hand-curated snapshot — not a published package. When Halo tokens or component specs evolve, **this is the only file set you touch**. Do not install new packages, do not reach for `@ds/ui-common-react`, and do not modify anything outside `src/theme/halo/`.

---

## Step 1 — Identify what changed in the skill files

Run a git diff against the skill directory to see exactly what was edited:

```bash
git diff HEAD -- .claude/skills/datasite-halo-design/
```

If the changes haven't been committed yet, also check the working tree:

```bash
git diff -- .claude/skills/datasite-halo-design/
git diff --cached -- .claude/skills/datasite-halo-design/
```

Read each changed file in full. Build a change map of which categories were affected:

| Changed area | Halo files likely affected |
|---|---|
| Token values (colors, alpha, spacing, radii) | `theme.ts` — and any component that hardcodes those values instead of using theme tokens |
| Component spec (padding, border, typography) | The matching `Halo*.tsx` — cross-reference component-anatomy.md |
| Dark mode palette | `theme.ts` → `colorSchemes.dark.palette` |
| Icon names or weights | Any `Halo*.tsx` that uses FA icons |
| Figma node IDs only | Reference update — usually no code change needed |
| Design principles / workflow | Usually no code change — confirm with user if uncertain |
| `accessibleColors` / chart ramps | `theme.ts` → `accessibleColors` export |

Write down your change map before editing anything — this prevents thrashing. Post it in chat alongside the checklist so the designer can see the scope upfront.

---

## Step 2 — Fetch live token values (when tokens changed)

Skip this step if the diff only touched non-token content (principles, workflow, node IDs). Otherwise:

**Figma MCP (if connected):**
- File key: `MocqvKfuogd2Re1tyFr4d4`
- Use `get_variable_defs` or `get_design_context` on the Color Palette node (`18837-227834`) for color tokens
- Use node IDs from `component-anatomy.md` to inspect specific components

If Figma values differ from what's in the skill file snapshot, surface the conflict to the user before editing. Do not silently pick one.

---

## Step 3 — For each affected component, read → compare → propose

Open the current halo file. Read the spec from the updated `component-anatomy.md`. Identify the specific divergence. Write down proposed changes in this format:

```
HaloDialog.tsx — DialogContent background:
  Current:  bgcolor: 'background.paper'
  Spec:     always white — never background.paper (which resolves to #FAFAF7, not white)
  Proposed: bgcolor: '#FFFFFF' or 'common.white'
```

Do this for every affected file before making a single edit. Post the full proposal in chat and wait for the designer to confirm scope before continuing.

**Key spec concerns per component:**

| Component | Key things to verify |
|---|---|
| `HaloAccordion` | Collapsed/expanded bg, summary padding, expand icons, detail padding |
| `HaloAlert` | Severity backgrounds + borders (error/warning/info/success/message), icon names, padding, border radius |
| `HaloAutocomplete` | Border states, chip styles, dropdown rendering |
| `HaloAvatar` | Size variants (24/36/48px), default fill color |
| `HaloBackdrop` | Scrim color (`rgba(31,34,39,0.5)`) |
| `HaloBadge` | Colors, badgeContent rendering |
| `HaloBreadcrumbs` | Font, separator icon, active color, collapse threshold |
| `HaloButton` | Variant/color/size combinations, border radius, font weight, sentence case |
| `HaloButtonGroup` | Border radius, divider color |
| `HaloCheckbox` | Size (always small), FA icon names |
| `HaloChip` | Font size, filled bg, border radius |
| `HaloDatePicker` | Border states, calendar rendering |
| `HaloDialog` | Paper bgcolor, border, DialogContent bgcolor, caution variant, padding, close button sizing |
| `HaloDivider` | Color (`rgba(31,34,39,0.12)`) — never solid grey |
| `HaloEmptyState` | Icon size (80×80px), layout gaps, border radius, width (448px), font weights |
| `HaloLink` | Font, underline variant |
| `HaloList` | Width (260px), item padding, state backgrounds |
| `HaloMenu` | Width (220px), bg, border, item padding, font |
| `HaloPagination` | Item size (24px), active bg |
| `HaloPaper` | Bg, border, border radius |
| `HaloPopover` | Bg, border, border radius, padding |
| `HaloProgress` | Circular sizes (16/24px), linear track/fill colors |
| `HaloRadioGroup` | Size (always small), FA icon names |
| `HaloRating` | Icon rendering |
| `HaloSelect` | Border states, chip styles, angle-down icon |
| `HaloSkeleton` | Background color |
| `HaloSlider` | Track/rail/thumb colors and sizes |
| `HaloSnackbar` | Bg (`#1F2227`), border, border radius, min-width (420px) |
| `HaloStepper` | Active/inactive/done states, connector color |
| `HaloSwitch` | Size (medium), track color/opacity |
| `HaloTabs` | Padding, font, active indicator, state label colors |
| `HaloTextField` | Border states per interaction (enabled/hovered/focused/disabled/error), label font, multiline height |
| `HaloToggleButtonGroup` | Active/inactive states, border radius, typography |
| `HaloTooltip` | Bg, border radius, max-width, font size |
| `HaloTree` | Indentation per level, expand icons, file icon weight (duotone), row padding |
| `theme.ts` | Palette ramps, semantic token mapping, component `styleOverrides`, dark mode palette, `accessibleColors` |

---

## Step 4 — Apply edits

Edit only the files identified in your change map. Use the `Edit` tool for targeted changes — do not rewrite files wholesale unless the spec has fundamentally changed.

Rules for every edit:
- **Use MUI theme tokens over hardcoded hex.** Prefer `bgcolor: 'background.alertError'` over `bgcolor: '#FFE1E1'` when a semantic token exists.
- **When a hardcoded value is unavoidable**, leave a short comment tracing it back to the spec — e.g., `// error/_states/outlinedBorder — rgba(233,65,96,0.5)`.
- **Never add `ThemeProvider` or `BrowserRouter` inside a halo component.**
- **Never reach for `@ds/ui-common-react`.** There is no GAR access in this repo — `src/theme/halo/` is the only path.
- **Icon imports** come from the vendored FA Pro packages (`@fortawesome/pro-light-svg-icons` for the default weight, `@fortawesome/pro-duotone-svg-icons` for file/tree icons). See `references/icons.md` in the `datasite-halo-design` skill for the full vocabulary.

---

## Step 5 — Verify build

After editing, run both checks:

```bash
npm run type-check
npm run build
```

Both must pass cleanly. If `type-check` fails, fix the type error — never cast to `any` to silence it. If `build` fails, read the rsbuild output and fix the root cause.

Do not proceed to Step 6 until both pass.

---

## Step 6 — Visual confirmation (required gate)

Start the dev server and share the URL with the designer:

```bash
npm start
```

Direct the designer to any prototype that exercises the updated components — or to the gallery home if the change is theme-level. The designer must review the result in the browser and give explicit approval before anything is committed.

**STOP here and wait.** Do not proceed until the designer says something like "looks good", "ship it", "approved", or equivalent. A passing build is not a substitute for visual sign-off.

If the designer requests changes, apply them, re-run Step 5, then return to this step.

---

## Step 7 — Commit and push to main

Only run this after both Step 5 (clean build) and Step 6 (designer visual approval) are complete.

Stage only the halo files that changed — never stage skill files, registry, or prototype code as part of a sync commit:

```bash
git add src/theme/halo/
git commit -m "fix(halo): sync components with updated datasite-halo-design skill"
git push origin main
```

Adjust the commit message to be specific — e.g. `fix(halo): update HaloDialog caution border to match updated token` or `fix(halo): refresh theme.ts accessibleColors ramp`.

Tell the designer: "Pushed. Live in ~5 min via Jenkins."

---

## What this skill does NOT do

- It does not modify prototypes under `src/projects/` — those are designer artifacts and don't need to track every halo change.
- It does not update `registry.ts`.
- It does not open a PR — changes go straight to `main` per the halo-app workflow.
- It does not modify the skill files themselves — those are the input, not the output.

---

## Ownership

- **Skill owner:** Halo Team (Irene / Annie)
- **Refresh cadence:** Whenever `datasite-halo-design` skill content changes
