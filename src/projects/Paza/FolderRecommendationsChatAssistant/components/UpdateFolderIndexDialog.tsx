import { Stack, Typography } from '@mui/material';
import { HaloButton, HaloDialog } from '~/theme/halo/components';
import { COPY, UPDATE_BREAKDOWN } from '../state/copy';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function UpdateFolderIndexDialog({ open, onCancel, onConfirm }: Props) {
  return (
    <HaloDialog
      open={open}
      onClose={onCancel}
      title={COPY.confirmationTitle}
      actions={
        <>
          <HaloButton variant="outlined" onClick={onCancel} sx={{ textTransform: 'none' }}>
            Go back
          </HaloButton>
          <HaloButton variant="contained" onClick={onConfirm} sx={{ textTransform: 'none' }}>
            {COPY.updateCta}
          </HaloButton>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography sx={{ color: 'text.secondary' }}>
          {COPY.confirmationBody}
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
          {UPDATE_BREAKDOWN.map((item) => (
            <Typography key={item} component="li" sx={{ fontSize: 14 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </HaloDialog>
  );
}
