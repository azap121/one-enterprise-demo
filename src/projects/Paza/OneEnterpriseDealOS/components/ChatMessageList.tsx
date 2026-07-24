import { faFileLines } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import BriefReadoutCard from './BriefReadoutCard';
import CimOutputCard from './CimOutputCard';
import CimPlanCard from './CimPlanCard';
import CimWorkLog from './CimWorkLog';
import DealChatIntro from './DealChatIntro';
import FilingProposalCard from './FilingProposalCard';
import GrataSimilarCard from './GrataSimilarCard';
import QaTriageReadoutCard from './QaTriageReadoutCard';
import SavedPathCard from './SavedPathCard';
import SourcingInterpretingMessage from './SourcingInterpretingMessage';
import SourcingParseCard from './SourcingParseCard';
import ThinkingTimeline from './ThinkingTimeline';
import ValidationPlanProposalCard from './ValidationPlanProposalCard';
import { findSellerFileById } from './rightCanvasFileData';
import type { ChatMessageKind, WorkspaceState } from '../state/types';
import type { CALDERA_SUGGESTIONS } from '../state/dealsFixtures';
import { COPY } from '../state/copy';
import { briefPlanSteps, briefRunSteps } from '../state/briefScenario';
import { CIM_EXEC_STEPS, CIM_RUN_COPY, CIM_WORK_STEPS } from '../state/cimRunScenario';
import { FILING_COPY, filingSaveSteps, filingSteps } from '../state/filingScenario';
import { planFormationSteps, recommendationSteps, saveSteps } from '../state/timing';

interface Props {
  state: WorkspaceState;
  onViewPlan: () => void;
  onApprovePlan: () => void;
  onOpenSavedFiles: () => void;
  onOpenQaItem: (itemId: string) => void;
  onOpenFilingReview: () => void;
  onToggleRationale: () => void;
  onOpenCitation: (fileId: string) => void;
  onToggleSourcingTerms?: () => void;
  onRemoveSourcingTerm?: (termId: string) => void;
  onNarrowSourcing?: () => void;
  onNoOpSourcingSuggestion?: () => void;
  onDealSuggestion?: (action: (typeof CALDERA_SUGGESTIONS)[number]['action']) => void;
  // ── CIM run (Phase 3) ──
  onApproveCimPlan?: () => void;
  onOpenCimReview?: () => void;
  onAskGrataSimilar?: () => void;
}

