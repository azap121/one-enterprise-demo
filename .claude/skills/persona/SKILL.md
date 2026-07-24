---
name: persona
description: Use this skill to apply a Datasite interaction-persona lens (Daniel, Desmond, Deborah, or persona variants) to a prototype, design, copy, or feature. Triggers on phrases like "design this for [persona]", "would [persona] understand this", "review through [persona]'s lens", "as Daniel...", or any explicit persona name. Also invoked by the `audience` router skill when the routing decision is "interaction" (day-to-day product use, not buying moments). This skill owns two distinct moments in the `halo-prototype-workflow` — Step 2.6 (persona-lens framing BEFORE the build, asking the designer to articulate the value through the persona's eyes) and Step 7c (live persona walkthrough AFTER the build, where the agent drives the prototype as the persona and reports an advisory rating). Persona content lives in `references/<persona>.md` — each file is a stub that Melissa Thompson (Product Design, Mgr) populates with JTBD, anti-patterns, quotes, and the canonical Confluence link.
user-invocable: true
---

# Persona Skill — Interaction Lens

The interaction-persona specialist. Loads a Datasite persona profile and applies it at two checkpoints in the prototype workflow:

1. **Before the build (Step 2.6)** — persona-lens framing question that forces the designer to articulate the value in the persona's words.
2. **After the build (Step 7c)** — live walkthrough where the agent drives the prototype as the persona and returns an advisory rating.

This is the **interaction** half of JT's buying-vs-interaction split. For buying moments (positioning, pricing, sales), the `audience` router sends to `icp` instead.

## Personas covered

Persona content lives in `references/<persona>.md` — each file is a stub that Melissa owns. As of 2026-05-20:

| Persona | File | Status |
|---|---|---|
| Daniel — Sell-Side Analyst | `references/daniel.md` | **Stub** — needs Melissa's content |
| Daniel — Corporate Development | `references/daniel-corpdev.md` | **Stub** — variant added May 2026 |
| Desmond | `references/desmond.md` | **Stub** |
| Deborah | `references/deborah.md` | **Stub** — being adjusted to a legal lens |

When invoked, this skill loads the requested persona file and any explicit variants. If the requested persona doesn't exist yet, the skill says so honestly and falls back to a generic JTBD framing question.

## Mental model

- **A persona is not a user.** It's a research-validated archetype. The skill helps designers think *through* the persona, not pretend to be one.
- **Synthetic walkthrough is not user research.** The Step 7c rating is a cheap AI gut-check — useful for catching obvious misalignment before showing real users. Never present it as validation. The walkthrough output always includes a disclaimer.
- **Intentional constraint to ~3 personas + variants.** Per JT's framing (and Melissa's response to Youjin in #product-designers 2026-05-18): keep the system tight to cover 80-90% of use cases. Variants handle context shifts (e.g. Daniel-CorpDev) rather than spinning up new personas.
- **Multi-persona is normal.** A project dashboard might serve both Daniel and Desmond. The skill loads multiple personas when the audience selection picked more than one and explicitly flags which design choice serves which.

---

## Mode 1 — Persona-lens framing (Step 2.6, BEFORE build)

Runs after `audience` confirms a persona. SKIPPED if `prototype-context` already produced a brief with JTBD + success criteria — that content already answers these questions and re-asking would be noise.

### When to skip

Skip Step 2.6 entirely if the brief contains BOTH:
1. A defined JTBD (not "Not specified")
2. Success criteria with at least one measurable item

Tell the designer in one line:
> "Brief already covers Daniel's JTBD and success criteria — moving to design tokens. (Skipping persona framing.)"

### When to ask

Ask if the brief is thin or exploratory. Phrase as if the persona is speaking — first-person, plain language, no jargon:

```
🎯 Persona-lens check — I'm <Persona>.

Before you build, help me see this through my eyes:
  1. What problem are you solving for me?
  2. Which of my jobs-to-be-done does this hit?
  3. How will my day be measurably better?

Answer in 2-3 sentences. No need to write a PRD.
```

Record the answer. It becomes the **intent anchor** for the rest of the workflow and the rubric for the Step 7c walkthrough. Append to BRIEF.md under `## Persona-lens framing`.

### What good answers look like

- ✅ "Daniel spends 40% of his review time deciding which docs to deep-read first. This dashboard surfaces a relevance score so he can sequence his afternoon."
- ❌ "It'll be a really nice UX." *(no JTBD link, no measurable change)*

If the designer's answer is vague, ask one follow-up: *"What would change about Daniel's afternoon specifically?"* — then move on. Don't gatekeep.

---

## Mode 2 — Live persona walkthrough (Step 7c, AFTER build, ADVISORY)

Runs after Step 7 designer approval and Step 7b override cleanup, before Step 8 build verify. Purely advisory — designer can ignore the rating and push anyway.

### Setup

1. Dev server is already running (Step 6).
2. Prototype is rendering at `http://localhost:9000/projects/<slug>`.
3. Agent uses Claude Preview tools: `preview_click`, `preview_fill`, `preview_snapshot`, `preview_screenshot`, `preview_resize`, `preview_console_logs`.

### The walkthrough

The agent **drives the prototype as the persona** — narrating in first-person, completing tasks aligned to the persona's JTBD, and reacting honestly.

For each JTBD the persona has (from `references/<persona>.md`):
1. Identify what task in the prototype would satisfy that JTBD.
2. Attempt the task using preview tools (click, fill, navigate, scroll).
3. Note what worked, what required searching, what was confusing.
4. Check the prototype against the persona's **anti-patterns** — if any appear, flag them.

### Output format

Post in chat using this exact structure:

```
─────────────────────────────────────────────
PERSONA WALKTHROUGH — <Persona name>
Prototype: <title>  ·  Mode: live preview
─────────────────────────────────────────────

⚠ This is a synthetic persona check, not user research.
  Real <Persona> may disagree. Use as a cheap first
  reviewer, not validation.

Task completion       <X>/<Y> tasks completable
JTBD coverage         <A>/<B> JTBDs addressed
Anti-pattern hits     <N>  (specifics below)
Overall rating        <S>/10  (advisory)

Top friction
  • <specific UI element> — <why it confused/frustrated the persona>
  • <next item>

What <Persona> would say
  "<one verbatim quote in the persona's voice>"

Strengths
  • <thing the prototype does well from this persona's POV>

Recommended next iteration (optional)
  • <one concrete change if rating < 7>
```

### Rating heuristic

- **9-10** — Hits every JTBD cleanly, zero anti-patterns, friction is cosmetic only.
- **7-8** — Hits primary JTBDs, minor friction, no anti-patterns. **Ready to ship.**
- **5-6** — Partial JTBD coverage OR 1-2 friction points the persona would call out. Designer should consider one iteration.
- **3-4** — Major JTBD miss or anti-pattern hit. Strongly suggest iteration before push.
- **1-2** — Wrong persona, wrong shape. Audience selection was probably off.

### Advisory, not gating

After the output, ask one question:

> "Push as-is, or want to iterate first? (Rating is advisory — your call.)"

Whatever the designer answers, respect it. No re-asking, no guilt-tripping. If they push at 4/10, that's their call — prototypes are exploratory.

### When to skip Mode 2

- If the prototype is a pure component catalog (e.g. Halo Component Reference) — there's no task to complete from a persona's POV.
- If the audience selection was `none` / `exploratory`.
- If the dev server isn't running or preview tools fail — fall back to "code-read" mode: read the source files and simulate the path mentally. Less honest but still useful.

---

## Multi-persona prototypes

When the audience selection picked more than one persona (common for dashboards), run Mode 2 once per persona and post **separate walkthrough blocks**. Don't merge them — different personas have different anti-patterns and JTBDs, and merging hides important detail.

End with a one-line aggregate:
> "Aggregate: Daniel 7/10, Desmond 6/10 — Desmond is the weaker fit; consider whether the pipeline-health view at the top is doing enough work."

---

## What this skill does NOT do

- Generate new personas. New personas come from real user research with Melissa's team — not from imagination. If the designer needs a persona that doesn't exist, tell them: *"That persona isn't in the system. Reach out to Melissa Thompson — she's intentionally keeping the set tight, but variants are possible."*
- Replace user research. The walkthrough is a synthetic gut-check.
- Block the push. Always advisory.
- Apply ICP/buying-lens thinking. For pricing pages, positioning, sales decks → use the `icp` skill instead.

## Ownership

- **Persona content owner:** Melissa Thompson (Product Design, Mgr) — Email: Melissa.Thompson@datasite.com
- **Skill mechanics owner:** Annie + Halo Team
- **Canonical sources:**
  - Confluence DESIGN space (Persona pages)
  - Figma Persona Doodles board: https://www.figma.com/board/zMbzsw3hezkNXTRufqvkuA/Persona-Doodles
  - Rovo chat agents — Melissa has built conversational versions of each persona
- **Constraint:** keep the persona set tight per JT's framing (cover 80-90% of use cases; use variants for context shifts)
