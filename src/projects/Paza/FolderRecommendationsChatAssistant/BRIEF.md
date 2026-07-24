# Folder Recommendations Chat Assistant

## Intent

Explore a Datasite AI chat-led workflow for generating, reviewing, editing, and updating Project Atlas sandbox folder recommendations.

## Audience

Primary audience: Daniel-style deal-room admins and project teams preparing a sandbox or draft folder index before publishing.

## Design Question

Can the assistant feel like the origin and guide of the folder recommendation workflow while keeping the user in control of review and commit?

## Scope

- Full Datasite AI chat empty state.
- Prompt suggestion for `Improve the folder structure`.
- Service-level progress in chat.
- Proposal card before detailed review.
- Split view with folder review left and chat right.
- Editable v2-style inline folder recommendation review.
- Required `Update folder index` confirmation.
- Saved path confirmation and sandbox folder structure destination.

## Non-Goals

- Real backend wiring.
- Real LLM calls.
- Real persistence.
- Permission-risk review for live workspaces.
- Replacing the v2 inline folder review model.

