# /sweep — Repository hygiene pass

Mechanical maintenance that accumulates silently between sessions. Run monthly, after shipping sprints, or when `/kickoff` mentions stale branches or memory approaching capacity.

## Steps

1. **Prune stale remote branches (parallel with step 2):**
   - Run `git branch -r --merged origin/main` to list remote branches already merged into main
   - Exclude `origin/main` and `origin/HEAD` from the list
   - Report the count: "Found X merged remote branches to prune"
   - Run `git push origin --delete <branch>` for each (batch with xargs if many)
   - Run `git remote prune origin` to clean local tracking refs
   - Report: "Pruned X stale remote branches"

2. **Regenerate skills-catalog.md (parallel with step 1):**
   - Read every `.claude/skills/*/SKILL.md` file
   - For each, extract: name, one-line purpose (from the `#` title line), when to use (from the skill description)
   - Regenerate `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/skills-catalog.md` from scratch, preserving the existing category structure:
     - Session Lifecycle: `/kickoff`, `/ship`, `/wrapup`
     - Strategic Analysis: `/protocol`, `/delight`, `/devil`, `/persona`, `/stranger`, `/storyteller`, `/observe`
     - Decision Support: `/thesis`, `/metrics`
     - Codebase Health: `/subtractor`, `/historian`, `/builder`, `/agent-zero`
     - Quality Assurance: `/qa`, `/probe`, `/guard` (if built)
     - Design & Marketing: `/announce`, `/recap`, `/snapshot`
     - Communication: `/eli5`
     - Repository Maintenance: `/sweep`
     - Debug Utilities: `/xp-debug`, `/xp-debug-off`
   - Preserve the "Skill Design Patterns", "Skill Relationships", and "Adding New Skills" sections
   - Update the footer with today's date and correct skill count

3. **Prune MEMORY.md:**
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/MEMORY.md`
   - Count current lines. If under 170, skip pruning
   - If over 170: archive the oldest entries from "Recently Completed Work" into `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/completed-work-archive.md` (create if needed, append if exists)
   - Keep only the last ~20-25 PRs in MEMORY.md's "Recently Completed Work"
   - Report: "Archived X PR entries, MEMORY.md now at Y/200 lines"

4. **Auto-archive stale memory:**
   - Read `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/MEMORY.md`
   - In the "Recently Completed Work" section, find PR entries older than 30 days
   - Move those entries to `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/completed-work-archive.md` (create if needed, append if exists)
   - Report: "Auto-archived X PR entries older than 30 days"
   - If no entries are old enough, skip silently

5. **Rotate failure journal:**
   - Read `.claude/hook-failures.log` (if it exists)
   - Remove entries older than 30 days
   - If the file is now empty, delete it
   - Report: "Rotated failure journal — removed X old entries" (or skip silently if no file)

6. **Audit CLAUDE.md project structure:**
   - Run `find .claude/skills/*/SKILL.md` to get actual skill files
   - Compare against the skills listed in CLAUDE.md's project structure section
   - Run `ls src/components/*.tsx src/lib/*.ts src/app/api/*/route.ts` to check for new files
   - Compare against CLAUDE.md's project structure
   - Report discrepancies: "CLAUDE.md is missing: [list]" or "CLAUDE.md lists files that no longer exist: [list]"
   - Do NOT auto-fix CLAUDE.md — just report. The user or `/guard` handles updates

7. **Summary:**

```
## Sweep Report — [date]

**Branches:** Pruned X merged remote branches (Y remain)
**Skills catalog:** Regenerated — now tracking Z skills
**MEMORY.md:** [at Y/200 lines / archived X old entries, now at Y/200 lines]
**Auto-archive:** [archived X stale PR entries / nothing to archive]
**Failure journal:** [rotated X old entries / clean / no journal file]
**CLAUDE.md accuracy:** [all entries match / X discrepancies found (listed above)]
```

## Rules
- This is a MAINTENANCE skill. It does mechanical cleanup, not creative work.
- Never delete unmerged branches. Only prune branches already merged into main.
- Never edit CLAUDE.md directly — only report discrepancies. Use `/guard` or manual updates for fixes.
- Never delete memory files — only archive (move content to archive file, preserving it).
- If in doubt about whether a branch is safe to delete, skip it and report it separately.
- Idempotent — running twice should produce no additional changes.
