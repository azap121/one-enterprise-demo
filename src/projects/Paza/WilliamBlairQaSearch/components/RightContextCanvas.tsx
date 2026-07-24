import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDownLeftAndArrowUpRightToCenter,
  faArrowUpRightAndArrowDownLeftFromCenter,
  faBookOpenLines,
  faChevronDown,
  faChevronUp,
  faClipboardCheck,
  faFile,
  faMessagesQuestion,
  faPlus,
  faSidebarFlip,
  faTableList,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { moondust } from '~/theme/halo/theme';
import AiSparkleBadge from './AiSparkleBadge';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';
import LegalReviewWorkspace from './LegalReviewWorkspace';
import RightContextCanvasFileDetailView from './RightContextCanvasFileDetailView';
import RightContextCanvasFilesView from './RightContextCanvasFilesView';
import RightContextCanvasQaView, { type QaFocusTarget } from './RightContextCanvasQaView';
import ValidationPlanWorkspace from './ValidationPlanWorkspace';
import { createAppliedFilesSource } from './appliedFilesSource';
import { WILLIAM_BLAIR_SOURCE_FILES } from './qaTriageData';
import { findSellerFileById, registerRuntimeSellerFiles, type SellerIndexSource } from './rightCanvasFileData';
import { selectCompositedTree } from '../state/reducer';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

type BaseRightCanvasTab = 'validation-plan' | 'enhanced-index' | 'files' | 'qa' | 'skills' | 'templates';
type FilePreviewCanvasTab = `file:${string}`;

export type RightCanvasTab = BaseRightCanvasTab | FilePreviewCanvasTab;
export type RightCanvasMotion = 'idle' | 'entering-from-right' | 'restoring-to-side';

interface Props {
  openTabs: RightCanvasTab[];
  activeTab: RightCanvasTab | null;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
  expanded: boolean;
  onHideCanvas: () => void;
  onExpandCanvas: () => void;
  onRestoreCanvas: () => void;
  onAddTab: (tab: RightCanvasTab) => void;
  onSelectTab: (tab: RightCanvasTab) => void;
  onCloseTab: (tab: RightCanvasTab) => void;
  onOpenSavedFiles: () => void;
  selectedQaItemId: string | null;
  onOpenQaItem: (itemId: string) => void;
  motion?: RightCanvasMotion;
}

const FILE_PREVIEW_TAB_PREFIX = 'file:';

const RIGHT_CANVAS_TAB_META: Record<BaseRightCanvasTab, { label: string; icon: IconDefinition; closeLabel: string }> = {
  'validation-plan': {
    label: 'Plan',
    icon: faClipboardCheck,
    closeLabel: 'Remove Plan tab',
  },
  'enhanced-index': {
    label: 'Q&A table',
    icon: faTableList,
    closeLabel: 'Remove Q&A table tab',
  },
  files: {
    label: 'Documents',
    icon: faFile,
    closeLabel: 'Remove Documents tab',
  },
  qa: {
    label: 'Q&A',
    icon: faMessagesQuestion,
    closeLabel: 'Remove Q&A tab',
  },
  skills: {
    label: 'Skills',
    icon: faClipboardCheck,
    closeLabel: 'Remove Skills tab',
  },
  templates: {
    label: 'Templates',
    icon: faBookOpenLines,
    closeLabel: 'Remove Templates tab',
  },
};

function makeFilePreviewCanvasTab(fileId: string): FilePreviewCanvasTab {
  return `${FILE_PREVIEW_TAB_PREFIX}${fileId}` as FilePreviewCanvasTab;
}

function isFilePreviewCanvasTab(tab: RightCanvasTab | null): tab is FilePreviewCanvasTab {
  return Boolean(tab?.startsWith(FILE_PREVIEW_TAB_PREFIX));
}

function getFileIdFromTab(tab: FilePreviewCanvasTab) {
  return tab.slice(FILE_PREVIEW_TAB_PREFIX.length);
}

