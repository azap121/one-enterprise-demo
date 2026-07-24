import { faBolt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import { tanzanite } from '~/theme/halo/theme';
import { GRATA_SIMILAR } from '../state/cimRunScenario';

// "@Grata find similar" mid-chat result (Phase 3, federation beat): Grata's sourcing
// muscle invoked inside diligence, without leaving the deal.
export default function GrataSimilarCard({ intro }: { intro: string }) {
  return (
    <Stack spacing={1.25}>
      <Typography sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.primary' }}>{intro}</Typography>
      <Stack
        spacing={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) 72px 120px',
            gap: 1,
            px: 1.5,
            py: 0.75,
            bgcolor: 'background.defaultAlt',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {['Company', 'Location', 'Revenue', 'Seller intent'].map((header) => (
            <Typography key={header} sx={{ fontSize: 11, fontWeight: 650, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {header}
            </Typography>
          ))}
        </Box>
        {GRATA_SIMILAR.companies.map((company) => (
          <Box
            key={company.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) 72px 120px',
              gap: 1,
              alignItems: 'center',
              px: 1.5,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 0 },
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company.name}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {company.location}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{company.revenue}</Typography>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 22,
                px: 0.9,
                borderRadius: '999px',
                bgcolor: company.intent === 'No signal' ? 'background.defaultAlt' : tanzanite[50],
                color: company.intent === 'No signal' ? 'text.disabled' : tanzanite[700],
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                justifySelf: 'start',
              }}
            >
              {company.intent}
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10, color: tanzanite[700] }} />
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{GRATA_SIMILAR.footnote}</Typography>
      </Stack>
    </Stack>
  );
}
