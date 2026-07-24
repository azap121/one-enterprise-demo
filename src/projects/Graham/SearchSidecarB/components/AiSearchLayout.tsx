/**
 * AiSearchLayout — B-version fullscreen AI chat layout triggered by long queries (>3 words).
 *
 * Layout:
 *   [Nav] | [CompactResultsPanel 320px fixed] | [InlineAiChatPanel flex:1]
 *
 * The shell's right sidecar stays closed; the AI chat lives inline as the main content.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, InputBase, Paper, Button, Chip, Divider,
  Stack, Popover, Drawer, List, ListItemButton,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faXmark, faSquarePlus, faArrowUp, faArrowLeft,
  faFolder, faChevronDown, faCopy,
  faFilePdf, faFileWord, faFileExcel,
} from '@fortawesome/pro-light-svg-icons';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

// ─── Layout constants ─────────────────────────────────────────────────────────

const TOP_BAR_HEIGHT      = 104; // 44 gallery chrome + 60 topbar
export const RESULTS_PANEL_WIDTH = '20vw';

// ─── Chat empty-state content ─────────────────────────────────────────────────

const ADVISOR_ROLES = ['Finance', 'IT Security', 'Legal', 'Insurance', 'Taxes', 'HR & People', 'Operations'];

// ─── Seeded NL answer extractions ─────────────────────────────────────────────

interface SeededExtraction {
  doc: string; indexNum: string; page: number; type: 'pdf' | 'docx' | 'xlsx'; text: string; terms: string[];
}

const SEEDED_EXTRACTIONS: SeededExtraction[] = [
  {
    doc:      'Lease_Agreement_Q2_2024.pdf',
    indexNum: '2.1.4',
    page:     1,
    type:     'pdf',
    text:     'This lease agreement, dated March 1, 2024, is entered into by and between Meridian Properties LLC ("Landlord") and Acquisition Target Corp ("Tenant"), for premises at 1250 Financial District, Suite 400, San Francisco, CA 94104, consisting of approximately 4,800 sq ft.',
    terms:    ['lease agreement', 'March 1, 2024', 'Meridian Properties LLC', 'Acquisition Target Corp'],
  },
  {
    doc:      'Lease_Terms_Conditions_2024.docx',
    indexNum: '2.6.8',
    page:     3,
    type:     'docx',
    text:     '"Agreement" means this Lease Terms and Conditions, including all schedules and amendments. The initial term commences on the Commencement Date and expires on the Expiration Date, unless earlier terminated in accordance with Article 9.',
    terms:    ['Lease Terms and Conditions', 'Commencement Date', 'Expiration Date', 'terminated', 'Article 9'],
  },
  {
    doc:      'Lease_Negotiation_Strategy.pdf',
    indexNum: '1.4',
    page:     7,
    type:     'pdf',
    text:     'Key negotiation terms include: (i) tenant improvement allowance of $50/sq ft; (ii) 3-month free-rent period; (iii) right to sublease up to 30% of Premises without landlord consent, subject to 30 days written notice.',
    terms:    ['tenant improvement allowance', 'free-rent period', 'sublease', '30% of Premises', '30 days written notice'],
  },
];

function renderHighlighted(text: string, terms: string[]): React.ReactNode {
  if (!terms.length) return text;
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    terms.some(t => t.toLowerCase() === part.toLowerCase())
      ? <Box key={i} component="strong" sx={{ fontWeight: 600, color: 'text.primary', fontStyle: 'inherit' }}>{part}</Box>
      : part
  );
}

const DOC_MOCK_SECTIONS = [
  { heading: 'PARTIES',          body: 'This Lease Agreement ("Agreement") is entered into as of March 1, 2024 ("Effective Date"), by and between Meridian Properties LLC ("Landlord") and Acquisition Target Corp ("Tenant").' },
  { heading: 'PREMISES',         body: 'Landlord hereby leases to Tenant the premises located at 1250 Financial District, Suite 400, San Francisco, CA 94104, consisting of approximately 4,800 square feet of rentable area ("Premises").' },
  { heading: 'TERM',             body: 'The initial lease term shall commence on March 1, 2024 ("Commencement Date") and shall expire on February 28, 2026 ("Expiration Date"), unless sooner terminated in accordance with the provisions of this Agreement.' },
  { heading: 'BASE RENT',        body: 'Tenant shall pay to Landlord base rent in the amount of $28,500 per month during the initial term. Rent shall be due and payable in advance on the first day of each calendar month without demand, deduction, or offset.' },
  { heading: 'SECURITY DEPOSIT', body: 'Concurrently with the execution of this Agreement, Tenant shall deposit with Landlord the sum of $57,000 as a security deposit against the faithful performance by Tenant of all terms, covenants, and conditions of this Agreement.' },
  { heading: 'USE OF PREMISES',  body: 'The Premises shall be used solely for general office purposes and for no other purpose without the prior written consent of Landlord. Tenant shall not use the Premises for any unlawful purpose or in any manner that violates applicable law.' },
  { heading: 'MAINTENANCE',      body: 'Tenant shall, at its sole cost and expense, maintain the Premises in good condition and repair throughout the term of this Agreement, and shall promptly make all necessary repairs and replacements as may be required.' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_RESULTS = [
  { indexNum: '2.1.4', doc: 'Lease_Agreement_Q2_2024.pdf',            type: 'pdf',    relevant: true,  unread: true  },
  { indexNum: '2.8.1', doc: 'Lease_Agreement_Residential.pdf',         type: 'pdf',    relevant: true,  sandbox: true },
  { indexNum: '2.6.8', doc: 'Lease_Terms_Conditions_2024.docx',        type: 'docx',   relevant: true  },
  { indexNum: '1.4',   doc: 'Lease_Negotiation_Strategy.pdf',          type: 'pdf',    relevant: true,  unread: true  },
  { indexNum: '4.2.2', doc: 'Contract de location résidentielle.pdf',  type: 'pdf',    relevant: true  },
  { indexNum: '1.2.5', doc: 'Lease_Contract_Sample_2024.xlsx',         type: 'xlsx',   relevant: true  },
  { indexNum: '2.5.7', doc: 'Leasehold_Improvements',                  type: 'folder', relevant: false },
  { indexNum: '2.2',   doc: 'Lease Payments',                          type: 'folder', relevant: false, unread: true  },
  { indexNum: '2.3.3', doc: 'Lease_Documentation_Forms.docx',          type: 'docx',   relevant: false },
  { indexNum: '2.2.1', doc: 'Lease_Renewal_Notice.docx',               type: 'docx',   relevant: false, unread: true  },
  { indexNum: '2.2.8', doc: 'Lease_Rental_Payments.pdf',               type: 'pdf',    relevant: false },
  { indexNum: '2.2.2', doc: 'Lease_Figures.xlsx',                      type: 'xlsx',   relevant: false },
] as const;

const FILE_ICON_MAP = {
  pdf:    { icon: faFilePdf,   color: '#e53935' },
  docx:   { icon: faFileWord,  color: '#1565c0' },
  xlsx:   { icon: faFileExcel, color: '#2e7d32' },
  folder: { icon: faFolder,    color: 'rgba(31,34,39,0.60)' },
} as const;

const SUGGESTIONS = [
  'Find sensitive data & disclosures',
  'Summarize selected documents',
  'Identify information gaps',
  'Surface key deal risks',
];

// ─── ExtractionBlock ─────────────────────────────────────────────────────────

function ExtractionBlock({ doc, indexNum, page: _page, type, text, terms, compact = false, onDocClick }: SeededExtraction & { compact?: boolean; onDocClick?: (item: AiDocItem) => void }) {
  const fileEntry = FILE_ICON_MAP[type];
  const handleClick = () => onDocClick?.({ indexNum, doc, type });
  return (
    <Box
      onClick={handleClick}
      sx={{
        borderRadius: '6px',
        bgcolor: 'action.hover',
        px: compact ? 1.25 : 1.5,
        py: compact ? 0.75 : 1,
        cursor: onDocClick ? 'pointer' : 'default',
        '&:hover': onDocClick ? { bgcolor: 'action.selected' } : {},
      }}>
      <Typography variant="body1" component="div" sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.55, mb: compact ? 0.5 : 0.75 }}>
        "{renderHighlighted(text, terms)}"
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Chip
          size="small"
          icon={
            <Box sx={{ display: 'flex', alignItems: 'center', color: fileEntry.color }}>
              <FontAwesomeIcon icon={fileEntry.icon as IconProp} style={{ fontSize: 11 }} />
            </Box>
          }
          label={doc}
          sx={{
            height: 20, bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            '& .MuiChip-label': { fontSize: '0.6875rem', fontWeight: 500, px: '6px' },
            '& .MuiChip-icon': { ml: '6px', mr: 0, flexShrink: 0 },
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Blueflame logo (header) ──────────────────────────────────────────────────

function BlueflameLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none" style={{ flexShrink: 0 }}>
      <path d="M18.5 8.5C18.5 3.80558 14.6944 0 10 0C5.30558 0 1.5 3.80558 1.5 8.5C1.5 13.1944 5.30558 17 10 17C14.6944 17 18.5 13.1944 18.5 8.5Z" fill="#FF8818"/>
      <path d="M16.1037 8.22872C12.8864 8.22872 10.2713 5.61361 10.2713 2.39628C10.2713 2.24436 10.1519 2.125 10 2.125C9.84808 2.125 9.72872 2.24436 9.72872 2.39628C9.72872 5.61361 7.11361 8.22872 3.89628 8.22872C3.74436 8.22872 3.625 8.34808 3.625 8.5C3.625 8.65192 3.74436 8.77128 3.89628 8.77128C7.11361 8.77128 9.72872 11.3864 9.72872 14.6037C9.72872 14.7557 9.84808 14.875 10 14.875C10.1519 14.875 10.2713 14.7557 10.2713 14.6037C10.2713 11.3864 12.8864 8.77128 16.1037 8.77128C16.2557 8.77128 16.375 8.65192 16.375 8.5C16.375 8.34808 16.2557 8.22872 16.1037 8.22872Z" fill="#F6F6F6"/>
    </svg>
  );
}

// ─── Blueflame avatar (message thread) ───────────────────────────────────────

function BlueflameAvatar() {
  return (
    <Box sx={{ width: 16, height: 16, flexShrink: 0, mt: '1px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="15" fill="#EF601A"/>
        <path d="M24.5883 14.9469C19.7217 14.9469 15.7661 10.9913 15.7661 6.12469C15.7661 5.8949 15.5855 5.71436 15.3557 5.71436C15.126 5.71436 14.9454 5.8949 14.9454 6.12469C14.9454 10.9913 10.9898 14.9469 6.12322 14.9469C5.89344 14.9469 5.71289 15.1274 5.71289 15.3572C5.71289 15.587 5.89344 15.7675 6.12322 15.7675C10.9898 15.7675 14.9454 19.7232 14.9454 24.5897C14.9454 24.8195 15.126 25.0001 15.3557 25.0001C15.5855 25.0001 15.7661 24.8195 15.7661 24.5897C15.7661 19.7232 19.7217 15.7675 24.5883 15.7675C24.8181 15.7675 24.9986 15.587 24.9986 15.3572C24.9986 15.1274 24.8181 14.9469 24.5883 14.9469Z" fill="#FAFAF7"/>
      </svg>
    </Box>
  );
}

// ─── CompactResultsPanel ──────────────────────────────────────────────────────

export type AiDocItem = { doc: string; type: string; indexNum: string };

export function CompactResultsPanel({ navWidth = 60, onDocClick, activeDocId, readIds }: {
  navWidth?: number;
  onDocClick?: (item: AiDocItem) => void;
  activeDocId?: string | null;
  readIds?: Set<string>;
}) {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: navWidth,
        top: TOP_BAR_HEIGHT,
        bottom: 0,
        width: RESULTS_PANEL_WIDTH, // 20vw
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Header — height matches InlineAiChatPanel header so dividers align */}
      <Box sx={{ px: 2.5, height: 41, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.75, letterSpacing: '0.15px' }}>
          {ALL_RESULTS.length} Relevant documents
        </Typography>
      </Box>

      {/* Results list */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', pt: '8px', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
        {ALL_RESULTS.map((r, i) => {
          const fileEntry = FILE_ICON_MAP[r.type];
          return (
            <Box
              key={i}
              onClick={() => onDocClick?.({ doc: r.doc, type: r.type, indexNum: r.indexNum })}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2.5, height: 40,
                cursor: 'pointer',
                bgcolor: activeDocId === r.indexNum
                  ? 'action.selected'
                  : (r as any).sandbox ? 'rgba(255,136,24,0.08)' : 'transparent',
                '&:hover': { bgcolor: activeDocId === r.indexNum ? 'action.focus' : (r as any).sandbox ? 'rgba(255,136,24,0.14)' : 'action.hover' },
              }}
            >
              {/* Relevance dot */}
              <Box sx={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                ...(r.relevant
                  ? { bgcolor: '#4caf50' }
                  : { border: '1.5px solid', borderColor: 'text.disabled' }),
              }} />
              {/* File icon */}
              <Box sx={{ color: fileEntry.color, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <FontAwesomeIcon icon={fileEntry.icon as IconProp} style={{ fontSize: 14 }} />
              </Box>
              {/* Name */}
              <Typography variant="body2" sx={{ flex: 1, fontWeight: (r as any).unread && !readIds?.has(r.indexNum) ? 700 : r.relevant ? 500 : 400, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8125rem' }}>
                {r.doc}
              </Typography>
              {/* Index */}
              <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                {r.indexNum}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Tab file-type helpers ────────────────────────────────────────────────────

const TAB_FILE_MAP: Record<string, { icon: IconProp; color: string }> = {
  pdf:    { icon: faFilePdf   as IconProp, color: '#c62828' },
  docx:   { icon: faFileWord  as IconProp, color: '#1565c0' },
  xlsx:   { icon: faFileExcel as IconProp, color: '#2e7d32' },
  folder: { icon: faFolder    as IconProp, color: 'rgba(31,34,39,0.54)' },
};

// ─── TabbedDocViewer ─────────────────────────────────────────────────────────

export function TabbedDocViewer({
  openDocs,
  activeDocId,
  onTabClick,
  onTabClose,
  onCloseAll,
}: {
  openDocs: AiDocItem[];
  activeDocId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onCloseAll?: () => void;
}) {
  const tabStripRef = useRef<HTMLDivElement>(null);
  const [hiddenTabCount, setHiddenTabCount] = useState(0);
  const [overflowAnchor, setOverflowAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const strip = tabStripRef.current;
    if (!strip) return;
    const measure = () => {
      const available = strip.clientWidth;
      let hidden = 0;
      (Array.from(strip.children) as HTMLElement[]).forEach(el => {
        if (el.offsetLeft + el.offsetWidth > available) hidden++;
      });
      setHiddenTabCount(hidden);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => ro.disconnect();
  }, [openDocs]);

  const activeDoc = openDocs.find(d => d.indexNum === activeDocId) ?? null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* ── Tab bar ── */}
      <Box sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
        {/* Tab strip — takes all remaining space */}
        <Stack
          ref={tabStripRef as React.Ref<HTMLDivElement>}
          direction="row"
          sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}
        >
          {openDocs.map(d => {
            const isActive = d.indexNum === activeDocId;
            const fe = TAB_FILE_MAP[d.type] ?? TAB_FILE_MAP.pdf;
            return (
              <Stack key={d.indexNum} direction="row" alignItems="center" spacing={0.75}
                onClick={() => onTabClick(d.indexNum)}
                sx={{ px: 1.25, height: 40, maxWidth: 180, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', cursor: 'pointer', bgcolor: isActive ? 'background.paper' : 'transparent', borderBottom: '2px solid', borderBottomColor: isActive ? 'primary.main' : 'transparent', '&:hover': { bgcolor: isActive ? 'background.paper' : 'action.hover' } }}
              >
                <Box sx={{ color: fe.color, fontSize: 12, flexShrink: 0, display: 'flex' }}>
                  <FontAwesomeIcon icon={fe.icon} />
                </Box>
                <Typography variant="caption" component="p" sx={{ fontWeight: isActive ? 600 : 400, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.doc}
                </Typography>
                <Box onClick={e => { e.stopPropagation(); onTabClose(d.indexNum); }}
                  sx={{ flexShrink: 0, fontSize: 10, color: 'text.disabled', display: 'flex', cursor: 'pointer', borderRadius: '50%', p: '2px', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}>
                  <FontAwesomeIcon icon={faXmark as IconProp} />
                </Box>
              </Stack>
            );
          })}
        </Stack>

        {/* Overflow pill */}
        {hiddenTabCount > 0 && (
          <>
            <Stack direction="row" alignItems="center" spacing={0.5}
              onClick={e => setOverflowAnchor(e.currentTarget)}
              sx={{ px: 1.25, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider', bgcolor: 'background.default', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <Typography variant="caption" component="span" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                +{hiddenTabCount}
              </Typography>
              <Box sx={{ fontSize: 9, color: 'text.disabled', display: 'flex' }}>
                <FontAwesomeIcon icon={faChevronDown as IconProp} />
              </Box>
            </Stack>
            <Popover
              open={Boolean(overflowAnchor)}
              anchorEl={overflowAnchor}
              onClose={() => setOverflowAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { mt: 0.5, minWidth: 240, maxWidth: 320 } } }}
            >
              {openDocs.slice(openDocs.length - hiddenTabCount).map(d => {
                const fe = TAB_FILE_MAP[d.type] ?? TAB_FILE_MAP.pdf;
                return (
                  <Stack key={d.indexNum} direction="row" alignItems="center" spacing={1}
                    onClick={() => { onTabClick(d.indexNum); setOverflowAnchor(null); }}
                    sx={{ px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Box sx={{ color: fe.color, fontSize: 12, flexShrink: 0, display: 'flex' }}>
                      <FontAwesomeIcon icon={fe.icon} />
                    </Box>
                    <Typography variant="caption" component="p" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: d.indexNum === activeDocId ? 600 : 400 }}>
                      {d.doc}
                    </Typography>
                    <Box onClick={e => { e.stopPropagation(); onTabClose(d.indexNum); setOverflowAnchor(null); }}
                      sx={{ flexShrink: 0, fontSize: 11, color: 'text.disabled', display: 'flex', cursor: 'pointer', borderRadius: '50%', p: '2px', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}>
                      <FontAwesomeIcon icon={faXmark as IconProp} />
                    </Box>
                  </Stack>
                );
              })}
            </Popover>
          </>
        )}

        {/* Close-all button */}
        {onCloseAll && (
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', px: 0.5 }}>
            <IconButton size="small" onClick={onCloseAll} title="Close all documents"
              sx={{ width: 28, height: 28, borderRadius: '4px', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
              <FontAwesomeIcon icon={faXmark as IconProp} style={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* ── Document content ── */}
      {activeDoc && (
        <Box sx={{ flex: 1, overflowY: 'auto', py: 3, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, bgcolor: 'background.defaultAlt', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 } }}>
          {/* Page 1 */}
          <Box sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: '100%', maxWidth: 860, aspectRatio: '210 / 297', overflow: 'hidden', px: '9%', pt: '6%', pb: '6%', position: 'relative', flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 3.5, color: 'text.primary', textAlign: 'center', letterSpacing: '0.01em' }}>
              {activeDoc.doc.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}
            </Typography>
            {DOC_MOCK_SECTIONS.slice(0, 5).map((sec, i) => (
              <Box key={i} sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.625, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {i + 1}. {sec.heading}
                </Typography>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1.75, color: 'text.primary' }}>
                  {sec.body}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" sx={{ position: 'absolute', bottom: '3%', right: '7%', color: 'text.disabled' }}>1</Typography>
          </Box>
          {/* Page 2 */}
          <Box sx={{ bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', width: '100%', maxWidth: 860, aspectRatio: '210 / 297', overflow: 'hidden', px: '9%', pt: '6%', pb: '6%', position: 'relative', flexShrink: 0 }}>
            {DOC_MOCK_SECTIONS.slice(5).map((sec, i) => (
              <Box key={i} sx={{ mb: 2.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.625, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {i + 6}. {sec.heading}
                </Typography>
                <Typography sx={{ fontSize: '1rem', lineHeight: 1.75, color: 'text.primary' }}>
                  {sec.body}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" sx={{ position: 'absolute', bottom: '3%', right: '7%', color: 'text.disabled' }}>2</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Query correction (prototype: fixes common short-form typos) ─────────────
function correctQuery(q: string): string {
  const map: Record<string, string> = { leas: 'lease', leae: 'lease', leases: 'leases' };
  return q.trim().split(/\s+/).map(w => map[w.toLowerCase()] ?? w).join(' ');
}

// ─── InlineAiChatPanel ────────────────────────────────────────────────────────

export function InlineAiChatPanel({ query, onClose, onSourceClick }: { query: string; onClose: () => void; onSourceClick?: (item: AiDocItem) => void }) {
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmpty = !query.trim();
  const hasInput = inputValue.trim().length > 0;
  const now = new Date();
  const h = now.getHours();
  const timestamp = `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) e.preventDefault();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5, height: 41, flexShrink: 0,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setMenuOpen(o => !o)} sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
            <FontAwesomeIcon icon={faBars as IconProp} style={{ fontSize: 16 }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BlueflameLogo />
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.75, letterSpacing: '0.15px' }}>
              Datasite AI
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton size="small" disabled sx={{ width: 28, height: 28, borderRadius: '4px', p: 0, '&.Mui-disabled': { color: 'text.disabled' } }}>
            <FontAwesomeIcon icon={faSquarePlus as IconProp} style={{ fontSize: 16 }} />
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ width: 28, height: 28, borderRadius: '100px', p: 0, color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
            <FontAwesomeIcon icon={faXmark as IconProp} style={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Scrollable chat body ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', px: 6, pt: 3, pb: 3,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}>

        {/* ── Empty / welcome state ── */}
        {isEmpty && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 500, color: 'text.primary', lineHeight: 1.6, letterSpacing: '0.15px' }}>
                Hello, Graham
              </Typography>
              <Typography sx={{ fontSize: '1rem', fontWeight: 400, color: 'text.secondary', lineHeight: 1.5, letterSpacing: '0.15px' }}>
                How can I help you today?
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 4, width: '100%' }}>
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  variant="filled"
                  onClick={() => setInputValue(s)}
                  sx={{
                    bgcolor: 'action.selected', borderRadius: '100px', height: 'auto', cursor: 'pointer',
                    '& .MuiChip-label': { px: '6px', py: '3px', fontSize: '0.75rem', fontWeight: 400, color: 'text.primary', letterSpacing: '0.16px', lineHeight: '18px', whiteSpace: 'nowrap' },
                    '&:hover': { bgcolor: 'action.focus' },
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: '0.75rem', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', color: 'text.secondary', lineHeight: 2.66, mb: 1 }}>
              Review as an advisor in
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {ADVISOR_ROLES.slice(0, 5).map((role) => (
                  <Chip key={role} label={role} variant="outlined" size="small"
                    onClick={() => setInputValue(`Review as a ${role} advisor`)}
                    sx={{
                      borderRadius: '100px', height: 'auto', cursor: 'pointer',
                      '& .MuiChip-label': { px: '6px', py: '3px', fontSize: '0.75rem', fontWeight: 400, color: 'text.primary', letterSpacing: '0.16px', lineHeight: '18px' },
                      '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
                    }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {ADVISOR_ROLES.slice(5).map((role) => (
                  <Chip key={role} label={role} variant="outlined" size="small"
                    onClick={() => setInputValue(`Review as a ${role} advisor`)}
                    sx={{
                      borderRadius: '100px', height: 'auto', cursor: 'pointer',
                      '& .MuiChip-label': { px: '6px', py: '3px', fontSize: '0.75rem', fontWeight: 400, color: 'text.primary', letterSpacing: '0.16px', lineHeight: '18px' },
                      '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Seeded chat thread (only when query present) ── */}
        {!isEmpty && (
        <>
        {/* User prompt bubble */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box sx={{ maxWidth: '75%', px: 2, py: 1, bgcolor: 'action.selected', borderRadius: '12px 12px 2px 12px' }}>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
              {query}
            </Typography>
          </Box>
        </Box>

        {/* Seeded AI message */}
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
          <BlueflameAvatar />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, mb: 1.5 }}>
              {'I found '}
              <Box component="span" sx={{ fontWeight: 700 }}>6 highly relevant documents</Box>
              {' for '}
              <Box component="span" sx={{ fontWeight: 700 }}>"{correctQuery(query)}"</Box>
              {'. Here are the key passages from the top results:'}
            </Typography>

            {/* Extraction blocks */}
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              {SEEDED_EXTRACTIONS.map((ex) => (
                <ExtractionBlock key={ex.indexNum} {...ex} onDocClick={onSourceClick} />
              ))}
            </Stack>

            {/* Source citation list */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: '22px', mr: 0.25 }}>Sources:</Typography>
              {SEEDED_EXTRACTIONS.map((ex) => {
                const fe = FILE_ICON_MAP[ex.type];
                return (
                  <Box
                    key={ex.indexNum}
                    onClick={() => onSourceClick?.({ indexNum: ex.indexNum, doc: ex.doc, type: ex.type })}
                    sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 0.5,
                      px: 1, height: 22, borderRadius: '4px',
                      border: '1px solid', borderColor: 'divider',
                      bgcolor: 'background.paper', cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}>
                    <Box sx={{ color: fe.color, display: 'flex', alignItems: 'center' }}>
                      <FontAwesomeIcon icon={fe.icon as IconProp} style={{ fontSize: 11 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
                      {ex.indexNum}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.25 }}>
              {timestamp}
            </Typography>
          </Box>
        </Box>

        {/* Copy action */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Button size="small"
            startIcon={<FontAwesomeIcon icon={faCopy as IconProp} style={{ fontSize: 14 }} />}
            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 400, px: 1, py: 0.5, minWidth: 0, gap: 0.25, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            Copy
          </Button>
        </Box>

        {/* Divider + secondary suggestions */}
        <Divider sx={{ mt: 2, mb: 1.5 }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 2.66, mb: 0.5, display: 'block' }}>
          Or try asking
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {SUGGESTIONS.map(s => (
            <Chip key={s} label={s} variant="filled"
              sx={{
                bgcolor: 'action.selected', borderRadius: '100px', height: 'auto', cursor: 'pointer', alignSelf: 'flex-start',
                '& .MuiChip-label': { px: '6px', py: '3px', fontSize: '0.75rem', fontWeight: 400, color: 'text.primary', letterSpacing: '0.16px', lineHeight: '18px', whiteSpace: 'nowrap' },
                '&:hover': { bgcolor: 'action.focus' },
              }}
            />
          ))}
        </Box>
        </>
        )} {/* end !isEmpty */}

      </Box>

      {/* ── Input area ── */}
      <Box sx={{ flexShrink: 0, px: 6, pt: 2, pb: 3, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Context chip */}
          <Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, height: 24, borderRadius: '4px', bgcolor: 'rgba(31,34,39,0.08)', cursor: 'pointer', maxWidth: 200 }}>
              <FontAwesomeIcon icon={faFolder as IconProp} style={{ fontSize: 13, flexShrink: 0 }} />
              <Typography noWrap sx={{ fontSize: '0.8125rem', color: 'text.primary', lineHeight: 1, letterSpacing: '0.16px' }}>All documents</Typography>
              <FontAwesomeIcon icon={faChevronDown as IconProp} style={{ fontSize: 10, color: 'rgba(31,34,39,0.54)', flexShrink: 0, marginLeft: 2 }} />
            </Box>
          </Box>

          {/* Input box */}
          <Paper variant="outlined" sx={{ borderRadius: '8px', borderColor: 'rgba(84,89,99,0.3)', overflow: 'hidden', '&:focus-within': { borderColor: 'rgba(84,89,99,0.6)' } }}>
            <Box sx={{ px: 2, pt: '10px', pb: 0 }}>
              <InputBase
                placeholder="How can I help you today?"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                inputRef={inputRef}
                onKeyDown={handleKeyDown}
                multiline maxRows={4} fullWidth
                sx={{ fontSize: '0.9375rem', color: 'text.primary', '& textarea::placeholder': { color: 'text.secondary', opacity: 1 } }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, pb: 1 }}>
              <IconButton size="small" disabled={!hasInput}
                sx={{ width: 28, height: 28, borderRadius: '50%', p: 0, bgcolor: hasInput ? 'primary.main' : 'rgba(84,89,99,0.12)', color: hasInput ? '#fff' : 'text.secondary', '&:hover': { bgcolor: hasInput ? 'primary.dark' : 'rgba(84,89,99,0.18)' }, '&.Mui-disabled': { bgcolor: 'rgba(84,89,99,0.12)', color: 'text.secondary' }, transition: 'background-color 0.15s' }}>
                <FontAwesomeIcon icon={faArrowUp as IconProp} style={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.4px' }}>
              Powered by Blueflame AI. Always review for accuracy.
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}
