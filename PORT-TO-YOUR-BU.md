# Porting Halo OS to Your Business Unit

You just received a fork of Datasite's **Halo OS** — an agent-driven design system in a single repo. This doc tells your team how to make it yours.

**File location:** root of the repo, alongside `README.md`.
**Heads up:** This is the first time Halo OS has been ported outside Datasite, so there are no firm numbers on how long it takes yet. Plan for a week of focused work and expect to discover things this doc didn't anticipate.

---

## Repo at a glance

```
halo-app/
│
├── README.md                       ← what this repo is + how to use it
├── CLAUDE.md                       ← context Claude reads every session
├── PORT-TO-YOUR-BU.md          ⭐  ← YOU ARE HERE
├── HALO-OS-INTRO.md                ← onboarding for your designers (template)
│
├── .claude/
│   └── skills/                     ← Claude skills (the agent workflow)
│       ├── halo-start/
│       ├── halo-prototype-workflow/
│       ├── halo-prototype-deploy/
│       ├── datasite-halo-design/
│       └── ...
│
├── src/
│   ├── projects/                   ← prototypes (pre-cleared for you)
│   │   ├── registry.ts             ← THE source of truth for the gallery
│   │   └── types.ts
│   ├── shell/                      ← gallery chrome (search, filter, nav)
│   └── theme/halo/                 ← Halo MUI theme (ALL styling lives in theme.ts)
│
├── vendor/@fortawesome/            ← vendored FA Pro icons
│
├── Jenkinsfile                     ← CI/CD pipeline (Datasite-specific)
├── Dockerfile.halo-app             ← container build
├── rsbuild.config.ts               ← build config
├── package.json
└── tsconfig.json
```

---

## 1. What you just received

This isn't just a prototype gallery. It's four things bundled into one repo:

