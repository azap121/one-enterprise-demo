---
name: halo-fix-pr
description: Use this skill when a designer's pull request has fallen behind main and shows conflicts or can't be merged. Triggers on phrases like "my PR has conflicts", "fix my pull request", "I can't merge", "my branch is behind", "PR is out of date", "it says there are conflicts", or when the designer invokes `/halo-fix-pr` directly. The skill fetches the latest from main, merges it into the designer's branch, resolves any conflicts automatically, verifies the build, and pushes — all without the designer having to touch git.
user-invocable: true
---

# Halo App Fix PR

This skill resolves conflicts in a designer's open pull request by merging the latest changes from `main` into their branch and pushing the result. The designer doesn't touch any git commands — the agent handles everything and reports progress in plain language.

> **When a designer invokes this with no branch context:** ask "Which prototype are you working on, or are you already on the branch you want to fix?" — then proceed.

---

## Mental model

Multiple designers sharing `main` means that while one designer was working on their prototype, another designer pushed something new. Now the first designer's branch is "behind" and GitHub is blocking the merge. The fix is straightforward: pull in the new changes, keep everything (both sets of prototypes), confirm the code still builds, and push.

The designer never needs to know which files changed or what "behind" means technically. They need to hear: "Got it, syncing with the latest — one moment." and then "All done, your PR is ready to merge."

---

## Language rules

Never use the following words in messages to designers: "conflict", "rebase", "merge", "HEAD", "origin/main", "git", "branch", "upstream", "diverged", "fast-forward". Use plain language instead:

| Instead of… | Say… |
|---|---|
| "There are merge conflicts" | "Another designer added something new while you were working — I'm syncing that in" |
| "Rebasing onto main" | "Getting the latest updates from the rest of the team" |
| "Conflict in registry.ts" | "Two prototypes were added at the same time — I'm keeping both" |
| "Push to remote" | "Updating your pull request" |
| "HEAD is behind origin/main" | "Your draft is a bit behind the latest — I'll catch it up" |

---

## Workflow

### Step 0 — Confirm which branch to fix

Check the current state:

```bash
git status
git branch --show-current
gh pr list --author "@me" --state open --json number,title,headRefName,url
```

If the designer invoked the skill while already on their prototype branch (not `main`), that's the branch to fix — proceed.

If the designer is on `main` or there's ambiguity, check for open PRs:

- If exactly one open PR exists: use that branch. Tell the designer: "Found your open pull request — fixing it now."
- If multiple open PRs exist: list them in plain language and ask which one to fix. Example: "I see two open drafts — 'Alert Dialog Options' and 'Deal Room Empty State'. Which one needs fixing?"
- If no open PRs exist: tell the designer there's nothing to fix and suggest they may want to push their work instead. Point them to the prototype-workflow skill.

Switch to the correct branch if needed:

```bash
git checkout <branch-name>
```

---

### Step 1 — Get the latest from main

Fetch what's new without changing anything yet:

```bash
git fetch origin main
```

Check whether the branch actually needs updating:

```bash
git log HEAD..origin/main --oneline
```

If the output is empty, the branch is already up to date. Tell the designer: "Your pull request is already up to date — no changes were needed. It should be ready to merge." Stop here.

If there are commits listed, continue.

---

### Step 2 — Merge main into the branch

```bash
git merge origin/main
```

**If the merge completes cleanly** (no conflicts): skip to Step 4.

**If git reports conflicts**: proceed to Step 3. Tell the designer: "Another designer added something while you were working — I'm syncing it in now."

---

### Step 3 — Resolve conflicts

#### Registry conflicts (most common)

`src/projects/registry.ts` is the file that most often conflicts, because every new prototype adds an entry to the same array. The conflict almost always looks like this:

```
<<<<<<< HEAD
  {
    slug: 'designer-a-prototype-name',
    ...
  },
=======
  {
    slug: 'designer-b-other-prototype',
    ...
  },
>>>>>>> origin/main
```

