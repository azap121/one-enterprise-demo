export const COPY = {
  greetingTitle: 'Welcome back, Daniel',
  greetingSubtitle: 'What would you like to work on in Project Atlas?',
  inputPlaceholder: 'Ask Datasite AI anything...',
  folderPromptTitle: 'Enhanced Index',
  folderPromptBody: 'Review Project Atlas and suggest a cleaner sandbox index.',
  userPrompt: 'Improve the folder structure for Project Atlas.',
  proposalTitle: 'Enhanced Index ready',
  proposalSummary: 'I found 8 proposed changes across 6 folders for this sandbox.',
  reviewCta: 'Review',
  reviewInProgressCta: 'In review',
  reviewAppliedCta: 'Applied',
  updateCta: 'Update structure',
  confirmationTitle: 'Update structure?',
  confirmationBody: 'This will apply 8 changes to Project Atlas / Sandbox workspace.',
  savedTitle: 'Folder index updated',
  savedBody: 'The recommended structure has been saved to Project Atlas / Sandbox workspace.',
  pathLabel: 'Documents / Project Atlas / Sandbox workspace',
  openPathCta: 'View updated files',
} as const;

export const PROMPT_SUGGESTIONS = [
  {
    id: 'improve-folder-structure',
    title: COPY.folderPromptTitle,
    body: COPY.folderPromptBody,
    featured: true,
  },
  {
    id: 'sensitive-data',
    title: 'Find sensitive data and disclosures',
    body: 'Locate documents that may need review before publishing.',
  },
  {
    id: 'summarize-documents',
    title: 'Summarize selected documents',
    body: 'Create a concise summary of the selected files.',
  },
  {
    id: 'missing-diligence',
    title: 'Identify missing diligence materials',
    body: 'Compare the workspace against common diligence checklists.',
  },
] as const;

export const PROPOSAL_HIGHLIGHTS = [
  'Adds Contracts under Legal.',
  'Creates Audited Financials under Financials.',
  'Moves HR files into a new Human Resources section.',
] as const;

export const UPDATE_BREAKDOWN = [
  '3 new folders',
  '2 renamed items',
  '3 moved items',
] as const;

export const RATIONALE_COPY =
  'The recommendation groups contract, finance, and HR material where reviewers expect to find it, while preserving the sandbox review step before any update is applied.';