- **A design system in code** — Halo is MUI with a custom theme. Most `Halo*` components are thin wrappers around MUI primitives that add Halo-specific defaults or custom anatomy where Figma diverges from MUI (like HaloDialog's `title`/`actions` slots). A few (like HaloButton) are pure re-exports. **All styling lives in `theme.ts`** via MUI's theme override system — that's where the design system actually lives. You can keep MUI or swap it for your own React framework — the pattern (theme drives everything, components add convenience or custom anatomy on top, tokens at the foundation) is what matters.
- **A prototype gallery** — where designers ship interactive React mockups and share live URLs in ~5 min. Includes an `/activity` dashboard showing per-designer commits, recent shipping, and top skill usage — auto-updates on every push to `main`.
- **A library of Claude skills** — that scaffold new prototypes, enforce DS rules, and handle the build/deploy loop
- **Design context** — CLAUDE.md plus optional personas / principles / brand patterns. Datasite pulls these dynamically from internal Confluence pages (via Atlassian MCP + a `persona-sync` skill that runs weekly). The patterns travel; the content doesn't — you'll either point at your own Atlassian/source and let Claude sync from there, or maintain content manually.

Your designers don't "use this repo" — they talk to Claude inside it. Claude reads the skills, builds prototypes against your DS, and ships them to a live URL. The gallery is the runtime where everything shows up.

---

## Note on repo organization (preempts confusion)

A few things in this repo look like duplicates but aren't. Worth knowing before you start so you don't try to "clean them up."

**Two asset folders, two purposes:**

- `public/` = static files served by URL (favicons, `manifest.json`, iframe HTML embeds). The bundler does NOT process these.
- `src/assets/` = files imported by React components (icons, photos, app logos shown in the product navigation shell). The bundler processes these.

Standard React/rsbuild pattern. Both folders need to exist. **Zero file duplicates between them.**

**Iframe prototypes — a supported sub-pattern:**

Sometimes a designer builds something outside React (a Figma export, a Claude-built HTML page, a third-party tool) and embeds it inside a React prototype as an iframe. The HTML lives in `public/prototypes/`, the React prototype references it via `src="/prototypes/<name>.html"`. The HTML files in `public/prototypes/` are NOT a competing prototype pattern — they're iframe content for specific React prototypes. If you delete a React prototype that uses one, also delete its HTML.

---

## 2. Day-one master prompt ⭐

This is the most valuable piece. Open Claude Code in the repo, paste this prompt, and Claude will do ~80% of the port for you. **Run this before touching any code manually.**

```
This repo was just forked from Datasite's halo-app. I need to make it ours.

Please:
1. Ask me my BU name, design system name, repo URL, deploy hostname, and CI/CD platform
2. Ask me whether my stack is MUI-based or something else (and if something else, ask which framework)
3. Rename all references from "Halo" to "<YourDS>" and "Datasite" to "<YourBU>"
4. Rewrite CLAUDE.md from scratch using my answers — keep the same structure but swap the context
5. Rename all .claude/skills/halo-* folders to match my DS name and rewrite their content
6. Ask me whether I want to keep the persona / icp / audience skill pattern (just swap content with my own personas), or delete those skills entirely. Same question for prototype-context (Atlassian/Jira integration) — keep the pattern or delete?
7. Scan ALL remaining skills (renamed + kept) for any Datasite-specific references — Confluence URLs, internal infra hostnames (halo.dev.dsite.io, harbor.dsite.io, etc.), email addresses, Slack channel names, VPN/SSO instructions, references to Datasite tools (JPD, Jellyfish, GAR, etc.). Flag each one and ask me what to swap it with.
8. Ask me how I'm sourcing design tokens. Recommend connecting Figma MCP first (this is what Datasite did — it's the cleanest path) and giving you the URL to my token library page so you can pull each token live. If I have tokens in JSON / CSS vars / JS object form, you can use that instead. Walk me through swapping src/theme/halo/theme.ts step by step. Remember: all Halo styling lives in theme.ts (the Halo* components are mostly thin wrappers + a few pure re-exports, but the theme is where the styling rules live), so the theme is where the design system actually lives.
9. Tell me the src/shell/ folder contains both pure logic/generic files (filterPrototypes.ts, breadcrumb.ts, useGalleryFilters.ts, ErrorBoundary.tsx) AND Datasite-styled UI components (GalleryWrapper, GalleryHome, NotFound, Activity, ProductShellPreview, chrome.css) that mimic Datasite's platform navigation. Ask whether I want to reskin the UI components to match my platform's navigation — if yes, ask for our Figma file for navigation/chrome patterns and walk me through it.
10. Leave alone: rsbuild config, tsconfig, jest config, registry pattern, types.ts, and the FA Pro vendor pattern (the file: deps in package.json + folder structure — even if we swap icon contents).

After each step, show me the diff and wait for confirmation before moving on.
```

That single prompt replaces a day of manual find-and-replace.

---

## 3. The swap layers

| Layer | File / folder | What to do |
|---|---|---|
| **Design system** | `src/theme/halo/` | Rename folder, swap tokens (recommend Figma MCP). All styling lives in `theme.ts` — most `Halo*` components are thin wrappers, a few are pure re-exports. Keep MUI or replace with your framework. |
| **Platform chrome** | `src/shell/` (UI components only) | Reskin `GalleryWrapper`, `GalleryHome`, `NotFound`, `Activity`, `ProductShellPreview`, `chrome.css` to match your platform via Figma. Keep `filterPrototypes.ts`, `breadcrumb.ts`, `useGalleryFilters.ts`, `ErrorBoundary.tsx` as-is (pure logic/generic). |
| **Skills** | `.claude/skills/halo-*` AND any other skills you keep | Rename `halo-*` folders, rewrite content for your DS terminology, AND scan every skill for Datasite-specific references (Confluence URLs, internal hostnames, emails, Slack channels, VPN/SSO instructions, references to tools like JPD/Jellyfish/GAR) — swap each with your equivalents. |
| **Context** | `CLAUDE.md` | Full rewrite — your stack, your URLs, your workflow rules. |
| **Infrastructure** | `Jenkinsfile`, `Dockerfile.halo-app`, deploy hostname | Your CI/CD and deploy target. |

---

## 4. Optional — keep pattern, swap content

These skills are useful patterns but contain Datasite-specific content. **Decide per-skill: keep the structure + replace the content, or delete entirely.**

- **`.claude/skills/persona`** — interaction-persona lens (Daniel, Desmond, Deborah for Datasite). If you have user personas, this is a great pattern. Swap the content for your personas; keep the skill structure.
- **`.claude/skills/icp`** — buyer/firm profile lens. Same as above — keep if useful, swap content.
- **`.claude/skills/audience`** — router skill that picks between persona and ICP. Keep if you keep either of the above.
- **`.claude/skills/persona-sync`** — pulls latest persona content from Confluence on a schedule via Atlassian MCP. Only useful if you're on Atlassian.
- **`.claude/skills/prototype-context`** — pulls upstream context from Jira/JPD/Confluence at the start of prototype work. Only useful if you're on Atlassian.
- **`.claude/skills/halo-design-update`** — Datasite-specific weekly team-update format (Annie → JT). Probably delete; or rework for your own leadership update format.

---

## 5. What's been pre-cleared for you

The `src/projects/` folder structure (registry + per-designer subfolders) is portable, but the *content* is Datasite-only. Annie has already cleared all Datasite designer prototype folders before zipping this for you. You'll start with an empty registry and add your own prototypes as designers build them.

If you find any other Datasite-specific content during the master prompt's step 7 (references scan), decide per-item: swap with your equivalent or delete.

---

## 6. Keep as-is

These are generic and load-bearing — don't touch:

- `src/projects/registry.ts` — the registry pattern (contents pre-cleared)
- `src/projects/types.ts` — schema for prototype entries
- `src/shell/filterPrototypes.ts`, `breadcrumb.ts`, `hooks/useGalleryFilters.ts`, `ErrorBoundary.tsx` — pure logic/generic, no Datasite branding
- `rsbuild.config.ts`, `tsconfig.json`, `jest.config.js` — build/test configuration
- The **FA Pro vendor pattern** — `vendor/@fortawesome/` referenced via `file:` deps in `package.json`. The *folder structure and dependency pattern* stays even if you swap the icon contents. This pattern keeps the repo clone-and-runnable for designers without artifact-registry credentials. If you have an FA Pro license, keep the packs as-is. If not, replace the package contents but keep the `file:` deps approach.
- The "no PRs, push to main" model — *unless* your team prefers PRs. If you switch to PRs, you'll need to update: `halo-prototype-workflow/SKILL.md` (the final commit + push step), `halo-prototype-deploy/SKILL.md` (the "what happens after push" framing), and the README's "no pull requests" line. The skills currently assume push-to-main; you'd swap that for "create PR, get review, merge."
- The agent-driven workflow philosophy: designers talk to Claude, Claude does the scaffolding, designer approves in the browser.

---

## 7. Open questions for your team

Before you start, get answers to these. They determine how much custom work you'll need:

1. **Is your component library MUI-based?**
   *If yes:* theme swap is straightforward — the Halo pattern (theme drives everything, components are re-exports) maps directly.
   *If no:* you'll need to swap the React framework layer. The pattern still works — your theme file just drives a different component library.

2. **How are you sourcing design tokens?**
   *Recommended:* Connect Figma MCP to Claude, then give Claude the URL to your token library page in Figma — Claude pulls each token live. This is what Datasite did and it's by far the cleanest path.
   *Also fine:* Tokens already in JSON, CSS vars, or a JS object — Claude can wire them up directly.
   *If neither:* Set up Figma MCP first. Don't try to manually extract values one by one.

3. **Do you have a Font Awesome Pro license?**
   *If yes:* keep the vendor pattern and packs, just refresh as needed.
   *If no:* keep the `file:` deps pattern but swap in your icon vendor (Material Symbols, Lucide, your own SVG library, etc.).

4. **What's your CI/CD platform?**
   *Jenkins:* you can adapt our `Jenkinsfile` directly.
   *Other (GitHub Actions, GitLab CI, etc.):* you'll need to rewrite the deploy step. The build itself (`npm ci && npm run build`) is portable.

5. **Do you want a persona/audience model available to your designers?** (These are optional lens skills designers can invoke during prototype work, not part of the core workflow.)
   *If yes:* keep the skill pattern, swap in your personas (via Confluence + Atlassian MCP if you're on Atlassian, or maintain manually).
   *If no:* delete the persona, icp, audience, and persona-sync skills.

6. **Are you on Atlassian (Jira, Confluence, JPD)?**
   *If yes:* keep the `prototype-context` skill and `persona-sync` skill — they pull upstream specs and persona content dynamically via Atlassian MCP.
   *If no:* delete both.

---

## 8. Drift policy

Once you fork, **these are now two separate projects.** There is no automatic sync between Datasite's `halo-app` and your copy.

- If Datasite ships a Halo OS improvement (new skill, better shell, workflow refinement), your team has to manually port it.
- If you ship improvements, we won't pick them up automatically either — but we'd love to hear about them.
- The agent-driven workflow itself is unlikely to change often. The theme, tokens, design context, and personas are yours to maintain.

**Owner of your copy:** your team. Pick a primary, a backup, and an exec sponsor — the same pattern we use in our README.

---

## 9. Risks to plan for

- **Designer adoption fails** — Halo OS only works if your designers are already comfortable with Claude Code. If they aren't, this becomes shelfware. Run a Claude Code adoption push *before* the port, not after.
- **No clear owner** — without a primary owner on your side (R/A), the repo rots in months. Pick someone before you start.
- **Token drift** — when your Figma library updates, your `theme.ts` doesn't auto-sync. Someone has to re-run the Figma MCP pull. Build this into a weekly or monthly cadence.
- **Reverse drift** — Datasite ships improvements you don't get; you ship improvements we don't get. No automatic sync (see section 8).
- **Cost** — Claude API usage scales with your team size and prototype velocity. Get Finance to sign off on a monthly ceiling before designers start hammering on it.
- **Wrong-stack tax** — if you're not MUI-based, the swap is a real engineering effort, not a half-day lift. Validate stack fit before committing.
- **Claude Code clearance** — if your org hasn't already cleared Claude Code with security/legal, do that first. Designers can't use this system without it. This is a prerequisite, not an ongoing risk.
- **Sensitive content in prototypes** — this is a sandbox repo, not your production engineering codebase. The risk isn't the code itself — it's what designers paste in for realism: real customer names, screenshots with PII, unreleased roadmap details, internal-only mockups. The deployed gallery URL is internal-only, but it's discoverable to anyone on VPN. Set a "no real data" rule with your team before the first prototype ships — fake company names, synthetic data, blurred screenshots.

---

## 10. What success looks like (3-month checkpoint)

You'll know the port worked when:

- ✅ At least one of your designers has shipped a prototype to the gallery **without engineering help**
- ✅ A designer has shared a live URL in a real meeting or Slack thread (not just for testing)
- ✅ Token updates from Figma flow into `theme.ts` without anyone touching code manually
- ✅ Time-to-first-prototype is measured in **minutes, not days**
- ✅ A stakeholder outside your design team has clicked a live URL and reacted to it
- ✅ Designers reuse code from other prototypes in the gallery (the registry pattern is doing its job)

If none of these are happening at 3 months, the port is technically complete but functionally dead. Run the validation testing below before that point so you can course-correct.

---

## 11. Validate with your designers (recommended)

After your first 3–5 designers have built something, send each one a 2-minute pulse-check. This is the exact format Annie used at Datasite — it surfaces adoption blockers fast.

```
Hey [Name]! Thanks for trying out the [Your Gallery Name] today 🙏
Quick 5-question pulse — ~2 min, no wrong answers:

1. Setup — how long did it take, and was anything confusing?
2. Prototype — did what Claude built match what you had in your head?
3. Reuse — did you notice you could pull from other prototypes in the gallery? (If not, try it and let me know what you think)
4. Name — does "[Your Gallery Name]" feel like something you'd call this yourself, or would you name it differently?
5. Missing — what's one thing that would make this part of your actual weekly workflow?
```

Annie ran this at Datasite with every designer on the team. The answers to Q5 ("what's missing for weekly use") were the most valuable — they surfaced the real adoption blockers that the technical port couldn't predict.

You should also point each designer at `HALO-OS-INTRO.md` (the designer-facing onboarding doc shipped in this repo) before they start — that's the doc Datasite uses internally.

---

## Questions?

Reach out to **Annie Johnson** (annie.johnson@datasite.com) — she ran the first Halo OS port and can help if you hit something this doc didn't anticipate. JT is the exec sponsor on Datasite's side if escalation is needed.

---

## Appendix: Pre-handoff checklist (for Annie, not the BU)

Before zipping this repo and sending it to the BU, run these locally on your downloaded copy:

```bash
# === Prototypes ===

# Remove all designer prototype folders (keeps registry.ts and types.ts)
find src/projects -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +

# Clear the registry — open src/projects/registry.ts and replace the array with:
#   export const registry: PrototypeEntry[] = [];

# Remove iframe HTML prototypes (referenced by the React prototypes you just deleted)
rm -rf public/prototypes/

# Remove Datasite-specific VDR demo data (referenced by Daniel S's prototype)
rm -rf public/vdr/

# === Datasite-specific content ===

# Datasite persona photos (used by the shell and prototypes)
rm -f src/assets/daniel.png src/assets/deborah.png src/assets/desmond.png

# Datasite-specific standalone HTML (AI avatar mockup)
rm -f public/datasite-ai-avatar.html

# === Local-only / private files ===

# Remove git history for a clean slate
rm -rf .git

# Remove private Claude memory and any local-only files
rm -rf .claude/projects .claude/launch.json.local-backup .playwright-mcp

# === Optional but recommended ===

# Replace your email and Datasite Slack channel references in skills with
# placeholders, so the BU doesn't accidentally email you:
#   annie.johnson@datasite.com → <YOUR EMAIL>
#   "Halo Team Slack channel" → "<YOUR SLACK CHANNEL>"

# === Zip and send ===

zip -r halo-os-fork-for-<BU>.zip . -x ".DS_Store" "node_modules/*"
```

**Why these files specifically:**
- `src/projects/*/` → Datasite designer prototypes (content, not infrastructure)
- `public/prototypes/*.html` → iframe content for the React prototypes you just deleted (orphans after cleanup)
- `public/vdr/` → Datasite-specific demo data (PDFs, contracts) used only by Daniel's prototype
- `public/daniel.png`, `src/assets/deborah.png` → Datasite designer headshots

**What's deliberately NOT cleared** (referenced by shell code; deleting would break the build):
- `public/halo-ai-icon.svg`, `public/favicon.*` — branding, BU swaps via the port's master prompt
- `src/assets/datasite-logo-circle.svg`, `blueflame-icon.svg`, `diligence-block.svg`, `marketplace-banner-*.svg`, `submit-button.svg`, `ai-assistant-icon.svg` — Datasite product imagery used by the shell
- `src/assets/app-logos/*` — the Datasite product family (Acquire, Diligence, Sherpany, etc.) shown in the product navigation shell

The master prompt's step 9 (shell reskin) handles all of these during the BU's port — the BU's Claude will help them swap to their own branding/imagery.

This appendix is for Annie's reference. Feel free to delete it from the BU's copy before handoff — or leave it; it's useful documentation if they ever port to a *third* BU.
