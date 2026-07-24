# Datasite Halo Design Skill

A Claude skill for generating well-branded Datasite interfaces using the Halo Design System. Used by the Halo Team and 13 designers across Claude Desktop, Claude Design, Claude Code, and anywhere else Claude runs.

**Canonical location:** `github.com/Datasite-POC/Design/Claude/datasite-halo-design/`

**Owner:** Halo Team — Irene / Annie

---

## What this skill does

When loaded into a Claude surface, this skill gives the model everything it needs to:

- Generate Halo-branded prototypes, slides, mocks, marketing one-pagers, internal decks
- Scaffold React + MUI production code aligned with `@ds/ui-common-react`
- Reference Halo's color, typography, spacing, iconography, and component patterns
- Pull **live** values from the Halo Figma library (via Figma MCP) and from the `MerrillCorporation/ds-ui-libraries` GitHub repo, so tokens never go stale

## Why a skill instead of a Figma plugin or PDF doc

Skills work across every Claude surface without rebuilding. Same `SKILL.md` + files in Claude Desktop, Claude Code, Claude Design, and any custom integration. One source of truth, everywhere.

---

## File layout

```
datasite-halo-design/
├── SKILL.md               ← the skill itself (instructions + dynamic-pull rules)
├── README.md              ← this file
├── colors_and_type.css    ← snapshot of current tokens (see "Refreshing" below)
├── assets/
│   └── icons/             ← FA Pro Light-derived SVGs (legacy fallback)
├── preview/               ← design-system reference cards
│   └── *.html             ← palette, type, spacing, components
└── ui_kits/
    └── halo-app/          ← hi-fi product recreation: LeftNav, TopNav, DocumentTree, etc.
```

**What's canonical vs. what's a snapshot — and where each file is used:**

