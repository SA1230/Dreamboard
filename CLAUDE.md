# CLAUDE.md

## What this project is

Dreamboard is a gamified personal habit tracker. Users earn XP by logging real-life activities across 8 stats (Strength, Wisdom, Vitality, Charisma, Craft, Discipline, Spirit, Wealth). Each stat levels up as XP accumulates. Think RPG character sheet for your daily life.

The core loop: User tells the Judge what they did → Judge interviews them (1-3 follow-ups) → Judge delivers a sassy verdict with variable XP → Stats update → Level up over time.

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 — warm earth tones, stone backgrounds, rounded cards
- **Icons:** lucide-react + 20 hand-drawn SVG icons in `StatIcons.tsx` (no other UI library)
- **Font:** Nunito (Google Font) loaded via `next/font/google` in `layout.tsx`
- **Auth:** NextAuth v5 (next-auth@5.0.0-beta.30) with Google OAuth — JWT sessions, no database yet
- **Storage:** Browser localStorage only — no database, no backend API except `/api/judge` and `/api/auth`
- **AI Judge:** Anthropic Claude Sonnet 4 (fallback: OpenAI GPT-4o) via `/api/judge` route — evaluates activities and awards variable XP
- **Charts:** None — we build visualizations with plain CSS/SVG (no recharts, no d3)
- **Animations:** 6 custom keyframe animations in `globals.css` (fadeIn, modalSlideUp, xpPop, levelUpGlow, levelUpText, particle)
- **Viewport:** Designed for mobile-width viewports (375–430px). No desktop breakpoints currently — do not add responsive layouts unless asked
- **Hosting:** Vercel (Production) — custom domain `dreamboard.net` (redirects to `www.dreamboard.net`)
- **Run locally:** `npm run dev` (port 3000) / `npm run build` to check for errors

## Project structure

```
src/
├── app/
│   ├── page.tsx            # Homepage — YesterdayReview, Judge CTA, level display, stat cards, monthly XP, activity log
│   ├── layout.tsx          # Root layout with Nunito font + global styles
│   ├── globals.css         # Tailwind base + 6 custom keyframe animations
│   ├── api/judge/route.ts  # POST endpoint — sends activity to AI judge, returns XP verdict
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth catch-all route — handles Google OAuth login/callback/session
│   ├── calendar/           # Month-at-a-glance view — daily XP totals with habit/damage icons, tap a day to see detail modal
│   ├── settings/           # Customize stat names, descriptions, colors, icons + enable/disable habits & damage
│   ├── shop/               # Power-Up Store — buy and equip cosmetic items on Skipper
│   └── prizes/             # Prize Track — dual-track timeline with system rewards (rank milestones) + user-created IRL prizes
├── components/
│   ├── StatCard.tsx         # One card per stat (icon fill effect, level, XP bar, streak flame, dormant dimming) — read-only, no + button
│   ├── MonthlyXPSummary.tsx # Monthly XP total with sparkline bar chart + trend vs last month
│   ├── JudgeModal.tsx       # Conversational AI judge — multi-turn chat, awards variable XP (1-10 per stat)
│   ├── ActivityLog.tsx      # Unified feed of all events (XP gains, habits, damage, level-ups, rank-ups, prize unlocks) with distinct visuals per type
│   ├── PrizeTimeline.tsx    # Horizontal scrollable dual-track timeline — system rewards (top) + user prizes (bottom) with fog of war
│   ├── MonthCalendar.tsx    # Calendar grid with per-day XP breakdown + habit/damage icons
│   ├── YesterdayReview.tsx   # Compact yesterday checklist — habit/damage toggles with emoji labels, PP summary row with toast
│   ├── SkipperCharacter.tsx # Inline SVG paper-doll — renders Skipper with layered equipment overlays
│   ├── StatIcons.tsx        # 20 SVG icons (8 stat defaults + 12 extras for customization)
│   ├── AuthProvider.tsx     # Client wrapper for NextAuth SessionProvider (used in layout.tsx)
│   └── UserMenu.tsx         # Login/logout button — shows Google avatar when signed in, "Sign in" when not
└── lib/
    ├── types.ts             # TypeScript types: StatKey, HabitKey, Activity, GameData, etc.
    ├── stats.ts             # Stat definitions, ColorPreset palettes, STAT_KEYS array
    ├── ranks.ts             # Rank titles, rank colors, rank progression helpers
    ├── prizes.ts            # System reward constants (derived from ranks), fog-of-war bracket helpers, MAX_USER_PRIZES
    ├── items.ts             # Item catalog (ITEM_CATALOG), rarity colors, slot definitions, helpers
    ├── itemSvgs.ts          # SVG content registry for equippable items (placeholder art)
    ├── storage.ts           # All data logic: load/save, addXP, leveling, habits, streaks, inventory, export, etc.
    └── auth.ts              # NextAuth v5 config — Google OAuth provider, JWT session strategy

.claude/
└── skills/
    ├── kickoff/SKILL.md        # /kickoff — session start: sync main, read memory, check build/tests/PRs, present briefing
    ├── protocol/SKILL.md       # /protocol — strategic review: 4-agent codebase analysis → tiered build list
    ├── ship/SKILL.md           # /ship — commit + push + create PR in one step (invoking = push approval)
    ├── wrapup/SKILL.md         # /wrapup — session end: sync main, check dangling work, update CLAUDE.md + memory
    ├── xp-debug/SKILL.md       # /xp-debug — injects temporary +5 XP debug button into page.tsx (never committed)
    └── xp-debug-off/SKILL.md   # /xp-debug-off — removes the debug button via git checkout
```

