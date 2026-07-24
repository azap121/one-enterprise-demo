// Intelligence view fixtures — Phase 2 centerpiece. A Grata company profile rendered
// in deal context, restructured into a TIERED hierarchy (JT's Tearsheet insight: lead
// with what matters, not 8 equal modules). Content follows the A1 field-level scrape
// (enterprise/scrapes/a1-grata-profile-fields.md). All data is FICTIONAL.

export interface StatTile {
  label: string; // carries "Est." per A1 sizing selectors
  value: string;
}

export interface ExecutiveRow {
  title: string;
  name: string;
  email: string | null; // null → enrichment empty-state
  emailVerified?: boolean; // green verified check (A1 §5)
}

export interface EvidenceSnippet {
  id: string;
  // The one-line snippet; the matched terms are the substrings highlighted in teal.
  text: string;
  matchedTerms: string[];
}

export interface CompRow {
  company: string;
  revenue: string;
  employeeEst: string;
  annualGrowthEst: string;
}

export interface IntelligenceProfile {
  id: string; // matches SourcingCompany id (e.g. 'co-gulfair')
  name: string;
  domain: string;
  description: string;
  // Tier 1 — hero stat tiles.
  stats: StatTile[];
  // Whether the Annual Rev row shows the "Estimate" badge (A1 §2).
  annualRevEstimate: string;
  // Tier 2 — Seller Intent Summary.
  sellerIntentScore: number;
  sellerIntentBadge: string; // "Has Intent"
  sellerIntentUpdated: string; // "Updated Jul 22, 2026"
  exitReadiness: string; // "Positive"
  intentFactors: string[];
  // Tier 3 — collapsible sections.
  keywords: string[];
  executives: ExecutiveRow[];
  evidenceHits: number; // "98 Website Hits"
  evidenceFraming: string;
  evidenceSnippets: EvidenceSnippet[];
  comps: CompRow[];
  // Thin profiles (the other 2 targets) only get the hero + intent; sections are absent.
  thin?: boolean;
}

// GulfAir Mechanical — the fully-built profile reached from the suggestion chip,
// target rows, and the Intelligence canvas tab.
const GULFAIR: IntelligenceProfile = {
  id: 'co-gulfair',
  name: 'GulfAir Mechanical',
  domain: 'gulfairmech.com',
  description: 'Commercial HVAC installation and maintenance for offices and healthcare campuses across the Texas Gulf Coast.',
  stats: [
    { label: 'Revenue Est.', value: '$18M' },
    { label: 'Employee Est.', value: '104' },
    { label: 'Site Visits', value: '41.2K' },
  ],
  annualRevEstimate: '$18M',
  sellerIntentScore: 68,
  sellerIntentBadge: 'Has Intent',
  sellerIntentUpdated: 'Updated Jul 22, 2026',
  exitReadiness: 'Positive',
  intentFactors: [
    '11 years since founding, no outside funding',
    'Owner approaching transition age',
  ],
  keywords: [
    'commercial hvac',
    'mechanical services',
    'preventive maintenance',
    'chiller service',
    'building automation',
    'energy retrofits',
    'hvac contractor',
    'service contracts',
    'plumbing',
    'controls',
  ],
  executives: [
    { title: 'CEO / Owner', name: 'Ray Delgado', email: 'rdelgado@gulfairmech.com', emailVerified: true },
    { title: 'VP Operations', name: 'Marcus Whitfield', email: null },
  ],
  evidenceHits: 98,
  evidenceFraming: 'We found 98 search hits on this company webpage matching your specified search terms:',
  evidenceSnippets: [
    {
      id: 'ev-1',
      text: 'GulfAir Mechanical provides commercial HVAC and preventive maintenance service contracts to healthcare and office campuses.',
      matchedTerms: ['commercial HVAC', 'preventive maintenance', 'service contracts'],
    },
    {
      id: 'ev-2',
      text: 'Our building automation and chiller service teams keep critical facilities running around the clock.',
      matchedTerms: ['building automation', 'chiller service'],
    },
    {
      id: 'ev-3',
      text: 'Energy retrofits and controls upgrades reduce operating costs for long-term mechanical services clients.',
      matchedTerms: ['Energy retrofits', 'controls', 'mechanical services'],
    },
  ],
  comps: [
    { company: 'Lone Star Climate Systems', revenue: '$38M', employeeEst: '240', annualGrowthEst: '+9%' },
    { company: 'Hill Country Air', revenue: '$29M', employeeEst: '180', annualGrowthEst: '+12%' },
    { company: 'Trinity Mechanical Group', revenue: '$32M', employeeEst: '195', annualGrowthEst: '+7%' },
    { company: 'Bayou City Climate Control', revenue: '$27M', employeeEst: '165', annualGrowthEst: '+11%' },
  ],
};

