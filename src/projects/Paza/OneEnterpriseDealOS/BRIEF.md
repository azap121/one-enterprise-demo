# One Enterprise Deal OS — the Grata × Blueflame merged IA, made clickable

**Live:** https://one-enterprise-demo.vercel.app (root lands on this demo) · **Status:** Phases 0–4 complete (24 Jul 2026)
**Audience:** Grata/Blueflame teams + JT — the deal-spine argument as a working prototype, not a diagram.
**Companion docs:** build plan `~/Datasite/flat-structure/enterprise/06-build-plan-merged-ia-prototype.md` · merged IA `04-…` · vocabulary decisions `09-…` · Merlin mode `11-merlin-mode-plan.md` · build record `PHASE-3-NOTES.md`.

## The argument in one line

Neither product has an organising deal object — users pay a "translation tax" converting deal-shaped intent into feature-shaped structure. This demo hosts both products' muscle (Grata sourcing, Blueflame agentic work) on one deal spine, governed by gates the user holds.

## Demo script (~8 minutes)

### Beat 1 — My Deals (the return path neither product has)
Open the root URL. Deal cards with state: stage, running agents, waiting questions. *"Where are we working today, Alex?"* is the landing, not a feature menu.

### Beat 2 — Source & screen → the promote-to-Deal moment
Click **"Find HVAC companies in Texas, $10M–$50M revenue."** Grata-style AI parse (editable term chips) → results table. Select the top three targets → **Promote to Deal** → *Project Caldera* lands on My Deals carrying the search, targets, and signals. **This is the money moment: the re-keying cliff, killed on screen.**

### Beat 3 — Deal workspace (chat-first, canvas alongside)
Open Project Caldera. Chat is the primary surface; the Overview canvas shows "where was I": carried search chips, targets with seller-intent, next steps, activity. The rail is **one "Agents" library** — blueprints, push-button skills, and governed runners folded together, outcome-named, grouped by lifecycle (Source · Evaluate · Diligence · Monitor). The assistant is **Blueflame AI** — never "an agent."

### Beat 4 — The run: Merlin mode, glass box, gates (the centrepiece)
1. Point at the composer: **Normal mode** — frontier-model picker chip (GPT-5.5, Opus 4.8, Sonnet 4.6, Gemini 3.1 Pro, Perplexity Sonar) + web toggle. Chat only; nothing writes to the deal. Blueflame already ships this roster — we kept it.
2. Click **"CIM Screen — buy-side"** in the rail. The composer flips to **Merlin mode** (gradient border = the "am I about to commit/spend?" glance test), the model chip becomes the **autonomy dial** (default: *Plan first*), the prompt is staged with a pre-run estimate: *est. 14 credits · hard stop at 50*. Press Enter.
3. **Glass-box work log** streams (methodology-revealing steps, elapsed badges) → **plan card** → **Approve plan** (button morphs to *Executing*, no layout shift) → execution log with a visible **@Grata tool call** mid-run — *sourcing invoked inside diligence, the federation story.*
4. The **cited review table** slides into the canvas: Nexus-shaped, but every cell carries a citation badge — page, verbatim quote, confidence, source-vs-inference. **This is deliberately beyond today's Blueflame** (doc-open provenance only). One row is flagged red: customer concentration 38% vs thesis cap 30%.
5. **Accept & track** → Tracked badge → flip to Overview: activity row *"Blueflame AI — CIM screen … tracked to Review"* and the next-step checked. Visible cause→effect on the deal spine.
6. Note the output card's audit stamp: *"Ran in Plan first · plan approved by you."* Mode-of-autonomy in the audit trail — the NDA-AI-clause compliance answer nobody else shows.

### Beat 5 — The dial (Claude Code translated for dealmakers)
Open the autonomy dial: **Guide me · Plan first · Draft ahead · Run it · Sandbox** (keys 1–5, one-line microcopy each). Re-run the CIM screen on **Draft ahead**: no plan gate — but the commit gate still fires: *"Ready to file into Deal › Review — approve?"* Then dial to **Sandbox**: banner — *personal workspace, nothing here touches the deal record* — and filing is disabled.

> **The line to land:** "Notice what we never built: an unsafe mode. Claude Code's scariest mode became our safest — dangerous-by-permission inverted into safe-by-isolation. The dial just moves *where the human signs*."

Optional coda: type `@Grata find companies similar to GulfAir Mechanical` mid-chat — four comps return inline. And the **Seat** toggle (Alex → Morgan) flips the same deal from chat-first to structure-first — canvas primary, chat docked. Same spine, two working styles.

## What's real vs scripted

Everything is a timed, scripted state machine (the manda-aOS pattern) — no live agents, no real data, fictional companies. The fixtures ARE the contract a real runtime satisfies later (see the agents framework plan's two-phase seam). Grata filter/table anatomy, the Blueflame agent catalog, Nexus grid chrome, and the model roster are drawn verbatim from the July platform recons.

## Lineage

Forked from `azap121/halo-stifel-discovery-demo` → `StifelDealAssistantChatFirst` (the chat-front-and-centre paradigm; its preserved concept record lives in that repo). Halo tokens synced to `ds-ui-libraries` v2.1.566. The Aldgate sell-side flows (Q&A triage, filing, brief) are inherited and still work — they read as the Datasite-room end of the same spine.
