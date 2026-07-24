# Persona System — Maintenance Guide (Engineering Reference)

This document is the **technical reference** for the Datasite persona system inside halo-app. For the human-readable version (intended for Melissa and anyone updating persona content), see the Confluence "Datasite Personas — Maintenance Guide" page in the DESIGN space.

## The single source of truth

```
              ★ CONFLUENCE PERSONA PAGES ★
              (Melissa Thompson owns. Single source of truth.)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Rovo agents       skill markdown       Asset Sale
   (chat with        (.claude/skills/     Journey Map
    persona,          persona/refs,        prototype
    Melissa-owned)    AI-in-flow,          (visible browseable
                      sync'd weekly)        persona artifact,
                                            Melissa-owned)
```

**The rule:** any artifact representing a persona must derive from Confluence. No forks, no duplicate sources. Updates flow from Confluence outward.

## The three surfaces

| Surface | Audience | When they use it | Owner |
|---|---|---|---|
| **Confluence pages** (DESIGN space) | Melissa + serious research consumers | Defining or refreshing personas (the writes happen here) | Melissa |
| **Rovo chat agents** | Any human who wants to chat with the persona | "Let me ask Daniel what he thinks of this concept" | Melissa (auto-derives from Confluence) |
| **Skill markdown** (`.claude/skills/persona/references/*.md`) | The AI agent during prototype work | Auto-loaded by the `audience` skill during Steps 2.5 / 2.6 / 7c of `halo-prototype-workflow` | Annie + Halo Team; content distilled from Confluence by `persona-sync` |
| **Asset Sale Journey Map prototype** (visible canonical artifact) | Designers + execs visualizing persona presence across deal milestones | When discussing where personas operate, milestone-by-milestone | Melissa (maintained directly in halo-app) — live at https://halo.dev.dsite.io/projects/melissa-ma-lifecycle-journey-map |

**Note on halo-app as a venue:** halo-app is where the team puts browseable reference artifacts of all kinds — but the artifacts themselves are different things for different audiences. Irene's [Halo Component Reference](https://halo.dev.dsite.io/projects/irene-halo-component-reference) is the surface for *design system components* (engineering-facing). The Asset Sale Journey Map is the surface for *research personas* (designer-facing). Different artifacts, different audiences, same venue. We don't currently need a separate "persona-reference" prototype — the journey map already plays that role.

## File structure

```
.claude/skills/
├── persona-sync/               ← refresh skill (Confluence → markdown)
│   └── SKILL.md
├── persona/                    ← interaction-lens skill
│   ├── SKILL.md
│   ├── MAINTENANCE.md          ← this file
│   └── references/
│       ├── daniel.md           ← stub (auto-synced from Confluence)
│       ├── daniel-corpdev.md
│       ├── desmond.md
│       └── deborah.md
├── icp/                        ← buying-lens skill (same shape)
│   ├── SKILL.md
│   └── references/
│       └── mcp-icp.md
├── audience/                   ← router skill (no content of its own)
│   └── SKILL.md
└── prototype-context/          ← upstream-context puller (no persona content)
    └── SKILL.md
```

## Stub file structure (what each persona's markdown contains)

Every `references/*.md` file should have these sections in this order:

1. **Frontmatter status line** — when last synced, source artifact, validation state
2. **One-line summary** — who this persona is, in one sentence
3. **Top jobs-to-be-done** — 3-5 items, Melissa's wording from Confluence
4. **Anti-patterns** — 3-5 items, what frustrates them
5. **What they reject** — short list, often inferred from anti-patterns
6. **One representative quote** — real research quote preferred; synthesized acceptable as placeholder
7. **Canonical sources** — links to Confluence, Rovo, Figma, journey map
8. **Refresh process** — pointer back to this MAINTENANCE.md
9. **When to pick this persona** — skill-side routing logic (NOT from Confluence — engineering owns this)
10. **Walkthrough hints for the agent (Mode 2)** — skill-side notes for how the AI should role-play the persona during the Step 7c walkthrough (NOT from Confluence — engineering owns this)

**Important:** sections 9 and 10 are **NOT touched by `persona-sync`.** They're skill mechanics, not Melissa's content. The sync skill only refreshes sections 1-7.

## The sync process — automated

The `persona-sync` skill does the refresh work. Two ways to trigger:

| Trigger | Cadence | How |
|---|---|---|
| **Manual** | On demand | Anyone says "sync personas" or runs `/persona-sync` |
| **Scheduled** | Weekly (Monday 8am CT) | `scheduled-tasks` MCP routine fires the skill autonomously |

See `.claude/skills/persona-sync/SKILL.md` for the full process, fallback modes, and the scheduling setup.

