#!/usr/bin/env node
// `npm run weekly-summary`
//
// Reads src/data/activity.json (run `npm run activity` first) and emits a
// Markdown summary of the last 7 days, suitable for pasting into the team's
// Confluence weekly update for Gary/Youjin.
//
// Output is written to weekly-summary.md and printed to stdout.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const dataPath = join(repoRoot, 'src', 'data', 'activity.json');

if (!existsSync(dataPath)) {
  console.error('[weekly-summary] no activity.json — run `npm run activity` first');
  process.exit(1);
}

const data = JSON.parse(readFileSync(dataPath, 'utf8'));

const ranked = Object.entries(data.byDesigner)
  .filter(([, b]) => b.commitsWeek > 0 || b.skillInvocationsWeek > 0)
  .sort((a, b) => b[1].commitsWeek - a[1].commitsWeek);

const totalCommitsWeek = Object.values(data.byDesigner).reduce(
  (acc, b) => acc + b.commitsWeek,
  0,
);
const totalSkillsWeek = Object.values(data.byDesigner).reduce(
  (acc, b) => acc + b.skillInvocationsWeek,
  0,
);
const activeCount = ranked.length;

const today = new Date();
const weekStart = new Date(today);
weekStart.setDate(today.getDate() - 6);
const fmt = (d) => d.toISOString().slice(0, 10);

const lines = [];
lines.push(`# Halo OS activity — week of ${fmt(weekStart)} to ${fmt(today)}`);
lines.push('');
lines.push(`Generated from \`halo-app\` repo activity on ${data.generatedAt.slice(0, 10)}.`);
lines.push('');
lines.push('## Headline numbers (last 7 days)');
lines.push('');
lines.push(`- **${totalCommitsWeek}** commits to \`halo-app\``);
lines.push(`- **${totalSkillsWeek}** Claude skill invocations logged`);
lines.push(`- **${activeCount}** contributors active this week`);
lines.push('');
lines.push('## By contributor');
lines.push('');
lines.push('| Contributor | Commits (7d) | Commits (30d) | Skill calls (7d) | Last commit |');
lines.push('|---|---:|---:|---:|---|');
for (const [name, b] of ranked) {
  const last = b.lastCommit ? b.lastCommit.slice(0, 10) : '—';
  lines.push(
    `| ${name} | ${b.commitsWeek} | ${b.commitsMonth} | ${b.skillInvocationsWeek} | ${last} |`,
  );
}

if (data.topSkillsOverall.length > 0) {
  lines.push('');
  lines.push('## Top skills (all-time)');
  lines.push('');
  for (const s of data.topSkillsOverall.slice(0, 10)) {
    lines.push(`- \`${s.skill}\` — ${s.count}`);
  }
}

lines.push('');
lines.push(`## What "commits" means here`);
lines.push('');
lines.push(
  'Every prototype in `halo-app` ships via Claude → designer review → push to main. Commit count is the most direct proxy we have for AI-assisted design work in this repo. It does not capture Cowork sessions in Figma, document writing, or exploration that didn\'t result in shipped UI.',
);
lines.push('');

const out = lines.join('\n');
const outPath = join(repoRoot, 'weekly-summary.md');
writeFileSync(outPath, out);
process.stdout.write(out);
console.error(`\n[weekly-summary] wrote ${outPath}`);