## Data model (defined in `src/lib/types.ts`)

- **StatKey** — one of 8 strings: `"strength"`, `"wisdom"`, `"vitality"`, etc.
- **HabitKey** — one of 6 strings: `"water"`, `"nails"`, `"brush"`, `"nosugar"`, `"floss"`, `"steps"`
- **DamageKey** — one of 4 strings: `"substance"`, `"screentime"`, `"junkfood"`, `"badsleep"`
- **PointsWallet** — `{ lifetimeEarned, lifetimeSpent }` — tracks Power Points spending (earned is always derived from source data)
- **Activity** — `{ id, stat, note, timestamp, amount?, verdictMessage? }` — one logged action. `amount` defaults to 1 for legacy entries; Judge awards variable amounts (1-10). `verdictMessage` stores the Judge's full sassy verdict text
- **Prize** — `{ id, name, unlockLevel, link?, createdAt }` — a user-created IRL prize that unlocks at a specific overall level
- **Challenge** — `{ id, description, stat, bonusXP, issuedAt, completedAt?, chainId?, chainIndex?, chainTotal? }` — a Judge-issued side quest. One active at a time. Chain fields are present when the challenge is part of a multi-step chain
- **ChainStep** — `{ description, stat, bonusXP }` — a pending step in a challenge chain, waiting to be issued
- **FeedEvent** — discriminated union (`type` field) for the activity feed. Types: `xp_gain`, `habit_completed`, `habit_removed`, `damage_marked`, `damage_removed`, `level_up`, `overall_level_up`, `rank_up`, `prize_unlocked`, `challenge_issued`, `challenge_completed`. Each has `id` + `timestamp` + type-specific fields. `xp_gain` events include optional `verdictMessage` with the Judge's verdict text
- **VisibleSlot** — one of 8 strings: `"head"`, `"chest"`, `"legs"`, `"robe"`, `"hands"`, `"feet"`, `"primary"`, `"secondary"` — SVG layers rendered on Skipper
- **HiddenSlot** — inventory-only slots (rings, ears, neck, shoulders, back, bracers, ranged) — no visual on character, for future stat items
- **EquipmentSlot** — `VisibleSlot | HiddenSlot`
- **ItemRarity** — `"common" | "uncommon" | "rare" | "epic" | "legendary"`
- **ShopItem** — `{ id, name, description, slot, rarity, cost, levelRequirement?, svgAssetKey?, overridesSlots? }` — item definition. `overridesSlots` lets robes hide chest+legs visuals
- **PlayerInventory** — `{ ownedItemIds: string[], equippedItems: Partial<Record<EquipmentSlot, string>> }` — owned items + slot-to-itemId mapping
- **GameData** — the root object stored in localStorage: `{ stats, activities, customDefinitions?, healthyHabits?, enabledHabits?, dailyDamage?, enabledDamage?, pointsWallet?, mascotOverrides?, feedEvents?, inventory?, prizes?, activeChallenge?, pendingChainSteps? }`
  - `healthyHabits` maps each `HabitKey` to an array of `"YYYY-MM-DD"` date strings (days the habit was completed)
  - `enabledHabits` is an array of `HabitKey` values that should be visible on the dashboard (defaults to the original 4 if not set)
  - `dailyDamage` maps each `DamageKey` to an array of `"YYYY-MM-DD"` date strings (days the damage was marked)
  - `enabledDamage` is an array of `DamageKey` values visible on dashboard (defaults to all 4 if not set)
  - `pointsWallet` stores `lifetimeSpent` only — `lifetimeEarned` is always recalculated from habit/damage history to prevent sync issues
  - `mascotOverrides` maps level thresholds to mascot image filenames in `public/mascots/` (e.g. `{ 1: "skipper-default.svg", 10: "skipper-cool.svg" }`). Uses threshold logic — picks highest key ≤ current level. Defaults to `skipper-default.svg`
  - `feedEvents` is an array of `FeedEvent` objects (newest first) — the unified activity feed that captures XP gains, habit toggles, damage toggles, level-ups, rank transitions, and prize unlocks. Pushed automatically by `addXP`, `toggleHabitForToday`, `toggleDamageForToday`, and `checkPrizeUnlocks`
  - `prizes` is an array of `Prize` objects — user-created IRL rewards that unlock at specific overall levels. Managed via the Prize Track page (`/prizes`)
  - `activeChallenge` is a `Challenge` object — one active side quest issued by the Judge. Only one at a time. Cleared on completion (awards bonus XP) or dismissal. Can be standalone or part of a chain (has `chainId`, `chainIndex`, `chainTotal`). Managed by `issueChallenge`, `issueChallengeChain`, `completeChallenge`, `dismissChallenge` in `storage.ts`
  - `pendingChainSteps` is an array of `ChainStep` objects — remaining steps in a challenge chain. When the current chain step is completed, the next pending step auto-issues as the new `activeChallenge`. Cleared when the chain completes or is dismissed
