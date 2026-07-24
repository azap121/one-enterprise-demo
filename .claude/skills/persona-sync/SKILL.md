---
name: persona-sync
description: Use this skill to refresh the Datasite persona content under `.claude/skills/persona/references/` and `.claude/skills/icp/references/` from the canonical Confluence persona pages. Triggers on phrases like "sync personas", "refresh persona content", "pull latest personas from Confluence", "the persona stubs are stale", "Melissa updated the personas", or "/persona-sync". Also designed to be invoked on a weekly schedule via the `scheduled-tasks` MCP. The skill reads each persona's Confluence page via Atlassian MCP, re-distills the JTBD / anti-patterns / quotes / summary into the matching markdown stub, then commits and pushes. Same pattern as `halo-component-sync` but for personas instead of components.
user-invocable: true
---

# Persona Sync Skill

Keeps the persona content under `.claude/skills/persona/references/*.md` and `.claude/skills/icp/references/*.md` in sync with the canonical Confluence persona pages that Melissa Thompson maintains. Same source-of-truth model as Melissa's Rovo agents — they all pull from Confluence, so updating Confluence once propagates to all three surfaces (Rovo, skill markdown, this repo).

This is the **engineering side** of the persona maintenance loop. The human side lives in `.claude/skills/persona/MAINTENANCE.md` and the Confluence "Datasite Personas — Maintenance Guide" page.

## When this skill runs

| Trigger | How |
|---|---|
| **Manual on demand** | Designer says "sync personas", "refresh persona content", "/persona-sync", or invokes the skill directly. |
| **Scheduled weekly** | A `scheduled-tasks` routine fires every Monday at 8am CT, invokes this skill autonomously, and commits any changes. Setup instructions below. |
| **After a known Confluence edit** | If Melissa tells the team "I just updated Daniel", anyone can run the manual trigger to land the update same-day. |

## The sync process

For each persona (`daniel`, `daniel-corpdev`, `desmond`, `deborah`) and each ICP (`mcp-icp`):

