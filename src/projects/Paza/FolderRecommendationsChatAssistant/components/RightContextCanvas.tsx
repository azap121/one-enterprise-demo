import { useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowDownLeftAndArrowUpRightToCenter,
  faArrowUpRightAndArrowDownLeftFromCenter,
  faChevronDown,
  faChevronUp,
  faFile,
  faFolderTree,
  faMessagesQuestion,
  faPlus,
  faSidebarFlip,
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
import FolderReviewWorkspace from './FolderReviewWorkspace';
import RightContextCanvasFileDetailView from './RightContextCanvasFileDetailView';
import RightContextCanvasFilesView from './RightContextCanvasFilesView';
import RightContextCanvasQaView from './RightContextCanvasQaView';
import { createAppliedFilesSource } from './appliedFilesSource';
import { findSellerFileById, registerRuntimeSellerFiles, type SellerIndexSource } from './rightCanvasFileData';
import { selectCompositedTree } from '../state/reducer';
import type { WorkspaceAction, WorkspaceState } from '../state/types';

type BaseRightCanvasTab = 'enhanced-index' | 'files' | 'qa';
type FilePreviewCanvasTab = `file:${string}`;

export type RightCanvasTab = BaseRightCanvasTab | FilePreviewCanvasTab;

interface Props {
  openTabs: RightCanvasTab[];
  activeTab: RightCanvasTab | null;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  expanded: boolean;
  onHideCanvas: () => void;
  onExpandCanvas: () => void;
  onRestoreCanvas: () => void;
  onAddTab: (tab: RightCanvasTab) => void;
  onSelectTab: (tab: RightCanvasTab) => void;
  onCloseTab: (tab: RightCanvasTab) => void;
  onOpenSavedFiles: () => void;
  entering?: boolean;
}

const FILE_PREVIEW_TAB_PREFIX = 'file:';

const RIGHT_CANVAS_TAB_META: Record<BaseRightCanvasTab, { label: string; icon: IconDefinition; closeLabel: string }> = {
  'enhanced-index': {
    label: 'Enhanced Index',
    icon: faFolderTree,
    closeLabel: 'Remove Enhanced Index tab',
  },
  files: {
    label: 'Files',
    icon: faFile,
    closeLabel: 'Remove Files tab',
  },
  qa: {
    label: 'Q&A',
    icon: faMessagesQuestion,
    closeLabel: 'Remove Q&A tab',
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

export default function RightContextCanvas({
  openTabs,
  activeTab,
  state,
  dispatch,
  expanded,
  onHideCanvas,
  onExpandCanvas,
  onRestoreCanvas,
  onAddTab,
  onSelectTab,
  onCloseTab,
  onOpenSavedFiles,
  entering = false,
}: Props) {
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [threadExpanded, setThreadExpanded] = useState(false);

  const addMenuOpen = Boolean(addMenuAnchorEl);
  const reviewActive = openTabs.includes('enhanced-index');
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
    registerRuntimeSellerFiles(appliedFilesSource?.files ?? []);
  }, [appliedFilesSource]);

  const openAddMenu = (event: MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const closeAddMenu = () => {
    setAddMenuAnchorEl(null);
  };

  const addContextTab = (tab: BaseRightCanvasTab) => {
    onAddTab(tab);
    closeAddMenu();
  };

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        p: 1,
        boxSizing: 'border-box',
      }}
    >
      <Stack
        sx={{
          height: '100%',
          minHeight: 0,
          borderRadius: '16px',
          bgcolor: 'background.paper',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            minHeight: 44,
            px: 2,
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
              sx={{ width: 28, height: 28, flexShrink: 0 }}
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
            <MenuItem onClick={() => addContextTab('files')}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faFile} style={{ fontSize: 15 }} />
              </ListItemIcon>
              <ListItemText
                primary="Files"
                secondary="Browse the seller-side index"
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
                secondary="Review submitted diligence questions"
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
              sx={{ width: 28, height: 28 }}
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
              sx={{ width: 28, height: 28 }}
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
            opacity: entering ? 0 : 1,
            transform: entering ? 'translateX(24px)' : 'translateX(0)',
            transition: 'opacity 240ms cubic-bezier(0.2, 0, 0, 1), transform 360ms cubic-bezier(0.2, 0, 0, 1)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <RightCanvasTabContent
              activeTab={activeTab}
              state={state}
              dispatch={dispatch}
              entering={entering}
              bottomInset={expandedContentBottomInset}
              filesSource={appliedFilesSource}
              onAddTab={onAddTab}
            />
          </Box>
          {expanded ? (
            <ExpandedCanvasAssistantDock
              state={state}
              dispatch={dispatch}
              reviewActive={reviewActive}
              threadExpanded={threadExpanded}
              onToggleThread={() => setThreadExpanded((current) => !current)}
              onReview={() => onAddTab('enhanced-index')}
              onOpenSavedFiles={onOpenSavedFiles}
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
  reviewActive,
  threadExpanded,
  onToggleThread,
  onReview,
  onOpenSavedFiles,
}: {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  reviewActive: boolean;
  threadExpanded: boolean;
  onToggleThread: () => void;
  onReview: () => void;
  onOpenSavedFiles: () => void;
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
                  onReview={onReview}
                  reviewActive={reviewActive}
                  onShowRationale={() => dispatch({ type: 'SHOW_RATIONALE' })}
                  onOpenSavedFiles={onOpenSavedFiles}
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
          attachedFileIds={state.attachedFileIds}
          onChange={(value) => dispatch({ type: 'CHAT_PROMPT_CHANGED', value })}
          onSubmit={(prompt) => dispatch({ type: 'CHAT_PROMPT_SUBMITTED', prompt })}
          onAttachmentsChange={(fileIds) => dispatch({ type: 'SET_ATTACHMENTS', fileIds })}
        />

        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', textAlign: 'center' }}>
          Powered by Blueflame AI. Always review for accuracy.
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
  entering,
  bottomInset,
  filesSource,
  onAddTab,
}: {
  activeTab: RightCanvasTab | null;
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  entering: boolean;
  bottomInset: number;
  filesSource: SellerIndexSource | null;
  onAddTab: (tab: RightCanvasTab) => void;
}) {
  if (activeTab === 'enhanced-index') {
    return (
      <FolderReviewWorkspace
        state={state}
        dispatch={dispatch}
        autoFocusDelayMs={entering ? 460 : 0}
        bottomInset={bottomInset}
      />
    );
  }

  if (activeTab === 'files') {
    return (
      <RightContextCanvasFilesView
        bottomInset={bottomInset}
        source={filesSource ?? undefined}
        onOpenFile={(fileId) => onAddTab(makeFilePreviewCanvasTab(fileId))}
      />
    );
  }

  if (activeTab === 'qa') {
    return <RightContextCanvasQaView bottomInset={bottomInset} />;
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
            Open a workspace beside the chat when you need supporting material.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap>
          <HaloButton
            size="small"
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faFile} />}
            onClick={() => onAddTab('files')}
            sx={{ textTransform: 'none' }}
          >
            Files
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
        </Stack>
      </Stack>
    </Box>
  );
}
