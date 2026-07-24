import { Stack, Typography } from '@mui/material';
import { HaloButton, HaloDialog } from '~/theme/halo/components';
import { COPY, UPDATE_BREAKDOWN } from '../state/copy';
import { getFilingSpec } from '../state/filingVariants';
import type { FilingVariantId, WorkspaceFlow } from '../state/types';

interface Props {
  open: boolean;
  flow?: WorkspaceFlow;
  filingVariant?: FilingVariantId;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function UpdateFolderIndexDialog({ open, flow = 'qa', filingVariant = 'uploads', onCancel, onConfirm }: Props) {
  const spec = getFilingSpec(filingVariant);
  const copy = flow === 'filing'
    ? { title: spec.copy.confirmationTitle, body: spec.copy.confirmationBody, cta: spec.copy.updateCta, breakdown: spec.breakdown }
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
