import type { MouseEvent } from 'react';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder, faFolderOpen, faFile, faArrowRight,
  faAngleUp, faAngleRight,
  faGripDotsVertical,
} from '@fortawesome/pro-light-svg-icons';
import type { CompositedNode } from '../lib/compositeTree';
import type { ReviewScope } from '../state/types';
import EditableField from './EditableField';
import ActionButtonGroup from './ActionButtonGroup';
import RollupPill from './RollupPill';
import { canDelete as canDeleteRow } from '../lib/canDelete';
import { computeRollup } from '../lib/rollupCounts';
import { CHANGE_COLORS } from '../constants/changeColors';
import { moondust, ruby } from '~/theme/halo/theme';

interface Props {
  node: CompositedNode;
  level: number;
  displayIndex: string;
  posinset: number;
  setsize: number;
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

// Halo action color tokens.
type ActionType = NonNullable<CompositedNode['actionTypes']>[number];

const ACTION_COLORS: Record<ActionType, string> = {
  'add-folder': CHANGE_COLORS.addFolder,
  'rename': CHANGE_COLORS.rename,
  'move-source': CHANGE_COLORS.move,
  'move-dest': CHANGE_COLORS.move,
};

const ACTION_LABELS: Record<ActionType, string> = {
  'add-folder':  'NEW',
  'rename':      'RENAME',
  'move-source': 'MOVE',
  'move-dest':   'MOVE',
};

function actionTypeMatchesScope(actionType: ActionType | undefined, scope: ReviewScope): boolean {
  if (scope === 'all') return true;
  if (!actionType) return false;
  if (scope === 'add-folder') return actionType === 'add-folder';
  if (scope === 'rename')     return actionType === 'rename';
  if (scope === 'move')       return actionType === 'move-source' || actionType === 'move-dest';
  return false;
}

function ariaLabelFor(node: CompositedNode): string | undefined {
  if (!node.actionTypes?.length) return undefined;
  if (node.actionTypes.includes('add-folder')) return `New folder ${node.name}, proposed by AI. Click to see rationale.`;
  if (node.actionTypes.includes('rename'))     return `Renamed from ${node.name} to ${node.proposedName}, ${node.kind}. Click to see rationale.`;
  if (node.actionTypes.includes('move-source')) return `${node.name} moves to ${node.movedTo?.join(' / ')}. Click to see rationale.`;
  if (node.actionTypes.includes('move-dest'))   return `${node.name} moved here from ${node.movedFrom?.join(' / ')}. Click to see rationale.`;
  return undefined;
}

export default function ChangeTreeNode({
  node,
  level,
  displayIndex,
  posinset,
  setsize,
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
  const accent = node.actionTypes?.[0] ? ACTION_COLORS[node.actionTypes[0]] : 'transparent';
  const hasAction = Boolean(node.actionTypes && node.actionTypes.length > 0);
  const dimmed = scope !== 'all' && hasAction && !node.actionTypes?.some(t => actionTypeMatchesScope(t, scope));
  const focused = node.proposalIds?.includes(focusedProposalId ?? '') ?? false;

  const hasChildren = Boolean(node.children && node.children.length > 0);
  const expanded = !collapsedNodeIds.has(node.id);
  // Rollup only when collapsed parent has descendant changes.
  const rollup = (!expanded && hasChildren) ? computeRollup(node) : null;
  const showRollup = Boolean(rollup && rollup.total > 0);

  const handleClick = () => {
    if (node.proposalIds?.[0]) onFocusProposal(node.proposalIds[0]);
  };

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        onClick={handleClick}
        className="row"
        tabIndex={0}
        role={node.proposalIds?.length ? 'button' : 'treeitem'}
        aria-level={level + 1}
        aria-posinset={posinset}
        aria-setsize={setsize}
        aria-label={ariaLabelFor(node)}
        sx={{
          height: 32,
          pl: 1,
          pr: 1,
          gap: 0.75,
          cursor: node.proposalIds?.length ? 'pointer' : 'default',
          opacity: dimmed ? 0.35 : 1,
          bgcolor: node.removed
            ? (theme) => alpha(theme.palette.error.main, 0.08)
            : focused
              ? 'action.hover'
              : 'transparent',
          borderLeft: `3px solid ${node.removed ? ruby[600] : accent}`,
          transition: 'opacity 120ms ease, background-color 120ms ease',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box
          className="grip"
          sx={{
            opacity: 0,
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'opacity 0.2s ease-in-out',
            '.row:hover &, .row:focus-within &': { opacity: 1 },
          }}
          aria-label={`Drag ${node.name}`}
          role="button"
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={faGripDotsVertical} style={{ fontSize: 12, color: moondust[500] }} />
        </Box>

        <Box
          sx={{
            width: 56,
            flexShrink: 0,
            fontSize: 12,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'left',
            pr: 1,
          }}
          aria-hidden
        >
          {displayIndex}
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: '0 0 50%', minWidth: 0 }}>
          {level > 0 && <Box sx={{ width: `${level * 16}px`, flexShrink: 0 }} aria-hidden />}
          <Box
            sx={{
              width: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: hasChildren ? 'pointer' : 'default',
            }}
            onClick={hasChildren ? handleToggle : undefined}
            role={hasChildren ? 'button' : undefined}
            tabIndex={hasChildren ? 0 : -1}
            aria-label={hasChildren ? (expanded ? `Collapse ${node.name}` : `Expand ${node.name}`) : undefined}
            aria-expanded={hasChildren ? expanded : undefined}
          >
            {hasChildren && (
              <FontAwesomeIcon
                icon={expanded ? faAngleUp : faAngleRight}
                style={{ fontSize: 12, color: moondust[500] }}
              />
            )}
          </Box>
          <FontAwesomeIcon
            icon={node.kind === 'folder' ? (hasChildren && expanded ? faFolderOpen : faFolder) : faFile}
            style={{ color: moondust[500], fontSize: 14, flexShrink: 0 }}
          />
          {node.actionTypes?.includes('rename') ? (
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, flexShrink: 1 }}>
              <Typography
                sx={{ fontSize: 14, color: 'text.secondary', textDecoration: 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {node.name}
              </Typography>
              <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10, color: moondust[500] }} />
              <EditableField
                value={node.proposedName ?? ''}
                editing={editingNodeId === node.id}
                onCommit={(next) => onCommitRename(node.id, next)}
                onCancel={onCancelRename}
                ariaLabel={`Edit proposed name ${node.proposedName ?? ''}`}
              />
            </Stack>
          ) : (
            <EditableField
              value={node.name}
              editing={editingNodeId === node.id}
              onCommit={(next) => onCommitRename(node.id, next)}
              onCancel={onCancelRename}
              ariaLabel={`Rename ${node.name}`}
            />
          )}

