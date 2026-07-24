import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Button, InputBase, Paper, Chip, Tabs, Tab,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faCopy,
  faBars, faPlus, faSquarePlus,
  faArrowUp, faSquare, faArrowUpRightFromSquare, faFolder, faExpand,
  faSearch, faFileLines,
  faChevronRight, faChevronDown, faEllipsisVertical, faPencil, faTrash,
} from '@fortawesome/pro-light-svg-icons';
import { faThumbtack } from '@fortawesome/pro-solid-svg-icons';
import { ChatMessage, getChatResponse } from './mockData';

const ASSISTANT_WIDTH = Math.round(window.innerWidth * 0.20);
const GALLERY_CHROME_HEIGHT = 44; // gallery breadcrumb bar
const TOP_BAR_HEIGHT = GALLERY_CHROME_HEIGHT + 60; // gallery chrome + DatasitePrototypeShell header

export type ViewMode = 'sidebar' | 'fullscreen';

interface AssistantPanelProps {
  open: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
  onChatUpdate: (msgs: ChatMessage[]) => void;
  activeFolder: string;
  documentOpen: { name: string } | null;
  persona: 'sell' | 'buy';
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  navWidth?: number;
  folderPanelWidth?: number;
  throttled?: boolean;
}

function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <Typography key={i} component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {p.slice(2, -2)}
        </Typography>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  return lines.map((line, i) => (
    <Typography
      key={i}
      variant="body1"
      component="div"
      sx={{ color: 'text.primary', mb: line === '' ? 0.5 : 0, lineHeight: 1.55 }}
    >
      {renderBold(line)}
    </Typography>
  ));
}

const BlueflameAvatar: React.FC = () => (
  <Box sx={{ width: 16, height: 16, flexShrink: 0, mt: '1px' }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="15" fill="#EF601A"/>
      <path
        d="M24.5883 14.9469C19.7217 14.9469 15.7661 10.9913 15.7661 6.12469C15.7661 5.8949 15.5855 5.71436 15.3557 5.71436C15.126 5.71436 14.9454 5.8949 14.9454 6.12469C14.9454 10.9913 10.9898 14.9469 6.12322 14.9469C5.89344 14.9469 5.71289 15.1274 5.71289 15.3572C5.71289 15.587 5.89344 15.7675 6.12322 15.7675C10.9898 15.7675 14.9454 19.7232 14.9454 24.5897C14.9454 24.8195 15.126 25.0001 15.3557 25.0001C15.5855 25.0001 15.7661 24.8195 15.7661 24.5897C15.7661 19.7232 19.7217 15.7675 24.5883 15.7675C24.8181 15.7675 24.9986 15.587 24.9986 15.3572C24.9986 15.1274 24.8181 14.9469 24.5883 14.9469Z"
        fill="#FAFAF7"
      />
    </svg>
  </Box>
);

const THINKING_TEXT = 'Consulting the data room...';

const ThinkingRow: React.FC = () => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayText(THINKING_TEXT.slice(0, i));
      if (i >= THINKING_TEXT.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', mb: 2 }}>
      {/* Spinning orange sparkle */}
      <Box sx={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{
          width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'sparkle-spin 1.4s linear infinite',
          '@keyframes sparkle-spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}>
          <svg width="18" height="18" viewBox="0 0 20 17" fill="none">
            <path d="M16.1037 8.22872C12.8864 8.22872 10.2713 5.61361 10.2713 2.39628C10.2713 2.24436 10.1519 2.125 10 2.125C9.84808 2.125 9.72872 2.24436 9.72872 2.39628C9.72872 5.61361 7.11361 8.22872 3.89628 8.22872C3.74436 8.22872 3.625 8.34808 3.625 8.5C3.625 8.65192 3.74436 8.77128 3.89628 8.77128C7.11361 8.77128 9.72872 11.3864 9.72872 14.6037C9.72872 14.7557 9.84808 14.875 10 14.875C10.1519 14.875 10.2713 14.7557 10.2713 14.6037C10.2713 11.3864 12.8864 8.77128 16.1037 8.77128C16.2557 8.77128 16.375 8.65192 16.375 8.5C16.375 8.34808 16.2557 8.22872 16.1037 8.22872Z" fill="#EF601A"/>
          </svg>
        </Box>
      </Box>

      <Typography sx={{ flex: 1, minWidth: 0, fontSize: '0.875rem', color: 'text.secondary', letterSpacing: '0.17px', lineHeight: 1.43 }}>
        {displayText}
      </Typography>
    </Box>
  );
};

const StoppedRow: React.FC = () => (
  <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', mb: 2 }}>
    <Box sx={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="18" height="18" viewBox="0 0 20 17" fill="none">
        <path d="M16.1037 8.22872C12.8864 8.22872 10.2713 5.61361 10.2713 2.39628C10.2713 2.24436 10.1519 2.125 10 2.125C9.84808 2.125 9.72872 2.24436 9.72872 2.39628C9.72872 5.61361 7.11361 8.22872 3.89628 8.22872C3.74436 8.22872 3.625 8.34808 3.625 8.5C3.625 8.65192 3.74436 8.77128 3.89628 8.77128C7.11361 8.77128 9.72872 11.3864 9.72872 14.6037C9.72872 14.7557 9.84808 14.875 10 14.875C10.1519 14.875 10.2713 14.7557 10.2713 14.6037C10.2713 11.3864 12.8864 8.77128 16.1037 8.77128C16.2557 8.77128 16.375 8.65192 16.375 8.5C16.375 8.34808 16.2557 8.22872 16.1037 8.22872Z" fill="#EF601A"/>
      </svg>
    </Box>
    <Typography sx={{ flex: 1, fontSize: '0.875rem', color: 'text.secondary', letterSpacing: '0.17px', lineHeight: 1.43 }}>
      Answer stopped
    </Typography>
  </Box>
);

const AssistantMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
      <BlueflameAvatar />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {renderContent(msg.content)}
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.75, fontSize: '0.75rem' }}>
          {msg.timestamp}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
      <Button size="small" startIcon={<FontAwesomeIcon icon={faCopy} style={{ fontSize: 14 }} />}
        sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8125rem', fontWeight: 400, px: 1, py: 0.5, minWidth: 0, gap: 0.25, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
        Copy
      </Button>
      <Button size="small" startIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 14 }} />}
        sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8125rem', fontWeight: 400, px: 1, py: 0.5, minWidth: 0, gap: 0.25, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
        Export
      </Button>
    </Box>
  </Box>
);

