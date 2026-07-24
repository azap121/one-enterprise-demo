import type { SellerIndexFile } from './rightCanvasFileData';

export type QaTriageRowStatus =
  | 'Suggested answer ready'
  | 'Sensitive'
  | 'Duplicate likely'
  | 'Needs SME';

export interface QaTriageItem {
  id: string;
  buyer: string;
  question: string;
  category: string;
  aiRead: QaTriageRowStatus;
  evidenceLabel: string;
  nextStep: string;
  owner: string;
  duplicateMatch: string;
  sensitivity: string;
  suggestedAnswer: string;
  savedSearches: string[];
  citationFileIds: string[];
}

export const QA_TRIAGE_ITEMS: QaTriageItem[] = [
  {
    id: 'logo-churn-nrr',
    buyer: 'Strategic Buyer A',
    question: 'Please provide monthly logo churn and net revenue retention by cohort.',
    category: 'Commercial / ARR quality',
    aiRead: 'Suggested answer ready',
    evidenceLabel: '2 cites',
    nextStep: 'Review',
    owner: 'Robbin',
    duplicateMatch: 'Near match to Buyer C question on gross revenue retention.',
    sensitivity: 'No restricted content detected. Cite only aggregate cohort metrics.',
    suggestedAnswer:
      'Nimbus tracks logo churn monthly by SMB, mid-market, and enterprise cohorts. Net revenue retention was 112% for enterprise, 104% for mid-market, and 96% for SMB in the latest LTM period. The answer should cite the ARR cohort workbook and customer concentration schedule before approval.',
    savedSearches: ['churn', 'NRR', 'customer cohorts'],
    citationFileIds: ['wb-arr-cohort-workbook', 'wb-customer-concentration'],
  },
  {
    id: 'source-code-access',
    buyer: 'PE Sponsor B',
    question: 'Where is source code hosted, and can bidders access repository documentation?',
    category: 'IP / source code',
    aiRead: 'Sensitive',
    evidenceLabel: '1 cite',
    nextStep: 'Route to legal',
    owner: 'Legal counsel',
    duplicateMatch: 'No direct duplicate. Related to Buyer D request for repository architecture.',
    sensitivity: 'Restricted disclosure. Keep repository detail out of Round 1 and route before sharing.',
    suggestedAnswer:
      'Source code is hosted in GitHub Enterprise with access governed by SSO and repository-level controls. The suggested answer should not grant bidder access; route to counsel and confirm whether a repository documentation excerpt can be released in confirmatory diligence.',
    savedSearches: ['source code', 'repository', 'IP assignment'],
    citationFileIds: ['wb-source-code-policy'],
  },
  {
    id: 'open-source-exposure',
    buyer: 'Strategic Buyer C',
    question: 'Please confirm open-source license exposure for core platform components.',
    category: 'Technology / open source',
    aiRead: 'Duplicate likely',
    evidenceLabel: '3 cites',
    nextStep: 'Merge',
    owner: 'Technology SME',
    duplicateMatch: '92% match to Buyer A question on OSS obligations and copyleft components.',
    sensitivity: 'Low sensitivity, but answer should cite the current register and legal summary.',
    suggestedAnswer:
      'The open-source register lists core platform dependencies and flags no unresolved copyleft exposure in production services. Merge the duplicate request and answer once with citations to the OSS register, legal memo, and repository scan summary.',
    savedSearches: ['open source', 'copyleft', 'software licensing'],
    citationFileIds: ['wb-open-source-register', 'wb-oss-legal-memo', 'wb-repository-scan'],
  },
  {
    id: 'gdpr-dpa-materials',
    buyer: 'Counsel D',
    question: 'Can you provide SOC 2, penetration test, and GDPR / DPA materials?',
    category: 'Cybersecurity / privacy',
    aiRead: 'Needs SME',
    evidenceLabel: '2 cites',
    nextStep: 'Route',
    owner: 'Security lead',
    duplicateMatch: 'Partial overlap with Buyer B SOC 2 request.',
    sensitivity: 'Permission-aware. SOC 2 summary is Round 1; pen test detail requires restricted access.',
    suggestedAnswer:
      'SOC 2 Type II and DPA templates are available for Round 1 disclosure. The latest penetration test summary should be routed to the security lead because detailed findings are restricted to confirmatory diligence.',
    savedSearches: ['SOC 2', 'penetration test', 'GDPR / DPA'],
    citationFileIds: ['wb-soc2-report', 'wb-dpa-summary'],
  },
];

