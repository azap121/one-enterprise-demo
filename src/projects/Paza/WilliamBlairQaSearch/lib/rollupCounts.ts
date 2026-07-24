// Rollup aggregation for collapsed parent rows.
// Walks descendants (excluding the node itself) and counts changes by category.
// Categories follow severity order: removed > rename > move > add-folder.

import type { CompositedNode } from './compositeTree';

export interface RollupCounts {
  removed: number;
  rename: number;
  move: number;
  addFolder: number;
  total: number;
  hasRemoval: boolean;
}

// Synthetic in-progress add-folder row injected during typing; never counts.
const PENDING_NEW_FOLDER_ID = '__pending-new-folder__';

function aggregate(
  roots: CompositedNode[],
  includeSelf: boolean,
): RollupCounts {
  let removed = 0;
  let rename = 0;
  let addFolder = 0;
  // Dedup move proposals: a single move shows as both source and dest;
  // if both live in the visited subtree, still one change.
  const moveIds = new Set<string>();

  const visit = (n: CompositedNode) => {
    if (n.id === PENDING_NEW_FOLDER_ID) return; // in-progress, not a real change
    if (n.removed) removed += 1;
    if (n.actionTypes && n.proposalIds) {
      for (let i = 0; i < n.actionTypes.length; i += 1) {
        const t = n.actionTypes[i];
        const pid = n.proposalIds[i];
        if (t === 'rename') rename += 1;
        else if (t === 'add-folder') addFolder += 1;
        else if ((t === 'move-source' || t === 'move-dest') && pid) moveIds.add(pid);
      }
    }
    if (n.children) {
      for (const c of n.children) visit(c);
    }
  };

  for (const r of roots) {
    if (includeSelf) visit(r);
    else if (r.children) for (const c of r.children) visit(c);
  }

  const move = moveIds.size;
  const total = removed + rename + move + addFolder;
  return { removed, rename, move, addFolder, total, hasRemoval: removed > 0 };
}

export function computeRollup(node: CompositedNode): RollupCounts {
  // Skip the node itself; count only descendants. Preserves prior behavior.
  return aggregate(node.children ?? [], true);
}

// Walks the entire composited forest (no synthetic parent needed).
// Used by ChangeSummaryBar for the top-of-tree stats line.
export function computeRollupAll(roots: CompositedNode[]): RollupCounts {
  return aggregate(roots, true);
}
