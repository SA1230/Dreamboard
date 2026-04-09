# Dreamboard — Archived 2026-04-08

This project has been absorbed into **shiroy.ai** — a unified personal AI operating system — at https://github.com/SA1230/shiroy-net. The name "Dreamboard" has been deprecated entirely to avoid long-term confusion with Dreambound (dreambound.com). The replacement term inside shiroy-net is **"character layer"**.

## Where the code lives now

shiroy-net is a true superset of dreamboard at the file level. Every ≥50-line component was already ported and functional:

- **Storage engine** (1486 lines) → `shiroy-net/src/lib/storage.ts` (exact match, kept the original filename and function names — `loadGameData`, `saveGameData`, `addXP`, `StatKey`, `STAT_DEFINITIONS` are generic and not branded)
- **GameData / types** (391 lines) → `shiroy-net/src/lib/types.ts` (exact match)
- **Settings UI** → `shiroy-net/src/app/(app)/settings/page.tsx` (grew from 1278 → 1502 lines after merger)
- **Activity feed, Prize timeline, Vision board, Achievements** → all present in shiroy-net under the same component names
- **Admin dashboard** → `shiroy-net/src/app/(app)/admin/page.tsx` (467 lines, exact match)
- **Judge modal + API** → `shiroy-net/src/components/JudgeModal.tsx` + `shiroy-net/src/app/api/judge/route.ts`
- **38 achievements + unlock engine** → `shiroy-net/src/lib/achievements.ts` (445 lines)
- **Item catalog + SVG art** → `shiroy-net/src/lib/items.ts` + `itemSvgs.ts`

## Nav restoration

Two features had their code fully present but lost their nav entries in the merger: `/prizes` + `/vision` were restored via shiroy-net PR #18 on 2026-04-08, and `/calendar` + `/achievements` were restored via PR #22. All four are now first-class nav items.

## Dreamboard identifier rename

On 2026-04-08, shiroy-net PR #23 renamed the "Dreamboard" identifier throughout the codebase to "character":
- File renames: `adapters/dreamboard.ts` → `character.ts`, `modules/dreamboard-stats.tsx` → `character.tsx`
- Symbol renames: `dreamboardAdapter` → `characterAdapter`, `dreamboardStatsModule` → `characterModule`
- Registration key, hydration event, legal copy, system prompts, storage keys — all updated

Full audit: `~/code/active/hub/.hub/audits/2026-04-08-consolidation/dreamboard-gaps.md` — 62 files audited, 60 already-ported, **0 must-port gaps**, 2 orphaned-nav findings (both fixed in PR #22).

## This repo is frozen

This GitHub repo has been archived (read-only), the dreamboard.net domain already redirects to shiroy.ai, and the local directory has been moved to `~/code/archive/dreamboard-pre-merger/` to preserve the history. Do not make changes here. Send PRs to shiroy-net instead.
