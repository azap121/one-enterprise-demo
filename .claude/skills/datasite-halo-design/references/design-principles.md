# Datasite Design Principles
VERSION 1.1 · Source of truth: JT's Design Principles (DESIGN space)
Owners: Annie Johnson, JT · Refresh: when JT's Design Principles page updates

---

## HOW TO USE THIS FILE

**For designers:** You don't need to read this. When you prototype in
halo-app, Claude loads it automatically at Step 2. It grounds every
component choice, colour, and word in your prototype before any code
is written.

**For Claude:** Load this file at Step 2 of halo-prototype-workflow,
before scaffolding any prototype. Apply the Hard Rules without
exception. Use the Decision-Making Rules as a lens on every component,
layout, and copy decision. Reference the Skills to Build table when a
designer asks about a gap area.

**For work outside halo-app:** Attach this file to any Claude prompt
— Figma, slides, other tools. Same result.

---

## REPO-SPECIFIC REFERENCES (halo-app)

- **Halo bridge (tokens + components):** `src/theme/halo/theme.ts`
- **Halo wrapper components:** `src/theme/halo/components/`
- **Token import pattern:** `import { moondust, topaz, jade } from '~/theme/halo/theme'`
- **Figma file:** Halo Design Library (ask datasite-halo-design skill for live token values)
- **Never hardcode hex values.** Always use bridge tokens.
- **Never wrap a prototype in ThemeProvider or BrowserRouter.** The gallery wrapper already provides both.

---

## SKILL STACK — WHAT ANCHORS ON THIS FILE

| Skill | Relationship |
|---|---|
| `halo-prototype-workflow` | Calls this file at Step 2 before scaffolding |
| `datasite-halo-design` | Uses tokens and component rules from this file |
| `halo-component-edit` | Applies Hard Rules and component guidance |
| `design-principles.md` (this file) | The grounding layer all other skills build on |

---

## IMPORTANT: TERMINOLOGY

**Design System** — the holistic term covering all shared design decisions:
principles, behaviours, patterns, interaction models, documentation, and
libraries. Everything that governs how we design and build.

**Halo** — the Datasite Design Library only. Component library, tokens,
visual styles. Halo is part of the Design System. It is not the whole of it.

Never use Halo to refer to the Design System, and never use Design System
to refer only to Halo.

---

## THE NORTH STAR

Every decision starts here. Ask two questions before anything else:

1. Who is this for, and why does it matter to them?
2. Does this make the experience simpler, clearer, or more useful — or does it add noise?

If you can't answer both confidently, go back a step. Start with the end
experience and work backwards.

The standard: **Apple in software and hardware. BMW in automotive.
B2C-grade experience for B2B customers.**

---

## HARD RULES — Non-negotiable

- One visible primary button per screen. One.
- Never place two destructive actions side by side without a clear visual separator.
- Destructive actions always require a second confirmation step.
- Icon-only buttons always have a tooltip. No exceptions.
- Inline form validation fires on blur, not on keystroke. Don't punish users mid-thought.
- Labels always sit above the field. Placeholder text is never a substitute for a label.
- A modal never launches another modal.
- Every modal has a clear escape: close icon, ESC key, and click-outside-to-dismiss.
- Every action over 300ms needs a loading indicator.
- 100% of product must meet WCAG AA. No exceptions.
- 100% of designs must reference research or metrics. Gut alone isn't enough.
- 100% of product uses Halo components and Design System tokens. No hand-rolled one-offs.
- 100% of copy follows the Writing Copy for Product playbook.
- 100% mobile-first thinking. Even in a B2B context.

---

## CORE PRINCIPLES

**Simplicity.** Clear hierarchy, generous white space, restrained colour. If
you're adding elements to solve a problem, first ask whether removing something
solves it instead. When in doubt between two options, ship the simpler one.

**Sophisticated.** Simplicity isn't minimal. It's the most sophisticated version
of a solution with nothing unnecessary left in it. Every extra element on screen
is a question the user has to answer. Only ask the ones that matter.

**Consistency.** Create solutions that leverage how modern systems already work.
Only invent when no suitable model or pattern exists. If a pattern exists in the
Design System — use it.

