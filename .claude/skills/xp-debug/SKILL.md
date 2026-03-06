---
name: xp-debug
description: Inject a floating +5 XP debug button into the app for testing. Temporary only — never committed or pushed.
---

# XP Debug Mode

Inject a temporary floating debug button into `src/app/page.tsx` that awards +5 XP to a random stat on each tap. This is for local testing only.

## Steps

1. **Check if already injected.** Grep `src/app/page.tsx` for `"Debug XP"`. If found, tell the user "XP debug button is already active" and stop.

2. **Inject the debug button.** Find the closing `</main>` tag in `src/app/page.tsx` and insert this block immediately BEFORE it:

```tsx
{/* DEBUG: +5 XP button — do not merge */}
<button
  onClick={() => {
    const randomStat = STAT_KEYS[Math.floor(Math.random() * STAT_KEYS.length)];
    const result = addXP(gameData, randomStat, "Debug XP", 5);
    setGameData(result.newData);
    if (result.leveledUp) {
      setXpGainedStat(randomStat);
    }
  }}
  className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full text-white font-bold text-xs shadow-lg active:scale-90 transition-transform"
  style={{ background: "linear-gradient(135deg, #dc2626, #f97316)" }}
>
  +5 XP
</button>
```

3. **Verify** `addXP`, `STAT_KEYS`, `gameData`, and `setGameData` are already in scope in `page.tsx`. They should be — do not add imports.

4. **Tell the user:** "XP debug button injected — red/orange circle, bottom-right corner. Tap it to add +5 XP to a random stat. This is NOT committed and will disappear on git checkout or stash. Run `/xp-debug-off` or just `git checkout src/app/page.tsx` to remove it."

## Rules

- **NEVER commit** this change. Not even to a test branch.
- **NEVER push** anything while this is active.
- **NEVER stash** it for later — it's trivial to re-inject.
- If the user asks to commit or push while the debug button is present, warn them and remove it first.