          <ActionButtonGroup
            nodeName={node.name}
            canDelete={canDeleteRow(node)}
            removed={node.removed}
            onEdit={() => onBeginRename(node.id)}
            onAddFolder={() => onBeginAddFolder(node.id)}
            onDeleteOrRestore={() => (node.removed ? onRestore(node.id) : onSoftDelete(node.id))}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          {node.actionTypes?.map((t, i) => (
            <Chip
              key={`${t}-${i}`}
              label={ACTION_LABELS[t]}
              size="small"
              sx={{
                height: 18,
                bgcolor: ACTION_COLORS[t],
                color: 'common.white',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}
            />
          ))}

          {node.actionTypes?.includes('move-source') && node.movedTo && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0 }}>
              → {node.movedTo.join(' / ')}
            </Typography>
          )}
          {node.actionTypes?.includes('move-dest') && node.movedFrom && (
            <Typography sx={{ fontSize: 12, color: 'text.secondary', fontStyle: 'italic', whiteSpace: 'nowrap', flexShrink: 0 }}>
              ← {node.movedFrom.join(' / ')}
            </Typography>
          )}

          {node.reason && (
            <Tooltip title={node.reason} placement="top-start">
              <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                · {node.reason}
              </Typography>
            </Tooltip>
          )}

          {showRollup && rollup && (
            <Box sx={{ ml: 'auto', flexShrink: 0 }}>
              <RollupPill counts={rollup} />
            </Box>
          )}
        </Stack>
      </Stack>
      {expanded && node.children && node.children.length > 0 && (
        <Box>
          {node.children.map((child, i) => (
            <ChangeTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              displayIndex={`${displayIndex}.${i + 1}`}
              posinset={i + 1}
              setsize={node.children!.length}
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
      )}
    </>
  );
}
