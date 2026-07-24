---
name: halo-component-edit
description: >
  Use this skill whenever a designer wants to create a new Halo component, modify an existing Halo component, or change anything under `src/theme/halo/` — including theme tokens, component anatomy, color, spacing, typography, or styling. Also activates when a designer wants to update a skill file under `.claude/skills/datasite-halo-design/` (component-anatomy.md, theme-quirks.md, icons.md, etc.).

  Trigger on phrases like:
  - "create a new Halo component" / "add a component to the design system"
  - "update HaloButton" / "change the HaloDialog styling" / "fix the theme tokens"
  - "the Figma spec changed for [component]" / "new tokens in Figma" / "update the theme"
  - "modify the skill" / "update component-anatomy" / "edit theme-quirks"
  - Any change to `src/theme/halo/` or `.claude/skills/datasite-halo-design/`

  Do NOT activate for work inside `src/projects/` — that is prototype work and belongs to `halo-prototype-workflow`.
user-invocable: true
---

# Halo Component Edit Workflow

This skill governs any creation or modification of Halo components, the MUI theme, design tokens, or the `datasite-halo-design` skill files. These are **shared infrastructure** — every prototype and every designer in the repo inherits from them. Changes here have wide blast radius.

**Designers are free to build anything they like inside `src/projects/`.** This skill applies only when work touches `src/theme/halo/` or `.claude/skills/datasite-halo-design/`.

---

## Mental model

- **`src/projects/` is yours — `src/theme/halo/` is everyone's.** Prototype files belong to one designer; theme files affect the entire gallery and every prototype in it. That's why the approval gate exists.
- **Figma is the source of truth.** Never derive a token value, spacing measurement, or component structure from memory or prior code. Read it live from Figma using the MCP tools.
- **Halo-component-sync is the last required step.** After any edit to theme files or skill files, the sync skill verifies the full component library stays coherent. It is not optional.
- **Branch + PR, with a harder approval gate.** Unlike prototype work, Halo component changes go through a PR so the Halo Team can review the diff before anything merges. The sign-off authority is narrower: only the Halo Team may approve — both visually (Step 8) and via the PR review.

---

## Showing progress

Designers don't watch tool calls — they watch chat. To make the workflow legible, **post a markdown checklist as soon as Step 1 confirms the scope + owner approval, then re-post it after each step completes** so the designer can scan the latest message and know exactly where you are.

Use checkbox syntax (`- [ ] **Step N:**`) for progress tracking. Mark items `- [x]` only after they're actually done — never pre-check ahead of work, and never mark Step 8 done without the designer's explicit visual sign-off.

Template to post after Step 1:

```markdown
- [x] **Step 0:** Sync the repo
- [x] **Step 1:** Scope check + owner approval
- [ ] **Step 2:** Name the component (new) or identify what changes (existing)
- [ ] **Step 2b:** Create a working branch
- [ ] **Step 3:** Fetch Figma reference
- [ ] **Step 4:** Pull live tokens and design context from Figma
- [ ] **Step 5:** Read + compare current code to Figma spec
- [ ] **Step 6:** Verify direction ← confirm the design looks right before building
- [ ] **Step 7:** Apply edits
- [ ] **Step 8:** Preview in browser + visual sign-off ← stops here for sign-off
- [ ] **Step 9:** Commit, push branch, open PR
```

Re-post the updated checklist each time a step flips to `[x]` — the designer should always be able to find the current status in your most recent message without scrolling.

The build check (`npm run type-check && npm run build`) and `halo-component-sync` both run silently between Step 7 and Step 8 — the designer never sees them. They just see the live preview when everything is ready.

---

## Step 0 — Sync the repo

Always run this first:

```bash
git pull origin main
```

If the pull fast-forwards cleanly, continue. If there are conflicts, resolve them before touching any theme files — a stale or conflicted tree makes component diffs unreliable.

---

## Step 1 — Scope check and owner approval (required gate)

> ⚠️ **This is a protected area. Changes to `src/theme/halo/` and `.claude/skills/datasite-halo-design/` affect every designer on the team and every prototype in the gallery. Only the Halo Team may approve work in this scope.**