- **Per-stat leveling:** Fibonacci-ish XP thresholds per stat. Logic in `storage.ts` (`addXP`, `getXPForNextLevel`)
- **Overall player level:** EQ-inspired curve (max level 60) with "hell levels" at 30/35/40/45/50/55/59. Logic in `storage.ts` (`getOverallLevel`). Rank titles and colors now live in `ranks.ts` as the single source of truth — do not add rank definitions elsewhere

## Key patterns

- All state flows through `GameData` loaded from localStorage on mount in `page.tsx`
- Helper functions in `storage.ts` derive computed data (monthly totals, streaks, daily breakdowns, habit history)
- Components receive data as props — no global state library, no context
- Stat definitions (names, colors, icons) have defaults in `stats.ts` but can be overridden via `customDefinitions` in settings
- **Stat card dormancy:** Cards dim (opacity + desaturation) if the stat has zero activity this month (`isActiveThisMonth` prop)
- **Icon fill effect:** StatCard layers an unfilled ghost icon behind a filled icon that clips from bottom-up based on XP progress
- **Healthy Habits:** A separate system from stat XP — boolean-per-day toggles that don't award XP. Stored as date strings in `healthyHabits`. Users can enable/disable which habits appear via settings (`enabledHabits`). On the homepage, habits are reviewed retrospectively via `YesterdayReview` (yesterday only). The calendar page still uses `HealthyHabits.tsx` for per-day viewing
- **Daily Damage:** Mirrors healthy habits but tracks negative behaviors. Same date-string storage pattern. Same retrospective-only pattern on homepage via `YesterdayReview`. Each habit completed = +1 Power Point, each damage marked = -1 Power Point
- **YesterdayReview panel:** Compact checklist at the top of the homepage — emoji + label checkboxes for yesterday's habits and damage, with a PP summary row. Uses `getYesterdayString()` computed once at render time (handles midnight edge case). Toggles trigger a brief PP toast animation (+1 PP / -1 PP) inline next to the balance
- **Power Points (AA System):** Inspired by EverQuest's Alternate Advancement. `lifetimeEarned` is always derived from source data (total habit completions), never stored incrementally. `lifetimeSpent` is persisted. Balance is calculated day-by-day chronologically (habits minus damage per day, floored at 0 each day — no debt carries forward), then subtracts `lifetimeSpent`. Spent via the Power-Up Store (`/shop`)
- **Equipment system (EQ-inspired):** Visible slots (head, chest, legs, robe, hands, feet, primary, secondary) render as SVG overlays on Skipper. Hidden slots (rings, ears, neck, etc.) are inventory-only for future stat items. Robes use `overridesSlots` to visually hide chest+legs when equipped
- **SkipperCharacter component:** Inline SVG paper-doll that renders Skipper with layered equipment. Items are `<g>` groups from `itemSvgs.ts` inserted at z-order positions (feet → arms → weapons → body → armor → head → face). Uses `dangerouslySetInnerHTML` for item SVGs (safe — content is from our own registry)
- **`LevelDisplay` component** now uses `SkipperCharacter` instead of `<img>`. Lives in `src/components/LevelDisplay.tsx`. Accepts `equippedItems` prop. Shows Skipper inside SVG progress ring with level badge and rank title. Parallax tilt + shatter animation on level-up
- **Data export:** `exportGameData()` in `storage.ts` downloads a full JSON backup. Button lives in the Activity Log section
- **Mascot system:** Skipper the penguin base SVG paths are inlined in `SkipperCharacter.tsx`. `getMascotForLevel()` in `storage.ts` still exists for future per-level base variants via `mascotOverrides` in GameData
- **XP Judge:** The sole way to earn XP. A conversational AI (via `/api/judge`) evaluates user-described activities, asks up to 3 follow-up questions, then awards 1-10 XP per stat. Triggered from a centered CTA card on the homepage (hero penguin avatar from `public/mascots/judge-hero.svg`). The hero avatar also appears in the JudgeModal header and next to each judge message
- **Prize Track:** Separate from the Shop (level-based rewards vs currency-based purchases). Dual-track horizontal timeline: system rewards (rank titles) on top, user-created IRL prizes on bottom, level progression line in the center. Fog of war hides future brackets — current rank bracket is fully visible, next bracket is teased/dimmed, beyond is hidden. Auto-unlock when level is reached (no claim step), generates `prize_unlocked` feed event. `checkPrizeUnlocks` is called on homepage mount and prizes page mount
- **Challenge system (Side Quests):** The Judge occasionally issues challenges alongside verdicts — one at a time, ~1 in 4-5 verdicts, only when contextually clever. Two formats: standalone (single challenge) and chains (2-3 progressive steps that build on each other). Chains store the first step as `activeChallenge` (with `chainId`, `chainIndex`, `chainTotal`) and remaining steps in `pendingChainSteps`. When a chain step completes, the next step auto-issues. The Judge detects completion during normal activity evaluation. Challenge card is rendered inline in `page.tsx` between the Captain CTA and LevelDisplay — shows "Step X of Y" with progress dots for chains. Challenges generate `challenge_issued` and `challenge_completed` feed events in the ActivityLog
- **Error handling:** Errors in `JudgeModal` are caught and displayed as a red system message inline in the chat thread, with a "Dismiss" button. Loading state always resets. Follow this pattern (in-place error display, no retry logic, user-dismissable) for any new API-dependent features

