---
name: halo-start
description: Use this skill when a designer opens a session in the `halo-app` repo and needs to get oriented or set up — including first-time machine setup, first-time clones, returning sessions, or any message like "where do I start", "how do I use this", "I'm new here", "get me set up", "let's get started", or when the designer's intent is clearly to build a prototype but hasn't described what yet. The skill checks and installs all prerequisites (git, Node, npm, GitHub auth), clones the repo if needed, syncs it, starts the dev server, and hands off to `halo-prototype-workflow` once the designer is ready.
user-invocable: true
---

# Halo App — Start

This skill gets a designer from zero to a running dev server, including full machine setup if needed. The agent checks every prerequisite, installs anything missing, and hands off to the prototype workflow once the designer is ready.

---

## Preflight — Verify working directory

**Run this before anything else, before posting the checklist.** The halo-app skills and CLAUDE.md only load when Claude Code is opened from inside the `halo-app` repo folder. If the designer is in the wrong folder (e.g., `~/Test`, `~/Desktop`, `~/Documents`), the entire workflow breaks silently.

Check:
```bash
pwd && ls src/projects/registry.ts 2>/dev/null && echo "IN_REPO" || echo "WRONG_DIRECTORY"
```

### If `IN_REPO` — proceed to the checklist and steps below.

### If `WRONG_DIRECTORY` — stop and resolve before anything else.

First, check if the repo is already cloned somewhere on this machine:
```bash
find ~ -maxdepth 5 -name "registry.ts" -path "*/src/projects/*" 2>/dev/null | head -1
```

**If found (e.g., `/Users/sean.kwon/halo-app/src/projects/registry.ts`)**:

