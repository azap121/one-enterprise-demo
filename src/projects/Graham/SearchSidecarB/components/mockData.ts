// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Doc {
  id: string;
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'pptx';
  category: string;
}

export interface Folder {
  id: string;
  name: string;
  date?: string;
  files?: number;
  size?: string;
  documents?: Doc[];
  children?: Folder[];
}

export interface SearchResult {
  id: string;
  doc: string;
  folder: string;
  snippet: string;
  confidence: 'High' | 'Medium' | 'Low';
  page: number;
  category: string;
  type: string;
  date: string;
}

export interface Citation {
  doc: string;
  page?: number;
  note?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  name?: string;
  initials?: string;
  citations?: Citation[];
  followUp?: string | null;
}

// ─── Project Stats ─────────────────────────────────────────────────────────────

export const PROJECT_STATS = {
  name: 'Project Halo',
  documents: 1237,
  folders: 394,
  categories: 98,
  newDocuments: 136,
  highPriorityQA: 84,
  userRequests: 16,
  messages: 27,
  attentionItems: 263,
  lastVisited: '4hrs ago',
};

// ─── Folder Tree ───────────────────────────────────────────────────────────────

export const FOLDERS: Folder[] = [
  {
    id: 'samsung-foundry',
    name: 'Samsung Foundry Vendor Agreements',
    date: '11 Dec 2025 · 11:49',
    files: 5,
    size: '89.1 MB',
    documents: [
      { id: 'd1', name: 'Samsung Foundry Vendor Agreements.pdf', type: 'pdf', category: 'Agreement' },
      { id: 'd2', name: 'TSMC Foundry Vendor Agreements.pdf', type: 'pdf', category: 'Agreement' },
      { id: 'd3', name: 'GlobalFoundries Supply Chain Contracts.pdf', type: 'pdf', category: 'Contract' },
      { id: 'd4', name: 'Intel Technology Licensing Agreements.pdf', type: 'pdf', category: 'Agreement' },
      { id: 'd5', name: 'Micron Component Supply Agreements.pdf', type: 'pdf', category: 'Agreement' },
    ],
  },
  {
    id: 'tsmc-foundry',
    name: 'TSMC Foundry Vendor Agreements',
    date: '10 Dec 2025 · 11:49',
    files: 28,
    size: '182.4 MB',
    documents: [],
  },
  {
    id: 'nvidia-foundry',
    name: 'Nvidia Foundry Vendor Agreements',
    date: '9 Dec 2025 · 11:49',
    files: 41,
    size: '439.1 MB',
    documents: [
      { id: 'd6', name: 'Nanotech Materials Trading Contracts.pdf', type: 'pdf', category: 'Contract' },
      { id: 'd7', name: 'Quantum Technology Licensing Agreements.pdf', type: 'pdf', category: 'Agreement' },
      { id: 'd8', name: 'Advanced Robotics Maintenance Services.pdf', type: 'pdf', category: 'Services' },
      { id: 'd9', name: '3D Printing Equipment Purchase Orders.pdf', type: 'pdf', category: 'Purchase Order' },
      { id: 'd10', name: 'Virtual Reality Headset Orders.pdf', type: 'pdf', category: 'Purchase Order' },
      { id: 'd11', name: 'Augmented Reality Glasses Procurement.pdf', type: 'pdf', category: 'Procurement' },
    ],
  },
];

// ─── Search Results ────────────────────────────────────────────────────────────