## Key exports in `stats.ts`

- `StatDefinition` (type) — shape of a single stat's config (name, description, color, icon)
- `ColorPreset` (type) — shape of a color palette option
- `STAT_KEYS: StatKey[]` — canonical array of the 8 stat key strings
- `STAT_DEFINITIONS: Record<StatKey, StatDefinition>` — default definitions for all 8 stats
- `COLOR_PRESETS: ColorPreset[]` — 14 color palette presets available in settings

## Key exports in `ranks.ts`

- `RANK_TITLES: [number, string][]` — level thresholds paired with rank names (Novice at 1 → Transcendent at 60)
- `RANK_COLORS: Record<number, [string, string]>` — hex color pairs (start, end) for each rank threshold
- `getRankTitle(level)` — returns rank name for a given overall level
- `getNextRankTitle(level)` — returns next rank name, or null at max rank
- `getRankProgress(level, levelFraction?)` — returns 0–1 progress through current rank bracket
- `getRankColorPair(level)` — returns [startColor, endColor] for current rank
- `interpolateHexColor(hexA, hexB, t)` — linearly interpolates between two hex colors

## Key exports in `prizes.ts`

- `SystemReward` (type) — `{ level, title, description }` — a system-granted reward at a rank threshold
- `SYSTEM_REWARDS: SystemReward[]` — 13 entries derived from `RANK_TITLES` in `ranks.ts`
- `MAX_USER_PRIZES = 15` — soft cap on user-created prizes
- `getCurrentBracket(level)` — returns `{ start, end }` for the rank bracket containing the given level
- `getVisibleRange(level)` — returns which brackets are fully visible vs teased (fog of war logic)

## Key exports in `items.ts`

