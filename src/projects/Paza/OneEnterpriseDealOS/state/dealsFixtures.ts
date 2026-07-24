// My Deals home fixtures — Surface 0 of the One Enterprise Deal OS concept.
// Persona: Alex Verma (Corporate Development, buy-side). Four seed deals across the
// merged Grata (sourcing) × Blueflame (agentic workspace) IA, plus the Caldera deal
// that the sourcing → promote flow creates at runtime.

export type DealDirection =
  | 'Buy-side · Acquisition'
  | 'Sell-side · Mandate'
  | 'Portfolio monitoring';

export interface DealCard {
  id: string;
  name: string;
  direction: DealDirection;
  // Optional context tag shown beside the direction (IB, Corp Dev, …).
  desk?: string;
  stage: string;
  status: string;
  updatedAgo: string;
  // 'aldgate' opens the existing chat machinery; 'caldera' opens the Phase-1 deal-opened
  // state; the rest are inert cards for the concept.
  opens: 'aldgate' | 'caldera' | 'none';
}

export const HOME_HEADLINE = 'Where are we working today, Alex?';

export const HOME_COMPOSER_PLACEHOLDER = 'Find companies, start a review, or ask about any deal…';

export const HOME_SUGGESTIONS = [
  {
    id: 'hvac',
    label: 'Find HVAC companies in Texas, $10M–$50M revenue',
    action: 'sourcing' as const,
  },
  {
    id: 'changed',
    label: 'What changed across my deals this week?',
    action: 'ask' as const,
  },
  {
    id: 'aldgate-q',
    label: 'Open the Aldgate buyer questions',
    action: 'ask' as const,
  },
];

export const SEED_DEALS: DealCard[] = [
  {
    id: 'deal-aldgate',
    name: 'Project Aldgate',
    direction: 'Sell-side · Mandate',
    desk: 'IB',
    stage: 'Live diligence',
    status: '18 uploads to file · 4 buyer questions waiting',
    updatedAgo: '2h ago',
    opens: 'aldgate',
  },
  {
    id: 'deal-halley',
    name: 'Project Halley',
    direction: 'Buy-side · Acquisition',
    desk: 'Corp Dev',
    stage: 'Screening',
    status: 'Thesis attached · IC pre-read due Fri',
    updatedAgo: '5h ago',
    opens: 'none',
  },
  {
    id: 'deal-njord',
    name: 'Project Njord',
    direction: 'Buy-side · Acquisition',
    stage: 'Diligence',
    status: 'DD checklist 9/14 workstreams · CIM screen complete',
    updatedAgo: '1d ago',
    opens: 'none',
  },
  {
    id: 'deal-meridian',
    name: 'Portfolio — Meridian Group',
    direction: 'Portfolio monitoring',
    stage: 'Monitoring',
    status: 'Quarterly pack refreshed 2d ago',
    updatedAgo: '2d ago',
    opens: 'none',
  },
];

// The deal the sourcing → promote moment creates. Held here so the reducer can append
// it, and the home grid can flag it as freshly created for the entrance animation.
export const CALDERA_DEAL: DealCard = {
  id: 'deal-caldera',
  name: 'Project Caldera',
  direction: 'Buy-side · Acquisition',
  stage: 'Sourcing',
  status: '3 targets · search attached · signals on',
  updatedAgo: 'just now',
  opens: 'caldera',
};

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — Caldera deal workspace
// ─────────────────────────────────────────────────────────────────────────────

export const CALDERA_OPENED_COPY = {
  headline: 'What should we dig into on Project Caldera?',
  // Deal context strip under the headline (chat-first workspace).
  directionBadge: 'Buy-side · Acquisition',
  stageChip: 'Sourcing',
  contextChips: ['Search: HVAC · Texas · $10M–$50M', '3 targets', 'Signals on'],
} as const;

// Suggestion chips. `action` maps to a WorkspaceAction dispatched by the deal chat.
export const CALDERA_SUGGESTIONS = [
  { id: 'screen-gulfair', label: 'Screen GulfAir Mechanical’s profile', action: 'screen-gulfair' as const },
  { id: 'queue-cim', label: 'Run CIM screen when the CIM arrives', action: 'queue-cim' as const },
  { id: 'whats-changed', label: 'What changed this week?', action: 'whats-changed' as const },
];

