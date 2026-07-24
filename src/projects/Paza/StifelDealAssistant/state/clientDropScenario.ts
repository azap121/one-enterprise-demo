// P0.1 client-in-sandbox loop — the "winner" shape verbatim from the 2026-07-16 session:
// the client acts in the sandbox, the agent proposes filing/renaming, the banker approves
// ("Yeah sure, if they want to play around and I can go back and review it and approve it").
// Narrative continuity: one of the client's files closes the FY2023 statutory-accounts gap
// the gap-finder flagged.
import type { ChangeProposal, TreeNode } from './types';

export const CLIENT_DROP_COPY = {
  userPrompt:
    'The client dropped files into the sandbox overnight — show me what they added and propose where it all goes. Nothing moves until I approve.',
  formingMessage:
    'Reading the client’s overnight drop, attributing each file to the client workspace, and matching them against the Project Aldgate sandbox before proposing anything.',
  proposalTitle: 'Client drop — approval queue ready',
  proposalSummary:
    'The client added 6 files to the sandbox overnight. 4 file cleanly — one closes the FY2023 statutory-accounts gap from your last sweep — 1 needs a new Insurance folder, and 2 are held for your call. Nothing the client does is visible to bidders until you approve.',
  reviewCta: 'Review client drop',
  reviewInProgressCta: 'Client drop open',
  reviewAppliedCta: 'Approved',
  updateCta: 'Approve client drop',
  confirmationTitle: 'Approve client drop?',
  confirmationBody:
    'This will file the approved client uploads into the sandbox and create the Insurance folder. Held files stay in the client drop folder with notes. Everything stays unpublished — nothing becomes visible to bidders until you publish.',
  savedTitle: 'Client drop approved',
  savedBody:
    'Approved and filed. The client sees their uploads landed; bidders see nothing. The two held files stay in the drop folder with chase notes, and the audit trail records the client upload and your approval separately.',
  savingMessage: 'Filing the approved client uploads and keeping the held files in the drop folder with notes.',
  planHeading: 'Client drop review',
  planHeadingApplied: 'Client drop approved',
} as const;

export const CLIENT_DROP_HIGHLIGHTS = [
  'FY2023 statutory accounts close the gap flagged in your last gap check — filed to 03 Financials.',
  'ESOP grants flagged sensitive — proposed Restricted and held; no bidder visibility without your say-so.',
  'One unreadable scan held back with a chase note to the client.',
] as const;

export const CLIENT_DROP_RATIONALE =
  'Client uploads land in a drop folder inside the sandbox — the client can act, but nothing they do is bidder-visible. Each file was matched against the sandbox structure by content and cross-checked against your open gap list. Sensitive or unreadable files are held rather than guessed. You approve or hold every action; publishing stays a separate step.';

export const clientDropSteps = [
  { id: 'read-drop', label: 'Reading the client’s overnight drop (6 files)', service: 'Documents' },
  { id: 'attribute', label: 'Attributing uploads to the client workspace', service: 'Filing agent' },
  { id: 'match', label: 'Matching each file against the sandbox structure', service: 'Filing agent' },
  { id: 'gap-check', label: 'Cross-checking your open gap list', service: 'Filing agent' },
  { id: 'assemble', label: 'Assembling your approval queue', service: 'Datasite AI' },
] as const;

export const clientDropSaveSteps = [
  { id: 'file-approved', label: 'Filing the approved client uploads', service: 'Documents' },
  { id: 'create-folder', label: 'Creating the Insurance folder', service: 'Documents' },
  { id: 'hold', label: 'Holding flagged files with chase notes', service: 'Filing agent' },
  { id: 'verify', label: 'Verifying audit trail', service: 'Activity log' },
] as const;