Post this message to the designer before doing anything else:

---

> **Hold on — this touches shared Halo infrastructure.**
>
> Anything under `src/theme/halo/` (components, theme, tokens) and the `datasite-halo-design` skill files is owned by the Halo Team and affects the entire design team. **Only the Halo Team can approve changes here.**
>
> - If you are on the Halo Team: confirm that and I'll continue.
> - If you are another designer: please reach out to the Halo Team before we proceed. They can either make the change themselves or give you explicit sign-off to continue.
>
> If you were trying to build a prototype (your own design exploration), that goes in `src/projects/` and you don't need anyone's approval — say "prototype" and I'll switch to the prototype workflow instead.

---

Wait for one of the following before continuing:
- **"I'm on the Halo Team"** or confirmation of Halo Team membership — proceed.
- **"Halo Team approved"** with explicit confirmation — proceed.
- Any message indicating the work should be a prototype instead — invoke `halo-prototype-workflow` and stop this skill.
- Silence or uncertainty — do not proceed. Repeat the message above if needed.

**Do not skip this gate.** Not even if the request seems minor (e.g., "just change one color"). Small theme changes ripple everywhere.

---

## Step 2 — Name the component or identify the target

### If this is a new component:

Ask the designer one focused question:

> "What should we call this new component? Use the `Halo` prefix — for example, `HaloTimeline`, `HaloStatusBadge`, `HaloPageHeader`."

Once the name is confirmed:
- Note the filename: `src/theme/halo/components/<ComponentName>.tsx`
- Note the export: add to `src/theme/halo/components/index.ts`
- Note whether this component needs a matching theme override in `src/theme/halo/theme.ts`

### If this is modifying an existing component:

Identify which file(s) will change:
- Component file: `src/theme/halo/components/Halo*.tsx`
- Theme overrides: `src/theme/halo/theme.ts`
- Skill reference: `.claude/skills/datasite-halo-design/references/component-anatomy.md` (if the spec itself is changing)

Write down the exact files before moving on.

---

## Step 2b — Create a working branch

After the component name is known (Step 2), create a branch before touching any files:

```bash
git checkout -b <designer>/<kebab-case-component-name>
```

**Branch naming convention:** `<designer-first-name>/<component-name-in-kebab-case>`

Examples:
- `paza/chip-component`
- `irene/halo-timeline`
- `annie/radio-button-fix`

If you don't know the designer's first name, ask:

> "What's your name? I'll use it for the branch name (e.g. `paza/chip-component`)."

All edits in Steps 3–7 happen on this branch. Never commit Halo work directly to `main`.

---

## Step 3 — Ask for the Figma URL or reference

Ask the designer:

> "Do you have a Figma URL or frame reference for this component? Figma is our source of truth for tokens, spacing, and structure — if you share a link or node, I'll pull the spec directly instead of guessing."

Two paths:

**If the designer provides a Figma URL:**
Parse the `fileKey` and `nodeId` from the URL:
- `figma.com/design/:fileKey/:name?node-id=:nodeId` — convert `-` to `:` in the nodeId.
- The `fileKey` MUST be `MocqvKfuogd2Re1tyFr4d4` — the ⭐ [HALO] Design System file. If the URL points to any other file (e.g. PROD MUI Library), STOP and ask the designer to share the link from the HALO Design System file instead. See Step 4 for why this matters.

Proceed to Step 4 with the extracted keys.

**If the designer says "no Figma / I don't have one":**
Acknowledge, then fall back to:
- The existing `component-anatomy.md` in `.claude/skills/datasite-halo-design/references/`
- The current component code as the baseline
- The designer's verbal description of what should change

Note this clearly in chat: "Working from current code + verbal description — no Figma spec. The result may need a follow-up sync once the Figma file is updated."

---

## Step 4 — Pull live tokens and design context from Figma

