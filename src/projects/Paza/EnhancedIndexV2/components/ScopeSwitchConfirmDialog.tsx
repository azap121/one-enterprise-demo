import { Button, Typography } from '@mui/material';
import { HaloDialog } from '~/theme/halo/components';
import type { ReviewScope } from '../state/types';

const LABEL: Record<ReviewScope, string> = {
  'all': 'All changes',
  'add-folder': 'New folders',
  'rename': 'Renames',
  'move': 'Moves',
};

interface Props {
  open: boolean;
  fromScope: ReviewScope;
  toScope: ReviewScope;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ScopeSwitchConfirmDialog({ open, fromScope, toScope, onConfirm, onCancel }: Props) {
  return (
    <HaloDialog
      open={open}
      onClose={onCancel}
      title="Switch review scope?"
      actions={
        <>
          <Button onClick={onCancel}>Keep current</Button>
          <Button variant="contained" onClick={onConfirm}>
            Switch and regenerate
          </Button>
        </>
      }
    >
        <Typography variant="body2" color="text.secondary">
          Switching from <strong>{LABEL[fromScope]}</strong> to <strong>{LABEL[toScope]}</strong> will discard the current proposals and regenerate a fresh plan for the new scope.
        </Typography>
    </HaloDialog>
  );
}