**Always keep both entries.** Remove the conflict markers and include both objects in the array. Order doesn't matter — alphabetical by designer is fine. The result:

```ts
  {
    slug: 'designer-a-prototype-name',
    ...
  },
  {
    slug: 'designer-b-other-prototype',
    ...
  },
```

After editing, stage the file:

```bash
git add src/projects/registry.ts
```

#### Prototype folder conflicts (rare)

Each prototype lives in its own folder (`src/projects/<Designer>/<PascalName>/`). Two designers working in different folders produces no conflict at all — git merges them automatically. A conflict here only happens if two designers happened to use the exact same folder name.

If this occurs, rename the designer's prototype folder to add a qualifier (e.g., `-V2` or append the designer's name), update the `slug` and `component` path in `registry.ts` to match, then stage:

```bash
git add src/projects/<Designer>/<PascalName>-V2 src/projects/registry.ts
```

Tell the designer: "There was a naming overlap with another prototype — I've updated yours slightly to keep both. The title and URL are the same, the folder name just has a small suffix."

#### After resolving all conflicts

Complete the merge:

```bash
git merge --continue
```

If git opens an editor for the merge commit message, it's pre-populated with a sensible default — just accept it (`:wq` if vim, or Ctrl-O/Ctrl-X if nano). The agent handles this non-interactively by using `-m`:

```bash
git merge -m "chore: sync with main" origin/main
```

Or, if already mid-merge and conflicts are resolved:

```bash
git merge --continue --no-edit
```

---

### Step 4 — Verify the build

Before pushing, confirm the merged result compiles cleanly:

```bash
npm run build
```

This must succeed. If it fails:
- Read the error output
- Fix the TypeScript or import issue (usually a path that broke during conflict resolution)
- Run `npm run build` again
- Do not push until it passes

Tell the designer: "Just double-checking everything still works with the new changes included..." and then report the outcome.

---

### Step 5 — Push to update the PR

```bash
git push origin <branch-name>
```

This updates the open PR on GitHub automatically — GitHub picks up the new push and re-evaluates whether the branch can now be merged.

**If the push is rejected** (another very-recent push from someone else, uncommon): run `git pull --rebase origin main`, re-check for conflicts per Step 3, re-run the build, and push again.

---

### Step 6 — Confirm to the designer

After a successful push, tell the designer in one or two plain sentences:

> "All done — your pull request is updated and ready to merge. The latest changes from the rest of the team have been included and everything still builds cleanly."

Optionally, include the PR URL so they can open it directly:

```bash
gh pr view --json url -q .url
```

---

## Edge cases

### Designer is on main with no open PR

Tell them: "You don't have an open pull request right now. If you're working on a new prototype, the normal workflow pushes directly to main — would you like to pick up from where you left off?" Point them to `halo-prototype-workflow`.

### The branch has been deleted

If the branch no longer exists locally, check out a fresh copy:

```bash
git fetch origin
git checkout <branch-name>
```

Then proceed from Step 1.

### Unrelated conflicts (non-registry, non-prototype files)

If the conflict is in a file outside `src/projects/` (e.g., `package.json`, `rsbuild.config.ts`), do not auto-resolve. Surface it to the designer: "There's a technical change in the project setup that overlaps with your work. Let me look at it and I'll let you know what needs to happen." Investigate the conflict, resolve it conservatively (prefer the incoming `main` version for infrastructure files unless the designer's branch has intentional overrides), then continue.

### Multiple rounds of conflicts (many commits behind)

If the branch is many commits behind and each rebase step produces new conflicts, the process is the same — resolve each round using the same keep-both logic. Don't give up after the first round. After all rounds resolve cleanly and the build passes, push.

---

## Ownership

- **Skill owner:** Datasite design team / Halo Team
- **For prototype content questions:** invoke `datasite-halo-design`
- **For the normal no-PR prototype workflow:** see `halo-prototype-workflow`
- **For deployment / live URL status:** see `halo-prototype-deploy`
