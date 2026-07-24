import { ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { amber, moondust } from '~/theme/halo/theme';
import AiSparkleBadge from './AiSparkleBadge';

interface Props {
  title: string;
  body: string;
  featured?: boolean;
  onClick: () => void;
}

export default function PromptSuggestionCard({ title, body, featured = false, onClick }: Props) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: featured ? 112 : 92,
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        border: '1px solid',
        borderColor: featured ? alpha(amber[700], 0.42) : 'divider',
        borderRadius: 3,
        bgcolor: featured ? alpha(amber[50], 0.72) : 'background.paper',
        transition: 'border-color 160ms ease, background-color 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: featured ? amber[700] : moondust[400],
          bgcolor: featured ? alpha(amber[50], 0.92) : 'background.defaultAlt',
          transform: 'translateY(-1px)',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Stack spacing={1} sx={{ p: 2, width: '100%' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {featured && (
            <AiSparkleBadge size={20} iconSize={14} />
          )}
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'text.primary' }}>
            {title}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: 'text.secondary' }}>
          {body}
        </Typography>
      </Stack>
    </ButtonBase>
  );
}
