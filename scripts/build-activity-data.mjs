#!/usr/bin/env node
// Build-time aggregator: reads `git log` + metrics/skill-usage/*.jsonl,
// writes the dashboard payload to src/data/activity.json.
// Runs as a prebuild step so the dashboard is always fresh on Jenkins deploys.

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const EMAIL_TO_DESIGNER = {
  'annie.johnson@datasite.com': 'Annie Johnson',
  '130168716+ajohnson2924@users.noreply.github.com': 'Annie Johnson',
  'joseph.machin@datasite.com': 'Joe Machin',
  'sean.kwon@datasite.com': 'Sean Kwon',
  'paza.bahia@datasite.com': 'Paza Bahia',
  'hello@paza.co': 'Paza Bahia',
  'irene.ramirez@datasite.com': 'Irene Ramirez',
  'you.lee@datasite.com': 'Youjin Lee',
  'nate.hull@datasite.com': 'Nate Hull',
  'nate.hull@merrillcorp.com': 'Nate Hull',
  'graham.zagoria@datasite.com': 'Graham Zagoria',
  'gzagoria@gmail.com': 'Graham Zagoria',
  'alex.lockhart@datasite.com': 'Alex Lockhart',
  'daniel.stinebaugh@datasite.com': 'Daniel Stinebaugh',
  'melissa.thompson@datasite.com': 'Melissa Thompson',
  'pana.vue@datasite.com': 'Pana Vue',
  'steven.mcadams@datasite.com': 'Steven McAdams',
  'lindsay.thron@datasite.com': 'Lindsay Thron',
  'adgoncal@users.noreply.github.com': 'Allan Goncal',
};

const BOT_PATTERNS = [/\[bot\]/i, /renovate/i, /project-starter/i];

function isBot(email, name) {
  return BOT_PATTERNS.some((p) => p.test(email) || p.test(name));
}

function canonicalName(email, name) {
  const lower = (email || '').toLowerCase();
  if (EMAIL_TO_DESIGNER[lower]) return EMAIL_TO_DESIGNER[lower];
  return name || lower;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// 1. Commit data from `git log`. Fail soft so CI environments without git
// history (shallow clones, image builds) still produce a valid activity.json
// and the rest of the build can succeed.
let commits = [];
try {
  const log = execSync('git log --pretty=format:%H%x09%an%x09%ae%x09%aI%x09%s', {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  commits = log
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, name, email, isoDate, ...subjectParts] = line.split('\t');
      return { sha, name, email, isoDate, subject: subjectParts.join('\t') };
    })
    .filter((c) => !isBot(c.email, c.name));
} catch (err) {
  console.warn(
    `[activity] git log unavailable (${err.code || err.message}); writing empty dataset`,
  );
}

const weekAgo = daysAgo(7);
const twoWeeksAgo = daysAgo(14);
const monthAgo = daysAgo(30);

const byDesigner = {};
const daily = {};

for (const c of commits) {
  const designer = canonicalName(c.email, c.name);
  if (!byDesigner[designer]) {
    byDesigner[designer] = {
      commits: 0,
      commitsWeek: 0,
      commitsTwoWeeks: 0,
      commitsMonth: 0,
      lastCommit: null,
      recentSubjects: [],
      skillInvocations: 0,
      skillInvocationsWeek: 0,
      topSkills: {},
    };
  }
  const bucket = byDesigner[designer];
  bucket.commits += 1;
  const d = new Date(c.isoDate);
  if (d >= weekAgo) bucket.commitsWeek += 1;
  if (d >= twoWeeksAgo) bucket.commitsTwoWeeks += 1;
  if (d >= monthAgo) bucket.commitsMonth += 1;
  if (!bucket.lastCommit || d > new Date(bucket.lastCommit)) {
    bucket.lastCommit = c.isoDate;
  }
  if (bucket.recentSubjects.length < 5) {
    bucket.recentSubjects.push({ subject: c.subject, date: c.isoDate });
  }

  const day = c.isoDate.slice(0, 10);
  daily[day] = (daily[day] || 0) + 1;
}

// 2. Skill usage from metrics/skill-usage/*.jsonl
const metricsDir = join(repoRoot, 'metrics', 'skill-usage');
const skillsAggregate = {};
let skillEvents = 0;

if (existsSync(metricsDir)) {
  for (const file of readdirSync(metricsDir)) {
    if (!file.endsWith('.jsonl')) continue;
    // Filename pattern: <designer-slug>.jsonl (slugified canonical name)
    const slug = file.replace(/\.jsonl$/, '');
    const designer = Object.values(EMAIL_TO_DESIGNER).find(
      (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug,
    ) || slug;

    const contents = readFileSync(join(metricsDir, file), 'utf8');
    for (const line of contents.split('\n')) {
      if (!line.trim()) continue;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch {
        continue;
      }
      if (!evt.skill || !evt.timestamp) continue;
      skillEvents += 1;
      skillsAggregate[evt.skill] = (skillsAggregate[evt.skill] || 0) + 1;

      if (!byDesigner[designer]) {
        byDesigner[designer] = {
          commits: 0,
          commitsWeek: 0,
          commitsTwoWeeks: 0,
          commitsMonth: 0,
          lastCommit: null,
          recentSubjects: [],
          skillInvocations: 0,
          skillInvocationsWeek: 0,
          topSkills: {},
        };
      }
      const bucket = byDesigner[designer];
      bucket.skillInvocations += 1;
      const ts = new Date(evt.timestamp);
      if (ts >= weekAgo) bucket.skillInvocationsWeek += 1;
      bucket.topSkills[evt.skill] = (bucket.topSkills[evt.skill] || 0) + 1;
    }
  }
}

// Collapse topSkills to a sorted top-5 array per designer
for (const bucket of Object.values(byDesigner)) {
  bucket.topSkills = Object.entries(bucket.topSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));
}

// 3. Count skills shipped in the repo — a positive inventory metric that's
// meaningful even before the PostToolUse hook captures invocations.
const skillsDir = join(repoRoot, '.claude', 'skills');
let skillsAvailable = 0;
if (existsSync(skillsDir)) {
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (existsSync(join(skillsDir, entry.name, 'SKILL.md'))) skillsAvailable += 1;
  }
}

const data = {
  generatedAt: new Date().toISOString(),
  totalCommits: commits.length,
  totalSkillEvents: skillEvents,
  skillsAvailable,
  byDesigner,
  daily,
  topSkillsOverall: Object.entries(skillsAggregate)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count })),
};

const outPath = join(repoRoot, 'src', 'data', 'activity.json');
mkdirSync(dirname(outPath), { recursive: true });

// In CI (Jenkins shallow clone) `git log` returns nothing and we'd otherwise
// stomp the committed snapshot with an empty dataset. Skip the write so the
// dashboard keeps showing the data captured at the last designer's push.
if (commits.length === 0 && skillEvents === 0 && existsSync(outPath)) {
  console.log(
    `[activity] git log + metrics both empty; preserving existing ${outPath}`,
  );
} else {
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  const designerCount = Object.keys(byDesigner).length;
  console.log(
    `[activity] wrote ${outPath}: ${commits.length} commits, ${skillEvents} skill events, ${designerCount} contributors`,
  );
}
