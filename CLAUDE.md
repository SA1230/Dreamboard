# CLAUDE.md

## What this project is

Dreamboard is a gamified personal habit tracker. Users earn XP by logging real-life activities across 8 stats (Strength, Wisdom, Vitality, Charisma, Craft, Discipline, Spirit, Wealth). Each stat levels up as XP accumulates. Think RPG character sheet for your daily life.

The core loop: User tells the Judge what they did → Judge interviews them (1-3 follow-ups) → Judge delivers a sassy verdict with variable XP → Stats update → Level up over time.

## Flight Control Protocol (multi-session coordination)

Multiple Claude Code sessions may run in parallel on this repo. This protocol prevents collisions. **Follow it automatically in every session — no user invocation needed.**

The shared state file lives at `~/.claude/projects/-Users-shiroy-Dreamboard-clone/memory/flight-manifest.md`. It is NOT in git — agents read/write it directly without merge conflicts.

### Pre-flight (session start)

1. **Read the flight manifest** — check Active Flights for tasks already claimed
2. **Check open PRs** — run `gh pr list --state open` to see what's in flight
3. **Check remote branches** — run `git branch -r` to see active work
4. **Claim your task** — before starting any work, add a row to the manifest's Active Flights table with your branch name, task description, and timestamp
5. **If your task is already claimed or has an open PR** — STOP. Tell the user: "This task is already being handled by [branch/PR]. Want me to do something else?"

### In-flight (while working)

1. **Controlled Airspace files** — do NOT edit `CLAUDE.md`, `MEMORY.md`, `package.json`, or `src/lib/types.ts` during active work. Accumulate your intended edits mentally and apply them during landing
2. **Branch naming** — use `feat/<task-name>` format. If the branch already exists remotely, append a suffix (e.g., `feat/task-name-v2`)
3. **Don't touch other agents' state** — if you see unfamiliar stashes, branches, or lock files, leave them alone. Report them to the user if they block you
4. **If `git index.lock` exists** — wait 5 seconds and retry. If it persists, tell the user rather than deleting it

### Landing (shipping)

1. **Rebase on latest main** — `git fetch origin && git rebase origin/main` before committing
2. **Apply controlled-airspace edits NOW** — after rebasing, you have the latest versions. Make your CLAUDE.md/MEMORY.md edits here, on top of whatever other agents have landed
3. **Run build + tests** — `npm run build && npx vitest run` must both pass
4. **Check for conflicts** — run `gh pr list --state open` again. If another open PR touches the same files you're editing, warn the user about potential merge conflicts
5. **Ship** — commit, push, create PR
6. **Update the manifest** — change your Active Flights status to "PR #X open"

### Collision avoidance rules

