import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  faArrowLeft,
  faCheck,
  faChevronRight,
  faCircleInfo,
  faEye,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFilter,
  faFolderOpen,
  faFolderTree,
  faMagnifyingGlass,
  faMessagesQuestion,
  faPaperclip,
  faSidebarFlip,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Divider, Fade, IconButton, InputBase, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import type { QaFocusTarget } from './RightContextCanvasQaView';
import {
  DOCUMENT_CATEGORIES,
  SELLER_INDEX_SOURCE,
  findSellerFolderById,
  findSellerFolderNodeById,
  getCategoryCounts,
  getCategoryPath,
  getChildCategoryIds,
  type DocumentChildCategory,
  type DocumentParentCategory,
  type SellerIndexFile,
  type SellerIndexFileNode,
  type SellerIndexFolder,
  type SellerIndexFolderNode,
  type SellerIndexNode,
  type SellerIndexSource,
} from './rightCanvasFileData';

const FILE_PREVIEW_WIDTH = 292;
const FILE_PREVIEW_HEIGHT = 392;
const FILE_PREVIEW_GAP = 16;

type FilePreviewAnchor = {
  fileId: string;
  top: number;
  left: number;
};

interface Props {
  onOpenFile: (fileId: string) => void;
  bottomInset?: number;
  mode?: 'index' | 'browse';
  selectedFolderId?: string | null;
  onSelectedFolderChange?: (folderId: string | null) => void;
  attachedFileIds?: string[];
  attachedFolderIds?: string[];
  onToggleFileAttachment?: (fileId: string) => void;
  onToggleFolderAttachment?: (folderId: string) => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onShowHiddenPreview?: () => void;
  source?: SellerIndexSource;
}

