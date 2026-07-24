import {
  faArrowUpRightFromSquare,
  faBookOpenLines,
  faCheck,
  faMagnifyingGlass,
  faMessagesQuestion,
  faPenLine,
  faRoute,
  faShieldCheck,
  faTriangleExclamation,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { HaloButton, HaloTextField } from '~/theme/halo/components';
import { amber, jade, ruby, tanzanite } from '~/theme/halo/theme';
import { COPY } from '../state/copy';
import type { WorkspaceAction, WorkspaceState } from '../state/types';
import { QA_TRIAGE_ITEMS, WILLIAM_BLAIR_SOURCE_FILES, type QaTriageRowStatus } from './qaTriageData';

const REVIEW_SIGNALS = [
  { label: 'Questions triaged', value: '4', icon: faMessagesQuestion },
  { label: 'Duplicate signals', value: '2', icon: faMagnifyingGlass },
  { label: 'Sensitive answer', value: '1', icon: faTriangleExclamation },
];

interface Props {
  state: WorkspaceState;
  dispatch: (action: WorkspaceAction) => void;
  bottomInset?: number;
  notesByRowId: Record<string, string>;
  onNoteChange: (rowId: string, value: string) => void;
  onOpenSourceMetadata?: (fileId: string) => void;
}

export default function LegalReviewWorkspace({
  state,
  dispatch,
  bottomInset = 0,
  notesByRowId,
  onNoteChange,
  onOpenSourceMetadata,
}: Props) {
  const saved = state.structureApplied;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        spacing={1.75}
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <FontAwesomeIcon icon={faMessagesQuestion} />
            </Box>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography component="h1" sx={{ fontSize: 17, fontWeight: 500, color: 'text.primary' }}>
                {saved ? 'Q&A triage batch saved' : 'Buyer Q&A command table'}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Category, duplicate signal, cited answer support, permission sensitivity, and SME routing for Project Silverstar.
              </Typography>
            </Stack>
          </Stack>
          {saved ? (
            <Chip
              size="small"
              icon={<FontAwesomeIcon icon={faCheck} />}
              label="Saved"
              sx={{ bgcolor: jade[50], color: jade[800], fontWeight: 600 }}
            />
          ) : (
            <Chip size="small" label="In review" sx={{ bgcolor: amber[50], color: amber[800], fontWeight: 650 }} />
          )}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {REVIEW_SIGNALS.map((signal) => (
            <Stack
              key={signal.label}
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                minHeight: 30,
                px: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.defaultAlt',
              }}
            >
              <FontAwesomeIcon icon={signal.icon} style={{ fontSize: 12 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 650 }}>{signal.value}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{signal.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          pb: bottomInset ? `${bottomInset}px` : 0,
          transition: 'padding-bottom 180ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <Table
          size="small"
          stickyHeader
          aria-label="Q&A command table"
          sx={{ tableLayout: 'fixed', width: '100%', minWidth: 1560 }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '18%' }}>Buyer question</TableCell>
              <TableCell sx={{ width: '10%' }}>AI read</TableCell>
              <TableCell sx={{ width: '11%' }}>Evidence</TableCell>
              <TableCell sx={{ width: '13%' }}>Duplicate signal</TableCell>
              <TableCell sx={{ width: '20%' }}>Suggested answer</TableCell>
              <TableCell sx={{ width: '11%' }}>Sensitivity</TableCell>
              <TableCell sx={{ width: '8%' }}>Owner</TableCell>
              <TableCell sx={{ width: '9%' }}>Robbin notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {QA_TRIAGE_ITEMS.map((row) => {
              const firstCitationId = row.citationFileIds[0];
              const firstCitation = WILLIAM_BLAIR_SOURCE_FILES.find((file) => file.id === firstCitationId);
              return (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.5}>
                      <Typography component="span" sx={{ fontSize: 13.5, fontWeight: 650, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                        {row.question}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.45 }}>
                        {row.buyer} · {row.category}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <AiReadChip status={row.aiRead} />
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.75}>
                      <Stack
                        component="button"
                        type="button"
                        direction="row"
                        spacing={0.5}
                        alignItems="flex-start"
                        onClick={() => firstCitationId ? onOpenSourceMetadata?.(firstCitationId) : undefined}
                        sx={{
                          appearance: 'none',
                          border: 0,
                          bgcolor: 'transparent',
                          p: 0.25,
                          ml: -0.25,
                          width: 'fit-content',
                          maxWidth: '100%',
                          cursor: firstCitationId ? 'pointer' : 'default',
                          textAlign: 'left',
                          color: 'text.secondary',
                          font: 'inherit',
                          borderRadius: 0.75,
                          '&:hover': firstCitationId ? { bgcolor: 'action.hover', color: 'text.primary' } : undefined,
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'action.focus',
                            outlineOffset: 2,
                          },
                        }}
                        aria-label={firstCitation ? `Open ${firstCitation.name}` : `Open evidence for ${row.question}`}
                      >
                        <FontAwesomeIcon icon={faBookOpenLines} style={{ fontSize: 11, marginTop: 3 }} />
                        <Typography component="span" sx={{ fontSize: 12, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                          {row.evidenceLabel}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {row.savedSearches.slice(0, 2).map((search) => (
                          <Chip key={search} size="small" label={search} sx={{ bgcolor: 'background.defaultAlt' }} />
                        ))}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                      {row.duplicateMatch}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
                      {row.suggestedAnswer}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.75}>
                      <SensitivityChip sensitive={row.aiRead === 'Sensitive'} />
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.45, overflowWrap: 'anywhere' }}>
                        {row.sensitivity}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.75}>
                      <Chip size="small" label={row.owner} variant="outlined" />
                      <Chip size="small" label={row.nextStep} sx={{ bgcolor: 'background.defaultAlt' }} />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Stack spacing={0.75}>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                        <FontAwesomeIcon icon={faPenLine} style={{ fontSize: 11 }} />
                        <Typography sx={{ fontSize: 11.5 }}>Private note</Typography>
                      </Stack>
                      <HaloTextField
                        placeholder="Add Robbin's note"
                        value={notesByRowId[row.id] ?? `${row.nextStep}: validate with ${row.owner}.`}
                        onChange={(value) => onNoteChange(row.id, value)}
                        multiline
                        minRows={2}
                        maxRows={5}
                        fullWidth
                        background="alt"
                        sx={{
                          width: '100%',
                          '& .MuiInputBase-root': {
                            fontSize: 12.5,
                            lineHeight: 1.45,
                          },
                          '& textarea': {
                            resize: 'vertical',
                          },
                        }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Divider />
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, flexShrink: 0 }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary', minWidth: 0 }}>
          <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: 13 }} />
          <Typography sx={{ fontSize: 12.5 }}>
            Suggested answers stay draft-only until Robbin routes, reviews, or marks them ready for approval.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {saved ? (
            <HaloButton
              size="small"
              variant="outlined"
              endIcon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
              sx={{ textTransform: 'none' }}
            >
              Open saved batch
            </HaloButton>
          ) : (
            <>
              <HaloButton
                size="small"
                variant="text"
                onClick={() => dispatch({ type: 'DISCARD_CHANGES' })}
                sx={{ textTransform: 'none' }}
              >
                Reset draft
              </HaloButton>
              <HaloButton
                size="small"
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faRoute} />}
                onClick={() => dispatch({ type: 'BEGIN_UPDATE' })}
                sx={{ textTransform: 'none' }}
              >
                {COPY.updateCta}
              </HaloButton>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function AiReadChip({ status }: { status: QaTriageRowStatus }) {
  const palette = {
    'Suggested answer ready': { bg: jade[50], fg: jade[800] },
    Sensitive: { bg: ruby[50], fg: ruby[700] },
    'Duplicate likely': { bg: amber[50], fg: amber[800] },
    'Needs SME': { bg: tanzanite[50], fg: tanzanite[800] },
  }[status];

  return (
    <Chip
      size="small"
      label={status}
      sx={{ bgcolor: palette.bg, color: palette.fg, fontWeight: 650, borderRadius: 1 }}
    />
  );
}

function SensitivityChip({ sensitive }: { sensitive: boolean }) {
  return (
    <Chip
      size="small"
      label={sensitive ? 'Restricted' : 'Permission-aware'}
      sx={{
        bgcolor: sensitive ? ruby[50] : jade[50],
        color: sensitive ? ruby[700] : jade[800],
        fontWeight: 650,
        borderRadius: 1,
      }}
    />
  );
}