- `RARITY_COLORS: Record<ItemRarity, { text, background, border }>` — color scheme per rarity tier
- `VISIBLE_SLOTS: { slot, label }[]` — all visible slot names for shop UI tabs
- `ITEM_CATALOG: ShopItem[]` — full item catalog (13 items across all 8 visible slots)
- `getItemById(id)` — lookup a single item by ID
- `getItemsBySlot(slot)` — filter items by equipment slot
- `getAffordableItems(balance, level)` — items the player can buy right now

## Key exports in `itemSvgs.ts`

- `ITEM_SVG_REGISTRY: Record<string, string>` — raw SVG strings for each item, keyed by `svgAssetKey`. Designed in Skipper's coordinate space (viewBox `330 245 450 665`). Hand-crafted paths using Skipper's 4-color palette + rarity accent colors
- `ITEM_THUMBNAIL_REGISTRY: Record<string, string>` — standalone SVG strings for shop card icons (viewBox `0 0 64 64`). Separate compositions from on-character art, optimized for small card display

## Key exports in `storage.ts`

- `loadGameData()` / `saveGameData(data)` — localStorage read/write
- `addXP(data, statKey, note, amount?, verdictMessage?)` — log XP (default 1, Judge passes variable amounts), handle level-up, save. `verdictMessage` stores the Judge's sassy verdict text on the Activity and feed event
- `getXPForNextLevel(level)` — per-stat Fibonacci thresholds
- `getOverallLevel(totalXP)` — overall player level (EQ curve, max 60)
- `getTotalLevel(data)` — sum of all per-stat levels
- `getEffectiveDefinitions(data)` — merge custom overrides with defaults
- `saveCustomDefinitions(data, overrides)` / `resetCustomDefinitions(data)`
- `getActivitiesByDay(activities, year, month)` — XP grouped by calendar day
- `getStatStreaks(activities)` — consecutive-day streak per stat
- `getMonthlyXPTotals(activities)` — current vs last month XP
- `isHabitCompletedToday(data, habitKey)` / `toggleHabitForToday(data, habitKey)`
- `getHabitsByDay(data, year, month)` — habits grouped by calendar day
- `getEnabledHabits(data)` / `saveEnabledHabits(data, habits)` — which habits are visible on dashboard
- `isDamageMarkedToday(data, damageKey)` / `toggleDamageForToday(data, damageKey)` — daily damage toggle
- `getDamageByDay(data, year, month)` — damage grouped by calendar day
- `getEnabledDamage(data)` / `saveEnabledDamage(data, enabledDamage)` — which damage types are visible on dashboard
- `calculateLifetimePoints(data)` — derives total Power Points earned from habit/damage history
- `getPointsBalance(data)` — returns `{ lifetimeEarned, lifetimeSpent, balance }`
- `spendPoints(data, amount)` — deducts from wallet (returns null if insufficient balance)
- `getInventory(data)` — returns PlayerInventory (with defaults if not set)
- `purchaseItem(data, itemId)` — buy an item: validates ownership/balance, deducts points, adds to ownedItemIds
- `equipItem(data, itemId)` — equip an owned item to its slot
- `unequipSlot(data, slot)` — remove item from a slot
- `getMascotForLevel(level, overrides?)` — returns mascot image path for a given overall level (threshold logic)
- `exportGameData(data)` — JSON file download
- `getPrizes(data)` — returns sorted prizes (by unlockLevel)
- `addPrize(data, name, unlockLevel, link?)` — creates prize, enforces 15 cap, returns updated GameData or null
- `updatePrize(data, prizeId, updates)` — partial update, returns updated GameData or null
- `deletePrize(data, prizeId)` — removes prize, returns updated GameData
- `checkPrizeUnlocks(data, currentLevel)` — generates `prize_unlocked` feed events for newly unlocked prizes (deduplicates against existing events)
- `getActiveChallenge(data)` — returns `data.activeChallenge ?? null`
- `issueChallenge(data, description, stat, bonusXP)` — creates standalone Challenge, stores in `activeChallenge`, pushes `challenge_issued` feed event
- `issueChallengeChain(data, steps)` — creates a chain: first step becomes `activeChallenge` (with `chainId`, `chainIndex`, `chainTotal`), remaining steps stored in `pendingChainSteps`
- `completeChallenge(data)` — marks challenge completed, awards bonus XP via `addXP()`, pushes `challenge_completed` feed event. If chain step, auto-issues next step from `pendingChainSteps`. Returns `{ newData, nextChainStep }` or null
- `dismissChallenge(data)` — removes active challenge and any pending chain steps without completing (no feed event)