export default function RightContextCanvasFilesView({
  onOpenFile,
  bottomInset = 0,
  mode = 'index',
  selectedFolderId = null,
  onSelectedFolderChange,
  attachedFileIds = [],
  attachedFolderIds = [],
  onToggleFileAttachment,
  onToggleFolderAttachment,
  onOpenQa,
  onShowHiddenPreview,
  source = SELLER_INDEX_SOURCE,
}: Props) {
  const [categoryAnchorEl, setCategoryAnchorEl] = useState<HTMLElement | null>(null);
  const [activeCategoryParentId, setActiveCategoryParentId] = useState(DOCUMENT_CATEGORIES[0]?.id ?? '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [internalSelectedFolderId, setInternalSelectedFolderId] = useState<string | null>(selectedFolderId);
  const [filePreviewAnchor, setFilePreviewAnchor] = useState<FilePreviewAnchor | null>(null);
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);
  const previewCloseTimerRef = useRef<number | null>(null);

  const effectiveSelectedFolderId = onSelectedFolderChange ? selectedFolderId : internalSelectedFolderId;
  const setEffectiveSelectedFolderId = onSelectedFolderChange ?? setInternalSelectedFolderId;
  const queryValue = query.trim();
  const normalizedQuery = normalize(queryValue);
  const categoryCounts = useMemo(() => getCategoryCounts(source.files), [source.files]);
  const activeCategoryParent = DOCUMENT_CATEGORIES.find((category) => category.id === activeCategoryParentId) ?? DOCUMENT_CATEGORIES[0];
  const visibleTree = useMemo(
    () => filterTreeByCategory(source.tree, selectedCategoryIds),
    [source.tree, selectedCategoryIds]
  );
  const selectedFolder = useMemo(
    () => effectiveSelectedFolderId ? findSellerFolderById(effectiveSelectedFolderId, source) : null,
    [effectiveSelectedFolderId, source]
  );
  const selectedFolderNode = useMemo(
    () => effectiveSelectedFolderId ? findSellerFolderNodeById(effectiveSelectedFolderId, source.tree) : null,
    [effectiveSelectedFolderId, source.tree]
  );
  const browseNodes = useMemo(
    () => selectedFolderNode?.children ?? source.tree,
    [selectedFolderNode, source.tree]
  );
  const visibleBrowseNodes = useMemo(
    () => filterTreeByCategory(browseNodes, selectedCategoryIds),
    [browseNodes, selectedCategoryIds]
  );
  const hoveredFile = useMemo(
    () => source.files.find((file) => file.id === filePreviewAnchor?.fileId) ?? null,
    [source.files, filePreviewAnchor?.fileId]
  );
  const searchResults = useMemo(
    () => getSearchResults(normalizedQuery, source),
    [normalizedQuery, source]
  );

  const openCategoryMenu = (event: MouseEvent<HTMLElement>) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const closeCategoryMenu = () => {
    setCategoryAnchorEl(null);
  };

  const selectParentCategory = (category: DocumentParentCategory) => {
    setSelectedCategoryIds([category.id, ...getChildCategoryIds(category.id)]);
    setSelectedCategoryLabel(category.name);
    setActiveCategoryParentId(category.id);
    closeCategoryMenu();
  };

  const selectChildCategory = (parent: DocumentParentCategory, child: DocumentChildCategory) => {
    setSelectedCategoryIds([child.id]);
    setSelectedCategoryLabel(`${parent.name} / ${child.name}`);
    setActiveCategoryParentId(parent.id);
    closeCategoryMenu();
  };

  const clearCategory = () => {
    setSelectedCategoryIds([]);
    setSelectedCategoryLabel(null);
  };

  const openFile = (fileId: string) => {
    onOpenFile(fileId);
    setFilePreviewAnchor(null);
  };

  const cancelPreviewClear = () => {
    if (previewCloseTimerRef.current) {
      window.clearTimeout(previewCloseTimerRef.current);
      previewCloseTimerRef.current = null;
    }
  };

  const schedulePreviewClear = () => {
    cancelPreviewClear();
    previewCloseTimerRef.current = window.setTimeout(() => {
      setFilePreviewAnchor(null);
      previewCloseTimerRef.current = null;
    }, 120);
  };

  const previewFile = (fileId: string, anchorElement: HTMLElement) => {
    const surfaceElement = previewSurfaceRef.current;
    if (!surfaceElement) {
      setFilePreviewAnchor({ fileId, top: 12, left: FILE_PREVIEW_GAP });
      return;
    }

    cancelPreviewClear();

    const surfaceRect = surfaceElement.getBoundingClientRect();
    const anchorRect = anchorElement.getBoundingClientRect();

    const preferredRight = anchorRect.right - surfaceRect.left + FILE_PREVIEW_GAP;
    const preferredLeft = anchorRect.left - surfaceRect.left - FILE_PREVIEW_WIDTH - FILE_PREVIEW_GAP;
    const availableRight = surfaceRect.width - preferredRight;
    const nextLeft = clamp(
      availableRight >= FILE_PREVIEW_WIDTH + FILE_PREVIEW_GAP ? preferredRight : preferredLeft,
      FILE_PREVIEW_GAP,
      Math.max(FILE_PREVIEW_GAP, surfaceRect.width - FILE_PREVIEW_WIDTH - FILE_PREVIEW_GAP)
    );
    const iconCenterY = anchorRect.top - surfaceRect.top + anchorRect.height / 2;
    const nextTop = clamp(
      iconCenterY - 32,
      12,
      Math.max(12, surfaceRect.height - FILE_PREVIEW_HEIGHT - 12)
    );

    setFilePreviewAnchor({ fileId, top: nextTop, left: nextLeft });
  };

  useEffect(() => {
    return () => cancelPreviewClear();
  }, []);

  useEffect(() => {
    setInternalSelectedFolderId(selectedFolderId);
  }, [selectedFolderId]);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.25} sx={{ px: 2.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: 'text.primary' }}>
              {source.title}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {source.subtitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end" sx={{ minWidth: 0 }}>
            {selectedCategoryLabel ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  maxWidth: 260,
                  minHeight: 28,
                  px: 1,
                  borderRadius: '999px',
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                }}
              >
                <Typography
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 12.5,
                  }}
                >
                  {selectedCategoryLabel}
                </Typography>
                <Tooltip title="Clear category">
                  <IconButton size="small" aria-label="Clear category" onClick={clearCategory} sx={{ width: 18, height: 18 }}>
                    <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : null}

            <HaloButton
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faFilter} />}
              onClick={openCategoryMenu}
              sx={{ minHeight: 28, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Categories
            </HaloButton>

            <SearchControl
              open={searchOpen}
              query={query}
              onOpen={() => setSearchOpen(true)}
              onQueryChange={setQuery}
              onClose={() => {
                setQuery('');
                setSearchOpen(false);
              }}
            />

            {onShowHiddenPreview ? (
              <Tooltip title="Show document preview">
                <IconButton
                  size="small"
                  aria-label="Show document preview"
                  onClick={onShowHiddenPreview}
                  sx={{ width: 30, height: 30, flexShrink: 0 }}
                >
                  <FontAwesomeIcon icon={faSidebarFlip} style={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>
      </Stack>

      <Popover
        open={Boolean(categoryAnchorEl)}
        anchorEl={categoryAnchorEl}
        onClose={closeCategoryMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 520,
              maxWidth: 'min(520px, calc(100vw - 32px))',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0px 16px 44px rgba(0, 0, 0, 0.14)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ maxHeight: 438 }}>
          <Stack sx={{ width: 250, py: 1, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
            <Typography sx={{ px: 1.5, py: 0.75, fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
              Parent categories
            </Typography>
            {DOCUMENT_CATEGORIES.map((category) => (
              <CategoryParentRow
                key={category.id}
                category={category}
                count={categoryCounts[category.id] ?? 0}
                active={activeCategoryParentId === category.id}
                selected={selectedCategoryIds.includes(category.id)}
                onFocusCategory={() => setActiveCategoryParentId(category.id)}
                onSelectCategory={() => selectParentCategory(category)}
              />
            ))}
          </Stack>

          <Stack sx={{ flex: 1, minWidth: 0, p: 1, overflow: 'auto' }}>
            {activeCategoryParent ? (
              <>
                <Stack
                  role="button"
                  tabIndex={0}
                  onClick={() => selectParentCategory(activeCategoryParent)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectParentCategory(activeCategoryParent);
                    }
                  }}
                  sx={{
                    px: 1,
                    py: 1,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    outline: 'none',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    All in {activeCategoryParent.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {categoryCounts[activeCategoryParent.id] ?? 0} documents across child categories
                  </Typography>
                </Stack>
                <Divider sx={{ my: 0.75 }} />
                {activeCategoryParent.children.map((child) => (
                  <CategoryChildRow
                    key={child.id}
                    parent={activeCategoryParent}
                    child={child}
                    count={categoryCounts[child.id] ?? 0}
                    selected={selectedCategoryIds.includes(child.id)}
                    onSelect={() => selectChildCategory(activeCategoryParent, child)}
                  />
                ))}
              </>
            ) : null}
          </Stack>
        </Stack>
      </Popover>

      <Box
        ref={previewSurfaceRef}
        sx={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {normalizedQuery ? (
          <SearchResultsView
            results={searchResults}
            query={queryValue}
            bottomInset={bottomInset}
            attachedFileIds={attachedFileIds}
            onOpenFile={openFile}
            onToggleFileAttachment={onToggleFileAttachment}
            onOpenQa={onOpenQa}
            onPreviewFile={previewFile}
            onClearPreview={schedulePreviewClear}
            onSelectParent={selectParentCategory}
            onSelectChild={selectChildCategory}
          />
        ) : mode === 'browse' ? (
          <FolderBrowseView
            nodes={visibleBrowseNodes}
            selectedFolder={selectedFolder}
            bottomInset={bottomInset}
            attachedFileIds={attachedFileIds}
            attachedFolderIds={attachedFolderIds}
            onOpenFolder={(folderId) => setEffectiveSelectedFolderId(folderId)}
            onBackToRoot={() => setEffectiveSelectedFolderId(null)}
            onOpenFile={openFile}
            onToggleFileAttachment={onToggleFileAttachment}
            onToggleFolderAttachment={onToggleFolderAttachment}
            onOpenQa={onOpenQa}
            onPreviewFile={previewFile}
            onClearPreview={schedulePreviewClear}
          />
        ) : (
          <Box
            role="tree"
            aria-label={`${source.subtitle} file index`}
            onMouseLeave={schedulePreviewClear}
            sx={{
              height: '100%',
              minHeight: 0,
              overflow: 'auto',
              overscrollBehavior: 'contain',
              px: 2,
              pb: bottomInset ? `${bottomInset}px` : 2,
              transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <Box sx={{ minWidth: 760, py: 0.5 }}>
          {visibleTree.map((node) => (
            <SellerIndexTreeNode
              key={node.id}
              node={node}
              depth={0}
              attachedFileIds={attachedFileIds}
              onOpenFile={openFile}
              onToggleFileAttachment={onToggleFileAttachment}
              onOpenQa={onOpenQa}
              onPreviewFile={previewFile}
              onClearPreview={schedulePreviewClear}
            />
              ))}
            </Box>
          </Box>
        )}

        <FileHoverPreview
          file={hoveredFile}
          anchor={filePreviewAnchor}
          attached={hoveredFile ? attachedFileIds.includes(hoveredFile.id) : false}
          onOpenFile={openFile}
          onToggleAttachment={onToggleFileAttachment}
          onOpenQa={onOpenQa}
          onKeepPreview={cancelPreviewClear}
          onClearPreview={schedulePreviewClear}
        />
      </Box>
    </Box>
  );
}

function FolderBrowseView({
  nodes,
  selectedFolder,
  bottomInset,
  attachedFileIds,
  attachedFolderIds,
  onOpenFolder,
  onBackToRoot,
  onOpenFile,
  onToggleFileAttachment,
  onToggleFolderAttachment,
  onOpenQa,
  onPreviewFile,
  onClearPreview,
}: {
  nodes: SellerIndexNode[];
  selectedFolder: SellerIndexFolder | null;
  bottomInset: number;
  attachedFileIds: string[];
  attachedFolderIds: string[];
  onOpenFolder: (folderId: string) => void;
  onBackToRoot: () => void;
  onOpenFile: (fileId: string) => void;
  onToggleFileAttachment?: (fileId: string) => void;
  onToggleFolderAttachment?: (folderId: string) => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
}) {
  const folderPath = selectedFolder ? [...selectedFolder.folderPath, selectedFolder.name] : ['Documents'];

  return (
    <Stack
      spacing={1}
      onMouseLeave={onClearPreview}
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
        overscrollBehavior: 'contain',
        px: 2,
        pb: bottomInset ? `${bottomInset}px` : 2,
        transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 36, minWidth: 760 }}>
        {selectedFolder ? (
          <HaloButton
            size="small"
            variant="text"
            startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={onBackToRoot}
            sx={{ minHeight: 28, textTransform: 'none', color: 'text.secondary' }}
          >
            All documents
          </HaloButton>
        ) : null}
        <Typography
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12.5,
            color: 'text.secondary',
          }}
        >
          {folderPath.join(' / ')}
        </Typography>
        {selectedFolder ? (
          <Typography sx={{ ml: 'auto', fontSize: 12, color: 'text.disabled', whiteSpace: 'nowrap' }}>
            View only
          </Typography>
        ) : null}
      </Stack>

      <Box role="tree" aria-label={selectedFolder ? `${selectedFolder.name} folder contents` : 'Top-level document folders'}>
        <Box sx={{ minWidth: 760, py: 0.5 }}>
          {nodes.length > 0 ? (
            nodes.map((node) => (
              <FolderBrowseRow
                key={node.id}
                node={node}
                attached={node.kind === 'folder' ? attachedFolderIds.includes(node.id) : attachedFileIds.includes(node.id)}
                onOpenFolder={onOpenFolder}
                onOpenFile={onOpenFile}
                onToggleAttachment={
                  node.kind === 'folder'
                    ? onToggleFolderAttachment
                      ? () => onToggleFolderAttachment(node.id)
                      : undefined
                    : onToggleFileAttachment
                      ? () => onToggleFileAttachment(node.id)
                      : undefined
                }
                onOpenQa={onOpenQa}
                onPreviewFile={onPreviewFile}
                onClearPreview={onClearPreview}
              />
            ))
          ) : (
            <Stack spacing={1} alignItems="center" sx={{ py: 8, color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faFolderTree} style={{ fontSize: 22 }} />
              <Typography sx={{ fontSize: 13 }}>No documents match the current category filter.</Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

function FolderBrowseRow({
  node,
  attached,
  onOpenFolder,
  onOpenFile,
  onToggleAttachment,
  onOpenQa,
  onPreviewFile,
  onClearPreview,
}: {
  node: SellerIndexNode;
  attached: boolean;
  onOpenFolder: (folderId: string) => void;
  onOpenFile: (fileId: string) => void;
  onToggleAttachment?: () => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
}) {
  const isFolder = node.kind === 'folder';
  const childCounts = isFolder ? getFolderChildCounts(node) : null;
  const actionsEnabled = Boolean(onToggleAttachment || onOpenQa);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (isFolder) {
      onOpenFolder(node.id);
      return;
    }
    onOpenFile(node.id);
  };

  return (
    <Stack
      className="document-index-row"
      role={isFolder ? 'treeitem' : 'button'}
      tabIndex={0}
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={() => {
        if (isFolder) onOpenFolder(node.id);
        else onOpenFile(node.id);
      }}
      onKeyDown={handleKeyDown}
      sx={{
        minHeight: 36,
        pr: 1,
        borderRadius: 1,
        color: isFolder ? 'text.primary' : 'text.secondary',
        cursor: 'pointer',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Typography sx={{ width: 72, flexShrink: 0, fontSize: 12.5, color: 'text.secondary' }}>
        {node.index}
      </Typography>
      {isFolder ? (
        <Box sx={{ width: 18, flexShrink: 0, color: 'text.secondary' }}>
          <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 14 }} />
        </Box>
      ) : (
        <FilePreviewIcon
          fileId={node.id}
          fileName={node.name}
          onPreviewFile={onPreviewFile}
          onClearPreview={onClearPreview}
        />
      )}
      <Typography
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          fontSize: 13.5,
          fontWeight: isFolder ? 500 : 400,
          color: isFolder ? 'text.primary' : 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {node.name}
      </Typography>
      {isFolder && childCounts ? (
        <Typography sx={{ flex: '0 0 auto', fontSize: 12, color: 'text.disabled' }}>
          {childCounts.folderCount} folders · {childCounts.fileCount} files
        </Typography>
      ) : null}
      {node.kind === 'file' ? (
        <Typography
          sx={{
            flex: '0 0 auto',
            maxWidth: 180,
            fontSize: 12,
            color: 'text.disabled',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.meta}
        </Typography>
      ) : null}
      {actionsEnabled ? (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
          <FileActionRail
            id={node.id}
            label={node.name}
            type={node.kind}
            attached={attached}
            onOpenFile={node.kind === 'file' ? onOpenFile : undefined}
            onToggleAttachment={onToggleAttachment}
            onOpenQa={onOpenQa}
          />
          {isFolder ? <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} /> : null}
        </Stack>
      ) : isFolder ? (
        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
      ) : null}
    </Stack>
  );
}

function getFolderChildCounts(folder: SellerIndexFolderNode) {
  return folder.children.reduce(
    (counts, child) => {
      if (child.kind === 'folder') counts.folderCount += 1;
      else counts.fileCount += 1;
      return counts;
    },
    { folderCount: 0, fileCount: 0 }
  );
}

function hasExistingQuestion(targetId: string) {
  return new Set(['soc2', 'security', 'escrow-deed', 'oss-register', 'patent-assignment-schedule']).has(targetId);
}

function getQaMode(targetId: string): QaFocusTarget['mode'] {
  return hasExistingQuestion(targetId) ? 'view' : 'ask';
}

function getQaLabel(targetId: string) {
  return getQaMode(targetId) === 'view' ? 'View Q&A' : 'Ask question';
}

function SearchControl({
  open,
  query,
  onOpen,
  onQueryChange,
  onClose,
}: {
  open: boolean;
  query: string;
  onOpen: () => void;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        width: open ? 250 : 30,
        minWidth: open ? 250 : 30,
        height: 30,
        borderRadius: '999px',
        border: open ? '1px solid' : '1px solid transparent',
        borderColor: open ? 'divider' : 'transparent',
        bgcolor: open ? 'background.paper' : 'transparent',
        overflow: 'hidden',
        transition: 'width 180ms cubic-bezier(0.2, 0, 0, 1), min-width 180ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <Tooltip title={open ? 'Search files' : 'Open search'}>
        <IconButton size="small" aria-label={open ? 'Search files' : 'Open search'} onClick={onOpen} sx={{ width: 30, height: 30, flexShrink: 0 }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
      {open ? (
        <>
          <InputBase
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search files, folders, categories"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: 12.5,
              color: 'text.primary',
              '& input::placeholder': { color: 'text.disabled', opacity: 1 },
            }}
          />
          <Tooltip title="Close search">
            <IconButton size="small" aria-label="Close search" onClick={onClose} sx={{ width: 26, height: 26, flexShrink: 0 }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
            </IconButton>
          </Tooltip>
        </>
      ) : null}
    </Stack>
  );
}

function CategoryParentRow({
  category,
  count,
  active,
  selected,
  onFocusCategory,
  onSelectCategory,
}: {
  category: DocumentParentCategory;
  count: number;
  active: boolean;
  selected: boolean;
  onFocusCategory: () => void;
  onSelectCategory: () => void;
}) {
  return (
    <Stack
      role="button"
      tabIndex={0}
      direction="row"
      alignItems="center"
      spacing={1}
      onMouseEnter={onFocusCategory}
      onFocus={onFocusCategory}
      onClick={onSelectCategory}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectCategory();
        }
      }}
      sx={{
        mx: 0.75,
        px: 0.75,
        minHeight: 34,
        borderRadius: 1.5,
        bgcolor: active ? 'action.hover' : 'transparent',
        color: selected ? 'text.primary' : 'text.secondary',
        cursor: 'pointer',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 12.5,
          fontWeight: selected ? 500 : 400,
        }}
      >
        {category.name}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{count}</Typography>
      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 10 }} />
    </Stack>
  );
}

function CategoryChildRow({
  parent,
  child,
  count,
  selected,
  onSelect,
}: {
  parent: DocumentParentCategory;
  child: DocumentChildCategory;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Stack
      role="button"
      tabIndex={0}
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      aria-label={`${parent.name} ${child.name}`}
      sx={{
        px: 1,
        minHeight: 32,
        borderRadius: 1.5,
        cursor: 'pointer',
        bgcolor: selected ? 'action.hover' : 'transparent',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, color: selected ? 'text.primary' : 'text.secondary' }}>
        {child.name}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{count}</Typography>
    </Stack>
  );
}

function SellerIndexTreeNode({
  node,
  depth,
  attachedFileIds,
  onOpenFile,
  onToggleFileAttachment,
  onOpenQa,
  onPreviewFile,
  onClearPreview,
}: {
  node: SellerIndexNode;
  depth: number;
  attachedFileIds: string[];
  onOpenFile: (fileId: string) => void;
  onToggleFileAttachment?: (fileId: string) => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
}) {
  const isFolder = node.kind === 'folder';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isFolder || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onOpenFile(node.id);
  };

  return (
    <Box role="treeitem" aria-label={`${node.index} ${node.name}`}>
      <Stack
        className="document-index-row"
        direction="row"
        alignItems="center"
        spacing={1}
        role={isFolder ? undefined : 'button'}
        tabIndex={isFolder ? undefined : 0}
        onClick={isFolder ? undefined : () => onOpenFile(node.id)}
        onKeyDown={handleKeyDown}
        sx={{
          minHeight: 32,
          pl: depth * 2.5,
          pr: 1,
          borderRadius: 1,
          color: isFolder ? 'text.primary' : 'text.secondary',
          cursor: isFolder ? 'default' : 'pointer',
          outline: 'none',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&:focus-visible': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
          },
        }}
      >
        <Typography sx={{ width: 72, flexShrink: 0, fontSize: 12.5, color: 'text.secondary' }}>
          {node.index}
        </Typography>
        {isFolder ? (
          <Box sx={{ width: 18, flexShrink: 0, color: 'text.secondary' }}>
            <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 14 }} />
          </Box>
        ) : (
          <FilePreviewIcon
            fileId={node.id}
            fileName={node.name}
            onPreviewFile={onPreviewFile}
            onClearPreview={onClearPreview}
          />
        )}
        <Typography
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            fontSize: 13.5,
            fontWeight: isFolder ? 500 : 400,
            color: isFolder ? 'text.primary' : 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.name}
        </Typography>
        {node.kind === 'file' ? (
          <Typography
            sx={{
              flex: '0 0 auto',
              maxWidth: 180,
              fontSize: 12,
              color: 'text.disabled',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.meta}
          </Typography>
        ) : null}
        {node.kind === 'file' ? (
          <FileActionRail
            id={node.id}
            label={node.name}
            type="file"
            attached={attachedFileIds.includes(node.id)}
            onOpenFile={onOpenFile}
            onToggleAttachment={onToggleFileAttachment ? () => onToggleFileAttachment(node.id) : undefined}
            onOpenQa={onOpenQa}
          />
        ) : null}
      </Stack>
      {node.kind === 'folder' ? (
        node.children.map((child) => (
          <SellerIndexTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            attachedFileIds={attachedFileIds}
            onOpenFile={onOpenFile}
            onToggleFileAttachment={onToggleFileAttachment}
            onOpenQa={onOpenQa}
            onPreviewFile={onPreviewFile}
            onClearPreview={onClearPreview}
          />
        ))
      ) : null}
    </Box>
  );
}

function SearchResultsView({
  results,
  query,
  bottomInset,
  attachedFileIds,
  onOpenFile,
  onToggleFileAttachment,
  onOpenQa,
  onPreviewFile,
  onClearPreview,
  onSelectParent,
  onSelectChild,
}: {
  results: SearchResults;
  query: string;
  bottomInset: number;
  attachedFileIds: string[];
  onOpenFile: (fileId: string) => void;
  onToggleFileAttachment?: (fileId: string) => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
  onSelectParent: (category: DocumentParentCategory) => void;
  onSelectChild: (parent: DocumentParentCategory, child: DocumentChildCategory) => void;
}) {
  const empty = results.files.length === 0 && results.folders.length === 0 && results.categories.length === 0;

  return (
    <Stack
      spacing={1.5}
      onMouseLeave={onClearPreview}
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
        overscrollBehavior: 'contain',
        px: 2.5,
        pb: bottomInset ? `${bottomInset}px` : 2,
        transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <Typography sx={{ pt: 1, fontSize: 12.5, color: 'text.secondary' }}>
        Search results for <Box component="span" sx={{ color: 'text.primary' }}>{query}</Box>
      </Typography>

      {empty ? (
        <Stack spacing={1} alignItems="center" sx={{ py: 8, color: 'text.secondary' }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 22 }} />
          <Typography sx={{ fontSize: 13 }}>No matching files, folders, or categories.</Typography>
        </Stack>
      ) : (
        <>
          <ResultSection title="Files" count={results.files.length}>
            {results.files.map((file) => (
              <SearchFileRow
                key={file.id}
                file={file}
                attached={attachedFileIds.includes(file.id)}
                onOpenFile={onOpenFile}
                onToggleAttachment={onToggleFileAttachment ? () => onToggleFileAttachment(file.id) : undefined}
                onOpenQa={onOpenQa}
                onPreviewFile={onPreviewFile}
                onClearPreview={onClearPreview}
              />
            ))}
          </ResultSection>

          <ResultSection title="Folders" count={results.folders.length}>
            {results.folders.map((folder) => (
              <Stack key={folder.id} direction="row" spacing={1} alignItems="center" sx={{ minHeight: 30, color: 'text.secondary' }}>
                <Typography sx={{ width: 72, flexShrink: 0, fontSize: 12 }}>{folder.index}</Typography>
                <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{folder.name}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {folder.folderPath.join(' / ')}
                </Typography>
              </Stack>
            ))}
          </ResultSection>

          <ResultSection title="Categories" count={results.categories.length}>
            {results.categories.map((category) => (
              <Stack
                key={`${category.parent.id}-${category.child?.id ?? 'all'}`}
                role="button"
                tabIndex={0}
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={() => (category.child ? onSelectChild(category.parent, category.child) : onSelectParent(category.parent))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    category.child ? onSelectChild(category.parent, category.child) : onSelectParent(category.parent);
                  }
                }}
                sx={{
                  minHeight: 30,
                  borderRadius: 1,
                  cursor: 'pointer',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <FontAwesomeIcon icon={faFolderTree} style={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: 13, color: 'text.primary' }}>
                  {category.child ? `${category.parent.name} / ${category.child.name}` : category.parent.name}
                </Typography>
              </Stack>
            ))}
          </ResultSection>
        </>
      )}
    </Stack>
  );
}

function ResultSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;

  return (
    <Stack spacing={0.5}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
        {title} ({count})
      </Typography>
      {children}
    </Stack>
  );
}

function SearchFileRow({
  file,
  attached,
  onOpenFile,
  onToggleAttachment,
  onOpenQa,
  onPreviewFile,
  onClearPreview,
}: {
  file: SellerIndexFile;
  attached: boolean;
  onOpenFile: (fileId: string) => void;
  onToggleAttachment?: () => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
}) {
  return (
    <Stack
      className="document-index-row"
      role="button"
      tabIndex={0}
      direction="row"
      spacing={1}
      alignItems="center"
      onClick={() => onOpenFile(file.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenFile(file.id);
        }
      }}
      sx={{
        minHeight: 32,
        borderRadius: 1,
        cursor: 'pointer',
        color: 'text.secondary',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography sx={{ width: 72, flexShrink: 0, fontSize: 12 }}>{file.index}</Typography>
      <FilePreviewIcon
        fileId={file.id}
        fileName={file.name}
        iconSize={13}
        onPreviewFile={onPreviewFile}
        onClearPreview={onClearPreview}
      />
      <Typography sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'text.primary' }}>
        {file.name}
      </Typography>
      <Typography sx={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'text.disabled' }}>
        {getCategoryPath(file)}
      </Typography>
      <FileActionRail
        id={file.id}
        label={file.name}
        type="file"
        attached={attached}
        onOpenFile={onOpenFile}
        onToggleAttachment={onToggleAttachment}
        onOpenQa={onOpenQa}
      />
    </Stack>
  );
}

