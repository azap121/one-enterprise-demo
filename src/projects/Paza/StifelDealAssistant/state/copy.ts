// Stifel discovery scaffold copy. Deal: Project Aldgate (synthetic sell-side software M&A,
// four parallel bidder groups). Personas: Tom (Associate) and a neutral Analyst seat — see state/persona.ts.
// All persona-facing copy is seat-neutral ("you", "the deal team") so both seats read correctly.
export const COPY = {
  greetingTitle: 'Welcome back',
  greetingSubtitle: 'What should we triage in Project Aldgate?',
  inputPlaceholder: 'Ask Datasite AI about Q&A, saved searches, citations, duplicates, or routing...',
  folderPromptTitle: 'Turn email Q&A into a cited batch',
  folderPromptBody: 'Forward the bidder Q&A email thread. The agent groups questions across buyer groups, finds duplicates, locates cited source material, and flags answers that need routing — nothing publishes until you approve.',
  userPrompt: 'I have forwarded the bidder Q&A email thread for Project Aldgate — turn it into a cited, governed batch and show what needs review before approval.',
  formingPlanMessage:
    'Parsing the forwarded email thread, then scanning the Project Aldgate data room, saved searches, and disclosure controls before forming the triage plan.',
  planProposalTitle: 'Q&A triage plan ready',
  planProposalSummary:
    'Before I run the Q&A pass, review the triage plan. You can reorder phases, add checks, and approve when the workflow looks right. Nothing runs until you approve.',
  viewPlanCta: 'View plan',
  approvePlanCta: 'Approve and triage',
  approvedPlanMessage: 'Approved Q&A triage plan',
  runningApprovedPlan:
    'Plan approved. I will now categorize the bidder questions, run saved diligence searches, and keep each completed step in this thread for auditability.',
  proposalTitle: 'Q&A triage batch ready',
  proposalSummary:
    'Datasite AI ingested the forwarded bidder Q&A thread, grouped four questions across buyer groups, found two duplicate signals, and located cited source material for review.',
  reviewCta: 'Open Q&A table',
  reviewInProgressCta: 'Q&A table open',
  reviewAppliedCta: 'Saved',
  updateCta: 'Save triage batch',
  confirmationTitle: 'Save Q&A triage batch?',
  confirmationBody:
    'This will save the reviewed Q&A categories, cited answer support, duplicate handling, SME routing, and approval status.',
  savedTitle: 'Q&A triage batch saved',
  savedBody:
    'The Q&A triage batch has been saved. Sensitive answers remain in review until you route or approve them.',
  pathLabel: 'Q&A / Project Aldgate / Bidder Q&A triage batch',
  openPathCta: 'Open Q&A batch',
} as const;

// Cards tuned to telemetry (2026-07-16): permissioning/restructuring/uploads are familiar work;
// Q&A, analytics, and outreach are the whitespace. One headline bet per seat.
export const PROMPT_SUGGESTIONS = [
  {
    id: 'email-qa-batch',
    title: COPY.folderPromptTitle, // The analyst seat's headline bet: the bridge into the room
    body: COPY.folderPromptBody,
    featured: true,
  },
  {
    id: 'state-of-the-room',
    title: 'State of the room', // Tom's headline bet: the supervision layer he skips today
    body: 'What moved overnight, what is stuck, and what would embarrass us — a brief you could forward to your MD unedited, generated off signals the room already produces.',
  },
  {
    id: 'stage-client-drop',
    title: 'Stage the client drop', // Outside-in secondary: the messy folder becomes a staging plan
    body: 'Turn the client’s messy folder into a proposed, index-conformant staging plan. Nothing goes live until you approve.',
  },
  {
    id: 'open-private-notes',
    title: 'Open private notes',
    body: 'Capture free-form discovery notes beside the source-backed Q&A batch. Concept only in this prototype.',
  },
] as const;

export const PROPOSAL_HIGHLIGHTS = [
  'Logo churn / NRR answer has cited support.',
  'Source-code access should stay restricted and route to legal.',
  'Open-source exposure question arrived twice, in two email threads.',
] as const;

export const UPDATE_BREAKDOWN = [
  '4 bidder questions triaged',
  '2 duplicate signals retained',
  '1 sensitive answer kept in review',
] as const;

// Gap-finder (session 2026-07-16): the MD-readout brief was refuted — seniors inspect the room
// and put juniors on the spot. The operator job is being airtight BEFORE the senior looks.
export const GAP_FINDER_PROMPT =
  'Before the senior pass: check the room against our DD request list and comparable rooms — where are the gaps, and what would embarrass us?';

export const RATIONALE_COPY =
  'Datasite AI prioritized the highest-friction Q&A work: categorization, duplicate detection, cited source retrieval, sensitivity checks, and routing. The deal team stays in control of every answer before anything is marked ready or published.';
