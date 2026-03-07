# /wrapup — Close out this session and prep for the next one

End-of-session housekeeping. Run this before closing a chat to make sure everything is clean for the next conversation.

## Steps

1. **Sync main branch:**
   - `git checkout main && git pull origin main`
   - Verify working tree is clean (`git status`)

2. **Check for dangling work:**
   - Any uncommitted changes? Warn the user.
   - Any local branches not pushed? List them.
   - Any open PRs? `gh pr list --state open` — note if any should be closed.

3. **Review CLAUDE.md for accuracy:**
   - Read CLAUDE.md sections that relate to work done this session.
   - If any file was added, removed, renamed, or had its exports changed — update the relevant CLAUDE.md section.
   - If a Known Issue was fixed — update or remove it.
   - Commit CLAUDE.md changes to main if any.

4. **Update memory files:**
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/MEMORY.md`
   - Update "Latest review" if a `/protocol` review was run this session.
   - Update "Recently Completed Work" with PRs merged this session.
   - If a strategic review was run, update `reviews.md` with the new review entry (and backfill any missing entries).
   - Do NOT add session-specific context or in-progress work details.

5. **Summary for user:**
   - One-line summary of what shipped this session.
   - Any open items or deferred work for next time.
   - Any PRs that should be closed (like superseded ones).

## Rules
- Do NOT push to remote without user approval.
- Do NOT delete branches without user approval.
- Do NOT merge PRs.
- Keep memory updates concise — MEMORY.md must stay under 200 lines.