- **One task per session.** Don't combine unrelated changes in one branch/PR
- **Never force-push.** If your push is rejected, rebase and try again
- **If two PRs both need to edit CLAUDE.md** — the second PR should note in its description that it needs a rebase after the first merges. The user merges PRs one at a time and the second agent can rebase
- **Stale flight detection** — if an Active Flight has been in the manifest for more than 24 hours with no status change, it's probably abandoned. Note it to the user but don't remove it yourself

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 — warm earth tones, stone backgrounds, rounded cards
- **Icons:** lucide-react + 20 hand-drawn SVG icons in `StatIcons.tsx` (no other UI library)
- **Font:** Nunito (Google Font) loaded via `next/font/google` in `layout.tsx`
- **Auth:** NextAuth v5 (next-auth@5.0.0-beta.30) with Google OAuth — JWT sessions, profile upsert to Supabase on sign-in
- **Database:** Supabase (Postgres) — `profiles` table for user data, `events` table for analytics. Game data still in localStorage
- **Analytics:** Lightweight event tracking via `src/lib/tracker.ts` → `POST /api/events` → Supabase `events` table. Tracks session_start, page_view, xp_earned, habit/damage toggles, vision cards, shop purchases. Query via `/metrics` skill
- **Admin Dashboard:** `/admin` route — founder-only analytics dashboard gated by `ADMIN_EMAILS` env var. Queries Supabase `events` + `profiles` tables via 3 API routes. Auto-refreshes every 30s. CSS/SVG charts (no charting library). Uses `max-w-4xl` layout (wider than main app)
- **Storage:** Browser localStorage for game data — no server-side game state yet. `/api/judge`, `/api/auth`, `/api/profile`, `/api/events`, and `/api/admin/*` are the backend routes
- **AI Judge:** Anthropic Claude Sonnet 4 (fallback: OpenAI GPT-4o) via `/api/judge` route — evaluates activities and awards variable XP
- **AI Image Gen:** OpenAI DALL-E 3 — generates vision board images from Oracle prompts. Requires `OPENAI_API_KEY` in `.env.local`
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
│   ├── api/events/route.ts  # POST endpoint — receives batched analytics events, writes to Supabase events table
│   ├── api/profile/route.ts # GET/PATCH user profile from Supabase (auth-gated)
│   ├── api/vision/route.ts  # POST endpoint — Oracle AI for Dream Weaver (enhance visions) and Board Reading (interpret the whole board)
│   ├── api/admin/overview/route.ts  # GET endpoint — KPI snapshot (DAU, WAU, totals, trends). Admin-gated
│   ├── api/admin/metrics/route.ts   # GET endpoint — time-series data (sessions/day, XP/day, heatmap, retention). Admin-gated
│   ├── api/admin/events/route.ts    # GET endpoint — recent raw events feed (paginated). Admin-gated
│   ├── admin/              # Admin analytics dashboard — KPI cards, charts, heatmap, retention, user table, live feed
│   ├── calendar/           # Month-at-a-glance view — daily XP totals with habit/damage icons, tap a day to see detail modal
│   ├── settings/           # Customize stat names, descriptions, colors, icons + enable/disable habits & damage
│   ├── shop/               # Power-Up Store — buy and equip cosmetic items on Skipper
│   ├── prizes/             # Prize Track — dual-track timeline with system rewards (rank milestones) + user-created IRL prizes
│   └── vision/             # Vision Board — cozy mood/inspiration board with AI Oracle that weaves dreams into vivid visions
├── components/
│   ├── StatCard.tsx         # One card per stat (icon fill effect, level, XP bar, streak flame, dormant dimming) — read-only, no + button
│   ├── MonthlyXPSummary.tsx # Monthly XP total with sparkline bar chart + trend vs last month
│   ├── JudgeModal.tsx       # Conversational AI judge — multi-turn chat, awards variable XP (1-10 per stat)
│   ├── ActivityLog.tsx      # Unified feed of all events (XP gains, habits, damage, level-ups, rank-ups, prize unlocks) with distinct visuals per type
│   ├── PrizeTimeline.tsx    # Horizontal scrollable dual-track timeline — system rewards (top) + user prizes (bottom) with fog of war
│   ├── MonthCalendar.tsx    # Calendar grid with per-day XP breakdown + habit/damage icons
│   ├── YesterdayReview.tsx   # Compact yesterday checklist — habit/damage toggles with emoji labels, PP summary row with toast
│   ├── CaptainQuip.tsx      # Daily Captain quip card — deterministic rotation, 6 priority tiers
│   ├── LevelUpCelebration.tsx # Level-up celebration animation overlay
│   ├── ModalBackdrop.tsx    # Shared modal backdrop component (click-to-close, fade animation)
│   ├── SkipperCharacter.tsx # Inline SVG paper-doll — renders Skipper with layered equipment overlays
│   ├── StatIcons.tsx        # 20 SVG icons (8 stat defaults + 12 extras for customization)
│   ├── TrackerProvider.tsx   # Client wrapper for analytics — auto-tracks session_start, page_view, user identification
│   ├── AuthProvider.tsx     # Client wrapper for NextAuth SessionProvider (used in layout.tsx)
│   ├── UserMenu.tsx         # Login/logout button — shows Google avatar when signed in, "Sign in" when not
│   ├── VisionCardGrid.tsx   # Masonry grid of vision cards — CSS columns layout, pastel card tints, staggered dreamFadeIn
│   ├── VisionCardDetail.tsx # Tap-to-view detail modal — full text, original/weaved toggle, pin/unpin, delete
│   ├── AddVisionModal.tsx   # Bottom-sheet modal for creating visions — "Just add it" or "Let the Oracle weave it" AI path
│   ├── BoardReadingModal.tsx # Modal showing the Oracle's interpretation of the whole board
│   └── admin/              # Admin dashboard components (MetricCard, BarChart, SparklineChart, ActivityHeatmap, FeatureBreakdown, RetentionTable, UserTable, LiveEventFeed)
└── lib/
    ├── types.ts             # TypeScript types: StatKey, HabitKey, Activity, GameData, etc.
    ├── stats.ts             # Stat definitions, ColorPreset palettes, STAT_KEYS array
    ├── ranks.ts             # Rank titles, rank colors, rank progression helpers
    ├── prizes.ts            # System reward constants (derived from ranks), fog-of-war bracket helpers, MAX_USER_PRIZES
    ├── items.ts             # Item catalog (ITEM_CATALOG), rarity colors, slot definitions, helpers
    ├── itemSvgs.ts          # SVG content registry for equippable items (placeholder art)
    ├── visionColors.ts      # Vision Board pastel palette (6 colors), MAX_VISION_CARDS constant
    ├── habits.ts            # Habit label definitions and shared emoji mappings
    ├── damage.ts            # Damage label definitions and shared emoji mappings
    ├── captainQuips.ts      # Daily Captain quip text data — deterministic rotation, 6 priority tiers
    ├── storage.ts           # All data logic: load/save, addXP, leveling, habits, streaks, inventory, vision board, export, etc.
    ├── tracker.ts           # Client-side analytics — track() queues events, batches to /api/events, identifyUser() links anon→auth
    ├── auth.ts              # NextAuth v5 config — Google OAuth provider, JWT session strategy, Supabase profile upsert on sign-in
    ├── supabase.ts          # Supabase client factories — createServiceClient (server, bypasses RLS) + createBrowserClient (client, subject to RLS)
    └── adminQueries.ts      # Admin dashboard server-side queries — isAdmin(), getOverviewMetrics(), getMetrics(), getUserSummaries(), getRecentEvents()

