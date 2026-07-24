// Phase 3 — "CIM Screen — buy-side" run scenario (chat → glass-box → gate → cited canvas).
// The run frame follows the manda-aOS AX vocabulary: methodology-revealing step labels,
// 800–1100ms cadence, elapsed badges, sub-process lines, approval gate that morphs
// Approve plan → Executing with no layout shift. One execution step is a visible
// @Grata tool call — sourcing muscle invoked inside diligence (the federation story).
// Citation shape follows CitedValue from the agents framework plan: doc + page + verbatim
// quote + confidence + basis. Per-cell citations are deliberately BEYOND real Blueflame
// (whose Nexus grid offers doc-open-in-split-pane provenance only).

export type CimRunPhase =
  | 'idle'
  | 'working' // analysis work log streaming, pre-plan
  | 'plan-ready' // plan card shown, waiting on the approval gate
  | 'executing' // approved — execution log streaming
  | 'output-ready' // cited review table open in the canvas, waiting on Accept
  | 'accepted'; // tracked into Deal › Review

export interface CimRunState {
  phase: CimRunPhase;
  workStepIndex: number;
  execStepIndex: number;
  // Set when an Agent card is clicked (prompt staged to the composer); consumed on
  // submit so the run engine keys off the playbook id, never composer-string parsing.
  queuedPlaybookId: string | null;
}

export const INITIAL_CIM_RUN: CimRunState = {
  phase: 'idle',
  workStepIndex: 0,
  execStepIndex: 0,
  queuedPlaybookId: null,
};

// Step cadence per the AX enrichment doc (§2): ~800–1100ms so it reads, not flickers.
export const CIM_WORK_STEP_MS = 950;
export const CIM_EXEC_STEP_MS = 1050;
export const CIM_FINAL_PAUSE_MS = 420;
// Reduced motion: reveal streamed content near-immediately.
export const CIM_STEP_REDUCED_MS = 80;
export const GRATA_SIMILAR_MS = 2200;

export interface CimRunStep {
  id: string;
  label: string;
  service: string;
  // Frozen elapsed badge shown once the step completes.
  elapsed: string;
  // Indented sub-process line (mono) shown while the step is active.
  sub?: string;
  // Render the service as a highlighted @Grata tool-call chip.
  grata?: boolean;
}

export const CIM_RUN_COPY = {
  cimFileName: 'Project Caldera — GulfAir Mechanical CIM (v2).pdf',
  workingIntro:
    'Running CIM Screen — buy-side on the latest CIM upload. Nothing executes until you approve the plan.',
  // Draft ahead / Run it / Sandbox: no plan gate — the run goes straight through and
  // gates at the commit instead.
  workingIntroAutonomous:
    'Running CIM Screen — buy-side on the latest CIM upload. No plan gate on this dial — I’ll hold before anything lands in the deal record.',
  planSummary:
    'Here is the screen plan for the GulfAir CIM. Review the phases — execution holds for your approval.',
  planEstimateLine: 'Est. 14 credits · hard stop at 50',
  executingIntro: 'Executing the approved plan against the CIM and the Caldera thesis.',
  executingIntroAutonomous: 'Running against the CIM and the Caldera thesis.',
  outputSummary:
    'The CIM screen is ready — 8 thesis-fit criteria extracted with page-level citations, 1 flag and 2 watch items. The cited review table is open in the canvas; accept it to track the screen on the deal.',
  outputSummaryAutonomous:
    'The CIM screen is ready — 8 thesis-fit criteria extracted with page-level citations, 1 flag and 2 watch items. Ready to file into Deal › Review — approve in the canvas.',
  outputSummarySandbox:
    'The CIM screen is ready in your Sandbox — 8 thesis-fit criteria with page-level citations. It stays in your personal space; nothing can file into the deal record from here.',
  acceptedReply:
    'Tracked. The CIM screen is saved to Project Caldera › Review — the deal team sees the same cited table, and the Deal Research Agent will flag any CIM revision against it.',
  acceptedReplyAutonomous:
    'Filed. The CIM screen is saved to Project Caldera › Review — the plan gate was skipped on this dial, but the commit gate was yours.',
  outputDeliverable: 'Screen memo — GulfAir Mechanical',
  outputMetaLine: '8 criteria · 1 flag · 2 watch · page-cited from the CIM',
  // Audit-trail stamp (the compliance artifact): mode + who approved what.
  auditPlanFirst: 'Ran in Plan first · plan approved by you',
  auditDraftAhead: 'Ran in Draft ahead · commit gate approved by you',
  auditGuideMe: 'Ran in Guide me · each step approved by you',
  auditRunIt: 'Ran in Run it · commit gate approved by you',
  auditSandbox: 'Ran in Sandbox · personal space, no deal-record access',
} as const;

