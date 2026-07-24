import React, { useState } from 'react';
import {
  Box, Tabs, Tab, Typography, List, ListItemButton,
  ListItemText, IconButton, Tooltip, Avatar, Stack,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGrid, faFolder, faFolderOpen, faListUl,
  faSearch, faComments, faUsers,
  faChartLine, faFileLines, faGear,
  faClockRotateLeft, faBell, faChevronDown, faChevronRight,
  faEllipsisVertical, faServer,
  faInbox, faStar,
  faHourglass, faTriangleExclamation, faCloudArrowDown,
  faRecycle,
} from '@fortawesome/pro-light-svg-icons';
import { HALO_NAV_ORANGE } from './theme';

const ICON_RAIL_WIDTH = 72;
const FOLDER_PANEL_WIDTH = 280;
const NAV_HEIGHT = 56;

interface SidebarProps {
  sidebarTab: string;
  onSidebarTabChange: (tab: string) => void;
  activeFolder: string;
  onFolderChange: (id: string) => void;
  persona: 'sell' | 'buy';
}

// ─── Icon Rail ─────────────────────────────────────────────────────────────────

// Figma node 371:44459 — left-menu-collapsed-default
// Icons mapped from FA Pro Light to nearest MUI equivalents
const railNavItems = [
  { icon: <FontAwesomeIcon icon={faGrid}      style={{ fontSize: 18 }} />, label: 'Dashboard',   id: 'dashboard'   },
  { icon: <FontAwesomeIcon icon={faFolder}    style={{ fontSize: 18 }} />, label: 'Documents',   id: 'documents'   },
  { icon: <FontAwesomeIcon icon={faListUl}    style={{ fontSize: 18 }} />, label: 'Trackers',    id: 'trackers'    },
  { icon: <FontAwesomeIcon icon={faSearch}    style={{ fontSize: 18 }} />, label: 'Search',      id: 'search'      },
  { icon: <FontAwesomeIcon icon={faComments}  style={{ fontSize: 18 }} />, label: 'Q&A',         id: 'qa'          },
  { icon: <FontAwesomeIcon icon={faUsers}     style={{ fontSize: 18 }} />, label: 'Users',       id: 'users'       },
  { icon: <FontAwesomeIcon icon={faChartLine} style={{ fontSize: 18 }} />, label: 'Analytics',   id: 'analytics'   },
  { icon: <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 18 }} />, label: 'Reports',     id: 'reports'     },
];

// Active pill: warm grey from Figma FA-text fill rgba(233,231,223) at ~50% opacity
const ACTIVE_PILL_BG  = 'rgba(84,89,99,0.10)';
const ICON_COLOR      = '#545963'; // Figma: rgba(84,89,99,1.0)
const ICON_COLOR_ACTIVE = '#21252A';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <Tooltip title={label} placement="right" arrow>
    <Box
      onClick={onClick}
      sx={{
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        cursor: 'pointer',
        bgcolor: isActive ? ACTIVE_PILL_BG : 'transparent',
        color: isActive ? ICON_COLOR_ACTIVE : ICON_COLOR,
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: isActive ? ACTIVE_PILL_BG : 'rgba(84,89,99,0.06)' },
      }}
    >
      {icon}
    </Box>
  </Tooltip>
);

