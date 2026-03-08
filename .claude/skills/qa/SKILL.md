# /qa — Visual smoke test of affected routes

Visual check of the routes affected by the current work. Captures clean-browser screenshots (the stranger's view) via Puppeteer, checks console errors via preview tools, and evaluates each saved screenshot. Run after UI changes and before `/ship`.

## Steps

1. **Determine which routes to check:**
   - Run `git diff --name-only` to see changed files
   - Map changed files to affected routes using this guide:
     - `src/app/page.tsx`, `src/components/StatCard.tsx`, `src/components/JudgeModal.tsx`, `src/components/YesterdayReview.tsx`, `src/components/CaptainQuip.tsx`, `src/components/LevelDisplay.tsx`, `src/components/ActivityLog.tsx`, `src/components/MonthlyXPSummary.tsx`, `src/components/SkipperCharacter.tsx` → `/` (Homepage)
     - `src/app/calendar/`, `src/components/MonthCalendar.tsx` → `/calendar`
     - `src/app/shop/`, `src/components/SkipperCharacter.tsx`, `src/lib/items.ts`, `src/lib/itemSvgs.ts` → `/shop`
     - `src/app/vision/`, `src/components/VisionCard*.tsx`, `src/components/AddVisionModal.tsx`, `src/components/BoardReadingModal.tsx` → `/vision`
     - `src/app/prizes/`, `src/components/PrizeTimeline.tsx` → `/prizes`
     - `src/app/settings/` → `/settings`
     - `src/app/admin/`, `src/components/admin/` → `/admin`
     - `src/lib/storage.ts`, `src/lib/types.ts`, `src/app/layout.tsx`, `src/app/globals.css` → all routes (shared code)
   - If shared files changed (storage, types, layout, globals), check all routes
   - If unsure, err on the side of including a route

2. **Start the dev server:**
   - Use `preview_start` with name `"dev"` (from `.claude/launch.json`)
   - If already running, reuse it

3. **Rotate baselines for affected routes:**
   - For each affected route, if `{route}-clean.png` exists, rename it to `{route}-baseline.png`

4. **Capture clean-browser screenshots (Puppeteer):**
   Run Puppeteer to capture only the affected routes in a clean browser (no localStorage, no session — what a new user sees). Adapt the routes array to include only what's needed:
   ```
   node -e "
   const puppeteer = require('puppeteer');
   const fs = require('fs');
   (async () => {
     const browser = await puppeteer.launch({ headless: true });
     const page = await browser.newPage();
     await page.setViewport({ width: 390, height: 844 });
     const routes = [
       // Only include affected routes:
       { path: '/', name: 'homepage' },
       // { path: '/calendar', name: 'calendar' },
       // etc.
     ];
     const dir = '.claude/screenshots';
     fs.mkdirSync(dir, { recursive: true });
     for (const route of routes) {
       await page.goto('http://localhost:3000' + route.path, { waitUntil: 'networkidle0', timeout: 15000 });
       await new Promise(r => setTimeout(r, 1500));
       await page.screenshot({ path: dir + '/' + route.name + '-clean.png', fullPage: true });
       console.log('Captured: ' + route.name);
     }
     await browser.close();
   })().catch(e => { console.error(e); process.exit(1); });
   "
   ```
   If Puppeteer fails, fall back to preview-only mode (Step 5) and note the failure.

5. **Smoke test affected routes with preview tools (sequential):**
   For each affected route:
   - Navigate via `preview_eval`: `window.location.href = '<route>'`
   - Wait for the page to settle (1-2 seconds)
   - Run `preview_console_logs` with `level: "error"` — capture any errors
   - Take a `preview_screenshot` — show inline to the user (this is the stateful/existing-user view)

6. **Evaluate saved screenshots:**
   - Read each `{route}-clean.png` via the Read tool
   - For each, evaluate: layout correctness, missing content, broken images, blank pages, empty states
   - If `{route}-baseline.png` exists, also read it and compare: what changed?
   - Focus on structure and content, not pixel-level color differences

7. **Report:**

```
## QA Smoke Test Results

**Routes checked:** [list] (based on files changed in `git diff`)

| Route | Console Errors | Clean Browser | vs Baseline |
|-------|---------------|---------------|-------------|
| / | 0 / [errors] | pass / [issue] | no change / changed / first capture |
| ... | ... | ... | ... |

**Visual changes since last capture:**
[List what changed per route, or "First capture — no baseline to compare against."]

**Issues found:**
[List actual problems, or "None spotted."]

**Screenshots saved to `.claude/screenshots/`**
```

## Rules
- This is READ-ONLY. Do not edit files or fix issues — just report them.
- Show every inline preview_screenshot to the user. They may spot things you miss.
- Only check routes affected by the current diff. Don't screenshot the whole app every time.
- If the dev server fails to start, report the error and stop.
- If `/admin` returns 403/401, that's expected for non-admin users — mark it as "pass (auth-gated)".
- Keep the report concise. Only flag actual problems, not style opinions.
- If a route has no data (empty state), note it but don't flag it as a failure.
- When comparing against baselines, focus on: layout structure, presence/absence of major elements, text content changes. Don't flag pixel-level rendering differences.
