# Halo App — Claude Skills

This folder holds all Claude skills for Halo App. Each skill is a self-contained folder with its own `SKILL.md`. Skills load automatically when Claude is opened from inside this repo, or from any folder after the global symlink step (Step 4b in `halo-start`).

**Owners:** Annie Johnson, Irene, JT (Halo Team)

---

## Available Skills

| Skill | Trigger | What it does | Status |
|---|---|---|---|
| `halo-start/` | `/halo-start` | First-time setup + returning session startup. Checks git, Node, GitHub auth, clones the repo if needed, installs skills globally, syncs and starts the dev server. Entry point for all new designers. | **Live** |
| `halo-prototype-workflow/` | `/halo-prototype-workflow` or any prototype request | Full prototype creation workflow (12 steps). Scaffolds the component, registers it in the gallery, runs the dev server, waits for designer approval, builds and pushes to main. Always the entry point for prototype work — never call `datasite-halo-design` directly. | **Live** |
| `halo-prototype-deploy/` | `/halo-prototype-deploy` | Post-push status checks — Jenkins pipeline, live URL, rollback instructions, FAQ for common deploy failures. | **Live** |
| `datasite-halo-design/` | Called automatically by prototype workflow | Halo Design System reference — tokens, MUI theme, component anatomy, icon system (FA Pro Light default). Called internally at Step 2 of every prototype build. | **Live** |
| `halo-component-edit/` | `/halo-component-edit` | Create or modify Halo components in `src/theme/halo/`. Branch + PR required. Pulls live tokens from Figma MCP. **Halo Team only** — has an explicit scope gate before doing any work. | **Live** |
| `halo-component-sync/` | Called by `halo-component-edit` | Verifies the full Halo component library stays coherent after any theme edit. Runs silently after every component change before the browser preview. | **Live** |
| `halo-design-update/` | `/design-update` | Guides any designer through four sections (focus, challenges, help needed, good news) and generates a polished, plain-language update ready to share with leadership or in a 1:1. | **Live** |

---

## Skill routing

```
Designer opens Claude
  └── New to the repo / need setup  →  /halo-start
        └── Ready to build          →  /halo-prototype-workflow
              └── Uses datasite-halo-design internally at Step 2
              └── After push        →  /halo-prototype-deploy to check status
  └── Halo component change
      (Halo Team only)              →  /halo-component-edit
              └── Runs halo-component-sync silently after edits
```

---

## How skills load

Skills in this folder load automatically when Claude Code is opened from inside `~/git/halo-app`.

After running Step 4b in `halo-start`, all skills are also symlinked to `~/.claude/skills/` — so they load from any folder on the machine. Designers only need to do this once per machine.

---

## Adding a skill

1. Create a new folder: `.claude/skills/halo-app-<skill-name>/` or `halo-<skill-name>/`
2. Add a `SKILL.md` following the structure of any existing skill
3. Add a row to the table above
4. Update the [Skills for Design Confluence page](https://datasite.atlassian.net/wiki/spaces/DH/pages/6399328437/Skills+for+Design)
5. If the skill is user-invocable (designers call it directly), also add a row to the [What It Is & How to Use It page](https://datasite.atlassian.net/wiki/spaces/DH/pages/6557270029) skills table — internal/auto-called skills (like `halo-component-sync`) do not need to be listed there
6. Announce in the Halo Team Slack channel

**Editing a skill** (Annie / Irene / JT only): commit to `main` directly. No PR needed for skill files.

---

## Questions

Message Annie Johnson, Irene, or JT in the Halo Team Slack channel.
