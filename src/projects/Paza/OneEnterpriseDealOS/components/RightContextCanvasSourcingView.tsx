import { useEffect, useMemo, useState } from 'react';
import { faBuilding } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { amber, moondust } from '~/theme/halo/theme';
import {
  SOURCING_COMPANIES,
  SOURCING_COPY,
  SOURCING_OWNERSHIP_SPLIT,
  SOURCING_SIZING_SPLIT,
  SOURCING_VIEW_SKELETON_MS,
  type SourcingCompany,
  type SourcingView,
} from '../state/sourcingScenario';
import type { WorkspaceState } from '../state/types';

interface Props {
  state: WorkspaceState;
  bottomInset?: number;
  onToggleRow: (companyId: string) => void;
  onPromote: () => void;
}

export default function RightContextCanvasSourcingView({ state, bottomInset = 0, onToggleRow, onPromote }: Props) {
  const [view, setView] = useState<SourcingView>('table');
  const [skeleton, setSkeleton] = useState(false);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const companies = useMemo(
    () => (state.sourcingNarrowed ? SOURCING_COMPANIES.filter((company) => company.commercial) : SOURCING_COMPANIES),
    [state.sourcingNarrowed]
  );

  // View switch shows a brief skeleton (~1s), matching the scrape (tiles/summary load).
  const switchView = (next: SourcingView | null) => {
    if (!next || next === view) return;
    setView(next);
    if (reducedMotion) return;
    setSkeleton(true);
  };

  useEffect(() => {
    if (!skeleton) return undefined;
    const timer = window.setTimeout(() => setSkeleton(false), SOURCING_VIEW_SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, [skeleton]);

  const selectedCount = state.sourcingSelectedIds.length;
  // The count re-renders as the set narrows — matches the scrape's live recount.
  const countLabel = state.sourcingNarrowed ? `${companies.length} Companies` : SOURCING_COPY.resultCountLabel;

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, pt: 3, pb: 1.5, flexShrink: 0 }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary' }}>{countLabel}</Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, next) => switchView(next as SourcingView | null)}
          aria-label="Sourcing results view"
        >
          <ToggleButton value="tiles" aria-label="Tiles view">Tiles</ToggleButton>
          <ToggleButton value="table" aria-label="Table view">Table</ToggleButton>
          <ToggleButton value="summary" aria-label="Summary view">Summary</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 3,
          pb: `calc(${bottomInset}px + ${selectedCount > 0 ? 88 : 24}px)`,
        }}
      >
        {skeleton ? (
          <ViewSkeleton />
        ) : view === 'table' ? (
          <TableView companies={companies} selectedIds={state.sourcingSelectedIds} onToggleRow={onToggleRow} />
        ) : view === 'tiles' ? (
          <TilesView companies={companies} />
        ) : (
          <SummaryView />
        )}
      </Box>

      {/* Floating action bar — raised when rows are selected. */}
      {selectedCount > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: bottomInset + 16,
            transform: 'translateX(-50%)',
            width: 'min(560px, calc(100% - 48px))',
            zIndex: 5,
            border: '1px solid',
            borderColor: alpha(moondust[900], 0.16),
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: `0 12px 32px ${alpha(moondust[900], 0.18)}`,
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
            {selectedCount} selected
          </Typography>
          <Box sx={{ flex: 1 }} />
          <HaloButton size="small" variant="outlined" sx={{ textTransform: 'none' }}>
            Add to list
          </HaloButton>
          <HaloButton size="small" variant="contained" onClick={onPromote} sx={{ textTransform: 'none' }}>
            Promote to Deal
          </HaloButton>
        </Box>
      ) : null}
    </Box>
  );
}

const TABLE_COLUMNS = '28px minmax(0, 1.1fr) minmax(0, 1.5fr) 128px 76px 118px';

