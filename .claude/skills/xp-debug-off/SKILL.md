---
name: xp-debug-off
description: Remove the temporary XP debug button from the app.
---

# Remove XP Debug Button

1. Run `git checkout src/app/page.tsx` to discard the debug button injection.
2. Confirm by grepping for `"Debug XP"` — it should be gone.
3. Tell the user: "XP debug button removed. page.tsx is clean."
