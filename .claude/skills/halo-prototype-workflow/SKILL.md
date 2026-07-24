---
name: halo-prototype-workflow
description: Use this skill whenever a Datasite designer wants to spin up a new prototype, mockup, or design exploration in `halo-app`, including phrases like "I want to prototype X", "let's try a design for Y", "build me a quick demo of Z", "test out a new design", or "I have an idea I want to mock up". Activate eagerly — do not wait for the word "prototype". Any signal that they want to explore design work in code in this repo should trigger this skill. The skill is agent-driven: the agent does the scaffolding, file creation, registry edits, dev-server start, build verification, and the direct push to `main`. The designer guides the look-and-feel and approves the final result in the browser.
user-invocable: true
---

# Halo App Prototype Workflow

This skill is the canonical playbook for designers (and the agents helping them) to add a new prototype to `halo-app`. The goal is a near-hands-off experience: the designer describes what they want and approves the visual result; the agent handles every piece of engineering plumbing.

## Reference files

Topic-specific deep dives live alongside this skill. Load on demand:

- `references/shell-customization.md` — `DatasitePrototypeShell` props, customization axes, import map, what-not-to-do inside a prototype. Load when the prototype needs the Datasite app chrome.
- `references/anti-patterns.md` — "When something doesn't fit" + the full anti-patterns list. Load when something feels off-pattern.

---

## Mental model — what we're optimizing for

- **Designers think in screens and interactions, not files.** The agent handles all folder structure, naming conventions, manifest registration, build checks, and git.
- **Every prototype is a small React component inside one shared MFE bundle.** No per-prototype `package.json`, no Vite config, no theme provider, no router. The shell already provides MUI + the Halo theme + breadcrumb chrome + routing. A prototype is just a default-exported React component.
- **The only file the designer ever edits is the visual content of the prototype itself.** The agent edits everything else (scaffold + registry + commits).
- **The Datasite app shell is opt-in.** Many prototypes (focused dialog/alert explorations, MUI component catalogs, single-screen mockups, micro-interactions) read more clearly rendered bare — the shell's chrome adds noise around a small focused exploration. Ask the designer at scaffolding time whether the prototype needs the Datasite app shell or should render on its own. Default to **bare** if it isn't obvious. When the answer is yes, see `references/shell-customization.md` for the props and import map.
- **Halo-grounded by default.** Prototypes use the Halo bridge theme at `src/theme/halo/`. Wrappers like `HaloDialog`, `HaloEmptyState`, etc. are available from `~/theme/halo/components`. Don't hardcode hex values; ask the `datasite-halo-design` skill for tokens when in doubt.
- **No unit tests for prototypes — ever.** Prototypes are throwaway design artifacts; the cost of maintaining tests for them outweighs any value. The repo has tests for the gallery wrapper/harness (filtering, sorting, breadcrumb, search) but **never** for individual prototypes under `src/projects/`. Don't scaffold test files. Don't run `npm test` against prototype code. Don't build mocks or fixtures. If `npm run build` succeeds, that's the only engineering check this workflow needs.
- **Designers push directly to `main` — no pull requests.** This is intentional. Designers should not have to learn PR review processes. Two skill-encoded guardrails replace the PR gate: (a) the agent confirms `npm run build` succeeds, and (b) the designer reviews and explicitly approves the prototype in the browser. The agent must never push without both.
- **Push → Jenkins → live.** Pushing to `main` triggers Jenkins to ship the bundle to the internal Datasite app automatically. No manual publish step. The `halo-prototype-deploy` skill explains what happens after push.

If any of this doesn't fit the request, surface it to the designer before scaffolding — don't silently invent a different convention. See `references/anti-patterns.md`.

---

## Workflow at a glance

```
0.  Sync the repo                (git pull origin main — always first)
1.  Confirm intent + name        (what are we building, what's it called)
1.5 Pull upstream context        (prototype-context skill — JPD/PRD/Jira via Atlassian MCP)
2.  Invoke datasite-halo-design  (review tokens & components)
2.5 Confirm audience             (audience skill — infer + confirm persona/ICP)
2.6 Persona-lens framing         (persona skill Mode 1 — only if brief is thin)
3.  Scaffold the prototype       (agent creates folder + index.tsx + components + BRIEF.md)
4.  Register in the manifest     (agent edits src/projects/registry.ts — includes audience tag)
5.  Build the prototype          (Halo-grounded React + MUI)
6.  Start dev server in browser  (agent runs `npm start` — auto-opens)
7.  Designer review + approval   (STOP and wait for explicit approval)
7b. Override cleanup (optional)  (agent scans + offers to fix — designer decides)
7c. Persona walkthrough          (persona skill Mode 2 — live preview, advisory rating)
8.  Verify build passes          (agent runs `npm run build` — must succeed)
9.  Commit + push to main        (only after approval AND a clean build)
10. Hand off to deploy skill     (Jenkins ships it automatically — see halo-prototype-deploy)
```