const IconRail: React.FC<{ activeId: string; onSelect: (id: string) => void }> = ({ activeId, onSelect }) => (
  <Box
    sx={{
      width: ICON_RAIL_WIDTH,
      bgcolor: '#F7F8FA',
      borderRight: '1px solid',
      borderColor: 'background.defaultAlt',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
      py: 1.5,
    }}
  >
    {/* Datasite logomark */}
    <Box sx={{ mb: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24" fill="none">
        <path d="M17.7507 5.00001H17.7217H17.6566H17.5262H17.2655H16.7441H15.7012H13.6156C13.456 5.00001 13.3032 4.93643 13.1903 4.82361C13.0774 4.71042 13.0144 4.55722 13.0144 4.39725L13.0141 0.214243C13.0141 0.0960663 12.9183 0 12.8004 0H0.213705C0.0957925 0 0 0.0960663 0 0.214243V4.78577C0 4.90394 0.0957925 5.00001 0.213705 5.00001H12.4115C12.5714 5.00001 12.7246 5.06264 12.8375 5.17619C12.9504 5.28938 13.0141 5.44331 13.0141 5.60329V18.4169C13.0141 18.5715 12.9529 18.72 12.8439 18.8293C12.7349 18.9386 12.5867 19 12.4325 19H0.213961C0.0960851 19 0.000292163 19.0961 0.000292163 19.2142L0 23.7857C0 23.9039 0.0957925 24 0.213705 24H12.8004C12.9183 24 13.0141 23.9039 13.0141 23.7857V19.6234C13.0141 19.4581 13.0797 19.2996 13.1961 19.1824C13.3126 19.0653 13.4707 19 13.6356 19H17.7863C17.9042 19 18 18.9039 18 18.7857V5.21334C18 5.09516 17.9045 5.00001 17.7866 5.00001H17.7507Z" fill="#0D0D0D"/>
      </svg>
    </Box>

    {/* Primary nav items */}
    <Stack spacing={0.25} alignItems="center" sx={{ flex: 1 }}>
      {railNavItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={item.id === activeId}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </Stack>

    {/* Bottom utilities */}
    <Stack spacing={0.25} alignItems="center" sx={{ pb: 0.5 }}>
      <Tooltip title="Settings" placement="right" arrow>
        <Box
          sx={{
            width: 44, height: 44, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '10px', cursor: 'pointer',
            color: ICON_COLOR, '&:hover': { bgcolor: 'rgba(84,89,99,0.06)' },
          }}
        >
          <FontAwesomeIcon icon={faGear} style={{ fontSize: 18 }} />
        </Box>
      </Tooltip>
      <Tooltip title="History" placement="right" arrow>
        <Box
          sx={{
            width: 44, height: 44, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '10px', cursor: 'pointer',
            color: ICON_COLOR, '&:hover': { bgcolor: 'rgba(84,89,99,0.06)' },
          }}
        >
          <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 18 }} />
        </Box>
      </Tooltip>
      <Tooltip title="Notifications" placement="right" arrow>
        <Box
          sx={{
            width: 44, height: 44, display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '10px', cursor: 'pointer',
            color: ICON_COLOR, '&:hover': { bgcolor: 'rgba(84,89,99,0.06)' },
          }}
        >
          <FontAwesomeIcon icon={faBell} style={{ fontSize: 18 }} />
        </Box>
      </Tooltip>

      {/* Avatar with green online badge */}
      <Box sx={{ position: 'relative', mt: 0.5, cursor: 'pointer' }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#747880',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          JT
        </Avatar>
        {/* Green online dot — Figma: Badge/Dot/Success fill rgba(20,131,40) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#148328',
            border: '1.5px solid #F7F8FA',
          }}
        />
      </Box>
    </Stack>
  </Box>
);

// ─── Design tokens (Figma node 371:44205) ──────────────────────────────────────
const TEXT_PRIMARY   = '#1F2227'; // rgba(31,34,39)
const TEXT_SECONDARY = '#545963'; // Moondust 600 approx
const SECTION_BG     = '#FAFAF7'; // Moondust 50
const SANDBOX_BG     = 'rgba(255,136,24,0.08)';
const ICON_GREY      = '#747880';
const TAB_INDICATOR  = '#F38932'; // orange — matches star icon active state

// ─── Shortcut items with icons ──────────────────────────────────────────────────
const SHORTCUTS = [
  { label: 'New',             icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 18.7l30.7 97.1 5.1 16.2 16.8-3.2 100.3-19.1-61.9 80.2-10.4 13.5 13.9 9.9 83.2 59.4-98.9 18.7-16.7 3.2 1.5 16.9 9.5 101.5-88.4-51.7-14.8-8.7-14.8 8.7-88.4 51.7 9.5-101.5 1.5-16.9-16.7-3.2-98.9-18.7 83.2-59.4 13.9-9.9-10.4-13.5L99.1 109.7l100.3 19.1 16.8 3.2 5.1-16.2L256 18.7zm0-18.7c-3.5 0-6.7 2.3-7.7 5.7L215.6 108 109.1 87.6c-3.6-.7-7.2.9-9.2 4-1.9 3.1-1.7 7.1.6 9.9l68.6 88.8-92.1 65.8c-3 2.1-4.4 5.8-3.7 9.4.8 3.6 3.6 6.3 7.2 6.9l109.6 20.7-10.5 112.4c-.3 3.7 1.7 7.1 5 8.8 3.3 1.7 7.3 1.1 9.9-1.4L256 346.8l61.5 55.9c2.6 2.4 6.6 3.1 9.9 1.4 3.3-1.7 5.4-5.1 5-8.8L321.9 282.8l109.6-20.7c3.7-.7 6.5-3.3 7.2-6.9.8-3.6-.7-7.3-3.7-9.4l-92.1-65.8 68.6-88.8c2.3-2.9 2.5-6.8.6-9.9-2-3.1-5.6-4.7-9.2-4L296.4 108 263.7 5.7C262.7 2.3 259.5 0 256 0z"/>
    </svg>
  ) },
  { label: 'Inbox',           icon: <FontAwesomeIcon icon={faInbox}              style={{ fontSize: 20 }} /> },
  { label: 'Favorites',       icon: <FontAwesomeIcon icon={faStar}               style={{ fontSize: 20 }} /> },
  { label: 'Processing',      icon: <FontAwesomeIcon icon={faHourglass}          style={{ fontSize: 20 }} /> },
  { label: 'Action Required', icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 20 }} /> },
  { label: 'Downloads',       icon: <FontAwesomeIcon icon={faCloudArrowDown}     style={{ fontSize: 20 }} /> },
  { label: 'Recycle Bin',     icon: <FontAwesomeIcon icon={faRecycle}            style={{ fontSize: 20 }} /> },
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
      { id: 'contracts',       name: 'Contracts' },
      { id: 'corporate',       name: 'Corporate Structure' },
      {
        id: 'esg',
        name: 'Environmental, Social, Gov…',
        children: [
          { id: 'environmental', name: 'Environmental' },
        ],
      },
      { id: 'financials',    name: 'Financials' },
      { id: 'hr',            name: 'Human Resources' },
    ],
  },
];

// ─── Section header ─────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <Typography
    sx={{
      px: 2, pt: 2, pb: 0.75, display: 'block',
      color: TEXT_PRIMARY, fontSize: '0.875rem', fontWeight: 600,
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
      bgcolor: isActive ? 'rgba(72,94,240,0.06)' : 'transparent',
      borderRadius: 1, mx: 1,
      '&:hover': { bgcolor: isActive ? 'rgba(72,94,240,0.08)' : 'rgba(0,0,0,0.04)' },
      '& .more-btn': { opacity: 0 },
      '&:hover .more-btn': { opacity: 1 },
    }}
  >
    {/* Expand chevron (only if has children) */}
    <Box sx={{ width: 16, flexShrink: 0, display: 'flex', alignItems: 'center', mr: 0.5 }}>
      {hasChildren && (
        isExpanded
          ? <FontAwesomeIcon icon={faChevronDown}  style={{ fontSize: 14 }} />
          : <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 14 }} />
      )}
    </Box>
    {/* Folder icon */}
    <Box sx={{ mr: 1, color: ICON_GREY, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    {/* Label */}
    <Typography
      sx={{
        flex: 1, fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
        color: isActive ? TEXT_PRIMARY : TEXT_PRIMARY,
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
      sx={{ ml: 0.5, color: TEXT_SECONDARY, display: 'flex', alignItems: 'center', borderRadius: 1,
            p: 0.25, '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
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
                    ? <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 20 }} />
                    : <FontAwesomeIcon icon={faFolder}     style={{ fontSize: 20 }} />)
                : <FontAwesomeIcon icon={faFolder} style={{ fontSize: 20 }} />
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
const FolderTreePanel: React.FC<{
  activeFolder: string;
  onFolderChange: (id: string) => void;
}> = ({ activeFolder, onFolderChange }) => {
  const [expanded, setExpanded] = useState<string[]>(['staging', 'esg']);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  return (
    <Box
      sx={{
        width: FOLDER_PANEL_WIDTH,
        bgcolor: '#fff',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* ── Tabs ── */}
      <Tabs
        value="folders"
        sx={{
          borderBottom: '1px solid', borderColor: 'background.defaultAlt',
          minHeight: 40, px: 1, flexShrink: 0,
          '& .MuiTabs-indicator': { backgroundColor: TAB_INDICATOR },
        }}
      >
        <Tab
          label="Insights"
          value="insights"
          sx={{ fontSize: '0.875rem', fontWeight: 500, minHeight: 40, color: TEXT_SECONDARY,
                '&.Mui-selected': { color: TEXT_PRIMARY } }}
        />
        <Tab
          label="Folders & Shortcuts"
          value="folders"
          sx={{ fontSize: '0.875rem', fontWeight: 500, minHeight: 40, color: TEXT_SECONDARY,
                '&.Mui-selected': { color: TEXT_PRIMARY } }}
        />
      </Tabs>

      {/* ── Shortcuts ── */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <SectionHeader label="Shortcuts" />
        <List dense disablePadding sx={{ px: 1, pb: 1.5 }}>
          {SHORTCUTS.map(({ label, icon }) => (
            <ListItemButton key={label} sx={{ px: 1.5, py: 0.75, borderRadius: 1, gap: 1.25 }}>
              <Box sx={{ color: ICON_GREY, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {icon}
              </Box>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  sx: { fontSize: '0.875rem', fontWeight: 400, color: TEXT_PRIMARY },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* ── Sandbox ── */}
      <Box sx={{ bgcolor: SANDBOX_BG, borderBottom: '1px solid', borderColor: 'background.defaultAlt', pb: 1.5 }}>
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
          icon={<FontAwesomeIcon icon={faServer} style={{ fontSize: 20 }} />}
          depth={0}
          isActive={false}
          hasChildren={false}
          onClick={() => {}}
        />
      </Box>
    </Box>
  );
};

// ─── Sidebar ────────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({
  activeFolder,
  onFolderChange,
}) => {
  const [activeRailId, setActiveRailId] = useState('documents');

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        display: 'flex',
        zIndex: 1200,
        borderRight: '1px solid',
        borderColor: 'background.defaultAlt',
      }}
    >
      <IconRail activeId={activeRailId} onSelect={setActiveRailId} />
      {/* Folder panel starts below the TopNav */}
      <Box sx={{ mt: `${NAV_HEIGHT}px`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <FolderTreePanel activeFolder={activeFolder} onFolderChange={onFolderChange} />
      </Box>
    </Box>
  );
};

export default Sidebar;