export default function ChatMessageList({
  state,
  onViewPlan,
  onApprovePlan,
  onOpenSavedFiles,
  onOpenQaItem,
  onOpenFilingReview,
  onToggleRationale,
  onOpenCitation,
  onToggleSourcingTerms,
  onRemoveSourcingTerm,
  onNarrowSourcing,
  onNoOpSourcingSuggestion,
  onDealSuggestion,
  onApproveCimPlan,
  onOpenCimReview,
  onAskGrataSimilar,
}: Props) {
  // Reruns append fresh cim-* messages; only the LATEST of each kind is live-animated
  // against the current run state — earlier runs render frozen/complete.
  const latestIdOfKind = (kind: ChatMessageKind) => {
    for (let index = state.messages.length - 1; index >= 0; index -= 1) {
      if (state.messages[index].kind === kind) return state.messages[index].id;
    }
    return null;
  };
  const latestWorklogId = latestIdOfKind('cim-worklog');
  const latestPlanId = latestIdOfKind('cim-plan');
  const latestExecId = latestIdOfKind('cim-exec');

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      {state.messages.map((message) => {
        if (message.kind === 'deal-empty') {
          return (
            <Box key={message.id} sx={{ width: '100%' }}>
              <DealChatIntro onSuggestion={onDealSuggestion ?? (() => {})} />
            </Box>
          );
        }

        if (message.kind === 'proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <QaTriageReadoutCard onOpenQaItem={onOpenQaItem} />
            </MessageShell>
          );
        }

        if (message.kind === 'filing-proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <FilingProposalCard
                onReview={onOpenFilingReview}
                onShowRationale={onToggleRationale}
                inReview={state.stage === 'split-review' || state.stage === 'confirm-update'}
                applied={state.structureApplied}
                rationaleExpanded={state.rationaleExpanded}
              />
            </MessageShell>
          );
        }

        if (message.kind === 'brief-readout') {
          return (
            <MessageShell key={message.id} role="assistant">
              <BriefReadoutCard onOpenCitation={onOpenCitation} />
            </MessageShell>
          );
        }

        if (message.kind === 'sourcing-interpreting' || message.kind === 'grata-similar-thinking') {
          return (
            <MessageShell key={message.id} role="assistant">
              <SourcingInterpretingMessage label={message.content} />
            </MessageShell>
          );
        }

        if (message.kind === 'cim-worklog') {
          const live = message.id === latestWorklogId && state.cimRun.phase === 'working';
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{message.content}</Typography>
                <CimWorkLog
                  steps={CIM_WORK_STEPS}
                  completedCount={live ? state.cimRun.workStepIndex : CIM_WORK_STEPS.length}
                  live={live}
                />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'cim-plan') {
          const live = message.id === latestPlanId && !message.runMeta?.done;
          const status = !live || state.cimRun.phase === 'output-ready' || state.cimRun.phase === 'accepted'
            ? 'done' as const
            : state.cimRun.phase === 'executing'
              ? 'executing' as const
              : state.cimRun.phase === 'plan-ready'
                ? 'pending' as const
                : 'done' as const;
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{message.content}</Typography>
                <CimPlanCard status={status} onApprove={onApproveCimPlan ?? (() => {})} />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'cim-exec') {
          const live = message.id === latestExecId && state.cimRun.phase === 'executing';
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{message.content}</Typography>
                <CimWorkLog
                  steps={CIM_EXEC_STEPS}
                  completedCount={live ? state.cimRun.execStepIndex : CIM_EXEC_STEPS.length}
                  live={live}
                />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'cim-output') {
          // Run-time facts are frozen on the message — reruns can't rewrite them.
          return (
            <MessageShell key={message.id} role="assistant">
              <CimOutputCard
                summary={message.content}
                auditLine={message.runMeta?.auditLine ?? CIM_RUN_COPY.auditPlanFirst}
                accepted={Boolean(message.runMeta?.accepted)}
                sandbox={Boolean(message.runMeta?.sandbox)}
                onOpenReview={onOpenCimReview ?? (() => {})}
                onAskGrataSimilar={onAskGrataSimilar ?? (() => {})}
              />
            </MessageShell>
          );
        }

        if (message.kind === 'grata-similar') {
          return (
            <MessageShell key={message.id} role="assistant">
              <GrataSimilarCard intro={message.content} />
            </MessageShell>
          );
        }

        if (message.kind === 'sourcing-parse') {
          return (
            <MessageShell key={message.id} role="assistant">
              <SourcingParseCard
                state={state}
                onToggleTerms={onToggleSourcingTerms ?? (() => {})}
                onRemoveTerm={onRemoveSourcingTerm ?? (() => {})}
                onNarrow={onNarrowSourcing ?? (() => {})}
                onNoOpSuggestion={onNoOpSourcingSuggestion ?? (() => {})}
              />
            </MessageShell>
          );
        }

        if (message.kind === 'plan-proposal') {
          return (
            <MessageShell key={message.id} role="assistant">
              <ValidationPlanProposalCard
                flow={state.flow}
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
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline
                  steps={state.flow === 'brief' ? briefPlanSteps : planFormationSteps}
                  completedCount={state.planStepIndex}
                />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'thinking') {
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline
                  steps={state.flow === 'filing' ? filingSteps : state.flow === 'brief' ? briefRunSteps : recommendationSteps}
                  completedCount={state.recommendationStepIndex}
                />
              </Stack>
            </MessageShell>
          );
        }

        if (message.kind === 'saving') {
          return (
            <MessageShell key={message.id} role="assistant">
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {message.content}
                </Typography>
                <ThinkingTimeline
                  steps={state.flow === 'filing' ? filingSaveSteps : saveSteps}
                  completedCount={state.saveStepIndex}
                />
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
                    {state.flow === 'filing' ? FILING_COPY.savedTitle : COPY.savedTitle}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {message.content}
                  </Typography>
                </Stack>
                {state.flow === 'filing' ? null : <SavedPathCard onOpen={onOpenSavedFiles} />}
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
            <MessageShell key={message.id} role="assistant">
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
            <Typography sx={{ fontSize: 13, lineHeight: 1.65, color: 'text.primary', whiteSpace: 'pre-line' }}>
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
  children,
}: {
  role: 'assistant' | 'user';
  children: ReactNode;
}) {
  const isUser = role === 'user';
  return (
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      alignItems="flex-start"
      sx={{
        width: '100%',
        // AX entrance: fade + 8px rise at dur-base / ease-standard.
        animation: 'messageEnter 220ms cubic-bezier(0.2, 0, 0, 1)',
        '@keyframes messageEnter': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
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
