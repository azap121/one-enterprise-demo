// Tom's "State of the room" flow — Project Aldgate.
// The agent reads the room's own signals (access logs, staging manifest, Q&A SLA clock,
// disclosure log), forms an editable plan, and — only after approval — drafts a structured,
// cited, MD-forwardable brief. Nothing is ever sent automatically.
import type { SellerIndexFile } from '../components/rightCanvasFileData';
import type { ValidationPlanPhase } from './types';

export const BRIEF_COPY = {
  userPrompt:
    'What moved overnight in Project Aldgate, what is stuck, and what would embarrass us in front of the MD? Make it a brief I could forward unedited.',
  formingMessage:
    'Reading the room’s overnight signals — access logs, staging, the Q&A clock, and the disclosure log — before forming the brief plan.',
  planProposalTitle: 'Brief plan ready',
  planProposalSummary:
    'Before I draft the brief, review how it gets assembled. You can reorder phases, add checks, and approve when it looks right. Nothing runs until you approve.',
  viewPlanCta: 'View plan',
  approvePlanCta: 'Approve and draft',
  approvedPlanMessage: 'Approved brief plan',
  runningApprovedPlan:
    'Plan approved. I will now collect the overnight signals, check the SLA clock and disclosure log, and draft the brief with a citation on every line.',
  readoutTitle: 'State of the room — 07:00',
  readoutSummary:
    'Drafted from the room’s own signals, with a citation on every line. Held for your review — nothing is sent automatically.',
  readoutFootnote: 'Nothing is sent automatically — edit anything, then forward.',
  copyCta: 'Copy brief',
  copiedCta: 'Copied',
} as const;

export const BRIEF_PLAN: ValidationPlanPhase[] = [
  {
    id: 'collect-overnight',
    title: 'Collect overnight room activity',
    description: 'Read document access, uploads, and staging events since close of business, per bidder group.',
    required: true,
  },
  {
    id: 'qa-ageing',
    title: 'Check Q&A ageing against SLA',
    description: 'Compare every open question and pending answer against its SLA clock and flag anything breaching soon.',
    required: true,
  },
  {
    id: 'bidder-engagement',
    title: 'Review bidder engagement and dormancy',
    description: 'Score each bidder group’s activity and flag dormancy, first-time-in-days visits, and outstanding onboarding items.',
    required: true,
  },
  {
    id: 'permission-check',
    title: 'Cross-check permission changes vs disclosure log',
    description: 'Compare every overnight permission change against the disclosure log and route mismatches for review.',
    required: true,
  },
  {
    id: 'flag-risks',
    title: 'Flag what would embarrass us',
    description: 'Surface anything the MD would not want to discover first — with the evidence attached.',
    required: true,
  },
  {
    id: 'draft-brief',
    title: 'Draft the forwardable brief',
    description: 'Assemble moved / stuck / risk sections with a citation on every line, held for your review.',
    required: true,
  },
];

export const briefPlanSteps = [
  { id: 'read-activity', label: 'Reading overnight activity and access logs', service: 'Activity log' },
  { id: 'qa-clock', label: 'Checking Q&A ageing against SLAs', service: 'Q&A' },
  { id: 'engagement', label: 'Checking bidder engagement and dormancy', service: 'Analytics' },
  { id: 'disclosure', label: 'Comparing permission changes to the disclosure log', service: 'Permissions' },
  { id: 'draft-plan', label: 'Forming the editable six-phase brief plan', service: 'Datasite AI' },
] as const;

export const briefRunSteps = [
  { id: 'collect', label: 'Collecting overnight events per bidder group', service: 'Activity log' },
  { id: 'engagement', label: 'Scoring bidder engagement and dormancy', service: 'Analytics' },
  { id: 'sla', label: 'Checking the Q&A SLA clock', service: 'Q&A' },
  { id: 'disclosure', label: 'Cross-checking the disclosure log', service: 'Permissions' },
  { id: 'draft', label: 'Drafting the MD brief with citations', service: 'Datasite AI' },
] as const;

export interface BriefRow {
  id: string;
  text: string;
  citationFileIds: string[];
}

export interface BriefSection {
  id: string;
  label: string;
  tone: 'moved' | 'stuck' | 'risk';
  rows: BriefRow[];
}

