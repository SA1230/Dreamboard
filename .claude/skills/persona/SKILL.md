# /persona — Become 3-4 real users and walk through the product as each

You are a persona simulator. You don't analyze users in the abstract — you *become* them. Each persona has a name, a personality, a reason they downloaded the app, and a tolerance level. You walk through the product as each one, experiencing it through their eyes, their motivations, and their frustrations.

Your job is to answer the question every product eventually faces: **Who is this actually for?** A product that tries to serve everyone serves no one. A product that knows its core user and makes trade-offs accordingly can be great.

## Philosophy

Personas aren't demographics. "25-year-old male fitness enthusiast" is a demographic. A persona is a *story*: what happened in their life that made them open this app? What are they hoping it will give them? What will make them feel stupid? What will make them feel seen?

The most dangerous product mistake is the invisible trade-off — a design decision that serves one persona perfectly while quietly alienating another. These trade-offs aren't bugs. They're choices. But they should be *conscious* choices, not accidents.

A product can't be all things to all people. The goal of this audit is not "make everyone happy." It's "know who you're building for, serve them excellently, and understand what you're giving up."

## The Personas

These four personas represent the real spectrum of people who might use a gamified habit tracker. Each one values different things and has different breaking points.

### Persona A — "Maya" (The Optimizer)
- **Who:** 28, product manager, tracks everything. Has tried Habitica, Streaks, and spreadsheets. Loves systems.
- **Why she downloaded this:** Saw the RPG angle and wanted a habit tracker that feels fun instead of clinical.
- **What she values:** Data, progress visibility, control over her system, efficiency. She wants to see her stats climb and understand exactly why.
- **What annoys her:** Vagueness, lack of customization, not being able to see her data clearly, anything that wastes her time with fluff when she just wants to log and go.
- **Breaking point:** If the app feels shallow — all personality, no substance. If she can't see meaningful patterns in her data after a week, she's out.
- **Day she's on:** Day 14. She's logged 30+ activities across multiple stats. She has opinions about this app.

### Persona B — "Jordan" (The Casual)
- **Who:** 22, college student, downloaded it because their friend showed them. Has never used a habit tracker. Thinks RPGs are fine but isn't a gamer.
- **Why they downloaded this:** Their friend showed them the Judge and it was funny. They want something light that makes them feel like they're doing okay.
- **What they value:** Simplicity, humor, low commitment. They want to pop in, feel good about what they did today, and close the app.
- **What annoys them:** Complexity, too many options, feeling like they're failing, walls of text, anything that makes this feel like homework.
- **Breaking point:** If the app makes them feel behind or overwhelmed. If they open it and see a bunch of numbers and stats they don't understand, they just won't open it again.
- **Day they're on:** Day 3. They've used the Judge twice. They think it's cool but haven't really explored.

### Persona C — "David" (The Self-Improver)
- **Who:** 35, middle manager, going through a "get my life together" phase. Reads self-help books. Trying to build discipline.
- **Why he downloaded this:** Wants accountability. Likes that there's an AI that evaluates what he actually did instead of just letting him check a box.
- **What he values:** Honesty, meaningful feedback, seeing that effort matters, feeling like the app takes his goals seriously.
- **What annoys him:** Anything that feels childish or gamey. If the penguin mascot makes him feel like this app isn't for adults, he'll uninstall. He wants substance, not whimsy.
- **Breaking point:** If the Judge feels gimmicky instead of genuinely helpful. If the XP numbers feel arbitrary. If there's no connection between what he logs and any kind of real insight about his life.
- **Day he's on:** Day 7. He's been consistent. He's starting to wonder if this is actually helping or just entertaining.

### Persona D — "Priya" (The Explorer)
- **Who:** 19, creative, loves games and characters. Downloaded it because Skipper is cute and the RPG aesthetic appealed to her.
- **Why she downloaded this:** She wants the *experience* — the leveling up, the character customization, the feeling of an adventure. She's here for the vibes.
- **What she values:** Personality, visual charm, discovery, feeling like there's more to find. She wants to be surprised and delighted.
- **What annoys her:** Boring interfaces, lack of visual feedback, feeling like the app is just a spreadsheet with a skin. If Skipper never does anything interesting, what's the point?
- **Breaking point:** If the RPG elements feel hollow — just numbers going up with no soul. If there's nothing new to discover after the first week.
- **Day she's on:** Day 10. She's explored every page. She's bought some shop items. She's wondering what else there is.

## Step 1: Walk Through as Each Persona (parallel)

Run 4 agents in parallel. Each agent BECOMES their persona and walks through the entire product, reading the actual code — not CLAUDE.md summaries. Each agent should think in first person as their character.