## The sync process — manual (when MCP fails)

If Atlassian MCP is unavailable for whoever's running the sync, the fallback is:

1. Melissa shares the relevant Confluence page content (paste, screenshot, or export)
2. Anyone with repo access updates the matching `references/*.md` file by hand
3. Commit with message `chore(persona-sync): manual refresh — <persona name>`
4. Push

The skill should be the default; manual is the backstop.

## When personas change

Trigger conditions that warrant a sync:

- Melissa updates a Confluence persona page → run `persona-sync` (or wait for Monday's scheduled run)
- Melissa adds a new persona or variant → manually scaffold the new stub file matching the existing structure, then run `persona-sync` to populate
- Melissa retires a persona → delete the stub file; check the registry for orphaned `audience` tags
- The Asset Sale Journey Map prototype gets updated with new milestones or persona JTBDs → consider running `persona-sync` to capture the updated patterns (note: the journey map IS Melissa's authored artifact, so it's already a canonical source — but the Confluence page should be updated to match before the sync runs)

## Adding a new persona

1. Melissa creates the Confluence page in the DESIGN space.
2. Decide on a slug (kebab-case, e.g. `eric` or `daniel-pe-fund`).
3. Add a stub file at `.claude/skills/persona/references/<slug>.md` matching the existing structure.
4. Update `.claude/skills/audience/SKILL.md` if the new persona requires routing changes.
5. Update `.claude/skills/persona/SKILL.md`'s "Personas covered" table.
6. Run `persona-sync` to populate the stub from Confluence.
7. Optionally: update Melissa's Asset Sale Journey Map prototype to include the new persona's JTBDs across milestones.

## Open questions to resolve (as of 2026-05-20)

These are flagged in the relevant stub files but worth tracking centrally:

| Persona | Question | Status |
|---|---|---|
| **Desmond** | Is the canonical framing "company management / seller-side leadership" (Asset Sale Journey Map) or "pipeline health / portfolio overview" (Melissa's Mar 2 Slack note)? Or are these two valid variants? | Pending Melissa confirmation |
| **Deborah** | Is the canonical framing "financial analyst" (journey map) or "legal lens" (Melissa's Apr 8 DM)? | Pending Melissa confirmation |
| **Deborah variants** | Hedge fund variant? Tax/finance reviewer variant? | Pending JT + Melissa |
| **Daniel-CorpDev** | Confirm JTBDs — currently inferred since this variant isn't in the Asset Sale Journey Map | Pending Melissa |
| **ICP** | When will Product Marketing mirror the 5 SharePoint docs into Confluence so the `icp` skill can pull them? | Pending PMM + Melissa |

## Ownership

- **Persona content (what's in Confluence):** Melissa Thompson, Product Design Mgr — Melissa.Thompson@datasite.com
- **Skill mechanics + sync infrastructure:** Annie Johnson + Halo Team — Annie.Johnson@datasite.com
- **Halo-app prototype (Asset Sale Journey Map — the visible canonical persona artifact):** Melissa, with assist from Annie/Irene if needed
- **Routing logic ("when to pick X"):** Engineering — lives in `audience/SKILL.md` and the bottom of each stub file
- **Constraint principle:** keep the persona set tight per JT's framing — cover 80-90% of use cases; use variants for context shifts rather than spinning up new personas

## Why this structure works

- **One write, many surfaces.** Melissa updates Confluence once. Rovo refreshes automatically. The skill markdown refreshes on a schedule. The journey map is hand-maintained but on the same data model.
- **No drift between AI and humans.** Designers chatting with Rovo Daniel and the AI agent reading the skill stub both see content derived from the same Confluence page.
- **Skill mechanics stay out of Melissa's way.** She doesn't need to learn YAML, frontmatter, kebab-case slugs, or the routing logic. She writes prose in Confluence. The skills handle the rest.
- **Routing is engineering's job.** When to pick Daniel vs. Daniel-CorpDev vs. Desmond is a design-system decision encoded in skill files — Melissa doesn't have to maintain it.

## Future enhancements

| Idea | Effort | Value |
|---|---|---|
| **Slack notification** when `persona-sync` lands a real change | Low | Medium — closes the awareness loop |
| **Per-prototype audience analytics** — gallery filter by persona; how often each persona is used as audience | Medium | Medium — research signal on which personas drive design work |
| **Rovo agent runtime integration** — Step 7c walkthrough optionally routes through Rovo for "second opinion" | High | High — but requires Rovo API which doesn't exist yet |
| **Auto-detect persona drift** — alert if the journey map prototype diverges from the Confluence page on JTBDs/pain points | Medium | Medium — catches the kind of inconsistency we surfaced for Deborah today |