**Steps 2, 7, and 8 are the required gates** — they replace the PR review process. Step 2 keeps the prototype on-brand; Step 7 is the only visual review checkpoint before stakeholders see the work; Step 8 is the engineering correctness gate that prevents pushing a broken bundle to `main`. Steps 1.5, 2.5, 2.6, 7b, and 7c are optional or conditional but always considered.

---

## Showing progress to the designer

Designers don't watch tool calls — they watch chat. To make the workflow legible, **post a markdown checklist as soon as Step 1 confirms the name + title, then edit it inline as each step completes** so the designer can scan the latest message and know exactly where you are.

Use checkbox syntax (`- [ ] **Step N:**`) for progress tracking. Mark items `- [x]` only after they're actually done — never pre-check ahead of work, and never mark Step 7 done without the designer's explicit "ship it".

Template to post after Step 1:

```markdown
- [x] **Step 0:** Sync the repo
- [x] **Step 1:** Confirm intent + name
- [ ] **Step 1.5:** Pull upstream context (JPD/PRD/Jira)
- [ ] **Step 2:** Halo design check
- [ ] **Step 2.5:** Confirm audience (persona or ICP)
- [ ] **Step 2.6:** Persona-lens framing (if brief is thin)
- [ ] **Step 3:** Scaffold prototype files
- [ ] **Step 4:** Register in manifest
- [ ] **Step 5:** Build the prototype
- [ ] **Step 6:** Start dev server
- [ ] **Step 7:** Designer review + approval ← stops here for sign-off
- [ ] **Step 7b:** Override cleanup (optional) ← offered after approval
- [ ] **Step 7c:** Persona walkthrough (advisory rating)
- [ ] **Step 8:** Verify build passes
- [ ] **Step 9:** Commit and push to main
- [ ] **Step 10:** Jenkins deploy hand-off
```

Re-post the updated checklist each time a step flips to `[x]` — the designer should always be able to find the current status in your most recent message without scrolling.

---

## Step 0 — Sync the repo

**Always run this before touching any files.** Multiple designers share `main` directly — no feature branches. Your local clone can be behind if someone else pushed since your last session. Starting work without pulling risks building on a stale tree and needing extra sync work at push time.

From the repo root:

```bash
git pull origin main
```

If the pull fast-forwards cleanly, continue immediately.

If the pull reports conflicts, follow the **Handling sync conflicts** section below to resolve them before scaffolding. Never scaffold new prototype files over a conflicted tree.

**Do not create a feature branch.** Designers commit on `main` directly.

---

## Step 1 — Confirm intent and name (in plain English)

Before scaffolding, the agent asks the designer in a single message:

