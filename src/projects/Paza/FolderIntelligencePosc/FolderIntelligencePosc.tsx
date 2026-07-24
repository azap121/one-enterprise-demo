import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faCheck,
  faChevronDown,
  faCircleCheck,
  faCircleInfo,
  faClockRotateLeft,
  faFileLines,
  faFilter,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faLock,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
  faSliders,
  faSparkles,
  faTableColumns,
  faTriangleExclamation,
  faUpRightAndDownLeftFromCenter,
  faXmark,
} from '@fortawesome/pro-light-svg-icons';
import { DatasitePrototypeShell, diligenceNavItems } from '~/shared';
import { faAiSparkle } from '~/shared/icons/faAiSparkle';
import { amber, citrine, jade, moondust, ruby, tanzanite } from '~/theme/halo/theme';

type EntitlementMode = 'datasite_ai' | 'free';
type FileroomStatus = 'Published' | 'Partially Published' | 'Not Published';
type EvidenceSource = 'insights_ml' | 'blueflame_search' | 'deal_advisor_baseline';

interface FileroomRow {
  id: string;
  name: string;
  status: FileroomStatus;
  dateAvailable: string;
  source?: 'existing' | 'ai-created';
  parentId?: string;
  parentPath?: string;
  documents?: number;
}

interface FolderSuggestion {
  opId: string;
  parentPath: string;
  name: string;
  gapId: string;
  defaultChecked: boolean;
}

interface RecommendationEvidence {
  opId: string;
  source: EvidenceSource;
  text: string;
  benchmarkN?: number;
}