src/types/
└── next-auth.d.ts           # TypeScript module augmentation — adds googleSub to Session and JWT types

.claude/
├── launch.json              # Dev server config for Preview tools (npm run dev, port 3000)
├── hooks/
│   └── pre-push-gate.sh     # Pre-push hook: runs build + tests before any git push
└── skills/
    ├── agent-zero/SKILL.md     # /agent-zero — setup audit: 4-agent infrastructure analysis (config, memory, skills, patterns) → setup score + auto-fix
    ├── builder/SKILL.md        # /builder — agent architect: analyzes friction in git/memory/code, proposes new skills from evidence
    ├── delight/SKILL.md        # /delight — delight audit: 4-agent emotional/voice/craft/surprise analysis → ranked delight opportunities
    ├── devil/SKILL.md          # /devil — devil's advocate: 4-agent assumption/competition/dropout/technical analysis → pre-mortem failure scenarios
    ├── historian/SKILL.md      # /historian — development archaeology: 4-agent git history analysis → velocity, churn, decisions, growth narrative
    ├── kickoff/SKILL.md        # /kickoff — session start: sync main, read memory, check build/tests/PRs, present briefing
    ├── metrics/SKILL.md        # /metrics — query analytics data: retention, feature usage, engagement, impact measurement
    ├── observe/SKILL.md        # /observe — field notes: 4-agent codebase observation (shape, drift, connections, outsider view) → observations only, no prescriptions
    ├── persona/SKILL.md        # /persona — persona simulator: 4-agent user-type walkthrough → conflict map + core user verdict
    ├── protocol/SKILL.md       # /protocol — strategic review: 4-agent codebase analysis → tiered build list
    ├── ship/SKILL.md           # /ship — build, commit, push, auto-merge in one step (invoking = push + merge approval)
    ├── storyteller/SKILL.md    # /storyteller — narrative coherence audit: 4-agent timeline walk (Day 0 → Month 1) → arc map with chapter markers
    ├── thesis/SKILL.md         # /thesis — thesis examiner: 4-agent stress-test of a product idea before building (user, builder, skeptic, strategist)
    ├── stranger/SKILL.md       # /stranger — first-impression audit: 4-agent new-user simulation → clarity/friction/hook/jargon fixes
    ├── subtractor/SKILL.md     # /subtractor — deletion agent: 4-agent audit for dead code, unused features, over-abstractions → ranked removal list
    ├── wrapup/SKILL.md         # /wrapup — session end: sync main, check dangling work, update CLAUDE.md + memory + strategic lessons
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
- **VisionCard** — `{ id, rawText, weavedText, colorIndex, createdAt, pinned? }` — a dream, goal, or vibe on the Vision Board. `rawText` preserves the user's original words; `weavedText` is the Oracle-enhanced version (or same as `rawText` if AI was skipped). `colorIndex` maps to the 6-color pastel palette in `visionColors.ts`
- **BoardReading** — `{ id, text, createdAt }` — the Oracle's interpretation of the user's whole vision board
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
  - `visionCards` is an array of `VisionCard` objects — dreams, goals, and vibes on the user's Vision Board. Max 20 cards (enforced by `addVisionCard`). Cards can be pinned (float to top) and have AI-enhanced text from the Oracle
  - `lastBoardReading` is a `BoardReading` object — the Oracle's most recent interpretation of the user's vision board (patterns, themes, future self portrait)
