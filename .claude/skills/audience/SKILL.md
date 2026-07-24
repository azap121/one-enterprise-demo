---
name: audience
description: Use this skill when a Datasite designer needs to anchor a prototype, design, copy, or feature to a specific audience — either a Datasite persona (interaction users like Daniel/Desmond/Deborah) or an ICP (buyer firmographics). Triggers on phrases like "design this for [persona]", "would [persona] understand this", "who is this for", "review through [persona]'s lens", "is this for [role]", or any mention of the persona names (Daniel, Desmond, Deborah, or variants). Also invoked automatically by `halo-prototype-workflow` at Step 2.5, after `prototype-context` has produced a brief. This skill is a router — it disambiguates buying-moment vs interaction-moment context, then hands off to the `persona` or `icp` specialist skill. Do not duplicate persona/ICP content here; this skill only routes.
user-invocable: true
---

# Audience Router Skill

The single entry point for any "who is this for" question in halo-app. This skill exists because designers shouldn't have to know the difference between an ICP (who buys) and a persona (who uses) — the skill teaches the split by routing them to the right specialist.

## Mental model

JT framed this in the #product-designers Slack thread on 2026-05-18: **ICPs ≠ Personas, but they get confused. Bundle them as buying behaviors or interaction behaviors.**

| Behavior type | What it describes | Specialist skill |
|---|---|---|
| **Buying** | Triggers a purchase. Firmographics, deal size, buyer titles, sales pitch. | `icp` |
| **Interaction** | Day-to-day product use. JTBD, friction, in-app moments. | `persona` |

Same human can have both — Daniel "buying" on a pricing page is one lens; Daniel "interacting" in the deal room is another. The skill routes based on **what the designer is building**, not which person they're imagining.

## When this skill runs

- **Automatically** as Step 2.5 of `halo-prototype-workflow` — right after `prototype-context` produces a brief and before `datasite-halo-design` confirms tokens.
- **On demand** when designer asks "who is this for" or "design this for [name]".

## What it does

### 1. Check the brief first (if one exists)

If `prototype-context` produced a brief at Step 1.5 and the brief named a persona or ICP, **skip the routing step entirely**. Confirm in one line:

> "Brief named Daniel (Sell-Side) — loading his profile."

Then invoke the `persona` skill with that persona pre-selected. Done.

### 2. Infer from the design question (if no brief)

Read the designer's Step 1 design question and the prototype title. Use these heuristics to infer:

| Cue | Likely route |
|---|---|
| "pricing", "upgrade", "positioning", "pitch", "sales", "ROI", "compete with", "marketing" | **buying** → `icp` |
| "in-product", "workflow", "review", "data room", "deal room", "navigate", "complete a task", "find a doc", "permissions", "notifications" | **interaction** → `persona` |
| persona name explicitly mentioned ("for Daniel", "as Desmond") | **interaction** → `persona` (pre-selected) |
| Ambiguous or both ("home page that converts AND helps reviewers") | ASK |

### 3. Confirm with the designer (one beat)

State the inference and offer to correct in a single, scannable message:

```
Based on "<design question>", this looks like an INTERACTION moment.
Routing to the persona skill.

Confirm, or pick differently:
  ☐ Interaction (persona — design for daily use)
  ☐ Buying (icp — design for purchase moments)
  ☐ Both (load persona AND icp)
```

If the brief or design question explicitly named a persona, also offer the **variant selector** when applicable:

```
Persona: Daniel (Sell-Side Analyst)
Variant:
  ☐ Sell-Side (default)
  ☐ Corporate Development (added May 2026)
```

### 4. Hand off to the specialist

After confirmation:

- **Interaction** → invoke `persona` skill with the chosen persona name and variant.
- **Buying** → invoke `icp` skill with the chosen ICP profile.
- **Both** → invoke both, in that order; the build flow keeps both in working context.

The specialist skill loads the full profile (JTBD, anti-patterns, quotes for personas; firmographics, triggers, criteria for ICPs).

## Output the audience selection

Once the designer confirms, record the selection for downstream use:

```
AUDIENCE SELECTED
─────────────────
Type: interaction
Persona: daniel
Variant: sell-side
```

This gets:
1. Loaded into working context for the rest of the workflow.
2. Recorded in the BRIEF.md as `## Audience: daniel (sell-side)`.
3. Written to the registry entry as `audience: ['daniel']` when the prototype is registered (Step 4 of the workflow).

## What this skill does NOT do

- Define persona or ICP content — that lives in the specialist skills (`persona`, `icp`).
- Generate JTBDs or buying criteria — only routes.
- Run the persona-lens framing question (Step 2.6) or the live walkthrough (Step 7c) — those are the `persona` skill's job.
- Block the workflow if context is thin — when in doubt, just ask the designer once and proceed.

## Heuristics for tricky cases

- **"I want to prototype a notification pattern"** — ambiguous on the surface but defaults to **interaction**. Notifications are an in-product moment. Confirm with the designer before routing.
- **"I want to mock up a marketing page for the new AI feature"** — strong buying signal. Route to `icp`.
- **"Build me a dashboard for the deal team"** — interaction. Multiple personas possible (Daniel + Desmond). Use multi-select.
- **"Show me how the pricing page would look for an enterprise buyer"** — buying. Route to `icp`.
- **"Help me think about who this is for"** — designer doesn't know yet. Don't infer; offer both lenses and let them pick. This is a teaching moment — explain the buying-vs-interaction split briefly.

## Ownership

- **Skill owner:** Annie (Halo Team)
- **Persona content:** Melissa Thompson (Product Design, Mgr) — see `persona` skill stubs
- **ICP content:** Melissa + Product Marketing — see `icp` skill stubs
- **Framing principle:** JT (buying-vs-interaction bundle, per #product-designers 2026-05-18)
