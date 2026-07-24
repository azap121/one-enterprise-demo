---
name: halo-prototype-deploy
description: Use this skill when a designer asks to publish, ship, or deploy prototype changes in `halo-app`, OR when the agent has just pushed to `main` and the designer needs to know what happens next. Triggers on phrases like "ship this", "publish the changes", "push the update", "deploy", "see this live", "send this to stakeholders", "is it live yet", "what's the URL", "did it deploy". This skill is informational + status-checking — there is no manual publish step in this repo. Jenkins handles deployment automatically when commits land on `main`.
user-invocable: true
---

# Halo App Prototype Deploy

Deployment is fully automatic in `halo-app`. Once the agent pushes to `main`, the prototype reaches the live internal Datasite URL with no further action required.

This skill exists to:

1. Tell designers what happens after the push so they know what to expect.
2. Help check the build status when they're impatient or worried.
3. Hand them the live URL once it's actually serving.

> **Important: this repo does not use pull requests.** Designers push directly to `main`. The `halo-prototype-workflow` skill encodes the guardrails (build check + designer approval) that replace the PR review process. Don't tell designers to open a PR or "merge" anything — that's a different repo's workflow.
>
> **Difference from the older `Datasite-POC/Design` repo:** that one needs a manual `node scripts/publish.mjs` step. **This repo does not.** Jenkins runs everything. Don't tell designers to run a publish script — there isn't one.

---

## Mental model — what "deploy" means here

```
Push to main → Jenkins picks it up → builds Docker image → pushes to Harbor → K8s rolls out → live at halo.dev.dsite.io
       (instant)        (~30 seconds)        (~3-5 minutes)    (~30 seconds)    (~1-2 minutes)
```

Total wait from "git push completes" to "stakeholders can see it" is typically **5-10 minutes**.

The designer's checklist after push is essentially:

1. Wait a few minutes.
2. Hit the live URL to confirm.
3. Share it.

---

## Step-by-step: what happens after the push

### 1. The push lands on `main`

The workflow skill ran `git push origin main` after the designer approved and the build passed locally. At this point the source code is shared with other designers (anyone who runs `git pull` will see it) but the live URL hasn't updated yet — Jenkins still has work to do.

### 2. Jenkins builds and ships

Jenkins watches `main` and starts a build automatically when commits land. The build:

- Installs dependencies (`npm ci`)
- Runs the rsbuild production build (`npm run build` → `dist/`)
- Builds a Docker image from `Dockerfile.halo-app` (multi-stage: node build → nginx serve)
- Pushes the image to Datasite Harbor with a git-describe tag
- Rolls out a Kubernetes deployment update via `services/halo-app/00-k8s-vars.yaml` in `MerrillCorporation/datasite-k8s-manifests`
- Tests/lint/coverage are explicitly skipped (designer prototype repo — see `Jenkinsfile`)

A typical build takes **3-5 minutes**. The K8s rollout adds another minute or two before the new pod is serving traffic.

### 3. Live URL serves the new version

Once the rollout completes, the prototype is live at:

```
https://halo.dev.dsite.io/projects/<slug>
```

The hostname is fixed (set by `services/halo-app/00-k8s-vars.yaml` `ingress.hosts`). For a specific prototype, append the route — e.g. `https://halo.dev.dsite.io/projects/annie-alert-dialog-options`. The gallery landing page is at the root: `https://halo.dev.dsite.io/`.

Anyone with Datasite SSO can view it — no GitHub access required, no special permissions, no VPN.

### 4. Share with stakeholders

The designer copy/pastes the URL to whoever they want to show. Anyone with Datasite SSO access can view it.

---

## Checking build status

When a designer asks "is it live yet?" or "did it deploy?", the agent watches the Jenkins build for the latest `main` commit:

```bash
gh run list --branch main --limit 1
gh run watch
```

