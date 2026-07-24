import type { CompositedNode } from '../lib/compositeTree';
import { compositeTree } from '../lib/compositeTree';
import type { ChangeProposal, OverrideMap, PendingNewFolder, TreeNode } from './types';

export function applyOverrides(nodes: TreeNode[], overrides: OverrideMap): TreeNode[] {
  return nodes.map((node) => {
    const override = overrides[node.id];
    const children = node.children ? applyOverrides(node.children, overrides) : undefined;
    if (!override && children === node.children) return node;
    return {
      ...node,
      name: override?.name ?? node.name,
      removed: override?.removed ?? node.removed,
      children,
    };
  });
}

export function buildCompositedTree(
  tree: TreeNode[],
  proposals: ChangeProposal[],
  localProposals: ChangeProposal[],
  overrides: OverrideMap,
  pendingNewFolder: PendingNewFolder | null
) {
  const base = compositeTree(applyOverrides(tree, overrides), [...proposals, ...localProposals]);
  return pendingNewFolder ? injectPendingNewFolder(base, pendingNewFolder) : base;
}

export function findParentId(
  nodes: CompositedNode[],
  targetId: string,
  parentId = '__root__'
): string | null {
  for (const node of nodes) {
    if (node.id === targetId) return parentId;
    if (node.children) {
      const hit = findParentId(node.children, targetId, node.id);
      if (hit) return hit;
    }
  }
  return null;
}

export function findNodeById(nodes: CompositedNode[], id: string): CompositedNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const hit = findNodeById(node.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

export function injectPendingNewFolder(
  composited: CompositedNode[],
  pending: PendingNewFolder
): CompositedNode[] {
  const synthetic: CompositedNode = {
    id: '__pending-new-folder__',
    name: '',
    kind: 'folder',
    publishState: 'not-published',
    isProposed: true,
    actionTypes: ['add-folder'],
    children: [],
  };

  const visit = (nodes: CompositedNode[]): { changed: boolean; nodes: CompositedNode[] } => {
    let changed = false;
    const next: CompositedNode[] = [];
    for (const node of nodes) {
      if (pending.insertMode === 'child' && node.id === pending.anchorNodeId) {
        next.push({ ...node, children: [synthetic, ...(node.children ?? [])] });
        changed = true;
        continue;
      }

      let nextNode = node;
      if (node.children) {
        const childResult = visit(node.children);
        if (childResult.changed) {
          nextNode = { ...node, children: childResult.nodes };
          changed = true;
        }
      }
      next.push(nextNode);

      if (pending.insertMode === 'sibling' && node.id === pending.anchorNodeId) {
        next.push(synthetic);
        changed = true;
      }
    }
    return { changed, nodes: next };
  };

  const result = visit(composited);
  return result.changed ? result.nodes : [...composited, synthetic];
}

export function createUserAddFolderProposal(
  parentId: string,
  name: string,
  insertAfterNodeId?: string
): ChangeProposal {
  return {
    id: `usr-add-${crypto.randomUUID()}`,
    type: 'add-folder',
    name,
    parentId,
    insertAfterNodeId,
    parentPath: [],
    description: 'User-added folder',
  };
}
