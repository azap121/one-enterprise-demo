import { useEffect, useMemo, useRef } from 'react';
import { Box } from '@mui/material';
import ChangeTree from './ChangeTree';
import FolderReviewHeader from './FolderReviewHeader';
import type { WorkspaceAction, WorkspaceState } from '../state/types';
import { selectCompositedTree } from '../state/reducer';
import { findNodeById } from '../state/selectors';
import type { CompositedNode } from '../lib/compositeTree';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  autoFocusDelayMs?: number;
  bottomInset?: number;
}

export default function FolderReviewWorkspace({ state, dispatch, autoFocusDelayMs = 0, bottomInset = 0 }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const applied = state.structureApplied;
  const composited = useMemo(() => selectCompositedTree(state), [state]);
  const pinnedAddTarget = useMemo(
    () => resolvePinnedAddTarget(composited, state.focusedProposalId),
    [composited, state.focusedProposalId]
  );

  useEffect(() => {
    const focusHeading = () => headingRef.current?.focus();
    if (autoFocusDelayMs <= 0) {
      focusHeading();
      return undefined;
    }

    const timer = window.setTimeout(focusHeading, autoFocusDelayMs);
    return () => window.clearTimeout(timer);
  }, [autoFocusDelayMs]);

  const beginRowAddFolder = (anchorNodeId: string) => {
    const anchor = findNodeById(composited, anchorNodeId);
    dispatch({
      type: 'BEGIN_ADD_FOLDER',
      anchorNodeId,
      mode: anchor?.kind === 'folder' ? 'child' : 'sibling',
    });
  };

  const beginPinnedAddFolder = () => {
    if (!pinnedAddTarget) return;
    dispatch({
      type: 'BEGIN_ADD_FOLDER',
      anchorNodeId: pinnedAddTarget.anchorNodeId,
      mode: 'sibling',
    });
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        p: 1,
        boxSizing: 'border-box',
      }}
    >
      <FolderReviewHeader
        headingRef={headingRef}
        addFolderDisabled={applied || !pinnedAddTarget}
        applied={applied}
        onAddFolder={beginPinnedAddFolder}
        onDiscard={() => dispatch({ type: 'DISCARD_CHANGES' })}
        onUpdate={() => dispatch({ type: 'BEGIN_UPDATE' })}
      />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          overscrollBehavior: 'contain',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            minWidth: 920,
            pb: bottomInset ? `${bottomInset}px` : 0,
            transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <ChangeTree
            composited={composited}
            scope={state.scope}
            focusedProposalId={state.focusedProposalId}
            onFocusProposal={(proposalId) => dispatch({ type: 'FOCUS_PROPOSAL', proposalId })}
            editingNodeId={state.editingNodeId}
            pendingNewFolderNodeId={state.pendingNewFolder ? '__pending-new-folder__' : null}
            onBeginRename={(nodeId) => dispatch({ type: 'BEGIN_RENAME', nodeId })}
            onCommitRename={(nodeId, name) => dispatch({ type: 'COMMIT_RENAME', nodeId, name })}
            onCancelRename={() => dispatch({ type: 'CANCEL_RENAME' })}
            onBeginAddFolder={beginRowAddFolder}
            onCommitAddFolder={(anchorNodeId, name) => dispatch({ type: 'COMMIT_ADD_FOLDER', anchorNodeId, name })}
            onCancelAddFolder={() => dispatch({ type: 'CANCEL_ADD_FOLDER' })}
            onSoftDelete={(nodeId) => dispatch({ type: 'SOFT_DELETE', nodeId })}
            onRestore={(nodeId) => dispatch({ type: 'RESTORE_NODE', nodeId })}
            collapsedNodeIds={new Set(state.collapsedNodeIds)}
            onToggleExpand={(nodeId) => dispatch({ type: 'TOGGLE_EXPAND', nodeId })}
            readOnly={applied}
          />
        </Box>
      </Box>
    </Box>
  );
}

function resolvePinnedAddTarget(composited: CompositedNode[], focusedProposalId: string | null) {
  const focusedNode = focusedProposalId ? findNodeByProposalId(composited, focusedProposalId) : null;
  const anchor = focusedNode ?? composited[composited.length - 1] ?? null;
  return anchor ? { anchorNodeId: anchor.id } : null;
}

function findNodeByProposalId(nodes: CompositedNode[], proposalId: string): CompositedNode | null {
  for (const node of nodes) {
    if (node.proposalIds?.includes(proposalId)) return node;
    if (node.children) {
      const hit = findNodeByProposalId(node.children, proposalId);
      if (hit) return hit;
    }
  }
  return null;
}