## Visual Design System

This section exists because design changes are the easiest to mess up. Follow these rules strictly when modifying any visual element.

### Color Palette

- **Background:** Warm cream/stone tones (Tailwind `stone-50` / `stone-100` range) — NEVER pure white
- **Primary accent:** Gold/dark gold for CTA buttons, highlights, Skipper's ring border
- **Text:** Dark charcoal/navy for headings, medium warm gray for body
- **Stat category colors:** Defined in `stats.ts` `ColorPreset` palettes — each stat has its own muted color. These are user-customizable via settings. Never hardcode assumptions about which color maps to which stat
- **Positive feedback:** Mint/teal green for XP pills, active states, habit completion
- **Negative feedback:** Red for Daily Damage cards, destructive actions, the Danger Zone
- **Inactive/dormant states:** Reduced opacity + desaturation (existing `isActiveThisMonth` pattern)

### Visual Rules — Do NOT

- Do not introduce colors outside the existing palette (check `stats.ts` and `globals.css`)
- Do not add drop shadows or box shadows (the app uses border + background tint for elevation)
- Do not add gradients (except the existing gold CTA button)
- Do not use pure white (`#FFFFFF`) or pure black (`#000000`) — use the warm stone tones and dark charcoal
- Do not change the Nunito font
- Do not replace hand-drawn SVG icons with a different icon library
- Do not add emojis to UI components (settings uses emojis for habit/damage items, but dashboard cards do not)
- Do not make it look like a fitness app, corporate dashboard, or children's game — it should feel like a cozy RPG companion

### Visual Rules — Do

- Maintain the warm, approachable, earth-toned aesthetic throughout
- Use rounded corners on cards and buttons (existing Tailwind `rounded-xl` / `rounded-2xl` patterns)
- Use colored background tints (not borders) to associate cards with their stat category
- Keep animations subtle and fast — the existing 6 keyframe animations in `globals.css` set the standard
- When adding new visual elements, match the weight and style of existing ones

## The Judge (Skipper) — Personality & Behavior

This section governs the AI system prompt in `/api/judge/route.ts` and how `JudgeModal` presents the conversation. Do not modify the Judge's personality without explicit approval.

### Tone

- **Sassy but warm** — roasts you lovingly, never meanly
- **Honest** — calls out exaggerations and BS, but always gives credit where due
- **Encouraging** — even when giving less XP, frames it positively
- **Specific** — references details from what the user said, doesn't give generic responses
- **Witty** — uses humor, wordplay, and unexpected observations
- **Brief** — verdicts should be 2-4 sentences, not essays

### Example of GOOD Judge tone

> "Five hours for five miles? That's a leisurely stroll, not a run. But hey, you got outside and moved for five straight hours — that's commitment to being vertical. I'll give you credit for the endurance, even if your pace suggests you stopped to admire every leaf along the way."

### Example of BAD Judge tone

> "Great job going on a run! Running is a wonderful form of exercise. Keep up the good work!"

*(Too generic, no personality, no specificity)*

### Interview Behavior

- Ask 1-3 follow-up questions to verify/understand the accomplishment
- Questions should be specific to what the user said (not generic)
- Vary the questions between sessions — don't always ask the same things
- Catch obvious exaggerations and address them with humor, not punishment

### Verdict Behavior

- Award 1-10 XP to 1-3 relevant stat categories
- The XP amount should reflect actual effort/accomplishment
- One activity CAN earn XP across multiple categories (a hike with friends = Vitality + Strength + Charisma + Spirit)
- Explain the reasoning with personality, not just a number
- If awarding low XP, be funny about it rather than harsh

## Known Issues & Planned Improvements

These are documented product-level issues. Reference this section when working on related features to avoid reintroducing them or building on top of broken patterns.

- **Habits/Damage disconnected from XP:** Healthy Habits and Daily Damage are a separate system from stat XP. They earn/subtract Power Points but this connection isn't fully visible to users. The YesterdayReview panel helps by showing PP impact inline, but the two halves (Judge + stats vs. habits + damage) still feel like parallel systems.
- **Judge CTA redundancy:** The compact CTA bar and the floating FAB both open JudgeModal. FAB is hidden for first-run users (they see the hero CTA), but returning users see both the CTA bar and the FAB.
- **Calendar empty state:** Calendar shows full 31-day grid but early in the month most cells are empty. Looks barren for new users.

