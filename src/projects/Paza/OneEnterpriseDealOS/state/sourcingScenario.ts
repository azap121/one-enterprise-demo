// Grata-style AI sourcing scenario — the core of Phase 1 ("Surface 0").
// Choreography and verbatim copy reproduced from the live Grata AI search scrape
// (enterprise/scrapes/a2-grata-search-choreography.md). All company data is FICTIONAL.
//
// State machine (see reducer, flow: 'sourcing'):
//   sourcing-interpreting → sourcing-parsed (parse chips + quick suggestions + results canvas)
// Timings: interpret ~2.5s (SOURCING_INTERPRET_MS), skeleton 1s on view switch.

export const SOURCING_INTERPRET_MS = 2500;
export const SOURCING_VIEW_SKELETON_MS = 1000;

export const SOURCING_COPY = {
  // The query the HVAC suggestion chip submits (adapted to a full sentence).
  hvacQuery: 'Find HVAC companies in Texas with revenue between $10M and $50M',
  interpreting: 'Interpreting your search…',
  // State 3 — parse. Verbatim interpretation sentence from the scrape.
  interpretation: 'Focusing on HVAC businesses in Texas generating $10M to $50M in annual revenue:',
  followOn: 'Would you like to branch into adjacent markets next?',
  resultCountLabel: '609 Companies',
  quickSuggestionsHeader: 'Quick suggestions to narrow the search',
  // Toast shown for the non-wired suggestion chips.
  continuationToast: 'Scenario continues with commercial services',
  continuationPlaceholder: 'Type anything',
} as const;

// State 3 parsed criteria — three rows. The Terms row expands to 5 OR-connected terms.
export const SOURCING_CRITERIA = {
  headquarters: 'Texas',
  primaryTerm: 'HVAC contractor',
  // 5 total OR-connected terms (verbatim from scrape).
  terms: [
    'HVAC Contractor',
    'HVAC Services',
    'Heating Ventilation Air Conditioning',
    'HVAC',
    'Mechanical Contractor',
  ],
  revenue: 'Revenue from $10 Million to $50 Million',
} as const;

// State 4 — quick suggestions (verbatim). The first is wired to actually filter the
// table; the other two no-op with a toast.
export const SOURCING_QUICK_SUGGESTIONS = [
  {
    id: 'commercial-mechanical',
    label:
      'Commercial mechanical service providers handling maintenance contracts for offices, healthcare, and education facilities',
    wired: true,
  },
  {
    id: 'industrial',
    label: 'Industrial HVAC specialists serving oil, gas, petrochemical, and heavy manufacturing sites',
    wired: false,
  },
  {
    id: 'multifamily',
    label:
      'Multifamily and mixed-use HVAC contractors with recurring service portfolios across large property managers',
    wired: false,
  },
] as const;

export type SourcingView = 'table' | 'tiles' | 'summary';

export type SellerIntent = 'has-intent' | 'none';
export type Ownership = 'Bootstrapped' | 'Investor Backed' | 'PE Add-On';

export interface SourcingCompany {
  id: string;
  name: string;
  domain: string;
  description: string;
  sellerIntent: SellerIntent;
  revenueLabel: string;
  revenueValue: number; // $M, for sizing
  hq: string;
  employees: number;
  ownership: Ownership;
  // One-line evidence string for the Tiles view.
  evidence: string;
  // Whether the row survives the commercial-mechanical narrowing (State 4).
  commercial: boolean;
}