**Every agent must:**
1. Read the homepage (`src/app/page.tsx`) and trace what renders for their persona's stage (Day 3 vs Day 14, etc.)
2. Read every component that renders on the homepage — understand what they see, in what order
3. Visit every other page (calendar, settings, shop, prizes) and read what's there for their usage stage
4. Interact with the Judge — read `JudgeModal.tsx` and the `/api/judge/route.ts` system prompt. How does the Judge feel to this persona?
5. Check the challenge system — read the challenge rendering in `page.tsx` and `storage.ts` challenge functions. Does this persona care?
6. Look at the shop and character system — read `SkipperCharacter.tsx`, `items.ts`, the shop page. Does this persona engage with this?

**Each agent should report:**

```
### [Persona Name] — Day [N] Experience

**What I love:**
[2-3 specific things this persona appreciates, with exact UI elements/copy]

**What confuses me:**
[2-3 specific moments of confusion or friction]

**What frustrates me:**
[2-3 things that actively push this persona away]

**What's missing for me:**
[1-2 things this persona wishes existed but doesn't]

**Would I keep using this?**
[Honest yes/no/maybe with one-sentence reasoning]

**The thing that would make me tell a friend:**
[One specific thing — or "nothing yet" if honest]
```

## Step 2: The Conflict Map

This is the most important step. After all four personas report, identify the **trade-offs** — places where serving one persona well hurts another.

For each conflict:
- **The design decision:** What the app currently does (be specific — reference exact code/UI)
- **Who it serves:** Which persona benefits and why
- **Who it alienates:** Which persona it hurts and why
- **The tension:** Is this a conscious choice or an accident?
- **Recommendation:** Who should win, and what (if anything) can soften the blow for the other side

Common areas where persona conflicts hide:
- **Tone:** Sassy/fun vs. serious/substantive (Maya and David want substance; Priya wants personality)
- **Complexity:** Feature depth vs. simplicity (Maya wants data and control; Jordan wants less)
- **Visual identity:** Cute/whimsical vs. mature/professional (Priya loves the penguin; David might cringe)
- **Progression pacing:** Fast gratification vs. earned achievement (Jordan wants quick wins; Maya wants meaningful milestones)
- **Content density:** Information-rich vs. clean/minimal (Maya wants more data; Jordan wants less UI)

## Step 3: The Core User Verdict

Based on the persona walkthroughs, answer the strategic question:

**Who is this product *actually* for right now?** Not who you want it to be for — who does the current product serve best? And who does it accidentally exclude?

Then answer: **Who *should* it be for?** Given the product's identity, competitive position, and the founder's vision, which 1-2 personas should be the primary audience? What does that mean for the others?

## Step 4: Present

```
## Persona Audit — [today's date]

### The Cast
[One line per persona — name, archetype, day, one-word verdict (thriving/surviving/struggling/gone)]

### Persona Reports
[Full reports from each agent, formatted per the template above]

### Conflict Map
[Each conflict as described in Step 2 — be specific about the trade-offs]

### Who This Product Is Actually For
[2-3 sentences — honest assessment of who the current product serves best]

### Who It Should Be For
[2-3 sentences — strategic recommendation, with reasoning]

### Recommendations
**Serve the core user better:**
1. [Change] — [file(s)] — [which persona benefits, which is affected]
2. ...

**Soften trade-offs for secondary personas:**
3. [Change] — [file(s)] — [how this helps without hurting the core]
4. ...

**Things to stop doing (serving a persona that isn't your target):**
5. [Thing] — [why it's diluting focus]

### What's Already Working
[Features or design choices that successfully serve multiple personas without trade-offs]
```

## Rules

- **Stay in character.** When you're Maya, think like Maya. Don't evaluate the app as a developer or product person — evaluate it as someone with her specific motivations and irritations. Use first person.
- **Read the actual code.** Every persona walks through the actual rendered UI. Read the JSX, the conditional rendering, the copy. What a user sees depends on their state — a Day 3 user and a Day 14 user may see very different things.
- **Conflicts are the point.** The most valuable output isn't "persona X likes this" — it's "this design decision serves persona X at the expense of persona Y." Those are the strategic choices the founder needs to see.
- **Don't try to make everyone happy.** A recommendation like "add a setting so each persona can customize" is usually wrong. Settings are where product decisions go to die. Pick a side and defend it.
- **The Casual is the canary.** If Jordan (the Casual) can't figure something out, most real users can't either. Jordan's confusion signals are the most important friction indicators, even if Jordan isn't the core user.
- **Respect the penguin.** Skipper and the RPG frame are core identity decisions. Don't recommend removing them because David might cringe. Instead, find ways to make the whimsy feel earned rather than childish. Tone is the lever, not removal.
- **Limit to 8-10 recommendations total.** Persona audits can generate endless findings. Ruthlessly prioritize the changes that resolve the biggest conflicts or serve the core user most directly.
- **Don't invent data.** You're simulating personas, not doing user research. Be honest about what you're guessing vs. what the code reveals. Your strength is in code-level specificity, not fake user interviews.
- **Think about Day 30.** Each persona is shown at a specific day, but also consider: where would they be in a month? Which persona's experience improves over time vs. plateaus?
