import { useState, type MouseEvent } from 'react';
import {
  faCircleCheck,
  faColumns3,
  faFileExcel,
  faFilter,
  faMagnifyingGlass,
  faPlus,
  faQuoteLeft,
  faTableList,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Chip, Popover, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, ruby } from '~/theme/halo/theme';
import {
  CIM_REVIEW_ROWS,
  CIM_REVIEW_TITLE,
  CIM_RUN_COPY,
  type CimFit,
  type CimReviewRow,
} from '../state/cimRunScenario';
import { isPlanGated } from '../state/merlinFixtures';
import type { WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  bottomInset?: number;
  onAccept: () => void;
}

// Phase 3 — the run output in the right canvas. Nexus-shaped (view-tab strip, toolbar:
// Search · Columns · Filter · Table Prompts | Add Files · Export as Excel) PLUS
// per-cell citation badges (page + verbatim quote + confidence + basis) — deliberately
// beyond real Blueflame, whose grid offers doc-open-in-split-pane provenance only.
// The footer is the commit gate; its copy follows the autonomy dial.
export default function CimReviewCanvasView({ state, bottomInset = 0, onAccept }: Props) {
  const accepted = state.cimRun.phase === 'accepted';
  const sandbox = state.autonomyDial === 'sandbox';
  const planGated = isPlanGated(state.autonomyDial);

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 3, pt: 3, pb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>{CIM_REVIEW_TITLE}</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
              {CIM_RUN_COPY.outputDeliverable} · {CIM_RUN_COPY.outputMetaLine}
            </Typography>
          </Stack>
          {accepted ? <Chip size="small" label="Tracked" color="success" variant="filled" /> : null}
          {sandbox ? <Chip size="small" label="Sandbox" color="default" variant="outlined" /> : null}
        </Stack>
      </Box>

      {/* View-tab strip (Nexus: multiple views per dataset) */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 3, pb: 1, flexShrink: 0 }}>
        <Box
          sx={{
            minHeight: 26,
            px: 1.1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            borderRadius: '999px',
            border: '1px solid',
            borderColor: 'text.primary',
            bgcolor: 'action.hover',
            fontSize: 12,
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          <FontAwesomeIcon icon={faTableList} style={{ fontSize: 11 }} />
          Main View
        </Box>
        <ToolbarChipButton icon={faPlus} label="New view" iconOnly />
      </Stack>

      {/* Toolbar (Nexus anatomy: Search · Columns · Filter · Table Prompts | Add Files · Export as Excel) */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 3, pb: 1.25, flexShrink: 0, flexWrap: 'wrap', rowGap: 0.75 }}>
        <ToolbarChipButton icon={faMagnifyingGlass} label="Search" />
        <ToolbarChipButton icon={faColumns3} label="Columns" />
        <ToolbarChipButton icon={faFilter} label="Filter" />
        <ToolbarChipButton icon={faTableList} label="Table Prompts" />
        <Box sx={{ flex: 1 }} />
        <ToolbarChipButton icon={faPlus} label="Add Files" />
        <ToolbarChipButton icon={faFileExcel} label="Export as Excel" />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, pb: `calc(${bottomInset}px + 16px)` }}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 1.1fr) minmax(150px, 1.3fr) minmax(130px, 1fr) 96px',
              gap: 1,
              px: 1.5,
              py: 0.9,
              bgcolor: 'background.defaultAlt',
              borderBottom: '1px solid',
              borderColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            {['Criterion', 'CIM value', 'Thesis fit', 'Evidence'].map((header) => (
              <Typography key={header} sx={{ fontSize: 11, fontWeight: 650, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {header}
              </Typography>
            ))}
          </Box>
          {CIM_REVIEW_ROWS.map((row, index) => (
            <ReviewRow key={row.id} row={row} staggerIndex={index} />
          ))}
        </Box>
      </Box>

      {/* Commit gate — copy follows the autonomy dial */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: accepted ? jade[50] : 'background.paper',
          transition: 'background-color 220ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {accepted ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 15, color: jade[700] }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: jade[800] }}>
              Tracked in Deal › Review
            </Typography>
            <Typography sx={{ fontSize: 12, color: jade[800], opacity: 0.8 }}>
              · the deal team sees this cited table
            </Typography>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack spacing={0.1} sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                {sandbox
                  ? 'Sandbox — outputs stay in your personal space'
                  : planGated
                    ? 'Accept to track this screen on the deal'
                    : 'Ready to file into Deal › Review — approve?'}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                {sandbox
                  ? 'Nothing here can touch the Caldera deal record or any client-facing surface.'
                  : 'Blueflame AI drafted · you approve · every value keeps its citation.'}
              </Typography>
            </Stack>
            <HaloButton
              variant="contained"
              size="small"
              onClick={onAccept}
              disabled={sandbox}
              sx={{ textTransform: 'none', flexShrink: 0 }}
            >
              {planGated ? 'Accept & track' : 'File into Deal › Review'}
            </HaloButton>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function ToolbarChipButton({ icon, label, iconOnly = false }: { icon: typeof faPlus; label: string; iconOnly?: boolean }) {
  return (
    <ButtonBase
      aria-label={label}
      sx={{
        minHeight: 26,
        px: iconOnly ? 0.75 : 1.1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        borderRadius: '999px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        fontSize: 12,
        color: 'text.secondary',
        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
      }}
    >
      <FontAwesomeIcon icon={icon} style={{ fontSize: 11 }} />
      {iconOnly ? null : label}
    </ButtonBase>
  );
}

const FIT_STYLES: Record<CimFit, { bg: string; fg: string }> = {
  fit: { bg: jade[50], fg: jade[800] },
  watch: { bg: amber[50], fg: amber[800] },
  flag: { bg: ruby[50], fg: ruby[800] },
};

function ReviewRow({ row, staggerIndex }: { row: CimReviewRow; staggerIndex: number }) {
  const fit = FIT_STYLES[row.fit];
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 1.1fr) minmax(150px, 1.3fr) minmax(130px, 1fr) 96px',
        gap: 1,
        alignItems: 'center',
        px: 1.5,
        py: 1.1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
        '&:hover': { bgcolor: 'action.hover' },
        // Output rows stream in on the AX 90ms stagger.
        opacity: 0,
        animation: 'reviewRowEnter 220ms cubic-bezier(0.2, 0, 0, 1) forwards',
        animationDelay: `${staggerIndex * 90}ms`,
        '@keyframes reviewRowEnter': {
          from: { opacity: 0, transform: 'translateY(4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          opacity: 1,
        },
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>{row.criterion}</Typography>
      <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{row.value}</Typography>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 22,
          px: 0.9,
          borderRadius: '999px',
          bgcolor: fit.bg,
          color: fit.fg,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          justifySelf: 'start',
        }}
      >
        {row.fitLabel}
      </Box>
      <CitationBadge row={row} />
    </Box>
  );
}