function TableView({
  companies,
  selectedIds,
  onToggleRow,
}: {
  companies: SourcingCompany[];
  selectedIds: string[];
  onToggleRow: (companyId: string) => void;
}) {
  return (
    <Box
      role="table"
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}
    >
      <Box
        role="row"
        sx={{
          display: 'grid',
          gridTemplateColumns: TABLE_COLUMNS,
          gap: 1,
          px: 1.25,
          py: 0.9,
          bgcolor: 'background.defaultAlt',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {['', 'Company', 'Description', 'Seller Intent', 'Revenue', 'HQ'].map((header, index) => (
          <Typography
            key={header || `col-${index}`}
            role="columnheader"
            sx={{ fontSize: 11.5, fontWeight: 650, color: 'text.secondary' }}
          >
            {header}
          </Typography>
        ))}
      </Box>
      {companies.map((company) => {
        const selected = selectedIds.includes(company.id);
        return (
          <Box
            key={company.id}
            role="row"
            onClick={() => onToggleRow(company.id)}
            sx={{
              display: 'grid',
              gridTemplateColumns: TABLE_COLUMNS,
              gap: 1,
              px: 1.25,
              py: 1.05,
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: selected ? 'action.selected' : 'background.paper',
              '&:last-of-type': { borderBottom: 0 },
              '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
            }}
          >
            <Box
              component="input"
              type="checkbox"
              checked={selected}
              readOnly
              aria-label={`Select ${company.name}`}
              sx={{ width: 15, height: 15, accentColor: moondust[700], cursor: 'pointer' }}
            />
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {company.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {company.domain}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company.description}
            </Typography>
            <Box><SellerIntentChip company={company} /></Box>
            <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{company.revenueLabel}</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{company.hq}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function TilesView({ companies }: { companies: SourcingCompany[] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1.5 }}>
      {companies.map((company) => (
        <Stack
          key={company.id}
          spacing={1}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: 'background.paper' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faBuilding} style={{ fontSize: 13 }} />
            </Box>
            <Stack sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {company.name}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{company.domain}</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Badge label={`${company.employees} Employees`} />
            <Badge label={company.hq} />
            <Badge label={company.ownership} />
            {company.sellerIntent === 'has-intent' ? <Badge label="Has Intent to Sell" tone="amber" /> : null}
          </Stack>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.5 }}>{company.evidence}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

function SummaryView() {
  return (
    <Stack spacing={3} sx={{ pt: 0.5 }}>
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'text.primary' }}>Sizing</Typography>
        {SOURCING_SIZING_SPLIT.map((row) => (
          <BarRow key={row.label} label={row.label} percent={row.percent} />
        ))}
      </Stack>
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'text.primary' }}>Ownership</Typography>
        {SOURCING_OWNERSHIP_SPLIT.map((row) => (
          <BarRow key={row.label} label={row.label} percent={row.percent} />
        ))}
      </Stack>
    </Stack>
  );
}

function BarRow({ label, percent }: { label: string; percent: number }) {
  return (
    <Stack spacing={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.primary', fontWeight: 600 }}>{percent}%</Typography>
      </Stack>
      <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${percent}%`, borderRadius: 999, bgcolor: moondust[600] }} />
      </Box>
    </Stack>
  );
}

function SellerIntentChip({ company }: { company: SourcingCompany }) {
  if (company.sellerIntent === 'has-intent') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 22,
          px: 0.9,
          borderRadius: '999px',
          bgcolor: amber[50],
          color: amber[800],
          fontSize: 11.5,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        Has Intent to Sell
      </Box>
    );
  }
  return (
    <Typography sx={{ fontSize: 11.5, color: 'text.disabled', whiteSpace: 'nowrap' }}>No intent detected</Typography>
  );
}

function Badge({ label, tone }: { label: string; tone?: 'amber' }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 22,
        px: 0.8,
        borderRadius: '999px',
        bgcolor: tone === 'amber' ? amber[50] : 'background.defaultAlt',
        border: tone === 'amber' ? 'none' : '1px solid',
        borderColor: 'divider',
        color: tone === 'amber' ? amber[800] : 'text.secondary',
        fontSize: 11,
        fontWeight: tone === 'amber' ? 600 : 400,
      }}
    >
      {label}
    </Box>
  );
}

function ViewSkeleton() {
  return (
    <Stack spacing={1.25}>
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <Skeleton key={row} variant="rounded" height={44} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}
