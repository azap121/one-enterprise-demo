import { Chip, Tooltip } from '@mui/material';
import type { PublishState } from '../state/types';

const CFG: Record<PublishState, { label: string; tip: string; color: 'success' | 'warning' | 'default'; variant: 'filled' | 'outlined' }> = {
  'published':     { label: 'Published',           color: 'success', variant: 'filled',
                    tip: 'Visible to permitted role-groups. Moves require permission resolution.' },
  'partial':       { label: 'Partially Published', color: 'warning', variant: 'filled',
                    tip: 'Some children have role-group access. Folder moves require permission resolution.' },
  'not-published': { label: 'Not Published',       color: 'default', variant: 'outlined',
                    tip: 'Visible only to admins. Free to reorganize.' },
};

export default function StatusBadge({ state }: { state: PublishState }) {
  const cfg = CFG[state];
  return (
    <Tooltip title={cfg.tip} arrow>
      <Chip size="small" label={cfg.label} color={cfg.color} variant={cfg.variant} />
    </Tooltip>
  );
}
