# Phase 3 Handoff — chat run + citations canvas + approval gates + seat toggle

**State as of 24 Jul 2026:** Phases 0–2 complete and live at https://one-enterprise-demo.vercel.app (root redirects to `/projects/paza-one-enterprise-deal-os`). Phase 3 is next. Read `BRIEF.md` first, then this.

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

## Inputs that may land mid-phase

- `enterprise/scrapes/a5-blueflame-playbooks-chrome.md` (blueprint preview step-pipeline anatomy) and `a6-blueflame-chat-anatomy.md` (response structure/citations/action bar) — if present, mirror them; if absent, fall back to `research/blueflame-platform-recon-FINAL.md` §4 (response rendering: headed sections, inline citations, tables with "Export to Excel", "Recommended Next Steps", "Caveats" block, per-response action bar: copy/email/download/save-to/thumbs).

## Constraints (unchanged)

Scripted timed state machines only (no real async) · `npm run build` must pass · Halo tokens only (no invented hex) · Aldgate + Phases 1–2 flows must keep working · fictional data · no new deps · commits end with `Co-Authored-By:` trailer per repo convention.

## After Phase 3 → Phase 4 (short)

Motion polish pass (AX tokens), BRIEF.md demo script (5 beats), final deploy + smoke. Task list lives in the design session; the build plan of record is `~/Datasite/flat-structure/enterprise/06-build-plan-merged-ia-prototype.md`.