Tell the designer exactly what to do:
> "You're currently in the wrong folder — Claude needs to be opened from inside the `halo-app` repo to use the full workflow. Here's how to fix it in one step:
>
> At the bottom left of this Claude window, click where it shows your current folder name. A menu will appear — choose **Open folder...** and navigate to `~/git/halo-app` (or wherever the path above shows it's cloned). Then start a new session and everything will be ready."

Stop — do not proceed past this point until they've reopened from the correct folder.

**If not found (repo not cloned yet)**:

Tell the designer:
> "I don't see `halo-app` on this machine yet. I'll clone it for you — this is a one-time setup. I'll put it at `~/git/halo-app`. Make sure you're connected to the **Datasite VPN** before we proceed, since the repo requires it."

Then run Steps 1–4b from this skill (checking git, Node, GitHub auth, cloning to `~/git/halo-app`, symlinking skills). After Step 4b completes, tell the designer:
> "All set — `halo-app` is now at `~/git/halo-app`. One last step: click the folder name at the bottom left of this Claude window, choose **Open folder...**, and open `~/git/halo-app`. Then start a new session and you'll be ready to build."

---

## What this repo is (tell the designer on first run)

`halo-app` is the Datasite design team's prototype gallery — a shared space where designers can build and ship interactive React prototypes without needing engineering help. Every prototype is:

- Built with **Halo components** (MUI + Datasite's design system)
- Live at `https://halo.dev.dsite.io` within ~5 minutes of a push
- Accessible to anyone with Datasite SSO — no GitHub access needed to view

---

## Showing progress to the designer

Designers don't watch tool calls — they watch chat. To make onboarding legible, **post the checklist immediately at the start of the session, before running any checks, then re-post it with updated checkboxes each time a step completes** so the designer can always find the current status in the most recent message without scrolling.

Use checkbox syntax (`- [ ] **Step N:**`). Mark items `- [x]` only after they're actually done — never pre-check ahead of work.

**Post this checklist at the very start of every session:**

```markdown
- [ ] **Step 1:** Check git
- [ ] **Step 2:** Check Node 20+ and npm
- [ ] **Step 3:** GitHub authentication (Datasite SSO)
- [ ] **Step 4:** Clone the repo
- [ ] **Step 4b:** Install skills globally (one-time)
- [ ] **Step 5:** Sync the repo (git pull)
- [ ] **Step 6:** Install dependencies (npm install)
- [ ] **Step 7:** Start the dev server
- [ ] **Step 8:** Ready — what do you want to build?
```

As each step completes, flip its box to `[x]` and re-post the full checklist in a new message. The designer should always be able to scan the latest message and know exactly where you are.

**For returning sessions** where Steps 1–4b are already satisfied, pre-check them in the initial post and proceed from Step 5:

```markdown
- [x] **Step 1:** Check git
- [x] **Step 2:** Check Node 20+ and npm
- [x] **Step 3:** GitHub authentication (Datasite SSO)
- [x] **Step 4:** Clone the repo
- [x] **Step 4b:** Install skills globally (one-time)
- [ ] **Step 5:** Sync the repo (git pull)
- [ ] **Step 6:** Install dependencies (npm install)
- [ ] **Step 7:** Start the dev server
- [ ] **Step 8:** Ready — what do you want to build?
```

Only pre-check a step you have actually verified in this session — don't assume.

---

## Step 1 — git

Check:
```bash
git --version
```

If git is not found, install it. On macOS the fastest path is the Xcode Command Line Tools:

```bash
xcode-select --install
```

A system dialog will appear asking the designer to click "Install". Tell them:
> "A dialog popped up on your screen asking to install developer tools — click Install and wait for it to finish (~2 min), then come back here."

After the install completes, re-run `git --version` to confirm.

Alternative (if they already have Homebrew):
```bash
brew install git
```

Do not proceed to Step 2 until `git --version` returns a version number.

---

## Step 2 — Node 20+ and npm

Check:
```bash
node --version
npm --version
```

**Node ≥ 20 is required.** npm is bundled with Node — installing Node installs npm.

### If Node is missing or below v20

The recommended path is **nvm** (Node Version Manager) — it lets designers switch Node versions easily and doesn't require admin privileges.

**Check if nvm is already installed:**
```bash
nvm --version
```

**If nvm is missing, install it:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

After the install script runs, the shell needs to reload to pick up nvm. Tell the designer:
> "I've installed nvm. I need to reload the shell to use it — I'll do that now."

Then source the profile:
```bash
source ~/.zshrc
```

(If the designer uses bash: `source ~/.bashrc`. If nvm still isn't found, `source ~/.nvm/nvm.sh` directly.)

**Install and activate Node 20:**
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

`nvm alias default 20` makes Node 20 the default for all future terminal sessions — important so the designer doesn't have to run `nvm use 20` every time.

**Verify:**
```bash
node --version   # should print v20.x.x or higher
npm --version    # should print 10.x.x or similar
```

Do not proceed until both pass.

---

## Step 3 — GitHub authentication (Datasite SSO)

The designer needs to be able to `git push` to the `Datasite-POC` GitHub org. This org uses Datasite SSO — they must authenticate via Datasite credentials, not a personal token.

**Check if already authenticated:**
```bash
gh auth status
```

If it returns an active login for `github.com` and the account can reach `Datasite-POC`, skip ahead.

### If gh CLI is missing

Install it:
```bash
brew install gh
```

If Homebrew isn't available:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
```

### Authenticate

```bash
gh auth login
```

Walk the designer through the interactive prompts:
1. **Where do you use GitHub?** → `GitHub.com`
2. **What is your preferred protocol?** → `HTTPS`
3. **How would you like to authenticate?** → `Login with a web browser`

A one-time code will appear in the terminal. Tell the designer:
> "Copy the code shown in the terminal, then click the link that appeared. It'll open GitHub in your browser. Paste the code there and sign in with your Datasite SSO credentials."

After they confirm it worked, run:
```bash
gh auth status
```

### Enable SSO for the MerrillCorporation org

GitHub requires an extra step to authorize a token for an SSO-protected org. After logging in:

```bash
gh auth refresh -h github.com -s read:org
```

Then open this URL and click "Authorize" next to **MerrillCorporation**:
> https://github.com/settings/tokens

Tell the designer:
> "One more step — open that link, find the token called 'gh' or 'GitHub CLI', and click 'Configure SSO' → 'Authorize' next to MerrillCorporation. This is a one-time step."

**Verify push access:**
```bash
gh api orgs/MerrillCorporation/repos --jq '.[0].name' 2>&1
```

If this returns a repo name without error, SSO is authorized.

---

## Step 4 — Clone the repo (first-time only)

Skip this step if the designer already has the repo cloned locally.

**Important — read before cloning:**
- The repo is `MerrillCorporation/halo-app`. **Do not create a new repo** — it already exists.
- The `MerrillCorporation` org is private and requires **Datasite VPN**. If the clone fails or returns a 404/permission error, tell the designer: "Make sure you're connected to the Datasite VPN, then try again."

```bash
git clone https://github.com/MerrillCorporation/halo-app.git ~/git/halo-app
cd ~/git/halo-app
```

After cloning, the working directory should be `~/git/halo-app/`. Confirm:
```bash
ls src/projects/registry.ts
```

If that file exists, the clone succeeded.

---

## Step 4b — Install skills globally (first-time only, automatic)

**Run this immediately after Step 4.** This is a one-time step per machine that makes all halo-app skills available from any directory — so the designer never has to open Claude from inside the repo folder.

First, find the absolute path to the cloned repo:
```bash
pwd
```

Then create the global skills directory if it doesn't exist and symlink all repo skills into it:
```bash
mkdir -p ~/.claude/skills
REPO_PATH=$(pwd)
for skill_dir in "$REPO_PATH/.claude/skills"/*/; do
  skill_name=$(basename "$skill_dir")
  ln -sf "$skill_dir" "$HOME/.claude/skills/$skill_name"
done
```

Verify it worked:
```bash
ls ~/.claude/skills/
```

You should see `halo-start`, `halo-prototype-workflow`, `halo-prototype-deploy`, `datasite-halo-design`, `halo-component-edit`, and `halo-component-sync` listed.

Tell the designer:
> "All the halo-app skills are now installed globally — you can open Claude from any folder and they'll be available."

**For returning designers who skipped this step:** If the skills aren't symlinked yet (check with `ls ~/.claude/skills/`), run the symlink block above from the repo root. This is a one-time fix.

---

## Step 5 — Sync the repo

```bash
git pull origin main
```

All designers share `main` directly — no feature branches. Pull every session to avoid working on a stale tree.

If the pull fast-forwards cleanly, continue. If it reports conflicts, stop and resolve them before proceeding.

---

## Step 6 — Install dependencies

```bash
npm install
```

Installs from the **public npm registry only** — no Google Artifact Registry credentials needed. Any machine with Node ≥ 20 can run this.

If it fails with a registry or auth error, check that `.npmrc` contains only a comment line and nothing that points at GAR. Do not add registry pointers.

---

## Step 7 — Start the dev server

```bash
npm start
```

Run this **in the background** (`run_in_background: true`) so the agent can keep editing files while the server is running.

This boots the rsbuild dev server and **automatically opens the browser** at `http://localhost:9000`. The gallery landing page shows all available prototypes.

If the browser doesn't auto-open, post the URL in chat:
> "Dev server is running at http://localhost:9000 — open that in your browser to see the gallery."

---

## Step 8 — Hand off

Once the dev server is running and the designer can see the gallery:

> "You're all set. The gallery is live at http://localhost:9000. What do you want to build today?"

Invoke `halo-prototype-workflow` as soon as the designer describes a prototype idea — even a vague one. Don't wait for a fully-formed brief.

---

## Common situations

### "I worked on something yesterday, picking up where I left off"

Skip Steps 1–4. Run Steps 5–7 (fast — usually just a `git pull` and `npm start`). Then ask if they want to continue an existing prototype or start a new one.

### "Is my prototype still there?"

```bash
git log --oneline -5
```

Show the last few commits so the designer can confirm their work landed. Then start the dev server and navigate to their prototype's URL.

### "The server won't start"

Check for a port conflict:
```bash
lsof -i :9000
```

If something else is using port 9000, kill it (`kill <PID>`) and retry `npm start`. rsbuild doesn't auto-pick a new port.

If `npm start` errors on startup, check the first error line. Common causes: missing `node_modules` → run `npm install`; broken import in a prototype → path typo from a previous session.

### "git push is rejected / permission denied"

Re-check GitHub auth and SSO:
```bash
gh auth status
```

If the token isn't authorized for Datasite-POC, walk through the SSO step in Step 3 again.

---

## What this skill does NOT cover

- **Building a prototype** — that's `halo-prototype-workflow`
- **Halo design tokens / component reference** — that's `datasite-halo-design`
- **What happens after pushing to main** — that's `halo-prototype-deploy`

---

## Ownership

- **Skill owner:** Datasite design team / Halo Team (Annie Johnson, Irene)
- **Repo / pipeline owner:** Technology Enablement squad
