// Segmented rollup count pill shown on collapsed parent rows.
// Severity order: removed (red) → rename (orange) → move (blue) → add-folder (green).
// Sizing per Codex review: 20px H, 20px segment min-width, 10px outer radius,
// 1px neutral dividers, 11px/600 type, 99+ overflow cap.

import { Box, Stack, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { RollupCounts } from '../lib/rollupCounts';
import {
  CHANGE_COLORS as SEGMENT_COLORS,
  CHANGE_LABELS_PAST as SEGMENT_LABELS,
  type ChangeSegmentKey,
} from '../constants/changeColors';

const SEVERITY_ORDER: ChangeSegmentKey[] = ['removed', 'rename', 'move', 'addFolder'];

function cap(n: number): string {
  return n > 99 ? '99+' : String(n);
}

interface Props {
  counts: RollupCounts;
}

export default function RollupPill({ counts }: Props) {
  const segments = SEVERITY_ORDER
    .map((key) => ({ key, value: counts[key] }))
    .filter((s) => s.value > 0);

  if (segments.length === 0) return null;

  const tooltipText = segments
    .map((s) => `${cap(s.value)} ${SEGMENT_LABELS[s.key]}`)
    .join(', ') + ' inside';

  return (
    <Tooltip title={tooltipText} placement="top">
      <Stack
        direction="row"
        role="status"
        aria-label={tooltipText}
        sx={{
          height: 20,
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          // Optional 1px red outer stroke when any descendant removal.
          boxShadow: counts.hasRemoval ? `0 0 0 1px ${SEGMENT_COLORS.removed}` : 'none',
        }}
      >
        {segments.map((s, i) => (
          <Box
            key={s.key}
            sx={{
              height: 20,
              minWidth: 20,
              px: 0.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: SEGMENT_COLORS[s.key],
              color: 'common.white',
              fontSize: 11,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              borderLeft: i > 0
                ? (theme) => `1px solid ${alpha(theme.palette.common.white, 0.35)}`
                : 'none',
            }}
          >
            {cap(s.value)}
          </Box>
        ))}
      </Stack>
    </Tooltip>
  );
}