- **Per-stat leveling:** Fibonacci-ish XP thresholds per stat. Logic in `storage.ts` (`addXP`, `getXPForNextLevel`)
- **Overall player level:** EQ-inspired curve (max level 60) with "hell levels" at 30/35/40/45/50/55/59. Logic in `storage.ts` (`getOverallLevel`). Rank titles and colors now live in `ranks.ts` as the single source of truth — do not add rank definitions elsewhere

## Key patterns

- All state flows through `GameData` loaded from localStorage on mount in `page.tsx`
- Helper functions in `storage.ts` derive computed data (monthly totals, streaks, daily breakdowns, habit history)
- Components receive data as props — no global state library, no context
- Stat definitions (names, colors, icons) have defaults in `stats.ts` but can be overridden via `customDefinitions` in settings
- **Stat card dormancy:** Cards dim (opacity + desaturation) if the stat has zero activity this month (`isActiveThisMonth` prop)
- **Icon fill effect:** StatCard layers an unfilled ghost icon behind a filled icon that clips from bottom-up based on XP progress
- **Healthy Habits:** A separate system from stat XP — boolean-per-day toggles that don't award XP. Stored as date strings in `healthyHabits`. Users can enable/disable which habits appear via settings (`enabledHabits`). On the homepage, habits are reviewed retrospectively via `YesterdayReview` (yesterday only). The calendar page shows per-day habit completion in the day detail modal
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
- **Vision Board:** A cozy, non-gamified mood/inspiration board at `/vision`. Users add vision cards (dreams, goals, vibes) — either as plain text or AI-enhanced by the Oracle. Cards display in a CSS masonry grid (2 columns, `break-inside: avoid`) with 6 soft pastel tints from `visionColors.ts`. The Oracle is a separate AI personality from the Judge — warm, dreamy, poetic instead of sassy. Two AI actions: "weave" (enhance a rough wish into a vivid vision) and "read" (interpret the whole board, find patterns, paint a future-self portrait). 20-card cap encourages curation. Cards can be pinned (float to top). No XP, no stats — the Vision Board is the "why" behind the grind
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

## Key exports in `visionColors.ts`

- `VISION_COLORS` — array of 6 pastel color objects `{ name, bg, border }` for vision card tints (Misty Lavender, Soft Peach, Pale Sage, Warm Cream, Light Rose, Sky Mist)
- `MAX_VISION_CARDS = 20` — soft cap on vision cards (encourages curation, prevents localStorage bloat)

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
- `getVisionCards(data)` — returns sorted array (pinned first, then newest first)
- `addVisionCard(data, rawText, weavedText)` — creates card with rotating color, enforces 20-card cap, returns GameData or null
- `deleteVisionCard(data, cardId)` — removes a vision card
- `togglePinVisionCard(data, cardId)` — toggle pinned state, returns GameData or null
- `saveBoardReading(data, text)` — stores the Oracle's latest board reading
- `getLastBoardReading(data)` — returns most recent BoardReading or null

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

## The Oracle (Vision Board) — Personality & Behavior

The Oracle is the AI personality for the Vision Board (`/api/vision/route.ts`). It is a SEPARATE character from the Judge/Captain — warm and dreamy instead of sassy and gruff.

### Contrast with the Judge

