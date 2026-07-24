export const RECOMMENDATION_STEP_MS = 420;
export const SAVE_STEP_MS = 380;
export const FINAL_STEP_PAUSE_MS = 260;

export const recommendationSteps = [
  { id: 'structure', label: 'Reviewing current folder structure', service: 'Index service' },
  { id: 'metadata', label: 'Reading document names and types', service: 'Document metadata' },
  { id: 'sandbox', label: 'Checking sandbox workspace rules', service: 'Sandbox validator' },
  { id: 'generate', label: 'Generating recommended index', service: 'Recommendation model' },
  { id: 'validate', label: 'Validating proposed moves', service: 'Move validator' },
] as const;

export const saveSteps = [
  { id: 'apply', label: 'Applying folder recommendations', service: 'Folder index service' },
  { id: 'update', label: 'Updating sandbox folder structure', service: 'Sandbox workspace' },
  { id: 'paths', label: 'Refreshing document paths', service: 'Document path refresh' },
  { id: 'verify', label: 'Verifying saved index', service: 'Index verification' },
] as const;

