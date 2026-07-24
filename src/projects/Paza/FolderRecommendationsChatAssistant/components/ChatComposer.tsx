import { useEffect, useId, useState, type MouseEvent } from 'react';
import { faArrowUp, faFile, faPaperclip, faPlus, faXmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, IconButton, InputBase, Paper, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { amber, moondust } from '~/theme/halo/theme';
import AttachmentPicker from './AttachmentPicker';
import { findSellerFileById, type SellerIndexFile } from './rightCanvasFileData';
import { COPY } from '../state/copy';

interface Props {
  value: string;
  compact?: boolean;
  large?: boolean;
  loading?: boolean;
  showPoweredLine?: boolean;
  attachedFileIds?: string[];
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onAttachmentsChange?: (fileIds: string[]) => void;
}

export default function ChatComposer({
  value,
  compact = false,
  large = false,
  loading = false,
  showPoweredLine = true,
  attachedFileIds = [],
  onChange,
  onSubmit,
  onAttachmentsChange,
}: Props) {
  const inputId = useId();
  const [attachmentPickerOpen, setAttachmentPickerOpen] = useState(false);
  const [attachmentSummaryAnchorEl, setAttachmentSummaryAnchorEl] = useState<HTMLElement | null>(null);
  const submit = () => onSubmit(value);
  const hasValue = Boolean(value.trim());
  const attachedFiles = attachedFileIds.flatMap((fileId) => {
    const file = findSellerFileById(fileId);
    return file ? [file] : [];
  });
  const attachmentPickerEnabled = Boolean(onAttachmentsChange);
  const hiddenAttachmentCount = Math.max(attachedFiles.length - 1, 0);
  const attachmentSummaryOpen = Boolean(attachmentSummaryAnchorEl) && attachedFiles.length > 1;
  const composerHeight = large && attachedFiles.length > 0 ? 144 : large ? 120 : 'auto';
  const composerMinHeight = large && attachedFiles.length > 0 ? 144 : large ? 120 : compact ? 44 : 52;
  const neutralComposerBorder = alpha(moondust[900], 0.16);

  function closeAttachmentSummary() {
    setAttachmentSummaryAnchorEl(null);
  }

  function handleAttachmentOverflowClick(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    if (attachmentSummaryAnchorEl) {
      closeAttachmentSummary();
      return;
    }
    setAttachmentSummaryAnchorEl(event.currentTarget);
  }

  function removeAttachment(fileId: string) {
    const nextFileIds = attachedFileIds.filter((attachedFileId) => attachedFileId !== fileId);
    onAttachmentsChange?.(nextFileIds);
    if (nextFileIds.length <= 1) closeAttachmentSummary();
  }

  function openAttachmentPickerFromSummary() {
    closeAttachmentSummary();
    setAttachmentPickerOpen(true);
  }

  function clearAttachmentsFromSummary() {
    onAttachmentsChange?.([]);
    closeAttachmentSummary();
  }

  useEffect(() => {
    if (attachedFiles.length <= 1) closeAttachmentSummary();
  }, [attachedFiles.length]);

  return (
    <Stack spacing={0.75}>
      <Paper
        component="form"
        elevation={0}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        sx={{
          display: 'flex',
          flexDirection: large ? 'column' : 'row',
          alignItems: large ? 'stretch' : 'center',
          justifyContent: large ? 'space-between' : 'center',
          gap: large ? 0 : 1,
          width: '100%',
          height: composerHeight,
          minHeight: composerMinHeight,
          position: 'relative',
          p: large ? 1 : 0.75,
          pl: large ? 1 : 1.25,
          border: '1px solid',
          borderColor: large ? neutralComposerBorder : 'divider',
          borderRadius: large ? 3 : 2,
          bgcolor: 'background.paper',
          boxShadow: large ? `0 8px 24px ${alpha(moondust[900], 0.14)}` : 'none',
          transition: 'border-color 180ms cubic-bezier(0.2, 0, 0, 1), box-shadow 180ms cubic-bezier(0.2, 0, 0, 1)',
          '@keyframes composerLoadingStroke': {
            from: { strokeDashoffset: 100 },
            to: { strokeDashoffset: 0 },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& .composer-loading-stroke': {
              animation: 'none',
            },
          },
        }}
      >
        {large ? <ComposerLoadingStroke visible={loading} /> : null}
        <Box component="label" htmlFor={inputId} sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Datasite AI prompt
        </Box>
        {!large && (
          <Box sx={{ color: 'text.disabled', display: 'flex', flexShrink: 0 }}>
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 15 }} />
          </Box>
        )}
        {large && attachedFiles.length > 0 ? (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ flexShrink: 0, px: 0.5, pb: 0.5, overflow: 'hidden' }}
          >
            {attachedFiles.slice(0, 1).map((file) => (
              <Stack
                key={file.id}
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  minHeight: 24,
                  maxWidth: 206,
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: 'divider',
                  px: 0.75,
                  bgcolor: 'background.paper',
                }}
              >
                <FontAwesomeIcon icon={faFile} style={{ fontSize: 11 }} />
                <Typography
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 11.5,
                    color: 'text.secondary',
                  }}
                >
                  {file.name}
                </Typography>
                <Tooltip title={`Remove ${file.name}`}>
                  <IconButton
                    size="small"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeAttachment(file.id)}
                    sx={{ width: 16, height: 16, ml: 0.25 }}
                  >
                    <FontAwesomeIcon icon={faXmark} style={{ fontSize: 9 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
            {attachedFiles.length > 1 ? (
              <Box
                component="button"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={attachmentSummaryOpen ? 'true' : 'false'}
                aria-label={`View ${attachedFiles.length} selected attachments`}
                onClick={handleAttachmentOverflowClick}
                sx={{
                  minHeight: 24,
                  px: 0.9,
                  display: 'flex',
                  alignItems: 'center',
                  border: 0,
                  borderRadius: '999px',
                  bgcolor: attachmentSummaryOpen ? alpha(moondust[900], 0.08) : 'action.hover',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: 11.5,
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: alpha(moondust[900], 0.08), color: 'text.primary' },
                  '&:focus-visible': { boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}` },
                }}
              >
                +{hiddenAttachmentCount} more
              </Box>
            ) : null}
          </Stack>
        ) : null}
        <InputBase
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={COPY.inputPlaceholder}
          fullWidth
          multiline
          maxRows={large ? 3 : compact ? 3 : 4}
          inputProps={{ 'aria-label': COPY.inputPlaceholder }}
          sx={{
            flex: large ? '1 1 auto' : 'initial',
            alignItems: 'flex-start',
            px: large ? 1 : 0,
            pt: large ? 1 : 0,
            fontSize: compact ? 13 : 14,
            lineHeight: 1.45,
          }}
        />
        {large && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexShrink: 0 }}>
            <Tooltip title="Add attachment">
              <span>
                <IconButton
                  size="small"
                  aria-label="Add attachment"
                  disabled={!attachmentPickerEnabled}
                  onClick={() => setAttachmentPickerOpen(true)}
                  sx={{ width: 28, height: 28, color: 'text.secondary' }}
                >
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Send prompt">
              <span>
                <IconButton
                  type="submit"
                  size="small"
                  aria-label="Send prompt"
                  disabled={!hasValue}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: hasValue ? 'text.primary' : 'action.disabledBackground',
                    color: hasValue ? 'background.paper' : 'text.disabled',
                    flexShrink: 0,
                    mr: 0.25,
                    mb: 0.25,
                    borderRadius: '4px',
                    p: 0,
                    '&:hover': { bgcolor: hasValue ? 'text.secondary' : 'action.disabledBackground' },
                  }}
                >
                  <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )}
        {!large && (
          <Tooltip title="Send prompt">
            <span>
              <IconButton
                type="submit"
                size="small"
                aria-label="Send prompt"
                disabled={!hasValue}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: hasValue ? 'text.primary' : 'action.disabledBackground',
                  color: hasValue ? 'background.paper' : 'text.disabled',
                  flexShrink: 0,
                  borderRadius: '4px',
                  p: 0,
                  '&:hover': { bgcolor: hasValue ? 'text.secondary' : 'action.disabledBackground' },
                }}
              >
                <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11 }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Paper>
      <AttachmentPicker
        open={attachmentPickerOpen}
        selectedFileIds={attachedFileIds}
        onClose={() => setAttachmentPickerOpen(false)}
        onApply={(fileIds) => onAttachmentsChange?.(fileIds)}
      />
      <Popover
        open={attachmentSummaryOpen}
        anchorEl={attachmentSummaryAnchorEl}
        onClose={closeAttachmentSummary}
        disableRestoreFocus
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 344,
            maxWidth: 'calc(100vw - 32px)',
            mt: -1,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha(moondust[900], 0.12),
            bgcolor: 'background.paper',
            boxShadow: `0 16px 48px ${alpha(moondust[900], 0.18)}`,
            overflow: 'hidden',
          },
        }}
      >
        <AttachmentSummaryPopover
          files={attachedFiles}
          onRemove={removeAttachment}
          onManage={openAttachmentPickerFromSummary}
          onClear={clearAttachmentsFromSummary}
          onClose={closeAttachmentSummary}
        />
      </Popover>
      {showPoweredLine && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', textAlign: 'center' }}>
          Powered by Blueflame AI. Always review for accuracy.
        </Typography>
      )}
    </Stack>
  );
}

function ComposerLoadingStroke({ visible }: { visible: boolean }) {
  const rawGradientId = useId();
  const gradientId = `composer-loading-${rawGradientId.replace(/:/g, '')}`;

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: -1,
        borderRadius: 'inherit',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        transition: 'opacity 180ms cubic-bezier(0.2, 0, 0, 1)',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={alpha(amber[600], 0.02)} />
            <stop offset="38%" stopColor={alpha(amber[600], 0.36)} />
            <stop offset="72%" stopColor={alpha(amber[600], 0.95)} />
            <stop offset="100%" stopColor={alpha(amber[600], 0.1)} />
          </linearGradient>
        </defs>
        <rect
          className="composer-loading-stroke"
          x="0.6"
          y="0.6"
          width="98.8"
          height="98.8"
          rx="9"
          ry="9"
          pathLength="100"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="18 82"
          strokeDashoffset="100"
          vectorEffect="non-scaling-stroke"
          style={{
            animation: visible ? 'composerLoadingStroke 1200ms linear infinite' : 'none',
          }}
        />
      </Box>
    </Box>
  );
}

function AttachmentSummaryPopover({
  files,
  onRemove,
  onManage,
  onClear,
  onClose,
}: {
  files: SellerIndexFile[];
  onRemove: (fileId: string) => void;
  onManage: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <Stack spacing={0}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.25 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>
          Selected context ({files.length})
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.25}>
          <Button size="small" variant="text" onClick={onClear} sx={{ minHeight: 24, px: 0.75, fontSize: 11.5, textTransform: 'none' }}>
            Clear all
          </Button>
          <Tooltip title="Close selected context">
            <IconButton size="small" aria-label="Close selected context" onClick={onClose} sx={{ width: 24, height: 24 }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Stack
        spacing={0.25}
        sx={{
          maxHeight: 254,
          overflow: 'auto',
          px: 0.75,
          pb: 0.75,
        }}
      >
        {files.map((file) => (
          <AttachmentSummaryRow
            key={file.id}
            file={file}
            onRemove={() => onRemove(file.id)}
          />
        ))}
      </Stack>
      <Box sx={{ px: 1.25, py: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.defaultAlt' }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />}
          onClick={onManage}
          sx={{ minHeight: 30, fontSize: 12, textTransform: 'none' }}
        >
          Manage attachments
        </Button>
      </Box>
    </Stack>
  );
}

function AttachmentSummaryRow({ file, onRemove }: { file: SellerIndexFile; onRemove: () => void }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        minHeight: 48,
        px: 0.75,
        py: 0.65,
        borderRadius: 2,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ width: 20, flexShrink: 0, color: 'text.secondary', display: 'flex', justifyContent: 'center' }}>
        <FontAwesomeIcon icon={faFile} style={{ fontSize: 12 }} />
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.categoryPath} · {file.meta}
        </Typography>
      </Stack>
      <Tooltip title={`Remove ${file.name}`}>
        <IconButton size="small" aria-label={`Remove ${file.name}`} onClick={onRemove} sx={{ width: 24, height: 24, flexShrink: 0 }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