**Clarity.** Remove unnecessary steps and visual elements. The goal is higher
comprehension and lower friction. Friction isn't only interaction friction —
it's cognitive friction too.

**Customers.** Don't just solve the immediate problem. Think a few months out
and future-proof the solution. Keep the M&A domain close: deal rooms, diligence,
documents, trackers, archives. High-stakes environments. Design accordingly.

**Care.** Datasite is a professional product but it doesn't have to feel cold.
There's room for character in transitions, empty states, onboarding moments,
and micro-copy. Keep it earned and intentional — not decorative noise.

---

## LAWS OF SIMPLICITY — John Maeda (applied to Datasite)

**Reduce** — When in doubt, remove. What can be taken away without losing meaning?
**Organize** — Use the Design System's spacing, grouping, and hierarchy rules
to impose order on complexity.
**Time** — Savings in time feel like simplicity. Reduce clicks, steps, and pages.
**Learn** — Design for the user learning the product for the first time.
Make things recognisable, not memorable.
**Differences** — Use complexity deliberately to highlight what is simple
and actionable.
**Context** — Empty space, supporting elements, and surrounding context
are all doing work.
**Emotion** — Design for how the customer feels, not just what they need to do.
**Trust** — The customer trusts a product that behaves predictably and
consistently. Design System consistency builds that trust at scale.
**Failure** — If something is genuinely complex, make that complexity legible
rather than hiding it.
**The One** — Simplicity is about subtracting the obvious and adding the meaningful.

---

## NIELSEN'S 10 USABILITY HEURISTICS (applied to Datasite)

1. **Visibility of System Status** — Every action with consequences needs
   immediate feedback. Upload progress, document processing, Q&A states — always
   visible. Customers in a live deal room cannot afford ambiguity about system state.

2. **Match Between System and Real World** — Use domain language: deal rooms,
   due diligence, buyers, sellers, documents, Q&A. Follow the Glossary in
   Writing Copy for Product.

3. **User Control and Freedom** — Cancel, close, undo — always present and
   discoverable. All modals support ESC and click-outside. Multi-step flows
   allow backward navigation.

4. **Consistency and Standards** — If a convention exists in the Design System,
   use it. No one-off patterns.

5. **Error Prevention** — Deletion dialogs and permission changes always confirm
   intent before executing. Form validation guides, not punishes.

6. **Recognition Rather Than Recall** — Consistent iconography, familiar action
   placement. Primary action always right-aligned. Reduce memory burden in
   high-frequency workflows.

7. **Flexibility and Efficiency** — Design for task frequency. Daily tasks must
   be the most efficient paths.

8. **Aesthetic and Minimalist Design** — Every irrelevant element competes with
   relevant elements. Reduce. Restrain.

9. **Help Recognise, Diagnose, and Recover from Errors** — Plain language.
   Precise problem. Constructive fix. No error codes, no apologies.

10. **Help and Documentation** — If users frequently search for how to do
    something, that's a design problem — not a documentation problem.

---

## GESTALT PRINCIPLES (applied to Datasite)

**Proximity** — Elements close together are perceived as related. Use whitespace
to signal relationship and separation.

**Similarity** — Elements that look alike are perceived as a group. Everything
that looks the same should behave the same. Design System tokens enforce this.

**Continuity** — Align elements along a common axis. Tables, indexes, and Q&A
lists rely on alignment to let customers scan at speed.

**Closure** — Use whitespace and alignment to imply containers rather than
boxing everything explicitly.

**Figure and Ground** — The foreground (thing to act on) must be clearly
separated from background. Don't use decorative orange — it collapses the
figure-ground distinction.

**Prägnanz** — Design to the simplest possible structure. If a layout requires
effort to understand, it's doing too much.

**Common Fate** — Use motion deliberately (~150ms ease-out) so movement carries
meaning, not decoration.

**Uniform Connectedness** — Don't overuse enclosures — every box you draw
is a hierarchy claim.

---

## DECISION-MAKING RULES BY AREA

**Hierarchy and Focus**
- One focal point per screen. If everything is important, nothing is.
- The most important action must be the most visually obvious thing on the page.
- If you need both bold and colour to make something stand out, your hierarchy
  is broken. Fix the hierarchy first.