const clientDropNodes: TreeNode[] = [
  {
    id: 'c-finance',
    name: '03 Financials',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'c-fin-audited', name: '03.01.01 Audited Accounts FY2025.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'c-fin-model', name: '03.02.05 Financial Model v8 (Jul-2026).xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
    ],
  },
  {
    id: 'c-commercial',
    name: '04 Commercial',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'c-comm-top50', name: '04.01.01 Top 50 Customers.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'c-comm-pipeline', name: '04.02.01 Pipeline Summary.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
    ],
  },
  {
    id: 'c-legal',
    name: '05 Legal',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'c-legal-articles', name: '05.01.01 Articles of Association.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'c-legal-shareholders', name: '05.02.01 Shareholders Agreement (executed).pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
    ],
  },
  {
    id: 'c-tech',
    name: '06 Technology',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'c-tech-arch', name: '06.01.01 Platform Architecture Overview.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'c-tech-soc2', name: '06.03.01 SOC 2 Type II Report.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
    ],
  },
  {
    id: 'c-drop',
    name: '08 Client drop — overnight (client workspace)',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'cd-fy23', name: 'FY2023 statutory accounts (signed).pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'cd-q2-mgmt', name: 'Q2 management accounts v3 FINAL.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'cd-insurance', name: 'insurance policies bundle 2024-26.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'cd-logos', name: 'customer logo permission list.docx', kind: 'file', publishState: 'not-published', fileExt: 'docx' },
      { id: 'cd-esop', name: 'ESOP grants 2024-2026 (do not circulate).xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'cd-scan', name: 'scan_20260716.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
    ],
  },
];

const clientDropProposals: ChangeProposal[] = [
  {
    id: 'cd-move-fy23',
    type: 'move',
    nodeId: 'cd-fy23',
    nodeName: 'FY2023 statutory accounts (signed).pdf',
    nodeKind: 'file',
    fromParentId: 'c-drop',
    fromPath: ['08 Client drop — overnight (client workspace)'],
    toParentId: 'c-finance',
    toPath: ['03 Financials'],
    reason: 'Closes the FY2023 statutory-accounts gap from your last gap check',
  },
  {
    id: 'cd-move-q2',
    type: 'move',
    nodeId: 'cd-q2-mgmt',
    nodeName: 'Q2 management accounts v3 FINAL.xlsx',
    nodeKind: 'file',
    fromParentId: 'c-drop',
    fromPath: ['08 Client drop — overnight (client workspace)'],
    toParentId: 'c-finance',
    toPath: ['03 Financials'],
    reason: 'Management accounts — Financials',
  },
  {
    id: 'cd-add-insurance',
    type: 'add-folder',
    name: '05.03 Insurance',
    parentId: 'c-legal',
    parentPath: ['05 Legal'],
    description: 'Insurance policies have no home in the sandbox',
  },
  {
    id: 'cd-move-insurance',
    type: 'move',
    nodeId: 'cd-insurance',
    nodeName: 'insurance policies bundle 2024-26.pdf',
    nodeKind: 'file',
    fromParentId: 'c-drop',
    fromPath: ['08 Client drop — overnight (client workspace)'],
    toParentId: 'sug-cd-add-insurance',
    toPath: ['05 Legal', '05.03 Insurance'],
    reason: 'Moves into the proposed Insurance folder',
    dependsOn: ['cd-add-insurance'],
  },
  {
    id: 'cd-move-logos',
    type: 'move',
    nodeId: 'cd-logos',
    nodeName: 'customer logo permission list.docx',
    nodeKind: 'file',
    fromParentId: 'c-drop',
    fromPath: ['08 Client drop — overnight (client workspace)'],
    toParentId: 'c-commercial',
    toPath: ['04 Commercial'],
    reason: 'Customer-facing permission material — Commercial',
  },
];

// Held for the banker's call (no proposal generated — deliberately):
// cd-esop (sensitive — proposed Restricted), cd-scan (unreadable — chase note).
export const clientDropScenario = {
  rootName: 'Project Aldgate',
  nodes: clientDropNodes,
  proposals: clientDropProposals,
} as const;
