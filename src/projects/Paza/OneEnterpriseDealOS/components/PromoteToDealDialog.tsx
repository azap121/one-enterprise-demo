import { faCheck } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton, HaloDialog, HaloTextField } from '~/theme/halo/components';
import { jade, moondust } from '~/theme/halo/theme';
import { PROMOTE_CARRYOVER, PROMOTE_COPY } from '../state/sourcingScenario';

interface Props {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

// 90ms stagger between carryover checkmarks.
const STAGGER_MS = 90;

export default function PromoteToDealDialog({ open, selectedCount, onClose, onConfirm }: Props) {
  return (
    <HaloDialog
      open={open}
      onClose={onClose}
      title={PROMOTE_COPY.dialogTitle}
      actions={
        <>
          <HaloButton variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
            {PROMOTE_COPY.cancelCta}
          </HaloButton>
          <HaloButton variant="contained" onClick={onConfirm} sx={{ textTransform: 'none' }}>
            {PROMOTE_COPY.confirmCta}
          </HaloButton>
        </>
      }
    >
      <Stack spacing={2.5} sx={{ py: 0.5 }}>
        <HaloTextField
          label="Deal name"
          defaultValue={PROMOTE_COPY.defaultDealName}
          fullWidth
        />

        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>Direction</Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              minHeight: 30,
              px: 1.25,
              borderRadius: '999px',
              border: '1px solid',
              borderColor: moondust[400],
              bgcolor: 'background.defaultAlt',
              fontSize: 13,
              color: 'text.primary',
            }}
          >
            {PROMOTE_COPY.direction}
          </Box>
        </Stack>

        <Stack spacing={1}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>
            {PROMOTE_COPY.carryoverHeader}
          </Typography>
          <Stack spacing={0.75}>
            {PROMOTE_CARRYOVER.map((item, index) => (
              <CarryoverRow key={item} label={carryoverLabel(item, selectedCount)} delayMs={open ? index * STAGGER_MS : 0} />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </HaloDialog>
  );
}

// Reflect the actual selection count in the "N companies" line.
function carryoverLabel(item: string, selectedCount: number) {
  if (item.startsWith('3 companies')) {
    const noun = selectedCount === 1 ? 'company' : 'companies';
    return `${selectedCount} ${noun} with profiles & evidence`;
  }
  return item;
}

function CarryoverRow({ label, delayMs }: { label: string; delayMs: number }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        opacity: 0,
        transform: 'translateX(-4px)',
        animation: `carryoverIn 220ms cubic-bezier(0.2, 0, 0, 1) ${delayMs}ms forwards`,
        '@keyframes carryoverIn': {
          from: { opacity: 0, transform: 'translateX(-4px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          opacity: 1,
          transform: 'none',
          animation: 'none',
        },
      }}
    >
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: jade[50],
          color: jade[700],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{label}</Typography>
    </Stack>
  );
}
