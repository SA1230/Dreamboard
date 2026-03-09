# /kickoff — Start a new session with full context

Run this at the beginning of a conversation to get oriented. Autonomous — no user input needed until the summary.

## Steps

1. **Sync main:**
   - `git fetch origin && git checkout main && git pull origin main`
   - Report if working tree is dirty (uncommitted changes from a previous session)

2. **Read memory (parallel):**
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/MEMORY.md`
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/reviews.md`
   - Note the latest review number, thesis, and status

3. **Check project state (parallel):**
   - `git log --oneline -10` — what shipped recently?
   - `gh pr list --state open` — any open PRs needing attention?
   - Only run build+test if the last CI run on main failed OR there are uncommitted changes. Otherwise skip and report "Build/Tests: skipped (main is clean per CI)". Check CI status with `gh run list --branch main --limit 1`
   - If build+test needed: `npm run build 2>&1 | tail -5` and `npx vitest run 2>&1 | tail -5`

4. **Check failure journal patterns:**
   - Read `.claude/hook-failures.log` (if it exists)
   - Group failures by type (lint, build, test) in the last 7 days
   - If 3+ failures of the same type: surface as a pattern alert ("Build has failed 5 times this week — investigate root cause")
   - If the file doesn't exist or has no recent entries: skip silently

5. **Surface deferred items:**
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/reviews.md`
   - Extract any items marked as "deferred", "Tier 3", or "not worth doing" from the most recent review
   - For each deferred item, note how many reviews it has survived (if it appears in multiple reviews, flag it as aging)
   - Include a "Deferred items aging" section if any item has been deferred 2+ reviews

6. **Present a session briefing:**

```
## Session Briefing

**Main branch:** clean / dirty
**Build:** passing / failing / skipped (CI clean)
**Tests:** X passing / Y failing / skipped (CI clean)
**Open PRs:** [list or "none"]

**Last session shipped:**
- [1-3 most recent PRs with one-line descriptions]

**Failure patterns (7d):**
- [Type]: X failures — [pattern note] (or "none")

**Deferred items (aging):**
- [Item] — deferred since Review #X (N reviews ago)
- [Item] — deferred since Review #X

**Ready for:** [what the natural next task is based on context]
```

## Rules
- This is READ-ONLY. Do not edit files, create branches, or make changes.
- Keep the briefing concise — the user wants context, not a wall of text.
- If the build is broken or tests fail, flag that as the top priority.
- If there are uncommitted changes, warn but do not discard them.