export const QA_DISCOVERY_PROMPTS = [
  'Who categorizes buyer questions today?',
  'Where do duplicate questions show up?',
  'Would cited suggested answers be trusted?',
  'What answers require legal or client approval?',
  'Which searches repeat on every tech deal?',
  'What must AI never publish without review?',
] as const;

export const QA_EVIDENCE_CHIPS = [
  'Search is 35.7% of activity vs ~20% peer median',
  'Q&A volume is top quartile',
  'Median Q&A response time is directionally ~2 hours',
  'Tech searches include churn, roadmap, source code, cyber, licensing, IP',
] as const;

export const WILLIAM_BLAIR_SOURCE_FILES: SellerIndexFile[] = [
  {
    id: 'wb-arr-cohort-workbook',
    index: '4.2.1',
    name: 'ARR Cohort Workbook.xlsx',
    kind: 'file',
    fileType: 'xlsx',
    meta: 'Round 1 permitted',
    categoryId: 'finance',
    childCategoryId: 'finance-revenue',
    pages: 9,
    size: '2.6 MB',
    uploadedBy: 'Deal team',
    updatedAt: 'Jun 27, 2026',
    status: 'Cited answer source',
    previewTitle: 'ARR Cohort Workbook',
    previewLines: [
      'Monthly logo churn by SMB, mid-market, and enterprise cohort',
      'LTM net revenue retention and gross revenue retention summary',
      'Analyst note: cite aggregate cohort metrics only',
    ],
    folderPath: ['Project Silverstar', 'Commercial', 'ARR and churn'],
    categoryPath: 'Finance / Revenue and ARR',
  },
  {
    id: 'wb-customer-concentration',
    index: '4.2.2',
    name: 'Customer Concentration Schedule.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Round 1 permitted',
    categoryId: 'marketing-sales',
    childCategoryId: 'marketing-top-customers',
    pages: 18,
    size: '3.9 MB',
    uploadedBy: 'Commercial diligence team',
    updatedAt: 'Jun 26, 2026',
    status: 'Cited answer source',
    previewTitle: 'Customer Concentration Schedule',
    previewLines: [
      'Top 50 customer revenue and renewal status',
      'Cohort renewal commentary by segment',
      'No customer names in generated answer without approval',
    ],
    folderPath: ['Project Silverstar', 'Commercial', 'Customers'],
    categoryPath: 'Marketing & Sales / Top customers',
  },
  {
    id: 'wb-source-code-policy',
    index: '6.1.4',
    name: 'Source Code Access Policy.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Restricted disclosure',
    categoryId: 'legal',
    childCategoryId: 'legal-ip',
    pages: 11,
    size: '1.7 MB',
    uploadedBy: 'Product counsel',
    updatedAt: 'Jun 24, 2026',
    status: 'Restricted',
    previewTitle: 'Source Code Access Policy',
    previewLines: [
      'GitHub Enterprise repository access model',
      'SSO, branch protection, and audit logging controls',
      'Confirmatory diligence release requires legal approval',
    ],
    folderPath: ['Project Silverstar', 'Technology', 'Source code'],
    categoryPath: 'Legal / Intellectual property',
  },
  {
    id: 'wb-open-source-register',
    index: '6.2.1',
    name: 'Open Source Register.xlsx',
    kind: 'file',
    fileType: 'xlsx',
    meta: 'Round 1 permitted',
    categoryId: 'legal',
    childCategoryId: 'legal-ip',
    pages: 7,
    size: '1.2 MB',
    uploadedBy: 'Engineering operations',
    updatedAt: 'Jun 21, 2026',
    status: 'Cited answer source',
    previewTitle: 'Open Source Register',
    previewLines: [
      'Production dependency inventory by service',
      'License type, obligation, and review owner',
      'No unresolved copyleft exposure flagged',
    ],
    folderPath: ['Project Silverstar', 'Technology', 'Open source'],
    categoryPath: 'Legal / Intellectual property',
  },
  {
    id: 'wb-oss-legal-memo',
    index: '6.2.2',
    name: 'OSS Legal Review Memo.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Legal reviewed',
    categoryId: 'legal',
    childCategoryId: 'legal-ip',
    pages: 6,
    size: '980 KB',
    uploadedBy: 'Product counsel',
    updatedAt: 'Jun 22, 2026',
    status: 'Cited answer source',
    previewTitle: 'OSS Legal Review Memo',
    previewLines: [
      'Counsel summary of license obligations',
      'No unresolved copyleft obligations in core platform',
      'Review cadence and owner list',
    ],
    folderPath: ['Project Silverstar', 'Legal', 'IP'],
    categoryPath: 'Legal / Intellectual property',
  },
  {
    id: 'wb-repository-scan',
    index: '6.2.3',
    name: 'Repository Dependency Scan.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Engineering export',
    categoryId: 'operational-information',
    childCategoryId: 'operations-platform',
    pages: 23,
    size: '4.1 MB',
    uploadedBy: 'Engineering operations',
    updatedAt: 'Jun 22, 2026',
    status: 'Cited answer source',
    previewTitle: 'Repository Dependency Scan',
    previewLines: [
      'Dependency scan by production repository',
      'High-risk licenses reviewed by counsel',
      'No critical unresolved license findings',
    ],
    folderPath: ['Project Silverstar', 'Technology', 'Open source'],
    categoryPath: 'Operational Information / Platform operations',
  },
  {
    id: 'wb-soc2-report',
    index: '7.1.1',
    name: 'SOC 2 Type II Summary.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Round 1 permitted',
    categoryId: 'operational-information',
    childCategoryId: 'operations-risk',
    pages: 32,
    size: '5.8 MB',
    uploadedBy: 'Security lead',
    updatedAt: 'Jun 18, 2026',
    status: 'Cited answer source',
    previewTitle: 'SOC 2 Type II Summary',
    previewLines: [
      'Control environment and audit period summary',
      'No exceptions in access management controls',
      'Detailed appendices remain restricted',
    ],
    folderPath: ['Project Silverstar', 'Cybersecurity', 'SOC 2'],
    categoryPath: 'Operational Information / Risk controls',
  },
  {
    id: 'wb-dpa-summary',
    index: '7.2.1',
    name: 'DPA and GDPR Summary.pdf',
    kind: 'file',
    fileType: 'pdf',
    meta: 'Round 1 permitted',
    categoryId: 'legal',
    childCategoryId: 'legal-material-agreements',
    pages: 14,
    size: '2.2 MB',
    uploadedBy: 'Privacy counsel',
    updatedAt: 'Jun 17, 2026',
    status: 'Cited answer source',
    previewTitle: 'DPA and GDPR Summary',
    previewLines: [
      'Customer DPA template summary',
      'GDPR processor and subprocessor position',
      'Penetration test detail requires restricted access',
    ],
    folderPath: ['Project Silverstar', 'Legal', 'Privacy'],
    categoryPath: 'Legal / Material agreements',
  },
];

export function getQaTriageItem(itemId: string | null | undefined) {
  if (!itemId) return QA_TRIAGE_ITEMS[0];
  return QA_TRIAGE_ITEMS.find((item) => item.id === itemId) ?? QA_TRIAGE_ITEMS[0];
}