> ⚠️ **Use ONLY the ⭐ [HALO] Design System file** (`fileKey: MocqvKfuogd2Re1tyFr4d4`). Do NOT pull from PROD MUI Library or follow Code Connect links to other files — halo-app is intentionally ahead of production, and the wrong file silently downgrades prototypes to today's shipping visuals.
>
> **Wrong-file signals** (stop and re-query if you see these in `get_variable_defs`): Roboto font, `#1976d2` MUI primary, Material grey scales, Material Icons. Halo uses Figtree, gemstone palettes (tanzanite/moondust/jade/etc.), and FA Pro Light.

Run **all three** Figma MCP tools on the node:

### 4a — Variable definitions (token accuracy)

```
get_variable_defs
  fileKey: MocqvKfuogd2Re1tyFr4d4   # ⭐ [HALO] Design System — always
```

This pulls the full token set — color, spacing, radius, typography. **Quote token names verbatim from this output** in any code you write or change-map you post. Never substitute a memorized or approximated value, and never infer a token name from a hex you recognize — past sessions have mislabeled `#454EB0` as `tanzanite[700]` (real value: `#232F5F`) by recalling from training data.

### 4b — Design context (structure and anatomy)

```
get_design_context
  fileKey: MocqvKfuogd2Re1tyFr4d4   # ⭐ [HALO] Design System — always
  nodeId: <nodeId>
```

This returns the component's structure, hierarchy, layout, and any Code Connect mappings. Use this to understand padding, border treatments, state layers, and composition. **Ignore Code Connect links that point to a different fileKey** — they reference engineering's production code, not our design source.

### 4c — Screenshot (visual reference)

```
get_screenshot
  fileKey: MocqvKfuogd2Re1tyFr4d4   # ⭐ [HALO] Design System — always
  nodeId: <nodeId>
```

Capture the visual for comparison during the preview step (Step 9). Post it in chat so the designer can see what we're building toward.

After pulling all three, summarize what you found:

> "From Figma: [component name] uses [key tokens / spacing / border]. The structure shows [X layers / states]. Here's the visual: [screenshot]."

If any Figma value conflicts with the current code or skill files, flag it explicitly before editing anything:

> "There's a mismatch: Figma shows `border-radius: 6px` but the current code uses `4px`. Which is correct — should I update the code to match Figma?"

---

## Step 5 — Read and compare current code to Figma spec

Open every file identified in Step 2. For each one, compare current implementation to the Figma spec and write a change map:

```
HaloButton.tsx — border-radius on contained variant:
  Current:  borderRadius: 4
  Figma:    6px (from get_variable_defs → radius/button)
  Action:   Update to 6

theme.ts — MuiButton styleOverrides:
  Current:  fontWeight: 500
  Figma:    600 (from get_design_context → typography/label-medium)
  Action:   Update to 600
```

Do this for every divergence. Do not edit anything yet.

Post the full change map in chat. If the scope is large (more than ~5 changes), break it into groups by component and ask the designer to confirm scope before continuing:

> "I found [N] changes. Here's the full list — should I apply all of these, or just some?"

---

## Step 6 — Confirm the visual design for new components

Skip this step for modifications — the change map from Step 5 is sufficient.

For **new components**, confirm what it should look like before building anything. Post the Figma screenshot from Step 4c and ask:

> "Here's what I'm seeing in Figma for `HaloTimeline` — [screenshot]. Before I build it:
> - Are there different states to show (e.g. active, disabled, error)?
> - Any sizes or variations (e.g. compact vs. default)?
> - Anything in the Figma that looks wrong or that you'd like to change?
>
> Once you're happy with the direction, I'll build it and you can review it live in the browser."

Keep this conversation visual and design-focused. The agent handles all the engineering; the designer only needs to describe how it should look and behave.

---

## Step 7 — Apply edits

Edit only the files in your change map. Use the `Edit` tool for targeted changes. Only use `Write` for brand-new files.

Rules that apply to every edit:

