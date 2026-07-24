# Stifel Deal Assistant — Discovery Prototype (v2, structure-first)

## Intent

Adapt the William Blair Robbin agentic prototype (Datasite AI chat + right context canvas) into the Stifel discovery scaffold, on the synthetic Project Aldgate sell-side software mandate with four parallel bidder groups (Falcon, Kestrel, Harrier, Osprey).

## Status: v2 paradigm pass (post-session, 2026-07-16)

The 2026-07-16 session (Tom Koula + Freddie Hindley — NOT Jaime Bergaz as prepped; name confirmed 2026-07-17, exact role still to confirm) reset the design: Tom named chat-front-and-centre a **"black box"** — operators live in folder structure. The filing flow was "stellar" precisely because it pays off as a tree diff. v2 implements `manda-aOS/discovery/stifel-tom-koula-jaime-bergaz/13-prototype-v2-paradigm-plan.md` stages S and M:

- **S1 — viewer killed.** Every file open (citation chips, Q&A table, documents, index tree) is a one-click full-screen takeover with readable text — never a small-text overlay occluding the structure. Restore shrinks back.
- **S2 — Skills + Templates merged** into one Skills surface ("templates and skills are essentially the same thing") with a visible framework/template upload affordance (stub) — upload a DD request list, get a draft skill.
- **S3 — seat-default layouts.** `state/persona.ts` carries `defaultLayout` per seat (Tom → structure-primary, Analyst → chat-primary); a top-bar toggle flips it live. Stale "Jaime" seat replaced by a neutral "Deal Analyst" seat pending Freddie Hindley's role confirmation.
- **M1 — Layout A (`components/StructureWorkspace.tsx`).** For the operator seat the room index is the permanent main surface (Excel-like); the agent is a docked right rail, collapsible and expandable to full screen. Implementation inverts the existing composition: the right-canvas tab state drives the MAIN pane; chat becomes the rail.
- **M2 — flow entries re-anchored from the structure.** An unfiled-uploads banner on the index launches the filing flow ("File with Datasite AI"); a "Find the gaps" affordance runs the gap-finder (scripted reply — the pivot from the refuted MD-readout brief: airtight-before-the-senior-looks). Q&A bridge stays chat-anchored. Tom's featured cards swap "State of the room" for "Find the gaps"; the brief flow remains featured on the Analyst seat.
- **M3 — transition grammar.** Structural payloads land on the tree in place (filing plan opens as a main-pane tab with an announcement bar; Index pill returns); after apply, the resting index shows the applied structure. Expanding the agent to full screen docks back automatically when a structural tab opens.

## Sidecar composition (2026-07-17)

There is no "Datasite AI" nav destination: the room (Documents) is the main stage and the agent is a **persistent right sidecar on every tab** (Documents, Q&A, Q&A table, Notes). `StructureWorkspace.tsx` exports the two halves: `RoomWorkspacePane` (the Documents tab — index + payload pills) and `AgentDock` (review queue + chat), composed at the container level in `FolderRecommendationsChatAssistant.tsx`. The **review queue lives in the dock** ("Needs your review" with a waiting count) — expanded when idle, folded to a summary row while a flow runs; flows launched from any tab run in the dock, and structural payload CTAs jump the main area to Documents where the tree diff renders in place. Collapsing the dock leaves a **floating sparkle button bottom-right on every tab**; the top-bar layout toggle now maps room-first ↔ chat-first to dock modes (docked ↔ expanded full-stage chat).

Seat pills were removed — the prototype runs as Tom's operator seat (`state/persona.ts` keeps the model; the Deal Analyst cards are unreachable until pills return). Top bar carries the Halo "Ask or search for anything" field (shared `DatasiteSearchField`) opening the prototype's own centred spotlight (`SearchSpotlightDialog`) — never the shell's built-in spotlight, which carries competitor branding. The old chat-primary `AiWorkspace` and the folder-panel Documents tab were deleted in this pass; `AssistantPanel.tsx` survives only as the spotlight's home.

## Design question (carried from the prep pack)

Would a Stifel deal team let an agent run governed Q&A triage — and stage the room — if nothing went live until they approved every step? Which seat trusts it first?

## Scripted flows

1. **Email Q&A bridge** (featured card, both seats): prompt → editable 7-phase plan (approval-gated) → animated execution → cited Q&A triage table → save batch.
2. **Filing — three variants on one machine** (P0.1, `state/filingVariants.ts`; `filingVariant` on `WorkspaceState`): each is prompt → thinking steps → variant proposal card → editable tree-diff review → variant confirm dialog → save steps → applied.
   - **Uploads** ("File my latest upload"): 18 new uploads; 14 filed, 2 new folders, 2 renames, 4 held (`state/filingScenario.ts`).
   - **Retro sweep** ("Tidy existing files" / "Tidy the room"): the repeated session ask — existing room content, not just uploads. 47 files swept; 5 convention renames, 2 misfiles moved, 05.04 Employment created, v7/v8 pair marked (`state/retroFilingScenario.ts`).
   - **Client drop** ("Review the client drop"): the "winner" shape verbatim — client acts in the sandbox, banker approves. 6 overnight client files; 4 filed (one closes the FY2023 gap from the gap-finder), 05.03 Insurance created, ESOP + unreadable scan held with chase notes (`state/clientDropScenario.ts`).
   In the structure layout these all launch from **"Your review queue"** on the index (uploads / client drop / existing-files sweep / gap check), and rows flip to their applied state after approval. Machinery: ChangeTree/FolderReviewWorkspace/compositeTree.
3. **State of the room** (Analyst seat featured; de-featured for Tom per session verdict): editable 6-phase brief plan → run steps → structured `BriefReadoutCard` with citation chips that open sources full-screen in one click (`BRIEF_SOURCE_FILES`), plus Copy-brief.
4. **Gap-finder** (scripted reply, Tom's seat): "Find the gaps" (featured card + index affordance) → predicted request-list gaps + a red-flag inconsistency, framed defensively ("your gap list, not theirs"). Reducer `getScriptedReply`, prompt in `state/copy.ts` (`GAP_FINDER_PROMPT`). Full index-annotated gap review is L2 in the paradigm plan — build only if the concept mock lands.

The `flow: 'qa' | 'filing' | 'brief'` field on `WorkspaceState` disambiguates the shared stage machine per chat session. "Stage the client drop" also returns a scripted text reply.

## Lineage

Forked from `azap121/halo-william-blair-robbin-demo`, `src/projects/Paza/WilliamBlairQaSearch` (kept in-repo, unregistered, as reference). Session prep: Notion "Stifel Discovery — Tom Koula & Jaime Bergaz"; prompt pack and static exhibits in `manda-aOS/discovery/stifel-tom-koula-jaime-bergaz/`.
