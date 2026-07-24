import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, IconButton, Tooltip, InputBase, Paper,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faSearch, faArrowUpRightFromSquare,
  faChevronDown, faChevronUp, faFile, faListUl, faEllipsisVertical,
  faLanguage, faGear, faHand, faVectorSquare, faCirclePlus, faCircleMinus,
} from '@fortawesome/pro-light-svg-icons';
import { alpha } from '@mui/material/styles';
import { Doc, DocMatch, getDocMatches } from './mockData';
import { FILE_ICON_COLORS, HALO_NAV_ORANGE } from './theme';

// ─── Constants ────────────────────────────────────────────────────────────────
const GALLERY_CHROME_HEIGHT = 44;
const TOP_BAR_HEIGHT = GALLERY_CHROME_HEIGHT + 60; // gallery chrome + DatasitePrototypeShell header
const SIDECAR_WIDTH  = 320;
const ROW1_H         = 41;
const ROW2_H         = 40;

const CONF_DOT: Record<string, string> = {
  High:   '#22c55e',
  Medium: '#f59e0b',
  Low:    '#ef4444',
};

// ─── Text helpers ─────────────────────────────────────────────────────────────

function stripMark(text: string): string {
  return text.replace(/<\/?mark>/g, '');
}

/** Extract all <mark>…</mark> terms from a set of match snippets */
function extractTerms(matches: DocMatch[]): string[] {
  const set = new Set<string>();
  matches.forEach((m) => {
    let hit: RegExpExecArray | null;
    const re = /<mark>([^<]+)<\/mark>/g;
    while ((hit = re.exec(m.snippet)) !== null) set.add(hit[1].toLowerCase());
  });
  return [...set];
}

/**
 * Render a snippet with matched terms in BOLD (no background).
 * Used in the search-sidecar match cards.
 */
