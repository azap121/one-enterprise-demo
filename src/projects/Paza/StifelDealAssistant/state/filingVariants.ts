// One filing machine, three flavours (P0.1): new uploads, retro-sweep of existing files,
// and the client-drop approval queue. `WorkspaceState.filingVariant` selects the spec;
// everything else (stage machine, tree diff, approval gate) is shared.
import {
  FILING_COPY,
  FILING_HIGHLIGHTS,
  FILING_RATIONALE,
  filingSaveSteps,
  filingScenario,
  filingSteps,
} from './filingScenario';
import {
  CLIENT_DROP_COPY,
  CLIENT_DROP_HIGHLIGHTS,
  CLIENT_DROP_RATIONALE,
  clientDropSaveSteps,
  clientDropScenario,
  clientDropSteps,
} from './clientDropScenario';
import {
  RETRO_FILING_COPY,
  RETRO_FILING_HIGHLIGHTS,
  RETRO_FILING_RATIONALE,
  retroFilingSaveSteps,
  retroFilingScenario,
  retroFilingSteps,
} from './retroFilingScenario';
import type { ChangeProposal, TreeNode } from './types';

export type FilingVariant = 'uploads' | 'retro' | 'client-drop';

export type FilingChipTone = 'tanzanite' | 'jade' | 'amber' | 'moondust';

export interface FilingVariantSpec {
  copy: {
    userPrompt: string;
    formingMessage: string;
    proposalTitle: string;
    proposalSummary: string;
    reviewCta: string;
    reviewInProgressCta: string;
    reviewAppliedCta: string;
    updateCta: string;
    confirmationTitle: string;
    confirmationBody: string;
    savedTitle: string;
    savedBody: string;
    savingMessage: string;
    planHeading: string;
    planHeadingApplied: string;
  };
  chips: ReadonlyArray<{ label: string; tone: FilingChipTone }>;
  highlights: readonly string[];
  rationale: string;
  steps: ReadonlyArray<{ id: string; label: string; service: string }>;
  saveSteps: ReadonlyArray<{ id: string; label: string; service: string }>;
  breakdown: readonly string[];
  scenario: { rootName: string; nodes: TreeNode[]; proposals: ChangeProposal[] };
  sessionTitle: string;
}

export const FILING_VARIANTS: Record<FilingVariant, FilingVariantSpec> = {
  uploads: {
    copy: {
      ...FILING_COPY,
      savingMessage: 'Applying the approved filing plan and keeping held-back files in staging.',
      planHeading: 'Filing plan',
      planHeadingApplied: 'Filing plan applied',
    },
    chips: [
      { label: '14 files filed', tone: 'tanzanite' },
      { label: '2 new folders', tone: 'jade' },
      { label: '2 renames', tone: 'amber' },
      { label: '4 held for your call', tone: 'moondust' },
    ],
    highlights: FILING_HIGHLIGHTS,
    rationale: FILING_RATIONALE,
    steps: filingSteps,
    saveSteps: filingSaveSteps,
    breakdown: [
      '14 files filed into the sandbox',
      '2 new folders created',
      '2 naming-convention renames applied',
      '4 files held in staging with notes',
      'Everything remains unpublished',
    ],
    scenario: filingScenario,
    sessionTitle: 'File the latest upload',
  },
  retro: {
    copy: RETRO_FILING_COPY,
    chips: [
      { label: '5 renames', tone: 'amber' },
      { label: '2 moves', tone: 'tanzanite' },
      { label: '1 new folder', tone: 'jade' },
      { label: '47 files swept', tone: 'moondust' },
    ],
    highlights: RETRO_FILING_HIGHLIGHTS,
    rationale: RETRO_FILING_RATIONALE,
    steps: retroFilingSteps,
    saveSteps: retroFilingSaveSteps,
    breakdown: [
      '5 naming-convention renames applied',
      '2 misfiled documents moved',
      '1 new folder (05.04 Employment) created',
      'All changes on existing sandbox files',
      'Everything remains unpublished',
    ],
    scenario: retroFilingScenario,
    sessionTitle: 'Tidy the existing filing',
  },
  'client-drop': {
    copy: CLIENT_DROP_COPY,
    chips: [
      { label: '4 files filed', tone: 'tanzanite' },
      { label: '1 new folder', tone: 'jade' },
      { label: '1 gap closed', tone: 'jade' },
      { label: '2 held for your call', tone: 'moondust' },
    ],
    highlights: CLIENT_DROP_HIGHLIGHTS,
    rationale: CLIENT_DROP_RATIONALE,
    steps: clientDropSteps,
    saveSteps: clientDropSaveSteps,
    breakdown: [
      '4 client uploads filed into the sandbox',
      '1 new folder (05.03 Insurance) created',
      '2 files held in the drop folder with chase notes',
      'Client upload and banker approval recorded separately',
      'Everything remains unpublished',
    ],
    scenario: clientDropScenario,
    sessionTitle: 'Client drop review',
  },
};

export function getFilingSpec(variant: FilingVariant): FilingVariantSpec {
  return FILING_VARIANTS[variant];
}
