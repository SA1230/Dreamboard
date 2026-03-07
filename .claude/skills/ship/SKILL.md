# /ship — Commit, push, and create a PR in one step

The user invoking `/ship` IS explicit approval to push. No extra confirmation needed.

## Steps

1. **Pre-flight checks (parallel):**
   - `npm run build` — must pass. If it fails, stop and fix.
   - `npx vitest run` — must pass. If tests fail, stop and fix.

2. **Stage and commit:**
   - `git status` to see what changed
   - `git diff --stat` to summarize the changes
   - Stage the relevant files (not `.env`, credentials, or unrelated files)
   - Write a commit message that explains WHY, not just what
   - Commit with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

3. **Push and create PR:**
   - `git push -u origin [branch-name]`
   - `gh pr create` with:
     - Short title (under 70 characters)
     - Body with `## Summary` (bullet points) and `## Test plan` (checklist)
   - Return the PR link

4. **Post-ship:**
   - Switch back to main: `git checkout main`
   - Do NOT merge the PR — user merges it themselves

## Rules
- If there's nothing to commit, say so and stop.
- If the current branch is `main`, create a new branch first (ask the user for a name or generate one from the changes).
- Always run build + tests before pushing. No exceptions.
- One PR per branch. If there are unrelated changes, warn the user.
- After returning the PR link, suggest running `/wrapup` if this looks like the last task of the session.
