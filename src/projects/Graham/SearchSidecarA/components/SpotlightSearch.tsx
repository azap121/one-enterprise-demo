import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Backdrop, Box, Typography, InputBase, IconButton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faXmark, faClockRotateLeft,
  faFolder, faEllipsisVertical, faListUl,
  faFile, faSearch,
  // nav icons
  faFileLines, faLayerGroup, faHome, faStore,
  faDashboard, faQuestion, faUsers, faLock,
  faPencil, faArchive, faBox, faChartBar,
  faGear, faFilePlus, faInbox, faStar,
  faTriangleExclamation, faDownload, faTrashRestore, faUsersGear,
  faWandMagicSparkles, faLanguage, faBolt, faDroplet,
  faNewspaper, faTableColumns, faTable, faSignature,
  faFileUpload, faUserPlus, faUserGroup, faMagnifyingGlass,
  faList, faCompass, faTimeline,
} from '@fortawesome/pro-light-svg-icons';
import { FILE_ICON_COLORS, HALO_NAV_ORANGE } from './theme';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SpotlightSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (q: string) => void;
  initialQuery?: string;
}

interface NavItem {
  label: string;
  icon: IconDefinition;
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: 'Recent searches',        icon: faClockRotateLeft },
  { label: 'Documents',              icon: faFileLines },
  { label: 'Projects',               icon: faLayerGroup },
  { label: 'Home',                   icon: faHome },
  { label: 'Marketplace',            icon: faStore },
  { label: 'Dashboard',              icon: faDashboard },
  { label: 'Trackers',               icon: faListUl },
  { label: 'Q&A',                    icon: faQuestion },
  { label: 'Users',                  icon: faUsers },
  { label: 'Permissions',            icon: faLock },
  { label: 'Redaction',              icon: faPencil },
  { label: 'Archive',                icon: faArchive },
  { label: 'My Archive',             icon: faBox },
  { label: 'Analytics',              icon: faChartBar },
  { label: 'Settings',               icon: faGear },
  { label: '+ New document',         icon: faFilePlus },
  { label: '+ Upload',               icon: faFileUpload },
  { label: '+ Add user',             icon: faUserPlus },
  { label: '+ Add team',             icon: faUserGroup },
  { label: 'Inbox',                  icon: faInbox },
  { label: 'Favorites',              icon: faStar },
  { label: 'Action required',        icon: faTriangleExclamation },
  { label: 'Downloads',              icon: faDownload },
  { label: 'Recycle',                icon: faTrashRestore },
  { label: 'Teams',                  icon: faUsersGear },
  { label: 'Blueflame deep research', icon: faWandMagicSparkles },
  { label: 'Translate',              icon: faLanguage },
  { label: 'Rapid Redact',           icon: faBolt },
  { label: 'Watermarking',           icon: faDroplet },
  { label: 'CIM Summary',            icon: faNewspaper },
  { label: 'Document comparison',    icon: faTableColumns },
  { label: 'Convert to Excel',       icon: faTable },
  { label: 'E-Signature',            icon: faSignature },
  { label: 'Q&A Settings',           icon: faMagnifyingGlass },
  { label: 'Index',                  icon: faList },
  { label: 'Sandbox',                icon: faCompass },
  { label: 'Document Change History', icon: faTimeline },
  { label: 'Activity Overview',      icon: faChartBar },
];

// ─── Suggested query pool ─────────────────────────────────────────────────────
const QUERY_POOL = [
  'What are the key financial metrics for Q3?',
  'Summarise material adverse change clauses',
  'List all indemnification provisions across all documents',
  'Show cap table and ownership structure',
  'What IP is assigned in this agreement?',
  'Find all change of control provisions',
  'Identify representations and warranties',
  'What are the payment terms and milestones?',
  'Summarise confidentiality obligations',
  'Highlight any non-compete restrictions',
  'What are the termination triggers?',
  'Show regulatory approvals required',
  'Find all documents referencing this entity',
  'What are the outstanding action items?',
  'Show all documents pending redaction',
  'List vendor contracts expiring this year',
  'Summarise due diligence findings',
  'What are the key risk factors mentioned?',
];

// ─── Static data ──────────────────────────────────────────────────────────────
const RECENT_SEARCHES = [
  'A schedule summarising short-term and long term debt and capital lease obligations of the business',
  'What is the total amount of long-term debt for the business',
  'Enhanced Review - Vendor Agreement',
  'Redaction - Employee Agreement - EN.doc',
  'Redaction - Lean_Process_Implementation.docx',
];