export const BRIEF_SECTIONS: BriefSection[] = [
  {
    id: 'moved',
    label: 'What moved overnight',
    tone: 'moved',
    rows: [
      {
        id: 'kestrel-download',
        text: 'Kestrel downloaded the full financial pack (34 documents) between 22:10 and 23:40 — their first activity in six days.',
        citationFileIds: ['ald-access-log'],
      },
      {
        id: 'client-drop',
        text: 'The client dropped 18 new files into staging at 19:42. Three are flagged sensitive; none are visible to bidders.',
        citationFileIds: ['ald-staging-manifest'],
      },
      {
        id: 'falcon-questions',
        text: 'Falcon sent two new questions by email. Both are drafted in the triage batch, awaiting your approval.',
        citationFileIds: ['ald-qa-sla-tracker'],
      },
    ],
  },
  {
    id: 'stuck',
    label: 'What’s stuck',
    tone: 'stuck',
    rows: [
      {
        id: 'harrier-sla',
        text: 'The open-source exposure answer (Harrier) has sat in legal review for three days — its SLA breaches tomorrow at 12:00.',
        citationFileIds: ['ald-qa-sla-tracker'],
      },
      {
        id: 'osprey-dormant',
        text: 'Osprey has not entered the room in nine days, and their NDA re-execution is still outstanding.',
        citationFileIds: ['ald-access-log', 'ald-disclosure-log'],
      },
    ],
  },
  {
    id: 'risk',
    label: 'What would embarrass us',
    tone: 'risk',
    rows: [
      {
        id: 'permission-mismatch',
        text: 'A permission change last night gave Harrier access to a folder that is not yet in the disclosure log. Routed for review — nothing was released.',
        citationFileIds: ['ald-disclosure-log'],
      },
    ],
  },
];

export const BRIEF_SOURCE_FILES: SellerIndexFile[] = [
  {
    id: 'ald-access-log',
    index: '00.1',
    name: 'Access Log Extract (overnight).xlsx',
    kind: 'file',
    fileType: 'xlsx',
    meta: 'Room signal · view only',
    categoryId: 'admin',
    pages: 4,
    size: '312 KB',
    uploadedBy: 'Datasite (system)',
    updatedAt: 'Jul 16, 2026 · 07:00',
    status: 'Cited room signal',
    previewTitle: 'Access Log Extract — overnight',
    previewLines: [
      '22:10–23:40 · Kestrel · 34 downloads · 03 Financials (full pack)',
      '09 days since last Osprey session · NDA re-execution pending',
      'No weekend activity recorded · all sessions SSO-verified',
    ],
    folderPath: ['Project Aldgate', 'Room administration'],
    categoryPath: 'Administration / Activity',
  },
  {
    id: 'ald-staging-manifest',
    index: '00.2',
    name: 'Staging Manifest — client drop 19:42.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Sandbox · unpublished',
    categoryId: 'admin',
    pages: 2,
    size: '148 KB',
    uploadedBy: 'Datasite (system)',
    updatedAt: 'Jul 15, 2026 · 19:42',
    status: 'Cited room signal',
    previewTitle: 'Staging Manifest — 19:42 client drop',
    previewLines: [
      '18 files received via secure link from Aldgate Holdings',
      '3 flagged sensitive (cap table, customer contracts) — held from bidders',
      '2 unreadable (password-protected, low-quality scan) — chase note attached',
    ],
    folderPath: ['Project Aldgate', 'Room administration'],
    categoryPath: 'Administration / Staging',
  },
  {
    id: 'ald-qa-sla-tracker',
    index: '00.3',
    name: 'Q&A SLA Tracker.xlsx',
    kind: 'file',
    fileType: 'xlsx',
    meta: 'Room signal · view only',
    categoryId: 'admin',
    pages: 3,
    size: '96 KB',
    uploadedBy: 'Datasite (system)',
    updatedAt: 'Jul 16, 2026 · 07:00',
    status: 'Cited room signal',
    previewTitle: 'Q&A SLA Tracker',
    previewLines: [
      'Harrier · open-source exposure · legal review day 3 of 3 · breaches 12:00 tomorrow',
      'Falcon · 2 new questions (email) · drafted in triage batch · awaiting approval',
      'Median time-to-answer this week: within SLA across all bidder groups',
    ],
    folderPath: ['Project Aldgate', 'Room administration'],
    categoryPath: 'Administration / Q&A',
  },
  {
    id: 'ald-disclosure-log',
    index: '00.4',
    name: 'Disclosure Log.xlsx',
    kind: 'file',
    fileType: 'xlsx',
    meta: 'Room signal · view only',
    categoryId: 'admin',
    pages: 6,
    size: '204 KB',
    uploadedBy: 'Deal team',
    updatedAt: 'Jul 16, 2026 · 01:44',
    status: 'Cited room signal',
    previewTitle: 'Disclosure Log',
    previewLines: [
      '01:40 · permission change: Harrier ↔ folder 04.1 — NOT in disclosure log · routed for review',
      'Osprey NDA re-execution outstanding since Jul 07',
      'Re-disclosure wave 2: pending — 3 sensitive staging files queued',
    ],
    folderPath: ['Project Aldgate', 'Room administration'],
    categoryPath: 'Administration / Disclosure',
  },
];

export function briefPlainText(): string {
  const lines: string[] = [`${BRIEF_COPY.readoutTitle}`, ''];
  for (const section of BRIEF_SECTIONS) {
    lines.push(section.label.toUpperCase());
    for (const row of section.rows) lines.push(`• ${row.text}`);
    lines.push('');
  }
  lines.push('Every line cites its source. Edit anything, then forward — nothing is sent automatically.');
  return lines.join('\n');
}