export const CALDERA_SCRIPTED = {
  // "Run CIM screen…" — governed, approval-gated reply + toast.
  queueCim:
    'I’ll watch for a CIM upload and queue pe-cim-screen — you’ll approve before anything runs.',
  queueCimToast: 'Watching for a CIM upload — pe-cim-screen queued',
  // "What changed this week?" — short scripted digest referencing the 3 targets + 1 new signal.
  whatsChanged:
    'Since last week on Project Caldera:\n• GulfAir Mechanical — seller-intent score ticked up to 68 (owner transition signal).\n• Lone Star Climate Systems — new leadership-succession filing detected.\n• Hill Country Air — no material change.\n• 1 new signal: a TX HVAC roll-up comparable closed at ~7.5x EBITDA.',
  // Generic Merlin-mode deal reply for unscripted prompts (Phase 3).
  genericDealReply:
    'I can work across Project Caldera — the carried search, the three targets, documents, and signals. Anything I draft holds for your approval before it lands on the deal.',
  // Generic Normal-mode reply — conversation only, never writes to the deal.
  genericNormalReply:
    'Happy to talk it through — in Normal mode this stays a conversation. Switch to Merlin (⌘M) when you want me to run Agents and land work on the deal.',
  // A non-CIM Agent was staged and submitted: honest demo stub.
  otherAgentReply:
    'Staged and holding for your approval. In this prototype the CIM Screen agent is wired end-to-end — run that one to see the full plan → glass-box → cited-output → commit loop.',
} as const;

// Deal Overview canvas view — the "where was I" answer.
export const CALDERA_OVERVIEW = {
  // State block.
  state: {
    stage: 'Sourcing',
    direction: 'Buy-side · Acquisition',
    created: 'Today',
    owner: 'Alex Verma',
  },
  // "Carried from sourcing" — the search chips + 3 target rows.
  searchChips: ['HVAC', 'Texas', '$10M–$50M'],
  targets: [
    { id: 'co-gulfair', name: 'GulfAir Mechanical', revenue: '$18M', sellerIntent: 'Has Intent · 68', wired: true },
    { id: 'co-lonestar', name: 'Lone Star Climate Systems', revenue: '$38M', sellerIntent: 'Has Intent · 61', wired: false },
    { id: 'co-hillcountry', name: 'Hill Country Air', revenue: '$29M', sellerIntent: 'Has Intent · 57', wired: false },
  ],
  // Next steps checklist (first checked).
  nextSteps: [
    { label: 'Targets shortlisted', done: true },
    { label: 'Screen target profiles', done: false },
    { label: 'Draft outreach shortlist', done: false },
  ],
  // Activity feed (A3 anatomy: monogram + "Actor — action 'quoted object'" + relative time).
  activity: [
    { id: 'act-1', actor: 'Alex Verma', initials: 'AV', action: 'Deal', object: 'Project Caldera', verb: 'created', time: 'just now' },
    { id: 'act-2', actor: 'Sourcing Signal Monitor', initials: 'SM', action: 'Signal', object: 'TX HVAC watchlist', verb: 'enabled', time: 'just now' },
    { id: 'act-3', actor: 'Alex Verma', initials: 'AV', action: '3 companies added from search', object: '', verb: '', time: '2m' },
  ],
  toastOpenProfile: 'Profile stub — full Intelligence view wired for GulfAir in this demo',
} as const;

// ── AI rail (Phase 2): Agents + Playbooks — shown only in the Caldera deal ──

export interface DealAgent {
  id: string;
  name: string;
  status: 'active' | 'idle';
  capabilities: string[]; // capability chips
  scope?: string;
  budget?: string;
}

// 2 governed agent cards (manda-aOS Agents panel pattern).
export const CALDERA_AGENTS: DealAgent[] = [
  {
    id: 'signal-monitor',
    name: 'Sourcing Signal Monitor',
    status: 'active',
    capabilities: ['signals.watch', 'companies.enrich'],
    scope: 'TX HVAC watchlist',
    budget: '50 tool calls/run · hard stop',
  },
  {
    id: 'research-agent',
    name: 'Deal Research Agent',
    status: 'idle',
    capabilities: ['corpus.list', 'doc.read', 'citation.resolve'],
  },
];

export interface DealPlaybook {
  id: string;
  name: string;
  oneLiner: string;
  input: string;
  sentTo: string;
  scope: 'Firm' | 'Personal';
  scheduleChip?: string;
  // Prepared prompt inserted into the composer on click (don't auto-send).
  prompt: string;
}

