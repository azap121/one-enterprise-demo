import { faArrowUpRightFromSquare, faTableCells } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { jade } from '~/theme/halo/theme';
import { COPY } from '../state/copy';

interface Props {
  onOpen: () => void;
}

export default function SavedPathCard({ onOpen }: Props) {
  return (
    <Box
      tabIndex={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        p: 2,
        maxWidth: 560,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: jade[50],
            color: jade[700],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FontAwesomeIcon icon={faTableCells} />
        </Box>
        <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Saved to
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
            {COPY.pathLabel}
          </Typography>
        </Stack>
        <HaloButton
          variant="outlined"
          size="small"
          endIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
          onClick={onOpen}
        >
          {COPY.openPathCta}
        </HaloButton>
      </Stack>
    </Box>
  );
}
