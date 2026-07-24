// The room + sidecar composition (prototype v2 → sidecar pass, 2026-07-17).
// Two exports, composed at the container level so the agent follows the user everywhere:
//   • RoomWorkspacePane — the Documents tab: room index as the permanent main surface
//     ("Excel-like"), with payload pills (filing plan, plan, triage table, previews)
//     rendering in place as approval-gated diffs.
//   • AgentDock — the persistent right sidecar on EVERY tab: review queue + chat.
//     Collapsed = floating sparkle button bottom-right; expanded = chat takes the stage.
// The review queue lives in the dock (not on the index): it is agent-proposed work
// awaiting the banker's approval, available while they stay in their focus area.
import { useEffect, useMemo, useState } from 'react';
import {
  faArrowDownLeftAndArrowUpRightToCenter,
  faArrowUpRightAndArrowDownLeftFromCenter,
  faBroom,
  faChevronDown,
  faChevronUp,
  faClipboardCheck,
  faFileImport,
  faFolderTree,
  faInboxIn,
  faListCheck,
  faPlus,
  faSidebarFlip,
} from '@fortawesome/pro-light-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import AiSparkleBadge from './AiSparkleBadge';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import { getEmptyStateCopy, type EmptyStatePrompt } from './FullChatEmptyState';
import RightContextCanvasFilesView from './RightContextCanvasFilesView';
import {
  ContextTabPill,
  RightCanvasTabContent,
  getComposerPlaceholderForRightTab,
  type RightCanvasTab,
} from './RightContextCanvas';
import type { QaFocusTarget } from './RightContextCanvasQaView';
import { createAppliedFilesSource } from './appliedFilesSource';
import { BRIEF_SOURCE_FILES } from '../state/briefScenario';
import { STIFEL_SOURCE_FILES } from './qaTriageData';
import { registerRuntimeSellerFiles } from './rightCanvasFileData';
import { GAP_FINDER_PROMPT } from '../state/copy';
import { selectCompositedTree } from '../state/reducer';
import type { SeatId } from '../state/persona';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

export type AgentDockMode = 'collapsed' | 'docked' | 'expanded';

const AGENT_DOCK_BASIS = 'clamp(380px, 32vw, 460px)';

// ────────────────────────────────────────────────────────────────────────────
// RoomWorkspacePane — the Documents tab main surface
// ────────────────────────────────────────────────────────────────────────────

interface RoomWorkspacePaneProps {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  openTabs: RightCanvasTab[];
  activeTab: RightCanvasTab | null;
  onAddTab: (tab: RightCanvasTab) => void;
  onSelectTab: (tab: RightCanvasTab) => void;
  onCloseTab: (tab: RightCanvasTab) => void;
  onShowIndex: () => void;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
  selectedQaItemId: string | null;
}

