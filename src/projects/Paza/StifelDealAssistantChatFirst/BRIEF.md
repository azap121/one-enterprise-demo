# Stifel Deal Assistant — Chat-First (original concept, preserved record)

> **Provenance:** This is a preserved snapshot of the *original* chat-front-and-centre
> paradigm for the Stifel Deal Assistant — Datasite AI chat as the primary workspace
> with the right-hand context canvas opening alongside it. It is recovered verbatim from
> the pre-v2 state (git commit `19726c88`, before the `09d47b31` "structure-first"
> paradigm pass that inverted the layout to room-index-primary with a docked agent).
> Kept as a standalone prototype so the original idea survives as a record alongside the
> current structure-first version (`paza-stifel-deal-assistant`). Do not "upgrade" this —
> its whole purpose is to freeze the original concept.

## Intent

Adapt the William Blair Robbin agentic prototype (Datasite AI chat + right context canvas) into the Stifel discovery scaffold: one prototype both Tom Koula (Associate, process owner) and Jaime Bergaz (Analyst, room operator) can interact with, on the synthetic Project Aldgate sell-side software mandate with four parallel bidder groups (Falcon, Kestrel, Harrier, Osprey).

## Status: telemetry-calibrated (pre-session pass, 2026-07-16)

The 2026-07-16 Snowflake telemetry inverted the original seat hypothesis (the Associate seat does the raw operator work; the Analyst seat never touches the platform — Q&A runs over email in 11 of 12 multi-bidder rooms). The pre-session quick wins from `manda-aOS/discovery/stifel-tom-koula-jaime-bergaz/03-prototype-shaping-plan.md` are applied:

- Evidence chips show real firm-level aggregates (`qaTriageData.ts`) — aggregate-only; named-user numbers never appear.
- Seats relabeled: Tom = "Associate · runs the room" (in-room operator), Jaime = "Analyst · works ahead of the room" (outside-the-room bridge).
- The scripted flow is reframed as the email bridge: forwarded bidder Q&A thread → cited, governed batch, approval-gated.
- Headline bets: Tom = "State of the room" (the supervision layer he skips); Jaime = email Q&A ingestion.

Post-session iterations (bidder-group scaffolding flow, explicit email-parse step, MD-brief artifact, outside-the-room canvas concepts) are queued in the shaping plan §7. A few `rightCanvasFileData.ts` fixture markers remain — the synthetic Aldgate index was kept deliberately (plausible; telemetry doesn't contradict it).

## Seat model

Top-bar toggle switches the signed-in persona (Tom ↔ Jaime) and resets the workspace so seats never share a mid-flight conversation. The switcher toggles where the work lives relative to the room, not seniority. All assistant copy is seat-neutral ("you", "the deal team"). See `state/persona.ts`.

## Design question (carried from the prep pack)

Would a Stifel deal team let an agent run governed Q&A triage — and stage the room — if nothing went live until they approved every step? Which seat trusts it first?

## Scripted flows

Three full scripted flows now exist:

1. **Email Q&A bridge** (featured card, both seats): prompt → editable 7-phase plan (approval-gated) → animated execution → cited Q&A triage table → save batch.
2. **Batch-upload filing** ("File my latest upload", Tom's seat only): prompt → thinking steps → filing plan proposal (14 files filed, 2 new folders, 2 renames, 4 held) → tree-diff review in the "Filing plan" canvas tab (editable: rename, add folder, remove proposals) → "Apply filing plan" confirm dialog → save steps → applied. Built by reactivating the dormant folder-recommendation machinery (ChangeTree/FolderReviewWorkspace/compositeTree) inherited from `../FolderRecommendationsChatAssistant`; fixture in `state/filingScenario.ts`.
3. **State of the room** (both seats): prompt → editable 6-phase brief plan (approval-gated, brief-specific copy in the plan card and Plan tab) → run steps → structured `BriefReadoutCard`: moved / stuck / would-embarrass-us sections, each line with view-only citation chips that open the source in the file-preview canvas (Access Log Extract, Staging Manifest, Q&A SLA Tracker, Disclosure Log — `BRIEF_SOURCE_FILES`), plus a Copy-brief button. Fixture in `state/briefScenario.ts`.

The `flow: 'qa' | 'filing' | 'brief'` field on `WorkspaceState` disambiguates the shared stage machine per chat session. "Stage the client drop" returns a scripted text reply (reducer `getScriptedReply`).

## Lineage

Forked from `azap121/halo-william-blair-robbin-demo`, `src/projects/Paza/WilliamBlairQaSearch` (kept in-repo, unregistered, as reference). Session prep: Notion "Stifel Discovery — Tom Koula & Jaime Bergaz"; prompt pack and static exhibits in `manda-aOS/discovery/stifel-tom-koula-jaime-bergaz/`.
