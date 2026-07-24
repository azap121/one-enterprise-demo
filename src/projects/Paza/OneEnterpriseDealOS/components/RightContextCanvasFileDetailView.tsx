import { useMemo, useState, type MouseEvent } from 'react';
import {
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faFileExcel,
  faFileLines,
  faFilePdf,
  faPaperclip,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Divider, IconButton, Menu, Stack, Tooltip, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { findSellerFileById, getCategoryPath } from './rightCanvasFileData';

interface Props {
  fileId: string;
  attached: boolean;
  bottomInset?: number;
  onToggleAttachment: () => void;
}

export default function RightContextCanvasFileDetailView({
  fileId,
  attached,
  bottomInset = 0,
  onToggleAttachment,
}: Props) {
  const file = useMemo(() => findSellerFileById(fileId), [fileId]);
  const [activePage, setActivePage] = useState(1);
  const [metadataAnchorEl, setMetadataAnchorEl] = useState<HTMLElement | null>(null);

  if (!file) {
    return (
      <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 22 }} />
        <Typography sx={{ mt: 1, fontSize: 13 }}>File no longer available.</Typography>
      </Stack>
    );
  }

  const previewPageCount = Math.min(file.pages, file.fileType === 'xlsx' ? 4 : 5);
  const pageLabel = file.fileType === 'xlsx' ? 'Sheet' : 'Page';
  const metadataMenuOpen = Boolean(metadataAnchorEl);

  const openMetadataMenu = (event: MouseEvent<HTMLElement>) => {
    setMetadataAnchorEl(event.currentTarget);
  };

  const closeMetadataMenu = () => {
    setMetadataAnchorEl(null);
  };

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
      <Stack spacing={1.25} sx={{ px: 2.5, pt: 1.5, pb: 1.25, flexShrink: 0 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box sx={{ pt: 0.35, color: 'text.secondary' }}>
            <FontAwesomeIcon icon={iconForFile(file.name)} style={{ fontSize: 17 }} />
          </Box>
          <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: 'text.primary' }}>
              {file.name}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.4 }}>
              {file.folderPath.join(' / ')}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
            <HaloButton
              size="small"
              variant="outlined"
              endIcon={<FontAwesomeIcon icon={faChevronDown} />}
              onClick={openMetadataMenu}
              sx={{ minHeight: 30, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Details
            </HaloButton>
            <HaloButton
              size="small"
              variant={attached ? 'outlined' : 'contained'}
              startIcon={<FontAwesomeIcon icon={attached ? faCheck : faPaperclip} />}
              onClick={onToggleAttachment}
              sx={{ minHeight: 30, textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              {attached ? 'Added to prompt' : 'Add to prompt'}
            </HaloButton>
          </Stack>
        </Stack>

        <Menu
          anchorEl={metadataAnchorEl}
          open={metadataMenuOpen}
          onClose={closeMetadataMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.75,
                width: 300,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0px 16px 44px rgba(0, 0, 0, 0.14)',
              },
            },
          }}
        >
          <Stack spacing={1.25} sx={{ p: 1.5 }}>
            <MetadataGroup
              title="Category"
              rows={[
                ['Classification', getCategoryPath(file)],
                ['Location', file.folderPath.join(' / ')],
              ]}
            />
            <Divider />
            <MetadataGroup
              title="Document"
              rows={[
                ['Status', file.status],
                [file.fileType === 'xlsx' ? 'Sheets' : 'Pages', String(file.pages)],
                ['Size', file.size],
              ]}
            />
            <Divider />
            <MetadataGroup
              title="Activity"
              rows={[
                ['Uploaded by', file.uploadedBy],
                ['Updated', file.updatedAt],
              ]}
            />
          </Stack>
        </Menu>
      </Stack>

      <Divider />

      <Stack direction="row" sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          spacing={1}
          sx={{
            width: 112,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            p: 1.25,
            pb: bottomInset ? `${bottomInset}px` : 1.25,
            overflow: 'auto',
            transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          {Array.from({ length: previewPageCount }, (_, index) => index + 1).map((page) => (
            <Stack
              key={page}
              role="button"
              tabIndex={0}
              spacing={0.5}
              onClick={() => setActivePage(page)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActivePage(page);
                }
              }}
              sx={{
                cursor: 'pointer',
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.action.focus}`,
                },
              }}
            >
              <Box
                sx={{
                  height: 94,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: activePage === page ? 'text.primary' : 'divider',
                  bgcolor: '#fbfbfa',
                  p: 0.75,
                  boxSizing: 'border-box',
                }}
              >
                <MiniPage fileType={file.fileType} />
              </Box>
              <Typography sx={{ fontSize: 11.5, color: activePage === page ? 'text.primary' : 'text.secondary', textAlign: 'center' }}>
                {pageLabel} {page}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 46, px: 2, flexShrink: 0 }}>
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, color: 'text.secondary' }}>
              Uploaded by {file.uploadedBy} · Updated {file.updatedAt}
            </Typography>
            <Tooltip title={`Previous ${pageLabel.toLowerCase()}`}>
              <span>
                <IconButton
                  size="small"
                  disabled={activePage === 1}
                  aria-label={`Previous ${pageLabel.toLowerCase()}`}
                  onClick={() => setActivePage((page) => Math.max(1, page - 1))}
                  sx={{ width: 28, height: 28 }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 12 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Typography sx={{ width: 56, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>
              {activePage}/{previewPageCount}
            </Typography>
            <Tooltip title={`Next ${pageLabel.toLowerCase()}`}>
              <span>
                <IconButton
                  size="small"
                  disabled={activePage === previewPageCount}
                  aria-label={`Next ${pageLabel.toLowerCase()}`}
                  onClick={() => setActivePage((page) => Math.min(previewPageCount, page + 1))}
                  sx={{ width: 28, height: 28 }}
                >
                  <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              bgcolor: '#f7f7f5',
              p: 3,
              pb: bottomInset ? `${bottomInset}px` : 3,
              transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <Stack
              spacing={2}
              sx={{
                width: 'min(620px, 100%)',
                minHeight: 720,
                mx: 'auto',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0px 12px 38px rgba(0, 0, 0, 0.08)',
                p: 4,
                boxSizing: 'border-box',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: 'rgba(245, 95, 24, 0.12)', color: '#f15f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faCircleInfo} style={{ fontSize: 12 }} />
                </Box>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                  Preview prototype · {pageLabel} {activePage}
                </Typography>
              </Stack>

              <Typography sx={{ fontSize: 22, fontWeight: 600, color: 'text.primary' }}>
                {file.previewTitle}
              </Typography>

              {file.fileType === 'xlsx' ? <SpreadsheetPreview /> : <DocumentPreview lines={file.previewLines} />}
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

function DocumentPreview({ lines }: { lines: string[] }) {
  return (
    <Stack spacing={2.5}>
      {lines.map((line) => (
        <Stack key={line} spacing={0.8}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary' }}>
            {line}
          </Typography>
          <Box sx={{ height: 9, width: '92%', borderRadius: 999, bgcolor: 'action.hover' }} />
          <Box sx={{ height: 9, width: '78%', borderRadius: 999, bgcolor: 'action.hover' }} />
          <Box sx={{ height: 9, width: '86%', borderRadius: 999, bgcolor: 'action.hover' }} />
        </Stack>
      ))}
    </Stack>
  );
}

function MetadataGroup({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <Stack spacing={0.75}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
        {title}
      </Typography>
      {rows.map(([label, value]) => (
        <Stack key={`${title}-${label}`} direction="row" spacing={1.5} alignItems="flex-start">
          <Typography sx={{ width: 84, flexShrink: 0, fontSize: 12, color: 'text.disabled' }}>
            {label}
          </Typography>
          <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, color: 'text.primary', lineHeight: 1.4 }}>
            {value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function SpreadsheetPreview() {
  return (
    <Stack spacing={0.75}>
      {Array.from({ length: 9 }, (_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={0.75}>
          {Array.from({ length: 5 }, (_, columnIndex) => (
            <Box
              key={`${rowIndex}-${columnIndex}`}
              sx={{
                flex: 1,
                height: rowIndex === 0 ? 28 : 24,
                borderRadius: 0.75,
                bgcolor: rowIndex === 0 ? 'rgba(245, 95, 24, 0.09)' : 'action.hover',
                border: '1px solid',
                borderColor: rowIndex === 0 ? 'rgba(245, 95, 24, 0.18)' : 'transparent',
              }}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

function MiniPage({ fileType }: { fileType: string }) {
  if (fileType === 'xlsx') {
    return (
      <Stack spacing={0.35}>
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <Stack key={rowIndex} direction="row" spacing={0.35}>
            {Array.from({ length: 3 }, (_, columnIndex) => (
              <Box key={`${rowIndex}-${columnIndex}`} sx={{ flex: 1, height: 8, borderRadius: 0.35, bgcolor: rowIndex === 0 ? 'rgba(245, 95, 24, 0.16)' : 'action.hover' }} />
            ))}
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={0.55}>
      <Box sx={{ width: '66%', height: 9, borderRadius: 999, bgcolor: 'rgba(245, 95, 24, 0.16)' }} />
      {Array.from({ length: 7 }, (_, index) => (
        <Box key={index} sx={{ width: index % 3 === 0 ? '78%' : '92%', height: 6, borderRadius: 999, bgcolor: 'action.hover' }} />
      ))}
    </Stack>
  );
}

function iconForFile(name: string) {
  if (name.endsWith('.pdf')) return faFilePdf;
  if (name.endsWith('.xlsx')) return faFileExcel;
  return faFileLines;
}