**Colour**
- Orange is for attention only — important CTAs and highlights. Never decorative.
- Gemstone accents carry semantic meaning: status, file type, data viz category.
  Never decorative.
- Near-monochromatic base — MoonDust greys carry most of the UI weight.
- Never use colour as the only differentiator. Always pair with shape, label,
  or icon (accessibility).
- If you're adding a third background colour to a page, stop and ask why.

**Typography**
- Sentence case by default. Buttons, labels, headings. Only overline is uppercase.
- No more than two type sizes per component. Three max per full page layout.
- Never all-caps for body text or anything longer than a label.

**Spacing and Layout**
- Use the Design System spacing scale. Never eyeball a one-off value.
- Group related things closer. Space communicates relationship.
- If you're pixel-nudging to align, your grid is broken. Fix the grid.

**Icons**
- Font Awesome Pro, Light weight as default.
- Duotone or Regular only where Light lacks contrast at small sizes.
- Don't mix weights for decoration.
- Never use emoji in UI contexts. Emoji is for user-generated content only.

**Motion**
- ~150ms ease-out. Calm and intentional, never playful or bouncy.

**Forms**
- One primary task per form page. Multi-step beats multi-column.
- Mark optional fields, not required. Required is the default.
- Never leave a form in a broken state after an error.

**Empty States**
- Every empty state: illustration/icon + reason it's empty + one action
  to resolve it.
- "No data found" is not a message. Explain why, tell the user what to do next.

**Loading and Feedback**
- Success messages confirm what specifically happened — not just "Success."
- Never leave users uncertain whether an action completed.

**Navigation**
- Current location is always visually indicated.
- No hover-only patterns on primary navigation paths.

**Modals**
- Modals are for tasks, not information. If there's no action, use a tooltip,
  callout, or inline message.

---

## COPY

Full reference: Writing Copy for Product —
datasite.atlassian.net/wiki/spaces/DESIGN/pages/5933891683

**Voice:** Dynamic, confident, smart. Punchy over flowing. Practical over
inspirational. Professional but never formal. Human but never casual.

**Style Rules:**
- Active voice. Positive language. "We", "you", "your", "us." Gender neutral.
- Concise. Every word earns its place.
- No "please", "sorry", or "oops" in error messages.
- No machine language — no "invalid", "server error", "error code".
- US English. Sentence case unless specified otherwise.

**Key interface copy rules:**
- Buttons: 2–4 words, verb-led, describe the consequent state. Never "OK"
  or "Submit."
- Error messages: specific problem + how to fix it. Plain language.
- Empty states: heading + reason it's empty + one action to resolve it.
- Say "person" or "people", not "user" or "users"
- Say "Data Room", not "room" or "VDR"
- Say "log in" (verb), "login" (noun)

---

## TIME TO VALUE — MEASURING SIMPLICITY

Three proxies for every prototype:

**Clicks to completion** — count them. Any click that doesn't move the
customer closer to their goal is friction. Target fewer clicks per task
over time.

**Steps to completion** — default to fewer. Every step added needs a clear
justification.

**Screens to completion** — page changes are disorienting. In-page
interactions compress Time to Value.

Challenge yourself to reduce click count on any primary task by at least
20% from first concept to final design.

---

## THREE DECISION FILTERS

When you're stuck, run your decision through these in order:
1. **Shrink** — can it be smaller, shorter, or more contained?
2. **Hide** — can it be progressive, contextual, or deferred until needed?
3. **Embody** — can the behaviour communicate it so the label doesn't need to?

---

## WHAT GOOD LOOKS LIKE

Before shipping any design, check these:
- Is the primary action obvious? Is there only one?
- Could anything be removed without losing meaning or function?
- Is every colour, icon, and motion element doing a specific job?
- Does the empty state make sense and give the customer a path forward?
- Does it work at mobile scale?
- Has it been tested against a real scenario or persona?
- Have click count, step count, and screen count been logged and challenged?
- Has copy been run through the Writing Copy for Product guide?
- Does it feel like something Apple or BMW would ship?

---

## HOW WE MEASURE IT

- **Usability Score** — target 8/10 or above
- **Time to Value** — clicks, steps, screens to completion. Target reduction
  over iterations.