export const SEARCH_RESULTS: Record<string, SearchResult[]> = {
  lease: [
    { id: 'sr1', doc: 'TSMC Foundry Vendor Agreements.pdf', folder: 'TSMC Foundry Vendor Agreements', snippet: 'Tenant may terminate this <mark>lease</mark> prior to expiration upon six(6) months written notice…', confidence: 'High', page: 34, category: 'Agreement', type: 'pdf', date: '2025-12-11' },
    { id: 'sr2', doc: 'Samsung Foundry Vendor Agreements.pdf', folder: 'Samsung Foundry Vendor Agreements', snippet: 'The <mark>termination rights</mark> shall apply if the Premises become untenantable due to…', confidence: 'High', page: 12, category: 'Agreement', type: 'pdf', date: '2025-12-11' },
    { id: 'sr3', doc: 'GlobalFoundries Supply Chain Contracts.pdf', folder: 'Samsung Foundry Vendor Agreements', snippet: 'Tenant may terminate this <mark>lease</mark> prior to expiration upon six(6) months written notice…', confidence: 'High', page: 22, category: 'Contract', type: 'pdf', date: '2025-12-11' },
    { id: 'sr4', doc: 'Intel Technology Licensing Agreements.pdf', folder: 'Samsung Foundry Vendor Agreements', snippet: 'In case of <mark>early termination</mark> by Tenant, Landlord reserves the right to…', confidence: 'Medium', page: 8, category: 'Agreement', type: 'pdf', date: '2025-12-11' },
  ],
  revenue: [
    { id: 'sr5', doc: '2024 Audited Financials.pdf', folder: 'Financial Statements', snippet: 'Total <mark>revenue</mark> for FY2024: $30.5M. Top 10 customers represent 80% of total revenue…', confidence: 'High', page: 34, category: 'Financial', type: 'pdf', date: '2025-11-30' },
    { id: 'sr6', doc: 'Revenue Segmentation Analysis 2022–2024.xlsx', folder: 'Financial Statements', snippet: '<mark>Revenue</mark> breakdown by customer segment shows 12 distinct categories…', confidence: 'High', page: 2, category: 'Financial', type: 'xlsx', date: '2025-11-28' },
  ],
  default: [
    { id: 'sr7', doc: 'TSMC Foundry Vendor Agreements.pdf', folder: 'TSMC Foundry Vendor Agreements', snippet: 'This agreement is subject to the terms and conditions set forth in Schedule A…', confidence: 'Medium', page: 1, category: 'Agreement', type: 'pdf', date: '2025-12-11' },
  ],
};

export function getSearchResults(query: string): SearchResult[] {
  const q = query.toLowerCase();
  if (q.includes('lease') || q.includes('terminat')) return SEARCH_RESULTS.lease;
  if (q.includes('revenue') || q.includes('customer') || q.includes('financial')) return SEARCH_RESULTS.revenue;
  if (q.length > 2) return SEARCH_RESULTS.default;
  return [];
}

// ─── Chat Responses ────────────────────────────────────────────────────────────

export const CHAT_RESPONSES = {
  revenue_table: {
    content: `Based on the **Customer Revenue Analysis for 2024** and the **Revenue Segmentation Analysis 2022–2024**, here are the Top 10 customers by revenue:\n\n| Rank | Customer | Revenue (FY2024) | % of Total |\n|------|----------|-----------------|------------|\n| 1 | TSMC Holdings Ltd | $6.2M | 20.3% |\n| 2 | Samsung Electronics | $4.8M | 15.7% |\n| 3 | Intel Corporation | $3.9M | 12.8% |\n| 4 | Nvidia Corporation | $3.1M | 10.2% |\n| 5 | Qualcomm Inc | $2.4M | 7.9% |\n| 6 | AMD Inc | $2.1M | 6.9% |\n| 7 | Broadcom Ltd | $1.8M | 5.9% |\n| 8 | MediaTek Inc | $1.6M | 5.2% |\n| 9 | Micron Technology | $1.4M | 4.6% |\n| 10 | GlobalFoundries | $1.2M | 3.9% |\n\n**Top 10 total: $30.5M (80% of revenue)**`,
    citations: [
      { doc: 'Revenue Segmentation Analysis for 2022–2024', note: 'Customer Segments sheet' },
      { doc: 'Customer Revenue Analysis for 2024', note: 'Top Customers sheet' },
      { doc: '2024 Audited Financials', page: 34, note: 'Note 15 — Revenue Concentration' },
    ] as Citation[],
    followUp: 'Would you like me to add historical comparison columns for 2022 and 2023?' as string | null,
  },
  lease_clauses: {
    content: `I've searched across **74 documents** in the Vendor Agreements folder. Contracts containing lease termination clauses:\n\n1. **TSMC Foundry Vendor Agreements.pdf** — "Tenant may terminate this lease prior to expiration upon six(6) months written notice…" *(Page 34)*\n\n2. **Samsung Foundry Vendor Agreements.pdf** — "The termination rights shall apply if the Premises become untenantable…" *(Page 12)*\n\n3. **GlobalFoundries Supply Chain Contracts.pdf** — termination on six(6) months written notice *(Page 22)*\n\n4. **Intel Technology Licensing Agreements.pdf** — early termination reserves landlord rights *(Page 8)*`,
    citations: [
      { doc: 'TSMC Foundry Vendor Agreements.pdf', page: 34, note: 'High confidence' },
      { doc: 'Samsung Foundry Vendor Agreements.pdf', page: 12, note: 'High confidence' },
      { doc: 'GlobalFoundries Supply Chain Contracts.pdf', page: 22, note: 'High confidence' },
      { doc: 'Intel Technology Licensing Agreements.pdf', page: 8, note: 'Medium confidence' },
    ] as Citation[],
    followUp: 'Would you like me to extract the specific notice periods from each contract?' as string | null,
  },
  default: {
    content: `I've searched across the documents in this project.\n\nI can help with financial analysis, contract review, risk identification, or document navigation.\n\nWhat specific aspect would you like to explore?`,
    citations: [] as Citation[],
    followUp: null as string | null,
  },
};