function getRightCanvasTabMeta(tab: RightCanvasTab): { label: string; icon: IconDefinition; closeLabel: string } {
  if (isFilePreviewCanvasTab(tab)) {
    const file = findSellerFileById(getFileIdFromTab(tab));
    const label = file?.name ?? 'File preview';
    return {
      label,
      icon: faFile,
      closeLabel: `Remove ${label} tab`,
    };
  }

  return RIGHT_CANVAS_TAB_META[tab];
}

export function getComposerPlaceholderForRightTab(tab: RightCanvasTab | null) {
  if (tab === 'skills') {
    return 'Describe the reusable skill you want Datasite AI to create...';
  }
  if (tab === 'templates') {
    return 'Upload templates or describe the playbook/output standard you want agents to use...';
  }
  return undefined;
}

export default function RightContextCanvas({
  openTabs,
  activeTab,
  state,
  dispatch,
  notesByRowId,
  onNoteChange,
  expanded,
  onHideCanvas,
  onExpandCanvas,
  onRestoreCanvas,
  onAddTab,
  onSelectTab,
  onCloseTab,
  onOpenSavedFiles,
  selectedQaItemId,
  onOpenQaItem,
  motion = 'idle',
}: Props) {
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [threadExpanded, setThreadExpanded] = useState(false);
  const [qaFocusTarget, setQaFocusTarget] = useState<QaFocusTarget | null>(null);

  const addMenuOpen = Boolean(addMenuAnchorEl);
  const canvasContentAnimation = motion === 'entering-from-right'
    ? 'rightContextEnterFromRight 360ms cubic-bezier(0.2, 0, 0, 1)'
    : motion === 'restoring-to-side'
      ? 'rightContextRestoreToSide 280ms cubic-bezier(0.2, 0, 0, 1)'
      : 'none';
  const expandedContentBottomInset = expanded ? (threadExpanded ? 560 : 216) : 0;
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
    if (!expanded) setThreadExpanded(false);
  }, [expanded]);

  useEffect(() => {
    registerRuntimeSellerFiles([...(appliedFilesSource?.files ?? []), ...WILLIAM_BLAIR_SOURCE_FILES]);
  }, [appliedFilesSource]);

  const openAddMenu = (event: MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const closeAddMenu = () => {
    setAddMenuAnchorEl(null);
  };

  const addContextTab = (tab: BaseRightCanvasTab) => {
    if (tab === 'qa') setQaFocusTarget(null);
    onAddTab(tab);
    closeAddMenu();
  };

  const openFocusedQa = (target: QaFocusTarget) => {
    setQaFocusTarget(target);
    onAddTab('qa');
  };

  const openFilePreview = (fileId: string) => {
    onAddTab(makeFilePreviewCanvasTab(fileId));
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        borderLeft: expanded ? 0 : '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        sx={{
          height: '100%',
          minHeight: 0,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            minHeight: 67,
            px: 2.5,
            pt: 3.5,
            pb: 1,
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          {openTabs.length > 0 ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                minWidth: 0,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {openTabs.map((tab) => (
                <ContextTabPill
                  key={tab}
                  tab={tab}
                  selected={activeTab === tab}
                  onSelect={onSelectTab}
                  onClose={onCloseTab}
                />
              ))}
            </Stack>
          ) : (
            <Typography sx={{ minWidth: 0, fontSize: 13, color: 'text.secondary' }}>
              Context canvas
            </Typography>
          )}

          <Tooltip title="Add context">
            <IconButton
              size="small"
              aria-label="Add context"
              aria-controls={addMenuOpen ? 'right-context-add-menu' : undefined}
              aria-haspopup="menu"
              aria-expanded={addMenuOpen ? 'true' : undefined}
              onClick={openAddMenu}
              sx={{ width: 30, height: 30, flexShrink: 0 }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Menu
            id="right-context-add-menu"
            anchorEl={addMenuAnchorEl}
            open={addMenuOpen}
            onClose={closeAddMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.75,
                  minWidth: 220,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 2,
                },
              },
            }}
          >
            <MenuItem onClick={() => addContextTab('validation-plan')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Plan"
                secondary="Adjust and approve Q&A triage phases"
                primaryTypographyProps={{ fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </MenuItem>
            <MenuItem onClick={() => addContextTab('files')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faFile} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Documents"
                secondary="Browse permitted acquisition materials"
                primaryTypographyProps={{ fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </MenuItem>
            <MenuItem onClick={() => addContextTab('qa')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faMessagesQuestion} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Q&A"
                secondary="Review selected question detail"
                primaryTypographyProps={{ fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </MenuItem>
            <MenuItem onClick={() => addContextTab('skills')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Skills"
                secondary="Create reusable agent instructions"
                primaryTypographyProps={{ fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </MenuItem>
            <MenuItem onClick={() => addContextTab('templates')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faBookOpenLines} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Templates"
                secondary="Ground agents in firm playbooks"
                primaryTypographyProps={{ fontSize: 13 }}
                secondaryTypographyProps={{ fontSize: 12 }}
              />
            </MenuItem>
          </Menu>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={expanded ? 'Restore panel' : 'Expand panel'}>
            <IconButton
              size="small"
              aria-label={expanded ? 'Restore panel' : 'Expand panel'}
              onClick={expanded ? onRestoreCanvas : onExpandCanvas}
              sx={{ width: 30, height: 30 }}
            >
              <FontAwesomeIcon
                icon={expanded ? faArrowDownLeftAndArrowUpRightToCenter : faArrowUpRightAndArrowDownLeftFromCenter}
                style={{ fontSize: 13 }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Hide context canvas">
            <IconButton
              size="small"
              aria-label="Hide context canvas"
              onClick={onHideCanvas}
              sx={{ width: 30, height: 30 }}
            >
              <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            opacity: 1,
            transform: 'translateX(0)',
            animation: canvasContentAnimation,
            overflow: 'hidden',
            position: 'relative',
            '@keyframes rightContextEnterFromRight': {
              '0%': { opacity: 0, transform: 'translateX(24px)' },
              '100%': { opacity: 1, transform: 'translateX(0)' },
            },
            '@keyframes rightContextRestoreToSide': {
              '0%': { opacity: 1, transform: 'translateX(-24px)' },
              '100%': { opacity: 1, transform: 'translateX(0)' },
            },
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <RightCanvasTabContent
              activeTab={activeTab}
              state={state}
              dispatch={dispatch}
              notesByRowId={notesByRowId}
              onNoteChange={onNoteChange}
              bottomInset={expandedContentBottomInset}
              filesSource={appliedFilesSource}
              onAddTab={onAddTab}
              onOpenFilePreview={openFilePreview}
              onOpenQa={openFocusedQa}
              qaFocusTarget={qaFocusTarget}
              selectedQaItemId={selectedQaItemId}
            />
          </Box>
          {expanded ? (
            <ExpandedCanvasAssistantDock
              state={state}
              dispatch={dispatch}
              threadExpanded={threadExpanded}
              onToggleThread={() => setThreadExpanded((current) => !current)}
              onOpenSavedFiles={onOpenSavedFiles}
              onOpenQaItem={onOpenQaItem}
              onAddTab={onAddTab}
              composerPlaceholder={getComposerPlaceholderForRightTab(activeTab)}
            />
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

function ExpandedCanvasAssistantDock({
  state,
  dispatch,
  threadExpanded,
  onToggleThread,
  onOpenSavedFiles,
  onOpenQaItem,
  onAddTab,
  composerPlaceholder,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  threadExpanded: boolean;
  onToggleThread: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
  onAddTab: (tab: RightCanvasTab) => void;
  composerPlaceholder?: string;
}) {
  const composerLoading = state.stage === 'chat-processing-recommendation' || state.stage === 'save-processing';
  const assistantPanelBorder = alpha(moondust[900], 0.16);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        bottom: { xs: 16, md: 24 },
        zIndex: 4,
        width: 'min(760px, calc(100% - 96px))',
        maxWidth: 'calc(100% - 48px)',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}
    >
      <Stack spacing={0} sx={{ width: '100%', pointerEvents: 'auto' }}>
        <Box
          sx={{
            width: 'calc(100% - 48px)',
            mx: 'auto',
            mb: '-1px',
            position: 'relative',
            zIndex: 1,
            border: '1px solid',
            borderColor: assistantPanelBorder,
            borderRadius: 3,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            bgcolor: alpha(moondust[50], 0.82),
            backdropFilter: 'blur(18px)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              maxHeight: threadExpanded ? 'min(400px, 42vh)' : 40,
              overflowY: threadExpanded ? 'auto' : 'hidden',
              overscrollBehavior: 'contain',
              position: 'relative',
              bgcolor: alpha(moondust[50], 0.64),
            }}
          >
            <Box
              component="button"
              type="button"
              aria-expanded={threadExpanded ? 'true' : 'false'}
              onClick={onToggleThread}
              sx={{
                minHeight: 40,
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                border: 0,
                px: 1.5,
                bgcolor: alpha(moondust[50], threadExpanded ? 0.74 : 0.9),
                backdropFilter: 'blur(16px)',
                color: 'text.secondary',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                font: 'inherit',
                outline: 'none',
                transition: 'background-color 180ms cubic-bezier(0.2, 0, 0, 1), color 180ms cubic-bezier(0.2, 0, 0, 1)',
                '&::after': threadExpanded
                  ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: -18,
                      height: 18,
                      pointerEvents: 'none',
                      background: `linear-gradient(180deg, ${alpha(moondust[50], 0.64)} 0%, ${alpha(moondust[50], 0)} 100%)`,
                    }
                  : undefined,
                '&:hover': { color: 'text.primary', bgcolor: alpha(moondust[50], 0.88) },
                '&:focus-visible': {
                  boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.action.focus}`,
                },
              }}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <AiSparkleBadge size={18} iconSize={12} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>
                  Chat thread
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {state.messages.length > 0 ? `${state.messages.length} messages` : 'No messages yet'}
                </Typography>
              </Stack>
              <FontAwesomeIcon icon={threadExpanded ? faChevronUp : faChevronDown} style={{ fontSize: 11 }} />
            </Box>

            <Collapse in={threadExpanded} timeout={220} unmountOnExit>
              <Box
                sx={{
                  px: 1.5,
                  pt: 1.25,
                  pb: 1.25,
                }}
              >
                <ChatMessageList
                  state={state}
                  onViewPlan={() => onAddTab('validation-plan')}
                  onApprovePlan={() => dispatch({ type: 'APPROVE_VALIDATION_PLAN' })}
                  onOpenSavedFiles={onOpenSavedFiles}
                  onOpenQaItem={onOpenQaItem}
                />
              </Box>
            </Collapse>
          </Box>
        </Box>

        <ChatComposer
          large
          showPoweredLine={false}
          loading={composerLoading}
          value={state.composerValue}
          placeholder={composerPlaceholder}
          attachedFileIds={state.attachedFileIds}
          attachedFolderIds={state.attachedFolderIds}
          onChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
          onSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
          onContextChange={({ fileIds, folderIds }) => dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds, folderIds })}
        />

        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', textAlign: 'center' }}>
          Datasite AI drafts answers with citations. Robbin controls review and routing.
        </Typography>
      </Stack>
    </Box>
  );
}

function ContextTabPill({
  tab,
  selected,
  onSelect,
  onClose,
}: {
  tab: RightCanvasTab;
  selected: boolean;
  onSelect: (tab: RightCanvasTab) => void;
  onClose: (tab: RightCanvasTab) => void;
}) {
  const meta = getRightCanvasTabMeta(tab);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(tab);
  };

  return (
    <Box
      role="tab"
      aria-selected={selected}
      tabIndex={0}
      onClick={() => onSelect(tab)}
      onKeyDown={handleKeyDown}
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
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
        },
      }}
    >
      <FontAwesomeIcon icon={meta.icon} style={{ fontSize: 12, flexShrink: 0 }} />
      <Box
        component="span"
        sx={{
          minWidth: 0,
          maxWidth: 210,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {meta.label}
      </Box>
      <Tooltip title={meta.closeLabel}>
        <IconButton
          size="small"
          aria-label={meta.closeLabel}
          onClick={(event) => {
            event.stopPropagation();
            onClose(tab);
          }}
          sx={{ width: 20, height: 20, ml: 0.25 }}
        >
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function RightCanvasTabContent({
  activeTab,
  state,
  dispatch,
  notesByRowId,
  onNoteChange,
  bottomInset,
  filesSource,
  onAddTab,
  onOpenFilePreview,
  onOpenQa,
  qaFocusTarget,
  selectedQaItemId,
}: {
  activeTab: RightCanvasTab | null;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
  bottomInset: number;
  filesSource: SellerIndexSource | null;
  onAddTab: (tab: RightCanvasTab) => void;
  onOpenFilePreview: (fileId: string) => void;
  onOpenQa: (target: QaFocusTarget) => void;
  qaFocusTarget: QaFocusTarget | null;
  selectedQaItemId: string | null;
}) {
  if (activeTab === 'validation-plan') {
    return (
      <ValidationPlanWorkspace
        state={state}
        dispatch={dispatch}
        bottomInset={bottomInset}
      />
    );
  }

  if (activeTab === 'enhanced-index') {
    return (
      <LegalReviewWorkspace
        state={state}
        dispatch={dispatch}
        bottomInset={bottomInset}
        notesByRowId={notesByRowId}
        onNoteChange={onNoteChange}
        onOpenSourceMetadata={(fileId) => onOpenFilePreview(fileId)}
      />
    );
  }

  if (activeTab === 'files') {
    const scopedFolderId = state.attachedFolderIds[0] ?? null;
    return (
      <RightContextCanvasFilesView
        bottomInset={bottomInset}
        source={filesSource ?? undefined}
        mode={scopedFolderId ? 'browse' : 'index'}
        selectedFolderId={scopedFolderId}
        attachedFileIds={state.attachedFileIds}
        attachedFolderIds={state.attachedFolderIds}
        onToggleFileAttachment={(fileId) => dispatch({ type: 'TOGGLE_ATTACHMENT', fileId })}
        onToggleFolderAttachment={(folderId) => {
          const nextFolderIds = state.attachedFolderIds.includes(folderId)
            ? state.attachedFolderIds.filter((id) => id !== folderId)
            : [...state.attachedFolderIds, folderId];
          dispatch({ type: 'SET_CONTEXT_REFERENCES', fileIds: state.attachedFileIds, folderIds: nextFolderIds });
        }}
        onOpenQa={onOpenQa}
        onOpenFile={(fileId) => onOpenFilePreview(fileId)}
      />
    );
  }

  if (activeTab === 'qa') {
    return (
      <RightContextCanvasQaView
        bottomInset={bottomInset}
        focusTarget={qaFocusTarget}
        selectedItemId={selectedQaItemId}
        onOpenFile={onOpenFilePreview}
      />
    );
  }

  if (activeTab === 'skills') {
    return <SkillsContextView bottomInset={bottomInset} />;
  }

  if (activeTab === 'templates') {
    return <TemplatesContextView bottomInset={bottomInset} />;
  }

  if (isFilePreviewCanvasTab(activeTab)) {
    const fileId = getFileIdFromTab(activeTab);
    return (
      <RightContextCanvasFileDetailView
        fileId={fileId}
        attached={state.attachedFileIds.includes(fileId)}
        bottomInset={bottomInset}
        onToggleAttachment={() => dispatch({ type: 'TOGGLE_ATTACHMENT', fileId })}
      />
    );
  }

  return <RightCanvasEmptyState onAddTab={onAddTab} />;
}

function RightCanvasEmptyState({ onAddTab }: { onAddTab: (tab: RightCanvasTab) => void }) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ width: 'min(360px, 100%)' }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 18 }} />
        </Box>
        <Stack spacing={0.5} alignItems="center">
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: 'text.primary' }}>
            No active context
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', lineHeight: 1.5 }}>
            Open Plan, Q&A table, Documents, or Q&amp;A beside the chat when you need supporting material.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faClipboardCheck} />}
            onClick={() => onAddTab('validation-plan')}
            sx={{ textTransform: 'none' }}
          >
            Plan
          </HaloButton>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faTableList} />}
            onClick={() => onAddTab('enhanced-index')}
            sx={{ textTransform: 'none' }}
          >
            Q&A table
          </HaloButton>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faFile} />}
            onClick={() => onAddTab('files')}
            sx={{ textTransform: 'none' }}
          >
            Documents
          </HaloButton>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faMessagesQuestion} />}
            onClick={() => onAddTab('qa')}
            sx={{ textTransform: 'none' }}
          >
            Q&amp;A
          </HaloButton>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faClipboardCheck} />}
            onClick={() => onAddTab('skills')}
            sx={{ textTransform: 'none' }}
          >
            Skills
          </HaloButton>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faBookOpenLines} />}
            onClick={() => onAddTab('templates')}
            sx={{ textTransform: 'none' }}
          >
            Templates
          </HaloButton>
        </Stack>
      </Stack>
    </Box>
  );
}

function SkillsContextView({ bottomInset }: { bottomInset: number }) {
  return (
    <ContextWorkspaceShell
      title="Skills"
      subtitle="Create reusable instructions that teach Datasite AI agents how to perform specific dealroom tasks."
      bottomInset={bottomInset}
    >
      <ContextWorkspaceSection
        eyebrow="Create from natural language"
        title="Describe the task once, then let agents form the skill"
        body="Robbin can ask for a reusable William Blair workflow such as a Churn / NRR buyer-response skill. Datasite AI turns the request into objective, inputs, permission checks, output format, and approval checkpoints."
      />
      <ContextWorkspaceSection
        eyebrow="Suggested skills"
        title="William Blair tech M&A starters"
        body="Churn / NRR buyer response; source-code disclosure review; open-source license check; GDPR / DPA evidence search; Round 1 buyer-safe answer drafting."
      />
      <ContextWorkspaceSection
        eyebrow="Agent journey"
        title="Draft skill build plan"
        body="Infer the objective, inspect available room sources, attach the right templates, define human approvals, and save the finished skill for future rooms."
      />
    </ContextWorkspaceShell>
  );
}

function TemplatesContextView({ bottomInset }: { bottomInset: number }) {
  return (
    <ContextWorkspaceShell
      title="Templates"
      subtitle="Add firm-approved playbooks, checklists, and output standards that agents can reference during dealroom work."
      bottomInset={bottomInset}
    >
      <ContextWorkspaceSection
        eyebrow="Upload or describe"
        title="Bring William Blair playbooks into Datasite AI"
        body="The user can upload response templates or describe the output standard they want, then agents classify the template and connect it to search, Q&A, disclosure, and reporting workflows."
      />
      <ContextWorkspaceSection
        eyebrow="Template categories"
        title="Reusable dealroom standards"
        body="Q&A response templates; technology M&A diligence playbooks; Round 1 disclosure rules; senior banker update format; ARR / churn analysis checklist; source-code and IP review checklist."
      />
      <ContextWorkspaceSection
        eyebrow="Agent grounding"
        title="Preferred outputs, not generic answers"
        body="When Datasite AI runs a skill, it references the relevant firm template so cited outputs follow the banker’s expected structure, wording, and approval path."
      />
    </ContextWorkspaceShell>
  );
}

function ContextWorkspaceShell({
  title,
  subtitle,
  bottomInset,
  children,
}: {
  title: string;
  subtitle: string;
  bottomInset: number;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        px: 3,
        pt: 3,
        pb: `calc(${bottomInset}px + 24px)`,
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

function ContextWorkspaceSection({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Stack
      spacing={0.75}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.5,
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase' }}>
        {eyebrow}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12.5, lineHeight: 1.55, color: 'text.secondary' }}>
        {body}
      </Typography>
    </Stack>
  );
}
