import { useState, type ReactNode } from 'react';
import {
  faChevronDown,
  faCircleCheck,
  faEllipsisVertical,
} from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Collapse, Snackbar, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HaloButton } from '~/theme/halo/components';
import { amber, jade, moondust, turquoise } from '~/theme/halo/theme';
import {
  INTELLIGENCE_ACTIONS,
  INTELLIGENCE_COPY,
  INTELLIGENCE_PROFILES,
  type EvidenceSnippet,
  type IntelligenceProfile,
} from '../state/intelligenceFixtures';

interface Props {
  targetId: string;
  bottomInset?: number;
}

// Intelligence view — a Grata profile in deal context, restructured into a TIERED
// hierarchy (A1 scrape). Tier 1 hero → Tier 2 seller intent → Tier 3 collapsibles.
export default function IntelligenceCanvasView({ targetId, bottomInset = 0 }: Props) {
  const profile = INTELLIGENCE_PROFILES[targetId] ?? INTELLIGENCE_PROFILES['co-gulfair'];
  const [toast, setToast] = useState<string | null>(null);

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Action bar (A1 §8) */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: 3, pt: 2.5, pb: 1.5, flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}
      >
        {INTELLIGENCE_ACTIONS.map((action) => (
          <HaloButton
            key={action.id}
            size="small"
            variant="outlined"
            disabled={'disabled' in action ? action.disabled : false}
            onClick={() => 'toast' in action && action.toast && setToast(action.toast)}
            sx={{ textTransform: 'none' }}
          >
            {action.label}
          </HaloButton>
        ))}
        <Box sx={{ flex: 1 }} />
        <HaloButton size="small" variant="text" onClick={() => setToast('More actions — for demo only')} sx={{ minWidth: 0, px: 1 }}>
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </HaloButton>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 3, pb: `calc(${bottomInset}px + 24px)` }}>
        <Stack spacing={2.5}>
          <HeroTier profile={profile} />
          <SellerIntentTier profile={profile} onMethodology={() => setToast('Methodology — for demo only')} />
          {profile.thin ? (
            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'background.defaultAlt' }}>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                Full profile enrichment (keywords, executives, evidence, comps) is available for GulfAir Mechanical in this demo.
              </Typography>
            </Box>
          ) : (
            <DetailTiers profile={profile} onToast={setToast} />
          )}
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2600}
        onClose={() => setToast(null)}
        message={toast ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// ── Tier 1: hero ──────────────────────────────────────────────────────────────
function HeroTier({ profile }: { profile: IntelligenceProfile }) {
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.25}>
        <Typography sx={{ fontSize: 22, fontWeight: 600, color: 'text.primary' }}>{profile.name}</Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>{profile.domain}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.55, pt: 0.5 }}>{profile.description}</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5 }}>
        {profile.stats.map((stat) => (
          <Box key={stat.label} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, py: 1.25, bgcolor: 'background.paper' }}>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{stat.label}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>{stat.value}</Typography>
          </Box>
        ))}
      </Box>
      {/* Annual Rev row with "Estimate" badge (A1 §2) */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5 }}>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Annual Rev</Typography>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary' }}>{profile.annualRevEstimate}</Typography>
        <Badge label="Estimate" tone="neutral" />
      </Stack>
    </Stack>
  );
}

// ── Tier 2: seller intent ───────────────────────────────────────────────────
function SellerIntentTier({ profile, onMethodology }: { profile: IntelligenceProfile; onMethodology: () => void }) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: 'background.paper' }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'text.primary' }}>Seller Intent Summary</Typography>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{profile.sellerIntentUpdated}</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography sx={{ fontSize: 30, fontWeight: 600, color: 'text.primary', lineHeight: 1 }}>{profile.sellerIntentScore}</Typography>
          <Badge label={profile.sellerIntentBadge} tone="amber" />
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Exit Readiness</Typography>
            <Badge label={profile.exitReadiness} tone="green" />
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          {profile.intentFactors.map((factor) => (
            <Stack key={factor} direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled', mt: 0.9, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>{factor}</Typography>
            </Stack>
          ))}
        </Stack>
        <Box>
          <HaloButton size="small" variant="text" onClick={onMethodology} sx={{ textTransform: 'none', px: 0, minWidth: 0 }}>
            {INTELLIGENCE_COPY.methodologyLabel}
          </HaloButton>
        </Box>
      </Stack>
    </Box>
  );
}

