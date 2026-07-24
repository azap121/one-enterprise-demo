import { faMessagesQuestion } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';

const QA_ITEMS = [
  {
    id: 'qa-001',
    title: 'Provide detail on edge network capacity planning.',
    owner: 'Technology',
    status: 'Drafting answer',
  },
  {
    id: 'qa-002',
    title: 'Confirm whether enterprise customer contracts include change-of-control clauses.',
    owner: 'Legal',
    status: 'Needs review',
  },
  {
    id: 'qa-003',
    title: 'Share FY2026 ARR bridge assumptions by customer segment.',
    owner: 'Finance',
    status: 'Submitted',
  },
];

interface Props {
  bottomInset?: number;
}

export default function RightContextCanvasQaView({ bottomInset = 0 }: Props) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={1.5} sx={{ px: 2.5, pt: 1.5, pb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 500, color: 'text.primary' }}>
              Q&amp;A
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Seller answer team workspace
            </Typography>
          </Stack>
          <Chip size="small" label="Placeholder" variant="outlined" />
        </Stack>
      </Stack>

      <Stack
        spacing={1.25}
        sx={{
          flex: 1,
          minHeight: 0,
          px: 2,
          pt: 1,
          pb: bottomInset ? `${bottomInset}px` : 1,
          overflow: 'auto',
          transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {QA_ITEMS.map((item) => (
          <Stack
            key={item.id}
            direction="row"
            alignItems="flex-start"
            spacing={1.25}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 1.5,
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ width: 20, pt: 0.25, flexShrink: 0, color: 'text.secondary' }}>
              <FontAwesomeIcon icon={faMessagesQuestion} style={{ fontSize: 14 }} />
            </Box>
            <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: 'text.primary', lineHeight: 1.4 }}>
                {item.title}
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={item.owner} variant="outlined" />
                <Chip size="small" label={item.status} variant="outlined" />
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