export function RoomWorkspacePane({
  state,
  dispatch,
  openTabs,
  activeTab,
  onAddTab,
  onSelectTab,
  onCloseTab,
  onShowIndex,
  notesByRowId,
  onNoteChange,
  selectedQaItemId,
}: RoomWorkspacePaneProps) {
  const [qaFocusTarget, setQaFocusTarget] = useState<QaFocusTarget | null>(null);

  const appliedFilesSource = useMemo(
    () => (state.structureApplied ? createAppliedFilesSource(selectCompositedTree(state)) : null),
    [
      state.structureApplied,
      state.tree,
      state.proposals,
      state.localProposals,
      state.overrides,
      state.pendingNewFolder,
    ]
  );

  useEffect(() => {
    registerRuntimeSellerFiles([...(appliedFilesSource?.files ?? []), ...STIFEL_SOURCE_FILES, ...BRIEF_SOURCE_FILES]);
  }, [appliedFilesSource]);

  const openFilePreview = (fileId: string) => onAddTab(`file:${fileId}` as RightCanvasTab);
  const openFocusedQa = (target: QaFocusTarget) => {
    setQaFocusTarget(target);
    onAddTab('qa');
  };

  const showFilingAnnouncement = activeTab === 'filing-review' && !state.structureApplied;

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{
          minHeight: 67,
          px: 2.5,
          pt: 3.5,
          pb: 1,
          boxSizing: 'border-box',
          flexShrink: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <IndexTabPill selected={activeTab === null} onSelect={onShowIndex} />
        {openTabs.map((tab) => (
          <ContextTabPill
            key={tab}
            tab={tab}
            selected={activeTab === tab}
            onSelect={onSelectTab}
            onClose={onCloseTab}
          />
        ))}
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '999px',
            px: 1,
            py: 0.25,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Sandbox · unpublished
        </Typography>
      </Stack>

      {showFilingAnnouncement ? (
        <Box
          sx={{
            mx: 2.5,
            mb: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: 'action.hover',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            Structure mode — the agent&apos;s proposal is staged on the room tree. Nothing moves
            until you approve. Chat stays docked on the right; the Index pill takes you back.
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab ? (
          <RightCanvasTabContent
            activeTab={activeTab}
            state={state}
            dispatch={dispatch}
            notesByRowId={notesByRowId}
            onNoteChange={onNoteChange}
            bottomInset={0}
            filesSource={appliedFilesSource}
            onAddTab={onAddTab}
            onOpenFilePreview={openFilePreview}
            onOpenQa={openFocusedQa}
            qaFocusTarget={qaFocusTarget}
            selectedQaItemId={selectedQaItemId}
          />
        ) : (
          <RightContextCanvasFilesView
            mode="index"
            source={appliedFilesSource ?? undefined}
            attachedFileIds={state.attachedFileIds}
            attachedFolderIds={state.attachedFolderIds}
            onToggleFileAttachment={(fileId) => dispatch({ type: 'TOGGLE_ATTACHMENT', fileId })}
            onToggleFolderAttachment={(folderId) => {
              const nextFolderIds = state.attachedFolderIds.includes(folderId)
                ? state.attachedFolderIds.filter((id) => id !== folderId)
                : [...state.attachedFolderIds, folderId];
              dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds: state.attachedFileIds, folderIds: nextFolderIds });
            }}
            onOpenQa={openFocusedQa}
            onOpenFile={openFilePreview}
          />
        )}
      </Box>
    </Box>
  );
}

function IndexTabPill({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <Box
      role="tab"
      aria-selected={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
      }}
      sx={{
        minHeight: 30,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: selected ? 'text.primary' : 'divider',
        px: 1.25,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        fontSize: 13,
        fontWeight: selected ? 500 : 400,
        color: 'text.primary',
        bgcolor: selected ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        outline: 'none',
        flexShrink: 0,
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
        },
      }}
    >
      <FontAwesomeIcon icon={faFolderTree} style={{ fontSize: 12, flexShrink: 0 }} />
      Index
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// AgentDock — the persistent sidecar (review queue + chat) on every tab
// ────────────────────────────────────────────────────────────────────────────

interface AgentDockProps {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  seat: SeatId;
  dockMode: AgentDockMode;
  activeTab: RightCanvasTab | null;
  onDockModeChange: (mode: AgentDockMode) => void;
  onNewChat: () => void;
  onOpenSkillsPage: () => void;
  onViewPlan: () => void;
  onApprovePlan: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
  onOpenFilingReview: () => void;
  onOpenCitation: (fileId: string) => void;
}

export function AgentDock({
  state,
  dispatch,
  seat,
  dockMode,
  activeTab,
  onDockModeChange,
  onNewChat,
  onOpenSkillsPage,
  onViewPlan,
  onApprovePlan,
  onOpenSavedFiles,
  onOpenQaItem,
  onOpenFilingReview,
  onOpenCitation,
}: AgentDockProps) {
  const showEmpty = state.stage === 'chat-empty';
  // Queue open when idle; folds to a summary row once a flow is running so the
  // conversation keeps the space.
  const [queueOpen, setQueueOpen] = useState(true);

  useEffect(() => {
    setQueueOpen(showEmpty);
  }, [showEmpty]);

  if (dockMode === 'collapsed') {
    return (
      <Tooltip title="Open Datasite AI">
        <IconButton
          aria-label="Open Datasite AI"
          onClick={() => onDockModeChange('docked')}
          sx={{
            position: 'absolute',
            right: 24,
            bottom: 24,
            zIndex: 6,
            width: 52,
            height: 52,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.16)',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <AiSparkleBadge size={30} iconSize={20} />
        </IconButton>
      </Tooltip>
    );
  }

  const expanded = dockMode === 'expanded';
  const composerLoading = state.stage === 'chat-processing-recommendation' || state.stage === 'save-processing';

  return (
    <Box
      sx={{
        flex: expanded ? '1 1 0' : `0 0 ${AGENT_DOCK_BASIS}`,
        width: expanded ? 'auto' : AGENT_DOCK_BASIS,
        minWidth: 0,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: expanded ? 0 : '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'flex-basis 280ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
        sx={{ minHeight: 67, px: 2, pt: 3.5, pb: 1, boxSizing: 'border-box', flexShrink: 0 }}
      >
        <AiSparkleBadge size={20} iconSize={13} />
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
          Datasite AI
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="New chat">
          <IconButton size="small" aria-label="New chat" onClick={onNewChat} sx={{ width: 30, height: 30 }}>
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Skills">
          <IconButton size="small" aria-label="Open skills" onClick={onOpenSkillsPage} sx={{ width: 30, height: 30 }}>
            <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={expanded ? 'Dock beside the room' : 'Expand chat to full screen'}>
          <IconButton
            size="small"
            aria-label={expanded ? 'Dock Datasite AI beside the room' : 'Expand Datasite AI to full screen'}
            onClick={() => onDockModeChange(expanded ? 'docked' : 'expanded')}
            sx={{ width: 30, height: 30 }}
          >
            <FontAwesomeIcon
              icon={expanded ? faArrowDownLeftAndArrowUpRightToCenter : faArrowUpRightAndArrowDownLeftFromCenter}
              style={{ fontSize: 13 }}
            />
          </IconButton>
        </Tooltip>
        {!expanded ? (
          <Tooltip title="Hide Datasite AI">
            <IconButton size="small" aria-label="Hide Datasite AI" onClick={() => onDockModeChange('collapsed')} sx={{ width: 30, height: 30 }}>
              <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <Box sx={{ px: 2, pb: showEmpty ? 0 : 1, flexShrink: 0 }}>
        <Box sx={{ width: expanded ? 'min(760px, 100%)' : '100%', mx: 'auto' }}>
          <ReviewQueue
            state={state}
            dispatch={dispatch}
            seat={seat}
            open={queueOpen}
            onToggle={() => setQueueOpen((current) => !current)}
            onDockModeChange={onDockModeChange}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', overscrollBehavior: 'contain', px: 2, py: 1.5 }}>
        <Box sx={{ width: expanded ? 'min(760px, 100%)' : '100%', mx: 'auto' }}>
          {showEmpty ? (
            <DockEmptyState seat={seat} dispatch={dispatch} />
          ) : (
            <ChatMessageList
              state={state}
              onViewPlan={onViewPlan}
              onApprovePlan={onApprovePlan}
              onOpenSavedFiles={onOpenSavedFiles}
              onOpenQaItem={onOpenQaItem}
              onOpenFilingReview={onOpenFilingReview}
              onToggleRationale={() => dispatch({ type: 'SHOW_RATIONALE' })}
              onOpenCitation={onOpenCitation}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
        <Box sx={{ width: expanded ? 'min(600px, 100%)' : '100%', mx: 'auto' }}>
          <ChatComposer
            compact={!expanded}
            large={expanded}
            showPoweredLine={false}
            loading={composerLoading}
            value={state.composerValue}
            placeholder={getComposerPlaceholderForRightTab(activeTab)}
            attachedFileIds={state.attachedFileIds}
            attachedFolderIds={state.attachedFolderIds}
            onChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
            onSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
            onContextChange={({ fileIds, folderIds }) => dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds, folderIds })}
          />
        </Box>
      </Box>
    </Box>
  );
}

// The review queue (P0.1) — agent-proposed work awaiting the banker's approval,
// available from every tab without leaving the focus area.
function ReviewQueue({
  state,
  dispatch,
  seat,
  open,
  onToggle,
  onDockModeChange,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  seat: SeatId;
  open: boolean;
  onToggle: () => void;
  onDockModeChange: (mode: AgentDockMode) => void;
}) {
  const filed = state.structureApplied && state.filingVariant === 'uploads';
  const clientDropApproved = state.structureApplied && state.filingVariant === 'client-drop';
  const tidied = state.structureApplied && state.filingVariant === 'retro';

  const startFlow = (action: WorkspaceAction) => {
    onDockModeChange('docked');
    dispatch(action);
  };

  const rows: Array<{
    key: string;
    icon: IconDefinition;
    title: string;
    detail: string;
    done: boolean;
    onClick: () => void;
  }> = [
    {
      key: 'uploads',
      icon: faInboxIn,
      title: filed ? 'Uploads filed — 4 held in staging with notes' : '18 new uploads waiting to be filed',
      detail: 'Your batch from tonight, matched against the sandbox.',
      done: filed,
      onClick: () => startFlow({ type: 'SELECT_FILING_PROMPT' }),
    },
    {
      key: 'client-drop',
      icon: faFileImport,
      title: clientDropApproved
        ? 'Client drop approved — 2 held with chase notes'
        : 'Client dropped 6 files overnight',
      detail: 'Nothing the client does is bidder-visible until you approve.',
      done: clientDropApproved,
      onClick: () => startFlow({ type: 'SELECT_CLIENT_DROP_PROMPT' }),
    },
    ...(seat === 'tom'
      ? [
          {
            key: 'retro',
            icon: faBroom,
            title: tidied ? 'Existing files tidied in the sandbox' : 'Existing files: 8 issues in what’s already filed',
            detail: 'Misfiles, naming breaks, version pairs — not just uploads.',
            done: tidied,
            onClick: () => startFlow({ type: 'SELECT_RETRO_FILING_PROMPT' }),
          },
          {
            key: 'gaps',
            icon: faListCheck,
            title: 'Gap check before the senior pass',
            detail: 'The room vs your request list and comparable deals.',
            done: false,
            onClick: () => startFlow({ type: 'CHAT_PROMPT_SUBMITTED', prompt: GAP_FINDER_PROMPT }),
          },
        ]
      : []),
  ];

  const waitingCount = rows.filter((row) => !row.done).length;

  return (
    <Stack
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Stack
        component="button"
        type="button"
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={onToggle}
        aria-expanded={open}
        sx={{
          border: 0,
          px: 1.5,
          py: 1,
          bgcolor: 'transparent',
          cursor: 'pointer',
          font: 'inherit',
          textAlign: 'left',
          outline: 'none',
          '&:hover': { bgcolor: 'action.hover' },
          '&:focus-visible': { boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.action.focus}` },
        }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 650, color: 'text.primary' }}>
          Needs your review
        </Typography>
        {waitingCount > 0 ? (
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 650,
              color: 'background.paper',
              bgcolor: 'text.primary',
              borderRadius: '999px',
              px: 0.75,
              py: 0.1,
              lineHeight: 1.5,
            }}
          >
            {waitingCount}
          </Typography>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled', whiteSpace: 'nowrap' }}>
          Sandbox · unpublished
        </Typography>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} style={{ fontSize: 11, color: 'inherit' }} />
      </Stack>

      <Collapse in={open} timeout={200} unmountOnExit>
        <Stack>
          {rows.map((row) => (
            <Stack
              key={row.key}
              component="button"
              type="button"
              direction="row"
              alignItems="center"
              spacing={1.25}
              onClick={row.onClick}
              disabled={row.done}
              sx={{
                border: 0,
                borderTop: '1px solid',
                borderColor: 'divider',
                px: 1.5,
                py: 1,
                bgcolor: 'transparent',
                cursor: row.done ? 'default' : 'pointer',
                font: 'inherit',
                textAlign: 'left',
                outline: 'none',
                opacity: row.done ? 0.6 : 1,
                '&:hover': row.done ? undefined : { bgcolor: 'action.hover' },
                '&:focus-visible': { boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.action.focus}` },
              }}
            >
              <Box sx={{ color: 'text.secondary', flexShrink: 0, width: 16 }}>
                <FontAwesomeIcon icon={row.icon} style={{ fontSize: 13 }} />
              </Box>
              <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.title}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.detail}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
}

function DockEmptyState({ seat, dispatch }: { seat: SeatId; dispatch: (action: WorkspaceAction) => void }) {
  const copy = getEmptyStateCopy('chat', seat);

  const handlePromptClick = (prompt: EmptyStatePrompt) => {
    if (prompt.action === 'select-folder') {
      dispatch({ type: 'SELECT_FOLDER_PROMPT' });
      return;
    }
    if (prompt.action === 'select-filing') {
      dispatch({ type: 'SELECT_FILING_PROMPT' });
      return;
    }
    if (prompt.action === 'select-retro') {
      dispatch({ type: 'SELECT_RETRO_FILING_PROMPT' });
      return;
    }
    if (prompt.action === 'select-client-drop') {
      dispatch({ type: 'SELECT_CLIENT_DROP_PROMPT' });
      return;
    }
    if (prompt.action === 'select-brief') {
      dispatch({ type: 'SELECT_BRIEF_PROMPT' });
      return;
    }
    dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt: prompt.prompt });
  };

  return (
    <Stack spacing={1.5} sx={{ pt: 1 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 500, color: 'text.primary' }}>
        {copy.title}
      </Typography>
      <Stack spacing={0.75} alignItems="stretch">
        {copy.prompts.map((prompt) => (
          <HaloButton
            key={prompt.label}
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={prompt.icon} />}
            onClick={() => handlePromptClick(prompt)}
            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
          >
            {prompt.label}
          </HaloButton>
        ))}
      </Stack>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {copy.footnote}
      </Typography>
    </Stack>
  );
}