// Analysis work log (pre-plan): read guidance → read source → apply standards → draft plan.
export const CIM_WORK_STEPS: readonly CimRunStep[] = [
  {
    id: 'read-cim',
    label: 'Reading the CIM upload (84 pages)',
    service: 'Documents',
    elapsed: '6s',
    sub: '› reading Project Caldera — GulfAir Mechanical CIM (v2).pdf',
  },
  {
    id: 'thesis',
    label: 'Loading the Caldera thesis and screening criteria',
    service: 'Deal context',
    elapsed: '2s',
  },
  {
    id: 'standards',
    label: 'Applying the firm’s 10 standard CIM screen questions',
    service: 'CIM Screen — buy-side',
    elapsed: '3s',
  },
  {
    id: 'draft-plan',
    label: 'Drafting the screen plan for approval',
    service: 'Blueflame AI',
    elapsed: '2s',
  },
];

export interface CimPlanPhase {
  id: string;
  title: string;
  body: string;
}

export const CIM_PLAN_PHASES: readonly CimPlanPhase[] = [
  {
    id: 'extract',
    title: 'Extract thesis-fit criteria',
    body: 'Revenue mix, recurring maintenance share, geography, customer concentration — page-cited from the CIM.',
  },
  {
    id: 'grata',
    title: 'Cross-check market position via @Grata',
    body: 'Pull GulfAir’s Grata profile and TX HVAC comps to test the CIM’s market claims against sourcing data.',
  },
  {
    id: 'concerns',
    title: 'Flag concerns against the thesis',
    body: 'Anything contradicting the Caldera thesis or unsupported in the CIM gets a flag, not a silent pass.',
  },
  {
    id: 'memo',
    title: 'Assemble the cited review table',
    body: 'The table lands in the canvas for your review; nothing tracks to the deal until you accept it.',
  },
];

// Execution log (post-approval). The @Grata step is the federation beat.
export const CIM_EXEC_STEPS: readonly CimRunStep[] = [
  {
    id: 'extract-financials',
    label: 'Extracting: revenue mix, recurring share, EBITDA bridge',
    service: 'CIM Screen — buy-side',
    elapsed: '5s',
    sub: '› CIM §4 — Financial overview, pp. 31–42',
  },
  {
    id: 'extract-ops',
    label: 'Extracting: geography, customers, technician fleet',
    service: 'CIM Screen — buy-side',
    elapsed: '4s',
    sub: '› CIM §2 — Business overview, pp. 9–18',
  },
  {
    id: 'grata-call',
    label: 'Pulling GulfAir profile + TX HVAC comps',
    service: '@Grata tool call',
    elapsed: '3s',
    grata: true,
  },
  {
    id: 'crossref',
    label: 'Cross-referencing CIM claims against Grata market data',
    service: 'Deal Research Agent',
    elapsed: '4s',
  },
  {
    id: 'flags',
    label: 'Flagging: top-2 customer concentration 38% vs thesis cap 30%',
    service: 'CIM Screen — buy-side',
    elapsed: '2s',
  },
  {
    id: 'table',
    label: 'Building the cited review table',
    service: 'Review',
    elapsed: '2s',
  },
];

// ── Cited review table (the run output) ──

export type CimFit = 'fit' | 'watch' | 'flag';

export interface CimReviewRow {
  id: string;
  criterion: string;
  value: string;
  fit: CimFit;
  fitLabel: string;
  confidence: 'high' | 'medium' | 'low';
  basis: 'source' | 'inference';
  citation: { doc: string; page: number; quote: string };
}

export const CIM_REVIEW_TITLE = 'CIM Screen — GulfAir Mechanical';