interface RecommendationGap {
  id: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface FolderIntelligenceRecommendation {
  coverage: {
    score: number;
    benchmark: { industry: string; dealType: string; n: number };
  };
  gaps: RecommendationGap[];
  folderSuggestions: FolderSuggestion[];
  evidence: RecommendationEvidence[];
}

type SidecarMessage =
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | {
      id: string;
      role: 'assistant';
      kind: 'thinking';
      activeStepIndex: number;
      status: 'running' | 'done' | 'canceled';
      startedAt: number;
      durationMs?: number;
      prompt: string;
    }
  | { id: string; role: 'assistant'; kind: 'freePreview' }
  | { id: string; role: 'assistant'; kind: 'folderSuggestions'; applied?: { opIds: string[] } }
  | {
      id: string;
      role: 'assistant';
      kind: 'applyingChanges';
      status: 'running' | 'done';
      folderNames: string[];
      startedAt: number;
      durationMs?: number;
    }
  | { id: string; role: 'assistant'; kind: 'createdResult'; suggestions: FolderSuggestion[] }
  | { id: string; role: 'assistant'; kind: 'assistantText'; text: string };

const SIDECAR_WIDTH = 440;
const FOLDER_PANEL_WIDTH = 300;

const initialFilerooms: FileroomRow[] = [
  { id: 'americas-data', name: 'Americas Data', status: 'Partially Published', dateAvailable: '9/5/2025 19:48', documents: 148 },
  {
    id: 'americas-contracts',
    name: '(1) Contracts',
    status: 'Published',
    dateAvailable: '9/5/2025 19:48',
    parentId: 'americas-data',
    parentPath: 'Americas Data',
    documents: 45,
  },
  {
    id: 'americas-human-resources',
    name: '(2) Human Resources',
    status: 'Partially Published',
    dateAvailable: '9/5/2025 19:48',
    parentId: 'americas-data',
    parentPath: 'Americas Data',
    documents: 21,
  },
  {
    id: 'americas-intellectual-property',
    name: '(3) Intellectual Property',
    status: 'Published',
    dateAvailable: '9/5/2025 19:48',
    parentId: 'americas-data',
    parentPath: 'Americas Data',
    documents: 19,
  },
  {
    id: 'americas-material-assets',
    name: '(4) Material Assets',
    status: 'Published',
    dateAvailable: '9/5/2025 19:48',
    parentId: 'americas-data',
    parentPath: 'Americas Data',
    documents: 16,
  },
  {
    id: 'americas-sample-files',
    name: '(5) Sample Files',
    status: 'Published',
    dateAvailable: '10/14/2025 15:10',
    parentId: 'americas-data',
    parentPath: 'Americas Data',
    documents: 8,
  },
  { id: 'redaction-ai', name: 'Redaction AI', status: 'Partially Published', dateAvailable: '9/5/2025 19:48', documents: 17 },
  { id: 'staging-request-list', name: 'Staging Request List', status: 'Partially Published', dateAvailable: '9/5/2025 19:58', documents: 31 },
  { id: 'rfp-process', name: 'RFP Process', status: 'Partially Published', dateAvailable: '1/23/2026 17:44', documents: 12 },
  { id: 'qa-questions', name: 'Q&A Questions', status: 'Published', dateAvailable: '2/5/2026 15:42', documents: 23 },
  { id: 'cs-demo-files', name: 'CS Demo Files', status: 'Not Published', dateAvailable: '2/20/2026 21:43', documents: 6 },
];

const recommendation: FolderIntelligenceRecommendation = {
  coverage: {
    score: 78,
    benchmark: { industry: 'Software', dealType: 'Sell-side diligence', n: 14 },
  },
  gaps: [
    {
      id: 'tax',
      category: 'Tax documents',
      confidence: 'high',
      rationale: 'Tax support is usually separated before buyer review, but this room does not have a dedicated tax area.',
    },
    {
      id: 'contracts',
      category: 'Customer contracts',
      confidence: 'high',
      rationale: 'Customer agreement materials appear split across general folders, which creates avoidable Q&A follow-up.',
    },
    {
      id: 'tech-ip',
      category: 'Technology & IP',
      confidence: 'medium',
      rationale: 'Software diligence usually needs a clean technology and IP section before legal and IT security review.',
    },
    {
      id: 'hr-people',
      category: 'HR & People',
      confidence: 'medium',
      rationale: 'People diligence is present in the advisor checklist but not represented in the current file room structure.',
    },
  ],
  folderSuggestions: [
    { opId: 'create-tax-documents', parentPath: 'Americas Data', name: 'Tax Documents', gapId: 'tax', defaultChecked: true },
    {
      opId: 'create-customer-contracts',
      parentPath: 'Americas Data',
      name: 'Customer Contracts',
      gapId: 'contracts',
      defaultChecked: true,
    },
    { opId: 'create-technology-ip', parentPath: 'Americas Data', name: 'Technology & IP', gapId: 'tech-ip', defaultChecked: false },
    { opId: 'create-hr-people', parentPath: 'Americas Data', name: 'HR & People', gapId: 'hr-people', defaultChecked: false },
  ],
  evidence: [
    {
      opId: 'create-tax-documents',
      source: 'deal_advisor_baseline',
      text: '13 of 14 comparable software sell-side rooms separated income tax, sales tax, and transfer-pricing materials.',
      benchmarkN: 14,
    },
    {
      opId: 'create-customer-contracts',
      source: 'blueflame_search',
      text: 'Customer agreements appear in Contracts and Sample Files, but there is no buyer-facing customer-contract folder.',
    },
    {
      opId: 'create-technology-ip',
      source: 'insights_ml',
      text: 'Engineering, patent, and open-source review terms are referenced in diligence notes without a matching folder.',
    },
    {
      opId: 'create-hr-people',
      source: 'deal_advisor_baseline',
      text: 'People diligence is commonly isolated for management presentations and employment-contract review.',
      benchmarkN: 14,
    },
  ],
};

const runCardSteps = [
  { label: 'Reading folder structure', subtitle: 'Names, publication status, and empty sections', durationMs: 800 },
  { label: 'Comparing against benchmark', subtitle: 'Software sell-side rooms with similar buyer scope', durationMs: 900 },
  { label: 'Finding coverage gaps', subtitle: 'Tax, contracts, technology, and people diligence', durationMs: 950 },
  { label: 'Preparing suggestions', subtitle: 'Folder paths, confidence, and supporting evidence', durationMs: 850 },
] as const;

const freeBenchmarkPreview = {
  coverage: 71,
  gaps: 5,
  summary: '2 high-severity, 2 medium-severity gaps vs 187 comparable Healthcare sell-side M&A rooms.',
  visibleGaps: [
    { severity: 'High', label: 'Tax / State and Local Tax Filings' },
    { severity: 'High', label: 'Regulatory / FDA Correspondence' },
    { severity: 'Medium', label: 'Compliance / HIPAA Audit Reports' },
  ],
  hiddenCount: 2,
} as const;

function FaIcon({ icon, size = 15, color }: { icon: IconDefinition; size?: number; color?: string }) {
  return <FontAwesomeIcon icon={icon} style={{ width: size, height: size, color }} />;
}

function AiMark({ size = 24 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: amber[600],
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <FontAwesomeIcon icon={faAiSparkle as unknown as IconProp} style={{ width: size * 0.62, height: size * 0.62 }} />
    </Box>
  );
}

function folderIdFromPath(path: string) {
  return path.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function stripIndexPrefix(name: string): string {
  return name.replace(/^\(\d+\)\s*/, '');
}

function insertRowsUnderParent(rows: FileroomRow[], createdRows: FileroomRow[]) {
  if (!createdRows.length) return rows;
  const parentId = createdRows[0].parentId;
  let insertAt = rows.findIndex((row) => row.id === parentId);
  rows.forEach((row, index) => {
    if (row.parentId === parentId) insertAt = index;
  });
  if (insertAt < 0) return [...rows, ...createdRows];
  return [...rows.slice(0, insertAt + 1), ...createdRows, ...rows.slice(insertAt + 1)];
}

function statusSx(status: FileroomStatus) {
  if (status === 'Published') {
    return { color: jade[700], bgcolor: alpha(jade[600], 0.1), borderColor: alpha(jade[600], 0.24) };
  }
  if (status === 'Partially Published') {
    return { color: amber[700], bgcolor: alpha(amber[600], 0.1), borderColor: alpha(amber[600], 0.24) };
  }
  return { color: moondust[700], bgcolor: moondust[100], borderColor: moondust[200] };
}

function severityColor(confidence: RecommendationGap['confidence']) {
  if (confidence === 'high') return ruby[600];
  if (confidence === 'medium') return amber[600];
  return tanzanite[500];
}

function severityChipColor(severity: string): 'error' | 'warning' | 'default' {
  if (severity === 'High') return 'error';
  if (severity === 'Medium') return 'warning';
  return 'default';
}

function evidenceSourceLabel(source: EvidenceSource) {
  if (source === 'blueflame_search') return 'BlueFlame search';
  if (source === 'deal_advisor_baseline') return 'Deal Advisor baseline';
  return 'Insights ML';
}

function formatDuration(ms?: number) {
  if (!ms) return 'complete';
  return `${(ms / 1000).toFixed(1)}s`;
}

function EntitlementControl({
  entitlementMode,
  onEntitlementChange,
}: {
  entitlementMode: EntitlementMode;
  onEntitlementChange: (mode: EntitlementMode) => void;
}) {
  return (
    <ButtonGroup size="small" variant="outlined" aria-label="Entitlement mode">
      <Button
        variant={entitlementMode === 'datasite_ai' ? 'contained' : 'outlined'}
        onClick={() => onEntitlementChange('datasite_ai')}
        startIcon={<FaIcon icon={faSparkles} size={13} />}
      >
        AI
      </Button>
      <Button
        variant={entitlementMode === 'free' ? 'contained' : 'outlined'}
        onClick={() => onEntitlementChange('free')}
        startIcon={<FaIcon icon={faLock} size={13} />}
      >
        Free
      </Button>
    </ButtonGroup>
  );
}

function FolderPanel({
  rows,
  activeFolderPath,
  onSelectFolder,
}: {
  rows: FileroomRow[];
  activeFolderPath: string | null;
  onSelectFolder: (path: string | null) => void;
}) {
  const americasChildren = rows.filter((row) => row.parentId === 'americas-data');
  const aiCreatedCount = rows.filter((row) => row.source === 'ai-created').length;

  return (
    <Box
      aria-label="Folders and shortcuts"
      sx={{
        width: FOLDER_PANEL_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Folders & shortcuts
          </Typography>
          <Tooltip title="Folder settings" arrow>
            <IconButton size="small" aria-label="Folder settings">
              <FaIcon icon={faSliders} size={14} />
            </IconButton>
          </Tooltip>
        </Stack>
        <TextField
          size="small"
          placeholder="Search folders"
          fullWidth
          sx={{ mt: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FaIcon icon={faMagnifyingGlass} size={13} color={moondust[500]} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Divider />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 1 }}>
        <List dense disablePadding>
          {[
            { label: 'All documents', icon: faTableColumns, value: null },
            { label: 'Recently added', icon: faClockRotateLeft, value: null },
            { label: 'Needs review', icon: faTriangleExclamation, value: null },
          ].map((shortcut) => (
            <ListItemButton key={shortcut.label} dense selected={!activeFolderPath && shortcut.label === 'All documents'} onClick={() => onSelectFolder(shortcut.value)}>
              <ListItemIcon sx={{ minWidth: 30, color: 'text.secondary' }}>
                <FaIcon icon={shortcut.icon} size={14} />
              </ListItemIcon>
              <ListItemText primary={shortcut.label} primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 1 }} />
        <List dense disablePadding>
          <ListItemButton dense selected={activeFolderPath === 'Americas Data'} onClick={() => onSelectFolder('Americas Data')}>
            <ListItemIcon sx={{ minWidth: 30, color: citrine[700] }}>
              <FaIcon icon={activeFolderPath === 'Americas Data' ? faFolderOpen : faFolder} size={15} />
            </ListItemIcon>
            <ListItemText
              primary="Americas Data"
              secondary={`${americasChildren.length} child folders`}
              primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}
              secondaryTypographyProps={{ fontSize: 12 }}
            />
            {aiCreatedCount > 0 && <Chip label={`${aiCreatedCount} new`} size="small" sx={{ height: 20 }} />}
          </ListItemButton>
          <Box sx={{ pl: 4.5, pr: 1 }}>
            {americasChildren.map((row) => (
              <Stack
                key={row.id}
                direction="row"
                alignItems="center"
                spacing={0.75}
                sx={{ minHeight: 28, borderRadius: 1, px: 0.75, color: 'text.secondary' }}
              >
                <FaIcon icon={faFolder} size={12} color={row.source === 'ai-created' ? jade[600] : moondust[500]} />
                <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                  {stripIndexPrefix(row.name)}
                </Typography>
                {row.source === 'ai-created' && <Chip label="New" size="small" color="success" variant="outlined" sx={{ height: 18 }} />}
              </Stack>
            ))}
          </Box>
        </List>
      </Box>
    </Box>
  );
}

function DocumentsToolbar({ onReview }: { onReview: () => void }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ minHeight: 58, px: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button variant="contained" startIcon={<FaIcon icon={faPlus} size={13} />}>
          Add
        </Button>
        <Button variant="outlined" startIcon={<FaIcon icon={faFolderPlus} size={13} />}>
          New folder
        </Button>
        <Button variant="outlined" startIcon={<FaIcon icon={faFilter} size={13} />}>
          Filter
        </Button>
      </Stack>
      <Button
        variant="outlined"
        onClick={onReview}
        startIcon={
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <FaIcon icon={faFolder} size={14} />
            <FaIcon icon={faSparkles} size={11} color={amber[600]} />
          </Box>
        }
        sx={{
          borderColor: alpha(amber[600], 0.7),
          '&:hover': { borderColor: amber[700], bgcolor: 'background.sandbox' },
        }}
      >
        Review AI
      </Button>
    </Stack>
  );
}

function DocumentsGrid({
  rows,
  activeFolderPath,
  onBackToRoot,
}: {
  rows: FileroomRow[];
  activeFolderPath: string | null;
  onBackToRoot: () => void;
}) {
  const visibleRows = activeFolderPath
    ? rows.filter((row) => row.parentId === folderIdFromPath(activeFolderPath))
    : rows.filter((row) => !row.parentId);

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {activeFolderPath && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
          <Breadcrumbs sx={{ fontSize: 13 }}>
            <Button variant="text" size="small" onClick={onBackToRoot} sx={{ px: 0 }}>
              Documents
            </Button>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <FaIcon icon={faFolderOpen} size={13} color={citrine[700]} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {activeFolderPath}
              </Typography>
            </Stack>
          </Breadcrumbs>
          <Chip label={`${visibleRows.length} folders`} size="small" />
        </Stack>
      )}
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table stickyHeader size="small" aria-label="Documents grid">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell width={150}>Status</TableCell>
              <TableCell width={130}>Type</TableCell>
              <TableCell width={120} align="right">Documents</TableCell>
              <TableCell width={190}>Date available</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  bgcolor: row.source === 'ai-created' ? alpha(jade[600], 0.04) : 'inherit',
                  '& td': { borderColor: 'divider' },
                }}
              >
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ color: row.source === 'ai-created' ? jade[600] : citrine[700], display: 'flex' }}>
                      <FaIcon icon={faFolder} size={15} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {row.name}
                      </Typography>
                      {row.parentPath && (
                        <Typography variant="caption" color="text.secondary">
                          {row.parentPath} / {stripIndexPrefix(row.name)}
                        </Typography>
                      )}
                    </Box>
                    {row.source === 'ai-created' && <Chip label="Created by AI" size="small" color="success" variant="outlined" sx={{ height: 20 }} />}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontWeight: 600, ...statusSx(row.status) }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={0.75} color="text.secondary">
                    <FaIcon icon={faFileLines} size={13} />
                    <Typography variant="body2">Folder</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">{row.documents ?? 0}</TableCell>
                <TableCell>
                  <Typography variant="body2" color={row.source === 'ai-created' ? 'success.main' : 'text.secondary'}>
                    {row.dateAvailable}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function SidecarHeader({
  fullscreen,
  onToggleFullscreen,
  onReset,
}: {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onReset: () => void;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 52, px: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
      <IconButton size="small" aria-label="Sidecar menu">
        <FaIcon icon={faBars} size={14} />
      </IconButton>
      <AiMark size={24} />
      <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 700 }}>
        Datasite AI
      </Typography>
      <Tooltip title="New chat" arrow>
        <IconButton size="small" aria-label="New chat" onClick={onReset}>
          <FaIcon icon={faPlus} size={14} />
        </IconButton>
      </Tooltip>
      <Tooltip title={fullscreen ? 'Exit full screen' : 'Full screen'} arrow>
        <IconButton size="small" aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} onClick={onToggleFullscreen}>
          <FaIcon icon={faUpRightAndDownLeftFromCenter} size={13} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function ChatBubble({ role, children }: { role: SidecarMessage['role']; children: ReactNode }) {
  const isUser = role === 'user';
  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: isUser ? '82%' : '100%',
          borderRadius: isUser ? '12px 12px 2px 12px' : 0,
          bgcolor: isUser ? 'action.selected' : 'transparent',
          px: isUser ? 1.5 : 0,
          py: isUser ? 1 : 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function HaloInlineCard({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  return (
    <Card variant="outlined" aria-label={ariaLabel} sx={{ borderColor: 'divider', boxShadow: 'none' }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>{children}</CardContent>
    </Card>
  );
}

function ChatWelcomeCard({ onReview }: { onReview: () => void }) {
  return (
    <Stack alignItems="center" spacing={3} sx={{ px: 2, pt: 9, textAlign: 'center' }}>
      <AiMark size={42} />
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 300 }}>
          Hello, Paza
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Ask me to inspect this room, compare it to a benchmark, and create the missing folder structure.
        </Typography>
      </Box>
      <Stack spacing={1} sx={{ width: '100%' }}>
        {['Review folder structure', 'Find missing diligence categories', 'Suggest unpublished folders'].map((label, index) => (
          <Button key={label} variant={index === 0 ? 'contained' : 'outlined'} onClick={onReview} sx={{ justifyContent: 'flex-start' }}>
            {label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}

function RunCard({ message, onStop, onResume }: { message: Extract<SidecarMessage, { kind: 'thinking' }>; onStop: () => void; onResume: (prompt: string) => void }) {
  const progress = message.status === 'done' ? 100 : Math.min(100, (message.activeStepIndex / runCardSteps.length) * 100);

  if (message.status === 'canceled') {
    return (
      <HaloInlineCard ariaLabel="Canceled folder review">
        <Stack spacing={1.5}>
          <Alert severity="warning" variant="outlined">
            Review stopped before suggestions were generated.
          </Alert>
          <Button size="small" variant="contained" onClick={() => onResume(message.prompt)}>
            Resume review
          </Button>
        </Stack>
      </HaloInlineCard>
    );
  }

  return (
    <HaloInlineCard ariaLabel="Folder review progress">
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {message.status === 'done' ? <FaIcon icon={faCircleCheck} color={jade[700]} /> : <AiMark size={22} />}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {message.status === 'done' ? 'Review complete' : 'Reviewing folder structure'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {message.status === 'done' ? formatDuration(message.durationMs) : runCardSteps[message.activeStepIndex]?.label}
            </Typography>
          </Box>
          {message.status === 'running' && (
            <Button size="small" variant="text" onClick={onStop}>
              Stop
            </Button>
          )}
        </Stack>
        <LinearProgress variant="determinate" value={progress} color="info" />
        <Stack spacing={1}>
          {runCardSteps.map((step, index) => {
            const done = message.status === 'done' || index < message.activeStepIndex;
            const active = message.status === 'running' && index === message.activeStepIndex;
            return (
              <Stack key={step.label} direction="row" spacing={1} alignItems="flex-start">
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: done ? jade[600] : active ? tanzanite[600] : 'divider',
                    bgcolor: done ? alpha(jade[600], 0.12) : active ? alpha(tanzanite[600], 0.1) : 'background.paper',
                    color: done ? jade[700] : active ? tanzanite[700] : 'text.disabled',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  {done ? <FaIcon icon={faCheck} size={10} /> : <Typography variant="caption">{index + 1}</Typography>}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: active ? 700 : 500 }}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.subtitle}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </HaloInlineCard>
  );
}

function FreeBenchmarkPreview({ onUnlockAi, unlocked }: { onUnlockAi: () => void; unlocked: boolean }) {
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);

  return (
    <>
      <Stack spacing={2}>
        {unlocked && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              bgcolor: alpha(jade[600], 0.08),
              color: jade[700],
            }}
          >
            <FaIcon icon={faCheck} size={12} color={jade[700]} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Unlocked with Datasite AI
            </Typography>
          </Stack>
        )}

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {freeBenchmarkPreview.coverage}% benchmark coverage
            </Typography>
            <Chip label={`${freeBenchmarkPreview.gaps} gaps`} size="small" variant="outlined" color="warning" />
          </Stack>
          <LinearProgress variant="determinate" value={freeBenchmarkPreview.coverage} color="warning" sx={{ mt: 2 }} />
        </Box>

        <Typography variant="body2" color="text.secondary">
          {freeBenchmarkPreview.summary}
        </Typography>

        <Stack spacing={0.75}>
          {freeBenchmarkPreview.visibleGaps.map((gap) => (
            <Stack key={gap.label} direction="row" spacing={1} alignItems="center">
              <Chip label={gap.severity} size="small" color={severityChipColor(gap.severity)} />
              <Typography variant="body2">{gap.label}</Typography>
            </Stack>
          ))}
          <Typography variant="body2" color="text.secondary">
            +{freeBenchmarkPreview.hiddenCount} more
          </Typography>
        </Stack>

        {!unlocked && (
          <>
            <Divider />
            <Alert severity="info" variant="outlined" icon={<FaIcon icon={faCircleInfo} />}>
              Upgrade to Datasite AI to review and apply suggested folders in one click. Free admins see the gap count only.
            </Alert>
            <Button variant="contained" onClick={() => setUnlockDialogOpen(true)} startIcon={<FaIcon icon={faLock} size={13} />}>
              Unlock with Datasite AI
            </Button>
          </>
        )}
      </Stack>

      <Dialog open={unlockDialogOpen} onClose={() => setUnlockDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Unlock Datasite AI?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Continue to unlock folder recommendations, supporting evidence, and one-click creation for this room.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setUnlockDialogOpen(false);
              onUnlockAi();
            }}
          >
            Continue to unlock
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function FolderSuggestionInlineCard({
  entitlementMode,
  selected,
  onToggle,
  onApply,
  applied,
}: {
  entitlementMode: EntitlementMode;
  selected: Set<string>;
  onToggle: (opId: string) => void;
  onApply: () => void;
  applied?: { opIds: string[] };
}) {
  const evidenceByOp = useMemo(() => new Map(recommendation.evidence.map((item) => [item.opId, item])), []);
  const gapById = useMemo(() => new Map(recommendation.gaps.map((gap) => [gap.id, gap])), []);
  const [expandedOpId, setExpandedOpId] = useState<string | null>(null);
  const selectedCount = selected.size;
  const showsEvidence = entitlementMode === 'datasite_ai';
  const canApply = entitlementMode === 'datasite_ai';
  const appliedOpIds = applied?.opIds ?? [];
  const isApplied = Boolean(applied);
  const visibleSuggestions = isApplied
    ? recommendation.folderSuggestions.filter((suggestion) => appliedOpIds.includes(suggestion.opId))
    : recommendation.folderSuggestions;

  return (
    <HaloInlineCard ariaLabel="Folder recommendations">
      <Stack spacing={1.5}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Suggestions
            </Typography>
            <Chip
              size="small"
              label={isApplied ? `Created ${appliedOpIds.length}` : `${recommendation.folderSuggestions.length} suggested - ${selectedCount} selected`}
              color={isApplied ? 'success' : 'default'}
              sx={{ height: 21 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Coverage {recommendation.coverage.score}% - {recommendation.gaps.length} gaps - {recommendation.coverage.benchmark.industry}{' '}
            {recommendation.coverage.benchmark.dealType.toLowerCase()} - n={recommendation.coverage.benchmark.n}
          </Typography>
        </Box>

        <Stack component="section" aria-label="Folder suggestions" spacing={1} sx={{ maxHeight: 410, overflowY: 'auto', pr: 0.5 }}>
          {visibleSuggestions.map((suggestion) => {
            const gap = gapById.get(suggestion.gapId);
            const evidence = evidenceByOp.get(suggestion.opId);
            const checked = selected.has(suggestion.opId);
            const expanded = expandedOpId === suggestion.opId;

            return (
              <Box
                key={suggestion.opId}
                component="article"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor: isApplied
                    ? alpha(jade[600], 0.4)
                    : checked
                      ? alpha(tanzanite[600], 0.4)
                      : 'divider',
                  bgcolor: isApplied
                    ? alpha(jade[600], 0.04)
                    : checked
                      ? alpha(tanzanite[600], 0.04)
                      : 'background.paper',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {isApplied ? (
                    <Box sx={{ width: 24, height: 24, display: 'grid', placeItems: 'center', color: jade[700] }}>
                      <FaIcon icon={faCheck} size={12} />
                    </Box>
                  ) : (
                    <Checkbox checked={checked} onChange={() => onToggle(suggestion.opId)} inputProps={{ 'aria-label': `Select ${suggestion.name}` }} sx={{ p: 0.25 }} />
                  )}
                  <Box
                    aria-label={`${gap?.confidence ?? 'medium'} confidence`}
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: severityColor(gap?.confidence ?? 'medium'), flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {suggestion.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {suggestion.parentPath} / {suggestion.name}
                    </Typography>
                  </Box>
                  {!isApplied && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setExpandedOpId((id) => (id === suggestion.opId ? null : suggestion.opId))}
                      aria-expanded={expanded}
                      endIcon={
                        <Box sx={{ display: 'flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                          <FaIcon icon={faChevronDown} size={10} />
                        </Box>
                      }
                    >
                      Why?
                    </Button>
                  )}
                </Stack>

                <Collapse in={!isApplied && expanded} unmountOnExit>
                  <Box sx={{ mt: 1, ml: 5, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ mb: 0.75 }}>
                      {gap?.rationale}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 0.75 }}>
                      <Chip size="small" label="Index" variant="outlined" />
                      <Chip size="small" label="Benchmark" variant="outlined" />
                      {showsEvidence && evidence?.source === 'blueflame_search' && <Chip size="small" label="BlueFlame" color="info" variant="outlined" />}
                    </Stack>
                    {showsEvidence ? (
                      <Stack direction="row" spacing={0.75} alignItems="flex-start">
                        <FaIcon icon={faCircleInfo} size={11} color={moondust[500]} />
                        <Typography variant="caption" color="text.secondary">
                          {evidence ? evidenceSourceLabel(evidence.source) : 'Evidence'}: {evidence?.text}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <FaIcon icon={faLock} color={moondust[600]} />
                        <Typography variant="body2" color="text.secondary">
                          Upgrade to see why Datasite AI recommends this.
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Stack>

        <Divider />
        {isApplied ? (
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <FaIcon icon={faCheck} size={12} color={jade[700]} />
            <Typography variant="caption" color="text.secondary">
              Created as Not Published folders - reversible
            </Typography>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <FaIcon icon={faCircleInfo} size={12} color={moondust[600]} />
              <Typography variant="caption" color="text.secondary">
                Folders created as Not Published - reversible
              </Typography>
            </Stack>
            <Button variant="contained" size="small" disabled={!canApply || selectedCount === 0} onClick={onApply}>
              {canApply ? 'Create' : 'Unlock to create'}
            </Button>
          </Stack>
        )}
      </Stack>
    </HaloInlineCard>
  );
}

function ApplyingChangesCard({ message }: { message: Extract<SidecarMessage, { kind: 'applyingChanges' }> }) {
  const [expanded, setExpanded] = useState(false);
  const running = message.status === 'running';

  return (
    <HaloInlineCard ariaLabel={running ? 'Creating folders' : 'Folder creation trace'}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: running ? 'background.paper' : alpha(jade[600], 0.14),
              border: running ? '1px solid' : 0,
              borderColor: 'divider',
              color: jade[700],
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {running ? <LinearProgress sx={{ width: 14 }} /> : <FaIcon icon={faCheck} size={12} />}
          </Box>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 700 }}>
            {running
              ? `Creating ${message.folderNames.length} ${message.folderNames.length === 1 ? 'folder' : 'folders'} in Americas Data`
              : `Created ${message.folderNames.length} ${message.folderNames.length === 1 ? 'folder' : 'folders'} - ${formatDuration(message.durationMs)}`}
          </Typography>
          {!running && (
            <IconButton size="small" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Collapse trace' : 'Expand trace'}>
              <Box sx={{ display: 'flex', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}>
                <FaIcon icon={faChevronDown} size={12} />
              </Box>
            </IconButton>
          )}
        </Stack>
        {(running || expanded) && (
          <Stack spacing={0.25} sx={{ ml: 4 }}>
            {message.folderNames.map((name) => (
              <Typography key={name} variant="caption" color="text.secondary">
                + {name}
              </Typography>
            ))}
          </Stack>
        )}
      </Stack>
    </HaloInlineCard>
  );
}

function CreatedResultCard({ suggestions }: { suggestions: FolderSuggestion[] }) {
  return (
    <HaloInlineCard ariaLabel="Folder creation result">
      <Stack spacing={1.5}>
        <Alert severity="success" variant="outlined">
          Selected folders were added as unpublished folders.
        </Alert>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {suggestions.length} unpublished {suggestions.length === 1 ? 'folder' : 'folders'} created inside Americas Data
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {suggestions.map((suggestion) => (
              <Stack key={suggestion.opId} direction="row" spacing={1} alignItems="center">
                <FaIcon icon={faFolder} color={jade[600]} />
                <Typography variant="body2">
                  {suggestion.parentPath} / {suggestion.name}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Next actions
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {['Find documents for these folders', 'Draft request list for missing documents', 'Run Legal advisor review'].map((action) => (
              <Button key={action} variant="outlined" size="small" sx={{ justifyContent: 'flex-start' }}>
                {action}
              </Button>
            ))}
          </Stack>
        </Box>
      </Stack>
    </HaloInlineCard>
  );
}

function DatasiteAiSidecar({
  entitlementMode,
  messages,
  draft,
  selected,
  fullscreen,
  onToggleFullscreen,
  onStartReview,
  onStopReview,
  onResumeReview,
  onUnlockAi,
  onToggleSuggestion,
  onApplySelected,
  onReset,
  onDraftChange,
  onSubmitDraft,
}: {
  entitlementMode: EntitlementMode;
  messages: SidecarMessage[];
  draft: string;
  selected: Set<string>;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onStartReview: () => void;
  onStopReview: () => void;
  onResumeReview: (prompt: string) => void;
  onUnlockAi: () => void;
  onToggleSuggestion: (opId: string) => void;
  onApplySelected: () => void;
  onReset: () => void;
  onDraftChange: (value: string) => void;
  onSubmitDraft: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, fullscreen]);

  function renderMessage(message: SidecarMessage) {
    if (message.kind === 'text' || message.kind === 'assistantText') {
      return <Typography variant="body2">{message.text}</Typography>;
    }
    if (message.kind === 'thinking') {
      return <RunCard message={message} onStop={onStopReview} onResume={onResumeReview} />;
    }
    if (message.kind === 'freePreview') {
      return (
        <HaloInlineCard ariaLabel="Free benchmark preview">
          <FreeBenchmarkPreview onUnlockAi={onUnlockAi} unlocked={entitlementMode === 'datasite_ai'} />
        </HaloInlineCard>
      );
    }
    if (message.kind === 'folderSuggestions') {
      return (
        <FolderSuggestionInlineCard
          entitlementMode={entitlementMode}
          selected={selected}
          onToggle={onToggleSuggestion}
          onApply={onApplySelected}
          applied={message.applied}
        />
      );
    }
    if (message.kind === 'applyingChanges') return <ApplyingChangesCard message={message} />;
    if (message.kind === 'createdResult') return <CreatedResultCard suggestions={message.suggestions} />;
    return null;
  }

  return (
    <Box
      sx={
        fullscreen
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 6,
              bgcolor: 'background.paper',
              display: 'flex',
            }
          : {
              width: SIDECAR_WIDTH,
              flexShrink: 0,
              borderLeft: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
            }
      }
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <SidecarHeader fullscreen={fullscreen} onToggleFullscreen={onToggleFullscreen} onReset={onReset} />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 2, px: fullscreen ? 'clamp(24px, 8vw, 96px)' : 2 }}>
          {messages.length === 0 ? (
            <ChatWelcomeCard onReview={onStartReview} />
          ) : (
            <Stack spacing={2}>
              {messages.map((message) => (
                <ChatBubble key={message.id} role={message.role}>
                  {renderMessage(message)}
                </ChatBubble>
              ))}
              <Box ref={messagesEndRef} />
            </Stack>
          )}
        </Box>
        <Box sx={{ borderTop: 1, borderColor: 'divider', py: 1.5, px: fullscreen ? 'clamp(24px, 8vw, 96px)' : 1.5 }}>
          <Box component="form" onSubmit={onSubmitDraft}>
            <TextField
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Ask me anything"
              aria-label="Ask Datasite AI"
              variant="outlined"
              size="small"
              fullWidth
              multiline
              maxRows={4}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.closest('form')?.requestSubmit();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-end', mb: 0.25 }}>
                    <IconButton aria-label="send" type="submit" disabled={!draft.trim()}>
                      <FaIcon icon={faPaperPlane} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { minHeight: 54, alignItems: 'flex-start', pr: 0.5 } }}
            />
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1, color: 'text.secondary' }}>
            <FaIcon icon={faSparkles} size={14} />
            <Typography variant="caption">Powered by BlueFlame AI. Always review for accuracy.</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default function FolderIntelligencePosc() {
  const [entitlementMode, setEntitlementMode] = useState<EntitlementMode>('datasite_ai');
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(recommendation.folderSuggestions.filter((item) => item.defaultChecked).map((item) => item.opId)),
  );
  const [rows, setRows] = useState<FileroomRow[]>(initialFilerooms);
  const [activeFolderPath, setActiveFolderPath] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastCreatedIds, setLastCreatedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<SidecarMessage[]>([]);
  const [sidecarFullscreen, setSidecarFullscreen] = useState(false);
  const messageCounter = useRef(0);
  const reviewTimerRef = useRef<{ thinkingId: string; timeoutId: number } | null>(null);

  const navItems = useMemo(
    () => diligenceNavItems.map((item) => ({ ...item, active: item.label === 'Documents' })),
    [],
  );

  const selectedSuggestions = recommendation.folderSuggestions.filter((item) => selected.has(item.opId));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'locked') {
      setEntitlementMode('free');
      setMessages([{ id: nextMessageId('free-preview'), role: 'assistant', kind: 'freePreview' }]);
    }
    return () => clearReviewTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextMessageId(prefix: string) {
    messageCounter.current += 1;
    return `${prefix}-${messageCounter.current}`;
  }

  function appendMessages(nextMessages: SidecarMessage[]) {
    setMessages((prev) => [...prev, ...nextMessages]);
  }

  function clearReviewTimer() {
    if (reviewTimerRef.current?.timeoutId) {
      window.clearTimeout(reviewTimerRef.current.timeoutId);
    }
    reviewTimerRef.current = null;
  }

  function showFreeLockedPreview() {
    clearReviewTimer();
    setEntitlementMode('free');
    setDraft('');
    setMessages([{ id: nextMessageId('free-preview'), role: 'assistant', kind: 'freePreview' }]);
  }

  function handleEntitlementChange(nextMode: EntitlementMode) {
    if (nextMode === 'free') {
      showFreeLockedPreview();
      return;
    }
    if (entitlementMode === 'free' && messages.some((message) => message.kind === 'freePreview')) {
      unlockAiReview();
      return;
    }
    setEntitlementMode('datasite_ai');
  }

  function advanceReview(stage: number, thinkingId: string, mode: EntitlementMode) {
    if (stage >= runCardSteps.length) {
      setMessages((prev) => {
        const completed = prev.map((message) =>
          message.id === thinkingId && message.kind === 'thinking'
            ? { ...message, status: 'done' as const, activeStepIndex: runCardSteps.length, durationMs: Date.now() - message.startedAt }
            : message,
        );
        const next: SidecarMessage[] =
          mode === 'free'
            ? [{ id: nextMessageId('free-preview'), role: 'assistant', kind: 'freePreview' }]
            : [{ id: nextMessageId('folder-suggestions'), role: 'assistant', kind: 'folderSuggestions' }];
        return [...completed, ...next];
      });
      reviewTimerRef.current = null;
      return;
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === thinkingId && message.kind === 'thinking' ? { ...message, activeStepIndex: stage } : message,
      ),
    );
    const timeoutId = window.setTimeout(() => advanceReview(stage + 1, thinkingId, mode), runCardSteps[stage]?.durationMs ?? 800);
    reviewTimerRef.current = { thinkingId, timeoutId };
  }

  function startReview(prompt = 'Review folder structure', reviewMode: EntitlementMode = entitlementMode, includeUserEcho = true) {
    clearReviewTimer();
    const thinkingId = nextMessageId('thinking');
    const startedAt = Date.now();
    const reviewMessages: SidecarMessage[] = [
      ...(includeUserEcho ? [{ id: nextMessageId('user'), role: 'user' as const, kind: 'text' as const, text: prompt }] : []),
      { id: thinkingId, role: 'assistant', kind: 'thinking', activeStepIndex: 0, status: 'running', startedAt, prompt },
    ];
    appendMessages(reviewMessages);
    const timeoutId = window.setTimeout(() => advanceReview(1, thinkingId, reviewMode), runCardSteps[0]?.durationMs ?? 800);
    reviewTimerRef.current = { thinkingId, timeoutId };
  }

  function stopReview() {
    if (!reviewTimerRef.current) return;
    const { thinkingId } = reviewTimerRef.current;
    clearReviewTimer();
    setMessages((prev) =>
      prev.map((message) =>
        message.id === thinkingId && message.kind === 'thinking'
          ? { ...message, status: 'canceled' as const, durationMs: Date.now() - message.startedAt }
          : message,
      ),
    );
  }

  function resetFlow() {
    clearReviewTimer();
    setActiveFolderPath(null);
    setDraft('');
    setSelected(new Set(recommendation.folderSuggestions.filter((item) => item.defaultChecked).map((item) => item.opId)));
    setMessages([]);
  }

  function toggleSuggestion(opId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opId)) next.delete(opId);
      else next.add(opId);
      return next;
    });
  }

  function applySelected() {
    if (entitlementMode !== 'datasite_ai') {
      showFreeLockedPreview();
      return;
    }
    if (selectedSuggestions.length === 0) return;
    const folderNames = selectedSuggestions.map((suggestion) => suggestion.name);
    const opIds = selectedSuggestions.map((suggestion) => suggestion.opId);
    const applyingId = nextMessageId('applying-changes');
    const startedAt = Date.now();
    const echoText =
      folderNames.length === 1
        ? `Create selected folder: ${folderNames[0]}`
        : `Create ${folderNames.length} selected folders: ${folderNames.join(', ')}`;

    setMessages((prev) => {
      let lastSuggestionsIdx = -1;
      for (let i = prev.length - 1; i >= 0; i -= 1) {
        if (prev[i].kind === 'folderSuggestions' && !(prev[i] as Extract<SidecarMessage, { kind: 'folderSuggestions' }>).applied) {
          lastSuggestionsIdx = i;
          break;
        }
      }
      const updated = prev.map((message, index) =>
        index === lastSuggestionsIdx && message.kind === 'folderSuggestions' ? { ...message, applied: { opIds } } : message,
      );
      return [
        ...updated,
        { id: nextMessageId('user'), role: 'user', kind: 'text', text: echoText },
        { id: applyingId, role: 'assistant', kind: 'applyingChanges', status: 'running', folderNames, startedAt },
      ];
    });

    const capturedSuggestions = selectedSuggestions;
    const createdRows: FileroomRow[] = capturedSuggestions.map((suggestion) => ({
      id: `created-${suggestion.opId}`,
      name: suggestion.name,
      status: 'Not Published',
      dateAvailable: 'Created by Datasite AI',
      source: 'ai-created',
      parentId: folderIdFromPath(suggestion.parentPath),
      parentPath: suggestion.parentPath,
      documents: 0,
    }));
    const createdIds = createdRows.map((row) => row.id);

    window.setTimeout(() => {
      setRows((prev) => insertRowsUnderParent(prev.filter((row) => !createdIds.includes(row.id)), createdRows));
      setActiveFolderPath(capturedSuggestions[0]?.parentPath ?? null);
      setLastCreatedIds(createdIds);
      setSnackbarOpen(true);
      setMessages((prev) => {
        const flipped = prev.map((message) =>
          message.id === applyingId && message.kind === 'applyingChanges'
            ? { ...message, status: 'done' as const, durationMs: Date.now() - startedAt }
            : message,
        );
        return [...flipped, { id: nextMessageId('created-result'), role: 'assistant', kind: 'createdResult', suggestions: capturedSuggestions }];
      });
    }, 1100);
  }

  function undoCreated() {
    setRows((prev) => prev.filter((row) => !lastCreatedIds.includes(row.id)));
    setActiveFolderPath(null);
    setSnackbarOpen(false);
    setLastCreatedIds([]);
    appendMessages([
      {
        id: nextMessageId('undo-result'),
        role: 'assistant',
        kind: 'assistantText',
        text: 'Undo complete. The unpublished folders created by Datasite AI were removed from Americas Data.',
      },
    ]);
  }

  function unlockAiReview() {
    setEntitlementMode('datasite_ai');
    clearReviewTimer();
    appendMessages([{ id: nextMessageId('unlock-result'), role: 'assistant', kind: 'assistantText', text: 'Datasite AI is unlocked. Reviewing folder structure now.' }]);
    startReview('Review folder structure', 'datasite_ai', false);
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    if (/folder|structure|review|gap/i.test(value)) {
      startReview(value);
      return;
    }
    appendMessages([
      { id: nextMessageId('user'), role: 'user', kind: 'text', text: value },
      {
        id: nextMessageId('assistant'),
        role: 'assistant',
        kind: 'assistantText',
        text: 'I can help with folder structure review, suggested folder creation, and follow-up diligence actions in this room.',
      },
    ]);
  }

  return (
    <DatasitePrototypeShell
      productMode="diligence"
      projectName="Americas Data"
      navItems={navItems}
      defaultExpanded
      user={{ name: 'Paza Bahia', initials: 'PB' }}
      topBarActions={<EntitlementControl entitlementMode={entitlementMode} onEntitlementChange={handleEntitlementChange} />}
      sx={{ height: '100vh' }}
    >
      <Box sx={{ height: '100%', minHeight: 0, display: 'flex', overflow: 'hidden', position: 'relative', bgcolor: 'background.paper' }}>
        <FolderPanel rows={rows} activeFolderPath={activeFolderPath} onSelectFolder={setActiveFolderPath} />
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <DocumentsToolbar onReview={() => startReview()} />
          <DocumentsGrid rows={rows} activeFolderPath={activeFolderPath} onBackToRoot={() => setActiveFolderPath(null)} />
        </Box>
        <DatasiteAiSidecar
          entitlementMode={entitlementMode}
          messages={messages}
          draft={draft}
          selected={selected}
          fullscreen={sidecarFullscreen}
          onToggleFullscreen={() => setSidecarFullscreen((value) => !value)}
          onStartReview={() => startReview()}
          onStopReview={stopReview}
          onResumeReview={startReview}
          onUnlockAi={unlockAiReview}
          onToggleSuggestion={toggleSuggestion}
          onApplySelected={applySelected}
          onReset={resetFlow}
          onDraftChange={setDraft}
          onSubmitDraft={submitDraft}
        />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={`${lastCreatedIds.length} unpublished ${lastCreatedIds.length === 1 ? 'folder' : 'folders'} created in Americas Data`}
          action={
            <Stack direction="row" spacing={0.5}>
              <Button color="inherit" size="small" onClick={undoCreated}>
                Undo
              </Button>
              <IconButton size="small" color="inherit" aria-label="Close notification" onClick={() => setSnackbarOpen(false)}>
                <FaIcon icon={faXmark} size={12} />
              </IconButton>
            </Stack>
          }
        />
      </Box>
    </DatasitePrototypeShell>
  );
}