1. **Designer name** — your first name (e.g. `Annie`, `JT`, `Sean`). This is how your prototypes are grouped in the gallery and how the **designer filter chip** works on the gallery homepage — clicking your name shows only your work. Use a consistent name across all your prototypes. If the designer is new, ask what name they want to appear under in the gallery going forward.
2. **Prototype title** — short, human-readable: "Alert Dialog Options", "Deal Room Empty State". The agent will derive a kebab-case slug automatically.
3. **The design question** — one sentence. What is this exploring? Useful for the card description on the gallery and the PR title.
4. **Datasite Product Shell — yes or no?** — most prototypes don't need it. Wrap your prototype with the `DatasitePrototypeShell` (top bar, left nav, profile menu) **only** when the design question genuinely benefits from production-like chrome — e.g., navigation flows, page-in-app mockups, anything where chrome IS the design question. Skip it for focused explorations: dialog/alert variants, component catalogs, micro-interactions, single-screen mockups, anything where the chrome is decoration around the real subject. **If unsure, default to no** — the prototype can be wrapped later in seconds.
6. **If the designer is bringing in an existing HTML file as a reference,** always convert colors and components to Halo theme tokens and Halo MUI components — no exceptions, no question asked. This is required for light/dark mode to work correctly. Hardcoded hex values from HTML files will break dark mode. If a color has no direct Halo token equivalent, pick the closest token and flag it to the designer — never fall back to hardcoding. **Important:** always use Halo MUI components from `~/theme/halo/components` and MUI imports from `@mui/material` — never pull in MUI components from other repos or `ds-ui-libraries`. The legacy theme from `ds-ui-libraries` requires GAR auth (which this repo intentionally doesn't use) and is being replaced by the new Halo theme shortly — there is no valid reason to use it here.

5. **If yes to the shell, what's customized?** — ask explicitly: which `productMode` (`home` / `diligence` / `acquire` / `pipeline` / `prepare` / `archive`) is the closest fit, OR is this a **brand-new offering type** that needs a custom `productName` + custom `navItems` (e.g., "Deal Intelligence" with "Active Projects" + "Market Intelligence")? Does the prototype need a different `user` than the default? Does the top-bar action cluster need overrides (custom `topBarActions`)? Should the nav start expanded (`defaultExpanded`) or collapsed? Most of the design question for a shell-using prototype lives in *what's customized*, not the chrome itself — surface this up front so the scaffold lands correctly the first time. See `references/shell-customization.md` for the full prop list.

If the designer already gave the first three answers in their initial message, confirm what you heard and ask questions 4–5 explicitly. The shell question and its customization axes are the most-skipped, and they materially shape the scaffold.

**App logo detection:** If the designer's description mentions any of the following — `marketplace`, `apps`, `app switcher`, `app menu`, `top nav apps`, `cross-sell`, `cross-sale`, `dashboard apps`, `upsell`, or any app name (`Grata`, `Blueflame`, `Blueflame Research`, `Diligence`, `Acquire`, `Sherpany`, `Valu8`, `Ansarada`, `Firmex`, `Similar Companies`, `Prepare`, `Market Mapper`, `Ontra`, `Mergerlinks`, `Thinkcell`, `Watermark`, `CIM Summary`, `Convert Excel`, `Doc Comparison`, `E-Signature`, `Rapid Redact`, `Translate`, `Pipeline`, `Outreach`, `Archive`, `Project Dashboard`, `Mobile`, `Datasite APIs`, `Deep Research`) — add one question to the Step 1 intake message: *"This looks like it involves Datasite app logos — want to use the real SVGs from `src/assets/app-logos/`?"* If yes, load `datasite-halo-design/references/app-logos.md` before Step 3 scaffolding so you know the exact filenames and import pattern.

**Language rule:** Never use the word "folder" when asking the designer for their name. Always frame it in gallery terms — e.g., "What name should I list your prototypes under in the gallery?" not "What folder should I put this under?" Designers think in gallery cards and filter chips, not file system paths.

The agent computes:

- **Slug**: `<designer>-<title>` lowercased with non-alphanumerics replaced by `-`. Example: `Steven` + `Alert Dialog Options` → `steven-alert-dialog-options`.
- **Folder name**: PascalCase version of the title. Example: `AlertDialogOptions`.
- **Final folder**: `src/projects/<Designer>/<PascalName>/`.

These are agent-side mechanical conversions. The designer never types kebab-case or PascalCase.

---

## Step 1.5 — Pull upstream context (prototype-context skill)

**Invoke the `prototype-context` skill before any design work begins.** Many prototypes are driven by an upstream JPD ticket, PRD, or Jira story that already defines the target persona, JTBD, and success criteria. Re-asking the designer for that information is noisy and wastes time; pull it once via Atlassian MCP and the rest of the workflow has a real brief to anchor on.

The `prototype-context` skill asks the designer:

> "Got a JPD, PRD, or Jira ticket driving this? Paste a URL or ticket ID. If exploratory, say 'no upstream'."

Then it either:

- **Fetches via Atlassian MCP** (one hop max — no transitive crawling) and distills into a prototype brief, OR
- **Falls back to manual paste** if Atlassian MCP isn't available for this designer, OR
- **Returns a minimal brief** if the designer is doing pure exploratory work.

The skill writes the brief to `src/projects/<Designer>/<PascalName>/BRIEF.md` after scaffolding (Step 3) so the brief becomes part of the gallery artifact. Future designers and AI reviewers can see why the prototype exists.

**Detected fields from the brief** carry into the next two steps:

- **Persona mention** → pre-fills the audience selection in Step 2.5
- **JTBD + success criteria** → lets Step 2.6 skip the framing question entirely (no double-asking)
- **Success criteria** → becomes the rubric for Step 7c's persona walkthrough

See `.claude/skills/prototype-context/SKILL.md` for the full skill behavior, fallback modes, and what fields it extracts.

---

## Step 2 — Invoke the Halo Design skill

**Before generating any UI code,** invoke the `datasite-halo-design` skill. It confirms the current Halo tokens (colors, spacing, typography), the available wrapper components, and which icon set to use.

Do NOT skip this step. Hardcoding hex values, MUI versions, or theme behavior from memory will produce a prototype that drifts from the real design system.

If the Halo skill surfaces a stack-version mismatch or a Figma-vs-bridge diff, mention it to the designer before continuing.

**Confirm Halo wrapper components silently.** Based on the prototype's scope, identify which Halo wrappers from `~/theme/halo/components` apply — dialogs, alerts, switches, menus, trees, etc. — and plan to use them. Do not mention this to the designer. If the designer explicitly asks to use a base MUI component where a Halo wrapper exists, note it as a known deviation and proceed — but never default to base MUI when a wrapper is available.

---

## Step 2.5 — Confirm audience (audience skill)

**Invoke the `audience` skill** to anchor the prototype to a specific persona or ICP before code generation begins. This is JT's buying-vs-interaction split applied at the right moment: the prototype gets built with the right audience profile loaded into context, so component choices and copy decisions align automatically.

The skill behavior:

1. **If the brief from Step 1.5 named a persona** → pre-confirm in one line, skip the routing question. Example: *"Brief named Daniel (Sell-Side) — loading his profile."*
2. **If the brief didn't name one** → infer from the design question (pricing/positioning = buying = ICP; in-product workflow = interaction = persona) and confirm with the designer using checkboxes.
3. **Variant selector** appears when the persona has variants (Daniel has a Corp Dev variant as of May 2026).
4. **Multi-select** is allowed when a prototype legitimately serves multiple personas (dashboards spanning Daniel + Desmond, for example).

The selection is recorded in three places:

- Working context (so the rest of the workflow uses it)
- BRIEF.md under `## Audience` (artifact persistence)
- The registry entry as `audience: ['daniel']` at Step 4 (so gallery filters can use it)

See `.claude/skills/audience/SKILL.md` for routing heuristics, edge cases, and the underlying split.

---

## Step 2.6 — Persona-lens framing (persona skill Mode 1, conditional)

**SKIPPED automatically when the brief from Step 1.5 already contains both a defined JTBD and at least one measurable success criterion.** Re-asking those questions is the "noisy double-ask" we explicitly want to avoid.

**Invoke the `persona` skill (or `icp` skill) Mode 1** when the brief is thin or exploratory. The skill asks the designer, in the persona's first-person voice:

> 🎯 Persona-lens check — I'm <Persona>.
>
> Before you build, help me see this through my eyes:
>   1. What problem are you solving for me?
>   2. Which of my jobs-to-be-done does this hit?
>   3. How will my day be measurably better?

The designer's 2-3 sentence answer becomes the **intent anchor** for the rest of the workflow and the rubric for the Step 7c walkthrough. It's appended to BRIEF.md under `## Persona-lens framing`.

This step is intentionally fast — 30 seconds tops. Don't gatekeep. If the designer's answer is vague, one follow-up question, then move on.

See `.claude/skills/persona/SKILL.md` Mode 1 for full behavior.

---

## Step 3 — Scaffold the prototype (agent does this)

The agent creates two files. The designer doesn't type any of this.

```
src/projects/
└── <Designer>/                       (e.g., Annie)
    └── <PascalName>/                 (e.g., AlertDialogOptions)
        ├── index.tsx                 (default-exported route component)
        └── components/
            └── <PascalName>.tsx      (the actual prototype UI)
```

**`index.tsx`** is a thin shell — keep it boring:

```tsx
import AlertDialogOptions from './components/AlertDialogOptions';

export default function AlertDialogOptionsPrototype() {
  return <AlertDialogOptions />;
}
```

**`components/<PascalName>.tsx`** is where the actual prototype lives. The default shape is bare — the prototype IS the focal point:

```tsx
import { Box, Typography } from '@mui/material';
import { HaloDialog } from '~/theme/halo/components';

export default function AlertDialogOptions() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Alert Dialog Options</Typography>
      {/* … your design exploration … */}
    </Box>
  );
}
```

**If the designer answered "yes" to the shell question (Step 1, question 4):** wrap the prototype in `DatasitePrototypeShell` and customize via props. **Load `references/shell-customization.md`** for the full prop reference, customization examples, import map, and what-not-to-do list. Don't try to remember the prop names from earlier prototypes — they evolve.

### Icons in new prototypes

Import from the vendored FA Pro packs — `@fortawesome/pro-light-svg-icons` is the default weight (matches Halo). Pro Solid for high-contrast, Pro Duotone for file-type icons. Example:

```tsx
import { faGear, faPlus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
```

**Only import from FA Pro packs** (`pro-light-svg-icons`, `pro-solid-svg-icons`, `pro-regular-svg-icons`, `pro-duotone-svg-icons`, `duotone-light-svg-icons`). Free FA packages have been removed from this repo. See `datasite-halo-design/references/icons.md` for the full pack/weight policy and the Figma-sourced icon catalog at `src/assets/icons/halo-icon-list.md`.

---

## Step 4 — Register in the manifest (agent does this — load-bearing!)

The gallery doesn't auto-discover prototypes. **Until the agent edits `src/projects/registry.ts`, the prototype is invisible.**

Open `src/projects/registry.ts` and add an entry to the array:

```ts
{
  slug: 'annie-alert-dialog-options',           // kebab-case, globally unique
  type: 'project',                              // 'project' or 'lab'
  discipline: 'product',                        // 'product' | 'information' | 'documentation'
  designer: 'Annie',                            // matches the folder name
  title: 'Alert Dialog Options',                // shown on the card
  description:
    "Three MUI-based alert dialog layouts for Datasite's investment banker persona.",
  updatedAt: '2026-04-29',                      // YYYY-MM-DD; today
  audience: ['daniel'],                         // from Step 2.5; optional but populate when known
  component: lazy(() => import('./Annie/AlertDialogOptions')),
},
```

Notes for the agent:

- `slug` must be unique across all entries. If it collides, rename — typically by adding a qualifier (`-v2`, `-empty-state`).
- `type` is `'project'` for normal prototypes, `'lab'` for one-off experiments under the Labs filter chip.
- `updatedAt` is today's date in YYYY-MM-DD. The agent fills this in automatically.
- `audience` is optional but should be populated whenever Step 2.5 produced an answer. Values are kebab-case persona/ICP slugs matching the files in `.claude/skills/persona/references/` and `.claude/skills/icp/references/` (e.g. `'daniel'`, `'daniel-corpdev'`, `'desmond'`, `'deborah'`, `'mcp-icp'`). Multi-persona prototypes get multiple entries.
- The `lazy(() => import(...))` path is relative to `src/projects/`. Match the folder structure exactly.

Designers don't read or write this file directly — they describe the prototype and the agent edits the registry.

---

## Step 5 — Build the prototype

This is the creative work. The Halo skill is the source of truth for _what_ to build (tokens, components, patterns). This skill stops at _where_ and _how_ to ship it. A few reminders:

- **Lean on standard MUI components first.** Most of what designers want is a styled Button, Card, Table, Dialog, etc. — all already themed by the Halo bridge.
- **Use the Halo wrapper components when they fit.** They exist precisely so prototypes don't diverge.
- **Use Datasite domain language in placeholder content** — deal rooms, diligence, trackers, archives. Generic Lorem Ipsum makes the prototype feel disconnected.
- **Keep prototypes focused on one design question.** Multi-screen flows are fine but don't build a whole product surface for one question.
- **Iterate visually, not through code-review cycles.** The dev server in Step 6 hot-reloads — designers can ask "make the title bigger" or "what if the buttons were stacked" and the agent edits live.

---

## Step 6 — Start the dev server

The agent runs:

```bash
npm install   # only needed first time after a fresh clone or new dependencies
npm start
```

This boots the rsbuild dev server and **automatically opens the browser** at `http://localhost:9000`. There are no certificates, no HTTPS, no mkcert — designers do not need to install anything beyond Node.

When `npm start` is running, code changes hot-reload in the browser instantly. The agent runs the dev server in the background (`run_in_background: true`) so it can keep editing files in response to designer feedback.

If the browser doesn't auto-open (rare; usually Linux/headless edge cases), the agent posts the URL `http://localhost:9000/projects/<slug>` in chat as a fallback.

---

## Step 7 — Designer review and approval (required gate)

This is **the only visual review checkpoint** between the agent and the live Datasite URL. It is **not optional**, and the agent MUST stop and wait for explicit approval before running the build check, committing, or pushing.

The flow:

1. **Agent ensures the dev server is running** (Step 6) and the prototype renders at `http://localhost:9000/projects/<slug>` (or `/labs/<slug>` for labs).
2. **Agent says, in chat**: "Dev server is running and your browser should have opened — take a look at the prototype at `http://localhost:9000/projects/<slug>` and let me know what to change.

> ⚠️ **This URL is only visible on your computer.** It's a local dev server — no one else can see it yet, even if you share the link. When you're happy with it, say **"commit and push"** and I'll push it. No branch needed — prototype work goes straight to main. It'll be live at **https://halo.dev.dsite.io** for anyone on the Datasite VPN in about 5 minutes.

Also worth knowing: you can pull code from any other prototype already in the gallery — just describe what you want to reuse and I'll grab it."
3. **Agent does NOT run `git add`, `git commit`, or `git push`** until the designer responds with words like "ship it", "looks good", "approve", "yes go", "send it". Silence is not approval. "I'm looking" is not approval.
4. **If the designer asks for changes**, the agent edits the prototype, the dev server hot-reloads, and we loop back to step 2 here.
5. After explicit approval, the agent stops the dev server cleanly and proceeds to Step 8.

Why this gate matters: pushing to `main` is what makes the prototype public — Jenkins immediately starts shipping it to the internal Datasite app. There is no PR review, no preview environment, no easy "unpublish". The designer-review step is the only thing standing between an agent's confident "the build passed" and the rest of the org seeing a half-baked artifact.

---

## Step 7b — Override cleanup (optional)

**Triggered automatically after Step 7 approval, before the build check.** The agent scans the prototype files and offers to fix anything that drifts from Halo standards. The designer decides whether to accept — this step never blocks the push.

### What the agent scans for

1. **Hardcoded hex colors** — any `'#XXXXXX'` or `rgba(...)` literal that isn't coming from an imported Halo token (moondust, citrine, topaz, amber, emerald, amethyst, jade, etc.)
2. **Raw font sizes** — `fontSize: 13` or `fontSize: '0.875rem'` where an MUI typography variant (`body2`, `caption`, `subtitle2`, etc.) would do the same job
3. **Base MUI components where a Halo wrapper exists** — using `Dialog` instead of `HaloDialog`, `Alert` instead of `HaloAlert`, `Switch` instead of `HaloSwitch`, etc. Halo wrappers are in `~/theme/halo/components`
4. **Inline `style={{}}` props** — these bypass the MUI theme entirely; should be `sx` or moved into the theme

### How to run the scan

After the designer approves in Step 7, the agent scans the prototype's component files and posts a compact summary:

```
Override scan — AlertDialogOptions
──────────────────────────────────
Hardcoded colors   2   (#1A1A18 line 34, rgba(0,0,0,0.5) line 89)
Raw font sizes     1   (fontSize: 13 line 102)
Base MUI dialogs   0
Inline style={{}}  3   (lines 44, 67, 201)
```

If nothing is found: skip this step entirely and proceed straight to Step 8 — don't mention it.

If issues are found, the agent asks **one question**:

> "Found a few style overrides in the prototype — want me to clean them up before pushing? It takes about a minute and keeps the prototype consistent with Halo."

- **"Yes" / "sure" / "go for it"** → agent fixes all findings, hot-reloads the dev server, and confirms the prototype still looks correct before proceeding to Step 8.
- **"No" / "skip" / "leave it"** → agent marks Step 7b skipped in the checklist and proceeds to Step 8. No guilt, no follow-up.
- Silence or no reply after 2+ minutes → treat as "skip" and proceed.

### Fixing overrides

When the designer says yes, the agent applies these substitutions in order:

| Found | Replace with |
|---|---|
| Hardcoded hex color | Closest Halo token import from `~/theme/halo/theme` (moondust, gemstone, etc.) |
| `rgba(25,25,25, X)` opacity pattern | `alpha(moondust[900], X)` using MUI's `alpha()` |
| Raw `fontSize` number/string | Nearest MUI typography variant on the component |
| `<Dialog>` | `<HaloDialog>` from `~/theme/halo/components` |
| `<Alert>` | `<HaloAlert>` from `~/theme/halo/components` |
| `<Switch>` | `<HaloSwitch>` from `~/theme/halo/components` |
| `style={{}}` with layout values | `sx={{}}` equivalent |

**Do not over-fix.** If a color has no reasonable Halo token equivalent (e.g. a brand-specific gradient, a chart palette, file-type icon colors), leave it as-is and note it in the summary — don't invent tokens. The goal is removing accidental drift, not scrubbing every design decision.

After fixing, re-run the dev server preview to confirm the prototype still renders correctly — a token swap should be invisible visually. If anything looks wrong, revert that specific change and note it.

---

## Step 7c — Persona walkthrough (persona skill Mode 2, advisory)

**Invoke the `persona` skill Mode 2** (live preview walkthrough) after Step 7 approval and Step 7b override cleanup, before Step 8 build verify. This is a synthetic AI gut-check — purely advisory, never gates the push.

The agent drives the prototype as the persona using Claude Preview tools (`preview_click`, `preview_fill`, `preview_snapshot`, etc.), narrates in the persona's first-person voice, and returns an advisory rating /10 with friction points and a quote.

**Skip this step entirely when:**

- The prototype is a pure component catalog or reference (no task to complete from a persona's POV)
- The audience selection at Step 2.5 was `none` / `exploratory`
- Preview tools fail or dev server isn't reachable → fall back to "code-read" mode silently

**Output is advisory, not a gate.** After the walkthrough, the agent asks one question:

> "Push as-is, or want to iterate first? (Rating is advisory — your call.)"

Whatever the designer says, respect it. Designer can push at 4/10 — prototypes are exploratory.

**Important framing — always include the disclaimer in the output:**

> ⚠ This is a synthetic persona check, not user research. Real <Persona> may disagree. Use as a cheap first reviewer, not validation.

See `.claude/skills/persona/SKILL.md` Mode 2 for the full output format, rating heuristic, and multi-persona handling.

---

## Step 8 — Verify the build passes (required gate)

Before committing, the agent runs:

```bash
npm run build
```

This must complete with no errors. The build catches:

- TypeScript type errors anywhere in the prototype
- Broken imports (typos in paths, missing exports)
- Bridge-component misuse the type system can flag
- Anything else that would cause Jenkins to fail after push

If the build fails, the agent fixes the issue and re-runs. **Do not push a broken build to `main`.** This step replaces the CI quality gate that a PR review process would normally provide.

**Do not run `npm test` for prototype work.** Prototypes don't have unit tests, and adding new prototypes only touches `src/projects/<Designer>/<PascalName>/` plus `src/projects/registry.ts` — none of which the existing test suite covers. Running `npm test` here is wasted time. If the workflow ever requires editing the gallery wrapper (`src/shell/`), that's a different kind of change and the agent should re-evaluate; for normal prototype work, the build check alone is the gate.

---

## Step 9 — Commit and push directly to `main`

**Designers commit directly to `main`. No feature branches. No pull requests.** Reach this step only after Steps 7 and 8 have both passed.

### 9a — Re-sync immediately before committing

Because multiple designers work simultaneously, run a quick sync right before committing to shrink the window where a conflict can occur:

```bash
git pull origin main
```

If this pull is clean, continue. If it produces conflicts, follow the **Handling sync conflicts** section — resolve them, re-run `npm run build` to confirm the merged tree still passes, then return to 9b.

### 9b — Commit and push

```bash
git add src/projects/<Designer>/<PascalName> src/projects/registry.ts
git commit -m "feat: add <Designer>'s <Title> prototype"
git push origin main
```

The commit message follows conventional-commits style — `feat:` for new prototypes, `fix:` for tweaks to existing ones.

### 9c — If push is rejected

A rejection means another designer pushed between your pull and your push — this is normal and expected. Handle it automatically without surfacing git terminology to the designer; just tell them "syncing with another designer's recent update, one moment…":

```bash
git pull --rebase origin main
```

Then resolve any conflicts per the **Handling sync conflicts** section and push again:

```bash
git push origin main
```

If this second push is also rejected (two very close simultaneous pushes), repeat 9c once more. After three failed push attempts in a row, tell the designer "Having trouble syncing — could you give me 30 seconds and I'll try again?" then retry once more before asking for help.

---

## Handling sync conflicts

This section applies any time a `git pull` or `git pull --rebase` reports a conflict — whether at Step 0, Step 9a, or Step 9c. The designer never needs to see or understand any of this; the agent resolves it silently and confirms in plain language ("Got it, synced with Annie's recent changes — continuing now.").

### Principle: prototype work almost never produces real conflicts

Each prototype lives in its own folder (`src/projects/<Designer>/<PascalName>/`). Two designers scaffolding at the same moment create files in completely different directories — git merges those automatically with no conflict. The only file that routinely conflicts is `src/projects/registry.ts`, because every new prototype appends one entry to the same array.

### Resolving a `registry.ts` conflict

A `registry.ts` conflict almost always looks like this — two designers each added an entry at the end of the array at the same time:

```
<<<<<<< HEAD
  {
    slug: 'annie-alert-dialog-options',
    ...
  },
=======
  {
    slug: 'jt-deal-room-empty-state',
    ...
  },
>>>>>>> origin/main
```

The correct resolution is **keep both entries**. Remove the conflict markers and include both objects in the array, in either order:

```ts
  {
    slug: 'annie-alert-dialog-options',
    ...
  },
  {
    slug: 'jt-deal-room-empty-state',
    ...
  },
```

After editing, stage the resolved file and continue the rebase:

```bash
git add src/projects/registry.ts
git rebase --continue   # if mid-rebase
# — or —
git add src/projects/registry.ts
git merge --continue    # if mid-merge
```

### Resolving a conflict in a prototype folder

If two designers happen to have the same `<PascalName>` (e.g., both chose "EmptyState"), their folders will appear to conflict. The right fix is to rename one — the agent picks the less-recently-created one and adds a qualifier (`-V2`, the designer's name prefix, or a topic suffix). Rename the folder and update the registry entry, then stage and continue.

### After any conflict resolution

1. Run `npm run build` again to confirm the merged tree compiles cleanly.
2. If the build passes, proceed to push.
3. If the build fails due to the merge (e.g., an import path broke during a folder rename), fix it before pushing.

### What to say to the designer

Designers don't need to know about git mechanics. Use language like:

- "Another designer just pushed some changes at the same time — I've synced everything up, no action needed from you."
- "Quick sync needed — got the latest from Annie's session and continuing now."
- "Merged in JT's new prototype alongside yours, all good."

Never use the words "conflict", "rebase", "merge", "HEAD", or "origin/main" in messages to designers.

---

## Step 10 — Hand off to the deploy skill

After the push completes, tell the designer what's next in plain language:

> "Pushed! Jenkins is building it now — your prototype will be live in about 5 minutes at:
>
> 🔗 **https://halo.dev.dsite.io/projects/\<slug\>**
>
> Anyone on the Datasite VPN can open that link — no GitHub access needed. You can also find it on the gallery homepage at **https://halo.dev.dsite.io** under your name. Run `/halo-prototype-deploy` if you want to check Jenkins build status."

---

## PR and merge rules

**Never create a pull request or merge a branch unless the designer explicitly says so.** This applies even when all changes are ready to ship, even when there are no conflicts, and even when the designer previously asked you to "commit and push" or "wrap this up."

The phrases that authorize a PR are things like: "create a PR", "open a PR", "make a pull request", "go ahead and merge", "merge it", "ship the PR."

The phrases that do **not** authorize a PR: "commit the changes", "push this up", "wrap this up", "looks good", "done", "finish this", "save it."

When work is committed and pushed to a branch, simply confirm that it's pushed and wait. Do not volunteer to create a PR or merge on the designer's behalf. The designer will ask when they're ready.

**When creating a PR, always add the `reviewer-app` label** immediately after the PR is created — before merging. Use `gh pr edit <number> --add-label "reviewer-app"`. If the label doesn't exist yet, create it first with `gh label create "reviewer-app" --color "0075ca"`.

---

## Ownership

- **Skill owner:** Datasite design team / Halo Team
- **Repo / pipeline owner:** Technology Enablement squad
- **Halo theme questions:** invoke `datasite-halo-design`
- **What happens after push to main:** see `halo-prototype-deploy`
- **Off-pattern requests / anti-patterns:** see `references/anti-patterns.md`
