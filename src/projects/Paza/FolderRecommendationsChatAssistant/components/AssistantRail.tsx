import { faPlus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Link, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { HaloButton } from '~/theme/halo/components';
import AiSparkleBadge from './AiSparkleBadge';

const AGENT_ITEMS = [
  'Due diligence tracker',
  'Risk analyzer',
  'CIM summary',
];

const RECENT_ITEMS = [
  'Improve the folder structure for Project Atlas',
  'Find sensitive data and disclosures',
];

interface Props {
  onNewChat: () => void;
  onSelectItem?: (label: string) => void;
}

export default function AssistantRail({ onNewChat, onSelectItem }: Props) {
  return (
    <Box
      sx={{
        width: 227,
        flex: '0 0 227px',
        height: '100%',
        p: 1,
        boxSizing: 'border-box',
      }}
    >
      <Stack
        spacing={2.75}
        sx={{
          height: '100%',
          px: 2,
          py: 2,
          borderRadius: '16px',
          bgcolor: 'background.paper',
          boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <AiSparkleBadge size={16} iconSize={11} />
          <Typography sx={{ fontSize: 14, color: 'text.primary' }}>
            Datasite AI
          </Typography>
        </Stack>

        <HaloButton
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={onNewChat}
          sx={{ minHeight: 30, justifyContent: 'center', textTransform: 'none' }}
        >
          New chat
        </HaloButton>

        <AssistantHistoryContent onSelectItem={onSelectItem} />
      </Stack>
    </Box>
  );
}

export function AssistantHistoryContent({ onSelectItem }: { onSelectItem?: (label: string) => void }) {
  return (
    <>
      <RailSection label="Agents">
        {AGENT_ITEMS.map((item) => (
          <RailRow key={item} label={item} onClick={() => onSelectItem?.(item)} />
        ))}
        <RailLink>View all</RailLink>
      </RailSection>

      <RailSection label="Recents">
        {RECENT_ITEMS.map((item) => (
          <RailRow key={item} label={item} onClick={() => onSelectItem?.(item)} />
        ))}
      </RailSection>
    </>
  );
}

function RailSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Stack spacing={0.25}>{children}</Stack>
    </Stack>
  );
}

function RailRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        minHeight: 38,
        borderRadius: 1,
        px: 1,
        textAlign: 'left',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography sx={{ fontSize: 14, color: 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

function RailLink({ children }: { children: ReactNode }) {
  return (
    <Link
      component="button"
      variant="body2"
      sx={{ mt: 0.25, color: 'text.secondary', textAlign: 'left', textDecoration: 'none', width: 'fit-content' }}
    >
      {children}
    </Link>
  );
}
