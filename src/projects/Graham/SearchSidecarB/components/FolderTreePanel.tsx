import React, { useState } from 'react';
import {
  Box, Tabs, Tab, Typography, List, ListItemButton,
  ListItemText, Tooltip,
} from '@mui/material';
import { moondust } from '~/theme/halo/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder, faFolderOpen, faChevronDown, faChevronRight,
  faEllipsisVertical, faServer,
  faInbox, faStar,
  faCircleDashed, faLoader, faTriangleExclamation, faCloudArrowDown,
  faRecycle,
} from '@fortawesome/pro-light-svg-icons';

const FOLDER_PANEL_WIDTH = 280;
const GALLERY_CHROME_HEIGHT = 44;
const TOP_BAR_HEIGHT = GALLERY_CHROME_HEIGHT + 60;

interface FolderTreePanelProps {
  activeFolder: string;
  onFolderChange: (id: string) => void;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  collapsed?: boolean;
  navWidth?: number;
}

// ─── Design tokens (Figma node 371:44205) ──────────────────────────────────────
const SANDBOX_BG = 'rgba(255,136,24,0.08)';
const TAB_INDICATOR = '#F38932'; // orange — matches star icon active state

// ─── Shortcut items with icons ──────────────────────────────────────────────────
const SHORTCUTS = [
  { label: 'New', icon: <FontAwesomeIcon icon={faCircleDashed} style={{ fontSize: 15 }} /> },
  { label: 'Inbox', icon: <FontAwesomeIcon icon={faInbox} style={{ fontSize: 15 }} /> },
  { label: 'Favorites', icon: <FontAwesomeIcon icon={faStar} style={{ fontSize: 15 }} /> },
  { label: 'Processing', icon: <FontAwesomeIcon icon={faLoader} style={{ fontSize: 15 }} /> },
  { label: 'Action Required', icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 15 }} /> },
  { label: 'Downloads', icon: <FontAwesomeIcon icon={faCloudArrowDown} style={{ fontSize: 15 }} /> },
  { label: 'Recycle Bin', icon: <FontAwesomeIcon icon={faRecycle} style={{ fontSize: 15 }} /> },
];

// ─── Sandbox tree data (Figma: Staging folder → children) ──────────────────────
interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const SANDBOX_TREE: TreeNode[] = [
  {
    id: 'staging',
    name: 'Staging folder',
    children: [
      { id: 'contracts', name: 'Contracts' },
      { id: 'corporate', name: 'Corporate Structure' },
      {
        id: 'esg',
        name: 'Environmental, Social, Gov…',
        children: [
          { id: 'environmental', name: 'Environmental' },
        ],
      },
      { id: 'financials', name: 'Financials' },
      { id: 'hr', name: 'Human Resources' },
    ],
  },
];

// ─── Section header ─────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Typography
    sx={{
      px: 2, pt: 2, pb: 0.75, display: 'block',
      color: 'text.primary', fontSize: '0.875rem', fontWeight: 600,
    }}
  >
    {label}
  </Typography>
);

