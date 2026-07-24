---
name: prototype-context
description: Use this skill at the start of any prototype work in halo-app to pull upstream context from Atlassian (JPD, PRD, Jira ticket, Confluence page) before scaffolding begins. Triggers when a designer pastes a Jira/JPD/Confluence URL or ticket ID (e.g. CRAFT-19), or says "pull context for X", "what's the context for X", "use this ticket", "this is for [JPD/PRD link]". Also invoked automatically by the `halo-prototype-workflow` skill at Step 1.5 — the agent always asks "got a JPD/PRD/Jira link driving this?" before scaffolding so the rest of the workflow has a real brief to anchor on. Designed to fail gracefully — if no upstream context exists (true exploratory work) or Atlassian MCP isn't available, the skill returns a minimal brief and the workflow continues without it.
user-invocable: true
---

# Prototype Context Skill

Pulls the upstream design/product context for a halo-app prototype before scaffolding, so the persona-lens steps and the post-build walkthrough have something real to anchor on instead of asking the designer to re-type what already exists in Atlassian.

## When this skill runs

- **Automatically** as Step 1.5 of `halo-prototype-workflow` — right after the designer confirms name/title/design question.
- **On demand** when the designer pastes a URL or ticket ID and asks for the brief.
- **Standalone** — designer can ask "pull context for CRAFT-19" outside the workflow as a research tool.

## What it does

1. Asks the designer: *"Got a JPD, PRD, or Jira ticket driving this? Paste a URL or ticket ID. If exploratory, say 'no upstream'."*
2. If the designer provides input, the agent fetches via Atlassian MCP:
   - **Jira / JPD ticket** → `mcp__b62aabfa-f424-4a48-ae29-6728f06caba6__getJiraIssue` — pulls fields, description, custom JPD fields (Target persona, Hypothesis, Insight, JTBD).
   - **Confluence page (PRD, research)** → `mcp__b62aabfa-f424-4a48-ae29-6728f06caba6__getConfluencePage`.
   - **1-hop linked items only** → `mcp__b62aabfa-f424-4a48-ae29-6728f06caba6__getJiraIssueRemoteIssueLinks` to find a linked PRD or research page. Do NOT chase transitive links beyond one hop — context blowup risk.
3. Distills the result into a **prototype brief** (template below).
4. Detects:
   - **Persona mention** — match the brief text against `{Daniel, Daniel-CorpDev, Desmond, Deborah}`. If found, pre-fill the audience for the next step.
   - **JTBD** — look for explicit JTBD fields, hypothesis statements, or "user wants to…" patterns.
   - **Success criteria** — pull from PRD acceptance criteria; this becomes the rubric for the Step 7c persona walkthrough.
5. After the prototype folder is scaffolded (workflow Step 3), writes the brief to `src/projects/<Designer>/<PascalName>/BRIEF.md` so the artifact persists alongside the code.

## Output format — the prototype brief

```markdown
# Prototype Brief — <Title>

**Source(s):** CRAFT-19 (JPD), DESIGN/PRD-Reviewer-Dashboard (Confluence)
**Pulled:** 2026-05-20

## What we're building
<1-2 sentences distilled from the PRD or JPD description>

## Who it's for (detected)
- Persona: **Daniel — Sell-Side Analyst** (source: JPD field "Target persona")
- Variant: Default Sell-Side

## Job to be done
<JTBD verbatim from JPD or PRD if defined; otherwise "Not specified — will ask designer">

## Success criteria
- Criterion 1 (from PRD acceptance criteria)
- Criterion 2
- Criterion 3

## Gaps the designer should fill
- <Anything not covered by the upstream docs, e.g. "Visual style direction not specified — using Halo defaults">
- <e.g. "No anti-patterns called out — will ask in Step 2.6">
```

The brief sits in working context for the rest of the workflow. Steps 2.5 (audience), 2.6 (persona-lens framing), and 7c (persona walkthrough) all read from it.

## Fallback modes

### No Atlassian MCP available
If the Atlassian MCP tools aren't loaded (e.g. designer doesn't have it configured yet), the skill asks the designer to **paste the relevant context manually**:

> "Atlassian access isn't set up for you yet. Paste the key paragraphs from the JPD/PRD (target persona, hypothesis, success criteria) and I'll work from that. Or say 'exploratory' and we'll skip this step."

Same brief structure, manual input.

### "Exploratory" — no upstream context
Designer is mocking up something with no Jira/Confluence trail. Skill returns a minimal brief:

```markdown
# Prototype Brief — <Title>

**Source(s):** None — exploratory
**Pulled:** 2026-05-20

## What we're building
<From the designer's Step 1 design question>

## Who it's for
Not specified — will ask at Step 2.5 (audience).

## Job to be done
Not specified — will ask at Step 2.6 (persona-lens framing).

## Success criteria
None defined upstream — Step 7c walkthrough will use generic JTBD-fit instead of measured criteria.
```

The workflow continues. The persona-lens framing question (Step 2.6) fires in this mode because there's no brief content to skip it.

### Atlassian MCP returns nothing useful
Ticket exists but is empty/stub. Treat as "exploratory" — note the source link in the brief but warn the designer: *"CRAFT-19 doesn't have a target persona, JTBD, or success criteria filled in. I'll fall back to asking you directly. Worth pinging the PM to fill it in for next time."*

## Important constraints

- **1-hop max.** Don't follow links transitively. A JPD links to a PRD → fetch the PRD. The PRD links to a research synthesis → DO NOT also fetch the synthesis. Stop at one hop.
- **No caching.** Always re-fetch. Atlassian content changes daily; a stale brief is worse than no brief.
- **Sanitize content.** If the fetched JPD/PRD contains internal links to other tickets, dashboards, or files, mention them in a "Related links" section but don't fetch them.
- **Persist the brief.** After scaffolding the prototype folder, write the brief to `src/projects/<Designer>/<PascalName>/BRIEF.md` and stage it for commit alongside the prototype code. This makes the brief part of the gallery artifact — future designers (or AI) reviewing the prototype can see why it was built.
- **Never block the workflow.** If anything goes wrong (MCP timeout, permission denied, malformed ticket), surface the issue, fall back to manual or exploratory mode, and continue. Prototype work is supposed to feel fast.

## What this skill does NOT do

- Generate or invent PRD content. If upstream context is thin, the brief reflects that — don't fill in plausible-sounding JTBDs from imagination.
- Crawl deep link graphs. One hop only.
- Replace the designer's intent. The brief is anchoring context, not a spec the agent must obey. If the designer's design question diverges from the JPD, follow the designer.

## Ownership

- **Skill owner:** Annie + Halo Team
- **Upstream context owner:** the PM who created the JPD/PRD (escalate empty tickets to them, don't paper over)
- **Atlassian MCP setup:** see `~/.claude/CLAUDE.local.md` — currently connected for Annie only; team rollout pending
