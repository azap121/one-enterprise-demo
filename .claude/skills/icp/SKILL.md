---
name: icp
description: Use this skill to apply a Datasite ICP (Ideal Customer Profile) lens to a prototype, design, copy, or feature focused on a buying moment — positioning, pricing, sales enablement, marketing pages, or anything where the audience is a buyer evaluating Datasite rather than a daily user inside the product. Triggers on phrases like "design this pricing page", "what would a buyer think", "is this clear for procurement", "how do we position this for [firm type]", or any explicit ICP reference. Also invoked by the `audience` router skill when the routing decision is "buying" rather than "interaction". ICP content lives in `references/<icp>.md` — each file is a stub that Melissa Thompson and Product Marketing populate with firm type, deal triggers, buyer titles, evaluation criteria, and competitive context. Distinct from the `persona` skill — ICPs describe firms/buyers, personas describe users.
user-invocable: true
---

# ICP Skill — Buying Lens

The buying-moment specialist. Loads a Datasite ICP profile and applies it when a designer is working on something a *buyer* evaluates — not something a *user* does day-to-day.

This is the **buying** half of JT's buying-vs-interaction split. For in-product day-to-day moments, the `audience` router sends to `persona` instead.

## ICP vs Persona — the distinction

| Dimension | Persona (interaction) | ICP (buying) |
|---|---|---|
| Unit | A person | A firm + the buyer title within it |
| Question answered | "What is this user trying to do?" | "Why would this firm buy Datasite?" |
| Owners | Design + Research (Melissa's team) | Product Marketing + Sales |
| Typical use | In-product flows, dashboards, micro-interactions | Pricing, positioning, marketing pages, sales pitch |
| Content source | Research interviews, JTBD frameworks | Win/loss interviews, firmographics, deal triggers |

When in doubt: **is the designer building something the user touches daily, or something a buyer evaluates once?** Daily → persona. Evaluation moment → ICP.

## ICPs covered

ICP content lives in `references/<icp>.md`. As of 2026-05-20:

| ICP | File | Status |
|---|---|---|
| Datasite MCP ICP | `references/mcp-icp.md` | **Stub** — content lives in Paza's 5 PMM docs (SharePoint) |

The Product Marketing team (per Paza's #product-designers post 2026-05-18) maintains:
- Datasite MCP ICP (PowerPoint deck on SharePoint)
- Datasite MCP Positioning Statement
- Datasite AI Messaging Hierarchy
- Datasite AI pricing and billing FAQs
- Datasite with Blueflame AI FAQs (Word doc)

**Action item for Annie:** ask Melissa or Paza to mirror the ICP definition into Confluence (DESIGN space or PRODUCT space) so this skill can link to a canonical, fetchable source. SharePoint docs aren't reachable from this skill.

## What this skill does

When invoked:

1. **Load the requested ICP file** from `references/`. If not specified, ask: *"Which buying moment? Datasite MCP, AI add-on, or general Datasite?"*
2. **Surface the buyer's evaluation criteria**: who they are (titles, firm types, deal stages), what they look for, what they reject, what they compete against.
3. **Apply the lens to the work**: review the prototype, page, or copy through the buyer's eyes — does it speak to their evaluation criteria? Does it position against the right competitive frame?

## Mode 1 — Buying-lens framing (BEFORE build)

Similar to persona-lens framing but reframed for buyers. SKIPPED if the brief already covers buyer context.

```
🎯 ICP check — I'm <buyer title> at <firm type>.

Before you build, help me see why I'd care:
  1. What problem am I trying to solve at the firm level?
  2. What would make me say "this is worth a procurement conversation"?
  3. What would make me say "this is no different from [competitor]"?

Answer in 2-3 sentences.
```

## Mode 2 — Live buying-moment walkthrough (AFTER build, ADVISORY)

Same shape as the persona walkthrough but the questions are different. The agent walks the prototype as the buyer:

- Can I tell what Datasite is and isn't, in 30 seconds?
- Is the pricing/value framing clear without a sales call?
- Are the proof points (logos, stats, quotes) the kind that move my procurement team?
- Where do I expect to find ROI math? Is it there?

### Output format

```
─────────────────────────────────────────────
ICP WALKTHROUGH — <ICP name>
Prototype: <title>  ·  Mode: live preview
─────────────────────────────────────────────

⚠ This is a synthetic ICP check, not real win/loss data.
  Real buyers may disagree. Use as a cheap first reviewer,
  not validation.

Buyer-question coverage   <X>/<Y> questions answered
Competitive positioning   <clear / muddled / missing>
Proof-point strength      <strong / weak / absent>
Overall rating            <S>/10  (advisory)

Top friction
  • <element> — <why a buyer would stall here>

What <buyer> would say
  "<one verbatim quote in the buyer's voice>"

Strengths
  • <thing the prototype does well from this ICP's POV>
```

## What this skill does NOT do

- Generate new ICPs from imagination. ICPs come from Product Marketing's win/loss research.
- Replace sales reviews or PMM review of marketing collateral.
- Apply persona/interaction thinking. For in-product flows → use the `persona` skill.

## Ownership

- **ICP content owner:** Melissa Thompson (Product Design, Mgr) — coordinates with Product Marketing
- **Source documents owner:** Product Marketing team (Paza Bahia surfaced them on 2026-05-18)
- **Skill mechanics owner:** Annie + Halo Team
- **Canonical sources (SharePoint — NOT fetchable from this skill):**
  - Datasite MCP ICP
  - Datasite_MCP_Positioning Statement
  - Datasite AI Messaging Hierarchy
  - Datasite AI pricing and billing FAQs
  - Datasite with Blueflame AI FAQs

## Action items

1. **Annie + Melissa:** mirror SharePoint ICP definitions into Confluence so this skill has a canonical fetchable source.
2. **Annie:** introduce Melissa to the `icp` skill structure during the 2026-05-20 meeting and ask her to draft the first ICP file (MCP) by an agreed date.
