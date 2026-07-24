import React, { useState } from 'react';
import {
  Box, Typography, Button, Checkbox, IconButton, Menu, MenuItem,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp, faArrowUpRightFromSquare, faFilePen,
  faChevronDown, faBarsStaggered, faBars,
  faTableColumns, faFolderPlus,
  faStar, faEnvelope, faEnvelopeOpen,
  faFile, faFolder, faHighlighter, faAngleRight, faCircle,
} from '@fortawesome/pro-light-svg-icons';
import { faStar as faStarSolid } from '@fortawesome/pro-solid-svg-icons';
import { Doc } from './mockData';
import { FILE_ICON_COLORS } from './theme';

interface FolderTableProps {
  activeFolder: string;
  onDocumentOpen: (doc: Doc) => void;
  openDocId?: string | null;
  throttled?: boolean;
  onThrottleToggle?: () => void;
}

// ─── Mock document data ────────────────────────────────────────────────────────

interface DocRow {
  index: string;
  name: string;
  type: string;
  status: 'Published' | 'Partially Published' | 'Not Published';
  size: string;
  date: string;
  favorited: boolean;
  read: 'read' | 'unread' | null;
  redacted: boolean;
  uploadedBy: string;
  language: string;
  categories: string;
}

const DOCUMENT_ROWS: DocRow[] = [
  { index: '11.1',  name: 'Environmental Impact Assessment Report', type: 'pdf',    status: 'Published',           size: '45.67 KB', date: '03/15/2023 14:30', favorited: false, read: 'read',   redacted: true,  uploadedBy: 'aaron.miller@bluewaveinc.com',    language: 'English', categories: 'Environmental' },
  { index: '11.2',  name: 'Biodiversity Study 2023',                type: 'docx',   status: 'Published',           size: '32.10 KB', date: '07/22/2023 09:15', favorited: false, read: 'unread', redacted: true,  uploadedBy: 'laura.james@bluewaveinc.com',     language: 'English', categories: 'Environmental' },
  { index: '11.3',  name: 'Climate Change Strategy',                type: 'folder', status: 'Partially Published', size: '—',        date: '11/05/2023 11:45', favorited: true,  read: null,     redacted: false, uploadedBy: 'Datasite User',                    language: 'English', categories: 'Strategy' },
  { index: '11.4',  name: 'Water Quality Test Results',             type: 'xlsx',   status: 'Published',           size: '12.50 MB', date: '01/10/2023 16:00', favorited: true,  read: 'read',   redacted: true,  uploadedBy: 'tyler.brown@bluewaveinc.com',     language: 'English', categories: 'Environmental' },
  { index: '11.5',  name: 'Soil Contamination Report',              type: 'pdf',    status: 'Published',           size: '56.35 KB', date: '04/18/2023 08:20', favorited: true,  read: 'read',   redacted: true,  uploadedBy: 'olivia.wilson@bluewaveinc.com',   language: 'English', categories: 'Environmental' },
  { index: '11.6',  name: 'Air Quality Monitoring Data',            type: 'docx',   status: 'Published',           size: '22.75 KB', date: '09/30/2023 12:05', favorited: true,  read: 'read',   redacted: false, uploadedBy: 'Datasite User',                    language: 'English', categories: 'Environmental' },
  { index: '11.7',  name: 'Waste Management Strategy 2023',         type: 'pptx',   status: 'Not Published',       size: '1.20 MB',  date: '02/28/2023 17:50', favorited: false, read: 'unread', redacted: false, uploadedBy: 'benjamin.clark@bluewaveinc.com',  language: 'English', categories: 'Strategy' },
  { index: '11.8',  name: 'Sustainability Assessment Report',       type: 'pdf',    status: 'Published',           size: '89.99 KB', date: '06/12/2023 10:10', favorited: false, read: 'unread', redacted: false, uploadedBy: 'sophia.taylor@bluewaveinc.com',   language: 'English', categories: 'ESG' },
  { index: '11.9',  name: 'Regulatory Compliance Review 2022',      type: 'xlsx',   status: 'Partially Published', size: '3.45 MB',  date: '08/25/2022 15:35', favorited: false, read: 'read',   redacted: true,  uploadedBy: 'noah.martinez@bluewaveinc.com',   language: 'English', categories: 'Compliance' },
  { index: '11.10', name: 'Placeholder 1',                          type: '—',      status: 'Not Published',       size: '—',        date: '12/01/2023 13:00', favorited: false, read: null,     redacted: false, uploadedBy: 'Datasite User',                    language: '—',       categories: '—' },
  { index: '11.11', name: 'Placeholder 2',                          type: '—',      status: 'Not Published',       size: '—',        date: '05/14/2023 19:25', favorited: false, read: null,     redacted: false, uploadedBy: 'Datasite User',                    language: '—',       categories: '—' },
];

