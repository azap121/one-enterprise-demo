import type { CompositedNode } from './compositeTree';

/**
 * Sandbox delete matrix (D1):
 * - Files: never
 * - Folders with children: never
 * - Empty folders: yes
 * Removed (tombstoned) rows expose Restore instead — handled in ActionButtonGroup.
 */
export function canDelete(node: CompositedNode): boolean {
  if (node.kind !== 'folder') return false;
  const hasChildren = Boolean(node.children && node.children.length > 0);
  return !hasChildren;
}
