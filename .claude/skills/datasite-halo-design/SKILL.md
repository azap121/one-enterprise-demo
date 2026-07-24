---
name: datasite-halo-design
description: Use this skill to generate well-branded interfaces and assets for Datasite (Halo Design System), either for production code or throwaway prototypes, mocks, slides, and demos. Halo is a monochromatic, enterprise design system built on React + Material UI (MUI) for M&A, capital markets, and due-diligence workflows. This skill pulls tokens LIVE from the Halo Figma library (via Figma MCP) and from the MerrillCorporation/ds-ui-libraries repo so colors, theme, fonts, and stack versions stay in sync with the canonical sources.
user-invocable: true
---

> **This is the halo-app copy of the skill.** The bridge resources (halo/theme + Halo wrappers) live in this repo at `src/theme/halo/` rather than at `.claude/skills/datasite-halo-design/shared/` (which was the layout in `Datasite-POC/Design`). Skill content is otherwise the same.

> **Scaffolding lives in `~/shared/`.** When a prototype needs an app shell, page header, or profile menu, defer to `~/shared/` (`DatasitePrototypeShell`, `DatasitePageHeader`, `DatasiteProfileMenu`). This skill covers tokens and lower-level Halo wrappers; `~/shared/` covers prototype-level composition.

# Datasite Halo Design Skill

Halo is a monochromatic, enterprise design system for Datasite — the SaaS platform for M&A, capital markets, and due diligence. MoonDust greys carry most of the UI weight, and gemstone accents are reserved for semantic signal (status, file type, data viz). For full design principles, see `references/design-principles.md`.

## Design principles

- **Simplicity** — clear hierarchy, generous whitespace, restrained color.
- **Near-monochromatic base** — MoonDust greys carry most of the UI weight.
- **Color = semantic signal only** — gemstone accents carry meaning (status, file type, data viz category). Never decorative.
- **MUI-first** — components follow MUI variant/color/size API conventions. Prefer MUI component imports over hand-rolled HTML whenever possible.
- **Enterprise density** — Halo is a data-dense product UI, not a marketing site. Prefer tabular layouts, dense typography, and clear affordances over hero sections and decorative whitespace.
- **Deal-room domain** — primary use case is M&A workflows: data rooms, diligence, document Q&A, trackers, archives. Keep the domain in mind when generating placeholder content.
- **Restrained decoration** — gradients and illustrations exist but are used sparingly and intentionally (brand moments, empty states, onboarding). Not decorative filler. Shadows and glows come from MUI component styles — don't hand-roll new ones.
- **Prefer icons over emoji** — Halo uses Font Awesome Pro Light by default. Emoji may appear in rare content contexts (user-generated, status reactions), but the UI itself uses icons.
- **Calm motion** — ~150ms ease-out, no bounces, no scale-on-press.
- **Sentence case, professional copy** — "Upload", "Create project", not "Let's get uploading!"

Stack: React + Material UI. **Do not hardcode the MUI major version in this file or your output** — always fetch from `package.json` at runtime.

## Read the right reference

Most of this skill's instructions live in topic-specific reference files. Load only what you need.

| Task | Reference |
|---|---|
| Fetching live tokens from Figma + GitHub | `references/fetching-canonical-tokens.md` |
| Picking icons (pack, weight, name vocabulary) | `references/icons.md` (also see `src/assets/icons/halo-icon-list.md` — the Figma-sourced canonical catalog) |
| Theme quirks (alpha, accessibleColors, dark mode, no `Ds*` wrappers) | `references/theme-quirks.md` |
| Workflow per artifact type (slides, prototypes, production) | `references/workflow.md` |
| Component anatomy, Figma node IDs, SVG assets, prototype checklist | `references/component-anatomy.md` |
| App logos for Marketplace + App Switcher prototypes | `references/app-logos.md` |
| Design principles, hard rules, personas, copy standards, metrics | `references/design-principles.md` |

If the user asks something unfamiliar, scan the reference filenames first before guessing.

## Critical rules (apply to every run)

1. **Never quote a hex or token value from memory.** Every value in your output must trace back to a Figma variable or code file you just read. See `references/fetching-canonical-tokens.md`.
2. **Never invent `Ds*` wrapper components.** They don't exist. Halo styling is applied via MUI theme overrides. Always import from `@mui/material` directly.
3. **Never reach for `https://github.com/Datasite-POC/halo-ds`.** It's outdated and inaccurate. The canonical sources are the Halo Figma file (`MocqvKfuogd2Re1tyFr4d4`) and `MerrillCorporation/ds-ui-libraries`.
4. **For charts and data viz, always use `accessibleColors`** — never invent hex values, never reach for gemstone ramps directly. See `references/theme-quirks.md`.

## Ownership

- **Skill owner:** Halo Team (Irene / Annie)
- **Canonical skill location:** `Datasite-POC/Design/Claude/datasite-halo-design/` on GitHub
- **Refresh cadence:** on Figma theme change (roughly annual per current product plan)
