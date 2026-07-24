// Canonical category colors + labels for the Enhanced Sandbox prototype.
// Shared between RollupPill (segmented in-tree pill) and
// ChangeSummaryBar (top-of-tree stats line). Single source of truth.
import { amber, peridot, ruby, tanzanite } from '~/theme/halo/theme';

export const CHANGE_COLORS = {
  removed: ruby[600],
  rename: amber[600],
  move: tanzanite[600],
  addFolder: peridot[600],
} as const;

// Past-participle labels used inside RollupPill tooltips ("3 renamed inside").
export const CHANGE_LABELS_PAST = {
  removed:   'removed',
  rename:    'renamed',
  move:      'moved',
  addFolder: 'added',
} as const;

// Noun labels used by the top stats bar ("3 renames").
export const CHANGE_LABELS_NOUN = {
  rename:    { one: 'rename',   many: 'renames'   },
  move:      { one: 'move',     many: 'moves'     },
  addFolder: { one: 'addition', many: 'additions' },
  removed:   { one: 'removal',  many: 'removals'  },
} as const;

export type ChangeSegmentKey = keyof typeof CHANGE_COLORS;

// Render order for the top stats bar (action-forward → destructive last).
export const SEGMENT_RENDER_ORDER: ChangeSegmentKey[] = ['rename', 'move', 'addFolder', 'removed'];
