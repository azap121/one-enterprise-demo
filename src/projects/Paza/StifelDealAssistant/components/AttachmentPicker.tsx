import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  faFileExcel,
  faFileLines,
  faFilePdf,
  faFolderOpen,
  faMagnifyingGlass,
  faPaperclip,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import { HaloButton, HaloCheckbox, HaloDialog } from '~/theme/halo/components';
import {
  SELLER_FILES,
  SELLER_INDEX_FOLDERS,
  SELLER_INDEX_TREE,
  getCategoryPath,
  type SellerIndexFile,
  type SellerIndexFolder,
  type SellerIndexNode,
} from './rightCanvasFileData';

interface Props {
  open: boolean;
  selectedFileIds: string[];
  selectedFolderIds?: string[];
  onClose: () => void;
  onApply: (fileIds: string[], folderIds: string[]) => void;
}

export default function AttachmentPicker({
  open,
  selectedFileIds,
  selectedFolderIds = [],
  onClose,
  onApply,
}: Props) {
  const [draftFileIds, setDraftFileIds] = useState<string[]>(selectedFileIds);
  const [draftFolderIds, setDraftFolderIds] = useState<string[]>(selectedFolderIds);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraftFileIds(selectedFileIds);
    setDraftFolderIds(selectedFolderIds);
    setQuery('');
  }, [open, selectedFileIds, selectedFolderIds]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleFiles = useMemo(
    () => getMatchingFiles(normalizedQuery),
    [normalizedQuery]
  );
  const visibleFolders = useMemo(
    () => getMatchingFolders(normalizedQuery),
    [normalizedQuery]
  );
  const selectedFiles = useMemo(
    () => SELLER_FILES.filter((file) => draftFileIds.includes(file.id)),
    [draftFileIds]
  );
  const selectedFolders = useMemo(
    () => SELLER_INDEX_FOLDERS.filter((folder) => draftFolderIds.includes(folder.id)),
    [draftFolderIds]
  );
  const selectedContextCount = selectedFiles.length + selectedFolders.length;

  const toggleFile = (fileId: string) => {
    setDraftFileIds((currentFileIds) =>
      currentFileIds.includes(fileId)
        ? currentFileIds.filter((id) => id !== fileId)
        : [...currentFileIds, fileId]
    );
  };

  const toggleFolder = (folderId: string) => {
    setDraftFolderIds((currentFolderIds) =>
      currentFolderIds.includes(folderId)
        ? currentFolderIds.filter((id) => id !== folderId)
        : [...currentFolderIds, folderId]
    );
  };

  const apply = () => {
    onApply(draftFileIds, draftFolderIds);
    onClose();
  };

  return (
    <HaloDialog
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 15 }} />
          <Box>Add attachments</Box>
        </Stack>
      }
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
      actions={
        <>
          <HaloButton
            variant="outlined"
            onClick={() => {
              setDraftFileIds([]);
              setDraftFolderIds([]);
            }}
            sx={{ textTransform: 'none' }}
          >
            Clear all
          </HaloButton>
          <Box sx={{ flex: 1 }} />
          <HaloButton variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </HaloButton>
          <HaloButton variant="contained" onClick={apply} sx={{ textTransform: 'none' }}>
            Add selected
          </HaloButton>
        </>
      }
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            minHeight: 38,
            px: 1.25,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13 }} />
          <InputBase
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search permitted folders or documents"
            sx={{ flex: 1, minWidth: 0, fontSize: 13 }}
            inputProps={{ 'aria-label': 'Search permitted folders or document attachments' }}
          />
          {query ? (
            <Tooltip title="Clear search">
              <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')} sx={{ width: 26, height: 26 }}>
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ minHeight: 420 }}>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              maxHeight: 420,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
            }}
          >
            {normalizedQuery ? (
              <Stack spacing={0.75}>
                {visibleFolders.length > 0 ? (
                  <Stack spacing={0.25}>
                    <Typography sx={{ px: 1, fontSize: 11.5, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                      Folders
                    </Typography>
                    {visibleFolders.map((folder) => (
                      <AttachmentFolderRow
                        key={folder.id}
                        folder={folder}
                        checked={draftFolderIds.includes(folder.id)}
                        onToggle={() => toggleFolder(folder.id)}
                      />
                    ))}
                  </Stack>
                ) : null}
                {visibleFiles.length > 0 ? (
                  <Stack spacing={0.25}>
                    <Typography sx={{ px: 1, fontSize: 11.5, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                      Files
                    </Typography>
                    {visibleFiles.map((file) => (
                      <AttachmentFileRow
                        key={file.id}
                        file={file}
                        checked={draftFileIds.includes(file.id)}
                        onToggle={() => toggleFile(file.id)}
                      />
                    ))}
                  </Stack>
                ) : null}
                {visibleFolders.length === 0 && visibleFiles.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 220, color: 'text.secondary' }}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 20 }} />
                    <Typography sx={{ fontSize: 13 }}>No matching folders or documents.</Typography>
                  </Stack>
                ) : null}
              </Stack>
            ) : (
              <Box role="tree" aria-label="Permitted documents attachment picker" sx={{ minWidth: 620 }}>
                {SELLER_INDEX_TREE.map((node) => (
                  <AttachmentTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    selectedFolderIds={draftFolderIds}
                    selectedFileIds={draftFileIds}
                    onToggleFolder={toggleFolder}
                    onToggleFile={toggleFile}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Stack
            spacing={1}
            sx={{
              width: 250,
              flexShrink: 0,
              maxHeight: 420,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1.25,
              bgcolor: 'background.defaultAlt',
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
              Selected ({selectedContextCount})
            </Typography>
            {selectedContextCount > 0 ? (
              <>
                {selectedFolders.map((folder) => (
                  <SelectedFolderRow
                    key={folder.id}
                    folder={folder}
                    onRemove={() => toggleFolder(folder.id)}
                  />
                ))}
                {selectedFiles.map((file) => (
                  <SelectedAttachmentRow
                    key={file.id}
                    file={file}
                    onRemove={() => toggleFile(file.id)}
                  />
                ))}
              </>
            ) : (
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>
                Choose folders or documents to add context to the Datasite AI prompt.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </HaloDialog>
  );
}

function AttachmentTreeNode({
  node,
  depth,
  selectedFolderIds,
  selectedFileIds,
  onToggleFolder,
  onToggleFile,
}: {
  node: SellerIndexNode;
  depth: number;
  selectedFolderIds: string[];
  selectedFileIds: string[];
  onToggleFolder: (folderId: string) => void;
  onToggleFile: (fileId: string) => void;
}) {
  if (node.kind === 'file') {
    return (
      <AttachmentFileRow
        file={node as SellerIndexFile}
        checked={selectedFileIds.includes(node.id)}
        onToggle={() => onToggleFile(node.id)}
        indent={depth}
      />
    );
  }

  const folder = SELLER_INDEX_FOLDERS.find((item) => item.id === node.id) ?? {
    id: node.id,
    index: node.index,
    name: node.name,
    folderPath: [],
  };

  return (
    <Box role="treeitem" aria-label={`${node.index} ${node.name}`}>
      <AttachmentFolderRow
        folder={folder}
        checked={selectedFolderIds.includes(node.id)}
        onToggle={() => onToggleFolder(node.id)}
        indent={depth}
      />
      {node.children.map((child) => (
        <AttachmentTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedFolderIds={selectedFolderIds}
          selectedFileIds={selectedFileIds}
          onToggleFolder={onToggleFolder}
          onToggleFile={onToggleFile}
        />
      ))}
    </Box>
  );
}

function AttachmentFolderRow({
  folder,
  checked,
  onToggle,
  indent = 0,
}: {
  folder: SellerIndexFolder;
  checked: boolean;
  onToggle: () => void;
  indent?: number;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onToggle();
  };

  return (
    <Stack
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      sx={{
        minHeight: 32,
        pl: indent * 2.25,
        pr: 1,
        borderRadius: 1,
        cursor: 'pointer',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Typography sx={{ width: 66, flexShrink: 0, fontSize: 12, color: 'text.secondary' }}>
        {folder.index}
      </Typography>
      <Box onClick={(event) => event.stopPropagation()} sx={{ width: 22, flexShrink: 0 }}>
        <HaloCheckbox
          checked={checked}
          onChange={onToggle}
          inputProps={{ 'aria-label': `Select ${folder.name}` }}
          sx={{ py: 0, px: 0 }}
        />
      </Box>
      <Box sx={{ width: 18, flexShrink: 0, color: 'text.secondary' }}>
        <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 13 }} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.folderPath.length > 0 ? folder.folderPath.join(' / ') : 'Top level'}
        </Typography>
      </Stack>
    </Stack>
  );
}

function AttachmentFileRow({
  file,
  checked,
  onToggle,
  indent = 0,
}: {
  file: SellerIndexFile | Extract<SellerIndexNode, { kind: 'file' }>;
  checked: boolean;
  onToggle: () => void;
  indent?: number;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onToggle();
  };

  return (
    <Stack
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      direction="row"
      alignItems="center"
      spacing={1}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      sx={{
        minHeight: 32,
        pl: indent * 2.25,
        pr: 1,
        borderRadius: 1,
        cursor: 'pointer',
        outline: 'none',
        '&:hover': { bgcolor: 'action.hover' },
        '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
      }}
    >
      <Typography sx={{ width: 66, flexShrink: 0, fontSize: 12, color: 'text.secondary' }}>
        {file.index}
      </Typography>
      <Box onClick={(event) => event.stopPropagation()} sx={{ width: 22, flexShrink: 0 }}>
        <HaloCheckbox
          checked={checked}
          onChange={onToggle}
          inputProps={{ 'aria-label': `Select ${file.name}` }}
          sx={{ py: 0, px: 0 }}
        />
      </Box>
      <Box sx={{ width: 18, flexShrink: 0, color: 'text.secondary' }}>
        <FontAwesomeIcon icon={iconForFile(file.name)} style={{ fontSize: 13 }} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getCategoryPath(file)}
        </Typography>
      </Stack>
      <Typography sx={{ maxWidth: 120, fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {file.meta}
      </Typography>
    </Stack>
  );
}

function SelectedFolderRow({ folder, onRemove }: { folder: SellerIndexFolder; onRemove: () => void }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.paper' }}>
      <Box sx={{ pt: 0.15, color: 'text.secondary' }}>
        <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 13 }} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.folderPath.length > 0 ? folder.folderPath.join(' / ') : 'Top level'}
        </Typography>
      </Stack>
      <Tooltip title="Remove folder">
        <IconButton size="small" aria-label={`Remove ${folder.name}`} onClick={onRemove} sx={{ width: 22, height: 22 }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function SelectedAttachmentRow({ file, onRemove }: { file: SellerIndexFile; onRemove: () => void }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ p: 1, borderRadius: 1.5, bgcolor: 'background.paper' }}>
      <Box sx={{ pt: 0.15, color: 'text.secondary' }}>
        <FontAwesomeIcon icon={iconForFile(file.name)} style={{ fontSize: 13 }} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.folderPath.join(' / ')}
        </Typography>
      </Stack>
      <Tooltip title="Remove attachment">
        <IconButton size="small" aria-label={`Remove ${file.name}`} onClick={onRemove} sx={{ width: 22, height: 22 }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function getMatchingFiles(query: string) {
  if (!query) return SELLER_FILES;

  return SELLER_FILES.filter((file) =>
    [
      file.name,
      file.index,
      file.meta,
      file.status,
      file.categoryPath,
      file.folderPath.join(' / '),
    ].some((value) => value.toLowerCase().includes(query))
  );
}

function getMatchingFolders(query: string) {
  if (!query) return SELLER_INDEX_FOLDERS;

  return SELLER_INDEX_FOLDERS.filter((folder) =>
    [
      folder.name,
      folder.index,
      folder.folderPath.join(' / '),
    ].some((value) => value.toLowerCase().includes(query))
  );
}

function iconForFile(name: string) {
  if (name.endsWith('.pdf')) return faFilePdf;
  if (name.endsWith('.xlsx')) return faFileExcel;
  return faFileLines;
}