const RECENT_FILES: { name: string; type: keyof typeof FILE_ICON_COLORS }[] = [
  { name: 'Generic-direct-depositauthorization.pdf', type: 'pdf' },
  { name: 'Statement of Earnings.xls',               type: 'xls' },
  { name: 'Leasehold_Improvements.docx',             type: 'docx' },
];

const RECENT_FOLDERS = [
  { name: 'Leases',          breadcrumb: 'Property Records' },
  { name: 'Contracts',       breadcrumb: 'Management' },
  { name: 'Material Assets', breadcrumb: null },
];

// ─── Animation helpers ────────────────────────────────────────────────────────
const KEYFRAME = {
  '@keyframes drillIn': {
    from: { opacity: 0, transform: 'translateY(-6px)' },
    to:   { opacity: 1, transform: 'translateY(0)' },
  },
};
const drill = (i: number) => ({
  ...KEYFRAME,
  animation: `drillIn 0.18s ease-out ${i * 30}ms both`,
});

// ─── Selected row bg ──────────────────────────────────────────────────────────
const SELECTED_BG = 'rgba(72,94,240,0.07)';

// ─── File icon circle ─────────────────────────────────────────────────────────
const FileIconCircle: React.FC<{ type: keyof typeof FILE_ICON_COLORS }> = ({ type }) => {
  const entry = FILE_ICON_COLORS[type] || FILE_ICON_COLORS.default;
  return (
    <Box sx={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesomeIcon icon={faFile} style={{ fontSize: 18, color: entry.color }} />
    </Box>
  );
};

// ─── Enter button (shown on selected row) ─────────────────────────────────────
const EnterButton: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({ onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: 28, height: 28, borderRadius: '6px',
      bgcolor: '#485ef0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, cursor: 'pointer',
      '&:hover': { bgcolor: '#3a4fd4' },
    }}
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11 3V6C11 7.1 10.1 8 9 8H3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 6L3 8L5 10" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </Box>
);

