---
name: halo-design-update
description: >
  Use this skill when any designer wants to write a team update — weekly, ad hoc, or before a 1:1. Guides the designer through four structured sections, then generates a polished summary that's easy for leadership to read quickly.

  Trigger on phrases like:
  - "write my update" / "I need to send an update" / "write a design update"
  - "fill out my weekly" / "write my weekly update"
  - "write my 1:1 notes" / "help me prep for my 1:1" / "JT's structure for my 1:1"
  - "write an executive summary" / "I need an exec summary"
  - "help me write my check-in" / "I need to share my status"
  - "what do I tell JT" / "help me write something for JT"
  - "fill out the four sections" / "focus, challenges, help, good news"
  - Any time a designer mentions needing to communicate progress, blockers, or wins to leadership
user-invocable: true
---

# Design Update

This skill helps any designer on the team write a clear, well-formatted update. You answer four questions. The skill turns your answers into a polished summary that's ready to share.

---

## How it works

1. The skill asks you four questions, one at a time
2. You answer in plain language — don't worry about formatting
3. The skill generates a polished update from your answers
4. You review, adjust if needed, and share it wherever you need to (Slack, email, Confluence, 1:1 doc)

---

## Step 1 — Ask the four questions

Ask each question one at a time. Wait for the designer's answer before moving to the next. Keep the conversation relaxed — they're just talking through their week.

**Question 1 — Focus:**
> "What's been your main focus? What have you been working on or building toward?"

After they answer, ask two follow-up questions before moving on:

> "What's the number one thing you need to achieve this week — and how are you going to prioritize and get it done?"

> "What product design work are you personally doing this week? What are the deliverables?"

**Question 2 — Challenges:**
> "Any challenges or blockers? What's slowing you down or stopping progress?"

**Question 3 — Help needed:**
> "Is there anything you need from JT — a decision, some unblocking, a resource, or just eyes on something?"

**Question 4 — Good news:**
> "Any wins to share? What went well, what shipped, or what are you proud of?"

If the designer has nothing for a section, that's fine — note it as "Nothing to flag."

---

## Step 2 — Generate the update

Take all four answers and produce a formatted update in this exact structure:

---

**[Designer Name] — Design Update**
**[Date]**

[Opening story paragraph — 2–3 sentences, see rules below]

**Focus for the week**
[narrative paragraph — no bullets]

**Challenges and/or blockers**
[narrative paragraph — no bullets]

**Need help from JT**
[narrative paragraph — no bullets]

**Good news stories**
[narrative paragraph — no bullets]

---

### The most important rule: no bullet points anywhere

Every section is written as flowing sentences — a short paragraph, not a list. Bullets make people skip. Paragraphs make people read. The goal is that someone can read this update like a short story and immediately understand what's happening, what's stuck, and what's going well.

### Opening story paragraph rules

This sits at the top. It is the most important part — it gets read first and sometimes only. Write it like you are explaining the situation to a smart 14-year-old. Two or three sentences max. Lead with what happened or what matters, not what activities were done.

What NOT to write:
- "We are making significant progress across multiple workstreams." ✗
- "Continuing to advance design system maturity and alignment." ✗

What TO write:
- "The login flow prototype is done and 8 designers tested it this week. We fixed 2 of the 3 issues we found." ✓
- "Component fidelity hit 80% — 43 of the 54 Halo components now match the Figma spec." ✓

### Section paragraph rules

Each of the four sections is 2–4 sentences of plain prose. Think of each one as a short story: what happened, what it means, what comes next.

- **Focus:** What did I work on and why does it matter? What is the single most important thing this week and how will it get done? What product design work is the designer personally owning, and what are the deliverables?
- **Challenges:** What got in the way? Who or what needs to fix it?
- **Help needed:** What specific decision or action do I need from JT? By when?
- **Good news:** What worked? What shipped? What did someone say that made it feel real?

### Writing rules — apply everywhere

- **Plain English only.** No "leverage", "synergy", "visibility", "alignment", "socialize", "unpack", "learnings". If a 14-year-old would not know the word, replace it.
- **Short sentences.** If a sentence runs past 20 words, split it.
- **Specific over vague.** "3 designers tested it" beats "several designers". Use numbers, names, dates.
- **Active voice.** "We shipped X" not "X was shipped."
- **Results over effort.** "The prototype is live" not "we worked on the prototype."
- **Blockers name an owner.** What is stuck and who can unblock it.
- **Asks are concrete.** "Need JT to approve X by Friday" not "would be helpful to get some direction."

---

## Step 3 — Review and offer to save

After generating the update, say:

> "Here's your update — take a look and let me know if anything needs adjusting. Want me to save this to Confluence, or will you copy and paste it?"

If they want Confluence: create a new page in the DesignOps HQ space, titled `[Designer Name] — Design Update [Date]`. Ask which parent page to nest it under if unsure.

Do not submit or send the update anywhere without the designer's explicit approval.

---

## What this skill does NOT do

- Does not pull data from Jira, GitHub, or other tools — the designer provides all content
- Does not send or post the update anywhere without approval
- Does not change or editorialize the designer's answers — it formats and polishes them

---

## Ownership

- **Skill owner:** Annie Johnson
- **Who uses it:** Any designer on the Datasite design team
- **Cadence:** Any time — weekly, before a 1:1, or whenever an update is needed
