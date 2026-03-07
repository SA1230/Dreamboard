# /ship — Commit, push, and create a PR in one step

The user invoking `/ship` IS explicit approval to push. No extra confirmation needed.

## Steps

1. **Pre-flight checks (parallel):**
   - `npm run build` — must pass. If it fails, stop and fix.
   - `npx vitest run` — must pass. If tests fail, stop and fix.

2. **Flight control check:**
   - Read the flight manifest at `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/flight-manifest.md`
   - Run `gh pr list --state open` — check for open PRs that touch the same files
   - If conflicts detected, warn the user: "PR #X also modifies [files]. This PR may need a rebase after that one merges."
   - Update your Active Flights row status to "shipping"

3. **Rebase on latest main:**
   - `git fetch origin && git rebase origin/main` — ensures you have the latest changes
   - If rebase conflicts, stop and tell the user

4. **Apply deferred edits:**
   - If you have pending CLAUDE.md or MEMORY.md changes that were deferred during in-flight (per Flight Control Protocol), apply them NOW on top of the rebased code

5. **Stage and commit:**
   - `git status` to see what changed
   - `git diff --stat` to summarize the changes
   - Stage the relevant files (not `.env`, credentials, or unrelated files)
   - Write a commit message that explains WHY, not just what
   - Commit with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

6. **Push and create PR:**
   - `git push -u origin [branch-name]`
   - `gh pr create` with:
     - Short title (under 70 characters)
     - Body with `## Summary` (bullet points) and `## Test plan` (checklist)
   - Return the PR link

7. **Post-ship:**
   - Update the flight manifest: change status to "PR #X open"
   - Switch back to main: `git checkout main`
   - Do NOT merge the PR — user merges it themselves

## Rules
- If there's nothing to commit, say so and stop.
- If the current branch is `main`, create a new branch first (ask the user for a name or generate one from the changes).
- Always run build + tests before pushing. No exceptions.
- One PR per branch. If there are unrelated changes, warn the user.
- After returning the PR link, suggest running `/wrapup` if this looks like the last task of the session.
- If the flight manifest doesn't exist yet, skip the flight control steps gracefully — don't fail.