function renderCardSnippet(snippet: string): React.ReactNode {
  const parts = snippet.split(/(<mark>[^<]+<\/mark>)/g);
  return parts.map((part, i) => {
    const m = part.match(/^<mark>([^<]+)<\/mark>$/);
    if (m) {
      return (
        <Box key={i} component="strong" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {m[1]}
        </Box>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * Render document body text with query terms highlighted in amber.
 * Used in the page renderer.
 */
function renderBodyText(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) => {
    const isHit = terms.some((t) => t.toLowerCase() === part.toLowerCase());
    if (isHit) {
      return (
        <Box
          key={i}
          component="mark"
          sx={{
            bgcolor: 'rgba(255, 210, 0, 0.38)',
            borderRadius: '2px',
            px: '1px',
          }}
        >
          {part}
        </Box>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ─── Mock document page content ───────────────────────────────────────────────

interface DocSection {
  text: string;
  matchId?: string; // if set, this section is the anchor for this match
}

const PAGE1_SECTIONS: DocSection[] = [
  {
    text: "Due Diligence: The Target agrees to provide all necessary documents and access to facilities for the Acquirer's due diligence process. This process will commence on [Start Date] and conclude by [End Date], allowing the Acquirer to thoroughly evaluate the Target's financial, operational, and legal standing before finalizing the acquisition.",
  },
  {
    text: "Confidentiality: Both parties agree to maintain confidentiality regarding sensitive information exchanged during the negotiation and due diligence process. This confidentiality clause is crucial to protect proprietary information and trade secrets that may be disclosed during the transaction.",
  },
];

const PAGE2_PREFIX: DocSection[] = [
  {
    text: "Purchase Price: The Acquirer agrees to pay a total purchase price of $[Amount], which will be payable in a combination of cash and stock, as detailed in Appendix A. This price reflects the fair market value of the Target's assets and liabilities, ensuring a mutually beneficial transaction.",
  },
  {
    text: "Due Diligence: The Target agrees to provide all necessary documents and access to facilities for the Acquirer's due diligence process. This process will commence on [Start Date] and conclude by [End Date], allowing the Acquirer to thoroughly evaluate the Target's financial, operational, and legal standing before finalizing the acquisition.",
  },
  {
    text: "Confidentiality: Both parties agree to maintain confidentiality regarding sensitive information exchanged during the negotiation and due diligence process. This confidentiality clause is crucial to protect proprietary information and trade secrets that may be disclosed during the transaction.",
  },
];

const PAGE2_SUFFIX: DocSection[] = [
  {
    text: "Governing Law: This Agreement will be governed by the laws of [State/Region], ensuring that any disputes arising from the agreement will be resolved in accordance with the legal framework of the specified jurisdiction.",
  },
  { text: "Signatures:" },
];

function buildPages(matches: DocMatch[]): { num: number; sections: DocSection[] }[] {
  const matchSections: DocSection[] = matches.map((m) => ({
    text: stripMark(m.snippet),
    matchId: m.id,
  }));

  return [
    { num: 1, sections: PAGE1_SECTIONS },
    {
      num: 2,
      sections: [
        ...PAGE2_PREFIX,
        ...matchSections,
        ...PAGE2_SUFFIX,
      ],
    },
  ];
}

// ─── Document page renderer ───────────────────────────────────────────────────

const DocPage: React.FC<{
  num: number;
  sections: DocSection[];
  terms: string[];
  activeMatchId: string | null;
  matchRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
}> = ({ num, sections, terms, activeMatchId, matchRefs }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      position: 'relative',
      width: '100%',
      maxWidth: 680,
      aspectRatio: '210 / 297',
      flexShrink: 0,
      overflow: 'hidden',
      px: '9%',
      pt: '7%',
      pb: '7%',
    }}
  >
    {/* Page number */}
    <Typography
      variant="caption"
      sx={{ position: 'absolute', bottom: '3%', right: '7%', color: 'text.disabled', userSelect: 'none' }}
    >
      {num}
    </Typography>

    {/* Paragraphs */}
    {sections.map((sec, i) => (
      <Box
        key={i}
        ref={
          sec.matchId
            ? (el: HTMLDivElement | null) => {
                matchRefs.current[sec.matchId!] = el;
              }
            : undefined
        }
        sx={{
          mb: i < sections.length - 1 ? 2.5 : 0,
          borderRadius: 0.5,
          bgcolor:
            sec.matchId && sec.matchId === activeMatchId
              ? 'rgba(255, 210, 0, 0.07)'
              : 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontSize: '0.9375rem',
            lineHeight: 1.65,
            color: 'text.primary',
          }}
        >
          {renderBodyText(sec.text, terms)}
        </Typography>
      </Box>
    ))}
  </Box>
);

// ─── Match card ───────────────────────────────────────────────────────────────

const MatchCard: React.FC<{
  match: DocMatch;
  isActive: boolean;
  onClick: () => void;
}> = ({ match, isActive, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      px: 2,
      pt: 1.625,
      pb: 1.5,
      cursor: 'pointer',
      borderLeft: '3px solid',
      borderLeftColor: isActive ? HALO_NAV_ORANGE : 'transparent',
      bgcolor: isActive ? 'action.selected' : 'transparent',
      transition: 'background-color 0.12s, border-left-color 0.12s',
      '&:hover': {
        bgcolor: isActive ? 'action.focus' : 'action.hover',
      },
    }}
  >
    {/* Snippet */}
    <Typography
      variant="body2"
      component="div"
      sx={{
        color: 'text.secondary',
        fontSize: '0.8125rem',
        lineHeight: 1.55,
        mb: 0.875,
      }}
    >
      {renderCardSnippet(match.snippet)}
    </Typography>

    {/* Confidence dot + label + page */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: CONF_DOT[match.confidence] ?? CONF_DOT.Medium,
          flexShrink: 0,
          mr: 0.75,
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
        {match.confidence} confidence
      </Typography>
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
        Page {match.page}
      </Typography>
    </Box>
  </Box>
);

// ─── Search sidecar panel ─────────────────────────────────────────────────────

const SearchSidecar: React.FC<{
  matches: DocMatch[];
  activeMatchId: string | null;
  onMatchSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}> = ({
  matches, activeMatchId, onMatchSelect,
  query, onQueryChange,
  onPrev, onNext, canPrev, canNext,
}) => (
    <Box
      sx={{
        width: SIDECAR_WIDTH,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <Box sx={{ px: 2.25, pt: 2, pb: 1.25, flexShrink: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9375rem', mb: 1.25 }}
        >
          Document Search
        </Typography>

        {/* NLP input */}
        <Paper
          variant="outlined"
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.25,
            py: 0.625,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            '&:focus-within': { borderColor: 'text.secondary' },
            transition: 'border-color 0.15s',
          }}
        >
          <InputBase
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Show me all the lease agreements..."
            sx={{
              flex: 1,
              fontSize: '0.8125rem',
              color: 'text.primary',
              '& input::placeholder': { color: 'text.disabled', opacity: 1 },
            }}
          />
          {query && (
            <IconButton size="small" onClick={() => onQueryChange('')} sx={{ p: 0.25, ml: 0.25 }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Paper>
      </Box>

      {/* "N Results found" + up/down nav */}
      {matches.length > 0 && (
        <Box
          sx={{
            px: 2.25,
            pb: 0.75,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.8125rem' }}
          >
            {matches.length} Results found
          </Typography>
          <Box sx={{ display: 'flex', gap: 0 }}>
            <Tooltip title="Previous match">
              <span>
                <IconButton size="small" onClick={onPrev} disabled={!canPrev} sx={{ p: 0.25 }}>
                  <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next match">
              <span>
                <IconButton size="small" onClick={onNext} disabled={!canNext} sx={{ p: 0.25 }}>
                  <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Thin rule below result count */}
      {matches.length > 0 && (
        <Box sx={{ height: 1, bgcolor: 'divider', flexShrink: 0 }} />
      )}

      {/* Match card list — no dividers, just spacing within each card */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {matches.length === 0 && query.length > 1 ? (
          <Box sx={{ px: 2.25, py: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              No matches found for "{query}"
            </Typography>
          </Box>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              isActive={match.id === activeMatchId}
              onClick={() => onMatchSelect(match.id)}
            />
          ))
        )}
      </Box>

    </Box>
);

// ─── Toolbar button helper ─────────────────────────────────────────────────────

const ToolBtn: React.FC<{ label: string; children: React.ReactNode; onClick?: () => void; active?: boolean }> = ({
  label, children, onClick, active,
}) => (
  <Tooltip title={label}>
    <IconButton
      size="small"
      onClick={onClick}
      sx={{
        color: active ? HALO_NAV_ORANGE : 'text.secondary',
        borderRadius: 0.75,
        px: 0.75,
        py: 0.5,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {children}
    </IconButton>
  </Tooltip>
);

// ─── Document Viewer ──────────────────────────────────────────────────────────

export interface DocumentViewerProps {
  doc: Doc | null;
  onClose: () => void;
  assistantOpen: boolean;
  assistantWidth: number;
  assistantViewMode?: string;
  searchQuery?: string;
  folderPanelWidth?: number;
  navWidth?: number;
}

const VIEWER_MIN_WIDTH = 400;

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  doc,
  onClose,
  assistantOpen,
  assistantWidth,
  assistantViewMode = 'sidebar',
  searchQuery = '',
  folderPanelWidth = 280,
  navWidth = 60,
}) => {
  const sidebarWidth = navWidth + folderPanelWidth;
  const [localQuery, setLocalQuery]         = useState(searchQuery);
  const [matches, setMatches]               = useState<DocMatch[]>([]);
  const [activeMatchId, setActiveMatchId]   = useState<string | null>(null);
  const [currentIdx, setCurrentIdx]         = useState(0);
  const [sidecarOpen, setSidecarOpen]       = useState(false);
  const [leftOverride, setLeftOverride]     = useState<number | null>(null);

  const matchRefs  = useRef<Record<string, HTMLElement | null>>({});
  const docBodyRef = useRef<HTMLDivElement | null>(null);
  const viewerRef  = useRef<HTMLDivElement | null>(null);

  // Re-initialise when doc or parent query changes
  useEffect(() => {
    if (!doc) return;
    const q = searchQuery || localQuery;
    setLocalQuery(q);
    const m = getDocMatches(doc.name, q);
    setMatches(m);
    setActiveMatchId(m[0]?.id ?? null);
    setCurrentIdx(0);
    setSidecarOpen(!!searchQuery);
    if (docBodyRef.current) docBodyRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.id, searchQuery]);

  // Smooth scroll to active match
  useEffect(() => {
    if (!activeMatchId) return;
    const t = setTimeout(() => {
      const el        = matchRefs.current[activeMatchId];
      const container = docBodyRef.current;
      if (!el || !container) return;
      const top =
        container.scrollTop +
        el.getBoundingClientRect().top -
        container.getBoundingClientRect().top -
        96;
      container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 160);
    return () => clearTimeout(t);
  }, [activeMatchId]);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Reset left override when a different doc opens
  useEffect(() => { setLeftOverride(null); }, [doc?.id]);

  // Left-edge drag-to-resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX    = e.clientX;
    const startLeft = viewerRef.current?.getBoundingClientRect().left ?? startX;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const delta   = ev.clientX - startX;
      const newLeft = startLeft + delta;
      const rightOffset = assistantOpen && assistantViewMode === 'sidebar' ? assistantWidth : 0;
      const maxLeft = window.innerWidth - rightOffset - VIEWER_MIN_WIDTH;
      setLeftOverride(Math.max(sidebarWidth, Math.min(maxLeft, newLeft)));
    };
    const onUp = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [assistantOpen, assistantViewMode, assistantWidth]);

  const selectMatch = useCallback((id: string) => {
    setActiveMatchId(id);
    const idx = matches.findIndex((m) => m.id === id);
    if (idx !== -1) setCurrentIdx(idx);
  }, [matches]);

  const handleQueryChange = useCallback((q: string) => {
    if (!doc) return;
    setLocalQuery(q);
    const m = getDocMatches(doc.name, q);
    setMatches(m);
    setActiveMatchId(m[0]?.id ?? null);
    setCurrentIdx(0);
  }, [doc]);

  const goTo = useCallback((delta: number) => {
    const next = currentIdx + delta;
    if (next >= 0 && next < matches.length) {
      setCurrentIdx(next);
      setActiveMatchId(matches[next].id);
    }
  }, [currentIdx, matches]);

  const terms = useMemo(() => extractTerms(matches), [matches]);
  const pages = useMemo(() => buildPages(matches), [matches]);

  const rightOffset = assistantOpen && assistantViewMode === 'sidebar' ? assistantWidth : 0;
  const fileEntry   = doc
    ? (FILE_ICON_COLORS[doc.type as keyof typeof FILE_ICON_COLORS] ?? FILE_ICON_COLORS.default)
    : FILE_ICON_COLORS.default;

  return (
    <Box
      ref={viewerRef}
      sx={{
        position: 'fixed',
        top: TOP_BAR_HEIGHT,
        left: leftOverride !== null
          ? leftOverride
          : '40vw',
        right: rightOffset,
        bottom: 0,
        zIndex: 3, // Below assistant panel (5) and top bar (10)
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        // Slide in from the right; right and left both track sidecar open/close
        // translateX must include rightOffset so the viewer clears the full viewport
        // when hidden (otherwise a strip remains visible behind the sidecar).
        transform: doc ? 'translateX(0)' : `translateX(calc(100% + ${rightOffset}px + 24px))`,
        transition: leftOverride !== null
          ? 'right 0.28s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), left 0.28s cubic-bezier(0.4, 0, 0.2, 1), right 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: doc ? 'auto' : 'none',
        borderLeft: '1px solid',
        borderColor: 'divider',
        boxShadow: doc ? '-4px 0 20px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      {/* ── Left-edge drag handle ────────────────────────────────────────────── */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          bottom: 0,
          zIndex: 10,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover .drag-indicator': { opacity: 1 },
          '&:active .drag-indicator': { opacity: 1, bgcolor: 'primary.main' },
        }}
      >
        <Box
          className="drag-indicator"
          sx={{
            width: 2,
            height: 32,
            borderRadius: 1,
            bgcolor: 'divider',
            opacity: 0,
            transition: 'opacity 0.15s, background-color 0.15s',
          }}
        />
      </Box>

      {/* ── Row 1: Title bar ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: ROW1_H,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: 1.25,
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        {/* Close + prev/next */}
        <Tooltip title="Close (Esc)">
          <IconButton size="small" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ ml: '12px' }}>
          <Tooltip title="Previous match">
            <span>
              <IconButton
                size="small"
                onClick={() => goTo(1)}
                disabled={currentIdx >= matches.length - 1 || matches.length === 0}
              >
                <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Box sx={{ ml: '4px' }}>
        <Tooltip title="Next match">
          <span>
            <IconButton
              size="small"
              onClick={() => goTo(-1)}
              disabled={currentIdx <= 0 || matches.length === 0}
            >
              <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: 17 }} />
            </IconButton>
          </span>
        </Tooltip>
        </Box>

        {/* Centered filename */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            overflow: 'hidden',
            px: 1,
          }}
        >
          {doc && (
            <Box
              sx={{
                px: 0.5,
                py: 0.125,
                bgcolor: fileEntry.bg,
                borderRadius: 0.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: fileEntry.color, fontSize: '0.4375rem', fontWeight: 700, lineHeight: 1.2 }}
              >
                {doc.type.toUpperCase()}
              </Typography>
            </Box>
          )}
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', maxWidth: 480 }}
          >
            {doc?.name}
          </Typography>
        </Box>

        {/* Open button */}
        <Box
          component="button"
          onClick={() => {}}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.125,
            py: 0.375,
            border: 'none',
            borderRadius: 1,
            bgcolor: 'transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 13 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}>
            Open
          </Typography>
        </Box>
      </Box>

      {/* ── Row 2: Toolbar ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: ROW2_H,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: 0.75,
          gap: 0.125,
          flexShrink: 0,
        }}
      >
        {/* Left tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          {/* Search toggle — bordered rounded-rect box */}
          <Tooltip title={sidecarOpen ? 'Hide Document Search' : 'Show Document Search'}>
            <Box
              component="button"
              onClick={() => setSidecarOpen((p) => !p)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                border: '1px solid',
                borderColor: sidecarOpen ? 'primary.main' : 'divider',
                borderRadius: 1,
                bgcolor: sidecarOpen ? 'primary.50' : 'transparent',
                color: sidecarOpen ? 'primary.main' : 'text.secondary',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'border-color 0.15s, background-color 0.15s, color 0.15s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                  color: 'primary.main',
                },
              }}
            >
              <FontAwesomeIcon icon={faSearch} style={{ fontSize: 15 }} />
            </Box>
          </Tooltip>

          {/* Page count icon */}
          <Tooltip title="Page count">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="11" viewBox="0 0 14 10" fill="none">
                <path d="M0 3.5C0 1.56562 1.56562 0 3.5 0H4.5C4.775 0 5 0.225 5 0.5C5 0.775 4.775 1 4.5 1H3.5C2.11875 1 1 2.11875 1 3.5V4.26875C1.29375 4.1 1.63438 4 2 4H4C5.10312 4 6 4.89688 6 6V8C6 9.10312 5.10312 10 4 10H2C0.896875 10 0 9.10312 0 8V3.5ZM1 6V8C1 8.55313 1.44687 9 2 9H4C4.55313 9 5 8.55313 5 8V6C5 5.44687 4.55313 5 4 5H2C1.44687 5 1 5.44687 1 6ZM12 5H10C9.44687 5 9 5.44687 9 6V8C9 8.55313 9.44687 9 10 9H12C12.5531 9 13 8.55313 13 8V6C13 5.44687 12.5531 5 12 5ZM8 7V3.5C8 1.56562 9.56562 0 11.5 0H12.5C12.775 0 13 0.225 13 0.5C13 0.775 12.775 1 12.5 1H11.5C10.1187 1 9 2.11875 9 3.5V4.26875C9.29375 4.1 9.63438 4 10 4H12C13.1031 4 14 4.89688 14 6V8C14 9.10312 13.1031 10 12 10H10C8.89688 10 8 9.10312 8 8V7Z" fill="currentColor"/>
              </svg>
            </IconButton>
          </Tooltip>

          <Tooltip title="Page thumbnails">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faFile} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Document outline">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faListUl} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Right tools */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

          {/* Translate */}
          <Box
            component="button"
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              px: 1, py: 0.5,
              border: 'none', bgcolor: 'transparent', borderRadius: 1,
              cursor: 'pointer', fontFamily: 'inherit', color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <FontAwesomeIcon icon={faLanguage} style={{ fontSize: 15 }} />
            <Typography variant="caption" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Translate</Typography>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 11 }} />
          </Box>

          <Box sx={{ width: '2px', flexShrink: 0 }} />
          <Box sx={{ width: '1px', height: 20, bgcolor: 'divider', flexShrink: 0 }} />
          <Box sx={{ width: '2px', flexShrink: 0 }} />

          <Tooltip title="Settings">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faGear} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ width: '2px', flexShrink: 0 }} />
          <Tooltip title="Pan tool">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faHand} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ width: '2px', flexShrink: 0 }} />
          <Tooltip title="Selection">
            <IconButton size="small" sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faVectorSquare} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ width: '4px', flexShrink: 0 }} />
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              height: 32, px: 1, borderRadius: 1,
              cursor: 'pointer', color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1 }}>100%</Typography>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 11 }} />
          </Box>
          <Box sx={{ width: '2px', flexShrink: 0 }} />
          <Tooltip title="Zoom in">
            <IconButton size="small" sx={{ width: 28, height: 28, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faCirclePlus} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out">
            <IconButton size="small" sx={{ width: 28, height: 28, borderRadius: 1, color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
              <FontAwesomeIcon icon={faCircleMinus} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

        </Box>
      </Box>

      {/* ── Body: sidecar + document ─────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Search sidecar */}
        {sidecarOpen && (
          <SearchSidecar
            matches={matches}
            activeMatchId={activeMatchId}
            onMatchSelect={selectMatch}
            query={localQuery}
            onQueryChange={handleQueryChange}
            onPrev={() => goTo(-1)}
            onNext={() => goTo(1)}
            canPrev={currentIdx > 0}
            canNext={currentIdx < matches.length - 1}
          />
        )}

        {/* Scrollable document body */}
        <Box
          ref={docBodyRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            py: 3,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'background.defaultAlt',
          }}
        >
          {pages.map((page) => (
            <DocPage
              key={page.num}
              num={page.num}
              sections={page.sections}
              terms={terms}
              activeMatchId={activeMatchId}
              matchRefs={matchRefs}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentViewer;
