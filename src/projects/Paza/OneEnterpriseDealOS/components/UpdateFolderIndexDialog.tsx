import { Stack, Typography } from '@mui/material';
import { HaloButton, HaloDialog } from '~/theme/halo/components';
import { COPY, UPDATE_BREAKDOWN } from '../state/copy';
import { FILING_COPY } from '../state/filingScenario';
import type { WorkspaceFlow } from '../state/types';

const FILING_BREAKDOWN = [
  '14 files filed into the sandbox',
  '2 new folders created',
  '2 naming-convention renames applied',
  '4 files held in staging with notes',
  'Everything remains unpublished',
] as const;

interface Props {
  open: boolean;
  flow?: WorkspaceFlow;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function UpdateFolderIndexDialog({ open, flow = 'qa', onCancel, onConfirm }: Props) {
  const copy = flow === 'filing'
    ? { title: FILING_COPY.confirmationTitle, body: FILING_COPY.confirmationBody, cta: FILING_COPY.updateCta, breakdown: FILING_BREAKDOWN }
    : { title: COPY.confirmationTitle, body: COPY.confirmationBody, cta: COPY.updateCta, breakdown: UPDATE_BREAKDOWN };
  return (
    <HaloDialog
      open={open}
      onClose={onCancel}
      title={copy.title}
      actions={
        <>
          <HaloButton variant="outlined" onClick={onCancel} sx={{ textTransform: 'none' }}>
            Keep reviewing
          </HaloButton>
          <HaloButton variant="contained" onClick={onConfirm} sx={{ textTransform: 'none' }}>
            {copy.cta}
          </HaloButton>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography sx={{ color: 'text.secondary' }}>
          {copy.body}
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
          {copy.breakdown.map((item) => (
            <Typography key={item} component="li" sx={{ fontSize: 14 }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </HaloDialog>
  );
}
