# /guard — Pre-ship documentation gate

Checks whether code changes have left CLAUDE.md or MEMORY.md stale. Run between finishing code and invoking `/ship`. Prevents the doc-only follow-up PR pattern.

## Steps

1. **Detect structural changes:**
   - Run `git diff --name-status` (or `git diff --name-status --cached` if staged) to see all changed files
   - Categorize changes:
     - **New files** (A) — especially in `src/components/`, `src/lib/`, `src/app/api/`, `.claude/skills/`
     - **Deleted files** (D) — files that CLAUDE.md might still reference
     - **Renamed files** (R) — old name may still be documented
     - **Modified type files** — changes to `types.ts`, `stats.ts`, `ranks.ts`, `items.ts`, `storage.ts`

2. **Check CLAUDE.md accuracy:**
   - For each new file: is it listed in the project structure section?
   - For each deleted file: is it still listed in the project structure section?
   - For modified `storage.ts`: scan for new exported functions (`export function/const`) and check if they're in the "Key exports in storage.ts" section
   - For modified `types.ts`: scan for new type/interface exports and check if they're in the "Data model" section
   - For new API routes: check if they're listed in the API routes section
   - For new skills: check if they're listed in the project structure skills section
   - For new components: check if they're listed in the components section

3. **Check MEMORY.md accuracy:**
   - For new skills: check if they're in the skills section of MEMORY.md with a trigger description
   - For new skills: check if they're in `skills-catalog.md`

4. **Report:**

```
## Guard Report

**Files changed:** X new, Y modified, Z deleted

### Documentation gaps found:
- [ ] CLAUDE.md: [specific gap, e.g. "New component FooBar.tsx not in project structure"]
- [ ] CLAUDE.md: [specific gap, e.g. "New export `getFoo()` in storage.ts not documented"]
- [ ] MEMORY.md: [specific gap, e.g. "New skill /sweep not in skills section"]

### No gaps found:
- [x] All new files documented in CLAUDE.md
- [x] All exports documented
```

5. **Auto-fix (with confirmation):**
   - For each gap found, propose the specific edit
   - Apply fixes to CLAUDE.md and MEMORY.md
   - Show the diff of documentation changes
   - These doc changes get included in the same commit as the code changes (no follow-up PR needed)

## Rules
- This is a DOCUMENTATION skill. It reads code diffs and checks docs — it does not modify application code.
- Focus on structural changes only. A bug fix in an existing function does not need a CLAUDE.md update.
- When in doubt, flag it rather than stay silent. A false positive is better than stale docs.
- Do not update the "Recently Completed Work" section — that's `/wrapup`'s job.
- Keep proposed doc edits minimal. Match the existing style and level of detail in CLAUDE.md.
- If no gaps are found, say so in one line and stop. Don't pad the report.