// ─── Thin checkbox (matches SearchResultsPage style) ──────────────────────────

const ThinCheckbox: React.FC<{
  checked: boolean;
  indeterminate?: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = ({ checked, indeterminate, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: 17, height: 17, flexShrink: 0,
      border: '1.5px solid',
      borderColor: (checked || indeterminate) ? 'primary.main' : 'text.secondary',
      borderRadius: '3px',
      cursor: 'pointer',
      bgcolor: (checked || indeterminate) ? 'primary.main' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 100ms, background-color 100ms',
      '&:hover': {
        borderColor: (checked || indeterminate) ? 'primary.dark' : 'text.primary',
        bgcolor: (checked || indeterminate) ? 'primary.dark' : 'transparent',
      },
    }}
  >
    {indeterminate && !checked && (
      <svg width="9" height="2" viewBox="0 0 9 2" fill="none">
        <rect width="9" height="2" rx="1" fill="white" />
      </svg>
    )}
    {checked && (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </Box>
);

// ─── File type icon ────────────────────────────────────────────────────────────

export const FileTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  if (type === '—' || !type) return (
    <Box sx={{ width: 20, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'text.disabled' }}>
      <FontAwesomeIcon icon={faCircle} style={{ fontSize: 14 }} />
    </Box>
  );
  const entry = FILE_ICON_COLORS[type as keyof typeof FILE_ICON_COLORS] || FILE_ICON_COLORS.default;
  return (
    <Box sx={{ width: 20, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FontAwesomeIcon
        icon={type === 'folder' ? faFolder : faFile}
        style={{ fontSize: 16, color: entry.color }}
      />
    </Box>
  );
};

// ─── Layout constants ──────────────────────────────────────────────────────────
const HEADER_HEIGHT = 40;
const ROW_HEIGHT = 40;

// ─── Column grid template ──────────────────────────────────────────────────────
// checkbox(72) | star(64) | read(64) | index(80) | name(flex) | type(80) | status(152) | redacted(64) | size(100) | date(160) | uploaded(180) | lang(100) | categories(146)
const GRID = '72px 64px 64px 80px minmax(176px,336px) 96px 168px 80px 116px 176px 196px 116px 162px';
const MIN_TABLE_WIDTH = 1346;

// ─── Shared cell sx ───────────────────────────────────────────────────────────

const headerCellSx = {
  display: 'flex',
  alignItems: 'center',
  height: HEADER_HEIGHT,
  px: '16px',
  position: 'relative' as const,
  overflow: 'hidden',
};

const dataCellSx = {
  display: 'flex',
  alignItems: 'center',
  height: ROW_HEIGHT,
  px: '16px',
  overflow: 'hidden',
};

const headerTextSx = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'text.primary',
  letterSpacing: '0.4px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: '1.66',
};

const dataTextSx = {
  fontSize: '0.875rem',
  fontWeight: 400,
  color: 'text.primary',
  letterSpacing: '0.17px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: '1.43',
};

// ─── FolderTable component ─────────────────────────────────────────────────────

const FolderTable: React.FC<FolderTableProps> = ({ onDocumentOpen, openDocId, throttled = false, onThrottleToggle }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [footerMenuAnchor, setFooterMenuAnchor] = useState<HTMLElement | null>(null);
  const [favorites, setFavorites] = useState<string[]>(
    DOCUMENT_ROWS.filter((r) => r.favorited).map((r) => r.index)
  );

  const toggleSelect = (idx: string) =>
    setSelected((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);

  const toggleFavorite = (idx: string) =>
    setFavorites((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);

  const allSelected = selected.length === DOCUMENT_ROWS.length;
  const toggleAll = () => setSelected(allSelected ? [] : DOCUMENT_ROWS.map((r) => r.index));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <Box sx={{ px: '24px', pt: '16px', pb: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0 }}>

        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '4px' }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.primary', cursor: 'pointer', whiteSpace: 'nowrap',
              textDecoration: 'underline', textDecorationColor: 'transparent',
              '&:hover': { textDecorationColor: 'text.primary' },
            }}
          >
            Sanoma
          </Typography>
          <Box sx={{ px: '4px', display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 10 }} />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Environmental, Social Governance
          </Typography>
          <Box sx={{ px: '4px', display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <FontAwesomeIcon icon={faAngleRight} style={{ fontSize: 10 }} />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}
          >
            Environmental
          </Typography>
        </Box>

        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Left buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<FontAwesomeIcon icon={faCloudArrowUp} style={{ fontSize: 14 }} />}
              sx={{
                fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px',
                bgcolor: 'primary.main', color: 'primary.contrastText', height: 36, borderRadius: '8px',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              Upload
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
            >
              Export
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faFilePen} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
            >
              Bulk changes
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faFolderPlus} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}
            >
              Add Folder
            </Button>
            <Button
              size="small"
              variant="text"
              endIcon={<FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { bgcolor: 'action.hover' } }}
            >
              More Actions
            </Button>
          </Box>

          {/* Right buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              size="small"
              variant="text"
              startIcon={<FontAwesomeIcon icon={faBarsStaggered} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { bgcolor: 'action.hover' } }}
            >
              Index list
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<FontAwesomeIcon icon={faTableColumns} style={{ fontSize: 14 }} />}
              sx={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', height: 36, borderRadius: '8px', color: 'primary.main', '&:hover': { bgcolor: 'action.hover' } }}
            >
              Columns
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: '1px solid', borderColor: 'divider' }}>

        {/* Scroll container — both axes */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Box sx={{ minWidth: MIN_TABLE_WIDTH, display: 'flex', flexDirection: 'column' }}>

            {/* Header row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: GRID,
                bgcolor: 'background.paperAlt',
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                zIndex: 2,
              }}
            >
              {/* Checkbox header */}
              <Box sx={{ ...headerCellSx, justifyContent: 'center' }}>
                <ThinCheckbox
                  checked={allSelected}
                  indeterminate={selected.length > 0 && !allSelected}
                  onClick={(e) => { e.stopPropagation(); toggleAll(); }}
                />
              </Box>

              {/* Favorites header */}
              <Box sx={{ ...headerCellSx, justifyContent: 'center', color: 'text.secondary' }}>
                <FontAwesomeIcon icon={faStar} style={{ fontSize: 14 }} />
              </Box>

              {/* Read/Unread header */}
              <Box sx={{ ...headerCellSx, justifyContent: 'center', color: 'text.secondary' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14 }} />
              </Box>

              {/* Index header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Index</Typography>
              </Box>

              {/* Name header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Name</Typography>
              </Box>

              {/* Type header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Type</Typography>
              </Box>

              {/* Status header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Status</Typography>
              </Box>

              {/* Redacted header */}
              <Box sx={{ ...headerCellSx, justifyContent: 'center', color: 'text.secondary' }}>
                <FontAwesomeIcon icon={faHighlighter} style={{ fontSize: 14 }} />
              </Box>

              {/* Size header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Size</Typography>
              </Box>

              {/* Date Available header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Date Available</Typography>
              </Box>

              {/* Uploaded by header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Uploaded by</Typography>
              </Box>

              {/* Language header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Language</Typography>
              </Box>

              {/* Categories header */}
              <Box sx={headerCellSx}>
                <Typography sx={headerTextSx}>Categories</Typography>
              </Box>
            </Box>

            {/* Data rows */}
            {DOCUMENT_ROWS.map((row) => {
              const isSelected = selected.includes(row.index);
              const isFavorited = favorites.includes(row.index);
              const isOpen = row.index === openDocId;
              const isActive = isSelected || isOpen;

              return (
                <Box
                  key={row.index}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    bgcolor: isActive ? 'rgba(255,136,24,0.18)' : 'rgba(255,136,24,0.08)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(255,136,24,0.24)' : 'rgba(255,136,24,0.13)',
                    },
                  }}
                  onClick={() =>
                    onDocumentOpen({
                      id: row.index,
                      name: row.name,
                      type: (row.type === 'folder' || row.type === '—' ? 'pdf' : row.type) as Doc['type'],
                      category: row.status,
                    })
                  }
                >
                  {/* Checkbox */}
                  <Box sx={{ ...dataCellSx, justifyContent: 'center' }}>
                    <ThinCheckbox
                      checked={isSelected}
                      onClick={(e) => { e.stopPropagation(); toggleSelect(row.index); }}
                    />
                  </Box>

                  {/* Favorite */}
                  <Box
                    sx={{ ...dataCellSx, justifyContent: 'center' }}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(row.index); }}
                  >
                    {isFavorited
                      ? <FontAwesomeIcon icon={faStarSolid} style={{ fontSize: 16, color: '#EF601A' }} />
                      : <Box component="span" sx={{ color: 'text.disabled', display: 'flex' }}><FontAwesomeIcon icon={faStar} style={{ fontSize: 16 }} /></Box>
                    }
                  </Box>

                  {/* Read/Unread */}
                  <Box sx={{ ...dataCellSx, justifyContent: 'center' }}>
                    {row.read === 'read' && (
                      <Box component="span" sx={{ color: 'text.secondary', display: 'flex' }}>
                        <FontAwesomeIcon icon={faEnvelopeOpen} style={{ fontSize: 15 }} />
                      </Box>
                    )}
                    {row.read === 'unread' && (
                      <Box component="span" sx={{ color: 'text.primary', display: 'flex' }}>
                        <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 15 }} />
                      </Box>
                    )}
                  </Box>

                  {/* Index */}
                  <Box sx={dataCellSx}>
                    <Typography sx={{ ...dataTextSx, fontVariantNumeric: 'tabular-nums' }}>
                      {row.index}
                    </Typography>
                  </Box>

                  {/* Name */}
                  <Box sx={{ ...dataCellSx, gap: '8px', minWidth: 0 }}>
                    <FileTypeBadge type={row.type} />
                    <Typography sx={{ ...dataTextSx, flex: 1, minWidth: 0 }}>
                      {row.name}
                    </Typography>
                  </Box>

                  {/* Type */}
                  <Box sx={dataCellSx}>
                    <Typography sx={dataTextSx}>
                      {row.type === '—' ? '—' : row.type.toUpperCase()}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={dataCellSx}>
                    <Typography sx={dataTextSx}>
                      {row.status}
                    </Typography>
                  </Box>

                  {/* Redacted */}
                  <Box sx={{ ...dataCellSx, justifyContent: 'center', color: 'text.secondary' }}>
                    {row.redacted && (
                      <FontAwesomeIcon icon={faHighlighter} style={{ fontSize: 14 }} />
                    )}
                  </Box>

                  {/* Size */}
                  <Box sx={dataCellSx}>
                    <Typography sx={{ ...dataTextSx, fontVariantNumeric: 'tabular-nums' }}>
                      {row.size}
                    </Typography>
                  </Box>

                  {/* Date Available */}
                  <Box sx={dataCellSx}>
                    <Typography sx={{ ...dataTextSx, fontVariantNumeric: 'tabular-nums' }}>
                      {row.date}
                    </Typography>
                  </Box>

                  {/* Uploaded by */}
                  <Box sx={dataCellSx}>
                    <Typography sx={dataTextSx}>
                      {row.uploadedBy}
                    </Typography>
                  </Box>

                  {/* Language */}
                  <Box sx={dataCellSx}>
                    <Typography sx={dataTextSx}>
                      {row.language}
                    </Typography>
                  </Box>

                  {/* Categories */}
                  <Box sx={{ ...dataCellSx, borderRight: 'none' }}>
                    <Typography sx={dataTextSx}>
                      {row.categories}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: '18px',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => setFooterMenuAnchor(e.currentTarget)}
            sx={{
              width: 32, height: 32,
              borderRadius: '8px',
              color: 'text.secondary',
              flexShrink: 0,
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: 16 }} />
          </IconButton>
          <Menu
            anchorEl={footerMenuAnchor}
            open={Boolean(footerMenuAnchor)}
            onClose={() => setFooterMenuAnchor(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '10px',
                  minWidth: 160,
                  bgcolor: '#1a1d23',
                  boxShadow: '0px 8px 24px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => { onThrottleToggle?.(); }}
              sx={{
                fontSize: '0.875rem',
                color: '#f0f0f0',
                borderRadius: '6px',
                mx: 0.5,
                gap: 0.5,
                px: 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              <Checkbox
                checked={throttled}
                size="small"
                disableRipple
                sx={{
                  p: 0,
                  color: 'rgba(255,255,255,0.4)',
                  '&.Mui-checked': { color: '#ff8818' },
                }}
              />
              Throttle
            </MenuItem>
          </Menu>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', letterSpacing: '0.17px' }}>
            {selected.length === 0
              ? 'Please select at least one item from the grid to see details.'
              : `${selected.length} item${selected.length !== 1 ? 's' : ''} selected`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FolderTable;
export { FileTypeBadge as FileTypeBadgeComponent };