// 4 unified playbook cards (Skills + Blueprints + Templates). Blueprint INPUT/SENT-TO
// pattern from blueflame-platform-recon-FINAL.md §5a/5b.
export const CALDERA_PLAYBOOKS: DealPlaybook[] = [
  {
    id: 'pe-cim-screen',
    name: 'CIM Screen — buy-side',
    oneLiner: 'Screen an inbound CIM against the Caldera thesis.',
    input: 'CIM file',
    sentTo: 'Chat',
    scope: 'Firm',
    prompt: 'Run pe-cim-screen on the latest CIM upload and summarize fit against the Project Caldera thesis. Hold for my approval before anything runs.',
  },
  {
    id: 'diligence-qa-tracker',
    name: 'Diligence Q&A Tracker',
    oneLiner: 'Track diligence questions against VDR evidence.',
    input: 'Question sheet + VDR folder',
    sentTo: 'Excel',
    scope: 'Firm',
    prompt: 'Set up a diligence Q&A tracker for Project Caldera from a question sheet and VDR folder, resolving each answer to a cited source.',
  },
  {
    id: 'target-outreach-drafter',
    name: 'Target Outreach Drafter',
    oneLiner: 'Draft outreach emails to the shortlisted targets.',
    input: 'Shortlist',
    sentTo: 'Email drafts',
    scope: 'Personal',
    prompt: 'Draft outreach emails to the three Project Caldera targets from the shortlist. Keep them in drafts for my review.',
  },
  {
    id: 'weekly-signal-digest',
    name: 'Weekly Signal Digest',
    oneLiner: 'Weekly roll-up of signals across the watchlist.',
    input: 'none',
    sentTo: 'Email',
    scope: 'Personal',
    scheduleChip: 'Mon 7:00 AM',
    prompt: 'Configure a weekly signal digest for the Project Caldera TX HVAC watchlist, delivered Monday mornings.',
  },
];

export const CALDERA_RAIL_COPY = {
  // Two-tier vocabulary (doc 09, LOCKED): the assistant is "Blueflame AI"; "Agents"
  // are the countable library items (blueprints + push-button skills folded together,
  // outcome-named). No skill-vs-blueprint badge — provenance + status chips only.
  agentsHeader: 'Agents',
  allAgents: 'All agents',
  seatToggleLabel: 'Seat',
} as const;

// The unified Agent library, grouped by deal-lifecycle stage (doc 09:
// Source → Evaluate → Diligence → Report → Monitor; empty stages omitted).
// Governed runners (status chips) and runnable Agents live in the SAME library.
export interface CalderaAgentGroup {
  stage: string;
  agentIds: string[]; // governed runner cards (from CALDERA_AGENTS)
  playbookIds: string[]; // runnable Agent cards (from CALDERA_PLAYBOOKS)
}

export const CALDERA_AGENT_GROUPS: readonly CalderaAgentGroup[] = [
  { stage: 'Source', agentIds: ['signal-monitor'], playbookIds: ['target-outreach-drafter'] },
  { stage: 'Evaluate', agentIds: ['research-agent'], playbookIds: ['pe-cim-screen'] },
  { stage: 'Diligence', agentIds: [], playbookIds: ['diligence-qa-tracker'] },
  { stage: 'Monitor', agentIds: [], playbookIds: ['weekly-signal-digest'] },
];

// Deal-scoped composer placeholder — the assistant is Blueflame AI in the deal.
export const CALDERA_COMPOSER_PLACEHOLDER =
  'Ask Blueflame AI about this deal, or run an Agent — work holds for your approval…';

// Deal Context markdown (A3 Blueflame Deal template — Deal Metadata / Transaction Overview).
export const CALDERA_CONTEXT_MARKDOWN = `# 1. Deal Metadata
- **Project Name:** Project Caldera
- **Company Sector:** Commercial HVAC services
- **Deal Classification:** Buy-side add-on acquisition
- **Deal Team:** Alex Verma (Corporate Development)

# 2. Transaction Overview
- **Transaction Summary:** Buy-side platform is pursuing a Texas HVAC roll-up, consolidating commercial mechanical-services providers ($10M–$50M revenue) with recurring maintenance contracts. Initial shortlist of three targets carried from Grata sourcing, led by GulfAir Mechanical. Thesis: fragmented Gulf Coast market, owner-operators approaching transition, strong recurring-revenue mix.`;