// Per-cell citation badge → page + verbatim quote + confidence/basis popover.
function CitationBadge({ row }: { row: CimReviewRow }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl((current) => (current ? null : event.currentTarget));
  };

  return (
    <>
      <ButtonBase
        onClick={toggle}
        aria-label={`Citation for ${row.criterion} — page ${row.citation.page}`}
        aria-expanded={open ? 'true' : undefined}
        sx={{
          minHeight: 22,
          px: 0.9,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: '999px',
          border: '1px solid',
          borderColor: open ? 'text.primary' : 'divider',
          bgcolor: open ? 'action.hover' : 'background.defaultAlt',
          fontSize: 11,
          fontWeight: 600,
          color: 'text.secondary',
          justifySelf: 'start',
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
        }}
      >
        <FontAwesomeIcon icon={faQuoteLeft} style={{ fontSize: 9 }} />
        p. {row.citation.page}
      </ButtonBase>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            mt: 0.75,
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha(moondust[900], 0.12),
            boxShadow: `0 16px 48px ${alpha(moondust[900], 0.18)}`,
          },
        }}
      >
        <Stack spacing={1} sx={{ p: 1.75 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 650, color: 'text.primary' }}>
            {row.citation.doc}
          </Typography>
          <Box
            sx={{
              borderLeft: '3px solid',
              borderColor: amber[600],
              pl: 1.25,
              py: 0.25,
            }}
          >
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: 'text.primary', fontStyle: 'italic' }}>
              “{row.citation.quote}”
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip size="small" variant="outlined" label={`Page ${row.citation.page}`} sx={{ fontSize: 10.5, height: 20 }} />
            <Chip
              size="small"
              variant="outlined"
              label={`Confidence: ${row.confidence}`}
              sx={{ fontSize: 10.5, height: 20 }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={row.basis === 'source' ? 'Source-backed' : 'Inference'}
              sx={{ fontSize: 10.5, height: 20 }}
            />
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