| Attribute | Captain (Judge) | Oracle (Vision Board) |
|-----------|----------------|----------------------|
| Tone | Sassy, gruff, challenging | Warm, dreamy, poetic |
| Direction | Backward-looking (what you did) | Forward-looking (what you want) |
| Role | Evaluator, taskmaster | Dream-keeper, wise friend |
| Length | Short, punchy (2-4 sentences) | Flowing, evocative (1-3 sentences for weave, 3-5 for reading) |

### Dream Weaver behavior

- Takes rough wishes and makes them vivid with sensory details
- Never changes the meaning — amplifies the feeling
- No corporate language (goals, KPIs, optimize) or hustle language (grind, crush it)
- Matches casual/funny energy with warmth, not forced seriousness

### Board Reading behavior

- Finds patterns and themes across all vision cards
- Paints a portrait of the user's "future self"
- Ends with a surprising connection the user might not have noticed
- Never prescribes or advises — just reflects with wonder
- Can subtly reference player stats/activities if context is provided

## Decision Framework

When the founder proposes a new feature, especially from the vision list (story arc, Judge companion, special effect items, etc.), follow this thinking before building:

1. **Frame it as a thesis.** Every feature is a bet: "If we build X, then Y will happen, because Z." If the thesis isn't clear, help the founder articulate it before writing code.
2. **Ask "who is this for?"** Is this for the founder (power user), current users, or hypothetical future users? All three are valid, but the implications are different. A feature for the founder is a taste call. A feature for future users is a bet on who those users are.
3. **Flag untestable bets.** If there's no way to measure whether a feature worked — no analytics, no observable behavior change, no data — say so. An untestable thesis is a bet you can never learn from. This is especially important while the data layer is still being built.
4. **Consider the cheapest test.** Before building the full version, is there a 10%-effort version that provides 80% of the signal? A partial build, a manual simulation, or even a mockup?
5. **Name the opportunity cost.** Building X means not building Y. Always consider: is this the best use of the next bet?

For small features and bug fixes, skip this. For big bets that take a session or more, suggest running `/thesis` to formalize the examination.

## Known Issues & Planned Improvements

These are documented product-level issues. Reference this section when working on related features to avoid reintroducing them or building on top of broken patterns.

- **Habits/Damage disconnected from XP:** Healthy Habits and Daily Damage are a separate system from stat XP. They earn/subtract Power Points but this connection isn't fully visible to users. The YesterdayReview panel helps by showing PP impact inline, but the two halves (Judge + stats vs. habits + damage) still feel like parallel systems.
- **Calendar empty state:** Calendar shows full 31-day grid but early in the month most cells are empty. Looks barren for new users.

## ⚠ Using this context correctly

The sections above are a **map, not the source of truth.** They may be outdated. Before making any change:

1. **Always read the actual file(s) you plan to edit.** The summaries above tell you *where* to look — they don't tell you what's currently in the code.
2. **If a task touches `storage.ts` or `page.tsx`, read the relevant functions first** — these files evolve the most and the summaries above won't capture new helpers or changed signatures.
3. **If you're unsure whether a helper function already exists, check `storage.ts` before writing a new one.** Duplicating logic is worse than spending one tool call to read the file.

## How to work with me

Universal working preferences (communication style, git conventions, code quality rules) live in `~/.claude/CLAUDE.md` and apply to all projects. The rules below are Dreamboard-specific:

13. **Match the patterns already in the codebase.** If the project uses a certain file structure, naming convention, or coding style, follow it. Do not introduce new patterns without discussing it first.

21. **Keep CLAUDE.md accurate after structural changes.** If your change adds a new file, new type, new exported function, or changes a key pattern documented in CLAUDE.md, update the relevant section of CLAUDE.md in the same commit. Don't update it for small bug fixes or styling tweaks — only when the doc would become misleading without the update.

## Infrastructure

- **Pre-push hook:** `.claude/hooks/pre-push-gate.sh` runs `npm run build && npx vitest run` before any `git push`. Configured in `.claude/settings.local.json` as a `PreToolUse` hook on `Bash` commands. If build or tests fail, the push is blocked.
- **Dev server preview:** `.claude/launch.json` configures `npm run dev` on port 3000. Use `preview_start` with name `"dev"` to launch, then `preview_screenshot`/`preview_snapshot` to verify UI changes visually.
- **Self-review in /ship:** The `/ship` skill includes a self-review step that reviews the diff for bugs, debug artifacts, style drift, and type safety issues before committing. Fixes are applied autonomously.
