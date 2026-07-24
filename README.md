# Stifel Discovery Demo — Tom Koula & Jaime Bergaz

Personal-deploy copy of the Halo prototype gallery for the Stifel discovery session, forked from `azap121/halo-william-blair-robbin-demo` (base commit `bac5411b`).

**Route:** `/projects/paza-stifel-deal-assistant` (root redirects there)

One agentic prototype for both bankers: Datasite AI chat with an approval-gated Q&A triage flow, a Tom ↔ Jaime seat switcher in the top bar, and a right-hand evidence canvas. Deal fixture: Project Aldgate (synthetic sell-side software M&A, four bidder groups).

**Status: scaffold.** Structure is final; content is placeholder pending Snowflake Cortex ("Quartet") telemetry. Search `src/projects/Paza/StifelDealAssistant` for `QUARTET(` to find every swap point (P1 room profile, P2 feature footprint, P3 staging patterns, P4 Q&A realism, P6 named-user division of labor). See that folder's `BRIEF.md`.

The original William Blair prototype (`src/projects/Paza/WilliamBlairQaSearch`) is kept in-repo, unregistered, as reference.

## Run

```
npm ci
npm start        # dev server on :9000
npm run build    # outputs dist/, deployed via Vercel
```

Node >= 20. Public npm only.
