import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import AiSparkleBadge from './AiSparkleBadge';
import FolderProposalCard from './FolderProposalCard';
import SavedPathCard from './SavedPathCard';
import ThinkingTimeline from './ThinkingTimeline';
import type { WorkspaceState } from '../state/types';
import { COPY } from '../state/copy';
import { recommendationSteps, saveSteps } from '../state/timing';

interface Props {
  state: WorkspaceState;
  onReview: () => void;
  reviewActive?: boolean;
  onShowRationale: () => void;
  onOpenSavedFiles: () => void;
}

export default function ChatMessageList({
  state,
  onReview,
  reviewActive,
  onShowRationale,
  onOpenSavedFiles,
}: Props) {
  const inReview = reviewActive ?? (state.stage === 'split-review' || state.stage === 'confirm-update');

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      {state.messages.map((message) => {
        if (message.kind === 'proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <FolderProposalCard
                onReview={onReview}
                onShowRationale={onShowRationale}
                inReview={inReview}
                applied={state.structureApplied}
                rationaleExpanded={state.rationaleExpanded}
              />
            </MessageShell>
          );
        }

        if (message.kind === 'thinking') {
          return (
            <MessageShell key={message.id} role="assistant" showAssistantAvatar>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline
                  steps={recommendationSteps}
                  completedCount={state.recommendationStepIndex}
                />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'saving') {
          return (
            <MessageShell key={message.id} role="assistant" showAssistantAvatar>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline steps={saveSteps} completedCount={state.saveStepIndex} />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'success') {
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 650, fontSize: 16 }}>
                    {COPY.savedTitle}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {message.content}
                  </Typography>
                </Stack>
                <SavedPathCard onOpen={onOpenSavedFiles} />
              </Stack>
            </MessageShell>
          );
        }

        return (
          <MessageShell key={message.id} role={message.role}>
            <Typography sx={{ fontSize: 13, lineHeight: 1.65, color: 'text.primary' }}>
              {message.content}
            </Typography>
          </MessageShell>
        );
      })}
    </Stack>
  );
}

function MessageShell({
  role,
  showAssistantAvatar = false,
  children,
}: {
  role: 'assistant' | 'user';
  showAssistantAvatar?: boolean;
  children: ReactNode;
}) {
  const isUser = role === 'user';
  return (
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      alignItems="flex-start"
      sx={{ width: '100%' }}
    >
      {!isUser && showAssistantAvatar && (
        <Box sx={{ mt: 0.25 }}>
          <AiSparkleBadge size={30} iconSize={21} />
        </Box>
      )}
      <Box
        sx={{
          maxWidth: isUser ? 520 : 620,
          borderRadius: 3,
          px: isUser ? 2 : 0,
          py: isUser ? 1.25 : 0,
          bgcolor: isUser ? 'action.selected' : 'transparent',
          color: 'text.primary',
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}
