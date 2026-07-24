import { useEffect, useMemo, useState } from 'react';
import { Backdrop, Box, Button, CircularProgress, Skeleton, Snackbar, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFolderPlus } from '@fortawesome/pro-light-svg-icons';
import type { Action, ChangeProposal, State, TreeNode } from '../state/types';
import { compositeTree, type CompositedNode } from '../lib/compositeTree';
import ChangeTree from './ChangeTree';
import ChangeSummaryBar, { countAffectedFolders } from './ChangeSummaryBar';
import EnhancedIndexHeader from './EnhancedIndexHeader';
import ScopeSwitchConfirmDialog from './ScopeSwitchConfirmDialog';
import DiscardChangesDialog from './DiscardChangesDialog';
import { computeRollupAll } from '../lib/rollupCounts';

type NodeOverride = { name?: string; removed?: boolean };
type OverrideMap = Record<string, NodeOverride>;

// Walks the source tree, replacing name and stamping removed when overridden.
// Non-mutating: returns new node objects whenever an override applies.
function applyOverrides(nodes: TreeNode[], overrides: OverrideMap): TreeNode[] {
  return nodes.map((n) => {
    const o = overrides[n.id];
    const children = n.children ? applyOverrides(n.children, overrides) : undefined;
    if (!o && children === n.children) return n;
    return {
      ...n,
      name: o?.name ?? n.name,
      removed: o?.removed ?? n.removed,
      children,
    };
  });
}

// Finds the parent id of a node by id, walking the composited tree.
// Returns '__root__' for top-level nodes, or null if not found.
function findParentId(nodes: CompositedNode[], targetId: string, parentId: string = '__root__'): string | null {
  for (const n of nodes) {
    if (n.id === targetId) return parentId;
    if (n.children) {
      const hit = findParentId(n.children, targetId, n.id);
      if (hit) return hit;
    }
  }
  return null;
}

function findNodeById(nodes: CompositedNode[], id: string): CompositedNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNodeById(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

// Returns a new composited array with the synthetic pending new-folder row
// injected per insertMode. Sibling: appears immediately after anchor under
// anchor's parent. Child: appears as first child of anchor.
function injectPendingNewFolder(
  composited: CompositedNode[],
  pending: { anchorNodeId: string; insertMode: 'sibling' | 'child' }
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
    for (const n of nodes) {
      if (pending.insertMode === 'child' && n.id === pending.anchorNodeId) {
        // First child of anchor.
        const newChildren = [synthetic, ...(n.children ?? [])];
        next.push({ ...n, children: newChildren });
        changed = true;
        continue;
      }
      // Recurse into children first.
      let nextNode = n;
      if (n.children) {
        const sub = visit(n.children);
        if (sub.changed) {
          nextNode = { ...n, children: sub.nodes };
          changed = true;
        }
      }
      next.push(nextNode);
      if (pending.insertMode === 'sibling' && n.id === pending.anchorNodeId) {
        next.push(synthetic);
        changed = true;
      }
    }
    return { changed, nodes: next };
  };

  const { changed, nodes } = visit(composited);
  // If anchor wasn't found at any depth (sibling mode at root with unknown id),
  // fall back to appending at root so the row is at least visible.
  if (!changed) return [...composited, synthetic];
  return nodes;
}

interface Props {
  state: State;
  dispatch: (a: Action) => void;
}

