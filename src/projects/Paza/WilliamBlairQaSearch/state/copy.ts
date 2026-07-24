export const COPY = {
  greetingTitle: 'Welcome back, Robbin',
  greetingSubtitle: 'What should we triage in Project Silverstar?',
  inputPlaceholder: 'Ask Datasite AI about Q&A, saved searches, citations, duplicates, or routing...',
  folderPromptTitle: 'Triage buyer Q&A',
  folderPromptBody: 'Group new buyer questions, find duplicates, locate cited source material, and flag answers that need routing.',
  userPrompt: 'Triage the new buyer Q&A for the software sell-side room and show what needs review before approval.',
  formingPlanMessage:
    'Scanning the Project Silverstar data room, Q&A threads, saved searches, and disclosure controls before forming the triage plan.',
  planProposalTitle: 'Q&A triage plan ready',
  planProposalSummary:
    'Before I run the Q&A pass, review the triage plan. Robbin can reorder phases, add checks, and approve when the workflow looks right.',
  viewPlanCta: 'View plan',
  approvePlanCta: 'Approve and triage',
  approvedPlanMessage: 'Approved Q&A triage plan',
  runningApprovedPlan:
    'Plan approved. I will now categorize the buyer questions, run saved diligence searches, and keep each completed step in this thread for auditability.',
  proposalTitle: 'Q&A triage batch ready',
  proposalSummary:
    'Datasite AI grouped four buyer questions, found two duplicate signals, and located cited source material for review.',
  reviewCta: 'Open Q&A table',
  reviewInProgressCta: 'Q&A table open',
  reviewAppliedCta: 'Saved',
  updateCta: 'Save triage batch',
  confirmationTitle: 'Save Q&A triage batch?',
  confirmationBody:
    'This will save Robbin’s reviewed Q&A categories, cited answer support, duplicate handling, SME routing, and approval status.',
  savedTitle: 'Q&A triage batch saved',
  savedBody:
    'The Q&A triage batch has been saved. Sensitive answers remain in review until Robbin routes or approves them.',
  pathLabel: 'Q&A / Project Silverstar / Buyer Q&A triage batch',
  openPathCta: 'Open Q&A batch',
} as const;

export const PROMPT_SUGGESTIONS = [
  {
    id: 'triage-buyer-qa',
    title: COPY.folderPromptTitle,
    body: COPY.folderPromptBody,
    featured: true,
  },
  {
    id: 'run-saved-searches',
    title: 'Run saved searches',
    body: 'Search churn, source code, open source, cybersecurity, and GDPR sources for answer support.',
  },
  {
    id: 'route-sensitive-answers',
    title: 'Route sensitive answers',
    body: 'Send source-code, IP, and security answers to the right SME or legal reviewer.',
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
  'Open-source exposure question is likely a duplicate.',
] as const;

export const UPDATE_BREAKDOWN = [
  '4 buyer questions triaged',
  '2 duplicate signals retained',
  '1 sensitive answer kept in review',
] as const;

export const RATIONALE_COPY =
  'Datasite AI prioritized the highest-friction Q&A work: categorization, duplicate detection, cited source retrieval, sensitivity checks, and routing. Robbin stays in control of every answer before anything is marked ready or published.';