export const CIM_REVIEW_ROWS: readonly CimReviewRow[] = [
  {
    id: 'revenue',
    criterion: 'Revenue',
    value: '$18.4M FY2025',
    fit: 'fit',
    fitLabel: 'Fit · $10M–$50M',
    confidence: 'high',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 32,
      quote: 'GulfAir generated $18.4 million of revenue in fiscal 2025, up 11% year over year.',
    },
  },
  {
    id: 'recurring',
    criterion: 'Recurring maintenance share',
    value: '62% of revenue',
    fit: 'fit',
    fitLabel: 'Fit · thesis ≥50%',
    confidence: 'high',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 35,
      quote: 'Planned-maintenance agreements contributed 62% of fiscal 2025 revenue across 480 contracted sites.',
    },
  },
  {
    id: 'geography',
    criterion: 'Geography',
    value: 'Gulf Coast TX · 3 branches',
    fit: 'fit',
    fitLabel: 'Fit · TX footprint',
    confidence: 'high',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 11,
      quote: 'Operations span Houston, Baytown, and Beaumont branches serving the Gulf Coast industrial corridor.',
    },
  },
  {
    id: 'concentration',
    criterion: 'Customer concentration',
    value: 'Top 2 = 38% of revenue',
    fit: 'flag',
    fitLabel: 'Flag · thesis cap 30%',
    confidence: 'high',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 17,
      quote: 'The two largest customers represented approximately 38% of fiscal 2025 revenue.',
    },
  },
  {
    id: 'ebitda',
    criterion: 'EBITDA margin',
    value: '14.8% (adj.)',
    fit: 'fit',
    fitLabel: 'Fit · thesis ≥12%',
    confidence: 'medium',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 38,
      quote: 'Adjusted EBITDA of $2.7 million reflects a 14.8% margin after owner-compensation normalization.',
    },
  },
  {
    id: 'transition',
    criterion: 'Owner transition',
    value: 'Founder retiring 2027',
    fit: 'fit',
    fitLabel: 'Fit · succession signal',
    confidence: 'high',
    basis: 'source',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 8,
      quote: 'The founder intends to transition day-to-day leadership by 2027 and is seeking a partner for the next phase.',
    },
  },
  {
    id: 'union',
    criterion: 'Union exposure',
    value: 'None disclosed',
    fit: 'watch',
    fitLabel: 'Watch · not addressed',
    confidence: 'low',
    basis: 'inference',
    citation: {
      doc: CIM_RUN_COPY.cimFileName,
      page: 21,
      quote: 'Workforce of 96 field technicians and 22 office staff. [No union status is stated in the CIM.]',
    },
  },
  {
    id: 'market-position',
    criterion: 'Market position',
    value: 'CIM: “#2 in Houston metro”',
    fit: 'watch',
    fitLabel: 'Watch · Grata est. #4',
    confidence: 'medium',
    basis: 'inference',
    citation: {
      doc: 'Grata — TX commercial HVAC comps (via @Grata)',
      page: 1,
      quote: 'Grata revenue estimates rank GulfAir fourth among Houston-metro commercial HVAC providers.',
    },
  },
];

// ── Second scenario: "@Grata find similar companies" mid-chat (sourcing inside diligence) ──

export const GRATA_SIMILAR = {
  prompt: '@Grata find companies similar to GulfAir Mechanical',
  thinkingLabel: 'Asking Grata for similar companies…',
  intro:
    'Grata returned 4 Texas commercial-HVAC companies similar to GulfAir Mechanical — sourcing pulled into diligence without leaving the deal:',
  footnote: 'Sourced via @Grata inside Project Caldera · add to targets from Sourcing',
  companies: [
    { id: 'sim-bayou', name: 'Bayou City Mechanical', location: 'Houston, TX', revenue: '$22M', intent: 'Has Intent · 64' },
    { id: 'sim-alamo', name: 'Alamo Comfort Systems', location: 'San Antonio, TX', revenue: '$15M', intent: 'Has Intent · 58' },
    { id: 'sim-brazos', name: 'Brazos Valley HVAC Services', location: 'Bryan, TX', revenue: '$11M', intent: 'No signal' },
    { id: 'sim-permian', name: 'Permian Climate Solutions', location: 'Midland, TX', revenue: '$27M', intent: 'Has Intent · 52' },
  ],
} as const;