// Thin versions for the other 2 carried targets — hero + intent only.
const LONESTAR: IntelligenceProfile = {
  id: 'co-lonestar',
  name: 'Lone Star Climate Systems',
  domain: 'lonestarclimate.com',
  description: 'Design-build mechanical contractor serving commercial and education facilities.',
  stats: [
    { label: 'Revenue Est.', value: '$38M' },
    { label: 'Employee Est.', value: '240' },
    { label: 'Site Visits', value: '58.9K' },
  ],
  annualRevEstimate: '$38M',
  sellerIntentScore: 61,
  sellerIntentBadge: 'Has Intent',
  sellerIntentUpdated: 'Updated Jul 21, 2026',
  exitReadiness: 'Positive',
  intentFactors: ['Recent leadership succession filing'],
  keywords: [],
  executives: [],
  evidenceHits: 0,
  evidenceFraming: '',
  evidenceSnippets: [],
  comps: [],
  thin: true,
};

const HILLCOUNTRY: IntelligenceProfile = {
  id: 'co-hillcountry',
  name: 'Hill Country Air',
  domain: 'hillcountryair.com',
  description: 'Recurring-service HVAC provider for offices and mixed-use property managers.',
  stats: [
    { label: 'Revenue Est.', value: '$29M' },
    { label: 'Employee Est.', value: '180' },
    { label: 'Site Visits', value: '33.4K' },
  ],
  annualRevEstimate: '$29M',
  sellerIntentScore: 57,
  sellerIntentBadge: 'Has Intent',
  sellerIntentUpdated: 'Updated Jul 20, 2026',
  exitReadiness: 'Positive',
  intentFactors: ['Bootstrapped, 14 years operating'],
  keywords: [],
  executives: [],
  evidenceHits: 0,
  evidenceFraming: '',
  evidenceSnippets: [],
  comps: [],
  thin: true,
};

export const INTELLIGENCE_PROFILES: Record<string, IntelligenceProfile> = {
  [GULFAIR.id]: GULFAIR,
  [LONESTAR.id]: LONESTAR,
  [HILLCOUNTRY.id]: HILLCOUNTRY,
};

// The three targets carried from sourcing (order = shortlist order).
export const CALDERA_TARGET_IDS = [GULFAIR.id, LONESTAR.id, HILLCOUNTRY.id] as const;

// Profile action bar (A1 §8). All no-op with subtle toasts; Sync is disabled.
export const INTELLIGENCE_ACTIONS = [
  { id: 'add-to-list', label: 'Add to List', toast: 'Added to list — for demo only' },
  { id: 'sync', label: 'Sync', disabled: true },
  { id: 'tearsheet', label: 'Tearsheet', toast: 'Tearsheet export queued — lands in Deal files' },
  { id: 'find-similar', label: 'AI Find Similar', toast: 'Finding similar companies — for demo only' },
] as const;

export const INTELLIGENCE_COPY = {
  compsFooterCta: 'AI Find All Similar Companies',
  compsToast: 'Finding similar companies — for demo only',
  methodologyLabel: 'Methodology',
  enrichmentCta: 'Submit for Contact Enrichment',
} as const;
