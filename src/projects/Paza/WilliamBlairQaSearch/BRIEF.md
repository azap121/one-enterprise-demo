# William Blair Q&A / Search Discovery

## Intent

Adapt the Datasite AI full-expand assistant into a sell-side technology M&A Q&A triage and saved-search workflow for Robbin Momoh and William Blair.

## Audience

Primary audience: technology investment banking analysts / project admins operating live sell-side rooms.

Secondary audience: associates and VPs who need confidence that Q&A answers are sourced, permission-aware, and ready for approval.

## Design Question

Can Datasite AI turn a live stream of buyer questions into a governed Q&A workbench with categories, duplicate detection, cited suggested answers, saved diligence searches, SME routing, and review-before-publish controls?

## Scope

- Restrict the product shell to Datasite AI, Documents, Q&A, Review, and a future Notes entry point.
- Reuse the current Datasite AI chat shell and right-panel full-expand behavior.
- Reframe the primary artifact as a four-item Q&A triage batch after plan approval.
- Preserve human control before any answer is routed, marked ready, or published.
- Show source citations, saved search terms, duplicate matches, sensitivity warnings, and recommended owners.
- Make row selection in the chat mini table open the right-hand Q&A context window.

## Non-Goals

- Real backend wiring.
- Real LLM calls.
- Real persistence.
- Real collaboration or stakeholder notification delivery.
- Real Q&A submission, document indexing, permission engine, or publish workflow.
- Buyer-side diligence as the primary path.