(Or, if the squad's Jenkins integration exposes status via the GitHub commit-status API, `gh api repos/MerrillCorporation/halo-app/commits/main/status` will show pending/success/failure inline.)

If it shows `success`, the prototype is live within ~30 seconds (file upload is fast).

If it shows `failure`, the agent opens the Jenkins URL from the status output to see the error logs and reports what's wrong in plain English to the designer (e.g., "the build failed because of a TypeScript error in your prototype — let me fix it and push again").

---

## Common designer questions

### "How long until I can see it?"

5-10 minutes from the moment the push lands. The agent can poll the Jenkins build status to give a real-time answer instead of guessing.

### "Did my change actually go through?"

Check the latest commit on `main`:

```bash
git log origin/main -1
```

If the latest commit has the designer's name and the prototype's title, the push landed. Then check Jenkins for the build status.

### "How do I share it with stakeholders?"

Just paste the URL. Anyone with Datasite SSO can view it — no GitHub access needed (unlike the older `Datasite-POC/Design` repo, which is gated by GitHub org membership).

### "I made another change — does the URL update automatically?"

Yes. Each push to `main` redeploys. Same URL, new version. Stakeholders refreshing the page will get the latest. Repeat the workflow skill (review + build + push) for every iteration.

### "Can I see it before pushing?"

Yes — that's exactly what Step 7 of the workflow skill is for. The dev server at `http://localhost:9000/projects/<slug>` is the only pre-push preview. There is no per-PR preview environment because there are no PRs.

### "Can I roll back if something's wrong?"

Yes. The agent reverts the bad commit on `main` and pushes again:

```bash
git pull origin main
git revert <bad-commit-sha>
git push origin main
```

Jenkins will pick up the revert and ship it within the same 5-10 minute window. The live URL will return to its prior state.

If the designer can't identify the bad commit, the agent uses `git log --oneline -10` to show recent prototype commits and asks which one to revert.

### "Why isn't my prototype showing up on the gallery page?"

The most likely cause: it wasn't registered in `src/projects/registry.ts`. The gallery has no auto-discovery — every prototype needs an explicit entry. The agent edits this file as part of the workflow skill (Step 4); if it was skipped, fix that and push a follow-up commit.

### "What if the Jenkins build fails after I push?"

The push already landed on `main`, so other designers will pull the broken state. Two options:

1. **Fix forward** (preferred for small typos): the agent fixes the issue locally, runs `npm run build` to confirm, and pushes again. Jenkins will pick up the fix on the next build.
2. **Revert** (preferred if the fix isn't obvious): use the rollback flow above to return `main` to the prior good state, then debug locally before pushing again.

Either way, the live URL serves the _most recent successful_ Jenkins build, not the latest commit on main — so a brief broken-main state doesn't show up on the public URL until Jenkins succeeds.

---

## URLs by environment

| Env | URL |
|---|---|
| Dev | `https://halo.dev.dsite.io` |
| Stage | (TBD — add manifests entry to enable) |
| Prod | (TBD — add manifests entry to enable) |

The hostname is configured in `services/halo-app/00-k8s-vars.yaml` in `MerrillCorporation/datasite-k8s-manifests`. The TLS cert is provisioned automatically (`tlsCert: soteria-namespace-cert`). Anyone on Datasite SSO can reach the URL — no GitHub permissions, no VPN.

This deployment intentionally **does NOT use the NFS pattern** (`app.<env>.datasite.com/<path>/`). NFS-served MFEs are designed to be loaded as federated remotes by the customer-facing app, not browsed directly. We're a standalone internal tool, not a federated remote.

---

## Reviewer Experience — automatic PR labeling

When a GitHub pull request is created for changes that touch the Reviewer Experience prototype (any commit modifying files under `src/projects/Nate/ReviewerDashboard/` or `src/projects/Nate/FirstVersionReviewerExperience/`, or any PR that includes slugs `nate-reviewer-dashboard` or `nate-first-version-reviewer-experience`), the agent must automatically apply the `reviewer-app` label to the PR.

Run these two commands immediately after `gh pr create` returns the PR URL:

```bash
# Ensure the label exists (safe to run repeatedly — --force is a no-op if it already exists)
gh label create "reviewer-app" --color "#0075ca" --description "Reviewer Experience prototype" --force --repo MerrillCorporation/halo-app

# Apply the label to the newly created PR (replace <PR_NUMBER> with the number from gh pr create output)
gh pr edit <PR_NUMBER> --add-label "reviewer-app" --repo MerrillCorporation/halo-app
```

If a PR already exists and was opened without the label (e.g., the session was interrupted), apply it retroactively when the agent next touches the PR:

```bash
gh pr edit <PR_NUMBER> --add-label "reviewer-app" --repo MerrillCorporation/halo-app
```

This rule is specific to the Reviewer Experience prototype — no other prototype in the gallery auto-labels its PRs.

---

## What this skill does NOT cover

- **Adding a new prototype.** That's `halo-prototype-workflow`.
- **Halo design tokens / styling.** That's `datasite-halo-design`.
- **The older `Datasite-POC/Design` repo's GitHub Pages deployment.** That repo has its own `datasite-prototype-publish` skill and uses `node scripts/publish.mjs`. Not applicable here.

---

## Ownership

- **Skill owner:** Datasite design team / Halo Team
- **Pipeline owner:** Technology Enablement squad
- **Build failures or NFS / k8s questions:** Technology Enablement squad (`#technology-enablement-alerts` Slack channel — see `Jenkinsfile`)
