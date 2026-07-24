// P0.1 retro-filing — the "must cover existing files" ask, verbatim from the 2026-07-16
// session: filing can't stop at new uploads; the agent sweeps what is ALREADY in the
// sandbox for misfiles, naming-convention breaks, and version pairs, and proposes a
// tidy-up plan. Same propose → gatekeeper-approves shape as the uploads flow.
// Continuity: the v8 model held for Tom's call in the uploads scenario is now filed and
// gets its convention rename here.
import type { ChangeProposal, TreeNode } from './types';

export const RETRO_FILING_COPY = {
  userPrompt:
    'Sweep the files already in the sandbox — not just new uploads. Find anything misfiled, badly named, or duplicated, and propose the tidy-up. Nothing moves until I approve.',
  formingMessage:
    'Sweeping the 47 files already in the Project Aldgate sandbox against the naming convention and folder content before proposing anything.',
  proposalTitle: 'Tidy-up plan ready',
  proposalSummary:
    'I swept the 47 files already in the sandbox: 2 documents are misfiled, 5 filenames break the index convention, and the v7/v8 model pair needed marking. 8 proposals — all on existing files, nothing moves until you approve.',
  reviewCta: 'Open tidy-up plan',
  reviewInProgressCta: 'Tidy-up plan open',
  reviewAppliedCta: 'Applied',
  updateCta: 'Apply tidy-up plan',
  confirmationTitle: 'Apply tidy-up plan?',
  confirmationBody:
    'This will apply the renames, move the two misfiled documents, and create the Employment folder — all inside the sandbox. Nothing becomes visible to bidders until you publish.',
  savedTitle: 'Tidy-up plan applied',
  savedBody:
    'Tidied. The renames and moves are applied in the sandbox with the same audit trail manual filing leaves. Everything remains unpublished.',
  savingMessage: 'Applying the tidy-up plan — renames and moves inside the sandbox, nothing published.',
  planHeading: 'Tidy-up plan',
  planHeadingApplied: 'Tidy-up plan applied',
} as const;

export const RETRO_FILING_HIGHLIGHTS = [
  'Financial Model v8 (filed last night) renamed to convention and marked current beside the superseded v7.',
  'Pen Test Executive Summary was sitting in 04 Commercial — proposed move to 06 Technology, beside SOC 2.',
  'Every proposal touches an existing file; all reversible until you publish.',
] as const;

export const RETRO_FILING_RATIONALE =
  'The sweep compares every existing file against the index convention and its folder’s content, the same way the upload filing works — placement by content, not filename. Renames follow the numbering pattern already in the sandbox; anything ambiguous is left alone rather than guessed. The banker decides; the agent only proposes.';

export const retroFilingSteps = [
  { id: 'sweep-existing', label: 'Sweeping the 47 files already in the sandbox', service: 'Documents' },
  { id: 'convention', label: 'Checking names against the index convention', service: 'Filing agent' },
  { id: 'placement', label: 'Testing placement against folder content', service: 'Filing agent' },
  { id: 'duplicates', label: 'Flagging duplicates and version pairs', service: 'Filing agent' },
  { id: 'assemble', label: 'Assembling the tidy-up plan for your review', service: 'Datasite AI' },
] as const;

export const retroFilingSaveSteps = [
  { id: 'renames', label: 'Applying the convention renames', service: 'Documents' },
  { id: 'moves', label: 'Moving the misfiled documents', service: 'Documents' },
  { id: 'folder', label: 'Creating the Employment folder', service: 'Documents' },
  { id: 'verify', label: 'Verifying audit trail', service: 'Activity log' },
] as const;

