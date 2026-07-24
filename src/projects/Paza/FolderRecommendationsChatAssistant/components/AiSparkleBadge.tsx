import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@mui/material';
import { faAiSparkle } from '~/shared/icons/faAiSparkle';
import { amber } from '~/theme/halo/theme';

interface Props {
  size?: number;
  iconSize?: number;
}

export default function AiSparkleBadge({ size = 22, iconSize = 16 }: Props) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: amber[600],
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FontAwesomeIcon icon={faAiSparkle as unknown as IconProp} style={{ width: iconSize, height: iconSize }} />
    </Box>
  );
}