export function getChatResponse(query: string): typeof CHAT_RESPONSES.default {
  const q = query.toLowerCase();
  if (q.includes('revenue') || q.includes('customer') || q.includes('table') || q.includes('top 10')) return CHAT_RESPONSES.revenue_table;
  if (q.includes('lease') || q.includes('terminat') || q.includes('clause')) return CHAT_RESPONSES.lease_clauses;
  return CHAT_RESPONSES.default;
}

// ─── Confidence Color ──────────────────────────────────────────────────────────

export const CONFIDENCE_COLOR: Record<'High' | 'Medium' | 'Low', 'success' | 'warning' | 'error'> = {
  High: 'success',
  Medium: 'warning',
  Low: 'error',
};

// ─── Document-level Match ──────────────────────────────────────────────────────

export interface DocMatch {
  id: string;
  section: string;
  page: number;
  snippet: string; // may contain <mark>...</mark>
  confidence: 'High' | 'Medium' | 'Low';
}

// Per-document, per-query mock matches
const DOC_MATCHES: Record<string, Record<string, DocMatch[]>> = {
  'TSMC Foundry Vendor Agreements.pdf': {
    lease: [
      {
        id: 'tsmc-1',
        section: 'Section 2.1 — Lease Term',
        page: 8,
        confidence: 'High',
        snippet: 'This <mark>lease</mark> shall commence on the Effective Date and continue for an initial term of five (5) years, unless earlier <mark>terminated</mark> in accordance with the provisions hereof.',
      },
      {
        id: 'tsmc-2',
        section: 'Section 4.3 — Renewal Rights',
        page: 12,
        confidence: 'High',
        snippet: 'Tenant may renew this <mark>lease</mark> for one (1) additional term of three (3) years by delivering written notice of renewal no later than one hundred eighty (180) days prior to the expiration of the then-current term.',
      },
      {
        id: 'tsmc-3',
        section: 'Section 6.2 — Assignment & Sublease',
        page: 23,
        confidence: 'Medium',
        snippet: 'Tenant shall not sublease any portion of the Premises or assign this <mark>lease</mark> without the prior written consent of Landlord, which shall not be unreasonably withheld or delayed.',
      },
      {
        id: 'tsmc-4',
        section: 'Section 9.1 — Early Termination',
        page: 34,
        confidence: 'High',
        snippet: 'Tenant may <mark>terminate</mark> this <mark>lease</mark> prior to expiration upon six (6) months written notice to Landlord, subject to payment of an early termination fee equal to three (3) months\' base rent.',
      },
    ],
  },
};

export function getDocMatches(docName: string, query: string): DocMatch[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const docEntry = DOC_MATCHES[docName];
  if (!docEntry) return [];
  if (q.includes('lease') || q.includes('terminat')) return docEntry.lease ?? [];
  return [];
}