- **Use MUI theme tokens over hardcoded hex.** `bgcolor: 'primary.main'` over `bgcolor: '#0057B8'`.
- **When a hardcoded value is required** (Figma spec uses a value with no semantic token), leave a one-line comment tracing it: `// radius/button — 6px`.
- **Never add `ThemeProvider` or `BrowserRouter`** inside a Halo component.
- **Never import from `@ds/ui-common-react`** — there is no GAR access in this repo. `src/theme/halo/` is the only path.
- **Icon imports** come from vendored FA Pro packages only: `@fortawesome/pro-light-svg-icons` (default weight), `@fortawesome/pro-solid-svg-icons`, `@fortawesome/pro-duotone-svg-icons`. See `datasite-halo-design/references/icons.md`.
- **For new components**, export from `src/theme/halo/components/index.ts` — consumers import from there, not the component file directly.
- **Update `component-anatomy.md`** if you changed or added something structural — the skill files must stay in sync with the code.

---

## Step 8 (silent) — Verify build passes

Run both checks silently after applying edits — do not mention this step to the designer:

```bash
npm run type-check
npm run build
```

Both must pass before opening the browser. If either fails, fix the issue and re-run until clean. Never surface build errors to the designer in technical terms — if something needs their input, describe it visually ("the button spacing broke, fixing now").

---

## Step 8 — Preview in browser (required visual gate)

Start the dev server:

```bash
npm start
```

Navigate the designer to a prototype that uses the updated or new component, or directly to `http://localhost:9000` for theme-level changes.

Post the Figma screenshot from Step 4c alongside the live URL so the designer can do a side-by-side comparison:

> "Dev server is running at `http://localhost:9000`. Here's the Figma spec [screenshot] — take a look at the live version and tell me what to adjust. When it looks right, say 'ship it' or 'looks good' and I'll run the sync check and push."

**STOP and wait.** Do not continue until the designer gives explicit approval — "ship it", "looks good", "approved", or equivalent. A clean build is not a substitute for visual sign-off.

If the designer requests changes: apply them, re-run Step 8, then return to this step.

---

## Step 10 (silent) — Run halo-component-sync

Run `halo-component-sync` silently after the build passes and before opening the browser — do not surface this step to the designer. It verifies the full component library stays coherent and catches any secondary components that need updating.

If `halo-component-sync` surfaces additional changes, apply them and re-run the build check before proceeding to the browser preview. Never open the preview until both the build and the sync check are clean.

---

## Step 9 — Commit, push branch, and open PR

Only run after the build (silent), sync check (silent), and visual sign-off in the browser are all complete.

Stage only theme and skill files — never mix prototype changes into a theme commit:

```bash
git add src/theme/halo/
git add .claude/skills/datasite-halo-design/   # only if skill files changed
git commit -m "fix(halo): <specific description of what changed>"
git push -u origin <branch-name>
```

Use a specific commit message — not generic. Good examples:
- `fix(halo): update HaloButton border-radius to 6px per April 2026 Figma spec`
- `feat(halo): add HaloTimeline component`
- `fix(halo): refresh theme.ts primary palette from latest Figma tokens`

Then open a PR:

```bash
gh pr create \
  --base main \
  --title "fix(halo): <same description as commit>" \
  --body "$(cat <<'EOF'
## What changed
<1–3 bullet points describing the change>

## Figma reference
<Figma URL or "No Figma spec — change based on verbal description">

## Visual sign-off
Designer confirmed the live preview matches the Figma spec before this PR was opened.

## Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
- [ ] `halo-component-sync` ran clean
- [ ] Visual sign-off from designer
EOF
)"
```

Tell the designer the PR URL and:

> "PR is open for Halo Team review. Once approved and merged, it'll be live in ~5 min via Jenkins. You can share the PR link with the Halo Team for review."

---

## What this skill does NOT do

- It does not touch `src/projects/` — prototype files are out of scope here.
- It does not modify `src/projects/registry.ts`.
- It does not merge the PR — that is the Halo Team's job after reviewing.
- It does not replace the `halo-component-sync` skill — it calls it.

---

## Ownership

- **Skill owner:** Halo Team
- **Protected files:** `src/theme/halo/`, `.claude/skills/datasite-halo-design/`
- **Prototype work (not this skill):** `src/projects/` → use `halo-prototype-workflow`
- **Post-push status:** see `halo-prototype-deploy`