| File                  | Status                                                                                                       | Used where                                                                              | Update cadence                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `SKILL.md`            | **Canonical** — the instructions                                                                             | All Claude surfaces                                                                     | When workflow or sources change                |
| `README.md`           | Team docs                                                                                                    | Humans only                                                                             | When process changes                           |
| `colors_and_type.css` | Snapshot of Figma + repo tokens                                                                              | **Claude Design only** (powers preview-pane rendering)                                  | Refresh annually (or on theme change)          |
| `preview/*.html`      | Snapshot — reference cards                                                                                   | **Claude Design only** (visual review pane)                                             | Retire when Storybook is live                  |
| `ui_kits/halo-app/`   | Reference layouts (currently JSX; may become TSX or both in the future to match the repo's TypeScript stack) | **Primarily Claude Design** (visual review) — JSX may be read as code on other surfaces | Update when product UI shifts                  |
| `assets/icons/`       | Legacy fallback                                                                                              | All surfaces                                                                            | Regenerate when code theme icon set stabilizes |

**Why the scope matters:** `colors_and_type.css`, `preview/*.html`, and `ui_kits/halo-app/` render visually only in Claude Design (claude.ai/design) where the review pane shows HTML files. In Claude Desktop, Claude Code, or API integrations they sit inert — nobody sees them rendered. Designers using those surfaces rely on `SKILL.md` (which tells Claude everything it needs) plus on-demand re-fetches from Figma or the repo.

---

## Installing the skill

### Claude Desktop

1. Clone the canonical folder:
   ```bash
   git clone https://github.com/Datasite-POC/Design.git ~/datasite-design
   ```
2. Copy or symlink the skill into Claude's skills directory:
   ```bash
   cp -r ~/datasite-design/Claude/datasite-halo-design ~/.claude/skills/
   # or symlink so you stay in sync automatically:
   ln -s ~/datasite-design/Claude/datasite-halo-design ~/.claude/skills/datasite-halo-design
   ```
3. Restart Claude Desktop. The skill appears in your skills picker.
4. To pick up updates later: `cd ~/datasite-design && git pull`.

### Claude Code

Same as Claude Desktop — drop the folder into your skills directory (typically `~/.claude/skills/`) and reload.

### Claude Design (claude.ai/design)

1. Download the `Claude/datasite-halo-design/` folder as a zip (from the GitHub UI: "Download ZIP" on the whole repo, then extract just that subfolder, or use a tool like `degit`).
2. In Claude Design, create a new project, upload the folder contents into the project filesystem.
3. The skill activates when any agent references it or when you invoke it by name.

### Claude API / custom integrations

Clone the repo and read `SKILL.md` + referenced files at runtime. The skill is plain markdown + HTML/CSS — no build step.

---

## Using the skill

Once installed, just invoke it by name or let Claude pick it up automatically when you ask for a Datasite mock, prototype, or slide.

**Example prompts:**

- _"Using the datasite-halo-design skill, mock a document Q&A inbox screen."_
- _"Make a 6-slide deck for an internal Datasite roadmap review. Follow Halo."_
- _"I need a React component for a user-permissions table, using MUI and Halo tokens."_

**The skill will:**

1. Fetch live tokens from Figma MCP (if connected) and the GitHub repo
2. Detect current stack versions (MUI, React, FontAwesome) from `package.json`
3. Generate output using those values, never hardcoded ones

---

## Refreshing the snapshot

The `colors_and_type.css` file and `preview/*.html` cards are frozen copies, used for speed and offline rendering. They drift over time.

**When to refresh:** Halo tokens change in Figma — typically once a year for accessibility work or a business-unit theme launch.

**How to refresh (Irene or Annie):**

1. Open any Claude surface that has this skill loaded.
2. Invoke the skill and say: _"Regenerate the snapshot from Figma and repo."_
3. The agent will:
   - Pull fresh tokens from Figma MCP (`MocqvKfuogd2Re1tyFr4d4`)
   - Pull the latest raw tokens and theme wiring from `MerrillCorporation/ds-ui-libraries@main`
   - Overwrite `colors_and_type.css`
   - Regenerate `preview/*.html` cards
   - Report any diffs
4. Review the diff, commit directly to `Datasite-POC/Design/Claude/datasite-halo-design/` on `main`.
5. Designers pick up the change on their next `git pull` / skill reload.

**Between refreshes:** snapshot drift is fine. The skill fetches live tokens on every run; the snapshot is only used for rendering the review pane in Claude Design. Output mocks are always current.

---

## How dynamic-pull works

This skill avoids the classic "design system docs that go stale" problem by telling the agent to fetch from canonical sources **every time it runs**.

**Two canonical sources:**

1. **Figma library** (designer truth) — [Halo Design System file](https://www.figma.com/design/MocqvKfuogd2Re1tyFr4d4/%E2%AD%90%EF%B8%8F--HALO--Design-System). Accessed via Figma MCP.
2. **GitHub repo** (engineering truth) — [`MerrillCorporation/ds-ui-libraries`](https://github.com/MerrillCorporation/ds-ui-libraries). Accessed via GitHub tools or raw.githubusercontent.com.

**⛔ Do NOT use `github.com/Datasite-POC/halo-ds`** — it's outdated, inaccurate, and confuses the agent. `SKILL.md` explicitly tells Claude to ignore it. If a designer points the agent there, redirect to the two canonical sources above.

**What the skill fetches on every run:**

- Raw color tokens from `packages/ui-utilities/src/constants/ds-halo-design-tokens.ts` (Moondust + gemstone families + accessible pairs)
- Semantic palette mapping from `packages/ui-common-react/src/theme/ds-halo-theme.ts` (primary/error/warning/info/success)
- Alert/chip/file-icon tokens
- Dark-mode palette
- Stack versions (MUI, React, FontAwesome) from `package.json`
- Typography + spacing from the active theme file

**If neither source is reachable** (no MCP, no GitHub), the skill falls back to the local snapshot and warns the user that values may be stale.

---

## Storybook integration (future)

Storybook is being built for Halo. When it ships, it will become the canonical component reference.

At that point:

1. Update `SKILL.md` with the Storybook URL
2. Delete the `preview/*.html` folder (Storybook replaces it)
3. Shrink or remove `ui_kits/halo-app/` (Storybook covers individual components; the UI kit stays if composed-page patterns aren't in Storybook)

The skill is designed to shrink gracefully once Storybook is live. It's not meant to be Halo's documentation forever — it's meant to be the **agent's working knowledge**.

---

## Access model (future)

**Today:** designers can read `MerrillCorporation/ds-ui-libraries` on GitHub directly. GitHub tools in Claude pull token and theme files from `main`.

**Possible future state:** designers lose direct repo read access and instead consume Halo via Google Artifact Registry (GAR):

- Published packages: `@ds/ui-utilities` for framework-agnostic raw Halo design tokens, and `@ds/ui-common-react` for the React/MUI Halo theme
- Raw tokens available from the installed `@ds/ui-utilities` package; React apps and MFEs should still prefer `@ds/ui-common-react` for the Halo MUI theme

**When that switch happens:** update `SKILL.md` Step 1 to read raw tokens from the installed `@ds/ui-utilities` package or a GAR-hosted tokens URL instead of `github_read_file`. Owner: Halo Team.

---

## Ownership & changes

- **Skill owner:** Halo Team — Irene, Annie, JT
- **Who can change the skill:** Irene, Annie, or JT — direct commits to `Datasite-POC/Design/Claude/datasite-halo-design/` on `main`. No PR review required; this is a small, trusted group.
- **Who can request changes:** anyone on the design team — message Irene/Annie/JT or open an issue on `Datasite-POC/Design`.
- **Who shouldn't edit the skill:** anyone outside that trio. Local edits cause skill fragmentation across the 13 designers.
- **Where designer prototypes live (not this folder):** `Datasite-POC/Design/Projects/` — separate from the skills folder, separate workflow.

---

## Troubleshooting

**"Colors look wrong in my mock."**
The agent probably couldn't reach Figma MCP or GitHub and fell back to the snapshot. Check the agent's output — it should warn when it's using stale values. Reconnect your MCP/GitHub connector and rerun.

**"The skill tells me to use MUI 5 but we're on 6."**
The skill should never say a specific MUI version — it fetches from `package.json` at runtime. If you see a hardcoded version in `SKILL.md`, that's a bug. Ping the Halo Team.

**"A designer made local edits to SKILL.md."**
Don't accept local edits as canonical. Revert, and ask Irene / Annie / JT to make the change on `Datasite-POC/Design` directly if it's legitimate.

**"The preview cards show different colors than the Figma."**
The snapshot is stale. Run "regenerate the snapshot" (see Refreshing above).

---

## Contributing

**If you're Irene, Annie, or JT:**

1. Edit `Claude/datasite-halo-design/` files directly on `main`
2. Commit and push
3. Announce the change in the Halo Team Slack channel so designers know to refresh

**If you're any other designer:**

- Don't edit the skill locally. Message Irene / Annie / JT with what you want changed, or open an issue on `Datasite-POC/Design`.
- For prototypes and project work, use `Datasite-POC/Design/Projects/` — separate folder, separate workflow.

Keep the skill lean. Every file is loaded into agent context — bloat costs latency and token budget. If in doubt, link to Figma / Storybook / the repo rather than adding another local file.
