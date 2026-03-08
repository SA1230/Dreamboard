# /ship — Build, commit, push, merge in one step

The user invoking `/ship` IS explicit approval to push AND merge. No extra confirmation needed.

## Steps

1. **Pre-flight checks (parallel):**
   - `npm run build` — must pass. If it fails, stop and fix.
   - `npx vitest run` — must pass. If tests fail, stop and fix.

2. **Self-review the diff:**
   - Run `git diff` (or `git diff --cached` if already staged) to see all changes
   - Review for:
     - **Bugs:** Null/undefined access, off-by-one errors, missing error handling
     - **Debug artifacts:** Console.logs, TODO comments, hardcoded test values, commented-out code
     - **Style drift:** Patterns that deviate from existing codebase conventions
     - **Type safety:** Unnecessary `any` types, missing type annotations on public functions
     - **Import hygiene:** Unused imports, missing imports that would cause runtime errors
   - If issues are found: fix them silently before proceeding. Do not ask — just fix obvious bugs and style violations
   - If a judgment call is needed: note it in the PR description but proceed

3. **Stage and commit:**
   - `git status` to see what changed
   - `git diff --stat` to summarize the changes
   - Stage the relevant files (not `.env`, credentials, or unrelated files)
   - Write a commit message that explains WHY, not just what
   - Commit with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

4. **Push and create PR:**
   - `git push -u origin [branch-name]`
   - `gh pr create` with:
     - Short title (under 70 characters)
     - Body with `## Summary` (bullet points) and `## Test plan` (checklist)

5. **Auto-merge:**
   - `gh pr merge --squash --delete-branch` — squash-merge the PR and clean up the branch
   - If merge fails (e.g. CI required, branch protection), report the error and return the PR link for manual merge

6. **Post-ship:**
   - `git checkout main && git pull origin main` — sync local main with the merge
   - Suggest running `/wrapup` if this looks like the last task of the session

## Rules
- If there's nothing to commit, say so and stop.
- If the current branch is `main`, create a new branch first (ask the user for a name or generate one from the changes).
- Always run build + tests before pushing. No exceptions.
- One PR per branch. If there are unrelated changes, warn the user.
- If auto-merge fails, don't panic — return the PR link and explain what blocked it.
