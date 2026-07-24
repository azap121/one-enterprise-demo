import type { CompositedNode } from '../lib/compositeTree';
import {
  createSellerIndexSource,
  type SellerFileType,
  type SellerIndexNode,
  type SellerIndexSource,
} from './rightCanvasFileData';

type CategoryMatch = {
  categoryId: string;
  childCategoryId: string;
};

const DEFAULT_CATEGORY: CategoryMatch = {
  categoryId: 'other',
  childCategoryId: 'other-unclassified',
};

export function createAppliedFilesSource(nodes: CompositedNode[]): SellerIndexSource {
  const tree = nodes
    .map((node, index) => toSellerIndexNode(node, String(index + 1), []))
    .filter((node): node is SellerIndexNode => Boolean(node));

  return createSellerIndexSource({
    title: 'Files',
    subtitle: 'Project Aldgate / Sandbox workspace - updated structure',
    tree,
  });
}

function toSellerIndexNode(
  node: CompositedNode,
  index: string,
  folderPath: string[]
): SellerIndexNode | null {
  if (node.removed || node.actionTypes?.includes('move-source')) return null;

  const name = node.proposedName ?? node.name;

  if (node.kind === 'folder') {
    const children = (node.children ?? [])
      .map((child, childIndex) => toSellerIndexNode(child, `${index}.${childIndex + 1}`, [...folderPath, name]))
      .filter((child): child is SellerIndexNode => Boolean(child));

    return {
      id: `applied-${node.id}`,
      index,
      name,
      kind: 'folder',
      children,
    };
  }

  const category = inferCategory([...folderPath, name]);
  const fileType = inferFileType(name, node.fileExt);
  const stats = inferStats(fileType, index);
  const status = inferStatus(node);

  return {
    id: `applied-${node.id}`,
    index,
    name,
    kind: 'file',
    fileType,
    meta: status,
    categoryId: category.categoryId,
    childCategoryId: category.childCategoryId,
    pages: stats.pages,
    size: stats.size,
    uploadedBy: 'Project Aldgate workspace',
    updatedAt: 'Jun 18, 2026',
    status,
    previewTitle: stripExtension(name),
    previewLines: [
      folderPath.length > 0 ? `Saved in ${folderPath.join(' / ')}` : 'Saved at workspace root',
      node.reason ?? 'Carried forward into the updated sandbox structure',
      'Available from the Files tab after Update structure',
    ],
  };
}

function inferCategory(pathParts: string[]): CategoryMatch {
  const text = pathParts.join(' ').toLowerCase();

  if (text.includes('audited financial')) return { categoryId: 'finance', childCategoryId: 'finance-audited-financials' };
  if (text.includes('budget') || text.includes('forecast')) return { categoryId: 'finance', childCategoryId: 'finance-forecast' };
  if (text.includes('financial') || text.includes('q1') || text.includes('q2') || text.includes('q3')) {
    return { categoryId: 'finance', childCategoryId: 'finance-revenue' };
  }
  if (text.includes('tax') || text.includes('return') || text.includes('filing')) return { categoryId: 'tax', childCategoryId: 'tax-returns' };
  if (text.includes('human resources') || text.includes('employee') || text.includes('team roster') || text.includes('benefits')) {
    return { categoryId: 'human-resources', childCategoryId: 'hr-headcount' };
  }
  if (text.includes('insurance') || text.includes('policy') || text.includes('claims')) {
    return { categoryId: 'property-assets', childCategoryId: 'assets-insurance' };
  }
  if (text.includes('msa') || text.includes('nda') || text.includes('contract') || text.includes('shareholder')) {
    return { categoryId: 'legal', childCategoryId: 'legal-material-agreements' };
  }
  if (text.includes('certificate') || text.includes('bylaws') || text.includes('litigation') || text.includes('legal')) {
    return { categoryId: 'legal', childCategoryId: 'legal-corporate-formation' };
  }
  if (text.includes('ip') || text.includes('architecture') || text.includes('technology') || text.includes('security') || text.includes('compliance')) {
    return { categoryId: 'operational-information', childCategoryId: text.includes('security') ? 'operations-risk' : 'operations-platform' };
  }
  if (text.includes('customer') || text.includes('sales') || text.includes('pricing') || text.includes('channel') || text.includes('marketing')) {
    return { categoryId: 'marketing-sales', childCategoryId: text.includes('customer') ? 'marketing-top-customers' : 'marketing-pipeline' };
  }
  if (text.includes('diligence') || text.includes('cim') || text.includes('management presentation') || text.includes('q&a')) {
    return { categoryId: 'general-information', childCategoryId: 'general-company-overview' };
  }
  if (text.includes('archive')) return { categoryId: 'other', childCategoryId: 'other-archive' };
  if (text.includes('reference')) return { categoryId: 'other', childCategoryId: 'other-reference' };

  return DEFAULT_CATEGORY;
}

function inferFileType(name: string, fileExt?: CompositedNode['fileExt']): SellerFileType {
  if (fileExt === 'pdf' || name.endsWith('.pdf')) return 'pdf';
  if (fileExt === 'xlsx' || name.endsWith('.xlsx')) return 'xlsx';
  if (fileExt === 'pptx' || name.endsWith('.pptx')) return 'pptx';
  return 'docx';
}

function inferStats(fileType: SellerFileType, index: string) {
  const indexTotal = index
    .split('.')
    .map((part) => Number(part))
    .filter((part) => Number.isFinite(part))
    .reduce((sum, part) => sum + part, 0);

  if (fileType === 'xlsx') {
    return {
      pages: 4 + (indexTotal % 5),
      size: `${(1.1 + (indexTotal % 5) * 0.4).toFixed(1)} MB`,
    };
  }

  if (fileType === 'pptx') {
    return {
      pages: 10 + (indexTotal % 9),
      size: `${(2.0 + (indexTotal % 5) * 0.5).toFixed(1)} MB`,
    };
  }

  return {
    pages: 8 + (indexTotal % 18),
    size: `${(1.4 + (indexTotal % 6) * 0.6).toFixed(1)} MB`,
  };
}

function inferStatus(node: CompositedNode) {
  if (node.actionTypes?.includes('move-dest')) return 'Moved in update';
  if (node.actionTypes?.includes('rename')) return 'Renamed in update';
  if (node.isProposed) return 'Added in update';
  return 'Saved structure';
}

function stripExtension(name: string) {
  return name.replace(/\.(pdf|xlsx|docx|pptx)$/i, '');
}
