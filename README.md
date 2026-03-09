# Dreamboard

A gamified personal habit tracker where you earn XP by logging real-life activities across 8 RPG-style stats. Think character sheet for your daily life.

**Core loop:** Tell the AI Judge what you did → Judge interviews you (1-3 follow-ups) → Sassy verdict with variable XP → Stats update → Level up over time.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 — warm earth tones, no UI component library
- **AI:** Anthropic Claude Sonnet 4 (primary) with OpenAI GPT-4o fallback
- **Auth:** NextAuth v5 with Google OAuth
- **Database:** Supabase (Postgres) for user profiles + analytics
- **Storage:** Browser localStorage for game state (no server-side game data yet)
- **Hosting:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in your keys
cp .env.example .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example` for the full list. At minimum you need:

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | AI Judge (primary) |
| `OPENAI_API_KEY` | No | AI Judge (fallback) + Vision Board image generation |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth login |
| `AUTH_SECRET` | Yes | NextAuth session signing |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase server-side access |
| `ADMIN_EMAILS` | No | Comma-separated emails for admin dashboard access |

## Scripts

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run lint       # ESLint check
npm test           # Run test suite (195 tests via Vitest)
npm run test:watch # Watch mode
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages + API routes
│   ├── page.tsx   # Homepage (Judge CTA, stats, activity feed)
│   ├── api/       # judge/, auth/, profile/, events/, vision/, admin/
│   ├── calendar/  # Month-at-a-glance XP view
│   ├── settings/  # Customize stats, habits, damage tracking
│   ├── shop/      # Power-Up Store (cosmetic items for Skipper)
│   ├── prizes/    # Prize Track (IRL rewards at level milestones)
│   ├── vision/    # Vision Board (AI-powered mood/inspiration board)
│   └── admin/     # Founder analytics dashboard
├── components/    # React components (props-down, no global state)
└── lib/           # Business logic, types, data helpers
    ├── types.ts   # All TypeScript types
    ├── storage.ts # localStorage CRUD + game logic
    ├── stats.ts   # Stat definitions + color palettes
    └── ...        # ranks, prizes, items, habits, damage, sound
```

## Architecture Decisions

- **No global state library.** All state flows through `GameData` loaded from localStorage. Components receive data as props.
- **No charting library.** Visualizations are built with plain CSS/SVG.
- **Mobile-first.** Designed for 375-430px viewports. No desktop breakpoints.
- **React Compiler** enabled for automatic memoization at build time.
- **Variable XP.** The AI Judge awards 1-10 XP per stat based on actual effort, not fixed amounts.
