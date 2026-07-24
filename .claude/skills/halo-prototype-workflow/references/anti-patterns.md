# Anti-patterns and edge cases

Reference for the agent when something feels off-pattern or doesn't fit the standard flow. Load on demand.

## When something doesn't fit

The workflow prescribes one shape because consistency is what makes the rest of the system (auto-deploy, Halo grounding, gallery filtering) work. But the world is messy. Surface conflicts instead of silently inventing workarounds:

- **"I want to use a different React framework / charting library / state lib."** Most needs are met by what's already installed. If the designer truly needs a new dep, surface it: get an explicit yes before adding to `package.json`.
- **"I want this to look completely different from Halo."** Fine for an exploration — but if it's _replacing_ Halo styling, name it as a Lab (`type: 'lab'`) so the gallery's filter chips set expectations.
- **"I want multiple pages/routes inside one prototype."** Use internal state (`useState`) to flip between views. The shell owns top-level routing. If a prototype truly needs nested routes, surface it — we can decide whether to add nested routing to the shell or restructure as multiple prototypes.

## Anti-patterns to actively avoid

- **Hardcoding Halo hex values or MUI versions.** Always go through `datasite-halo-design` and consume tokens via the bridge.
- **Rebuilding the global nav, top bar, profile menu, or page header from scratch.** These live in `~/shared/` and are the canonical Datasite scaffolding **when chrome is needed**. If `DatasitePrototypeShell` doesn't expose the prop you need (e.g., a different product nav set, custom top-bar actions), surface it before rolling your own — the right fix is a prop on the shared component, not a one-off reimplementation in `src/projects/`.
- **Wrapping every prototype in `DatasitePrototypeShell` by default.** The shell is opt-in. Wrapping a focused alert/dialog exploration, a component catalog, or a single-screen mockup in the shell adds chrome that distracts from the actual design question. Always ask the shell question at scaffolding time (Step 1, question 4) and default to bare if it isn't obvious that chrome is part of the design.
- **Skipping the manifest entry.** The prototype won't appear in the gallery without it. There is no auto-discovery.
- **Wrapping the prototype in `ThemeProvider` or `BrowserRouter`.** The shell already provides both. Nesting them silently breaks theming and routing.
- **Pushing without designer approval.** Step 7 is required. The agent must show the prototype in the browser and wait for the designer's explicit "ship it".
- **Pushing without running `npm run build`.** Step 8 is required. There is no PR review or CI gate before `main` — the agent's local build check is the only thing catching engineering errors before the live URL serves them.
- **Writing unit tests for the prototype.** Prototypes are explicitly test-free. Don't create `*.test.tsx` files under `src/projects/`. Don't add fixtures, mocks, or testing-library imports. If the agent finds itself reaching for Jest in a prototype folder, stop and reconsider — that effort is better spent on the visual fidelity of the prototype.
- **Opening a pull request.** Designers push to `main` directly. PR-based workflows add friction and aren't required.
- **Creating a feature branch.** Same — work happens directly on `main` after `git pull origin main`.
- **Adding `@ds/*` packages or pulling FA icons from GAR at install time.** This repo deliberately avoids GAR dependencies at `npm install` time. Theme + components come from the bridge at `src/theme/halo/`. FA Pro icon packages are **vendored** at `vendor/@fortawesome/` and consumed via `file:` deps — designers don't need GAR auth. If a prototype seems to need a `@ds/*` runtime dep, surface that to the maintainers before adding it.
- **Adding new top-level deps without checking.** Prototypes share the MFE's `package.json`. New deps affect everyone's bundle size.
- **Touching the gallery wrapper or routes for prototype-specific reasons.** If a prototype needs something the shell can't provide, surface it — don't quietly modify `src/shell/` to make one prototype work.
