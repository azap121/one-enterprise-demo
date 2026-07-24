# Phase 3 Handoff — chat run + citations canvas + approval gates + seat toggle

**State as of 24 Jul 2026 (evening): PHASE 3 BUILT + smoke-tested** — everything below plus the Merlin-mode frame is implemented and pushed. Phase 4 (motion polish, BRIEF demo script, final deploy smoke) is next. Read `BRIEF.md` first, then this.

## What shipped (Phase 3 build record, 24 Jul)

- **CIM run** — `state/cimRunScenario.ts` phase machine (`idle → working → plan-ready → executing → output-ready → accepted`), keyed off the playbook id via `QUEUE_PLAYBOOK` (Agent card click stages the prompt + arms the engine; submit never parses composer strings). Timers live in `FolderRecommendationsChatAssistant` effects, AX cadence 950/1050ms, reduced-motion collapses to 80ms.
- **Chat cards** — `CimWorkLog` (elapsed badges, mono sub-process line, tanzanite `@Grata` tool-call chip), `CimPlanCard` (est.-credits line; Approve plan → Executing → Done, no layout shift), `CimOutputCard` (deliverable-named, Blueflame action bar, **audit stamp "Ran in <mode> · … approved by you"**), `GrataSimilarCard`.
- **Cited review canvas** — `CimReviewCanvasView` on new `deal-review` tab: Nexus toolbar/view-strip anatomy + per-cell citation badges (page + verbatim quote + confidence + basis popover — deliberately beyond real Blueflame). Footer = the commit gate; copy follows the dial. Accept → Tracked chip + Overview echo (activity row + next-step, sticky via `cimAcceptedOnce`).
- **Merlin mode** — `MerlinComposerFrame` + `state/merlinFixtures.ts`: Normal ⇄ Merlin toggle (⌘M), Normal = frontier-model chip (GPT-5.5/Opus 4.8/Sonnet 4.6/Gemini 3.1 Pro/Perplexity Sonar) + web toggle + conversation-only replies; Merlin = autonomy dial chip (Guide me / Plan first / Draft ahead / Run it / Sandbox, keys 1–5, microcopy) + animated gradient border + pre-run credit estimate. Dial branches the run: 1–2 plan-gated, 3–4 straight to the commit gate ("Ready to file into Deal › Review — approve?"), Sandbox = banner + file-to-deal disabled. Run-time facts are **frozen on the message via `runMeta`** so reruns on a different dial can't rewrite the audit history.
- **Two-tier vocabulary** — rail is ONE "Agents" library grouped Source/Evaluate/Diligence/Monitor (`CALDERA_AGENT_GROUPS`); governed runners folded in with status chips (Deal Research Agent flips active during execution); assistant is "Blueflame AI" in all deal-scoped copy.
- **Seat toggle** — rail `Seat` control: Alex (chat-first) ↔ Morgan (structure-first → canvas expanded, chat docked). `persona.ts` gained `morgan` + `DealLayout`.
- **Smoke-tested in-browser** (gstack /browse): full plan-first run → accept → Overview echo; Draft-ahead rerun with frozen history; @Grata similar; seat toggle; model menu; Aldgate + Phases 1–2 regression clean. `npm run build` passes; no new tsc errors (4 pre-existing in `briefScenario.ts`).

**Known deltas for Phase 4:** motion pass (card collapse cause→effect flashes, stagger tokens), BRIEF.md demo script incl. the "notice what we never built: an unsafe mode" beat, Guide-me per-step cards (currently falls back to plan-gated flow), split-pane source viewer in the review canvas (citation popover shipped instead).

## What Phase 3 builds (the 5th demo beat, plus the toggle)

On the Caldera deal: run the "CIM Screen — buy-side" playbook from chat →
1. **Glass-box work log** — timed scripted steps (methodology-revealing labels; one step must be a visible `@Grata` tool call — the federation story), per the manda-aOS AX vocabulary (`~/Datasite/manda-aOS/manda-aOS-AX-UX-ENRICHMENT.md` §2: step cadence ~800–1100ms, elapsed badges, sub-process lines).
2. **Plan card → "Approve plan" gate** — nothing executes before approval; button morphs Approve→Executing (no layout shift).
3. **Cited review table in the right canvas** — Nexus-shaped (see `enterprise/scrapes/a4-blueflame-nexus-table.md` for real column/cell/toolbar anatomy) **plus per-cell citation badges (page + quote)** — deliberately BEYOND real Blueflame (which only offers doc-open-in-split-pane provenance; per-cell kebab there is Copy/Reload Cell/Lock Cell). Keep the split-pane source-viewer affordance too if cheap.
4. **Accept → lands in the deal** — approved output writes into a Deal › Review surface with a "Tracked" badge; visible cause→effect.
5. **Seat toggle** — extend `state/persona.ts`: Alex (chat-first, current default) vs operator (structure-first). The Stifel base's seat machinery is the reference.

