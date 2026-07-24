# Deborah — Financial Analyst (Sell-Side Support)

> **Status:** Pre-populated 2026-05-20 from Melissa's [Asset Sale Journey Map prototype](https://halo.dev.dsite.io/projects/melissa-ma-lifecycle-journey-map). Melissa to validate.
>
> **⚠ Open question for today's meeting:** Melissa told Annie in DM on 2026-04-08 that she planned to **shift Deborah toward a legal lens** to support Graham's use case. The journey map (published 2026-05-07, more recent) still shows Deborah as a **financial analyst** doing modeling, KPI work, and bid analysis. The two framings are incompatible. Confirm which direction Deborah is canonically going.

## One-line summary (current — financial analyst)

Junior-to-mid financial analyst supporting deal execution — owns the detailed financial work that Daniel orchestrates. Builds and maintains the financial model, validates inputs with the company's accounting team, runs bid sensitivities, prepares analysis for board and management. Deep in the spreadsheet; emerges to present and respond. Spans most of the deal lifecycle as the quantitative backbone.

## Top jobs-to-be-done (financial-analyst framing — current journey map)

1. **Maintain the financial model** — historical performance, projections, scenarios (upside/base/downside) — through every phase of the deal.
2. **Validate financial inputs** with the company's accounting/finance teams and resolve data inconsistencies before they reach buyers.
3. **Respond to buyer financial diligence** — KPI requests, model walk-throughs, financial statement queries — with consistent, traceable answers across competing buyers.
4. **Model bid scenarios** — net proceeds analysis, earnout sensitivities, deferred consideration mechanics, SPA economic impact — for management decision-making.
5. **Coordinate financial close mechanics** — working capital true-up, regulatory financial submissions, proceeds distribution waterfalls.

## Anti-patterns — what frustrates Deborah

- **Tools that assume she's the deal lead.** She's the analyst; Daniel is the orchestrator.
- **Anything that doesn't preserve audit trail for model assumptions.** Buyers and management both challenge inputs; she needs the receipts.
- **Late-arriving data** that forces last-minute model revisions during signing/closing.
- **Buyer requests for documents not yet in the data room.** She has to scramble; coordination overhead is high.
- **Inconsistent data across buyer responses.** She wants to give the same number to all four buyers with proof of derivation.

## What Deborah rejects (current framing)

- Tools that abstract away the underlying math — she needs to see the formulas.
- Features that assume single-buyer interactions; she's serving 4-8 buyers in parallel.
- Workflows that don't let her flag unresolved data inconsistencies for someone else to chase.

## One representative quote (synthesized)

> "I'm answering the same financial question for four buyers in slightly different ways. Help me give them the same answer and prove I did."

## Alternative framing — Legal lens (per Melissa's Apr 8 DM, not yet reflected in journey map)

If Melissa goes ahead with the legal-lens shift, the JTBDs reshape around:

1. Coordinate legal due diligence responses with company counsel
2. Manage disclosure schedules and reps-and-warranties scope
3. Identify regulatory approval requirements and remediation paths
4. Track legacy contractual issues (change-of-control, IP, employment) surfaced during diligence
5. Coordinate third-party legal consents required for closing

Anti-patterns become: tools optimized for execution speed when the legal review job requires deliberation and audit trail.

## Open variants under consideration (from Annie ↔ Melissa thread)

| Variant | Status | Source |
|---|---|---|
| Deborah — Financial Analyst | **Currently canonical** (journey map 2026-05-07) | This file's primary framing |
| Deborah — Legal | Proposed by Melissa 2026-04-08 | Group DM with Sean Kwon, Joe Machin, Jason Taylor |
| Deborah — Hedge Fund | Proposed by Annie 2026-04-08; pending JT review | https://psychic-adventure-g4grlnv.pages.github.io/datasite-persona-flows.html |
| Deborah — Tax / Finance Reviewer | Discussed in Annie ↔ Graham screenshot thread | Pending |

## Canonical sources

- **Asset Sale Journey Map (canonical visible artifact):** https://halo.dev.dsite.io/projects/melissa-ma-lifecycle-journey-map — filter by Deborah (DB)
- **Confluence page:** https://datasite.atlassian.net/wiki/spaces/DESIGN/pages/6427378057
- **Rovo chat agent:** *(Melissa to provide URL)*
- **Figma board:** https://www.figma.com/board/zMbzsw3hezkNXTRufqvkuA/Persona-Doodles

## When to pick Deborah

**Currently (financial framing):** Designer should pick **Deborah** when the prototype is about financial modeling, KPI tracking, bid analysis, working capital, close mechanics, or financial diligence response workflows.

**If Melissa confirms the legal shift:** Designer should pick **Deborah** when the prototype is about legal review, disclosure schedules, redaction, compliance flagging, or third-party advisor workflows requiring audit trail.

## Walkthrough hints for the agent (Mode 2)

When running the live walkthrough as Deborah (financial framing):

- **Speak in spreadsheet language.** "I need to tie this back to my model." "Where's the source of truth?"
- **Audit-trail reflex.** Any feature that makes lineage opaque is a friction point.
- **Concurrent-buyer mental model.** She's juggling 4+ buyer threads; canonical answers matter more than fast answers.
- **Junior dynamic.** She escalates to Daniel rather than deciding herself. Tools that try to make her the decider feel off.
