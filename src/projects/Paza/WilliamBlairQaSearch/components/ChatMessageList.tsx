import { faFileLines } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import AiSparkleBadge from './AiSparkleBadge';
import QaTriageReadoutCard from './QaTriageReadoutCard';
import SavedPathCard from './SavedPathCard';
import ThinkingTimeline from './ThinkingTimeline';
import ValidationPlanProposalCard from './ValidationPlanProposalCard';
import { findSellerFileById } from './rightCanvasFileData';
import type { WorkspaceState } from '../state/types';
import { COPY } from '../state/copy';
import { planFormationSteps, recommendationSteps, saveSteps } from '../state/timing';

interface Props {
  state: WorkspaceState;
  onViewPlan: () => void;
  onApprovePlan: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
}

export default function ChatMessageList({
  state,
  onViewPlan,
  onApprovePlan,
  onOpenSavedFiles,
  onOpenQaItem,
}: Props) {
  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      {state.messages.map((message) => {
        if (message.kind === 'proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <QaTriageReadoutCard onOpenQaItem={onOpenQaItem} />
            </MessageShell>
          );
        }

        if (message.kind === 'plan-proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <ValidationPlanProposalCard
                phases={state.validationPlan}
                approved={state.validationPlanApproved}
                onViewPlan={onViewPlan}
                onApprovePlan={onApprovePlan}
              />
            </MessageShell>
          );
        }

        if (message.kind === 'plan-thinking') {
          return (
            <MessageShell key={message.id} role="assistant" showAssistantAvatar>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline
                  steps={planFormationSteps}
                  completedCount={state.planStepIndex}
                />
              </Stack>
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

        if (message.kind === 'folder-overview') {
          const citationFiles = (message.citationFileIds ?? []).flatMap((fileId) => {
            const file = findSellerFileById(fileId);
            return file ? [file] : [];
          });

          return (
            <MessageShell key={message.id} role="assistant" showAssistantAvatar>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, lineHeight: 1.7, color: 'text.primary', whiteSpace: 'pre-line' }}>
                  {message.content}
                </Typography>
                {citationFiles.length > 0 ? (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {citationFiles.map((file) => (
                      <Stack
                        key={file.id}
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{
                          minHeight: 26,
                          px: 0.9,
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.defaultAlt',
                          color: 'text.secondary',
                        }}
                      >
                        <FontAwesomeIcon icon={faFileLines} style={{ fontSize: 11 }} />
                        <Typography sx={{ fontSize: 12, maxWidth: 210, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : null}
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
