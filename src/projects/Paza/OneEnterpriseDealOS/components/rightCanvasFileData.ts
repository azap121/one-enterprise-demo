// Stifel scaffold placeholder tree. QUARTET(P1/P6): reshape this index to the real Stifel
// room profile (folder depth, doc counts, bidder-group structure) once telemetry lands.
export type SellerFileType = 'pdf' | 'xlsx' | 'docx' | 'pptx';

export type SellerIndexFileNode = {
  id: string;
  index: string;
  name: string;
  kind: 'file';
  fileType: SellerFileType;
  meta: string;
  categoryId: string;
  childCategoryId: string;
  pages: number;
  size: string;
  uploadedBy: string;
  updatedAt: string;
  status: string;
  previewTitle: string;
  previewLines: string[];
};

export type SellerIndexFolderNode = {
  id: string;
  index: string;
  name: string;
  kind: 'folder';
  children: SellerIndexNode[];
};

export type SellerIndexNode = SellerIndexFolderNode | SellerIndexFileNode;

export type SellerIndexFile = SellerIndexFileNode & {
  folderPath: string[];
  categoryPath: string;
};

export type SellerIndexFolder = {
  id: string;
  index: string;
  name: string;
  folderPath: string[];
};

export type SellerIndexSource = {
  title: string;
  subtitle: string;
  tree: SellerIndexNode[];
  files: SellerIndexFile[];
  folders: SellerIndexFolder[];
};

export type DocumentChildCategory = {
  id: string;
  name: string;
};

export type DocumentParentCategory = {
  id: string;
  name: string;
  children: DocumentChildCategory[];
};