const UserMessage: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', maxWidth: '88%' }}>
      <Box sx={{
        bgcolor: '#f7f8fa',
        borderRadius: '18px',
        borderTopRightRadius: 0,
        px: 2, py: 2,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden',
      }}>
        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.43, letterSpacing: '0.17px' }}>
          {msg.content}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.43 }}>
          {msg.timestamp}
        </Typography>
      </Box>
      <Box sx={{
        width: 24, height: 24,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: '2px',
      }}>
        <Typography sx={{ fontSize: '0.625rem', color: '#fff', lineHeight: 1, userSelect: 'none' }}>G</Typography>
      </Box>
    </Box>
  </Box>
);

// ─── Chat menu mock data ───────────────────────────────────────────────────────
const AgentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12.8781 13.0188C12.4406 11.2844 10.8719 10 9 10H7C5.12813 10 3.55938 11.2844 3.12188 13.0188C1.8125 11.7469 1 9.96875 1 8C1 4.13438 4.13438 1 8 1C11.8656 1 15 4.13438 15 8C15 9.96875 14.1875 11.7469 12.8781 13.0188ZM11.9875 13.75C10.8594 14.5375 9.48125 15 8 15C6.51875 15 5.14062 14.5375 4.00938 13.7531C4.13438 12.2125 5.425 11 7 11H9C10.575 11 11.8625 12.2125 11.9906 13.7531L11.9875 13.75ZM8 16C10.1217 16 12.1566 15.1571 13.6569 13.6569C15.1571 12.1566 16 10.1217 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0C5.87827 0 3.84344 0.842855 2.34315 2.34315C0.842855 3.84344 0 5.87827 0 8C0 10.1217 0.842855 12.1566 2.34315 13.6569C3.84344 15.1571 5.87827 16 8 16ZM8 7.5C7.60218 7.5 7.22064 7.34196 6.93934 7.06066C6.65804 6.77936 6.5 6.39782 6.5 6C6.5 5.60218 6.65804 5.22064 6.93934 4.93934C7.22064 4.65804 7.60218 4.5 8 4.5C8.39782 4.5 8.77936 4.65804 9.06066 4.93934C9.34196 5.22064 9.5 5.60218 9.5 6C9.5 6.39782 9.34196 6.77936 9.06066 7.06066C8.77936 7.34196 8.39782 7.5 8 7.5ZM5.5 6C5.5 6.66304 5.76339 7.29893 6.23223 7.76777C6.70107 8.23661 7.33696 8.5 8 8.5C8.66304 8.5 9.29893 8.23661 9.76777 7.76777C10.2366 7.29893 10.5 6.66304 10.5 6C10.5 5.33696 10.2366 4.70107 9.76777 4.23223C9.29893 3.76339 8.66304 3.5 8 3.5C7.33696 3.5 6.70107 3.76339 6.23223 4.23223C5.76339 4.70107 5.5 5.33696 5.5 6Z" fill="currentColor"/>
  </svg>
);

const AGENTS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'cim',    label: 'CIM Summary', icon: <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 16, flexShrink: 0 }} /> },
  { id: 'agent1', label: 'Agent 1',     icon: <AgentIcon /> },
  { id: 'agent2', label: 'Agent 2',     icon: <AgentIcon /> },
];

const RECENT_CHATS = [
  'Review the proposed acquisition structure and flag any structural risks',
  'This target has operations in 7 countries. Summarise key regulatory exposure',
  'Identify retention risk in the management team based on employment contracts',
  'Review the employee benefits and pension obligations in these HR documents',
  "We've received the IT infrastructure overview. Flag any cyber or tech risks",
  "Analyze this target's supply chain structure and flag concentration risks",
  'Review this org chart and management team bios. Identify key dependencies',
  'Draft a competitive landscape analysis for this target in the EdTech sector',
  'Summarize customer concentration risk based on the top 10 customer list',
  'The target claims a 23% market share in European logistics. Validate this',
  'Identify any IP ownership gaps in these employment and contractor agreements',
  "Review this target's litigation history and flag any pending material claims",
  'Summarize the key risks in these material contracts and flag change of control',
  "We're looking at a SaaS business with $40M ARR. Benchmark revenue multiples",
  "Build a working capital bridge between the target's last 3 balance sheet dates",
  'Review these financial statements and identify any unusual accounting policies',
  "Analyze this target company's last 3 years of EBITDA and normalize for one-offs",
];

const deriveChatName = (prompt: string): string => {
  const t = prompt.trim();
  if (t.length <= 28) return t;
  const cut = t.slice(0, 26);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 8 ? cut.slice(0, lastSpace) : cut) + '…';
};