// ─── Tree row (used in Sandbox + Index) ─────────────────────────────────────────
const TreeRow: React.FC<{
  label: string;
  icon: React.ReactNode;
  depth?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onClick?: () => void;
}> = ({ label, icon, depth = 0, isActive, isExpanded, hasChildren, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex', alignItems: 'center', cursor: 'pointer',
      pl: 1.5 + depth * 1.5, pr: 0.5, py: 0.75,
      bgcolor: isActive ? 'action.selected' : 'transparent',
      borderRadius: 1, mx: 1,
      '&:hover': { bgcolor: isActive ? 'action.focus' : 'action.hover' },
      '& .more-btn': { opacity: 0 },
      '&:hover .more-btn': { opacity: 1 },
    }}
  >
    {/* Expand chevron (only if has children) */}
    <Box sx={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', mr: 0.5 }}>
      {hasChildren && (
        isExpanded
          ? <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 14 }} />
          : <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
      )}
    </Box>
    {/* Folder icon */}
    <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    {/* Label */}
    <Typography
      sx={{
        flex: 1, fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
        color: 'text.primary',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      {label}
    </Typography>
    {/* ⋮ menu — visible on hover */}
    <Box
      className="more-btn"
      onClick={(e) => e.stopPropagation()}
      sx={{
        ml: 0.5, color: 'text.secondary', display: 'flex', alignItems: 'center', borderRadius: 1,
        p: 0.25, '&:hover': { bgcolor: 'action.disabledBackground' }
      }}
    >
      <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
    </Box>
  </Box>
);

// ─── Recursive tree renderer ────────────────────────────────────────────────────
const TreeNodes: React.FC<{
  nodes: TreeNode[];
  activeFolder: string;
  expanded: string[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  depth?: number;
}> = ({ nodes, activeFolder, expanded, onToggle, onSelect, depth = 0 }) => (
  <>
    {nodes.map((node) => {
      const isExpanded = expanded.includes(node.id);
      const hasChildren = !!(node.children?.length);
      return (
        <React.Fragment key={node.id}>
          <TreeRow
            label={node.name}
            icon={
              hasChildren
                ? (isExpanded
                  ? <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 15 }} />
                  : <FontAwesomeIcon icon={faFolder} style={{ fontSize: 15 }} />)
                : <FontAwesomeIcon icon={faFolder} style={{ fontSize: 15 }} />
            }
            depth={depth}
            isActive={activeFolder === node.id}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onClick={() => hasChildren ? onToggle(node.id) : onSelect(node.id)}
          />
          {hasChildren && isExpanded && (
            <TreeNodes
              nodes={node.children!}
              activeFolder={activeFolder}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </React.Fragment>
      );
    })}
  </>
);

// ─── Folder Tree Panel ──────────────────────────────────────────────────────────
const FolderTreePanel: React.FC<FolderTreePanelProps> = ({
  activeFolder,
  onFolderChange,
  width = FOLDER_PANEL_WIDTH,
  onResizeStart,
  collapsed = false,
  navWidth = 60,
}) => {
  const [expanded, setExpanded] = useState<string[]>(['staging', 'esg']);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  return (
    <Box
      sx={{
        position: 'fixed',
        left: navWidth,
        top: TOP_BAR_HEIGHT,
        bottom: 0,
        width: collapsed ? 0 : width,
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Scrollable content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: FOLDER_PANEL_WIDTH }}>
      {/* ── Tabs ── */}
      <Tabs
        value="folders"
        sx={{
          borderBottom: '1px solid', borderColor: 'divider',
          minHeight: 40, px: 1, flexShrink: 0,
          '& .MuiTabs-indicator': { backgroundColor: TAB_INDICATOR },
        }}
      >
        <Tab
          label="Insights"
          value="insights"
          sx={{
            fontSize: '0.875rem', fontWeight: 500, minHeight: 40, color: 'text.secondary',
            '&.Mui-selected': { color: 'text.primary' },
            textTransform: 'none'
          }}
        />
        <Tab
          label="Folders & shortcuts"
          value="folders"
          sx={{
            fontSize: '0.875rem', fontWeight: 500, minHeight: 40, color: 'text.secondary',
            '&.Mui-selected': { color: 'text.primary' },
            textTransform: 'none'
          }}
        />
      </Tabs>

      {/* ── Shortcuts ── */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <SectionHeader label="Shortcuts" />
        <List dense disablePadding sx={{ px: 1, pb: 1.5 }}>
          {SHORTCUTS.map(({ label, icon }) => (
            <ListItemButton key={label} sx={{ px: 1.5, py: 0.75, borderRadius: 1, gap: 1.25 }}>
              <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {icon}
              </Box>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  sx: { fontSize: '0.875rem', fontWeight: 400, color: 'text.primary' },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* ── Sandbox ── */}
      <Box sx={{ bgcolor: SANDBOX_BG, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
        <SectionHeader label="Sandbox" />
        <TreeNodes
          nodes={SANDBOX_TREE}
          activeFolder={activeFolder}
          expanded={expanded}
          onToggle={toggleExpanded}
          onSelect={onFolderChange}
          depth={0}
        />
      </Box>

      {/* ── Index ── */}
      <Box sx={{ bgcolor: 'background.paper', flex: 1 }}>
        <SectionHeader label="Index" />
        <TreeRow
          label="Fileroom A"
          icon={<FontAwesomeIcon icon={faServer} style={{ fontSize: 15 }} />}
          depth={0}
          isActive={false}
          hasChildren={false}
          onClick={() => { }}
        />
      </Box>
      </Box>{/* end scrollable content */}

      {/* ── Drag handle (right edge) ── */}
      {onResizeStart && (
        <Tooltip
          placement="right"
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', py: '2px' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'common.white', letterSpacing: '0.15px', lineHeight: '14px' }}>Press</Typography>
              <Box sx={{ bgcolor: moondust[400], borderRadius: '4px', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', color: moondust[900], letterSpacing: '0.17px', lineHeight: 1, fontWeight: 500 }}>]</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'common.white', letterSpacing: '0.15px', lineHeight: '14px' }}>to open</Typography>
              <Box sx={{ bgcolor: moondust[400], borderRadius: '4px', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.875rem', color: moondust[900], letterSpacing: '0.17px', lineHeight: 1, fontWeight: 500 }}>[</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: 'common.white', letterSpacing: '0.15px', lineHeight: '14px' }}>to close</Typography>
            </Box>
          }
        >
          <Box
            onMouseDown={onResizeStart}
            sx={{
              position: 'absolute', top: 0, bottom: 0, right: 0, width: 8,
              cursor: 'col-resize', zIndex: 10,
              '& .handle-bar': {
                position: 'absolute', top: 0, bottom: 0,
                left: 3, width: 2,
                bgcolor: 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.15s',
              },
              '&:hover .handle-bar': { bgcolor: 'text.disabled' },
              '&:active .handle-bar': { bgcolor: 'text.secondary' },
            }}
          >
            <Box className="handle-bar" />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default FolderTreePanel;
