import { Box } from '@mui/material';
import type { CompositedNode } from '../lib/compositeTree';
import type { ReviewScope } from '../state/types';
import ChangeTreeNode from './ChangeTreeNode';

interface Props {
  composited: CompositedNode[];
  scope: ReviewScope;
  focusedProposalId: string | null;
  onFocusProposal: (proposalId: string) => void;
  editingNodeId: string | null;
  pendingNewFolderNodeId: string | null;
  onBeginRename: (nodeId: string) => void;
  onCommitRename: (nodeId: string, newName: string) => void;
  onCancelRename: () => void;
  onBeginAddFolder: (anchorNodeId: string) => void;
  onCommitAddFolder: (anchorNodeId: string, name: string) => void;
  onCancelAddFolder: () => void;
  onSoftDelete: (nodeId: string) => void;
  onRestore: (nodeId: string) => void;
  collapsedNodeIds: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

export default function ChangeTree({
  composited,
  scope,
  focusedProposalId,
  onFocusProposal,
  editingNodeId,
  pendingNewFolderNodeId,
  onBeginRename,
  onCommitRename,
  onCancelRename,
  onBeginAddFolder,
  onCommitAddFolder,
  onCancelAddFolder,
  onSoftDelete,
  onRestore,
  collapsedNodeIds,
  onToggleExpand,
}: Props) {
  return (
    <Box role="tree" sx={{ py: 1 }}>
      {composited.map((node, i) => (
        <ChangeTreeNode
          key={node.id}
          node={node}
          level={0}
          displayIndex={String(i + 1)}
          posinset={i + 1}
          setsize={composited.length}
          scope={scope}
          focusedProposalId={focusedProposalId}
          onFocusProposal={onFocusProposal}
          editingNodeId={editingNodeId}
          pendingNewFolderNodeId={pendingNewFolderNodeId}
          onBeginRename={onBeginRename}
          onCommitRename={onCommitRename}
          onCancelRename={onCancelRename}
          onBeginAddFolder={onBeginAddFolder}
          onCommitAddFolder={onCommitAddFolder}
          onCancelAddFolder={onCancelAddFolder}
          onSoftDelete={onSoftDelete}
          onRestore={onRestore}
          collapsedNodeIds={collapsedNodeIds}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </Box>
  );
}
