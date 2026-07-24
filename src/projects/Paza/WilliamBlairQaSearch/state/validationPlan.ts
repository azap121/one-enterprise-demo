import type { ValidationPlanPhase } from './types';

export const DEFAULT_VALIDATION_PLAN: ValidationPlanPhase[] = [
  {
    id: 'collect-new-questions',
    title: 'Collect new buyer questions',
    description: 'Read the latest unanswered buyer questions and preserve bidder, category, timestamp, and thread context.',
    required: true,
  },
  {
    id: 'categorize-questions',
    title: 'Categorize questions',
    description: 'Map each question to commercial, legal, cybersecurity, data privacy, IP, source code, or customer contract workstreams.',
    required: true,
  },
  {
    id: 'detect-duplicates',
    title: 'Detect duplicates and near-duplicates',
    description: 'Compare new questions against active and answered Q&A threads so Robbin can merge repeated buyer requests.',
    required: true,
  },
  {
    id: 'run-saved-searches',
    title: 'Run saved diligence searches',
    description: 'Use saved searches for churn, roadmap, source code, open source, cybersecurity, GDPR / DPA, and customer contracts.',
    required: true,
  },
  {
    id: 'draft-cited-answers',
    title: 'Draft cited answer support',
    description: 'Prepare suggested answers only where room sources provide enough cited evidence for review.',
    required: true,
  },
  {
    id: 'check-permissions',
    title: 'Check permission and sensitivity',
    description: 'Flag source-code, IP, security, GDPR, and customer-contract answers that need restricted handling or legal review.',
    required: true,
  },
  {
    id: 'build-triage-batch',
    title: 'Build Q&A triage batch',
    description: 'Create the four-item mini table with AI read, evidence, recommended owner, next step, and right-panel detail.',
    required: true,
  },
];

export function createDefaultValidationPlan() {
  return DEFAULT_VALIDATION_PLAN.map((phase) => ({ ...phase }));
}
