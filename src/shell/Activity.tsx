import {
  Box,
  Card,
  CardContent,
  Container,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { registry } from '~/projects/registry';
import { HaloChip } from '~/theme/halo/components';
import { jade, tanzanite } from '~/theme/halo/theme';
import activityData from '~/data/activity.json';

type DesignerBucket = {
  commits: number;
  commitsWeek: number;
  commitsTwoWeeks: number;
  commitsMonth: number;
  lastCommit: string | null;
  recentSubjects: { subject: string; date: string }[];
  skillInvocations: number;
  skillInvocationsWeek: number;
  topSkills: { skill: string; count: number }[];
};

type ActivityData = {
  generatedAt: string;
  totalCommits: number;
  totalSkillEvents: number;
  skillsAvailable: number;
  byDesigner: Record<string, DesignerBucket>;
  daily: Record<string, number>;
  topSkillsOverall: { skill: string; count: number }[];
};

const data = activityData as ActivityData;

const DESIGNER_PALETTE = [jade[600], tanzanite[600]]; // retained for sparkline color only

function shortName(full: string): string {
  // "Annie Johnson" -> "Annie"; falls back to full string for one-word names
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? parts[0] : full;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function formatLastCommit(iso: string | null): string {
  if (!iso) return '—';
  const d = daysSince(iso);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function Sparkline({ days, max }: { days: number[]; max: number }) {
  const width = 120;
  const height = 28;
  const step = days.length > 1 ? width / (days.length - 1) : width;
  const points = days
    .map((v, i) => {
      const x = i * step;
      const y = max === 0 ? height : height - (v / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Commit activity over the last 30 days">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

function buildSparkline(daily: Record<string, number>): { days: number[]; max: number } {
  const out: number[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(daily[key] || 0);
  }
  return { days: out, max: Math.max(1, ...out) };
}

type SortKey =
  | 'active7d'
  | 'active14d'
  | 'activeAll'
  | 'recent'
  | 'alpha'
  | 'leastActive'
  | 'leastActive14d';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'active7d', label: 'Most active (7d)' },
  { value: 'active14d', label: 'Most active (14d)' },
  { value: 'activeAll', label: 'Most active (all-time)' },
  { value: 'recent', label: 'Recently active' },
  { value: 'alpha', label: 'A–Z' },
  { value: 'leastActive', label: 'Least active (7d)' },
  { value: 'leastActive14d', label: 'Least active (14d)' },
];

function sortRanked(
  entries: [string, DesignerBucket][],
  key: SortKey,
): [string, DesignerBucket][] {
  const copy = [...entries];
  switch (key) {
    case 'active7d':
      return copy.sort(
        (a, b) => b[1].commitsWeek - a[1].commitsWeek || b[1].commits - a[1].commits,
      );
    case 'active14d':
      return copy.sort(
        (a, b) => b[1].commitsTwoWeeks - a[1].commitsTwoWeeks || b[1].commits - a[1].commits,
      );
    case 'activeAll':
      return copy.sort((a, b) => b[1].commits - a[1].commits);
    case 'recent':
      return copy.sort((a, b) => {
        const ad = a[1].lastCommit ? new Date(a[1].lastCommit).getTime() : 0;
        const bd = b[1].lastCommit ? new Date(b[1].lastCommit).getTime() : 0;
        return bd - ad;
      });
    case 'alpha':
      return copy.sort((a, b) => a[0].localeCompare(b[0]));
    case 'leastActive':
      return copy.sort(
        (a, b) => a[1].commitsWeek - b[1].commitsWeek || a[1].commits - b[1].commits,
      );
    case 'leastActive14d':
      return copy.sort(
        (a, b) =>
          a[1].commitsTwoWeeks - b[1].commitsTwoWeeks || a[1].commits - b[1].commits,
      );
  }
}

export function Activity() {
  const [sort, setSort] = useState<SortKey>('active7d');
  const sparkline = buildSparkline(data.daily);

  const prototypesPerDesigner = registry.reduce<Record<string, number>>((acc, p) => {
    acc[p.designer] = (acc[p.designer] || 0) + 1;
    return acc;
  }, {});

  const ranked = sortRanked(Object.entries(data.byDesigner), sort);

  const designerColor: Record<string, string> = {};
  ranked.forEach(([name], i) => {
    void i; // palette kept for sparkline; cards no longer use per-designer color
    designerColor[name] = DESIGNER_PALETTE[i % DESIGNER_PALETTE.length];
  });

  return (
    <Box sx={{ bgcolor: 'background.defaultAlt', minHeight: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" component="h1" sx={{ mb: 0.5 }}>
            Activity
          </Typography>
          <Typography variant="h5" component="p" color="text.secondary" sx={{ fontWeight: 400 }}>
            Team contributions across the Halo OS — commits, prototypes, and skills shipped.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            Generated {new Date(data.generatedAt).toLocaleString()} · {data.totalCommits} total
            commits · {data.skillsAvailable} skills available
          </Typography>
        </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Last 30 days
            </Typography>
            <Box sx={{ color: jade[700] }}>
              <Sparkline days={sparkline.days} max={sparkline.max} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Stat label="Commits this week" value={sumByPeriod(data.byDesigner, 'commitsWeek')} />
            <Stat label="Commits this month" value={sumByPeriod(data.byDesigner, 'commitsMonth')} />
            <Stat label="Prototypes shipped" value={registry.length} />
            {data.totalSkillEvents > 0 ? (
              <Stat
                label="Skill invocations (7d)"
                value={sumByPeriod(data.byDesigner, 'skillInvocationsWeek')}
              />
            ) : (
              <Stat label="Skills available" value={data.skillsAvailable} />
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          By contributor
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sort
          </Typography>
          <Select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        }}>
        {ranked.map(([name, b]) => {
          const prototypes = prototypesPerDesigner[shortName(name)] || prototypesPerDesigner[name] || 0;
          return (
            <Card key={name} variant="outlined">
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                  {name}
                </Typography>

                {b.recentSubjects.length > 0 ? (
                  <Box sx={{ mb: 2.5, flex: 1 }}>
                    {b.recentSubjects.slice(0, 2).map((s) => (
                      <Typography
                        key={s.date + s.subject}
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                        {s.subject}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, mb: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">No recent commits.</Typography>
                  </Box>
                )}

                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <HaloChip size="small" label={`${b.commitsWeek} this week`} />
                  <HaloChip size="small" label={`${prototypes} protos`} />
                  <HaloChip size="small" label={`last: ${formatLastCommit(b.lastCommit)}`} />
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {data.topSkillsOverall.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
            Top skills (team-wide)
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ rowGap: 0.75 }}>
            {data.topSkillsOverall.map((s) => (
              <Chip
                key={s.skill}
                label={`${s.skill} · ${s.count}`}
                size="small"
                sx={{ bgcolor: tanzanite[50], color: tanzanite[700] }}
              />
            ))}
          </Stack>
        </Box>
      )}

      </Container>
    </Box>
  );
}

function Stat({ label, value, compact }: { label: string; value: number; compact?: boolean }) {
  return (
    <Box>
      <Typography
        variant={compact ? 'subtitle1' : 'h5'}
        sx={{ fontWeight: 700, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}

function sumByPeriod(
  byDesigner: Record<string, DesignerBucket>,
  key: keyof Pick<DesignerBucket, 'commitsWeek' | 'commitsMonth' | 'skillInvocationsWeek'>,
): number {
  return Object.values(byDesigner).reduce((acc, b) => acc + (b[key] as number), 0);
}
