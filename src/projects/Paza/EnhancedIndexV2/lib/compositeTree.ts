// apps/docs/app/prototypes/enhanced-index-v2/lib/compositeTree.ts
//
// Pure function. Given the original file-room tree and the AI proposals,
// produce a single render-ready CompositedNode[]. The algorithm is
// non-mutating: input tree is cloned, proposals are folded onto the clone
// or attached as synthetic children.
//
// Action mapping:
//   add-folder     → synthetic CompositedNode appended to its parent's children,
//                    isProposed: true, actionType: 'add-folder', proposalId set.
//   rename         → original node decorated with proposedName + actionType: 'rename'.
//   move           → source node gets actionType: 'move-source' + movedTo path.
//                    Destination parent gets a synthetic child with
//                    actionType: 'move-dest' + movedFrom path.

import type { ChangeProposal, NodeKind, PublishState, TreeNode } from '../state/types';

export interface CompositedNode {
  id: string;
  name: string;
  proposedName?: string;
  kind: NodeKind;
  publishState: PublishState;
  removed?: boolean;
  children?: CompositedNode[];
  actionTypes?: Array<'add-folder' | 'rename' | 'move-source' | 'move-dest'>;
  proposalIds?: string[];
  movedTo?: string[];
  movedFrom?: string[];
  isProposed?: boolean;
  fileExt?: 'pdf' | 'docx' | 'xlsx' | 'pptx';
  reason?: string;
}

function pushAction(
  n: CompositedNode,
  t: NonNullable<CompositedNode['actionTypes']>[number],
  pid: string
) {
  n.actionTypes = n.actionTypes ?? [];
  n.proposalIds = n.proposalIds ?? [];
  n.actionTypes.push(t);
  n.proposalIds.push(pid);
}

function cloneToComposited(n: TreeNode): CompositedNode {
  return {
    id: n.id,
    name: n.name,
    kind: n.kind,
    publishState: n.publishState,
    removed: n.removed,
    fileExt: n.fileExt,
    children: n.children ? n.children.map(cloneToComposited) : undefined,
  };
}

function findById(nodes: CompositedNode[], id: string): CompositedNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

export function compositeTree(
  originalTree: TreeNode[],
  proposals: ChangeProposal[]
): CompositedNode[] {
  // 1. Deep clone into CompositedNode shape.
  const composited: CompositedNode[] = originalTree.map(cloneToComposited);

  // 2. Apply renames first — they only decorate existing nodes.
  for (const p of proposals) {
    if (p.type !== 'rename') continue;
    const node = findById(composited, p.nodeId);
    if (!node) continue;
    node.proposedName = p.newName;
    pushAction(node, 'rename', p.id);
    node.reason = p.reason;
  }

  // 3. Apply moves. Mark source. Mark destination parent with a synthetic child.
  for (const p of proposals) {
    if (p.type !== 'move') continue;
    const source = findById(composited, p.nodeId);
    if (source) {
      pushAction(source, 'move-source', p.id);
      source.movedTo = p.toPath;
      source.reason = p.reason;
    }
    // Destination parent may be a real existing folder OR a synthetic
    // new-folder (toParentId === 'sug-<addFolderProposalId>'). Real-folder
    // case: attach a move-dest marker child under the existing folder.
    // Synthetic case: handled below in step 4 when the synthetic folder is created.
    const destParent = findById(composited, p.toParentId);
    if (destParent) {
      destParent.children = destParent.children ?? [];
      destParent.children.push({
        id: `move-dest-${p.id}`,
        name: p.nodeName,
        kind: p.nodeKind,
        publishState: source?.publishState ?? 'not-published',
        actionTypes: ['move-dest'],
        proposalIds: [p.id],
        movedFrom: p.fromPath,
        fileExt: source?.fileExt,
        reason: p.reason,
      });
    }
  }

  // 4. Apply add-folder proposals. Append synthetic node to parent's children
  //    (or to the top-level composited array if parentId === '__root__').
  //    After creation, attach any pending move-dest markers whose toParentId
  //    is this synthetic folder (toParentId === 'sug-' + add proposal id).
  for (const p of proposals) {
    if (p.type !== 'add-folder') continue;
    const isRootAdd = p.parentId === '__root__';
    const parent = isRootAdd ? null : findById(composited, p.parentId);
    if (!isRootAdd && !parent) continue;
    const syntheticId = `sug-${p.id}`;
    const synthetic: CompositedNode = {
      id: syntheticId,
      name: p.name,
      kind: 'folder',
      publishState: 'not-published',
      isProposed: true,
      actionTypes: ['add-folder'],
      proposalIds: [p.id],
      reason: p.description,
      children: [],
    };
    // Find any moves whose destination is this synthetic folder.
    for (const mp of proposals) {
      if (mp.type !== 'move') continue;
      if (mp.toParentId !== syntheticId) continue;
      const sourceForExt = findById(composited, mp.nodeId);
      synthetic.children!.push({
        id: `move-dest-${mp.id}`,
        name: mp.nodeName,
        kind: mp.nodeKind,
        publishState: sourceForExt?.publishState ?? 'not-published',
        actionTypes: ['move-dest'],
        proposalIds: [mp.id],
        movedFrom: mp.fromPath,
        fileExt: sourceForExt?.fileExt,
        reason: mp.reason,
      });
    }
    if (isRootAdd) {
      composited.push(synthetic);
    } else {
      parent!.children = parent!.children ?? [];
      parent!.children.push(synthetic);
    }
  }

  return composited;
}