## ⚠ Using this context correctly

The sections above are a **map, not the source of truth.** They may be outdated. Before making any change:

1. **Always read the actual file(s) you plan to edit.** The summaries above tell you *where* to look — they don't tell you what's currently in the code.
2. **If a task touches `storage.ts` or `page.tsx`, read the relevant functions first** — these files evolve the most and the summaries above won't capture new helpers or changed signatures.
3. **If you're unsure whether a helper function already exists, check `storage.ts` before writing a new one.** Duplicating logic is worse than spending one tool call to read the file.

## How to work with me

0. **Never push to remote without my explicit approval.** After committing, always stop and ask "Ready to push?" before running `git push`. This applies every single time — no exceptions, no assumptions.

0.5. **Always sync main before starting new work.** At the start of every session or before creating a new branch, run `git fetch origin && git checkout main && git pull origin main` to make sure local main is up to date with remote. Then branch from there.

1. **Explain your plan in plain English before writing any code.** Before touching a single file, tell me what you're going to do in 2-3 sentences. Say which files you'll change and why. Wait for my approval before proceeding.

2. **Make the smallest possible change that solves the problem.** Do not refactor, reorganize, or "improve" anything beyond what I asked for. One task = one focused change. If you think something else should be fixed, mention it separately — don't just do it.

3. **If my request is ambiguous, ask me one clarifying question before starting.** Never guess what I meant. Ask a single, specific question. Do not ask multiple questions at once.

4. **After every change, tell me how to verify it works.** Give me the exact command to run or the exact thing to check in the browser. Do not assume I know how to test things.

5. **Do one step at a time — never chain multiple changes together.** If a task has multiple steps, do step 1, show me the result, then move to step 2. Do not combine steps into one giant edit.

6. **When I hit an error, explain what the error means before fixing it.** Read the error message to me in plain English. Tell me why it happened. Then fix it. This is how I learn.

7. **Use plain, descriptive names for everything.** Variables, functions, files — name them so a beginner can guess what they do. No abbreviations, no single-letter variables, no clever names.

8. **Keep your responses short.** No preambles. No summaries of what you already did. No "Great question!" filler. Just the plan, the code, and the verification step.

9. **Never install a new dependency without telling me why.** If you want to add a package, library, or tool, explain in one sentence what it does and why we need it. Wait for my OK.

10. **Never delete code or files without asking first.** If you think something should be removed, tell me what and why. Let me decide.

11. **When you run a terminal command, tell me what it does.** Before or after running a command, give me a one-line explanation. Example: "This starts the development server so we can see changes in the browser."

12. **Write commit messages that explain why, not just what.** Bad: "Update index.js" Good: "Add login button to homepage so users can sign in"

13. **Match the patterns already in the codebase.** If the project uses a certain file structure, naming convention, or coding style, follow it. Do not introduce new patterns without discussing it first.

14. **When showing me code, point to the exact file and line number.** Don't just say "in the component." Say "in src/components/Header.jsx, line 42."

15. **Prefer the simplest solution that works.** Do not over-engineer. No premature abstractions. If a simple if/else works, don't build a lookup table. We can refactor later when there's a real reason to.

16. **Read the relevant file before editing it.** Always read the current state of a file before making changes. Do not assume you know what's in it from earlier in the conversation.

17. **When something could be done multiple ways, pick one and tell me why.** Do not present me with three options and ask me to choose unless the tradeoffs genuinely matter. You're the expert — make a recommendation and explain your reasoning briefly.

18. **Pin specific versions when installing packages.** Use exact version numbers, not ranges. Example: `npm install react@18.2.0` not `npm install react`.

19. **After completing a task, give me a one-line summary of what changed.** Just one line. Example: "Added a /login route that shows a username and password form." No bullet-point recaps.

20. **If I ask "what does this do?", explain it like I'm smart but unfamiliar.** Don't dumb it down to the point of being patronizing. Don't assume jargon I haven't used. Find the middle ground — clear, accurate, concise.

21. **Keep CLAUDE.md accurate after structural changes.** If your change adds a new file, new type, new exported function, or changes a key pattern documented in CLAUDE.md, update the relevant section of CLAUDE.md in the same commit. Don't update it for small bug fixes or styling tweaks — only when the doc would become misleading without the update.
