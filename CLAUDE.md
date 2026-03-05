# CLAUDE.md

## What this project is

Dreamboard is a gamified personal habit tracker. Users earn XP by logging real-life activities across 8 stats (Strength, Wisdom, Vitality, Charisma, Craft, Discipline, Spirit, Wealth). Each stat levels up as XP accumulates. Think RPG character sheet for your daily life.

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 — warm earth tones, stone backgrounds, rounded cards
- **Icons:** lucide-react + 20 hand-drawn SVG icons in `StatIcons.tsx` (no other UI library)
- **Font:** Nunito (Google Font) loaded via `next/font/google` in `layout.tsx`
- **Storage:** Browser localStorage only — no database, no backend, no API
- **Charts:** None — we build visualizations with plain CSS/SVG (no recharts, no d3)
- **Animations:** 6 custom keyframe animations in `globals.css` (fadeIn, modalSlideUp, xpPop, levelUpGlow, levelUpText, particle)
- **Run locally:** `npm run dev` (port 3000) / `npm run build` to check for errors

## Project structure

```
src/
├── app/
│   ├── page.tsx            # Homepage — stat cards, overall level display, monthly XP, healthy habits, activity log
│   ├── layout.tsx          # Root layout with Nunito font + global styles
│   ├── globals.css         # Tailwind base + 6 custom keyframe animations
│   ├── calendar/           # Monthly calendar view showing daily XP + habit icons
│   └── settings/           # Customize stat names, descriptions, colors, icons + enable/disable daily habits
├── components/
│   ├── StatCard.tsx         # One card per stat (icon fill effect, level, XP bar, streak flame, dormant dimming)
│   ├── MonthlyXPSummary.tsx # Monthly XP total with sparkline bar chart + trend vs last month
│   ├── AddXPModal.tsx       # Modal to log an activity (pick stat, add note)
│   ├── ActivityLog.tsx      # Scrollable list of recent 20 activities
│   ├── MonthCalendar.tsx    # Calendar grid with per-day XP breakdown + healthy habit icons
│   ├── HealthyHabits.tsx    # Daily toggle cards for 6 habits (water, nails, brush, nosugar, floss, steps) — filtered by enabledHabits
│   └── StatIcons.tsx        # 20 SVG icons (8 stat defaults + 12 extras for customization)
└── lib/
    ├── types.ts             # TypeScript types: StatKey, HabitKey, Activity, GameData, etc.
    ├── stats.ts             # Stat definitions, ColorPreset palettes, STAT_KEYS array
    └── storage.ts           # All data logic: load/save, addXP, leveling, habits, streaks, export, etc.
```

## Data model (defined in `src/lib/types.ts`)

- **StatKey** — one of 8 strings: `"strength"`, `"wisdom"`, `"vitality"`, etc.
- **HabitKey** — one of 6 strings: `"water"`, `"nails"`, `"brush"`, `"nosugar"`, `"floss"`, `"steps"`
- **Activity** — `{ id, stat, note, timestamp }` — one logged action = 1 XP
- **GameData** — the root object stored in localStorage: `{ stats, activities, customDefinitions?, healthyHabits?, enabledHabits?, mascotOverrides? }`
  - `healthyHabits` maps each `HabitKey` to an array of `"YYYY-MM-DD"` date strings (days the habit was completed)
  - `enabledHabits` is an array of `HabitKey` values that should be visible on the dashboard (defaults to the original 4 if not set)
  - `mascotOverrides` maps level thresholds to mascot image filenames in `public/mascots/` (e.g. `{ 1: "skipper-default.svg", 10: "skipper-cool.svg" }`). Uses threshold logic — picks highest key ≤ current level. Defaults to `skipper-default.svg`
- **Per-stat leveling:** Fibonacci-ish XP thresholds per stat. Logic in `storage.ts` (`addXP`, `getXPForNextLevel`)
- **Overall player level:** EQ-inspired curve (max level 60) with "hell levels" at 30/35/40/45/50/55/59. Logic in `storage.ts` (`getOverallLevel`). Rank titles (Novice → Transcendent) are defined in `page.tsx`

## Key patterns

- All state flows through `GameData` loaded from localStorage on mount in `page.tsx`
- Helper functions in `storage.ts` derive computed data (monthly totals, streaks, daily breakdowns, habit history)
- Components receive data as props — no global state library, no context
- Stat definitions (names, colors, icons) have defaults in `stats.ts` but can be overridden via `customDefinitions` in settings
- **Stat card dormancy:** Cards dim (opacity + desaturation) if the stat has zero activity this month (`isActiveThisMonth` prop)
- **Icon fill effect:** StatCard layers an unfilled ghost icon behind a filled icon that clips from bottom-up based on XP progress
- **Healthy Habits:** A separate system from stat XP — boolean-per-day toggles that don't award XP. Stored as date strings in `healthyHabits`. Users can enable/disable which habits appear via settings (`enabledHabits`)
- **Data export:** `exportGameData()` in `storage.ts` downloads a full JSON backup. Button lives in the Activity Log section
- **`LevelDisplay` component** lives inline in `page.tsx` (not a separate file) — shows Skipper mascot inside an SVG progress ring, with level badge below and rank title above. Parallax tilt + shatter animation on level-up
- **Mascot system:** Skipper the penguin SVGs live in `public/mascots/`. `getMascotForLevel()` in `storage.ts` picks the right image based on overall level + optional `mascotOverrides` in GameData. Currently one image (`skipper-default.svg`); ready for per-level variants

## Key exports in `storage.ts`

- `loadGameData()` / `saveGameData(data)` — localStorage read/write
- `addXP(data, statKey, note)` — log 1 XP, handle level-up, save
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
- `getMascotForLevel(level, overrides?)` — returns mascot image path for a given overall level (threshold logic)
- `exportGameData(data)` — JSON file download

## ⚠ Using this context correctly

The sections above are a **map, not the source of truth.** They may be outdated. Before making any change:

1. **Always read the actual file(s) you plan to edit.** The summaries above tell you *where* to look — they don't tell you what's currently in the code.
2. **If a task touches `storage.ts` or `page.tsx`, read the relevant functions first** — these files evolve the most and the summaries above won't capture new helpers or changed signatures.
3. **If you're unsure whether a helper function already exists, check `storage.ts` before writing a new one.** Duplicating logic is worse than spending one tool call to read the file.

## How to work with me

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