1. **Resolve the canonical Confluence URL** from the persona/ICP stub file's "Canonical sources → Confluence page" line.
2. **Fetch the Confluence page** via `mcp__b62aabfa-f424-4a48-ae29-6728f06caba6__getConfluencePage` (Atlassian MCP).
3. **Extract** the structured fields:
   - One-line summary
   - 3-5 JTBDs (Melissa's exact wording where possible)
   - 3-5 anti-patterns / what frustrates them
   - 1 representative quote (real research quote preferred; synthesized only if no real quote available)
4. **Re-write the matching stub file** preserving:
   - The frontmatter (Status line gets updated to today's date + "auto-synced")
   - The "Canonical sources" section
   - The "Walkthrough hints for the agent" section (these are skill-specific, not from Confluence)
   - The "When to pick this persona" section (skill-specific routing logic)
5. **Diff against current content.** If the diff is non-empty, stage the change.
6. **Commit and push** with a structured message:

```
chore(persona-sync): refresh persona content from Confluence

Synced:
  - daniel.md (Confluence updated 2026-05-19)
  - desmond.md (no change)
  - deborah.md (Confluence updated 2026-05-20)

Source: Confluence DESIGN space persona pages
Triggered by: scheduled-tasks weekly routine
```

7. **Notify in Slack** (optional, future): post a 1-line summary to #product-designers when a sync actually changes content. Skip the notification when there's no diff.

## Fallback modes

- **Atlassian MCP unavailable.** Skip the persona, leave a comment in the skill log: "Could not fetch Daniel's Confluence page — Atlassian MCP timed out. Will retry next sync." Continue with other personas.
- **Confluence page returns empty / structure unparseable.** Don't overwrite the existing stub with garbage. Leave the stub as-is, log the issue, surface it to the next human invoker.
- **Git push rejected** (someone else pushed first). Pull, re-run the diff, re-push. If still rejected after 3 retries, leave the changes uncommitted and surface the conflict.

## Manual invocation flow

When a human runs this skill on demand:

1. Acknowledge: *"Syncing personas from Confluence. This usually takes 30-60 seconds."*
2. Run the process for all 5 personas/ICPs.
3. Report:

```
Persona sync complete.
────────────────────────────
Changed:    daniel.md (3 JTBDs updated)
Unchanged:  daniel-corpdev.md
Changed:    desmond.md (summary + 1 anti-pattern)
Unchanged:  deborah.md
Skipped:    mcp-icp.md (Confluence URL not yet set)

Committed and pushed as: chore(persona-sync): ...
```

## Scheduling — weekly via scheduled-tasks MCP

To enable the weekly autonomous sync, use the `scheduled-tasks` MCP. One-time setup:

```
Invoke: mcp__scheduled-tasks__create_scheduled_task
With:
  name: "persona-sync-weekly"
  schedule: "0 8 * * 1"  (every Monday at 8am, in user's timezone)
  prompt: "/persona-sync"  (or "Run the persona-sync skill")
  description: "Weekly refresh of persona content from Confluence"
```

Once registered, the routine fires every Monday morning before the design team starts their week. If Melissa updated any persona over the weekend, those updates land in halo-app's main branch before standup.

**Pre-commit safety:** the scheduled routine runs `npm run build` after sync to confirm nothing broke (though markdown changes can't break the React bundle — defense in depth).

## Also keeps the design-principles persona block in sync

The `datasite-halo-design` skill has a lightweight `CUSTOMER PERSONAS` block in `.claude/skills/datasite-halo-design/references/design-principles.md` (between the `## CUSTOMER PERSONAS` heading and the next `---` separator — currently lines ~351-376). This block has a one-liner per persona that the AI agent reads at the start of any prototype work. It must stay in sync with the canonical Confluence content too.

**As part of every sync run**, after refreshing the `references/*.md` stubs, the skill also does a **surgical edit** of the `CUSTOMER PERSONAS` section in `design-principles.md`:

1. Locate the section between the `## CUSTOMER PERSONAS` heading and the next `---` separator.
2. Regenerate each persona's one-liner from the matching Confluence persona page using this format (preserving the existing structure):
   ```
   **<Name>** — <Role>. "<First-person quote>"
   <2-4 lines of summary in the persona's working language.>
   → <Confluence URL>
   ```
3. **Preserve the surrounding prose** — the opening "Always design from the customer's perspective..." line and the closing "When in doubt about which persona to design for..." paragraph. Only the per-persona blocks change.
4. **Preserve everything else in the file** — the entire rest of `design-principles.md` is untouched.

If a Confluence page can't be fetched for a particular persona, **leave that persona's one-liner as-is** — don't blank it out or replace with a placeholder.

After the surgical edit, include `design-principles.md` in the commit alongside the `references/*.md` files.

## What this skill does NOT do

- **Invent persona content.** It only re-distills what Melissa has authored in Confluence. If a Confluence page is thin, the resulting stub is thin.
- **Modify "Walkthrough hints" or "When to pick" sections** in the `references/*.md` files. Those are skill-internal routing logic, not Melissa's content.
- **Touch the registry, types, or any React code.** Pure markdown refresh.
- **Modify anything in `design-principles.md` outside the `CUSTOMER PERSONAS` block.** Only the persona one-liners change.
- **Edit JT's Confluence Design Principles page** (datasite.atlassian.net/wiki/spaces/DESIGN/pages/6511296581). That's a leadership-curated artifact. When a persona change might warrant updating JT's page, the skill flags it in the commit message or run summary — Annie / Melissa handle that conversation manually.
- **Skip the `audience`, `persona`, or `prototype-context` skill files.** Only the `references/*.md` stubs and the `design-principles.md` CUSTOMER PERSONAS block.
- **Notify on every run.** Only when there's a real diff worth flagging.

## Ownership

- **Skill mechanics:** Annie + Halo Team
- **Canonical content (the *what*):** Melissa Thompson, in Confluence
- **Source-of-truth model:** see `.claude/skills/persona/MAINTENANCE.md`
- **Sister pattern:** `halo-component-sync` does the same dance for Halo theme components