// ── Tier 3: collapsible sections (first open, rest collapsed) ─────────────────
function DetailTiers({ profile, onToast }: { profile: IntelligenceProfile; onToast: (message: string) => void }) {
  return (
    <Stack spacing={1.25}>
      <CollapsibleSection label="Keywords" defaultOpen>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {profile.keywords.map((keyword) => (
            <Box
              key={keyword}
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 24,
                px: 1,
                borderRadius: '999px',
                bgcolor: 'background.defaultAlt',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                fontSize: 11.5,
              }}
            >
              {keyword}
            </Box>
          ))}
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection label="Executives">
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)',
              gap: 1,
              px: 1.5,
              py: 0.9,
              bgcolor: 'background.defaultAlt',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {['Title', 'Name', 'Email'].map((header) => (
              <Typography key={header} sx={{ fontSize: 11.5, fontWeight: 650, color: 'text.secondary' }}>{header}</Typography>
            ))}
          </Box>
          {profile.executives.map((exec) => (
            <Box
              key={exec.name}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)',
                gap: 1,
                px: 1.5,
                py: 1,
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
              }}
            >
              <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{exec.title}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'text.primary' }}>{exec.name}</Typography>
              {exec.email ? (
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exec.email}
                  </Typography>
                  {exec.emailVerified ? (
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 12, color: jade[600] }} />
                  ) : null}
                </Stack>
              ) : (
                <HaloButton
                  size="small"
                  variant="outlined"
                  onClick={() => onToast('Contact enrichment submitted — for demo only')}
                  sx={{ textTransform: 'none', justifySelf: 'start' }}
                >
                  {INTELLIGENCE_COPY.enrichmentCta}
                </HaloButton>
              )}
            </Box>
          ))}
        </Box>
      </CollapsibleSection>

      <CollapsibleSection label="Evidence">
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Badge label={`${profile.evidenceHits} Website Hits`} tone="green" />
          </Stack>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.5 }}>{profile.evidenceFraming}</Typography>
          <Stack spacing={0.75}>
            {profile.evidenceSnippets.map((snippet) => (
              <EvidenceRow key={snippet.id} snippet={snippet} />
            ))}
          </Stack>
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection label="Comps">
        <Stack spacing={1.25}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Similar Companies</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.6fr) 80px 96px 96px',
                gap: 1,
                px: 1.5,
                py: 0.9,
                bgcolor: 'background.defaultAlt',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {['Company', 'Revenue', 'Employee Est', 'Annual Growth Est'].map((header) => (
                <Typography key={header} sx={{ fontSize: 11, fontWeight: 650, color: 'text.secondary' }}>{header}</Typography>
              ))}
            </Box>
            {profile.comps.map((comp) => (
              <Box
                key={comp.company}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.6fr) 80px 96px 96px',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-of-type': { borderBottom: 0 },
                }}
              >
                <Typography sx={{ fontSize: 12.5, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {comp.company}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{comp.revenue}</Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{comp.employeeEst}</Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{comp.annualGrowthEst}</Typography>
              </Box>
            ))}
          </Box>
          <Box>
            <HaloButton
              size="small"
              variant="outlined"
              onClick={() => onToast(INTELLIGENCE_COPY.compsToast)}
              sx={{ textTransform: 'none' }}
            >
              {INTELLIGENCE_COPY.compsFooterCta}
            </HaloButton>
          </Box>
        </Stack>
      </CollapsibleSection>
    </Stack>
  );
}

function EvidenceRow({ snippet }: { snippet: EvidenceSnippet }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        component="button"
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <FontAwesomeIcon
          icon={faChevronDown}
          style={{ fontSize: 11, color: moondust[500], transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 220ms cubic-bezier(0.2,0,0,1)' }}
        />
        <Typography
          sx={{
            fontSize: 12.5,
            color: 'text.secondary',
            overflow: open ? 'visible' : 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: open ? 'normal' : 'nowrap',
          }}
        >
          {open ? <HighlightedText text={snippet.text} terms={snippet.matchedTerms} /> : snippet.text}
        </Typography>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 1.5, pb: 1.25, pl: 4 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {snippet.matchedTerms.map((term) => (
              <Box
                key={term}
                component="span"
                sx={{ px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: alpha(turquoise[400], 0.2), color: turquoise[700], fontSize: 11 }}
              >
                {term}
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

// Highlights matched terms in teal within the snippet text (A1 §6).
function HighlightedText({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, index) =>
        terms.some((term) => term.toLowerCase() === part.toLowerCase()) ? (
          <Box key={index} component="span" sx={{ color: turquoise[700], fontWeight: 600 }}>
            {part}
          </Box>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

function CollapsibleSection({ label, defaultOpen = false, children }: { label: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box
        component="button"
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          border: 0,
          bgcolor: 'transparent',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography sx={{ fontSize: 13, fontWeight: 650, color: 'text.primary' }}>{label}</Typography>
        <FontAwesomeIcon
          icon={faChevronDown}
          style={{ fontSize: 12, color: moondust[500], transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 220ms cubic-bezier(0.2,0,0,1)' }}
        />
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

function Badge({ label, tone }: { label: string; tone: 'amber' | 'green' | 'neutral' }) {
  const palette =
    tone === 'amber'
      ? { bg: amber[50], fg: amber[800] }
      : tone === 'green'
        ? { bg: jade[50], fg: jade[700] }
        : { bg: 'background.defaultAlt', fg: 'text.secondary' };
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: 20,
        px: 0.9,
        borderRadius: '999px',
        bgcolor: palette.bg,
        color: palette.fg,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}