- **Time Spent with Customers** — tracked quarterly
- **WCAG AA compliance** — 100%. No exceptions.
- **Component and token coverage** — 100%. Halo components only.

---

## CUSTOMER PERSONAS

Always design from the customer's perspective. Load the relevant persona
before prototyping any flow.

**Daniel** — Sell Side Analyst / Deal Coordinator. "I run the deal."
28, New York. Investment banking, corporate development, PE. Owns
day-to-day execution. Hates fragmented status views and multi-step
workflows for simple actions. Wants speed, control, and clarity.
→ datasite.atlassian.net/wiki/spaces/DESIGN/pages/6427377716

**Desmond** — Relationship Manager / MD. "I manage the client."
The relationship anchor. Focused on confidence, trust, and communication
quality rather than operational detail.
→ datasite.atlassian.net/wiki/spaces/DESIGN/pages/6427377999

**Deborah** — Due Diligence Lead. "I manage due diligence."
The analytical anchor. Turns mountains of data into a clear picture
of risk. Focused on accuracy, completeness, and surfacing what matters
in a compressed timeline.
→ datasite.atlassian.net/wiki/spaces/DESIGN/pages/6427378057

When in doubt about which persona to design for: whose workflow does
this feature primarily affect? Design for that person first. Use the
others as a stress test.

---

## SKILLS TO BUILD

Gaps worth closing — these don't fully exist yet as structured skills.

| Skill | Why it matters |
|---|---|
| Research Practices | How we run discovery — interviews, usability testing, the Usability Score survey |
| Simplicity Playbook | Shrink/Hide/Embody filters applied to specific Datasite UI patterns with concrete examples |
| Halo Component Usage | When to use which component — decision trees for dialog vs drawer, empty state patterns, table vs card |
| Accessibility (WCAG AA) | Practical skill — colour contrast, focus states, screen reader patterns, touch targets |
| Motion and Interaction | Full interaction vocabulary beyond the ~150ms ease-out rule |
| M&A Domain Knowledge | Primer on M&A workflows and terminology for designers new to the domain |
| AI Feature Patterns | Confidence signals, loading states for generative output, handling AI errors |
| Scenario Writing | Writing scenarios around personas — directly feeds prototype work |
| Sad Path Design | Error states, failure flows, edge cases — only briefly touched in copy rules |
| First Use Experience | Onboarding, zero-state, new user flows — broader than empty state rules |
| Customer Journey | Structured journey mapping skill — especially relevant for agentic work |
| Friction Map | Running a friction map tied to Time to Value metrics |
| Platform Consistency | Cross-product consistency check across Datasite MFEs |
| Redesign Comparison | Before/after framing for prototype work and stakeholder reviews |
| Task Analysis | Structured task analysis process for design decisions |
| DS Contributor Plan | How to contribute to the Design System — process and standards |
| Usability Report | Structured reporting beyond the Usability Score number |
| Future Thinking 6–18 months | Strategic design horizon planning |
| Pendo | Research data integration — how to use Pendo signals in design decisions |
| Dovetail | Research repository — connecting Dovetail findings to prototype work |

---

## EXTERNAL REFERENCES

- Nielsen Norman Group — 10 Usability Heuristics: nngroup.com/articles/ten-usability-heuristics
- Gestalt Principles for UI Design: toptal.com/designers/ui/gestalt-principles-of-design
- John Maeda — Laws of Simplicity: lawsofsimplicity.com
- Hemingway App (copy quality): hemingwayapp.com
- Writing Copy for Product: datasite.atlassian.net/wiki/spaces/DESIGN/pages/5933891683
- Customers and Personas: datasite.atlassian.net/wiki/spaces/DESIGN/pages/6333038632
- JT's Design Principles (source of truth): datasite.atlassian.net/wiki/spaces/DESIGN/pages/6511296581

---

## REFRESH CADENCE

- **Trigger:** When JT updates the Design Principles Confluence page
- **Owner:** Annie Johnson (Halo Team)
- **Reviewer:** JT
- **Process:** Pull updated content from JT's page → update this file →
  push to main → no announcement needed unless Hard Rules changed
