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

export const CALDERA_OPENED_COPY = {
  headline: 'What should we dig into on Project Caldera?',
  suggestions: [
    'Screen GulfAir Mechanical’s profile',
    'Draft outreach shortlist',
    'Set a weekly signal digest',
  ],
} as const;
