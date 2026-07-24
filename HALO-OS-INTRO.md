# Halo OS — What It Is & How to Use It

> **For your designers.** This is Datasite's internal onboarding doc. If you're porting Halo OS to your business unit, adapt the content (URLs, names, ownership, SSO/VPN instructions) for your team — but the structure works as-is. See `PORT-TO-YOUR-BU.md` for porting guidance.

---

## What is Halo OS?

**Halo OS** is the Datasite design team's agentic OS for building prototypes — a system of Claude skills, shared repos, and design infrastructure that lets designers build and ship prototypes without engineering help.

At its center is [**Halo**](https://github.com/MerrillCorporation/halo-app/tree/main), the shared prototype gallery where designers' work lives. Every prototype is built with real Halo components, looks like the actual product, and is live on an internal Datasite URL within minutes of being created.

When you visit [halo.dev.dsite.io](https://halo.dev.dsite.io), you'll land on a page titled **"Halo — Product Design Artefacts"** with cards for every designer's current work. That's the gallery. Halo OS is everything that makes the gallery work — the skills, the repos, the design system.

Think of it as a design sandbox with production fidelity. No lorem ipsum, no static mockups — real, clickable UI that stakeholders can use with a VPN connection.

**Watch the Halo OS overview:** [Loom recording](https://www.loom.com/share/91f6d897741145d383fc83e9166083f8)

---

## Getting Started

**Do you already have Datasite VPN and a GitHub account connected to MerrillCorporation?**

---

### ✅ Yes — I have VPN and GitHub

Open Claude Code, paste this message into the chat, and hit send:

> **💡 Expect a browser sign-in step.** MerrillCorporation uses SAML SSO — when Claude sets up GitHub authentication, it will give you a URL and ask you to open it in your browser. This takes you through your Datasite login. It's a one-time step, takes about 30 seconds, and Claude continues automatically once you're done.

```
Get me set up for the halo-app. I already have VPN and GitHub access to MerrillCorporation. Check my machine has git, Node 20+, and npm. Install gh CLI if needed and authenticate via gh auth login (use GitHub.com, HTTPS, browser, sign in with Datasite SSO). Clone MerrillCorporation/halo-app to ~/git/halo-app, symlink all skills globally, then open the dev server.
```

Claude walks you through every step automatically with a live checklist — no terminal knowledge required.

---

### ❌ No — I need VPN or GitHub access first

**Step 1 — Get VPN access**

Request **Datasite Global Protect VPN** from the Microsoft My Access portal — approval is automatic, no manager sign-off needed:

1. Go to [myaccess.microsoft.com](https://myaccess.microsoft.com/@mymerrillcorp.onmicrosoft.com#/access-packages/available)
2. Search for **"Datasite Global Protect VPN"**
3. Click **Request** → Continue
4. Once approved, open **Datasite Self Service** on your Mac, search **"glob"**, and install **GlobalProtect** from the Catalog

> **⏱ Allow up to 1 hour after installing GlobalProtect for the VPN to fully activate.** You won't be able to connect to the repo until it's working. If GlobalProtect doesn't appear in Self Service after your access is approved, or the install stalls, open an IT Support ticket — IT may need to manually push the package to your machine (this has been a known issue). Once resolved, come back here and continue with Step 2.

**Step 2 — Get GitHub access**

If you don't have a GitHub account yet, create one at [github.com](https://github.com) using your **Datasite email address**.

Once you have an account, reach out to Annie Johnson or Irene Ramirez to be added to the MerrillCorporation GitHub org via Datasite SSO.

**Step 3 — Once you have both, come back here and paste this into Claude Code:**

> **💡 Expect a browser sign-in step.** MerrillCorporation uses SAML SSO — when Claude sets up GitHub authentication, it will give you a URL and ask you to open it in your browser. This takes you through your Datasite login. It's a one-time step, takes about 30 seconds, and Claude continues automatically once you're done. Just click the link and sign in with your Datasite credentials.

```
Get me set up for the halo-app. Check my machine has git, Node 20+, and npm. Install gh CLI if needed and authenticate via gh auth login (use GitHub.com, HTTPS, browser, sign in with Datasite SSO). Clone the repo — it's at MerrillCorporation/halo-app, private, requires Datasite VPN. Put it at ~/git/halo-app. After cloning, symlink all skills globally. Then open Claude from the ~/git/halo-app folder and start the dev server.
```

---

## Prototypes Are Live on the VPN

Every prototype you create is deployed automatically the moment you approve it. Here's how it works:

1. You describe what you want to build
2. The agent scaffolds the prototype, builds it using Halo components, and shows it to you in the browser
3. You say "looks good" — the agent pushes directly to `main`
4. Jenkins picks it up, builds a Docker image, and deploys it to Kubernetes
5. **Live at [halo.dev.dsite.io](https://halo.dev.dsite.io) in ~5 minutes**

No PR. No manual publish step. Anyone on the Datasite VPN can view it — no GitHub access needed.

---

## Track What the Team Is Shipping

Visit [halo.dev.dsite.io/activity](https://halo.dev.dsite.io/activity) to see what everyone's been working on. There's also a toggle in the gallery's top nav.

The page shows:

- **Commits per designer** — today, this week, two weeks, this month, all-time
- **Last commit ago** — who's been heads-down recently
- **Recent commit subjects** — quick read of what each person's shipping
- **Top Claude skills used** — what the team is leaning on most
- **Daily activity** — overall pulse of the gallery

It updates every time anyone pushes to `main`. Useful for 1:1 prep, weekly updates, or just seeing what your team's been on.

---

## AI Skills That Power the Workflow

Halo OS is built around a set of Claude skills that automate every part of the design-to-prototype process. You don't need to know how to code — the skills handle all of that.

| Skill | What It Does |
| --- | --- |
| **Halo Start** | Gets any designer from zero to a running dev server — installs tools, authenticates GitHub, clones the repo, starts the server |
| **Prototype Workflow** | 11-step agent-driven process: scaffolds the prototype, registers it in the gallery, builds with Halo components, gets your approval, then commits and pushes |
| **Prototype Deploy** | Explains what happens after push, checks Jenkins build status, gives you the live URL to share |
| **Datasite Halo Design** | The source of truth for Halo tokens, components, icons, and design principles — pulls live tokens from Figma MCP every time |
| **Halo Component Edit** | Makes targeted edits to individual Halo components when they need token corrections or fidelity tweaks |
| **Halo Component Sync** | Refreshes Halo components when Figma designs or design tokens change upstream |
| **Halo Fix PR** | Resolves accidental merge conflicts or PRs automatically — just run `/halo-fix-pr` if it ever comes up |
| **Halo Design Update** | Guides any designer through four sections (focus, challenges, help needed, good news) and generates a polished, plain-language update ready to share in a 1:1 or with leadership. Run `/halo-design-update` or just say "write my update." |

---

## Halo Design System — Built In

The Halo gallery ships with **38 Halo components** already integrated — no setup, no credentials, no GAR access needed.

**Custom structural components** — Components where Figma anatomy diverges from MUI defaults, built as real React components:

- `HaloDialog` — full Datasite dialog anatomy with custom slot layout
- `HaloEmptyState` — branded empty states with illustration support

All components use the Halo MoonDust token system, gemstone semantic accents, and Font Awesome Pro Light icons — the same visual language as the real product. Prototypes look like production.

---

## What Makes This Different

**It's AI-native from the ground up.** The entire workflow — from onboarding a new designer to deploying a live prototype — is encoded in skills that Claude executes autonomously. A designer describes what they want to build. The agent does the rest.

**No engineering bottleneck for prototypes.** Designers go from idea to a clickable, stakeholder-ready prototype in one session — no engineer needed to scaffold, ship, or deploy. Engineering still builds the real production product. What changes is that prototype work no longer sits in an engineering queue.

**Production-quality fidelity.** Halo tokens come live from Figma and the Halo OS repo. The prototype looks like what engineering will actually build, so the handoff is one-to-one — no translation step, no "we'll figure that out in build."

**Shared and collaborative.** All designers share one repo on `main`. Everyone's prototypes are in the same gallery, visible to each other and to stakeholders the moment they're pushed.

**Zero friction onboarding.** A new designer can go from a blank machine to their first prototype in a single Claude session — no terminal commands, no configuration, no asking engineering for help.

---

_Halo OS is owned by **Annie Johnson** (primary), with **Irene Ramirez** as backup. **JT** is the exec sponsor._
