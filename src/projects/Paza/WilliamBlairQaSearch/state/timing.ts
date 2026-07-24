export const PLAN_STEP_MS = 360;
export const RECOMMENDATION_STEP_MS = 420;
export const SAVE_STEP_MS = 380;
export const FINAL_STEP_PAUSE_MS = 260;

export const planFormationSteps = [
  { id: 'scan-qa', label: 'Scanning unanswered buyer Q&A threads', service: 'Q&A triage agent' },
  { id: 'scan-room', label: 'Reading Project Silverstar data room signals', service: 'Documents' },
  { id: 'saved-searches', label: 'Checking saved search coverage', service: 'Saved search agent' },
  { id: 'permissions', label: 'Checking restricted source-code and disclosure paths', service: 'Disclosure routing monitor' },
  { id: 'draft-plan', label: 'Forming the editable seven-phase triage plan', service: 'Datasite AI' },
] as const;

export const recommendationSteps = [
  { id: 'collect', label: 'Reading new buyer questions', service: 'Q&A' },
  { id: 'classify', label: 'Categorizing workstreams and owners', service: 'Datasite AI' },
  { id: 'duplicates', label: 'Checking duplicates and near matches', service: 'Q&A' },
  { id: 'searches', label: 'Running saved diligence searches with citations', service: 'Documents' },
  { id: 'permissions', label: 'Checking source-code, IP, cyber, and GDPR sensitivity', service: 'Permissions' },
  { id: 'table', label: 'Building Q&A mini table and context detail', service: 'Review' },
] as const;

export const saveSteps = [
  { id: 'save', label: 'Saving Q&A triage decisions', service: 'Q&A' },
  { id: 'permissions', label: 'Keeping sensitive answers in review', service: 'Permissions' },
  { id: 'links', label: 'Attaching citations and saved-search evidence', service: 'Documents' },
  { id: 'verify', label: 'Verifying audit trail', service: 'Activity log' },
] as const;
