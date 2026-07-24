import { Box, Stack, Typography } from '@mui/material';
import { moondust } from '~/theme/halo/theme';

// State 2 — subtle working indicator beside "Interpreting your search…".
export default function SourcingInterpretingMessage({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        aria-hidden="true"
        sx={{
          display: 'inline-flex',
          gap: '3px',
          '@media (prefers-reduced-motion: reduce)': { '& > span': { animation: 'none', opacity: 0.6 } },
        }}
      >
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            component="span"
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: moondust[500],
              animation: 'sourcingDot 1000ms ease-in-out infinite',
              animationDelay: `${dot * 160}ms`,
              '@keyframes sourcingDot': {
                '0%, 80%, 100%': { opacity: 0.25, transform: 'translateY(0)' },
                '40%': { opacity: 1, transform: 'translateY(-2px)' },
              },
            }}
          />
        ))}
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
    </Stack>
  );
}