## Extension points scaffolded by Phase 2 (deliberate — use them)

- **Approval-gate copy is already planted:** the queue-CIM reply says "you'll approve before anything runs"; playbook prompts end "Hold for my approval."
- **Playbooks are structured data:** `state/dealsFixtures.ts` → `CALDERA_PLAYBOOKS[]` has `id`, `prompt`, `input`, `sentTo` — key the run engine off the playbook id, don't parse composer strings.
- **Canvas tab pattern is the extension point:** add a `citations`/`review` tab to the tab union + `RIGHT_CANVAS_TAB_META` + `RightCanvasTabContent` switch in `RightContextCanvas.tsx` (same as `intelligence` was added).
- **"Deal Research Agent"** (idle, capabilities `corpus.list`/`doc.read`/`citation.resolve` in the rail) was scaffolded as the citation-resolving actor — the run should flip it to active during execution.
- **`SET_COMPOSER` action** pre-fills the composer from any surface.
- `dealId != null` gates all deal-scoped UI (disambiguates from Aldgate's `flow: 'sourcing'`).

## Vocabulary (LOCKED — from doc 09 IA-direction decisions, 24 Jul)

- The assistant is **"Blueflame AI"** (proper noun, singular) — never "an agent", never Amp/Ana.
- **"Agents" = the library items** (blueprints + push-button skills), outcome-named, grouped by deal-lifecycle stage. Phase 3 should demo this two-tier vocabulary — the current rail's "Playbooks" section header should become **"Agents"** during Phase 3 (and the current "Agents" governed-runner cards need a rename decision — check doc `enterprise/09-ia-direction-skills-agents-research.md` before renaming; likely fold into the same lifecycle-grouped library with status chips).
- Outputs named by deliverable (memo / model / buyer list / dashboard), not "artifacts"/"apps".
- One unified run panel regardless of what's invoked (Alice's consistency objection — converge the doorway).

## Merlin mode — two-mode assistant frame (ADDED 24 Jul, from `enterprise/11-merlin-mode-plan.md`)

Phase 3's run beat gets wrapped in a two-mode composer frame:

- **Normal mode** = chat with a **frontier-model picker chip** (roster fixture from Blueflame recon §3: GPT-5.5, Claude Opus 4.8, Sonnet 4.6, Gemini 3.1 Pro, Perplexity Sonar) + web toggle. Conversation only; never writes to the deal.
- **Merlin mode** = agentic. Model chip swaps for an **autonomy dial chip** (same composer slot); animated gradient border signals the mode; agent @-mentions available.
- **Autonomy dial (5 positions, number-key shortcuts, one-line microcopy each):** 1 **Guide me** (approve every step) · 2 **Plan first** (approve the plan, then run — DEFAULT for Deal spaces) · 3 **Draft ahead** (runs freely, asks before anything lands in the deal record or leaves the room) · 4 **Run it** (end-to-end, gates only at hard commits: send/file/share/external) · 5 **Sandbox** (full autonomy, personal scratch space, outputs cannot touch the deal record).
- **Build mapping:** the scripted CIM-Screen run IS "Plan first" — no new engine. Add ONE extra scripted moment: rerun in "Draft ahead" → plan gate skipped, commit gate still fires ("Ready to file into Deal › Review — approve?"). Sandbox = banner-only teaser (Phase 4 optional).
- Mode is sticky per space. Show estimated credits pre-run in Merlin mode (budget-panel pattern).
- Demo-script line: "notice what we never built: an unsafe mode" — Claude Code's Bypass becomes our Sandbox (safe-by-isolation, not dangerous-by-permission).

## Inputs that may land mid-phase

- `enterprise/scrapes/a5-blueflame-playbooks-chrome.md` (blueprint preview step-pipeline anatomy) and `a6-blueflame-chat-anatomy.md` (response structure/citations/action bar) — if present, mirror them; if absent, fall back to `research/blueflame-platform-recon-FINAL.md` §4 (response rendering: headed sections, inline citations, tables with "Export to Excel", "Recommended Next Steps", "Caveats" block, per-response action bar: copy/email/download/save-to/thumbs).

## Constraints (unchanged)

Scripted timed state machines only (no real async) · `npm run build` must pass · Halo tokens only (no invented hex) · Aldgate + Phases 1–2 flows must keep working · fictional data · no new deps · commits end with `Co-Authored-By:` trailer per repo convention.

## After Phase 3 → Phase 4 (short)

Motion polish pass (AX tokens), BRIEF.md demo script (5 beats), final deploy + smoke. Task list lives in the design session; the build plan of record is `~/Datasite/flat-structure/enterprise/06-build-plan-merged-ia-prototype.md`.