export default function EnhancedIndexRoute({ state, dispatch }: Props) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [retryToast, setRetryToast] = useState(false);

  const open = state.stage !== 'closed';

  // generating → review (350ms; or retry: 350 → toast → 350)
  useEffect(() => {
    if (state.stage !== 'generating') return;
    if (state.scenario.simulateRetry && !state.retriedOnce) {
      const t1 = window.setTimeout(() => {
        setRetryToast(true);
        const t2 = window.setTimeout(() => {
          setRetryToast(false);
          dispatch({ type: 'GENERATION_READY' });
        }, 350);
        return () => window.clearTimeout(t2);
      }, 350);
      return () => window.clearTimeout(t1);
    }
    const t = window.setTimeout(() => dispatch({ type: 'GENERATION_READY' }), 350);
    return () => window.clearTimeout(t);
  }, [state.stage, state.scenario.simulateRetry, state.retriedOnce, dispatch]);

  // applying → success (1500ms)
  useEffect(() => {
    if (state.stage !== 'applying') return;
    const t = window.setTimeout(() => dispatch({ type: 'APPLY_DONE' }), 1500);
    return () => window.clearTimeout(t);
  }, [state.stage, dispatch]);

  // success auto-close (suppressed if forcedStage === 'success')
  useEffect(() => {
    if (state.stage !== 'success') return;
    if (state.scenario.forcedStage === 'success') return;
    const t = window.setTimeout(() => dispatch({ type: 'CLOSE' }), 800);
    return () => window.clearTimeout(t);
  }, [state.stage, state.scenario.forcedStage, dispatch]);

  // error auto-clear
  useEffect(() => {
    if (!state.errorMessage) return;
    const t = window.setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 4000);
    return () => window.clearTimeout(t);
  }, [state.errorMessage, dispatch]);

  const handleClose = () => {
    if (state.dirty && (state.stage === 'review' || state.stage === 'confirm-scope-switch')) {
      setShowDiscardDialog(true);
      return;
    }
    dispatch({ type: 'CLOSE' });
  };

  // --- Task 6: lifted state for inline rename, add-folder, soft-delete ---
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [pendingNewFolder, setPendingNewFolder] = useState<{
    anchorNodeId: string;
    insertMode: 'sibling' | 'child';
  } | null>(null);
  const [localProposals, setLocalProposals] = useState<ChangeProposal[]>([]);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  // Default: all expanded. Set holds ids the user has collapsed.
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  const onToggleExpand = (nodeId: string) =>
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });

  // Composited tree: user name-overrides applied to source first (so user
  // rename wins over AI rename per D8), then AI + user-added proposals folded.
  const composited = useMemo(() => {
    const treeWithOverrides = applyOverrides(state.tree, overrides);
    const base = compositeTree(treeWithOverrides, [...state.proposals, ...localProposals]);
    return pendingNewFolder ? injectPendingNewFolder(base, pendingNewFolder) : base;
  }, [state.tree, state.proposals, localProposals, overrides, pendingNewFolder]);

  // Top stats bar — totals across the whole composited tree.
  const rollupCounts = useMemo(() => computeRollupAll(composited), [composited]);
  const affectedFolderCount = useMemo(() => countAffectedFolders(composited), [composited]);

  const onBeginRename = (nodeId: string) => setEditingNodeId(nodeId);

  const onCancelRename = () => {
    // If we were editing the synthetic pending row, clear pending instead.
    if (pendingNewFolder) {
      setPendingNewFolder(null);
      return;
    }
    setEditingNodeId(null);
  };

  const onCommitAddFolder = (anchorNodeId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setPendingNewFolder(null);
      return;
    }
    // Resolve parentId based on the captured insertMode.
    let parentId = '__root__';
    if (pendingNewFolder) {
      if (pendingNewFolder.insertMode === 'child') {
        parentId = pendingNewFolder.anchorNodeId;
      } else {
        // Sibling: parent of the anchor in the composited tree (pre-injection).
        const baseTree = compositeTree(
          applyOverrides(state.tree, overrides),
          [...state.proposals, ...localProposals]
        );
        parentId = findParentId(baseTree, pendingNewFolder.anchorNodeId) ?? '__root__';
      }
    } else {
      // No pending row context; treat anchorNodeId as parent for `child` insert.
      parentId = anchorNodeId;
    }
    const newProposal: ChangeProposal = {
      id: `usr-add-${crypto.randomUUID()}`,
      type: 'add-folder',
      name: trimmed,
      parentId,
      parentPath: [],
      description: 'User-added folder',
    };
    setLocalProposals((ps) => [...ps, newProposal]);
    setPendingNewFolder(null);
    setEditingNodeId(null);
  };

  const onCommitRename = (nodeId: string, newName: string) => {
    // Route synthetic pending-new-folder commits to the add-folder handler.
    if (nodeId === '__pending-new-folder__' && pendingNewFolder) {
      onCommitAddFolder(pendingNewFolder.anchorNodeId, newName);
      return;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      setEditingNodeId(null);
      return;
    }
    setOverrides((o) => ({ ...o, [nodeId]: { ...o[nodeId], name: trimmed } }));
    setEditingNodeId(null);
  };

  const onBeginAddFolder = (anchorNodeId: string) => {
    // Resolve the anchor against the current composited tree (pre-injection)
    // to decide sibling vs. child placement per D4.
    const base = compositeTree(
      applyOverrides(state.tree, overrides),
      [...state.proposals, ...localProposals]
    );
    const anchor = findNodeById(base, anchorNodeId);
    if (!anchor) return;
    const insertMode: 'sibling' | 'child' = anchor.kind === 'folder' ? 'child' : 'sibling';
    setPendingNewFolder({ anchorNodeId, insertMode });
    setEditingNodeId(null);
  };

  const onCancelAddFolder = () => setPendingNewFolder(null);

  const onSoftDelete = (nodeId: string) =>
    setOverrides((o) => ({ ...o, [nodeId]: { ...o[nodeId], removed: true } }));

  const onRestore = (nodeId: string) =>
    setOverrides((o) => ({ ...o, [nodeId]: { ...o[nodeId], removed: false } }));

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <EnhancedIndexHeader state={state} dispatch={dispatch} onCancel={handleClose} />

        {state.stage !== 'configure' && (
          <ChangeSummaryBar
            counts={rollupCounts}
            affectedFolderCount={affectedFolderCount}
            loading={state.stage === 'generating'}
          />
        )}

        <Box sx={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', px: 3, pb: 3, pt: 0 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: '8px', bgcolor: 'background.paper' }}>
            {state.stage === 'review' && state.proposals.length > 0 && (
              <Box sx={{ position: 'sticky', top: 0, zIndex: 2, px: 2, py: 1, bgcolor: 'background.paper', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <Button
                  size="small"
                  startIcon={<FontAwesomeIcon icon={faFolderPlus} style={{ fontSize: 14 }} />}
                  sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 500 }}
                >
                  Add folder
                </Button>
              </Box>
            )}
            {state.stage === 'configure' ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Choose a scope above and click <strong>Generate Enhanced Index</strong> to preview proposed changes.
                </Typography>
              </Box>
            ) : state.stage === 'generating' ? (
              <Box sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={32} />)}
                </Stack>
              </Box>
            ) : (
              <ChangeTree
                composited={composited}
                scope={state.scope}
                focusedProposalId={state.focusedProposalId}
                onFocusProposal={(proposalId) => dispatch({ type: 'SET_FOCUSED_PROPOSAL', proposalId })}
                editingNodeId={pendingNewFolder ? '__pending-new-folder__' : editingNodeId}
                pendingNewFolderNodeId={pendingNewFolder?.anchorNodeId ?? null}
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
            )}
          </Box>

          {state.stage === 'applying' && (
            <Backdrop open sx={{ position: 'absolute', inset: 0, color: 'common.white', flexDirection: 'column', gap: 2, zIndex: 5 }}>
              <CircularProgress color="inherit" />
              <Typography>Applying Enhanced Index…</Typography>
            </Backdrop>
          )}
          {state.stage === 'success' && (
            <Backdrop
              open
              sx={{
                position: 'absolute', inset: 0, color: 'success.main',
                flexDirection: 'column', gap: 2, bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92), zIndex: 5,
              }}
            >
              <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 48 }} />
              <Typography color="text.primary">Enhanced Index applied</Typography>
            </Backdrop>
          )}
          {state.stage === 'success' && (
            <Box
              aria-live="polite"
              role="status"
              sx={{
                position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
                overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
              }}
            >
              Enhanced Index applied
            </Box>
          )}
        </Box>
      </Box>

      <ScopeSwitchConfirmDialog
        open={state.stage === 'confirm-scope-switch' && state.pendingScope !== null}
        fromScope={state.scope}
        toScope={state.pendingScope ?? 'all'}
        onConfirm={() => dispatch({ type: 'CONFIRM_SCOPE_SWITCH' })}
        onCancel={() => dispatch({ type: 'CANCEL_SCOPE_SWITCH' })}
      />

      <Snackbar
        open={Boolean(state.errorMessage)}
        autoHideDuration={5000}
        onClose={() => dispatch({ type: 'CLEAR_ERROR' })}
        message={state.errorMessage ?? ''}
        ContentProps={{ role: 'alert' }}
      />
      <Snackbar open={retryToast} message="Verifying file integrity…" />

      <DiscardChangesDialog
        open={showDiscardDialog}
        onKeepEditing={() => setShowDiscardDialog(false)}
        onDiscard={() => { setShowDiscardDialog(false); dispatch({ type: 'CLOSE' }); }}
      />
    </>
  );
}