function FilePreviewIcon({
  fileId,
  fileName,
  iconSize = 14,
  onPreviewFile,
  onClearPreview,
}: {
  fileId: string;
  fileName: string;
  iconSize?: number;
  onPreviewFile: (fileId: string, anchorElement: HTMLElement) => void;
  onClearPreview: () => void;
}) {
  const showPreview = (event: MouseEvent<HTMLDivElement>) => {
    onPreviewFile(fileId, event.currentTarget);
  };

  return (
    <Box
      onMouseEnter={showPreview}
      onMouseLeave={onClearPreview}
      sx={{
        width: 18,
        height: 24,
        flexShrink: 0,
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FontAwesomeIcon icon={iconForFile(fileName)} style={{ fontSize: iconSize }} />
    </Box>
  );
}

function FileActionRail({
  id,
  label,
  type,
  attached,
  onOpenFile,
  onToggleAttachment,
  onOpenQa,
}: {
  id: string;
  label: string;
  type: 'folder' | 'file';
  attached: boolean;
  onOpenFile?: (fileId: string) => void;
  onToggleAttachment?: () => void;
  onOpenQa?: (target: QaFocusTarget) => void;
}) {
  const qaLabel = getQaLabel(id);
  const hasOpenAction = type === 'file' && Boolean(onOpenFile);
  const actionCount = Number(hasOpenAction) + Number(Boolean(onToggleAttachment)) + Number(Boolean(onOpenQa));
  const width = actionCount * 28;

  if (!hasOpenAction && !onToggleAttachment && !onOpenQa) return null;

  return (
    <Stack
      direction="row"
      spacing={0.25}
      alignItems="center"
      onClick={(event) => event.stopPropagation()}
      sx={{
        width,
        minWidth: width,
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 140ms cubic-bezier(0.2, 0, 0, 1)',
        '.document-index-row:hover &, .document-index-row:focus-within &': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      {hasOpenAction ? (
        <Tooltip title="View file">
          <IconButton
            size="small"
            aria-label={`View ${label}`}
            onClick={() => onOpenFile?.(id)}
            sx={{ width: 26, height: 26 }}
          >
            <FontAwesomeIcon icon={faEye} style={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      ) : null}
      {onToggleAttachment ? (
        <Tooltip title={attached ? 'Added to prompt' : 'Add to prompt'}>
          <IconButton
            size="small"
            aria-label={attached ? `Added ${label} to prompt` : `Add ${label} to prompt`}
            onClick={onToggleAttachment}
            sx={{ width: 26, height: 26 }}
          >
            <FontAwesomeIcon icon={attached ? faCheck : faPaperclip} style={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      ) : null}
      {onOpenQa ? (
        <Tooltip title={qaLabel}>
          <IconButton
            size="small"
            aria-label={`${qaLabel} for ${label}`}
            onClick={() => onOpenQa({
              id,
              label,
              type,
              mode: getQaMode(id),
            })}
            sx={{ width: 26, height: 26 }}
          >
            <FontAwesomeIcon icon={faMessagesQuestion} style={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function FileHoverPreview({
  file,
  anchor,
  attached,
  onOpenFile,
  onToggleAttachment,
  onOpenQa,
  onKeepPreview,
  onClearPreview,
}: {
  file: SellerIndexFile | null;
  anchor: FilePreviewAnchor | null;
  attached: boolean;
  onOpenFile: (fileId: string) => void;
  onToggleAttachment?: (fileId: string) => void;
  onOpenQa?: (target: QaFocusTarget) => void;
  onKeepPreview: () => void;
  onClearPreview: () => void;
}) {
  return (
    <Fade in={Boolean(file)} mountOnEnter unmountOnExit timeout={140}>
      <Box
        onMouseEnter={onKeepPreview}
        onMouseLeave={onClearPreview}
        sx={{
          position: 'absolute',
          top: anchor?.top ?? 12,
          left: anchor?.left ?? FILE_PREVIEW_GAP,
          width: FILE_PREVIEW_WIDTH,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 255, 255, 0.96)',
          boxShadow: '0px 18px 48px rgba(0, 0, 0, 0.16)',
          backdropFilter: 'blur(12px)',
          zIndex: 5,
          overflow: 'hidden',
        }}
      >
        {file ? (
          <Stack spacing={1.25} sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ pt: 0.2, color: 'text.secondary' }}>
                <FontAwesomeIcon icon={iconForFile(file.name)} style={{ fontSize: 15 }} />
              </Box>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary' }}>
                  {file.name}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.35 }}>
                  {file.folderPath.join(' / ')}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {[`${file.pages} ${file.fileType === 'xlsx' ? 'sheets' : 'pages'}`, file.size, file.updatedAt].map((item) => (
                <Box key={item} sx={{ px: 0.75, py: 0.25, borderRadius: '999px', bgcolor: 'action.hover', fontSize: 11.5, color: 'text.secondary' }}>
                  {item}
                </Box>
              ))}
            </Stack>

            <Box
              sx={{
                height: 158,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#fbfbfa',
                p: 1.25,
                boxSizing: 'border-box',
              }}
            >
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', mb: 1 }}>
                {file.previewTitle}
              </Typography>
              <Stack spacing={0.75}>
                {file.previewLines.map((line, index) => (
                  <Stack key={`${file.id}-${line}`} direction="row" spacing={0.75} alignItems="center">
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: index === 0 ? 'rgba(245, 95, 24, 0.12)' : 'action.hover', color: index === 0 ? '#f15f18' : 'text.disabled', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FontAwesomeIcon icon={index === 0 ? faCircleInfo : faChevronRight} style={{ fontSize: 9 }} />
                    </Box>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.35 }}>
                      {line}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <HaloButton
                size="small"
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faEye} />}
                onClick={() => onOpenFile(file.id)}
                sx={{ minHeight: 30, textTransform: 'none' }}
              >
                Open file
              </HaloButton>
              {onToggleAttachment ? (
                <HaloButton
                  size="small"
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={attached ? faCheck : faPaperclip} />}
                  onClick={() => onToggleAttachment(file.id)}
                  sx={{ minHeight: 30, textTransform: 'none' }}
                >
                  {attached ? 'Added' : 'Add to prompt'}
                </HaloButton>
              ) : null}
              {onOpenQa ? (
                <HaloButton
                  size="small"
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faMessagesQuestion} />}
                  onClick={() => onOpenQa({
                    id: file.id,
                    label: file.name,
                    type: 'file',
                    mode: getQaMode(file.id),
                  })}
                  sx={{ minHeight: 30, textTransform: 'none' }}
                >
                  {getQaLabel(file.id)}
                </HaloButton>
              ) : null}
            </Stack>
          </Stack>
        ) : null}
      </Box>
    </Fade>
  );
}

function getSearchResults(query: string, source: SellerIndexSource): SearchResults {
  if (!query) {
    return { files: [], folders: [], categories: [] };
  }

  const files = source.files.filter((file) =>
    [
      file.name,
      file.index,
      file.meta,
      file.status,
      file.uploadedBy,
      file.folderPath.join(' / '),
      file.categoryPath,
    ].some((value) => normalize(value).includes(query))
  );

  const folders = source.folders.filter((folder) =>
    [folder.name, folder.index, folder.folderPath.join(' / ')].some((value) => normalize(value).includes(query))
  );

  const categories = DOCUMENT_CATEGORIES.flatMap((parent) => {
    const rows: CategorySearchResult[] = [];
    if (normalize(parent.name).includes(query)) rows.push({ parent });

    parent.children.forEach((child) => {
      if (normalize(child.name).includes(query) || normalize(`${parent.name} ${child.name}`).includes(query)) {
        rows.push({ parent, child });
      }
    });

    return rows;
  });

  return { files, folders, categories };
}

function filterTreeByCategory(nodes: SellerIndexNode[], selectedCategoryIds: string[]): SellerIndexNode[] {
  if (selectedCategoryIds.length === 0) return nodes;

  const filteredNodes: SellerIndexNode[] = [];

  nodes.forEach((node) => {
    if (node.kind === 'file') {
      if (fileMatchesCategory(node, selectedCategoryIds)) {
        filteredNodes.push(node);
      }
      return;
    }

    const children = filterTreeByCategory(node.children, selectedCategoryIds);
    if (children.length > 0) {
      filteredNodes.push({ ...node, children });
    }
  });

  return filteredNodes;
}

function fileMatchesCategory(file: SellerIndexFileNode, selectedCategoryIds: string[]) {
  return selectedCategoryIds.includes(file.categoryId) || selectedCategoryIds.includes(file.childCategoryId);
}

function iconForFile(name: string) {
  if (name.endsWith('.pdf')) return faFilePdf;
  if (name.endsWith('.xlsx')) return faFileExcel;
  return faFileLines;
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type CategorySearchResult = {
  parent: DocumentParentCategory;
  child?: DocumentChildCategory;
};

type SearchResults = {
  files: SellerIndexFile[];
  folders: SellerIndexFolder[];
  categories: CategorySearchResult[];
};