// ─── SpotlightSearch ──────────────────────────────────────────────────────────
const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  open,
  onClose,
  onSearch,
  initialQuery = '',
}) => {
  const [value, setValue]           = useState(initialQuery);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [animKey, setAnimKey]       = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef  = useRef<HTMLInputElement>(null);
  const bodyRef   = useRef<HTMLDivElement>(null);
  // Refs to every selectable row — rebuilt each render
  const rowRefs   = useRef<Array<HTMLElement | null>>([]);

  // Reset + focus on open
  useEffect(() => {
    if (open) {
      setAnimKey((k) => k + 1);
      setSelectedIndex(-1);
      setValue(initialQuery);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = inputRef.current;
          if (!el) return;
          el.focus();
          const len = el.value.length;
          el.setSelectionRange(len, len);
        });
      });
    }
  }, [open]);

  // Reset selection when the typed value changes
  useEffect(() => { setSelectedIndex(-1); }, [value]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Scroll selected row into view
  useEffect(() => {
    if (selectedIndex >= 0) {
      rowRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const hasValue = value.trim().length > 0;
  const q = value.trim().toLowerCase();

  // ── Typing-state suggestions ──────────────────────────────────────────────
  type Suggestion =
    | { kind: 'nav';    item: NavItem }
    | { kind: 'query';  text: string }
    | { kind: 'recent'; text: string };

  const suggestions: Suggestion[] = useMemo(() => {
    if (!q) return [];
    const out: Suggestion[] = [];

    const navMatches = NAV_ITEMS
      .filter(n => n.label.toLowerCase().includes(q))
      .sort((a, b) => {
        const aS = a.label.toLowerCase().startsWith(q) ? 0 : 1;
        const bS = b.label.toLowerCase().startsWith(q) ? 0 : 1;
        return aS - bS;
      });
    const navLimit = q === '+' ? 4 : 2;
    navMatches.slice(0, navLimit).forEach(item => out.push({ kind: 'nav', item }));

    RECENT_SEARCHES
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(text => out.push({ kind: 'recent', text }));

    const prime = 7;
    const start = (q.length * prime) % QUERY_POOL.length;
    const slots = Math.max(0, 7 - out.length);
    for (let i = 0, added = 0; i < QUERY_POOL.length && added < slots; i++) {
      out.push({ kind: 'query', text: QUERY_POOL[(start + i) % QUERY_POOL.length] });
      added++;
    }

    return out.slice(0, 7);
  }, [q]);

  // ── Total selectable row count for keyboard nav ────────────────────────────
  // Typing: suggestions.length | Empty: RECENT_SEARCHES + FILES + FOLDERS
  const totalRows = hasValue
    ? suggestions.length
    : RECENT_SEARCHES.length + RECENT_FILES.length + RECENT_FOLDERS.length;

  // ── Execute the currently selected row ────────────────────────────────────
  const executeSelected = () => {
    if (selectedIndex < 0) return false;

    if (hasValue) {
      const s = suggestions[selectedIndex];
      if (!s) return false;
      if (s.kind === 'nav')    { onSearch(s.item.label.replace(/^\+ /, '')); onClose(); return true; }
      if (s.kind === 'recent') { onSearch(s.text); onClose(); return true; }
      if (s.kind === 'query')  { onSearch(s.text); onClose(); return true; }
    } else {
      const ri = selectedIndex;
      if (ri < RECENT_SEARCHES.length) {
        onSearch(RECENT_SEARCHES[ri]); onClose(); return true;
      }
      const fi = ri - RECENT_SEARCHES.length;
      if (fi < RECENT_FILES.length) {
        onSearch(RECENT_FILES[fi].name); onClose(); return true;
      }
      const foi = fi - RECENT_FILES.length;
      if (foi < RECENT_FOLDERS.length) {
        onSearch(RECENT_FOLDERS[foi].name); onClose(); return true;
      }
    }
    return false;
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSearch(value.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i < totalRows - 1 ? i + 1 : i));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i > 0 ? i - 1 : -1));
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!executeSelected()) handleSubmit();
    }
  };

  // Row-ref collector — clears stale refs before each render
  let animIdx  = 0;
  let rowIdx   = 0;
  rowRefs.current = [];

  const rowRef = (el: HTMLElement | null) => { rowRefs.current.push(el); };

  // Helper: bg for a given row index
  const rowBg = (ri: number) =>
    selectedIndex === ri ? SELECTED_BG : 'transparent';

  const rowHover = (ri: number) =>
    selectedIndex === ri
      ? { bgcolor: SELECTED_BG }
      : { bgcolor: 'rgba(31,34,39,0.04)' };

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        zIndex: 1300,
        bgcolor: 'rgba(0,0,0,0.75)',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {/* Dialog shell — no overflow:hidden so the input outline isn't clipped */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          mt: '168px',
          width: 'min(640px, calc(100vw - 40px))',
          bgcolor: '#fff',
          borderRadius: '8px',
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.98)',
          transition: open
            ? 'opacity 0.14s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
            : 'opacity 0.1s ease, transform 0.12s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* ── Input row — border + 1px outline outside, doesn't compress input space ── */}
        <Box
          key={`input-${animKey}`}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            pl: 2, pr: 1, py: 1,
            border: '2px solid #EF601A',
            outline: '1px solid #EF601A',
            outlineOffset: '0px',
            borderRadius: '100px',
            ...drill(animIdx++),
          }}
        >
          <InputBase
            inputRef={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing to search or ask questions in Project Halo..."
            multiline
            maxRows={2}
            fullWidth
            sx={{
              fontSize: '1.25rem',
              fontWeight: 400,
              color: 'text.primary',
              lineHeight: 1.5,
              '& textarea': { caretColor: '#EF601A' },
              '& textarea::placeholder': { color: 'rgba(78,78,77,0.38)', opacity: 1 },
            }}
          />
          {hasValue && (
            <IconButton
              size="small"
              onClick={() => setValue('')}
              sx={{
                width: 32, height: 32, borderRadius: '4px', flexShrink: 0,
                color: 'rgba(31,34,39,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
              }}
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </IconButton>
          )}
          <Box
            onClick={handleSubmit}
            sx={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 0.5,
              pl: '4px', pr: 1.25, py: 0.4,
              border: '1.5px solid #EF601A',
              borderRadius: '20px',
              cursor: 'pointer',
              opacity: hasValue ? 1 : 0.45,
              '&:hover': { bgcolor: 'rgba(239,96,26,0.06)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="15" fill="#EF601A"/>
                <path d="M24.5883 14.9469C19.7217 14.9469 15.7661 10.9913 15.7661 6.12469C15.7661 5.8949 15.5855 5.71436 15.3557 5.71436C15.126 5.71436 14.9454 5.8949 14.9454 6.12469C14.9454 10.9913 10.9898 14.9469 6.12322 14.9469C5.89344 14.9469 5.71289 15.1274 5.71289 15.3572C5.71289 15.587 5.89344 15.7675 6.12322 15.7675C10.9898 15.7675 14.9454 19.7232 14.9454 24.5897C14.9454 24.8195 15.126 25.0001 15.3557 25.0001C15.5855 25.0001 15.7661 24.8195 15.7661 24.5897C15.7661 19.7232 19.7217 15.7675 24.5883 15.7675C24.8181 15.7675 24.9986 15.587 24.9986 15.3572C24.9986 15.1274 24.8181 14.9469 24.5883 14.9469Z" fill="#FAFAF7"/>
              </svg>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#EF601A', whiteSpace: 'nowrap' }}>
              AI Search
            </Typography>
          </Box>
        </Box>

        {/* ── Body — clips rounded corners since dialog shell is overflow:visible ── */}
        <Box
          ref={bodyRef}
          key={`body-${animKey}`}
          sx={{
            py: 1, pb: '16px',
            maxHeight: 408,
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            overflowX: 'hidden',
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2 },
          }}
        >
          {/* ════ TYPING STATE ════ */}
          {hasValue && suggestions.map((s) => {
            const ri = rowIdx++;
            if (s.kind === 'nav') {
              const isCreate = s.item.label.startsWith('+ ');
              const displayLabel = isCreate ? s.item.label.slice(2) : s.item.label;
              return (
                <Box
                  key={`nav-${s.item.label}`}
                  ref={rowRef}
                  onClick={() => { onSearch(s.item.label.replace(/^\+ /, '')); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(ri)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    height: 40, px: 2, cursor: 'pointer', gap: '4px',
                    bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                    ...drill(animIdx++),
                  }}
                >
                  <Box sx={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={s.item.icon} style={{ fontSize: 18, color: isCreate ? HALO_NAV_ORANGE : 'rgba(31,34,39,0.5)' }} />
                  </Box>
                  <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                    {isCreate && <Box component="span" sx={{ color: HALO_NAV_ORANGE, fontWeight: 600, mr: '3px' }}>+</Box>}
                    {displayLabel}
                  </Typography>
                  {selectedIndex === ri && (
                    <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(s.item.label.replace(/^\+ /, '')); onClose(); }} />
                  )}
                </Box>
              );
            }
            if (s.kind === 'recent') {
              return (
                <Box
                  key={`recent-${s.text}`}
                  ref={rowRef}
                  onClick={() => { onSearch(s.text); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(ri)}
                  onMouseLeave={() => setSelectedIndex(-1)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    height: 40, px: 2, cursor: 'pointer', gap: '4px',
                    bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                    ...drill(animIdx++),
                  }}
                >
                  <Box sx={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 18, color: 'rgba(31,34,39,0.4)' }} />
                  </Box>
                  <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                    {s.text}
                  </Typography>
                  {selectedIndex === ri && (
                    <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(s.text); onClose(); }} />
                  )}
                </Box>
              );
            }
            // query
            return (
              <Box
                key={`query-${s.text}`}
                ref={rowRef}
                onClick={() => { onSearch(s.text); onClose(); }}
                onMouseEnter={() => setSelectedIndex(ri)}
                onMouseLeave={() => setSelectedIndex(-1)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  height: 40, px: 2, cursor: 'pointer', gap: '4px',
                  bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                  ...drill(animIdx++),
                }}
              >
                <Box sx={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faSearch} style={{ fontSize: 18, color: 'rgba(31,34,39,0.35)' }} />
                </Box>
                <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                  {s.text}
                </Typography>
                {selectedIndex === ri && (
                  <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(s.text); onClose(); }} />
                )}
              </Box>
            );
          })}

          {/* ════ EMPTY STATE: recent searches ════ */}
          {!hasValue && RECENT_SEARCHES.map((rs) => {
            const ri = rowIdx++;
            return (
              <Box
                key={rs}
                ref={rowRef}
                onClick={() => { onSearch(rs); onClose(); }}
                onMouseEnter={() => setSelectedIndex(ri)}
                onMouseLeave={() => setSelectedIndex(-1)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  height: 40, px: 2, cursor: 'pointer', gap: '4px',
                  bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                  ...drill(animIdx++),
                }}
              >
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: 18, color: 'rgba(31,34,39,0.4)' }} />
                </Box>
                <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                  {rs}
                </Typography>
                {selectedIndex === ri && (
                  <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(rs); onClose(); }} />
                )}
              </Box>
            );
          })}

          {/* Divider */}
          <Box sx={{ height: 1, bgcolor: 'rgba(0,0,0,0.08)', my: '6px', ...drill(animIdx++) }} />

          {/* Section label */}
          <Typography
            sx={{
              display: 'block', px: 3, pt: 1, pb: 0.25,
              fontSize: '0.75rem', fontWeight: 500,
              color: 'rgba(0,0,0,0.45)',
              letterSpacing: '0.8px', textTransform: 'uppercase',
              ...drill(animIdx++),
            }}
          >
            Find a recent file or folder
          </Typography>

          {/* Recent files */}
          {RECENT_FILES.map((f) => {
            const ri = rowIdx++;
            return (
              <Box
                key={f.name}
                ref={rowRef}
                onMouseEnter={() => { setHoveredFile(f.name); setSelectedIndex(ri); }}
                onMouseLeave={() => { setHoveredFile(null); setSelectedIndex(-1); }}
                sx={{
                  display: 'flex', alignItems: 'center',
                  height: 40, px: 2, cursor: 'pointer', gap: '4px',
                  bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                  ...drill(animIdx++),
                }}
              >
                <FileIconCircle type={f.type} />
                <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                  {f.name}
                </Typography>
                {selectedIndex === ri ? (
                  <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(f.name); onClose(); }} />
                ) : (
                  <IconButton
                    size="small"
                    sx={{
                      width: 24, height: 24, borderRadius: '4px', flexShrink: 0,
                      color: 'rgba(31,34,39,0.4)',
                      opacity: hoveredFile === f.name ? 1 : 0,
                      transition: 'opacity 0.1s',
                      '&:hover': { bgcolor: 'rgba(31,34,39,0.08)' },
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}

          {/* Recent folders */}
          {RECENT_FOLDERS.map((folder) => {
            const ri = rowIdx++;
            return (
              <Box
                key={folder.name}
                ref={rowRef}
                onMouseEnter={() => { setHoveredFile(folder.name); setSelectedIndex(ri); }}
                onMouseLeave={() => { setHoveredFile(null); setSelectedIndex(-1); }}
                sx={{
                  display: 'flex', alignItems: 'center',
                  height: 40, px: 2, cursor: 'pointer', gap: '4px',
                  bgcolor: rowBg(ri), '&:hover': rowHover(ri),
                  ...drill(animIdx++),
                }}
              >
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faFolder} style={{ fontSize: 18, color: 'rgba(31,34,39,0.5)' }} />
                </Box>
                <Typography noWrap sx={{ flex: 1, fontSize: '1rem', color: 'text.primary', letterSpacing: '0.17px' }}>
                  {folder.name}
                </Typography>
                {selectedIndex === ri ? (
                  <EnterButton onClick={(e) => { e.stopPropagation(); onSearch(folder.name); onClose(); }} />
                ) : folder.breadcrumb ? (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px', height: 22, px: 1.125, bgcolor: 'rgba(78,78,77,0.08)', borderRadius: '100px', flexShrink: 0, maxWidth: 190, overflow: 'hidden' }}>
                    <FontAwesomeIcon icon={faListUl} style={{ fontSize: 10, color: 'rgba(31,34,39,0.4)' }} />
                    <Typography noWrap sx={{ fontSize: '0.75rem', color: 'rgba(31,34,39,0.6)', letterSpacing: '0.2px' }}>
                      {folder.breadcrumb}
                    </Typography>
                  </Box>
                ) : (
                  <IconButton
                    size="small"
                    sx={{
                      width: 24, height: 24, borderRadius: '4px', flexShrink: 0,
                      color: 'rgba(31,34,39,0.4)',
                      opacity: hoveredFile === folder.name ? 1 : 0,
                      transition: 'opacity 0.1s',
                      '&:hover': { bgcolor: 'rgba(31,34,39,0.08)' },
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Backdrop>
  );
};

export default SpotlightSearch;