// ─── ChatMenu floating panel ───────────────────────────────────────────────────
const ChatMenu: React.FC<{ open: boolean; onClose: () => void; onNewChat: () => void; flat?: boolean; newChatDisabled?: boolean; currentChatName?: string }> = ({ open, onClose, onNewChat, flat = false, newChatDisabled = false, currentChatName }) => {
  const [search, setSearch] = useState('');
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set([RECENT_CHATS[0]]));
  const [chats, setChats] = useState([...RECENT_CHATS]);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Inject the current chat name at the top of the unpinned section when it arrives
  useEffect(() => {
    if (!currentChatName || chats.includes(currentChatName)) return;
    setChats(prev => {
      const pinned = prev.filter(c => pinnedChats.has(c));
      const unpinned = prev.filter(c => !pinnedChats.has(c));
      return [...pinned, currentChatName, ...unpinned];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatName]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuIndex !== null) {
        setOpenMenuIndex(null);
      }
    };

    if (openMenuIndex !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuIndex]);

  const togglePin = (index: number) => {
    const chat = chats[index];
    const newPinned = new Set(pinnedChats);

    if (newPinned.has(chat)) {
      // Unpin - restore to original position
      newPinned.delete(chat);

      // Find original index in RECENT_CHATS
      const originalIndex = RECENT_CHATS.indexOf(chat);

      // Rebuild the list with pinned items at top, then unpinned in original order
      const pinnedItems = chats.filter(c => newPinned.has(c));
      const unpinnedItems = RECENT_CHATS.filter(c => !newPinned.has(c));

      setChats([...pinnedItems, ...unpinnedItems]);
      setPinnedChats(newPinned);
    } else {
      // Pin and move to end of pinned section
      newPinned.add(chat);

      // Rebuild list: all pinned items first (in their relative order), then unpinned
      const pinnedItems = chats.filter(c => newPinned.has(c) || c === chat);
      const unpinnedItems = chats.filter(c => !newPinned.has(c) && c !== chat);

      setChats([...pinnedItems, ...unpinnedItems]);
      setPinnedChats(newPinned);
    }
  };

  const filtered = search.trim()
    ? chats.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : chats;

  return (
    <Box
      sx={flat ? {
        width: 312,
        flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        bgcolor: 'background.default',
        borderRight: '1px solid', borderColor: 'divider',
        overflow: 'hidden',
      } : {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: '100%', maxWidth: 600,
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        bgcolor: 'background.default',
        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        opacity: open ? 1 : 0,
        transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), opacity 0.18s ease',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {/* Row 1: panel title (flat) or close button (overlay) — aligned to main header height */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, height: 41, flexShrink: 0, borderTop: '1px solid', borderColor: 'background.defaultAlt' }}>
        {flat ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none" style={{ flexShrink: 0 }}>
                <path d="M18.5 8.5C18.5 3.80558 14.6944 0 10 0C5.30558 0 1.5 3.80558 1.5 8.5C1.5 13.1944 5.30558 17 10 17C14.6944 17 18.5 13.1944 18.5 8.5Z" fill="#FF8818"/>
                <path d="M16.1037 8.22872C12.8864 8.22872 10.2713 5.61361 10.2713 2.39628C10.2713 2.24436 10.1519 2.125 10 2.125C9.84808 2.125 9.72872 2.24436 9.72872 2.39628C9.72872 5.61361 7.11361 8.22872 3.89628 8.22872C3.74436 8.22872 3.625 8.34808 3.625 8.5C3.625 8.65192 3.74436 8.77128 3.89628 8.77128C7.11361 8.77128 9.72872 11.3864 9.72872 14.6037C9.72872 14.7557 9.84808 14.875 10 14.875C10.1519 14.875 10.2713 14.7557 10.2713 14.6037C10.2713 11.3864 12.8864 8.77128 16.1037 8.77128C16.2557 8.77128 16.375 8.65192 16.375 8.5C16.375 8.34808 16.2557 8.22872 16.1037 8.22872Z" fill="#F6F6F6"/>
              </svg>
              <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.75, letterSpacing: '0.15px' }}>
                Datasite AI
              </Typography>
            </Box>
          </Box>
        ) : (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Row 2: new chat */}
      <Box
        onClick={newChatDisabled ? undefined : onNewChat}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
          mx: 1.5, px: 1, py: 0.875, borderRadius: '8px',
          cursor: newChatDisabled ? 'default' : 'pointer',
          opacity: newChatDisabled ? 0.38 : 1,
          '&:hover': { bgcolor: newChatDisabled ? 'transparent' : 'action.hover' },
        }}
      >
        <FontAwesomeIcon icon={faSquarePlus} style={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary' }}>New chat</Typography>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.selected', borderRadius: 2 } }}>

        {/* Agents section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, pb: 0.5 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}>Agents</Typography>
          <IconButton size="small" sx={{ width: 24, height: 24, borderRadius: '6px', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        {AGENTS.map(({ id, label, icon }) => (
          <Box
            key={id}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25,
              px: 1, py: 0.875, borderRadius: '8px', cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {icon}
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.primary' }}>{label}</Typography>
          </Box>
        ))}
        <Box sx={{ px: 1, py: 0.875, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: '8px' }}>
          <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>View all</Typography>
        </Box>

        {/* Recent section */}
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary', pt: 2, pb: 0.75, display: 'block' }}>
          Recent
        </Typography>

        {/* Search */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1.25, py: '8px',
            border: '1px solid', borderColor: 'divider',
            borderRadius: '8px', mb: 0.5,
            '&:focus-within': { borderColor: 'text.secondary' },
          }}
        >
          <FontAwesomeIcon icon={faSearch} style={{ fontSize: 16 }} />
          <InputBase
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a recent chat"
            fullWidth
            sx={{ fontSize: '0.875rem', '& input::placeholder': { color: 'text.disabled', opacity: 1 } }}
          />
        </Box>

        {/* Recent chat list */}
        {filtered.map((chat, i) => {
          const isPinned = pinnedChats.has(chat);
          const isMenuOpen = openMenuIndex === i;
          return (
            <Box
              key={i}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1, py: 0.75, borderRadius: '8px', cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                '& .pin-default': { opacity: 0, transition: 'opacity 0.2s' },
                '&:hover .pin-default': { opacity: 1 },
                '&:hover .chevron-icon': { display: 'none' },
                '&:hover .ellipsis-icon': { display: 'flex' },
              }}
            >
              {/* Left icon - thumbtack (solid if pinned, outline on hover if not) */}
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(i);
                }}
                sx={{
                  width: 20,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPinned ? (
                  <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: 16 }} />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none" className="pin-default">
                    <path d="M5.50936 1H6.73749L6.37499 5.89375C5.28749 6.70625 4.48749 7.90625 4.19061 9.31563L4.15311 9.49375C3.98749 10.2687 4.58124 11 5.37499 11H14.6437C15.4375 11 16.0312 10.2687 15.8656 9.49375L15.8281 9.31563C15.5312 7.90625 14.7312 6.70625 13.6406 5.89375L13.2812 1H14.5094C14.7844 1 15.0094 0.775 15.0094 0.5C15.0094 0.225 14.7844 0 14.5094 0H5.50936C5.23436 0 5.00936 0.225 5.00936 0.5C5.00936 0.775 5.23436 1 5.50936 1ZM7.35624 6.19375L7.74061 1H12.2781L12.6625 6.19375C12.6719 6.3375 12.7469 6.47188 12.8625 6.55625L13.0437 6.69375C13.9437 7.36562 14.6062 8.35625 14.85 9.52188L14.8875 9.7C14.9187 9.85625 14.8031 10 14.6437 10H5.37499C5.21561 10 5.09686 9.85312 5.13124 9.7L5.16874 9.52188C5.41561 8.35625 6.07499 7.36562 6.97499 6.69375L7.15624 6.55625C7.27186 6.46875 7.34374 6.3375 7.35624 6.19375ZM9.50936 12.5V16.5C9.50936 16.775 9.73436 17 10.0094 17C10.2844 17 10.5094 16.775 10.5094 16.5V12.5H9.50936Z" fill="currentColor"/>
                  </svg>
                )}
              </Box>

              <Typography
                noWrap
                sx={{ flex: 1, fontSize: '0.9375rem', color: 'text.primary', letterSpacing: '0.15px' }}
              >
                {chat}
              </Typography>

              {/* Right icon - angle right default, vertical ellipsis on hover */}
              <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" style={{ fontSize: 12 }} />
              <Box
                className="ellipsis-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuIndex(isMenuOpen ? null : i);
                }}
                sx={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 18 }} />
              </Box>

              {/* Context menu */}
              {isMenuOpen && (
                <Paper
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    right: 8,
                    mt: 0.5,
                    minWidth: 160,
                    py: 0.5,
                    zIndex: 1000,
                    borderRadius: '8px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Rename */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      setOpenMenuIndex(null);
                      // TODO: Implement rename
                    }}
                  >
                    <FontAwesomeIcon icon={faPencil} style={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>Rename</Typography>
                  </Box>

                  {/* Pin/Unpin */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      setOpenMenuIndex(null);
                      togglePin(i);
                    }}
                  >
                    <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
                      {isPinned ? 'Unpin' : 'Pin'}
                    </Typography>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ borderTop: '1px solid', borderColor: 'background.defaultAlt', my: 0.5 }} />

                  {/* Delete */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => {
                      setOpenMenuIndex(null);
                      setChats(chats.filter((_, idx) => idx !== i));
                      const newPinned = new Set(pinnedChats);
                      newPinned.delete(chat);
                      setPinnedChats(newPinned);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>Delete</Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};


// ─── Prompt Library ───────────────────────────────────────────────────────────

const PROMPT_SECTIONS = [
  {
    tab: 'Material Prep',
    items: [
      { title: 'Organize source documents',    badge: 'Assist',    desc: 'Help me organize and categorize the source documents for this data room project.' },
      { title: 'Review document completeness', badge: 'Blueflame', desc: 'Review the available documents and identify what materials are still needed for the data room.' },
      { title: 'Create folder structure plan', badge: 'Assist',    desc: 'Suggest an optimal folder structure based on the documents we have collected.' },
    ],
  },
  {
    tab: 'Project Setup',
    items: [
      { title: 'Set up initial folder structure', badge: 'Assist', desc: 'Help me set up the initial folder structure for this virtual data room.' },
      { title: 'Configure access permissions',    badge: 'Assist', desc: 'Guide me through setting up appropriate access permissions for different user groups.' },
      { title: 'Upload and organize documents',   badge: 'Assist', desc: 'Help me upload and organize documents into the appropriate folders.' },
    ],
  },
  {
    tab: 'Pre-Diligence',
    items: [
      { title: 'Find sensitive data & disclosures', badge: 'Blueflame', desc: 'Search the selected documents for sensitive or personally identifiable information (PII), as well as legal, financial, or regulatory disclosures that may warrant review or redaction before being made available to buyers.' },
      { title: 'Summarize selected documents',      badge: 'Blueflame', desc: "Provide a concise summary of the documents I've selected, highlighting the key points, obligations, and anything that warrants closer review." },
      { title: 'Identify information gaps',         badge: 'Blueflame', desc: 'Based on the working context selection, what key documents or data are missing that would typically be expected in a deal of this type?' },
      { title: 'Surface key deal risks',            badge: 'Blueflame', desc: 'Review the selected documents and identify the most significant risks a buyer should be aware of before proceeding — operational, legal, financial, or reputational.' },
    ],
  },
  {
    tab: 'Active Diligence',
    items: [
      { title: 'Anticipate buyer questions',                badge: 'Blueflame', desc: 'Review the selected documents and flag any inconsistencies in figures, dates, or representations that buyers are likely to challenge or raise questions about.' },
      { title: 'Flag inconsistencies buyers will scrutinize', badge: 'Blueflame', desc: 'Review the selected documents and flag any inconsistencies across them. For each, note which documents are in conflict and explain why a buyer is likely to challenge it.' },
      { title: 'Assess regulatory & compliance risk',       badge: 'Blueflame', desc: 'Identify any regulatory, licensing, or compliance obligations the target is subject to. Flag areas where documentation appears non-compliant or incomplete.' },
      { title: 'Flag unusual or missing clauses',           badge: 'Blueflame', desc: "Review the selected agreements and flag any clauses that are atypical, one-sided, or missing standard protections that a buyer's legal counsel would expect to see." },
    ],
  },
];

const PromptLibrary: React.FC<{ open: boolean; onClose: () => void; onSelect: (prompt: string) => void; sx?: object }> = ({ open, onClose, onSelect, sx: sxOverride }) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);

  const scrollToSection = (index: number) => {
    setActiveTab(index);
    const container = scrollRef.current;
    const section = sectionRefs.current[index];
    if (!container || !section) return;
    isProgrammaticScroll.current = true;
    // getBoundingClientRect gives position relative to viewport, accounting for
    // current scroll — subtract container top then add scrollTop for absolute offset
    const top = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top, behavior: 'smooth' });
    setTimeout(() => { isProgrammaticScroll.current = false; }, 800);
  };

  // Update active tab based on scroll position (manual scroll only)
  const handleScroll = () => {
    if (isProgrammaticScroll.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const containerTop = container.getBoundingClientRect().top;
    let current = 0;
    sectionRefs.current.forEach((ref, i) => {
      if (ref && ref.getBoundingClientRect().top - containerTop <= 8) current = i;
    });
    setActiveTab(current);
  };

  return (
    <Box
      sx={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
        zIndex: 20,
        display: 'flex', flexDirection: 'column',
        bgcolor: 'background.default',
        borderTopLeftRadius: 8, borderTopRightRadius: 8,
        boxShadow: '0px -4px 24px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden',
        ...sxOverride,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2, pb: 2, borderBottom: '1px solid', borderColor: 'background.defaultAlt', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
          Prompt library
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Anchor nav tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => scrollToSection(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid', borderColor: 'background.defaultAlt',
          minHeight: 48,
          '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          '& .MuiTab-root': { minHeight: 48, py: 2, px: 2, textTransform: 'none', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.4px', color: 'text.secondary' },
          '& .Mui-selected': { color: 'primary.main !important' },
        }}
      >
        {PROMPT_SECTIONS.map((s) => (
          <Tab key={s.tab} label={s.tab} />
        ))}
      </Tabs>

      {/* Scrollable full list */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{ flex: 1, overflowY: 'auto', position: 'relative', px: 3, pt: 0, pb: 4, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.selected', borderRadius: 2 } }}
      >
        {PROMPT_SECTIONS.map((section, si) => (
          <Box
            key={section.tab}
            id={`prompt-section-${si}`}
            ref={(el: HTMLDivElement | null) => { sectionRefs.current[si] = el; }}
            sx={{ mb: 3 }}
          >
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.default', pt: '16px', pb: 1, mx: -3, px: 3 }}>
              <Typography variant="subtitle1" sx={{ color: 'text.primary', mt: 0, mb: 0 }}>
                {section.tab}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map((item) => (
                <Box
                  key={item.title}
                  onClick={() => { onSelect(item.title); onClose(); }}
                  sx={{
                    px: 1.5, py: 1.5, borderRadius: '10px', cursor: 'pointer', border: '1px solid transparent',
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(72,94,240,0.12)', borderRadius: '4px', px: '8px', py: '2px' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#485ef0', lineHeight: '18px', whiteSpace: 'nowrap' }}>
                        {item.badge}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
        {/* Spacer so the last section can always scroll to the top */}
        <Box sx={{ height: '70vh', flexShrink: 0 }} />
      </Box>
    </Box>
  );
};


// Slash command actions
const SLASH_ACTIONS = [
  { id: 'summarize',       label: 'Summarize selected documents' },
  { id: 'risks',           label: 'Surface key deal risks' },
  { id: 'gaps',            label: 'Identify information gaps' },
  { id: 'sensitive',       label: 'Find sensitive data & disclosures' },
  { id: 'questions',       label: 'Anticipate buyer questions' },
  { id: 'inconsistencies', label: 'Flag inconsistencies buyers will scrutinize' },
  { id: 'clauses',         label: 'Flag unusual or missing clauses' },
  { id: 'compliance',      label: 'Assess regulatory & compliance risk' },
];

// Enter/return key icon
const ReturnKeyIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 2.5V5.5C10.5 6.05 10.05 6.5 9.5 6.5H2L4.5 4M2 6.5L4.5 9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  open,
  onClose,
  chatHistory,
  onChatUpdate,
  activeFolder,
  documentOpen,
  viewMode,
  onViewModeChange,
  width = ASSISTANT_WIDTH,
  onResizeStart,
  navWidth = 60,
  folderPanelWidth = 0,
  throttled = false,
}) => {
  const [inputValue, setInputValue]         = useState('');
  const [isProcessing, setIsProcessing]     = useState(false);
  const [isStopped, setIsStopped]           = useState(false);
  const [chatMenuOpen, setChatMenuOpen]     = useState(false);
  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen]   = useState(false);
  const [slashIndex, setSlashIndex]         = useState(0);
  const [chatName, setChatName]             = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const slashBlurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopProcessingRef = useRef(false);
  const lastSentPromptRef = useRef('');

  const isEmptyState = chatHistory.filter(m => m.role === 'user').length === 0;

  const SUGGESTIONS = [
    'Find sensitive data & disclosures',
    'Summarize selected documents',
    'Identify information gaps',
    'Surface key deal risks',
  ];

  const ADVISOR_ROLES = ['Finance', 'IT Security', 'Legal', 'Insurance', 'Taxes', 'HR & People', 'Operations'];

  // Filtered slash actions based on query after "/"
  const slashQuery = inputValue.startsWith('/') ? inputValue.slice(1).toLowerCase() : '';
  const filteredSlashActions = slashQuery
    ? SLASH_ACTIONS.filter(a => a.label.toLowerCase().includes(slashQuery))
    : SLASH_ACTIONS;

  // Clamp selected index when filtered list shrinks
  const clampedSlashIndex = Math.min(slashIndex, Math.max(0, filteredSlashActions.length - 1));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  useEffect(() => {
    if (chatHistory.length === 0) setChatName('');
  }, [chatHistory.length]);

  // Open menu on fullscreen, close it when collapsing back to sidebar
  useEffect(() => {
    if (viewMode === 'fullscreen') setChatMenuOpen(true);
    else setChatMenuOpen(false);
  }, [viewMode]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isProcessing) return;
    setPromptLibraryOpen(false);
    if (isEmptyState) setChatName(deriveChatName(text));
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'pm' : 'am';
    const timestamp = `${h % 12 || 12}:${m} ${ampm}`;
    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp };
    const updated = [...chatHistory, userMsg];
    onChatUpdate(updated);
    lastSentPromptRef.current = text.trim();
    setInputValue('');
    setIsStopped(false);
    stopProcessingRef.current = false;
    setIsProcessing(true);
    setTimeout(() => {
      if (!stopProcessingRef.current) {
        const resp = getChatResponse(text);
        onChatUpdate([...updated, { role: 'assistant', content: resp.content, timestamp, citations: resp.citations, followUp: resp.followUp }]);
      }
      setIsProcessing(false);
    }, throttled ? 9000 : 2200);
  };

  const handleStopProcessing = () => {
    stopProcessingRef.current = true;
    setIsProcessing(false);
    setIsStopped(true);
    const prompt = lastSentPromptRef.current;
    if (prompt) {
      setInputValue(prompt);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(0, prompt.length);
        }
      });
    }
  };

  const handleResume = () => {
    setIsStopped(false);
    setInputValue('');
    stopProcessingRef.current = false;
    setIsProcessing(true);
    const text = lastSentPromptRef.current;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const timestamp = `${h % 12 || 12}:${m.padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
    setTimeout(() => {
      if (!stopProcessingRef.current) {
        const resp = getChatResponse(text);
        onChatUpdate([...chatHistory, { role: 'assistant', content: resp.content, timestamp, citations: resp.citations, followUp: resp.followUp }]);
      }
      setIsProcessing(false);
    }, throttled ? 9000 : 2200);
  };

  const executeSlashAction = (action: typeof SLASH_ACTIONS[0]) => {
    setSlashMenuOpen(false);
    setInputValue('');
    sendMessage(action.label);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (slashMenuOpen && filteredSlashActions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => Math.min(i + 1, filteredSlashActions.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSlashIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter')     { e.preventDefault(); executeSlashAction(filteredSlashActions[clampedSlashIndex]); return; }
      if (e.key === 'Escape')    { e.preventDefault(); setSlashMenuOpen(false); setInputValue(''); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  };

  const contextLabel = documentOpen
    ? documentOpen.name
    : activeFolder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const hasInput = inputValue.trim().length > 0;

  // ── Shared inner content ───────────────────────────────────────────────────
  const panelContent = (
    <Box sx={{
      display: 'flex',
      flexDirection: viewMode === 'fullscreen' ? 'row' : 'column',
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Drag handle — hoisted to panelContent so it stays above ChatMenu (z:10) and PromptLibrary (z:20) ── */}
      {viewMode === 'sidebar' && onResizeStart && (
        <Box
          onMouseDown={onResizeStart}
          sx={{
            position: 'absolute', top: 0, bottom: 0, left: 0, width: 8,
            cursor: 'col-resize', zIndex: 30,
            '& .handle-bar': {
              position: 'absolute', top: 0, bottom: 0,
              right: 3, width: 2,
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
      )}

      {/* ChatMenu — overlay in sidebar mode, flat panel in fullscreen mode */}
      {viewMode === 'sidebar' ? (
        <ChatMenu open={chatMenuOpen} onClose={() => setChatMenuOpen(false)} onNewChat={() => { onChatUpdate([]); setChatMenuOpen(false); }} newChatDisabled={isEmptyState} currentChatName={chatName} />
      ) : chatMenuOpen && (
        <ChatMenu flat open={true} onClose={() => setChatMenuOpen(false)} onNewChat={() => { onChatUpdate([]); setChatMenuOpen(false); }} newChatDisabled={isEmptyState} currentChatName={chatName} />
      )}

      {/* PromptLibrary — covers full sidecar height (header + scrollable + input).
           bottom: -60px pushes the panel's lower edge + shadow off-screen when closed. */}
      {isEmptyState && (
        <PromptLibrary
          open={promptLibraryOpen}
          onClose={() => setPromptLibraryOpen(false)}
          onSelect={(prompt) => sendMessage(prompt)}
          sx={{ top: 0, bottom: '-60px', zIndex: 25 }}
        />
      )}

      {/* Chat body — flex column, takes remaining width */}
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 1, height: 41, flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            opacity: chatMenuOpen && viewMode === 'fullscreen' ? 0 : 1,
            pointerEvents: chatMenuOpen && viewMode === 'fullscreen' ? 'none' : 'auto',
            transition: 'opacity 0.18s ease',
          }}
        >
          <IconButton size="small" onClick={() => setChatMenuOpen((v) => !v)} sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
            <FontAwesomeIcon icon={faBars} style={{ fontSize: 16 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none" style={{ flexShrink: 0 }}>
              <path d="M18.5 8.5C18.5 3.80558 14.6944 0 10 0C5.30558 0 1.5 3.80558 1.5 8.5C1.5 13.1944 5.30558 17 10 17C14.6944 17 18.5 13.1944 18.5 8.5Z" fill="#FF8818"/>
              <path d="M16.1037 8.22872C12.8864 8.22872 10.2713 5.61361 10.2713 2.39628C10.2713 2.24436 10.1519 2.125 10 2.125C9.84808 2.125 9.72872 2.24436 9.72872 2.39628C9.72872 5.61361 7.11361 8.22872 3.89628 8.22872C3.74436 8.22872 3.625 8.34808 3.625 8.5C3.625 8.65192 3.74436 8.77128 3.89628 8.77128C7.11361 8.77128 9.72872 11.3864 9.72872 14.6037C9.72872 14.7557 9.84808 14.875 10 14.875C10.1519 14.875 10.2713 14.7557 10.2713 14.6037C10.2713 11.3864 12.8864 8.77128 16.1037 8.77128C16.2557 8.77128 16.375 8.65192 16.375 8.5C16.375 8.34808 16.2557 8.22872 16.1037 8.22872Z" fill="#F6F6F6"/>
            </svg>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.75, letterSpacing: '0.15px', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chatName || 'Datasite AI'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" onClick={() => onChatUpdate([])} disabled={isEmptyState} sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' }, '&.Mui-disabled': { color: 'text.disabled' } }}>
            <FontAwesomeIcon icon={faSquarePlus} style={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => onViewModeChange(viewMode === 'sidebar' ? 'fullscreen' : 'sidebar')}
            title={viewMode === 'sidebar' ? 'Full screen' : 'Side bar'}
            sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            {viewMode === 'sidebar' ? <FontAwesomeIcon icon={faExpand} style={{ fontSize: 16 }} /> : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M8.5 0.5H2.5C1.39543 0.5 0.5 1.39543 0.5 2.5V12.5C0.5 13.6046 1.39543 14.5 2.5 14.5H8.5" stroke="currentColor" strokeOpacity="0.8"/>
                <path d="M9 14.5H13C13.8284 14.5 14.5 13.8284 14.5 13V2.04785L14.4922 1.89551C14.4164 1.14448 13.7864 0.556011 13.0156 0.547852L9 0.504883V14.5Z" stroke="currentColor" strokeOpacity="0.8"/>
              </svg>
            )}
          </IconButton>

          <IconButton size="small" onClick={onClose} sx={{ width: 28, height: 28, borderRadius: '100px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Scrollable area ── */}
      <Box sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Empty state ── */}
      {isEmptyState && (
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2, pt: 5, pb: 2 }}>
          {/* Greeting */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', mb: 2, width: '100%' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.6, letterSpacing: '0.15px' }}>
              Hello, Graham
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 400, color: 'text.secondary', lineHeight: 1.5, letterSpacing: '0.15px' }}>
              How can I help you today?
            </Typography>
          </Box>

          {/* Suggestion chips */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 4, width: '100%' }}>
            {SUGGESTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                variant="filled"
                onClick={() => sendMessage(s)}
                sx={{
                  bgcolor: 'action.selected',
                  borderRadius: '100px',
                  height: 'auto',
                  cursor: 'pointer',
                  '& .MuiChip-label': {
                    px: '6px',
                    py: '3px',
                    fontSize: '0.75rem',
                    fontWeight: 400,
                    color: 'text.primary',
                    letterSpacing: '0.16px',
                    lineHeight: '18px',
                    whiteSpace: 'nowrap',
                  },
                  '&:hover': { bgcolor: 'action.focus' },
                }}
              />
            ))}
          </Box>

          {/* Advisor roles */}
          <Typography sx={{
            fontSize: '0.75rem', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase',
            color: 'text.secondary', lineHeight: 2.66, mb: 1,
          }}>
            Review as an advisor in
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', mb: 2 }}>
            {/* Row 1: Finance, IT Security, Legal, Insurance, Taxes */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {ADVISOR_ROLES.slice(0, 5).map((role) => (
                <Chip
                  key={role}
                  label={role}
                  variant="outlined"
                  size="small"
                  onClick={() => sendMessage(`Review as a ${role} advisor`)}
                  sx={{
                    borderRadius: '100px',
                    height: 'auto',
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                      px: '6px',
                      py: '3px',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: 'text.primary',
                      letterSpacing: '0.16px',
                      lineHeight: '18px',
                    },
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
                  }}
                />
              ))}
            </Box>
            {/* Row 2: HR & People + remaining */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {ADVISOR_ROLES.slice(5).map((role) => (
                <Chip
                  key={role}
                  label={role}
                  variant="outlined"
                  size="small"
                  onClick={() => sendMessage(`Review as a ${role} advisor`)}
                  sx={{
                    borderRadius: '100px',
                    height: 'auto',
                    cursor: 'pointer',
                    '& .MuiChip-label': {
                      px: '6px',
                      py: '3px',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: 'text.primary',
                      letterSpacing: '0.16px',
                      lineHeight: '18px',
                    },
                    '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Explore more button */}
          <Button
            variant="text"
            onClick={() => setPromptLibraryOpen(true)}
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.4px',
              color: 'primary.main',
              lineHeight: '24px',
              textTransform: 'none',
              px: 1,
              py: '6px',
              borderRadius: '8px',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            Explore more
          </Button>
        </Box>
      )}

      {/* Chat thread */}
      {!isEmptyState && (
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
        {chatHistory.map((msg, i) =>
          msg.role === 'assistant'
            ? <AssistantMessage key={i} msg={msg} />
            : <UserMessage key={i} msg={msg} />
        )}
        {isProcessing && <ThinkingRow />}
        {isStopped && <StoppedRow />}
        <div ref={chatEndRef} />
      </Box>
      )}
      </Box> {/* end scrollable area */}

      {/* Input area */}
      <Box sx={{ flexShrink: 0, px: 2, pt: 2, pb: 0.5, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -48, left: 0, right: 0, height: 48,
          background: (theme) => `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0)} 0%, ${theme.palette.background.default} 100%)`,
          pointerEvents: 'none',
        },
      }}>
      <Box sx={{ width: viewMode === 'fullscreen' ? '60%' : '100%', display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>

        {/* Slash command menu — floats above input */}
        {slashMenuOpen && filteredSlashActions.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              position: 'absolute', bottom: 'calc(100% - 8px)', left: 16, right: 16,
              zIndex: 50,
              borderRadius: '10px',
              overflow: 'hidden',
              py: 0.5,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.12)',
              borderColor: 'divider',
            }}
          >
            {filteredSlashActions.map((action, i) => {
              const isSelected = i === clampedSlashIndex;
              return (
                <Box
                  key={action.id}
                  onMouseEnter={() => setSlashIndex(i)}
                  onClick={() => executeSlashAction(action)}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, py: 0.875,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'rgba(72,94,240,0.10)' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'rgba(72,94,240,0.10)' : 'action.hover' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: isSelected ? 'primary.main' : 'text.primary', flex: 1, mr: 1, fontWeight: isSelected ? 500 : 400 }}>
                    {action.label}
                  </Typography>
                  {isSelected && (
                    <Box
                      sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, flexShrink: 0,
                        borderRadius: '6px',
                        bgcolor: 'primary.main',
                        color: '#fff',
                      }}
                    >
                      <ReturnKeyIcon />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Paper>
        )}

        {/* Context chip — above the input box */}
        <Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, height: 24, borderRadius: '4px', bgcolor: 'rgba(31,34,39,0.08)', cursor: 'pointer', maxWidth: 200 }}>
            <FontAwesomeIcon icon={faFolder} style={{ fontSize: 13, flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: '0.8125rem', color: 'text.primary', lineHeight: 1, letterSpacing: '0.16px' }}>{contextLabel}</Typography>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 10, color: 'rgba(31,34,39,0.54)', flexShrink: 0, marginLeft: 2 }} />
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ borderRadius: '8px', borderColor: 'rgba(84,89,99,0.3)', overflow: 'hidden', '&:focus-within': { borderColor: 'rgba(84,89,99,0.6)' } }}>
          <Box sx={{ px: 2, pt: '10px', pb: '0px' }}>
            <InputBase
              placeholder="How can I help you today?"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                if (val.startsWith('/')) {
                  setSlashMenuOpen(true);
                  setSlashIndex(0);
                } else {
                  setSlashMenuOpen(false);
                }
              }}
              inputRef={inputRef}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (slashBlurTimer.current) { clearTimeout(slashBlurTimer.current); slashBlurTimer.current = null; } }}
              onBlur={() => { slashBlurTimer.current = setTimeout(() => { setSlashMenuOpen(false); slashBlurTimer.current = null; }, 150); }}
              multiline maxRows={4} fullWidth
              sx={{ fontSize: '0.9375rem', color: 'text.primary', '& input::placeholder, & textarea::placeholder': { color: 'text.secondary', opacity: 1 } }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, pb: 1 }}>
            <IconButton size="small" onClick={isProcessing ? handleStopProcessing : () => sendMessage(inputValue)} disabled={!hasInput && !isProcessing}
              sx={{ width: 28, height: 28, borderRadius: '50%', p: 0, bgcolor: isProcessing ? 'warning.main' : hasInput ? 'primary.main' : 'rgba(84,89,99,0.12)', color: isProcessing || hasInput ? '#fff' : 'text.secondary', '&:hover': { bgcolor: isProcessing ? 'warning.dark' : hasInput ? 'primary.dark' : 'rgba(84,89,99,0.18)' }, '&.Mui-disabled': { bgcolor: 'rgba(84,89,99,0.12)', color: 'text.secondary' }, transition: 'background-color 0.15s' }}>
              <FontAwesomeIcon icon={isProcessing ? faSquare : faArrowUp} style={{ fontSize: isProcessing ? 12 : 16 }} />
            </IconButton>
          </Box>
        </Paper>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.66, letterSpacing: '0.4px' }}>
            Powered by Blueflame AI. Always review for accuracy.
          </Typography>
        </Box>
      </Box> {/* end 60% centering wrapper */}
      </Box>
      </Box> {/* end chat body */}
    </Box>
  );

  // ── Full screen mode ───────────────────────────────────────────────────────
  if (viewMode === 'fullscreen' && open) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: TOP_BAR_HEIGHT,
          left: navWidth + folderPanelWidth,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'row',
          bgcolor: 'background.default',
        }}
      >
        {panelContent}
      </Box>
    );
  }

  // ── Sidebar mode (default) ─────────────────────────────────────────────────
  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open && viewMode === 'sidebar'}
      sx={{
        width: open && viewMode === 'sidebar' ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          top: TOP_BAR_HEIGHT,
          height: `calc(100vh - ${TOP_BAR_HEIGHT}px)`,
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
          zIndex: 5, // Below the top bar (zIndex: 10)
        },
      }}
    >
      {panelContent}
    </Drawer>
  );
};

export default AssistantPanel;
