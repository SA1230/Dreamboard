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
   - `npm run build 2>&1 | tail -5` — is the build clean?
   - `npx vitest run 2>&1 | tail -5` — do tests pass?

4. **Present a session briefing:**

```
## Session Briefing

**Main branch:** clean / dirty
**Build:** passing / failing
**Tests:** X passing / Y failing
**Open PRs:** [list or "none"]

**Last session shipped:**
- [1-3 most recent PRs with one-line descriptions]

**Deferred from last review:**
- [Items from Tier 3 / Not Worth Doing that might be worth revisiting]

**Ready for:** [what the natural next task is based on context]
```

## Rules
- This is READ-ONLY. Do not edit files, create branches, or make changes.
- Keep the briefing concise — the user wants context, not a wall of text.
- If the build is broken or tests fail, flag that as the top priority.
- If there are uncommitted changes, warn but do not discard them.
