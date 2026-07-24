// One-line stats / indicators bar above the tree.
// Pattern A: Inline Segmented Counts (Linear-style).
// Reuses the rollup pill color palette as 8px dots; numbers + plural nouns;
// right cluster shows affected folder count. Empty + loading states handled.

import { Box, Divider, Skeleton, Stack, Typography } from '@mui/material';
import {
  CHANGE_COLORS,
  CHANGE_LABELS_NOUN,
  SEGMENT_RENDER_ORDER,
} from '../constants/changeColors';
import type { RollupCounts } from '../lib/rollupCounts';
import type { CompositedNode } from '../lib/compositeTree';

const PENDING_NEW_FOLDER_ID = '__pending-new-folder__';

// Count of distinct ancestor folders that contain at least one change.
// '__root__' counts as a real folder so top-level adds/renames register.
export function countAffectedFolders(roots: CompositedNode[]): number {
  const ids = new Set<string>();
  const visit = (nodes: CompositedNode[], parentFolderId: string) => {
    for (const n of nodes) {
      if (n.id === PENDING_NEW_FOLDER_ID) continue;
      const hasChange = Boolean(
        n.removed || (n.actionTypes && n.actionTypes.length > 0)
      );
      if (hasChange) ids.add(parentFolderId);
      if (n.children) {
        const nextParent = n.kind === 'folder' ? n.id : parentFolderId;
        visit(n.children, nextParent);
      }
    }
  };
  visit(roots, '__root__');
  return ids.size;
}

function pluralize(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

interface Props {
  counts: RollupCounts;
  affectedFolderCount: number;
  loading?: boolean;
}

export default function ChangeSummaryBar({ counts, affectedFolderCount, loading = false }: Props) {
  const segments = SEGMENT_RENDER_ORDER
    .map((key) => ({ key, value: counts[key] }))
    .filter((s) => s.value > 0);

  const isEmpty = !loading && counts.total === 0;

  return (
    <Box
      component="section"
      aria-label="Proposed changes summary"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 1.5,
        bgcolor: 'background.paper',
        minHeight: 44,
      }}
    >
      {loading ? (
        <Skeleton variant="text" width={240} height={20} />
      ) : isEmpty ? (
        <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
          No proposed changes yet. Describe the reorganization above.
        </Typography>
      ) : (
        <Stack
          direction="row"
          alignItems="center"
          divider={<Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 0.5 }} />}
          spacing={1.5}
        >
          <Typography
            aria-live="polite"
            sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
          >
            {counts.total} proposed {pluralize(counts.total, 'change', 'changes')}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            {segments.map((s) => (
              <Stack key={s.key} direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: CHANGE_COLORS[s.key],
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {s.value}
                  </Box>{' '}
                  {pluralize(s.value, CHANGE_LABELS_NOUN[s.key].one, CHANGE_LABELS_NOUN[s.key].many)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}

      {!loading && counts.total > 0 && (
        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
          Across {affectedFolderCount} {pluralize(affectedFolderCount, 'folder', 'folders')}
        </Typography>
      )}
    </Box>
  );
}
