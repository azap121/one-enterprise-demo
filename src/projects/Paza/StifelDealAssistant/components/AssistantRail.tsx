import { faClipboardCheck, faMagnifyingGlass, faPlus } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { HaloButton } from '~/theme/halo/components';

export interface RecentChat {
  id: string;
  title: string;
  relativeTime: string;
}

// Skills and templates are one concept (session 2026-07-16: "templates and skills are
// essentially the same thing") — a skill bundles instructions plus the frameworks/templates
// it references, so the rail exposes a single Skills surface.
export type AssistantRailMode = 'chat' | 'skills';

interface Props {
  activeSessionId: string;
  activeMode: AssistantRailMode;
  recentChats: RecentChat[];
  onNewChat: () => void;
  onOpenSearch: () => void;
  onOpenSkills: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function AssistantRail({
  activeSessionId,
  activeMode,
  recentChats,
  onNewChat,
  onOpenSearch,
  onOpenSkills,
  onSelectSession,
}: Props) {
  return (
    <Box
      sx={{
        width: 236,
        flex: '0 0 236px',
        height: '100%',
        boxSizing: 'border-box',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        spacing={2.25}
        sx={{
          height: '100%',
          px: 2,
          py: 2,
        }}
      >
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

        <AssistantHistoryContent
          activeSessionId={activeSessionId}
          activeMode={activeMode}
          recentChats={recentChats}
          onOpenSearch={onOpenSearch}
          onOpenSkills={onOpenSkills}
          onSelectSession={onSelectSession}
        />
      </Stack>
    </Box>
  );
}

export function AssistantHistoryContent({
  activeSessionId,
  activeMode,
  recentChats,
  onOpenSearch,
  onOpenSkills,
  onSelectSession,
}: {
  activeSessionId: string;
  activeMode: AssistantRailMode;
  recentChats: RecentChat[];
  onOpenSearch: () => void;
  onOpenSkills: () => void;
  onSelectSession: (sessionId: string) => void;
}) {
  return (
    <>
      <Stack spacing={0.25}>
        <RailRow label="Search" icon={<FontAwesomeIcon icon={faMagnifyingGlass} />} onClick={onOpenSearch} />
        <RailRow
          label="Skills"
          icon={<FontAwesomeIcon icon={faClipboardCheck} />}
          active={activeMode === 'skills'}
          onClick={onOpenSkills}
        />
      </Stack>

      <RailSection label="Recents">
        {recentChats.map((chat) => (
          <RecentRailRow
            key={chat.id}
            chat={chat}
            active={activeSessionId === chat.id}
            onClick={() => onSelectSession(chat.id)}
          />
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

function RailRow({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      sx={{
        justifyContent: 'flex-start',
        width: '100%',
        minHeight: 38,
        borderRadius: 1,
        px: 1,
        textAlign: 'left',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
      }}
    >
      {icon ? (
        <Box sx={{ width: 18, flexShrink: 0, color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}>
          {icon}
        </Box>
      ) : null}
      <Typography sx={{ fontSize: 14, color: 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

function RecentRailRow({
  chat,
  active,
  onClick,
}: {
  chat: RecentChat;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 40px',
        columnGap: 1,
        alignItems: 'center',
        width: '100%',
        minHeight: 38,
        borderRadius: 1,
        px: 1,
        textAlign: 'left',
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
      }}
    >
      <Typography
        sx={{
          minWidth: 0,
          fontSize: 14,
          color: 'text.primary',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {chat.title}
      </Typography>
      <Typography
        sx={{
          fontSize: 12,
          color: 'text.secondary',
          textAlign: 'right',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {chat.relativeTime}
      </Typography>
    </ButtonBase>
  );
}
