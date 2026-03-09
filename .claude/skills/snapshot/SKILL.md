# /snapshot — Before/After Visual Diff

Generate a side-by-side before/after card showing a UI change. Captures the visual impact of what was shipped.

## Trigger

User invokes `/snapshot` after making a UI change. Can be invoked:
- `/snapshot` — auto-detects affected route from recent commits
- `/snapshot /vision` — specifies which route to snapshot
- `/snapshot homepage level-up` — specifies route + specific feature area

## Execution Steps

### 1. Determine the target route

If the user specified a route, use it. Otherwise, detect from the most recent commit:

```bash
git log -1 --name-only --format=""
```

Map changed files to routes:
- `src/app/page.tsx`, `src/components/StatCard.tsx`, etc. → `/` (homepage)
- `src/app/vision/*`, `src/components/Vision*` → `/vision`
- `src/app/shop/*` → `/shop`
- `src/app/calendar/*` → `/calendar`
- `src/app/settings/*` → `/settings`
- `src/app/prizes/*` → `/prizes`
- `src/components/LevelUpCelebration.tsx` → `/` (homepage, level-up state)

If multiple routes are affected, ask the user which one to snapshot.

### 2. Capture the "before" state

```bash
# Get the commit hash before the change
git log -2 --oneline --format="%H"
# First hash = current (after), second hash = before
```

1. Stash any uncommitted changes: `git stash`
2. Checkout the parent commit: `git checkout HEAD~1`
3. Ensure dev server is running (`preview_start` if needed, wait for ready)
4. Navigate to the target route
5. Take a screenshot with `preview_screenshot` → save the image ID as `before_image`
6. Return to the current state: `git checkout -` then `git stash pop` (if stashed)

### 3. Capture the "after" state

1. Ensure dev server is running on current code
2. Navigate to the same route
3. Take a screenshot with `preview_screenshot` → save the image ID as `after_image`

### 4. Upload both screenshots as Canva assets

```
upload-asset-from-url (before screenshot) → before_asset_id
upload-asset-from-url (after screenshot) → after_asset_id
```

Note: If screenshots aren't available as URLs, describe the change textually instead of uploading images.

### 5. Generate the before/after card

Call `generate-design` with `design_type: "instagram_post"` and include both asset IDs:

```
Before/after comparison card for "Dreamboard" app UI change.

Layout: Split card — left side "Before", right side "After" with the two uploaded images.
Top: Brief description of what changed (e.g., "Level-up celebrations now burst with gold confetti")
Bottom: "Dreamboard — Level Up Your Life"

Style: Warm earth tones (cream, stone, gold). Clean split layout with subtle divider.
Rounded friendly font. The "After" side should feel slightly more vibrant/elevated than "Before" to emphasize the improvement.
```

If image upload isn't possible, generate a text-based card instead:

```
Before/after card for "Dreamboard" — a gamified habit tracker app.

Layout: Split card with "Before" and "After" sections.
Left (Before): Text description of the old state
Right (After): Text description of the new state with subtle sparkle/glow to indicate improvement
Center: Arrow or transition element
Top: What changed
Bottom: "Dreamboard — Level Up Your Life"

Style: Warm cream and stone. Gold accents. Cozy RPG aesthetic.
```

### 6. Present and save

1. Show generated candidates with thumbnails
2. User picks one
3. `create-design-from-candidate` to save
4. Offer PNG export
5. Share Canva URL

## Safety

- Always return to the original git state after capturing "before" (checkout back, unstash)
- If the dev server needs a restart after checkout, handle it
- Never leave the repo on a detached HEAD
- If git operations fail, fall back to a text-only description card (no screenshots)

## Notes

- Internal-only — for tracking visual evolution of the product
- Over time, these cards create a visual changelog of the app's design journey
- Works best for visible UI changes (layout, animations, colors). Less useful for backend/logic changes
- Can suggest running this automatically after UI-related `/ship` commands in the future