export const DOCUMENT_CATEGORIES: DocumentParentCategory[] = [
  {
    id: 'accounting',
    name: 'Accounting',
    children: [
      { id: 'accounting-policies', name: 'Policies and procedures' },
      { id: 'accounting-working-papers', name: 'Working papers' },
      { id: 'accounting-reconciliations', name: 'Reconciliations' },
    ],
  },
  {
    id: 'closing-documents',
    name: 'Closing Documents',
    children: [
      { id: 'closing-signatures', name: 'Signature pages' },
      { id: 'closing-certificates', name: 'Officer certificates' },
      { id: 'closing-deliverables', name: 'Closing deliverables' },
    ],
  },
  {
    id: 'esg',
    name: 'Environmental, Social & Governance (ESG)',
    children: [
      { id: 'esg-policies', name: 'Policies' },
      { id: 'esg-reporting', name: 'Reporting' },
      { id: 'esg-supplier', name: 'Supplier standards' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    children: [
      { id: 'finance-audited-financials', name: 'Audited financials' },
      { id: 'finance-forecast', name: 'Forecast model' },
      { id: 'finance-revenue', name: 'Revenue and ARR' },
      { id: 'finance-board-plan', name: 'Board plan' },
    ],
  },
  {
    id: 'general-information',
    name: 'General Information',
    children: [
      { id: 'general-company-overview', name: 'Company overview' },
      { id: 'general-board-materials', name: 'Board materials' },
      { id: 'general-org-chart', name: 'Organization chart' },
    ],
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    children: [
      { id: 'hr-headcount', name: 'Headcount' },
      { id: 'hr-compensation', name: 'Compensation' },
      { id: 'hr-benefits', name: 'Benefits' },
    ],
  },
  {
    id: 'legal',
    name: 'Legal',
    children: [
      { id: 'legal-corporate-formation', name: 'Corporate formation' },
      { id: 'legal-board-approvals', name: 'Board approvals' },
      { id: 'legal-material-agreements', name: 'Material agreements' },
      { id: 'legal-ip', name: 'Intellectual property' },
    ],
  },
  {
    id: 'marketing-sales',
    name: 'Marketing & Sales',
    children: [
      { id: 'marketing-top-customers', name: 'Top customers' },
      { id: 'marketing-pipeline', name: 'Pipeline and renewals' },
      { id: 'marketing-partners', name: 'Partner agreements' },
    ],
  },
  {
    id: 'operational-information',
    name: 'Operational Information',
    children: [
      { id: 'operations-platform', name: 'Platform operations' },
      { id: 'operations-risk', name: 'Risk controls' },
      { id: 'operations-vendors', name: 'Vendors' },
    ],
  },
  {
    id: 'property-assets',
    name: 'Property & Other Assets',
    children: [
      { id: 'assets-fixed', name: 'Fixed assets' },
      { id: 'assets-leases', name: 'Leases' },
      { id: 'assets-insurance', name: 'Insurance' },
    ],
  },
  {
    id: 'tax',
    name: 'Tax',
    children: [
      { id: 'tax-returns', name: 'Returns' },
      { id: 'tax-nols', name: 'NOLs and credits' },
      { id: 'tax-jurisdictions', name: 'Jurisdictions' },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    children: [
      { id: 'other-archive', name: 'Archive' },
      { id: 'other-reference', name: 'Reference' },
      { id: 'other-unclassified', name: 'Unclassified' },
    ],
  },
];

export const SELLER_INDEX_TREE: SellerIndexNode[] = [
  {
    id: 'corporate',
    index: '1',
    name: 'Corporate',
    kind: 'folder',
    children: [
      {
        id: 'corporate-formation',
        index: '1.1',
        name: 'Formation',
        kind: 'folder',
        children: [
          {
            id: 'corporate-formation-certificates',
            index: '1.1.1',
            name: 'Certificates',
            kind: 'folder',
            children: [
              {
                id: 'incorporation',
                index: '1.1.1.1',
                name: 'Certificate of Incorporation.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Seller uploaded',
                categoryId: 'legal',
                childCategoryId: 'legal-corporate-formation',
                pages: 12,
                size: '1.8 MB',
                uploadedBy: 'Seller legal team',
                updatedAt: 'May 28, 2026',
                status: 'Seller uploaded',
                previewTitle: 'Certificate of Incorporation',
                previewLines: ['Nimbus Cloud Systems, Inc.', 'Delaware filing number 7718424', 'Authorized shares and registered agent summary'],
              },
              {
                id: 'foreign-qualification',
                index: '1.1.1.2',
                name: 'Foreign Qualification Register.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: '48 states',
                categoryId: 'legal',
                childCategoryId: 'legal-corporate-formation',
                pages: 5,
                size: '824 KB',
                uploadedBy: 'Corporate secretary',
                updatedAt: 'May 30, 2026',
                status: '48 states',
                previewTitle: 'Foreign Qualification Register',
                previewLines: ['State', 'Registration ID', 'Standing', 'Next filing date'],
              },
            ],
          },
          {
            id: 'corporate-board',
            index: '1.1.2',
            name: 'Board approvals',
            kind: 'folder',
            children: [
              {
                id: 'board-minutes',
                index: '1.1.2.1',
                name: 'Board Minutes FY2025.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Approved',
                categoryId: 'legal',
                childCategoryId: 'legal-board-approvals',
                pages: 24,
                size: '3.1 MB',
                uploadedBy: 'Board operations',
                updatedAt: 'Jun 4, 2026',
                status: 'Approved',
                previewTitle: 'Board Minutes FY2025',
                previewLines: ['Quarterly meeting minutes', 'Equity plan approvals', 'M&A authorization language'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'financials',
    index: '2',
    name: 'Financials',
    kind: 'folder',
    children: [
      {
        id: 'financials-revenue',
        index: '2.1',
        name: 'Revenue',
        kind: 'folder',
        children: [
          {
            id: 'financials-arr',
            index: '2.1.1',
            name: 'ARR and cohorts',
            kind: 'folder',
            children: [
              {
                id: 'arr-bridge',
                index: '2.1.1.1',
                name: 'ARR Bridge FY2024.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: '$842M ending ARR',
                categoryId: 'finance',
                childCategoryId: 'finance-revenue',
                pages: 8,
                size: '2.4 MB',
                uploadedBy: 'Finance',
                updatedAt: 'Jun 8, 2026',
                status: '$842M ending ARR',
                previewTitle: 'ARR Bridge FY2024',
                previewLines: ['Opening ARR', 'New logo ARR', 'Expansion ARR', 'Churn and contraction'],
              },
              {
                id: 'cohort-retention',
                index: '2.1.1.2',
                name: 'Enterprise Cohort Retention.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Board version',
                categoryId: 'finance',
                childCategoryId: 'finance-revenue',
                pages: 18,
                size: '2.9 MB',
                uploadedBy: 'Revenue operations',
                updatedAt: 'Jun 7, 2026',
                status: 'Board version',
                previewTitle: 'Enterprise Cohort Retention',
                previewLines: ['Cohort retention methodology', 'FY2022-FY2025 retention trends', 'Enterprise segment commentary'],
              },
            ],
          },
        ],
      },
      {
        id: 'financials-forecast',
        index: '2.2',
        name: 'Forecast model',
        kind: 'folder',
        children: [
          {
            id: 'financials-board-plan',
            index: '2.2.1',
            name: 'Board plan',
            kind: 'folder',
            children: [
              {
                id: 'board-plan',
                index: '2.2.1.1',
                name: 'FY2026 Board Plan.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: 'Management case',
                categoryId: 'finance',
                childCategoryId: 'finance-board-plan',
                pages: 10,
                size: '4.6 MB',
                uploadedBy: 'FP&A',
                updatedAt: 'Jun 10, 2026',
                status: 'Management case',
                previewTitle: 'FY2026 Board Plan',
                previewLines: ['Bookings plan', 'Gross margin outlook', 'Cash burn and runway', 'Headcount plan'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'technology',
    index: '3',
    name: 'Technology',
    kind: 'folder',
    children: [
      {
        id: 'technology-platform',
        index: '3.1',
        name: 'Platform architecture',
        kind: 'folder',
        children: [
          {
            id: 'technology-edge',
            index: '3.1.1',
            name: 'Edge network',
            kind: 'folder',
            children: [
              {
                id: 'edge-architecture',
                index: '3.1.1.1',
                name: 'Global Edge Architecture.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Buyer requested',
                categoryId: 'operational-information',
                childCategoryId: 'operations-platform',
                pages: 31,
                size: '6.2 MB',
                uploadedBy: 'Platform engineering',
                updatedAt: 'Jun 12, 2026',
                status: 'Buyer requested',
                previewTitle: 'Global Edge Architecture',
                previewLines: ['Regional edge topology', 'Cache invalidation flow', 'Multi-region failover process'],
              },
              {
                id: 'latency-benchmark',
                index: '3.1.1.2',
                name: 'Latency Benchmark Results.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: 'P95 by region',
                categoryId: 'operational-information',
                childCategoryId: 'operations-platform',
                pages: 6,
                size: '1.2 MB',
                uploadedBy: 'Performance team',
                updatedAt: 'Jun 12, 2026',
                status: 'P95 by region',
                previewTitle: 'Latency Benchmark Results',
                previewLines: ['Region', 'Median latency', 'P95 latency', 'Error budget usage'],
              },
            ],
          },
          {
            id: 'technology-runtime',
            index: '3.1.2',
            name: 'Serverless runtime',
            kind: 'folder',
            children: [
              {
                id: 'runtime-overview',
                index: '3.1.2.1',
                name: 'Runtime Control Plane Overview.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Clean room ready',
                categoryId: 'operational-information',
                childCategoryId: 'operations-platform',
                pages: 22,
                size: '4.9 MB',
                uploadedBy: 'Infrastructure',
                updatedAt: 'Jun 13, 2026',
                status: 'Clean room ready',
                previewTitle: 'Runtime Control Plane Overview',
                previewLines: ['Deployment orchestration', 'Tenant isolation model', 'Control plane observability'],
              },
            ],
          },
        ],
      },
      {
        id: 'technology-security',
        index: '3.2',
        name: 'Security',
        kind: 'folder',
        children: [
          {
            id: 'technology-certifications',
            index: '3.2.1',
            name: 'Certifications',
            kind: 'folder',
            children: [
              {
                id: 'soc2',
                index: '3.2.1.1',
                name: 'SOC 2 Type II Report.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Current period',
                categoryId: 'operational-information',
                childCategoryId: 'operations-risk',
                pages: 64,
                size: '8.8 MB',
                uploadedBy: 'Security compliance',
                updatedAt: 'Jun 14, 2026',
                status: 'Current period',
                previewTitle: 'SOC 2 Type II Report',
                previewLines: ['Independent service auditor report', 'Control environment summary', 'Testing period through March 31, 2026'],
              },
              {
                id: 'iso',
                index: '3.2.1.2',
                name: 'ISO 27001 Certificate.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Expires 2027',
                categoryId: 'operational-information',
                childCategoryId: 'operations-risk',
                pages: 3,
                size: '740 KB',
                uploadedBy: 'Security compliance',
                updatedAt: 'Jun 14, 2026',
                status: 'Expires 2027',
                previewTitle: 'ISO 27001 Certificate',
                previewLines: ['Certificate scope', 'Cloud platform operations', 'Valid through September 2027'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'product',
    index: '4',
    name: 'Product',
    kind: 'folder',
    children: [
      {
        id: 'product-roadmap',
        index: '4.1',
        name: 'Roadmap',
        kind: 'folder',
        children: [
          {
            id: 'product-ai-platform',
            index: '4.1.1',
            name: 'AI platform',
            kind: 'folder',
            children: [
              {
                id: 'ai-roadmap',
                index: '4.1.1.1',
                name: 'AI Roadmap H2.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Under NDA',
                categoryId: 'general-information',
                childCategoryId: 'general-company-overview',
                pages: 19,
                size: '3.7 MB',
                uploadedBy: 'Product leadership',
                updatedAt: 'Jun 11, 2026',
                status: 'Under NDA',
                previewTitle: 'AI Roadmap H2',
                previewLines: ['Inference cost roadmap', 'Enterprise governance milestones', 'Assistant workflow strategy'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'customers',
    index: '5',
    name: 'Customers',
    kind: 'folder',
    children: [
      {
        id: 'customers-enterprise',
        index: '5.1',
        name: 'Enterprise accounts',
        kind: 'folder',
        children: [
          {
            id: 'customers-top',
            index: '5.1.1',
            name: 'Top customers',
            kind: 'folder',
            children: [
              {
                id: 'top-contracts',
                index: '5.1.1.1',
                name: 'Top 50 Customer Contracts.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: 'Redacted',
                categoryId: 'marketing-sales',
                childCategoryId: 'marketing-top-customers',
                pages: 7,
                size: '1.9 MB',
                uploadedBy: 'Sales operations',
                updatedAt: 'Jun 9, 2026',
                status: 'Redacted',
                previewTitle: 'Top 50 Customer Contracts',
                previewLines: ['Customer', 'Segment', 'ARR', 'Renewal date', 'Change-of-control flag'],
              },
              {
                id: 'renewals',
                index: '5.1.1.2',
                name: 'Renewal Pipeline FY2026.xlsx',
                kind: 'file',
                fileType: 'xlsx',
                meta: '$312M gross',
                categoryId: 'marketing-sales',
                childCategoryId: 'marketing-pipeline',
                pages: 9,
                size: '2.2 MB',
                uploadedBy: 'Revenue operations',
                updatedAt: 'Jun 9, 2026',
                status: '$312M gross',
                previewTitle: 'Renewal Pipeline FY2026',
                previewLines: ['Renewal quarter', 'Gross ARR', 'Expansion opportunity', 'Risk rating'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'legal',
    index: '6',
    name: 'Legal',
    kind: 'folder',
    children: [
      {
        id: 'legal-agreements',
        index: '6.1',
        name: 'Material agreements',
        kind: 'folder',
        children: [
          {
            id: 'legal-cloud-providers',
            index: '6.1.1',
            name: 'Cloud providers',
            kind: 'folder',
            children: [
              {
                id: 'aws-agreement',
                index: '6.1.1.1',
                name: 'AWS Enterprise Agreement.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Expires 2028',
                categoryId: 'legal',
                childCategoryId: 'legal-material-agreements',
                pages: 38,
                size: '5.1 MB',
                uploadedBy: 'Legal operations',
                updatedAt: 'Jun 6, 2026',
                status: 'Expires 2028',
                previewTitle: 'AWS Enterprise Agreement',
                previewLines: ['Enterprise discount schedule', 'Data processing addendum', 'Termination assistance clause'],
              },
              {
                id: 'datadog-agreement',
                index: '6.1.1.2',
                name: 'Datadog Master Services Agreement.pdf',
                kind: 'file',
                fileType: 'pdf',
                meta: 'Renewal option',
                categoryId: 'legal',
                childCategoryId: 'legal-material-agreements',
                pages: 27,
                size: '3.6 MB',
                uploadedBy: 'Legal operations',
                updatedAt: 'Jun 6, 2026',
                status: 'Renewal option',
                previewTitle: 'Datadog Master Services Agreement',
                previewLines: ['Order form summary', 'SLA credits', 'Auto-renewal and notice periods'],
              },
            ],
          },
        ],
      },
      {
        id: 'legal-intellectual-property',
        index: '6.2',
        name: 'Intellectual property',
        kind: 'folder',
        children: [
          {
            id: 'ip-portfolio-summary',
            index: '6.2.1',
            name: 'IP Portfolio Summary.pdf',
            kind: 'file',
            fileType: 'pdf',
            meta: 'Seller uploaded',
            categoryId: 'legal',
            childCategoryId: 'legal-ip',
            pages: 22,
            size: '2.8 MB',
            uploadedBy: 'Legal operations',
            updatedAt: 'Jun 7, 2026',
            status: 'Seller uploaded',
            previewTitle: 'IP Portfolio Summary',
            previewLines: ['Patent family schedule', 'Trademark ownership summary', 'Open-source disclosure reference'],
          },
          {
            id: 'open-source-register',
            index: '6.2.2',
            name: 'Open-source Register.xlsx',
            kind: 'file',
            fileType: 'xlsx',
            meta: 'Copyleft review',
            categoryId: 'legal',
            childCategoryId: 'legal-ip',
            pages: 12,
            size: '1.4 MB',
            uploadedBy: 'Legal operations',
            updatedAt: 'Jun 8, 2026',
            status: 'Review requested',
            previewTitle: 'Open-source Register',
            previewLines: ['Production copyleft dependencies', 'License remediation notes', 'Repository owners'],
          },
          {
            id: 'patent-assignment-schedule',
            index: '6.2.3',
            name: 'Patent Assignment Schedule.pdf',
            kind: 'file',
            fileType: 'pdf',
            meta: 'Inventor evidence gap',
            categoryId: 'legal',
            childCategoryId: 'legal-ip',
            pages: 18,
            size: '3.2 MB',
            uploadedBy: 'Legal operations',
            updatedAt: 'Jun 8, 2026',
            status: '2 missing assignments',
            previewTitle: 'Patent Assignment Schedule',
            previewLines: ['Inventor assignment evidence', 'Filing jurisdiction list', 'Missing execution copies'],
          },
        ],
      },
    ],
  },
];

export const SELLER_INDEX_FOLDERS = collectFolders(SELLER_INDEX_TREE);
export const SELLER_FILES = collectFiles(SELLER_INDEX_TREE);
export const SELLER_INDEX_SOURCE: SellerIndexSource = {
  title: 'Documents',
  subtitle: 'Permitted Project Aldgate technology M&A materials',
  tree: SELLER_INDEX_TREE,
  files: SELLER_FILES,
  folders: SELLER_INDEX_FOLDERS,
};

let runtimeSellerFiles: SellerIndexFile[] = [];

export function registerRuntimeSellerFiles(files: SellerIndexFile[]) {
  runtimeSellerFiles = files;
}

export function createSellerIndexSource({
  title,
  subtitle,
  tree,
}: {
  title: string;
  subtitle: string;
  tree: SellerIndexNode[];
}): SellerIndexSource {
  return {
    title,
    subtitle,
    tree,
    files: collectFiles(tree),
    folders: collectFolders(tree),
  };
}

export function findSellerFileById(fileId: string) {
  return SELLER_FILES.find((file) => file.id === fileId)
    ?? runtimeSellerFiles.find((file) => file.id === fileId)
    ?? null;
}

export function findSellerFolderById(folderId: string, source: SellerIndexSource = SELLER_INDEX_SOURCE) {
  return source.folders.find((folder) => folder.id === folderId) ?? null;
}

export function findSellerFolderNodeById(folderId: string, nodes: SellerIndexNode[] = SELLER_INDEX_TREE): SellerIndexFolderNode | null {
  for (const node of nodes) {
    if (node.kind === 'file') continue;
    if (node.id === folderId) return node;
    const childMatch = findSellerFolderNodeById(folderId, node.children);
    if (childMatch) return childMatch;
  }
  return null;
}

export function findSellerContainingFolderId(fileId: string, nodes: SellerIndexNode[] = SELLER_INDEX_TREE, parentFolderId: string | null = null): string | null {
  for (const node of nodes) {
    if (node.kind === 'file') {
      if (node.id === fileId) return parentFolderId;
      continue;
    }

    const childMatch = findSellerContainingFolderId(fileId, node.children, node.id);
    if (childMatch) return childMatch;
  }

  return null;
}

export function getFilesForFolderId(folderId: string, source: SellerIndexSource = SELLER_INDEX_SOURCE) {
  const folderNode = findSellerFolderNodeById(folderId, source.tree);
  const folder = findSellerFolderById(folderId, source);
  if (!folderNode || !folder) return [];
  return collectFiles(folderNode.children, [...folder.folderPath, folder.name]);
}

export function getCategoryParent(categoryId: string) {
  return DOCUMENT_CATEGORIES.find((category) => category.id === categoryId) ?? null;
}

export function getCategoryChild(childCategoryId: string) {
  for (const parent of DOCUMENT_CATEGORIES) {
    const child = parent.children.find((item) => item.id === childCategoryId);
    if (child) return { parent, child };
  }
  return null;
}

export function getCategoryPath(file: Pick<SellerIndexFileNode, 'categoryId' | 'childCategoryId'>) {
  const match = getCategoryChild(file.childCategoryId);
  if (match) return `${match.parent.name} / ${match.child.name}`;
  return getCategoryParent(file.categoryId)?.name ?? 'Uncategorized';
}

export function getChildCategoryIds(parentId: string) {
  return getCategoryParent(parentId)?.children.map((child) => child.id) ?? [];
}

export function getCategoryCounts(files: SellerIndexFile[] = SELLER_FILES) {
  return files.reduce<Record<string, number>>((counts, file) => {
    counts[file.categoryId] = (counts[file.categoryId] ?? 0) + 1;
    counts[file.childCategoryId] = (counts[file.childCategoryId] ?? 0) + 1;
    return counts;
  }, {});
}

function collectFiles(nodes: SellerIndexNode[], folderPath: string[] = []): SellerIndexFile[] {
  return nodes.flatMap((node) => {
    if (node.kind === 'file') {
      return [
        {
          ...node,
          folderPath,
          categoryPath: getCategoryPath(node),
        },
      ];
    }

    return collectFiles(node.children, [...folderPath, node.name]);
  });
}

function collectFolders(nodes: SellerIndexNode[], folderPath: string[] = []): SellerIndexFolder[] {
  return nodes.flatMap((node) => {
    if (node.kind === 'file') return [];

    return [
      {
        id: node.id,
        index: node.index,
        name: node.name,
        folderPath,
      },
      ...collectFolders(node.children, [...folderPath, node.name]),
    ];
  });
}