// 12 fictional Texas HVAC companies. 3 carry "Has Intent to Sell".
export const SOURCING_COMPANIES: SourcingCompany[] = [
  {
    id: 'co-gulfair',
    name: 'GulfAir Mechanical',
    domain: 'gulfairmech.com',
    description: 'Commercial HVAC installation and maintenance for offices and healthcare campuses.',
    sellerIntent: 'has-intent',
    revenueLabel: '$41M',
    revenueValue: 41,
    hq: 'Houston, TX',
    employees: 260,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 98 Web: hvac contractor…',
    commercial: true,
  },
  {
    id: 'co-lonestar',
    name: 'Lone Star Climate Systems',
    domain: 'lonestarclimate.com',
    description: 'Design-build mechanical contractor serving commercial and education facilities.',
    sellerIntent: 'has-intent',
    revenueLabel: '$38M',
    revenueValue: 38,
    hq: 'Dallas, TX',
    employees: 240,
    ownership: 'Investor Backed',
    evidence: '1 Industry Match + 76 Web: mechanical contractor…',
    commercial: true,
  },
  {
    id: 'co-hillcountry',
    name: 'Hill Country Air',
    domain: 'hillcountryair.com',
    description: 'Recurring-service HVAC provider for offices and mixed-use property managers.',
    sellerIntent: 'has-intent',
    revenueLabel: '$29M',
    revenueValue: 29,
    hq: 'Austin, TX',
    employees: 180,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 64 Web: hvac services…',
    commercial: true,
  },
  {
    id: 'co-brazos',
    name: 'Brazos Valley Mechanical',
    domain: 'brazosmech.com',
    description: 'Commercial mechanical service and maintenance contracts across central Texas.',
    sellerIntent: 'none',
    revenueLabel: '$34M',
    revenueValue: 34,
    hq: 'Waco, TX',
    employees: 210,
    ownership: 'PE Add-On',
    evidence: '1 Industry Match + 58 Web: maintenance contract…',
    commercial: true,
  },
  {
    id: 'co-alamo',
    name: 'Alamo Comfort Solutions',
    domain: 'alamocomfort.com',
    description: 'HVAC service portfolio for healthcare and education facilities.',
    sellerIntent: 'none',
    revenueLabel: '$26M',
    revenueValue: 26,
    hq: 'San Antonio, TX',
    employees: 150,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 51 Web: hvac contractor…',
    commercial: true,
  },
  {
    id: 'co-pecos',
    name: 'Pecos Industrial HVAC',
    domain: 'pecosindustrial.com',
    description: 'Industrial HVAC specialist serving petrochemical and heavy manufacturing sites.',
    sellerIntent: 'none',
    revenueLabel: '$48M',
    revenueValue: 48,
    hq: 'Midland, TX',
    employees: 400,
    ownership: 'Investor Backed',
    evidence: '1 Industry Match + 44 Web: heating ventilation…',
    commercial: false,
  },
  {
    id: 'co-trinity',
    name: 'Trinity Mechanical Group',
    domain: 'trinitymech.com',
    description: 'Commercial mechanical contractor with maintenance agreements for office portfolios.',
    sellerIntent: 'none',
    revenueLabel: '$32M',
    revenueValue: 32,
    hq: 'Fort Worth, TX',
    employees: 195,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 39 Web: mechanical contractor…',
    commercial: true,
  },
  {
    id: 'co-gulfcoast',
    name: 'Gulf Coast Comfort Air',
    domain: 'gulfcoastcomfort.com',
    description: 'Multifamily and mixed-use HVAC contractor with recurring service routes.',
    sellerIntent: 'none',
    revenueLabel: '$19M',
    revenueValue: 19,
    hq: 'Corpus Christi, TX',
    employees: 110,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 33 Web: hvac services…',
    commercial: false,
  },
  {
    id: 'co-panhandle',
    name: 'Panhandle Heating & Cooling',
    domain: 'panhandlehc.com',
    description: 'Regional HVAC contractor serving commercial and light-industrial clients.',
    sellerIntent: 'none',
    revenueLabel: '$23M',
    revenueValue: 23,
    hq: 'Amarillo, TX',
    employees: 140,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 28 Web: hvac contractor…',
    commercial: true,
  },
  {
    id: 'co-riogrande',
    name: 'Rio Grande Mechanical',
    domain: 'riograndemech.com',
    description: 'Mechanical service contractor for education and municipal facilities.',
    sellerIntent: 'none',
    revenueLabel: '$17M',
    revenueValue: 17,
    hq: 'El Paso, TX',
    employees: 95,
    ownership: 'PE Add-On',
    evidence: '1 Industry Match + 24 Web: maintenance contract…',
    commercial: true,
  },
  {
    id: 'co-bayou',
    name: 'Bayou City Climate Control',
    domain: 'bayouclimate.com',
    description: 'Commercial HVAC and controls integration for healthcare campuses.',
    sellerIntent: 'none',
    revenueLabel: '$27M',
    revenueValue: 27,
    hq: 'Houston, TX',
    employees: 165,
    ownership: 'Investor Backed',
    evidence: '1 Industry Match + 21 Web: hvac services…',
    commercial: true,
  },
  {
    id: 'co-permian',
    name: 'Permian Air Systems',
    domain: 'permianair.com',
    description: 'Industrial HVAC for oil, gas, and heavy manufacturing facilities.',
    sellerIntent: 'none',
    revenueLabel: '$11M',
    revenueValue: 11,
    hq: 'Odessa, TX',
    employees: 40,
    ownership: 'Bootstrapped',
    evidence: '1 Industry Match + 18 Web: heating ventilation…',
    commercial: false,
  },
];

// Ownership split for the Summary view (verbatim mix from the scrape shape).
export const SOURCING_OWNERSHIP_SPLIT = [
  { label: 'Bootstrapped', percent: 90 },
  { label: 'Investor Backed', percent: 3 },
  { label: 'Other', percent: 7 },
] as const;

// Sizing split (SMB vs Middle Market) for the Summary view.
export const SOURCING_SIZING_SPLIT = [
  { label: 'SMB', percent: 62 },
  { label: 'Middle Market', percent: 38 },
] as const;

// What carries over into the promoted deal (staggered checkmarks).
export const PROMOTE_CARRYOVER = [
  'Search: HVAC · Texas · $10M–$50M revenue',
  '3 companies with profiles & evidence',
  'Thesis note (from this chat)',
  'Seller-intent signals · monitoring on',
] as const;

export const PROMOTE_COPY = {
  dialogTitle: 'Promote to Deal',
  defaultDealName: 'Project Caldera — TX HVAC roll-up',
  direction: 'Buy-side · Acquisition',
  carryoverHeader: 'What carries over',
  confirmCta: 'Create deal',
  cancelCta: 'Cancel',
} as const;
