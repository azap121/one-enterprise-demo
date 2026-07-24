#!/usr/bin/env node
// `npm run sync-metrics`
//
// Copies the designer's local skill-usage log into the repo so it gets
// committed and shipped with the next push. The PostToolUse hook
// (~/.claude/hooks/log-skill-usage.sh) writes new entries to
// ~/.claude/metrics/skill-usage.jsonl; this script merges those entries
// into metrics/skill-usage/<designer-slug>.jsonl, dedupes by timestamp+skill,
// and leaves the local log untouched.
//
// One file per designer means no merge conflicts when multiple people sync.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const localLog = join(homedir(), '.claude', 'metrics', 'skill-usage.jsonl');
if (!existsSync(localLog)) {
  console.log('[sync-metrics] no local skill-usage.jsonl yet — nothing to sync');
  process.exit(0);
}

const EMAIL_TO_DESIGNER = {
  'annie.johnson@datasite.com': 'Annie Johnson',
  'joseph.machin@datasite.com': 'Joe Machin',
  'sean.kwon@datasite.com': 'Sean Kwon',
  'paza.bahia@datasite.com': 'Paza Bahia',
  'hello@paza.co': 'Paza Bahia',
  'irene.ramirez@datasite.com': 'Irene Ramirez',
  'you.lee@datasite.com': 'Youjin Lee',
  'nate.hull@datasite.com': 'Nate Hull',
  'graham.zagoria@datasite.com': 'Graham Zagoria',
  'gzagoria@gmail.com': 'Graham Zagoria',
  'alex.lockhart@datasite.com': 'Alex Lockhart',
  'daniel.stinebaugh@datasite.com': 'Daniel Stinebaugh',
  'melissa.thompson@datasite.com': 'Melissa Thompson',
  'pana.vue@datasite.com': 'Pana Vue',
  'steven.mcadams@datasite.com': 'Steven McAdams',
  'lindsay.thron@datasite.com': 'Lindsay Thron',
};

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim().toLowerCase();
const gitName = execSync('git config user.name', { encoding: 'utf8' }).trim();
const designer = EMAIL_TO_DESIGNER[gitEmail] || gitName;
const designerSlug = slug(designer);

const localLines = readFileSync(localLog, 'utf8')
  .split('\n')
  .filter((l) => l.trim())
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

if (localLines.length === 0) {
  console.log('[sync-metrics] local log is empty — nothing to sync');
  process.exit(0);
}

const outDir = join(repoRoot, 'metrics', 'skill-usage');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${designerSlug}.jsonl`);

const existing = existsSync(outFile)
  ? readFileSync(outFile, 'utf8')
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  : [];

const seen = new Set(existing.map((e) => `${e.timestamp}::${e.skill}`));
const merged = [...existing];
let added = 0;
for (const evt of localLines) {
  const key = `${evt.timestamp}::${evt.skill}`;
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(evt);
  added += 1;
}

merged.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
writeFileSync(outFile, merged.map((e) => JSON.stringify(e)).join('\n') + '\n');

console.log(
  `[sync-metrics] ${designer} (${designerSlug}.jsonl): +${added} new, ${merged.length} total`,
);
