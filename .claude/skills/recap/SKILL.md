# /recap — Session Recap Card

Generate a visual recap card summarizing what was accomplished this session. Internal-only — for personal motivation and progress tracking.

## Trigger

User invokes `/recap` at the end of a session (or anytime they want a summary card).

## Execution Steps

### 1. Gather session data

Run these in parallel to build the recap:

```bash
# Commits landed this session (today's commits on main)
git log --since="6 hours ago" --oneline --format="%s"

# Files changed across those commits
git log --since="6 hours ago" --stat --format=""

# Lines added/removed
git log --since="6 hours ago" --pretty=tformat: --numstat | awk '{added+=$1; removed+=$2} END {print added, removed}'

# Open PRs (to note anything still in flight)
gh pr list --state open --limit 5
```

If no commits found in the last 6 hours, widen to 12 hours, then 24 hours. If still nothing, check the flight manifest and memory for what was worked on.

### 2. Compose the recap

Extract from the data:
- **Headline stat:** "3 PRs merged" or "174 lines shipped" — pick the most impressive number
- **Features list:** 2-4 bullet points of what was shipped (user-facing language, not technical)
- **Files touched:** Total count
- **Vibe word:** Pick one that fits the session — "productive", "surgical", "ambitious", "polish", "foundational"

### 3. Generate the card

Call `generate-design` with `design_type: "instagram_post"` (square, versatile):

```
Session recap card for "Dreamboard" — a gamified habit tracker app.

Layout: Clean, minimal card with warm earth tones (cream background, gold accents).
Top: "[Vibe word] session" in small caps
Center: The headline stat in large bold text (e.g., "3 features shipped")
Below: 2-4 short bullet points of what was accomplished
Bottom: "Dreamboard — Level Up Your Life" in small text
Date in corner.

Style: Warm cream and stone background. Gold accent color. Rounded friendly font similar to Nunito. Cozy RPG aesthetic — not corporate, not a dashboard. Think achievement card, not status report.
```

### 4. Present and save

1. Show all generated candidates with thumbnails
2. User picks one (or requests a different direction)
3. Call `create-design-from-candidate` to save it
4. Offer export (PNG recommended for saving/sharing)
5. Share the Canva design URL

## Notes

- This is internal-only — not for social media (no audience optimization)
- Keep it personal and motivating, like a journal entry
- If the session was small (1 fix, few lines), that's fine — celebrate consistency, not just big ships
- Can be wired into `/wrapup` as an optional final step in the future
