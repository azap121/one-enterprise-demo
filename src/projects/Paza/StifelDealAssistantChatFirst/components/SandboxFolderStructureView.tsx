import { faArrowLeft, faBookOpenLines, faCheck, faScaleBalanced } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, ruby } from '~/theme/halo/theme';
import type { WorkspaceAction, WorkspaceState } from '../state/types';
import { COPY } from '../state/copy';

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
}

export default function SandboxFolderStructureView({ state: _state, dispatch }: Props) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, overflow: 'auto', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 650 }}>
              Saved Q&A triage batch
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              {COPY.pathLabel}
            </Typography>
          </Stack>
          <HaloButton
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => dispatch({ type: 'OPEN_REVIEW' })}
          >
            Back to assistant
          </HaloButton>
        </Stack>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ color: jade[700] }}>
                <FontAwesomeIcon icon={faScaleBalanced} />
              </Box>
              <Typography sx={{ fontWeight: 650 }}>Project Aldgate / Buyer Q&A triage batch</Typography>
            </Stack>
            <Chip size="small" label="Updated" sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }} />
          </Stack>
          <Stack spacing={0} sx={{ py: 1 }}>
            <BriefRow
              tone="amber"
              title="COA is missing the group mapping tab"
              source="Chart of accounts.xlsx / Source metadata"
              status="In review"
            />
            <BriefRow
              tone="red"
              title="Trial balance and management accounts use different periods"
              source="Trial balance Jun-2026.xlsx / Management accounts May-2026.pdf"
              status="Sensitive answer"
            />
            <BriefRow
              tone="green"
              title="FY2025 audited financials are ready for buyer preview"
              source="FY2025 audited financials.pdf / Signed accounts"
              status="Ready"
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function BriefRow({
  tone,
  title,
  source,
  status,
}: {
  tone: 'amber' | 'red' | 'green';
  title: string;
  source: string;
  status: string;
}) {
  const palette = {
    amber: { bg: amber[50], fg: amber[800], icon: faBookOpenLines },
    red: { bg: ruby[50], fg: ruby[700], icon: faBookOpenLines },
    green: { bg: jade[50], fg: jade[800], icon: faCheck },
  }[tone];

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{
        minHeight: 54,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box sx={{ color: palette.fg, width: 18, flexShrink: 0 }}>
        <FontAwesomeIcon icon={palette.icon} style={{ fontSize: 13 }} />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 650 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{source}</Typography>
      </Stack>
      <Chip size="small" label={status} sx={{ bgcolor: palette.bg, color: palette.fg, fontWeight: 600 }} />
    </Stack>
  );
}
