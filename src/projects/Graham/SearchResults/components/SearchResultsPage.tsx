/**
 * SearchResultsPage — table-grid results merged from HTML prototype
 *
 * Halo scaffolding (DatasitePrototypeShell, MUI theme, HaloSkeleton) and
 * AI banner / loading states are preserved. The results area now uses the
 * fixed-column table layout from index.html:
 * checkbox · index · redact · name · preview · location · categories
 *
 * Figma: Search—Sidecar, node 482:54212
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Button, Checkbox, Chip, GlobalStyles, IconButton, Menu, MenuItem, Stack, Typography,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBars, faFilter, faBookmark, faTableColumns, faArrowUpRightFromSquare,
  faMagnifyingGlass, faFilePdf, faFileWord, faFileExcel, faFolder,
  faCalendarDay,
} from '@fortawesome/pro-light-svg-icons';
import { HaloSkeleton } from '~/theme/halo/components';
import { DatasitePrototypeShell } from '~/shared/DatasitePrototypeShell';
import FolderTreePanel from '~/projects/Graham/SearchSidecarA/components/FolderTreePanel';
import { InlineAiChatPanel, type AiDocItem } from '~/projects/Graham/SearchSidecarB/components/AiSearchLayout';

// ─── Static query for this prototype ─────────────────────────────────────────

const QUERY = 'Share purchase agreement';

// ─── Sparkle animation (page-load breathe, plays once then idles) ─────────────

const SPARKLE_D =
  'M31.3088 17.6175C22.6688 17.5613 18.4275 13.3313 18.3713 4.68V4.48874H17.6175V4.68C17.5613 13.32 13.32 17.5613 4.68002 17.6175H4.48877V18.3712H4.68002C13.32 18.4275 17.5613 22.6687 17.6175 31.3087V31.5H18.3713V31.3087C18.4275 22.6687 22.6688 18.4275 31.3088 18.3712H31.5V17.6175H31.3088Z';

const SPARKLE_KEYFRAMES = `
  .sr-ai-sparkle { transform-box: fill-box; transform-origin: center; }
  @keyframes sr-ai-cw {
    0%   { transform: scale(1)    rotate(0deg); }
    12%  { transform: scale(.82)  rotate(0deg); }
    32%  { transform: scale(1.12) rotate(30deg); }
    52%  { transform: scale(.96)  rotate(-12deg); }
    68%  { transform: scale(1.04) rotate(5deg); }
    82%  { transform: scale(.99)  rotate(-2deg); }
    100% { transform: scale(1)    rotate(0deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .sr-ai-sparkle { animation: none !important; }
  }
`;

function AnimatedAiSparkle() {
  const sparkleRef = useRef<SVGPathElement>(null);

  const play = useCallback(() => {
    const el = sparkleRef.current;
    if (!el) return;
    el.style.animation = 'sr-ai-cw 2.8s cubic-bezier(0.45,0.05,0.55,0.95) 1 forwards';
    // After the animation completes, clear it so the element is truly idle
    const t = setTimeout(() => {
      if (el) el.style.animation = '';
    }, 2800 + 50);
    return t;
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      play();
    }, 400);
    return () => clearTimeout(delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GlobalStyles styles={SPARKLE_KEYFRAMES} />
      <Box sx={{ width: 20, height: 20, flexShrink: 0, borderRadius: '50%', bgcolor: '#FF8818', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 36 36" width={14} height={14} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
          <path ref={sparkleRef} className="sr-ai-sparkle" d={SPARKLE_D} fill="white" />
        </svg>
      </Box>
    </>
  );
}


// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'settling' | 'results';
type ChipColor = 'blue' | 'gray' | 'pink' | 'green';

interface TableResult {
  id: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'folder';
  doc: string;
  indexNum: string;
  redact: 'green' | 'badge' | 'empty';
  snippet: string;
  location: string;
  catLabel: string;
  catColor: ChipColor;
  catOverflow: number;
  sandbox?: boolean;
}

// ─── Mock data (18 rows from index.html) ─────────────────────────────────────

const MOCK_RESULTS: TableResult[] = [
  { id: '1',  type: 'pdf',    doc: 'Lease_Agreement_Q2_2024.pdf',           indexNum: '2.1.4', redact: 'green', snippet: 'This <mark>lease agreement</mark>, dated May 1, 2024, is entered into by...',         location: 'Agreements',     catLabel: 'Due Diligence', catColor: 'blue',  catOverflow: 2 },
  { id: '2',  type: 'pdf',    doc: 'Lease_Agreement_Residential.pdf',        indexNum: '2.8.1', redact: 'green', snippet: 'The Landlord agrees to rent to the Tenant the dwelling locat...',                    location: 'Sandbox',        catLabel: 'Legal',         catColor: 'gray',  catOverflow: 4, sandbox: true },
  { id: '3',  type: 'docx',   doc: 'Lease_Terms_Conditions_2024.docx',       indexNum: '2.6.8', redact: 'green', snippet: "Article I: Definitions. 1.1 'Agreement' means this <mark>lease agre</mark>...",      location: 'Merger Do...',   catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '4',  type: 'pdf',    doc: 'Lease_Negotiation_Strategy.pdf',         indexNum: '1.4',   redact: 'green', snippet: 'Executive Summary: This document outlines key strategies...',                        location: 'Q2 Agreem...',   catLabel: 'Due Diligence', catColor: 'blue',  catOverflow: 2 },
  { id: '5',  type: 'pdf',    doc: 'Contract de location résidentielle.pdf', indexNum: '4.2.2', redact: 'green', snippet: 'Ce <mark>contrat de location</mark> résidentielle ("Contrat") est',                  location: 'Reports',        catLabel: 'Legal',         catColor: 'gray',  catOverflow: 1 },
  { id: '6',  type: 'xlsx',   doc: 'Lease_Contract_Sample_2024.xlsx',        indexNum: '1.2.5', redact: 'green', snippet: '',                                                                                   location: 'Agreements',     catLabel: 'Due Diligence', catColor: 'blue',  catOverflow: 2 },
  { id: '7',  type: 'folder', doc: 'Leasehold_Improvements',                 indexNum: '2.5.7', redact: 'badge', snippet: '',                                                                                   location: 'Agreements',     catLabel: 'Finance',       catColor: 'green', catOverflow: 2 },
  { id: '8',  type: 'folder', doc: 'Lease Payments',                         indexNum: '2.2',   redact: 'badge', snippet: '',                                                                                   location: 'Reports',        catLabel: 'Finance',       catColor: 'green', catOverflow: 2 },
  { id: '9',  type: 'folder', doc: 'Lease Dispute Resolution',               indexNum: '2.2',   redact: 'badge', snippet: '',                                                                                   location: 'Agreements',     catLabel: 'Legal',         catColor: 'gray',  catOverflow: 4 },
  { id: '10', type: 'docx',   doc: 'Lease_Documentation_Forms.docx',         indexNum: '2.3.3', redact: 'badge', snippet: 'Form A: Standard Residential <mark>Lease Agreement</mark>, Instruction...',         location: 'Reports',        catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '11', type: 'docx',   doc: 'Lease_Renewal_Notice.docx',              indexNum: '2.2.1', redact: 'badge', snippet: 'Dear [Tenant Name], This letter is to inform you that your cu...',                  location: 'Certifications', catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '12', type: 'docx',   doc: 'Lease_Transfer_Procedures.docx',         indexNum: '2.2.4', redact: 'badge', snippet: '<mark>Lease</mark> Transfer Process: 1. Tenant submits written request t...',        location: 'Agreements',     catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '13', type: 'xlsx',   doc: 'Lease_Inspection_Report.xlsx',           indexNum: '2.2.1', redact: 'badge', snippet: '',                                                                                   location: 'Reports',        catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '14', type: 'pdf',    doc: 'Lease_Rental_Payments.pdf',              indexNum: '2.2.8', redact: 'badge', snippet: 'Payment Schedule: Monthly rent of $2,000 is due on the 1st...',                     location: 'Agreements',     catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '15', type: 'xlsx',   doc: 'Lease_Figures.xlsx',                     indexNum: '2.2.2', redact: 'badge', snippet: '',                                                                                   location: 'Reports',        catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '16', type: 'folder', doc: 'Lease Reports',                          indexNum: '3.2',   redact: 'badge', snippet: '',                                                                                   location: 'Reports',        catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
  { id: '17', type: 'docx',   doc: 'Lease_Transfer_Procedures.docx',         indexNum: '3.4.9', redact: 'empty', snippet: '<mark>Lease</mark> Transfer Process: 1. Tenant submits written request t...',        location: 'Agreements',     catLabel: 'Legal',         catColor: 'gray',  catOverflow: 4 },
  { id: '18', type: 'xlsx',   doc: 'Lease_Inspection_Report_v01.xlsx',       indexNum: '2.2.2', redact: 'empty', snippet: 'Payment Schedule: Monthly rent of $2,000 is due on the 1st...',                     location: 'Reports',        catLabel: 'Property',      catColor: 'pink',  catOverflow: 1 },
];

// ─── Chip colour palette (from HTML CSS vars) ─────────────────────────────────

const CHIP_COLOR: Record<ChipColor, { bg: string; text: string }> = {
  blue:  { bg: '#e3f0fb', text: '#1565c0' },
  gray:  { bg: '#ededec', text: 'rgba(31,34,39,0.87)' },
  pink:  { bg: '#f5e8e8', text: '#8b3030' },
  green: { bg: '#e6f2ec', text: '#2e7d4f' },
};

// ─── File icon config ─────────────────────────────────────────────────────────

const FILE_ICON = {
  pdf:    { icon: faFilePdf,   color: '#e53935' },
  docx:   { icon: faFileWord,  color: '#1565c0' },
  xlsx:   { icon: faFileExcel, color: '#2e7d32' },
  folder: { icon: faFolder,    color: 'rgba(31,34,39,0.60)' },
} as const;

// ─── Snippet renderer ─────────────────────────────────────────────────────────

function renderSnippet(snippet: string): React.ReactNode {
  if (!snippet) return null;
  return snippet.split(/(<mark>[^<]+<\/mark>)/g).map((part, i) => {
    const match = part.match(/^<mark>([^<]+)<\/mark>$/);
    if (match) {
      return (
        <Box key={i} component="span" sx={{ color: '#1a6b9a', textDecoration: 'underline', fontStyle: 'italic' }}>
          {match[1]}
        </Box>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ─── Redact column indicator ──────────────────────────────────────────────────

function RedactDot({ type }: { type: TableResult['redact'] }) {
  if (type === 'green') {
    return <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', flexShrink: 0 }} />;
  }
  if (type === 'badge') {
    return (
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M0 4C0 6.20914 1.79086 8 4 8V0C1.79086 0 0 1.79086 0 4Z" fill="#517431" />
      </svg>
    );
  }
  return <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid', borderColor: 'text.secondary', flexShrink: 0 }} />;
}

// ─── Target icon (redact column header) ──────────────────────────────────────

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: 'block', color: 'inherit' }}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="3.75" x2="12" y2="6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="17.25" x2="12" y2="20.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.75" y1="12" x2="6.75" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17.25" y1="12" x2="20.25" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Shared TH sx ─────────────────────────────────────────────────────────────

const TH_BASE = {
  position: 'sticky',
  top: 0,
  bgcolor: 'background.paperAlt',
  zIndex: 2,
  borderBottom: '1px solid',
  borderColor: 'divider',
  height: 40,
  p: 0,
  textAlign: 'left',
  whiteSpace: 'nowrap',
} as const;

// ─── SearchTableRow ───────────────────────────────────────────────────────────

function SearchTableRow({ row, onFileClick }: { row: TableResult; onFileClick?: (item: AiDocItem) => void }) {
  const fileEntry = FILE_ICON[row.type];
  const chip = CHIP_COLOR[row.catColor];
  const isSandbox = !!row.sandbox;

  return (
    <Box
      component="tr"
      onClick={() => onFileClick?.({ indexNum: row.indexNum, doc: row.doc, type: row.type as AiDocItem['type'] })}
      sx={{
        borderBottom: '1px solid', borderColor: 'divider',
        transition: 'background 0.1s', cursor: 'pointer',
        ...(isSandbox
          ? { bgcolor: 'rgba(255,136,24,0.08)', '&:hover': { bgcolor: 'rgba(255,136,24,0.14)' } }
          : { '&:hover': { bgcolor: 'action.hover' } }),
      }}
    >
      {/* Checkbox */}
      <Box component="td" sx={{ width: 48, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Box sx={{ width: 17, height: 17, border: '1.5px solid', borderColor: 'text.secondary', borderRadius: '3px', cursor: 'pointer', '&:hover': { borderColor: 'text.primary' } }} />
        </Box>
      </Box>

      {/* Index */}
      <Box component="td" sx={{ width: 76, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', px: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{row.indexNum}</Typography>
        </Box>
      </Box>

      {/* Redact */}
      <Box component="td" sx={{ width: 50, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <RedactDot type={row.redact} />
        </Box>
      </Box>

      {/* Name */}
      <Box component="td" sx={{ width: 272, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: 1, height: '100%', overflow: 'hidden' }}>
          <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: fileEntry.color }}>
            <FontAwesomeIcon icon={fileEntry.icon as IconProp} style={{ fontSize: 14 }} />
          </Box>
          <Typography variant="body2" component="span" sx={{
            fontWeight: 500, color: 'text.primary',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontStyle: isSandbox ? 'italic' : 'normal',
          }}>
            {row.doc}
          </Typography>
        </Box>
      </Box>

      {/* Preview */}
      <Box component="td" sx={{ p: 0, height: 40, verticalAlign: 'middle' }}>
        <Typography variant="body2" component="div" sx={{
          px: 1, color: 'text.secondary',
          fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {renderSnippet(row.snippet)}
        </Typography>
      </Box>

      {/* Location */}
      <Box component="td" sx={{ width: 128, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: 1, height: '100%', overflow: 'hidden' }}>
          <Box sx={{ flexShrink: 0, color: isSandbox ? '#9a7600' : 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faFolder as IconProp} style={{ fontSize: 14 }} />
          </Box>
          <Typography variant="body2" component="span" sx={{
            color: isSandbox ? '#9a7600' : 'text.secondary',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {row.location}
          </Typography>
        </Box>
      </Box>

      {/* Categories */}
      <Box component="td" sx={{ width: 158, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: 1, overflow: 'hidden' }}>
          <Typography variant="caption" component="span" sx={{
            display: 'inline-flex', alignItems: 'center', height: 22, px: 1,
            borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
            flexShrink: 0, bgcolor: chip.bg, color: chip.text,
          }}>
            {row.catLabel}
          </Typography>
          {row.catOverflow > 0 && (
            <Typography variant="caption" component="span" sx={{
              display: 'inline-flex', alignItems: 'center', height: 22, px: 0.75,
              borderRadius: '4px', fontWeight: 500, whiteSpace: 'nowrap',
              flexShrink: 0, bgcolor: '#ededec', color: 'text.secondary',
            }}>
              +{row.catOverflow}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Skeleton table row ───────────────────────────────────────────────────────

function SkeletonTableRow() {
  return (
    <Box component="tr" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box component="td" sx={{ width: 48, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <HaloSkeleton variant="rectangular" width={17} height={17} sx={{ borderRadius: '3px' }} />
        </Box>
      </Box>
      <Box component="td" sx={{ width: 76, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', px: 1 }}>
          <HaloSkeleton variant="text" width={40} height={16} />
        </Box>
      </Box>
      <Box component="td" sx={{ width: 50, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <HaloSkeleton variant="circular" width={8} height={8} />
        </Box>
      </Box>
      <Box component="td" sx={{ width: 272, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: 1, height: '100%' }}>
          <HaloSkeleton variant="rectangular" width={16} height={16} sx={{ borderRadius: 0.5, flexShrink: 0 }} />
          <HaloSkeleton variant="text" sx={{ flex: 1 }} height={16} />
        </Box>
      </Box>
      <Box component="td" sx={{ p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ px: 1 }}>
          <HaloSkeleton variant="text" width="75%" height={14} />
        </Box>
      </Box>
      <Box component="td" sx={{ width: 128, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: 1, height: '100%' }}>
          <HaloSkeleton variant="rectangular" width={14} height={14} sx={{ borderRadius: 0.5, flexShrink: 0 }} />
          <HaloSkeleton variant="text" width={70} height={14} />
        </Box>
      </Box>
      <Box component="td" sx={{ width: 158, p: 0, height: 40, verticalAlign: 'middle' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: 1 }}>
          <HaloSkeleton variant="rectangular" width={80} height={22} sx={{ borderRadius: '4px' }} />
          <HaloSkeleton variant="rectangular" width={28} height={22} sx={{ borderRadius: '4px' }} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── SearchResultsContent ─────────────────────────────────────────────────────
// Exported so DatasitePrototypeShell can embed it via showSearchResultsOnQuery.

// ─── Banner extractions ───────────────────────────────────────────────────────

const BANNER_FILE_ICON = {
  pdf:  { icon: faFilePdf  as IconProp, color: '#e53935' },
  docx: { icon: faFileWord as IconProp, color: '#1565c0' },
  xlsx: { icon: faFileExcel as IconProp, color: '#2e7d32' },
} as const;

interface BannerExtraction {
  doc: string; indexNum: string; page: number; type: 'pdf' | 'docx' | 'xlsx'; text: string; terms: string[];
}

const BANNER_EXTRACTIONS: BannerExtraction[] = [
  {
    doc:      'Lease_Agreement_Q2_2024.pdf',
    indexNum: '2.1.4',
    page:     1,
    type:     'pdf',
    text:     'This lease agreement, dated March 1, 2024, is entered into by Meridian Properties LLC ("Landlord") and Acquisition Target Corp ("Tenant"), for premises at 1250 Financial District, Suite 400, San Francisco — 4,800 sq ft.',
    terms:    ['lease agreement', 'March 1, 2024', 'Meridian Properties LLC', 'Acquisition Target Corp'],
  },
  {
    doc:      'Lease_Terms_Conditions_2024.docx',
    indexNum: '2.6.8',
    page:     3,
    type:     'docx',
    text:     'The initial term commences on the Commencement Date and expires on the Expiration Date, unless earlier terminated in accordance with Article 9. Renewal rights require 180 days written notice prior to expiry.',
    terms:    ['Commencement Date', 'Expiration Date', 'terminated', 'Article 9', '180 days'],
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

function BannerExtractionBlock({ doc, indexNum, page: _page, type, text, terms, onFileClick }: BannerExtraction & { onFileClick?: (item: AiDocItem) => void }) {
  const fe = BANNER_FILE_ICON[type];
  return (
    <Box sx={{
      borderRadius: '6px',
      bgcolor: 'background.paperAlt',
      px: 1.25, py: 0.75,
    }}>
      <Typography variant="body1" component="div" sx={{ color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.5, mb: 0.5 }}>
        "{renderHighlighted(text, terms)}"
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip
          size="small"
          onClick={() => onFileClick?.({ indexNum, doc, type: type as AiDocItem['type'] })}
          icon={
            <Box sx={{ display: 'flex', alignItems: 'center', color: fe.color }}>
              <FontAwesomeIcon icon={fe.icon} style={{ fontSize: 11 }} />
            </Box>
          }
          label={doc}
          sx={{
            height: 20, bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            cursor: 'pointer',
            '& .MuiChip-label': { fontSize: '0.6875rem', fontWeight: 500, px: '6px' },
            '& .MuiChip-icon': { ml: '6px', mr: 0, flexShrink: 0 },
            '&:hover': { bgcolor: 'action.hover' },
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Query correction (prototype: fixes common short-form typos) ─────────────
function correctQuery(q: string): string {
  const map: Record<string, string> = { leas: 'lease', leae: 'lease', leases: 'leases' };
  return q.trim().split(/\s+/).map(w => map[w.toLowerCase()] ?? w).join(' ');
}

// ─── AI insight banner (Figma: node 371:48610) ───────────────────────────────

function AiBanner({ query, onDiveDeeper, sidecarOpen, onToggle, rightPanelOpen, onToggleRightPanel, onSourceClick }: { query: string; onDiveDeeper?: () => void; sidecarOpen?: boolean; onToggle?: () => void; rightPanelOpen?: boolean; onToggleRightPanel?: () => void; onSourceClick?: (item: AiDocItem) => void }) {
  return (
    <Box sx={{ pt: 2, px: 2, flexShrink: 0 }}>
      <Box
        sx={{
          bgcolor: 'background.paperAlt',
          borderRadius: 1, p: 2,
          display: 'flex', alignItems: 'flex-start', gap: '11px',
          border: '1.5px solid',
          borderColor: sidecarOpen ? 'primary.main' : 'transparent',
          transition: 'border-color 150ms ease',
        }}>

        {/* Animated AI sparkle icon — clickable to toggle right chat panel */}
        <Box
          component="button"
          onClick={onToggleRightPanel}
          sx={{
            mt: '2px', flexShrink: 0,
            border: 'none', bgcolor: 'transparent', p: 0,
            cursor: onToggleRightPanel ? 'pointer' : 'default',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 150ms ease',
            outline: 'none',
            ...(onToggleRightPanel && { '&:hover': { opacity: 0.75 } }),
          }}>
          <AnimatedAiSparkle />
        </Box>

        {/* Inline-flowing content */}
        <Box sx={{ flex: 1, lineHeight: 1.6 }}>
          <Typography variant="h6" component="span" sx={{ color: 'text.secondary', fontWeight: 400, letterSpacing: '0.15px' }}>
            {`I found ${MOCK_RESULTS.length} documents related to `}
          </Typography>
          <Typography variant="h6" component="span" sx={{ color: 'text.primary', fontWeight: 500, letterSpacing: '0.15px' }}>
            {`"${correctQuery(query)}"`}
          </Typography>
          <Typography variant="h6" component="span" sx={{ color: 'text.secondary', fontWeight: 400, letterSpacing: '0.15px' }}>
            {'. The most relevant results are flagged for due diligence review. '}
          </Typography>

          {/* Date chip */}
          <Box component="span" sx={{
            display: 'inline-flex', verticalAlign: 'middle', alignItems: 'center',
            bgcolor: 'action.selected', borderRadius: '100px',
            height: 24, pl: '4px', pr: '6px', gap: '2px', mx: '2px',
          }}>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
              <FontAwesomeIcon icon={faCalendarDay as IconProp} style={{ fontSize: 12 }} />
            </Box>
            <Typography component="span" sx={{ fontSize: '13px', letterSpacing: '0.16px', lineHeight: '18px', color: 'text.primary' }}>
              1 March 2024
            </Typography>
          </Box>

          <Typography variant="h6" component="div" sx={{ color: 'text.secondary', fontWeight: 400, letterSpacing: '0.15px', mt: 0.25 }}>
            {'Specifically, the top 6 results.'}
          </Typography>

          {/* Key extractions */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.5 }} onClick={e => e.stopPropagation()}>
            {BANNER_EXTRACTIONS.map(ex => (
              <BannerExtractionBlock key={ex.indexNum} {...ex} onFileClick={onSourceClick} />
            ))}
          </Box>

          {/* Sources */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mt: 1.25 }} onClick={e => e.stopPropagation()}>
            <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: '20px', mr: 0.25 }}>Sources:</Typography>
            {BANNER_EXTRACTIONS.map(ex => {
              const fe = BANNER_FILE_ICON[ex.type];
              return (
                <Box
                  key={ex.indexNum}
                  onClick={() => onSourceClick?.({ indexNum: ex.indexNum, doc: ex.doc, type: ex.type as AiDocItem['type'] })}
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 1, height: 20, borderRadius: '4px',
                    border: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.paper', cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <Box sx={{ color: fe.color, display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={fe.icon} style={{ fontSize: 11 }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500, fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
                    {ex.indexNum}
                  </Typography>
                </Box>
              );
            })}
          </Box>

        </Box>


      </Box>
    </Box>
  );
}

// ─── SearchResultsContent ─────────────────────────────────────────────────────
// Exported so DatasitePrototypeShell can embed it via showSearchResultsOnQuery.

export function SearchResultsContent({ query, onOpenSidecar, sidecarOpen, onToggleSidecar, onFileClick, onToggleChat }: { query: string; onOpenSidecar?: () => void; sidecarOpen?: boolean; onToggleSidecar?: () => void; onFileClick?: (item: AiDocItem) => void; onToggleChat?: () => void }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [throttled, setThrottled] = useState(false);
  const [footerMenuAnchor, setFooterMenuAnchor] = useState<HTMLElement | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const handleToggleRightPanel = onToggleChat ?? (() => setRightPanelOpen(p => !p));

  useEffect(() => { setPhase('loading'); }, [query]);
  useEffect(() => { setPhase('loading'); }, [throttled]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const t = setTimeout(() => setPhase(throttled ? 'settling' : 'results'), throttled ? 2000 : 600);
    return () => clearTimeout(t);
  }, [phase, throttled]);

  useEffect(() => {
    if (phase !== 'settling') return;
    const t = setTimeout(() => setPhase('results'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Main column ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

      {/* ── AI insight banner ── */}
      <AiBanner query={query} onDiveDeeper={onOpenSidecar} sidecarOpen={sidecarOpen} onToggle={onToggleSidecar} rightPanelOpen={rightPanelOpen} onToggleRightPanel={handleToggleRightPanel} onSourceClick={onFileClick} />

      {/* ── Toolbar: results count · action buttons · filter ── */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ height: 56, display: 'flex', alignItems: 'center', px: 3, gap: 1.5 }}>
          {phase !== 'results' ? (
            <HaloSkeleton variant="text" width={90} height={18} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '15px', fontWeight: 500, color: 'text.primary', letterSpacing: '0.15px' }}>
              <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faMagnifyingGlass as IconProp} style={{ fontSize: 14 }} />
              </Box>
              {MOCK_RESULTS.length} Results
            </Box>
          )}
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <IconButton size="small" sx={{ width: 34, height: 34, borderRadius: '8px', color: 'text.secondary' }} title="Open in new tab">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare as IconProp} style={{ fontSize: 14 }} />
            </IconButton>
            <IconButton size="small" sx={{ width: 34, height: 34, borderRadius: '8px', color: 'text.secondary' }} title="Bookmark">
              <FontAwesomeIcon icon={faBookmark as IconProp} style={{ fontSize: 14 }} />
            </IconButton>
            <IconButton size="small" sx={{ width: 34, height: 34, borderRadius: '8px', color: 'text.secondary' }} title="Columns">
              <FontAwesomeIcon icon={faTableColumns as IconProp} style={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ height: 44, display: 'flex', alignItems: 'center', px: 2 }}>
          <Box
            component="button"
            sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              height: 32, px: 1.25, border: 'none', bgcolor: 'transparent',
              borderRadius: '6px', fontSize: '14px', fontWeight: 500,
              color: 'text.secondary', cursor: 'pointer', letterSpacing: '0.1px',
              fontFamily: 'inherit',
              '&:hover': { bgcolor: 'background.paperAlt' },
            }}
          >
            <FontAwesomeIcon icon={faFilter as IconProp} style={{ fontSize: 14 }} />
            Filter
          </Box>
        </Box>
      </Box>

      {/* ── Table ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 1.5 },
      }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ ...TH_BASE, width: 48 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
                  <Box sx={{ width: 17, height: 17, border: '1.5px solid', borderColor: 'text.secondary', borderRadius: '3px' }} />
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE, width: 76 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>Index</Typography>
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE, width: 50 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, color: 'text.secondary' }}>
                  <TargetIcon />
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE, width: 272 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>Name</Typography>
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>Preview</Typography>
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE, width: 128 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>Location</Typography>
                </Box>
              </Box>
              <Box component="th" sx={{ ...TH_BASE, width: 158 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: 40, px: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary' }}>Categories</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {phase !== 'results'
              ? Array.from({ length: 10 }, (_, i) => <SkeletonTableRow key={i} />)
              : MOCK_RESULTS.map((row) => <SearchTableRow key={row.id} row={row} onFileClick={onFileClick} />)
            }
          </Box>
        </Box>
      </Box>

      {/* ── Sticky footer — prototype settings ── */}
      <Box sx={{
        position: 'sticky', bottom: 0, zIndex: 10,
        px: 2, py: 0.75,
        display: 'flex', alignItems: 'center', gap: 1.5,
        borderTop: '1px solid', borderColor: 'divider',
        bgcolor: 'background.default', flexShrink: 0,
      }}>
        <IconButton
          size="small"
          onClick={(e) => setFooterMenuAnchor(e.currentTarget)}
          sx={{ width: 32, height: 32, borderRadius: '8px', color: 'text.secondary', flexShrink: 0, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}
        >
          <FontAwesomeIcon icon={faBars as IconProp} style={{ fontSize: 16 }} />
        </IconButton>
        <Menu
          anchorEl={footerMenuAnchor}
          open={Boolean(footerMenuAnchor)}
          onClose={() => setFooterMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{ paper: { sx: { borderRadius: '10px', minWidth: 160, bgcolor: '#1a1d23', boxShadow: '0px 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' } } }}
        >
          <MenuItem
            onClick={() => { setThrottled((t) => !t); setFooterMenuAnchor(null); }}
            sx={{ fontSize: '0.875rem', color: '#f0f0f0', borderRadius: '6px', mx: 0.5, gap: 0.5, px: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <Checkbox checked={throttled} size="small" disableRipple sx={{ p: 0, color: 'rgba(255,255,255,0.4)', '&.Mui-checked': { color: '#ff8818' } }} />
            Throttle
          </MenuItem>
        </Menu>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', letterSpacing: '0.17px' }}>
          Please select at least one item from the grid to see details.
        </Typography>
      </Box>

      </Box> {/* end main column */}

      {/* ── Right chat panel — standalone mode only (suppressed when embedded in SearchSidecar) ── */}
      {!onToggleChat && (
        <Box sx={{
          width: rightPanelOpen ? 440 : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: '1px solid',
          borderColor: rightPanelOpen ? 'divider' : 'transparent',
        }}>
          <Box sx={{ width: 440, height: '100%' }}>
            <InlineAiChatPanel query={query} onClose={() => setRightPanelOpen(false)} onSourceClick={onFileClick} />
          </Box>
        </Box>
      )}

    </Box>
  );
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const FOLDER_PANEL_WIDTH  = 280;
const FOLDER_PANEL_MIN    = 180;
const FOLDER_PANEL_MAX    = 480;
const NAV_WIDTH_COLLAPSED = 60;
const NAV_WIDTH_EXPANDED  = 224;

// ─── Standalone prototype page ────────────────────────────────────────────────

export function SearchResultsPage() {
  const [query, setQuery]                             = useState(QUERY);
  const [sidecarOpen, setSidecarOpen]                 = useState(false);
  const [activeFolder, setActiveFolder]               = useState('');
  const [folderPanelWidth, setFolderPanelWidth]       = useState(FOLDER_PANEL_WIDTH);
  const [folderPanelCollapsed, setFolderPanelCollapsed] = useState(false);
  const [navExpanded, setNavExpanded]                 = useState(false);
  const navWidth = navExpanded ? NAV_WIDTH_EXPANDED : NAV_WIDTH_COLLAPSED;

  const folderResizeDragStartX = useRef(0);
  const folderResizeDragStartW = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ']') setFolderPanelCollapsed(false);
      if (e.key === '[') setFolderPanelCollapsed(true);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFolderPanelResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    folderResizeDragStartX.current = e.clientX;
    folderResizeDragStartW.current = folderPanelWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - folderResizeDragStartX.current;
      setFolderPanelWidth(Math.max(FOLDER_PANEL_MIN, Math.min(FOLDER_PANEL_MAX, folderResizeDragStartW.current + delta)));
    };
    const onUp = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [folderPanelWidth]);

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      projectName="Sanoma Project"
      defaultSearchQuery={QUERY}
      sidecarSearchQuery={query}
      sidecarOpen={sidecarOpen}
      onSidecarChange={setSidecarOpen}
      onSearch={setQuery}
      onExpandedChange={setNavExpanded}
    >
      <FolderTreePanel
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        width={folderPanelWidth}
        onResizeStart={handleFolderPanelResizeStart}
        collapsed={folderPanelCollapsed}
        navWidth={navWidth}
      />
      <Box
        sx={{
          height: '100%',
          ml: `${folderPanelCollapsed ? 0 : folderPanelWidth}px`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <SearchResultsContent
          query={query}
          onOpenSidecar={() => setSidecarOpen(true)}
          sidecarOpen={sidecarOpen}
          onToggleSidecar={() => setSidecarOpen((v) => !v)}
        />
      </Box>
    </DatasitePrototypeShell>
  );
}