const retroNodes: TreeNode[] = [
  {
    id: 'r-finance',
    name: '03 Financials',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'r-fin-audited', name: '03.01.01 Audited Accounts FY2025.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-fin-model-v7', name: '03.02.04 Financial Model v7 (Jun-2026) — superseded by v8.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'r-fin-model-v8', name: 'Aldgate_Fin_Model_v8_FINAL(2).xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'r-fin-mgmt', name: '03.03.01 Management Accounts Q2-2026 FINAL(2).xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'r-fin-tax', name: 'Corp tax computations FY25.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
    ],
  },
  {
    id: 'r-commercial',
    name: '04 Commercial',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'r-comm-top50', name: '04.01.01 Top 50 Customers.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'r-comm-pipeline', name: '04.02.01 Pipeline Summary.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
      { id: 'r-comm-pentest', name: 'Pen Test Executive Summary 2026.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-comm-contracts', name: 'Customer contracts - top 20 DRAFT.docx', kind: 'file', publishState: 'not-published', fileExt: 'docx' },
    ],
  },
  {
    id: 'r-legal',
    name: '05 Legal',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'r-legal-articles', name: '05.01.01 Articles of Association.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-legal-shareholders', name: '05.02.01 Shareholders Agreement (executed).pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-legal-dpa', name: 'DPA template + GDPR annex.docx', kind: 'file', publishState: 'not-published', fileExt: 'docx' },
      { id: 'r-legal-employment', name: 'Key employment contracts bundle.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
    ],
  },
  {
    id: 'r-tech',
    name: '06 Technology',
    kind: 'folder',
    publishState: 'not-published',
    children: [
      { id: 'r-tech-arch', name: '06.01.01 Platform Architecture Overview.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-tech-soc2', name: '06.03.01 SOC 2 Type II Report.pdf', kind: 'file', publishState: 'not-published', fileExt: 'pdf' },
      { id: 'r-tech-oss', name: 'open_source_register_export.xlsx', kind: 'file', publishState: 'not-published', fileExt: 'xlsx' },
    ],
  },
];

const retroProposals: ChangeProposal[] = [
  {
    id: 'rt-rename-v8',
    type: 'rename',
    nodeId: 'r-fin-model-v8',
    oldName: 'Aldgate_Fin_Model_v8_FINAL(2).xlsx',
    newName: '03.02.05 Financial Model v8 (Jul-2026).xlsx',
    nodeKind: 'file',
    parentPath: ['03 Financials'],
    reason: 'Convention rename — marks v8 as the current model beside the superseded v7',
  },
  {
    id: 'rt-rename-mgmt',
    type: 'rename',
    nodeId: 'r-fin-mgmt',
    oldName: '03.03.01 Management Accounts Q2-2026 FINAL(2).xlsx',
    newName: '03.03.01 Management Accounts Q2-2026 (final).xlsx',
    nodeKind: 'file',
    parentPath: ['03 Financials'],
    reason: 'FINAL(2) breaks the naming convention',
  },
  {
    id: 'rt-rename-tax',
    type: 'rename',
    nodeId: 'r-fin-tax',
    oldName: 'Corp tax computations FY25.pdf',
    newName: '03.04.01 Corporation Tax Computations FY2025.pdf',
    nodeKind: 'file',
    parentPath: ['03 Financials'],
    reason: 'Missing index number and full-year format',
  },
  {
    id: 'rt-rename-contracts',
    type: 'rename',
    nodeId: 'r-comm-contracts',
    oldName: 'Customer contracts - top 20 DRAFT.docx',
    newName: '04.03.01 Customer Contracts — Top 20 (draft).docx',
    nodeKind: 'file',
    parentPath: ['04 Commercial'],
    reason: 'Convention rename; draft status kept visible',
  },
  {
    id: 'rt-rename-dpa',
    type: 'rename',
    nodeId: 'r-legal-dpa',
    oldName: 'DPA template + GDPR annex.docx',
    newName: '05.03.01 DPA Template and GDPR Annex.docx',
    nodeKind: 'file',
    parentPath: ['05 Legal'],
    reason: 'Missing index number',
  },
  {
    id: 'rt-move-pentest',
    type: 'move',
    nodeId: 'r-comm-pentest',
    nodeName: 'Pen Test Executive Summary 2026.pdf',
    nodeKind: 'file',
    fromParentId: 'r-commercial',
    fromPath: ['04 Commercial'],
    toParentId: 'r-tech',
    toPath: ['06 Technology'],
    reason: 'Security document misfiled in Commercial — belongs beside SOC 2',
  },
  {
    id: 'rt-add-employment',
    type: 'add-folder',
    name: '05.04 Employment',
    parentId: 'r-legal',
    parentPath: ['05 Legal'],
    description: 'Employment material is loose in 05 Legal with no sub-folder',
  },
  {
    id: 'rt-move-employment',
    type: 'move',
    nodeId: 'r-legal-employment',
    nodeName: 'Key employment contracts bundle.pdf',
    nodeKind: 'file',
    fromParentId: 'r-legal',
    fromPath: ['05 Legal'],
    toParentId: 'sug-rt-add-employment',
    toPath: ['05 Legal', '05.04 Employment'],
    reason: 'Moves into the proposed Employment sub-folder',
    dependsOn: ['rt-add-employment'],
  },
];

export const retroFilingScenario = {
  rootName: 'Project Aldgate',
  nodes: retroNodes,
  proposals: retroProposals,
} as const;
