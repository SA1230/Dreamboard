# /protocol — Strategic Review Protocol

You are running a strategic review of the Dreamboard codebase. This is an autonomous analysis — do the research, synthesize findings, and present a ranked build list. No user input needed until the final output.

## Step 1: Gather Context (parallel)

Run these in parallel:

**Agent A — Momentum check:**
- Read the memory files in `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/` for past session context
- Run `git log --oneline -20` to see what was recently shipped
- Run `git branch -a` to check for any in-flight work
- Run `gh pr list --state open` to see open PRs (if gh is available, otherwise skip)
- Summarize: what direction has the project been heading? What just landed?

**Agent B — Codebase inventory:**
- List all routes (src/app/**/page.tsx), components (src/components/*.tsx), and lib files (src/lib/*.ts) with rough line counts
- Check package.json for dependencies — anything outdated or unused?
- Look for TODO, FIXME, or HACK comments in the code
- Check if any test files exist and note their coverage areas
- Summarize: what's large/complex, what's new, what looks stale?

**Agent C — UX audit:**
- Read each page file and understand the user flow
- Check the Known Issues section of CLAUDE.md — are they still present in actual code?
- Look for new issues not yet documented (label mismatches, dead code, missing edge cases, confusing UX flows)
- Note anything that would frustrate a first-time user vs a returning user
- Summarize: what works, what's broken, what's missing?

**Agent D — Build health:**
- Run `npm run build` and report any errors or warnings
- Check if tests pass: `npx vitest run` (if vitest is configured)
- Note any TypeScript errors, unused imports, or lint issues in the output
- Summarize: is the codebase healthy or are there fires to put out first?

## Step 2: Synthesize

After all agents report back, synthesize into three categories:

1. **Bugs & Debt** — Things that are broken, inconsistent, or confusing right now. These erode trust.
2. **UX Polish** — Things that work but could feel significantly better with small changes. These build delight.
3. **Features** — New capabilities that would meaningfully expand what users can do. These drive engagement.

For each item, note:
- **What:** One-sentence description
- **Where:** Exact files and functions involved
- **Effort:** S (< 30 min), M (1-2 hours), L (half day+)
- **Impact:** How much this improves the daily user experience (low / medium / high)

## Step 3: Rank and Present

Present the final output in this format:

```
## Strategic Review — [today's date]

### Project Momentum
[2-3 sentences on recent direction and velocity]

### Build Health
[One line: clean / warnings / broken]

### Ranked Build List

**Tier 1 — Do next (high impact, low effort)**
1. [Item] — [effort] — [files] — [why it matters]
2. ...

**Tier 2 — Do this week (high impact, medium effort)**
3. ...

**Tier 3 — Plan for later (high impact, high effort OR medium impact)**
5. ...

### Not Worth Doing Right Now
[Anything you considered but rejected, with brief reason]
```

## Rules

- Be specific. "Fix the labels" is bad. "In DailyDamage.tsx line 42, change 'No substances' to 'Substances' to match the damage-logging mental model" is good.
- Check what actually exists in the code before proposing changes. Read the file first.
- Don't propose things that were recently shipped (check git log).
- Don't propose things that have open PRs or branches (check git branch).
- If the build is broken, that's Tier 0 — fix it before anything else.
- Limit to 8-10 ranked items. This is a focused build list, not a backlog dump.
- Each tier should have 2-4 items max. If everything is Tier 1, nothing is.
