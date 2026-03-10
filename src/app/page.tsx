"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { GameData, StatKey, HabitKey, DamageKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getOverallLevel, getTotalLifetimeXP, exportGameData, getEffectiveDefinitions, getStatStreaks, getMonthlyXPTotals, getActivitiesByDay, getHabitsByDay, toggleHabitForDate, toggleDamageForDate, isHabitCompletedForDate, isDamageMarkedForDate, formatRelativeTime, getInventory, getMascotName, checkPrizeUnlocks, issueChallenge, issueChallengeChain, completeChallenge, dismissChallenge } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { StatIcon } from "@/components/StatIcons";
import { JudgeModal } from "@/components/JudgeModal";
import { ActivityLog } from "@/components/ActivityLog";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { YesterdayReview } from "@/components/YesterdayReview";
import { LevelDisplay } from "@/components/LevelDisplay";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { Download, Settings, CalendarDays, ShoppingBag, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { getRankTitle } from "@/lib/ranks";
import { UserMenu } from "@/components/UserMenu";
import { CompanionModal } from "@/components/CompanionModal";
import { track } from "@/lib/tracker";
import { playSound, playSoundWithHaptic } from "@/lib/sound";
import { STAT_DEFINITIONS } from "@/lib/stats";

export default function Home() {
  const { data: session, status } = useSession();

  // Auth gate — show landing page for unauthenticated users
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <AuthenticatedHome />;
}

function LandingPage() {
  const statPreviews = [
    { name: "Strength", color: STAT_DEFINITIONS.strength.color, iconKey: STAT_DEFINITIONS.strength.iconKey },
    { name: "Wisdom", color: STAT_DEFINITIONS.wisdom.color, iconKey: STAT_DEFINITIONS.wisdom.iconKey },
    { name: "Vitality", color: STAT_DEFINITIONS.vitality.color, iconKey: STAT_DEFINITIONS.vitality.iconKey },
    { name: "Charisma", color: STAT_DEFINITIONS.charisma.color, iconKey: STAT_DEFINITIONS.charisma.iconKey },
    { name: "Craft", color: STAT_DEFINITIONS.craft.color, iconKey: STAT_DEFINITIONS.craft.iconKey },
    { name: "Discipline", color: STAT_DEFINITIONS.discipline.color, iconKey: STAT_DEFINITIONS.discipline.iconKey },
    { name: "Spirit", color: STAT_DEFINITIONS.spirit.color, iconKey: STAT_DEFINITIONS.spirit.iconKey },
    { name: "Wealth", color: STAT_DEFINITIONS.wealth.color, iconKey: STAT_DEFINITIONS.wealth.iconKey },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl flex flex-col items-center bg-white/60 sm:rounded-3xl sm:border sm:border-stone-200/60 sm:py-10 lg:py-12 sm:px-10 lg:px-16 py-0 px-2">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          <img src="/logos/dreamboard-icon-blue.svg" alt="" className="h-10 sm:h-14 lg:h-16" />
          <img src="/brand/dreamboard-wordmark-blue.svg" alt="Dreamboard" className="h-10 sm:h-14 lg:h-16" />
        </div>

        {/* Skipper hero */}
        <div className="relative mb-6 sm:mb-8">
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center border-2 border-amber-200"
            style={{ background: "radial-gradient(circle at 50% 40%, #FFF8EB, #FFF0D4)" }}
          >
            <img
              src="/mascots/judge-hero.svg"
              alt="Skipper the Captain"
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
          </div>
        </div>

        {/* Stat preview chips */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 max-w-xs sm:max-w-md">
          {statPreviews.map((stat) => (
            <span
              key={stat.name}
              className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: stat.color + "15",
                color: stat.color,
              }}
            >
              <StatIcon iconKey={stat.iconKey} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {stat.name}
            </span>
          ))}
        </div>

        {/* Sign up CTA */}
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg, #B4722A 0%, #D4A44A 30%, #F5D680 50%, #D4A44A 70%, #B4722A 100%)",
            backgroundSize: "200% 100%",
            animation: "ctaShimmer 4s ease-in-out infinite",
          }}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#fff" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" />
          </svg>
          Get Started with Google
        </button>

        {/* Legal links */}
        <p className="text-xs text-stone-400 mt-6">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-stone-600 transition-colors">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-stone-600 transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}

function AuthenticatedHome() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [xpGainedStat, setXpGainedStat] = useState<{ stat: StatKey; amount: number } | null>(null);
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  const [showJudge, setShowJudge] = useState(false);
  const [showCompanion, setShowCompanion] = useState(false);

  // Post-verdict XP toasts
  const [xpToasts, setXpToasts] = useState<{ id: string; statKey: StatKey; amount: number; color: string; iconKey: string; name: string }[]>([]);
  // Today XP pill pulse after verdict
  const [todayXPPulsing, setTodayXPPulsing] = useState(false);

  // Power Points toggle toast (shown in YesterdayReview PP summary)
  const [ppToast, setPpToast] = useState<{ text: string; color: string } | null>(null);

  // Challenge completion celebration (briefly shows "Challenge Complete" or "Step Complete" card before fading)
  const [completedChallengeInfo, setCompletedChallengeInfo] = useState<{
    description: string;
    stat: StatKey;
    bonusXP: number;
    isChainStep: boolean;
    chainIndex?: number;
    chainTotal?: number;
  } | null>(null);

  // Celebration overlay state
  const [celebrationInfo, setCelebrationInfo] = useState<{
    statKey: StatKey;
    newLevel: number;
    statColor: string;
    isOverallLevelUp: boolean;
    overallNewLevel?: number;
    overallNewRank?: string;
  } | null>(null);

  // Load data from localStorage on mount + check for newly unlocked prizes
  useEffect(() => {
    const data = loadGameData();
    const totalXP = getTotalLifetimeXP(data);
    const { level } = getOverallLevel(totalXP);
    const updated = checkPrizeUnlocks(data, level);
    setGameData(updated);
  }, []);

  // Auto-open Judge for first-time users after a brief delay
  const hasAutoOpenedJudge = useRef(false);
  useEffect(() => {
    if (!gameData) return;
    if (gameData.activities.length === 0 && !hasAutoOpenedJudge.current) {
      hasAutoOpenedJudge.current = true;
      track("onboarding_started", {});
      const timer = setTimeout(() => {
        setShowJudge(true);
        track("judge_modal_opened", { source: "auto_open_first_run" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameData]);

  // Merge custom overrides with defaults
  const definitions = useMemo(() => {
    if (!gameData) return null;
    return getEffectiveDefinitions(gameData);
  }, [gameData]);

  // Calculate per-stat streaks
  const streaks = useMemo(() => {
    if (!gameData) return null;
    return getStatStreaks(gameData.activities);
  }, [gameData]);

  // Calculate monthly XP totals for trend display
  const monthlyXP = useMemo(() => {
    if (!gameData) return null;
    return getMonthlyXPTotals(gameData.activities);
  }, [gameData]);

  // Determine which stats have at least one activity this month
  const activeStatsThisMonth = useMemo(() => {
    if (!gameData) return new Set<StatKey>();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const activeStats = new Set<StatKey>();
    for (const activity of gameData.activities) {
      const date = new Date(activity.timestamp);
      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        activeStats.add(activity.stat);
      }
    }
    return activeStats;
  }, [gameData]);

  // Build an array of daily XP totals for the Today counter
  const dailyXPForMonth = useMemo(() => {
    if (!gameData) return [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const activitiesByDay = getActivitiesByDay(gameData.activities, year, month);

    // Create an array from day 1 to today, summing all stat XP per day
    return Array.from({ length: today }, (_, index) => {
      const day = index + 1;
      const dayStats = activitiesByDay[day];
      if (!dayStats) return 0;
      return Object.values(dayStats).reduce((sum, xp) => sum + (xp ?? 0), 0);
    });
  }, [gameData]);

  // Per-day per-stat XP breakdown for the stacked bar chart
  const activitiesByDayForMonth = useMemo(() => {
    if (!gameData) return {} as Record<number, Partial<Record<StatKey, number>>>;
    const now = new Date();
    return getActivitiesByDay(gameData.activities, now.getFullYear(), now.getMonth());
  }, [gameData]);

  // Per-day completed habits for the monthly chart icons
  const habitsByDayForMonth = useMemo(() => {
    if (!gameData) return {} as Record<number, import("@/lib/types").HabitKey[]>;
    const now = new Date();
    return getHabitsByDay(gameData, now.getFullYear(), now.getMonth());
  }, [gameData]);

  // Tick every 60 seconds to keep relative timestamps fresh
  const [, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeTick((tick) => tick + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleJudgeVerdict = useCallback(
    (
      awards: { stat: StatKey; amount: number }[],
      summary: string,
      verdictMessage: string,
      challenge?: { text: string; stat: string; bonusXP: number },
      challengeCompleted?: boolean,
      challengeChain?: { text: string; stat: string; bonusXP: number }[]
    ) => {
      if (!gameData || !definitions) return;

      // Complete the active challenge first (before issuing a new one)
      let currentData = gameData;
      if (challengeCompleted && currentData.activeChallenge) {
        const activeChallenge = currentData.activeChallenge;
        const result = completeChallenge(currentData);
        if (result) {
          currentData = result.newData;

          // Show celebration card — "Step Complete" for mid-chain, "Challenge Complete" for final/standalone
          setCompletedChallengeInfo({
            description: activeChallenge.description,
            stat: activeChallenge.stat as StatKey,
            bonusXP: activeChallenge.bonusXP,
            isChainStep: result.nextChainStep,
            chainIndex: activeChallenge.chainIndex,
            chainTotal: activeChallenge.chainTotal,
          });
          setTimeout(() => setCompletedChallengeInfo(null), 3500);
        }
      }

      // Apply each award sequentially — each addXP call updates the data
      for (const award of awards) {
        const { newData, leveledUp } = addXP(currentData, award.stat, summary, award.amount, verdictMessage);
        currentData = newData;

        // Trigger XP animation for the last award's stat
        if (award === awards[awards.length - 1]) {
          setXpGainedStat({ stat: award.stat, amount: award.amount });
          setTimeout(() => setXpGainedStat(null), 900);
        }

        // Handle level-up celebration for the first stat that levels up
        if (leveledUp && !celebrationInfo) {
          const overallBefore = getOverallLevel(getTotalLifetimeXP(gameData));
          const overallAfter = getOverallLevel(getTotalLifetimeXP(currentData));
          const isOverallLevelUp = overallAfter.level > overallBefore.level;

          setCelebrationInfo({
            statKey: award.stat,
            newLevel: currentData.stats[award.stat].level,
            statColor: definitions[award.stat].color,
            isOverallLevelUp,
            overallNewLevel: isOverallLevelUp ? overallAfter.level : undefined,
            overallNewRank: isOverallLevelUp ? getRankTitle(overallAfter.level) : undefined,
          });
          playSoundWithHaptic("levelUp", 0.6, [50, 30, 80]);
        }
      }

      // Issue new challenge or challenge chain if the Judge provided one
      if (!currentData.activeChallenge) {
        if (challengeChain && challengeChain.length >= 2) {
          currentData = issueChallengeChain(
            currentData,
            challengeChain.map((step) => ({ description: step.text, stat: step.stat as StatKey, bonusXP: step.bonusXP }))
          );
        } else if (challenge) {
          currentData = issueChallenge(currentData, challenge.text, challenge.stat as StatKey, challenge.bonusXP);
        }
      }

      setGameData(currentData);
      setShowJudge(false);

      // Track onboarding completion on first-ever verdict
      if (gameData.activities.length === 0) {
        track("onboarding_completed", {
          statsAwarded: awards.map((a) => a.stat),
          totalXP: awards.reduce((sum, a) => sum + a.amount, 0),
        });
      }

      // Track XP earned event
      track("xp_earned", {
        stats: awards.map((a) => ({ stat: a.stat, amount: a.amount })),
        totalXP: awards.reduce((sum, a) => sum + a.amount, 0),
        challengeCompleted: challengeCompleted ?? false,
      });

      // Sound: XP earned chime
      playSound("xpGain", 0.4);

      // Post-verdict feedback: staggered XP toasts + Today pill pulse
      awards.forEach((award, index) => {
        const def = definitions[award.stat];
        setTimeout(() => {
          const toastId = `${Date.now()}-${award.stat}-${index}`;
          setXpToasts((prev) => [
            ...prev,
            {
              id: toastId,
              statKey: award.stat,
              amount: award.amount,
              color: def.color,
              iconKey: def.iconKey,
              name: def.name,
            },
          ]);
          // Remove toast after animation completes (3s)
          setTimeout(() => {
            setXpToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 3000);
        }, index * 300);
      });

      // Pulse the Today XP pill
      setTodayXPPulsing(true);
      setTimeout(() => setTodayXPPulsing(false), 800);
    },
    [gameData, definitions, celebrationInfo]
  );

  const showPpToast = useCallback((text: string, color: string) => {
    setPpToast({ text, color });
    setTimeout(() => setPpToast(null), 1200);
  }, []);

  const handleToggleHabit = useCallback(
    (habitKey: HabitKey, dateString: string) => {
      if (!gameData) return;
      const wasCompleted = isHabitCompletedForDate(gameData, habitKey, dateString);
      const newData = toggleHabitForDate(gameData, habitKey, dateString);
      setGameData(newData);
      showPpToast(wasCompleted ? "-1 PP" : "+1 PP", wasCompleted ? "#ef4444" : "#10b981");
      playSoundWithHaptic("habitToggle", 0.3, 15);
      track("habit_toggled", { habitKey, completed: !wasCompleted });
    },
    [gameData, showPpToast]
  );

  const handleToggleDamage = useCallback(
    (damageKey: DamageKey, dateString: string) => {
      if (!gameData) return;
      const wasMarked = isDamageMarkedForDate(gameData, damageKey, dateString);
      const newData = toggleDamageForDate(gameData, damageKey, dateString);
      setGameData(newData);
      showPpToast(wasMarked ? "+1 PP" : "-1 PP", wasMarked ? "#10b981" : "#ef4444");
      playSoundWithHaptic("habitToggle", 0.3, 15);
      track("damage_toggled", { damageKey, marked: !wasMarked });
    },
    [gameData, showPpToast]
  );

  // Show nothing while loading from localStorage (prevents hydration flash)
  if (!gameData || !definitions || !streaks || !monthlyXP) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  // Overall player level based on total lifetime XP (activities logged)
  const { level: overallLevel, xpIntoLevel, xpForNextLevel } = getOverallLevel(getTotalLifetimeXP(gameData));
  const overallProgressPercent = xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * 100) : 100;

  // First-run detection — user has never logged XP via the Judge
  const isFirstRun = gameData.activities.length === 0;

  // Weekly quote — hidden for now, may bring back later
  // const weeklyQuotes / currentWeekNumber / weeklyQuote removed from render

  return (
    <main
      className="max-w-4xl mx-auto px-4 py-8 pb-20"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDF8F4]/80 backdrop-blur-md -mx-4 px-3 py-2.5 border-b border-stone-200/50 mb-10">
        <div className="flex items-center justify-between gap-1">
          <div className="flex-shrink-0">
            <UserMenu />
          </div>
          <Link href="/" className="flex items-center gap-1 flex-shrink-0" aria-label="Home">
            <img
              src="/logos/dreamboard-icon-blue.svg"
              alt=""
              className="h-6 inline-block"
            />
            <img
              src="/brand/dreamboard-wordmark-blue.svg"
              alt="Dreamboard"
              className="h-6 inline-block"
            />
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href="/calendar"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
              title="Monthly calendar"
              aria-label="Monthly calendar"
            >
              <CalendarDays size={16} />
            </Link>
            <Link
              href="/shop"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
              title="Power-Up Store"
              aria-label="Shop"
            >
              <ShoppingBag size={16} />
            </Link>
            <Link
              href="/prizes"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
              title="Prize Track"
              aria-label="Prize Track"
            >
              <Trophy size={16} />
            </Link>
            <Link
              href="/vision"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
              title="Vision Board"
              aria-label="Vision Board"
            >
              <Sparkles size={16} />
            </Link>
            <Link
              href="/settings"
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
              title="Customize stats"
              aria-label="Settings"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Level Display — Skipper character with progress ring (hero position) */}
      <div className="flex justify-center mt-2 mb-4">
        <div style={{ transform: "scale(1.05)", transformOrigin: "center center" }}>
          <LevelDisplay
            level={overallLevel}
            progressPercent={overallProgressPercent}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            equippedItems={getInventory(gameData).equippedItems}
            mascotName={getMascotName(gameData)}
          />
        </div>
      </div>

      {/* Welcome Card — shown only on first run */}
      {isFirstRun && (
        <div className="mb-6 animate-fadeIn">
          <div className="rounded-2xl border border-stone-200 p-5 text-center" style={{ backgroundColor: "#FDFBF7" }}>
            <h2 className="text-lg font-bold text-stone-700 mb-2">Welcome to Dreamboard</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Track your real-life accomplishments like an RPG character.
              Tell the Captain what you did today — they&apos;ll interview you,
              judge your effort with some sass, and award XP across your stats.
            </p>
            <p className="text-xs text-stone-400 mt-3">
              Your stats start at zero. Each one grows as you log activities.
            </p>
          </div>
        </div>
      )}

      {/* Captain CTA — full hero card for first-run, compact bar for returning users */}
      {isFirstRun ? (
        <div className="mb-6">
          <button
            onClick={() => {
              setShowJudge(true);
              if (!hasAutoOpenedJudge.current) {
                hasAutoOpenedJudge.current = true;
                track("judge_modal_opened", { source: "manual_tap" });
              }
            }}
            className="relative w-full flex flex-col items-center pt-12 pb-4 px-8 rounded-2xl border border-amber-200/60 hover:border-amber-300 transition-all cursor-pointer group active:scale-[0.98]"
            style={{
              background: "radial-gradient(ellipse at 50% -10%, rgba(252, 211, 77, 0.15) 0%, transparent 60%), linear-gradient(to bottom, #FFF8EB, #FFF0D4)",
              boxShadow: "0 2px 12px rgba(180, 130, 50, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* Hero avatar with glow ring + bob */}
            <div
              className="absolute -top-8"
              style={{ animation: "captainBob 3s ease-in-out infinite" }}
            >
              <div
                className="relative flex items-center justify-center rounded-full"
                style={{ animation: "captainGlow 2.5s ease-in-out infinite" }}
              >
                {/* Sonar ripple rings */}
                <div
                  className="absolute w-20 h-20 rounded-full border-2 border-amber-400/40"
                  style={{ animation: "captainRipple 2.5s ease-out infinite" }}
                />
                <div
                  className="absolute w-20 h-20 rounded-full border-2 border-amber-400/40"
                  style={{ animation: "captainRipple 2.5s ease-out 1.25s infinite" }}
                />
                <img
                  src="/mascots/judge-hero.svg"
                  alt="The Captain"
                  className="w-20 h-20 rounded-full bg-white border-2 border-amber-300 p-1.5 shadow-sm group-hover:scale-110 transition-transform relative"
                />
              </div>
            </div>
            <span className="text-lg font-bold text-amber-800">What did you do today?</span>
            <span
              className="inline-block mt-2 px-5 py-1.5 text-sm font-bold text-white rounded-full shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all"
              style={{
                background: "linear-gradient(90deg, #B4722A 0%, #D4A44A 30%, #F5D680 50%, #D4A44A 70%, #B4722A 100%)",
                backgroundSize: "200% 100%",
                animation: "ctaShimmer 4s ease-in-out infinite",
              }}
            >
              Log it &amp; earn XP
            </span>
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <button
            onClick={() => setShowJudge(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-amber-200/50 hover:border-amber-300 transition-all cursor-pointer group active:scale-[0.98]"
            style={{
              background: "linear-gradient(to right, #FFF8EB, #FFF3E0)",
            }}
          >
            <img
              src="/mascots/judge-hero.svg"
              alt="The Captain"
              className="w-9 h-9 rounded-full bg-white border border-amber-200 p-0.5 group-hover:scale-110 transition-transform flex-shrink-0"
            />
            <span className="text-sm font-semibold text-amber-700 flex-1 text-left">What did you do today?</span>
            <span
              className="px-3 py-1 text-xs font-bold text-white rounded-full flex-shrink-0"
              style={{
                background: "linear-gradient(90deg, #B4722A, #D4A44A)",
              }}
            >
              Log XP
            </span>
          </button>
        </div>
      )}

      {/* Chat with Skipper */}
      {!isFirstRun && (
        <div className="mb-4 animate-fadeIn">
          <button
            onClick={() => {
              setShowCompanion(true);
              track("companion_opened", {});
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-sky-200/50 hover:border-sky-300 transition-all cursor-pointer group active:scale-[0.98]"
            style={{
              background: "linear-gradient(to right, #F0F9FF, #E8F4FD)",
            }}
          >
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 p-0.5 group-hover:scale-110 transition-transform flex-shrink-0 flex items-center justify-center">
              <img src="/mascots/judge-hero.svg" alt="Skipper" className="w-full h-full rounded-full" />
            </div>
            <span className="text-sm font-medium text-sky-700 flex-1 text-left">Chat with Skipper</span>
            <span className="text-xs text-sky-400">Just vibes</span>
          </button>
        </div>
      )}

      {/* Yesterday Review — retrospective habit/damage checklist (hidden for first-run users) */}
      {!isFirstRun && (
        <div className="mb-4 animate-fadeIn">
          <YesterdayReview
            gameData={gameData}
            onToggleHabit={handleToggleHabit}
            onToggleDamage={handleToggleDamage}
            ppToast={ppToast}
          />
        </div>
      )}

      {/* Active Challenge Card */}
      {gameData.activeChallenge && definitions && (
        <div className="mb-6 animate-fadeIn">
          <div
            className="relative rounded-2xl border px-4 py-3.5 overflow-hidden"
            style={{
              borderColor: `${definitions[gameData.activeChallenge.stat]?.color ?? "#d4a44a"}40`,
              background: `linear-gradient(135deg, ${definitions[gameData.activeChallenge.stat]?.color ?? "#d4a44a"}08 0%, transparent 100%)`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  backgroundColor: `${definitions[gameData.activeChallenge.stat]?.color ?? "#d4a44a"}15`,
                  color: definitions[gameData.activeChallenge.stat]?.color ?? "#d4a44a",
                }}
              >
                <StatIcon iconKey={definitions[gameData.activeChallenge.stat]?.iconKey ?? "sword"} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    {gameData.activeChallenge.chainTotal
                      ? `Challenge Chain — Step ${gameData.activeChallenge.chainIndex} of ${gameData.activeChallenge.chainTotal}`
                      : "Challenge"}
                  </span>
                  <span className="text-[10px] font-medium text-stone-300">+{gameData.activeChallenge.bonusXP} bonus XP</span>
                </div>
                <p className="text-sm text-stone-600 leading-snug">{gameData.activeChallenge.description}</p>
                {/* Chain progress dots */}
                {gameData.activeChallenge.chainTotal && gameData.activeChallenge.chainIndex && (
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: gameData.activeChallenge.chainTotal }, (_, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full flex-1"
                        style={{
                          backgroundColor: i < gameData.activeChallenge!.chainIndex! - 1
                            ? (definitions[gameData.activeChallenge!.stat]?.color ?? "#d4a44a")
                            : i === gameData.activeChallenge!.chainIndex! - 1
                            ? `${definitions[gameData.activeChallenge!.stat]?.color ?? "#d4a44a"}80`
                            : `${definitions[gameData.activeChallenge!.stat]?.color ?? "#d4a44a"}20`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const isChain = !!gameData.activeChallenge?.chainId;
                  if (isChain && !window.confirm("This will dismiss the entire challenge chain. Are you sure?")) return;
                  const updated = dismissChallenge(gameData);
                  setGameData(updated);
                }}
                className="flex-shrink-0 text-stone-300 hover:text-stone-500 transition-colors text-lg leading-none mt-0.5"
                aria-label="Dismiss challenge"
              >
                &times;
              </button>
            </div>
            <button
              onClick={() => setShowJudge(true)}
              className="mt-3 w-full py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100 transition-colors active:scale-[0.98]"
            >
              Tell the Captain
            </button>
          </div>
        </div>
      )}

      {/* Challenge Completion Celebration */}
      {completedChallengeInfo && definitions && (
        <div className="mb-6 animate-questComplete">
          <div
            className="relative rounded-2xl border-2 px-4 py-4 overflow-hidden"
            style={{
              borderColor: definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a",
              background: `linear-gradient(135deg, ${definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a"}12 0%, rgba(245, 158, 11, 0.04) 100%)`,
              boxShadow: `0 0 20px 4px ${definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a"}25`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a"}20`,
                  color: definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a",
                }}
              >
                <StatIcon iconKey={definitions[completedChallengeInfo.stat]?.iconKey ?? "sword"} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: definitions[completedChallengeInfo.stat]?.color ?? "#d4a44a" }}>
                    {completedChallengeInfo.isChainStep
                      ? `Step ${completedChallengeInfo.chainIndex} Complete`
                      : completedChallengeInfo.chainTotal
                        ? "Chain Complete"
                        : "Challenge Complete"}
                  </span>
                  <span className="text-xs font-bold text-amber-600">+{completedChallengeInfo.bonusXP} bonus XP</span>
                </div>
                <p className="text-sm text-stone-500 leading-snug line-through decoration-1">{completedChallengeInfo.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Card Grid — active stats first, then inactive */}
      <div className="grid grid-cols-2 gap-2.5 mb-8">
        {[...STAT_KEYS].sort((a, b) => {
          const aActive = activeStatsThisMonth.has(a) ? 0 : 1;
          const bActive = activeStatsThisMonth.has(b) ? 0 : 1;
          return aActive - bActive;
        }).map((key) => (
          <StatCard
            key={key}
            definition={definitions[key]}
            progress={gameData.stats[key]}
            leveledUp={false}
            justGainedXP={xpGainedStat?.stat === key ? xpGainedStat.amount : false}
            streak={streaks[key]}
            isActiveThisMonth={activeStatsThisMonth.has(key)}
            previousLevel={undefined}
            isFirstRun={isFirstRun}
          />
        ))}
      </div>

      {/* Monthly XP Summary — below stat cards for returning users */}
      {!isFirstRun && (
        <div className="mb-8 animate-fadeIn">
          <MonthlyXPSummary
            currentMonthXP={monthlyXP.currentMonthXP}
            lastMonthXP={monthlyXP.lastMonthXP}
            activitiesByDay={activitiesByDayForMonth}
            habitsByDay={habitsByDayForMonth}
            statDefinitions={definitions}
            todayXP={dailyXPForMonth[new Date().getDate() - 1] ?? 0}
            todayXPPulsing={todayXPPulsing}
          />
        </div>
      )}

      {/* Activity Log — hidden for first-run users */}
      {!isFirstRun && (
        <section className="animate-fadeIn">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setIsActivityExpanded(!isActivityExpanded)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-lg font-bold text-stone-600 group-hover:text-stone-700 transition-colors">Recent Activity</h2>
              <span
                className="text-stone-400 text-xs transition-transform duration-200 inline-block"
                style={{ transform: isActivityExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                ▶
              </span>
            </button>
            <span className="text-xs text-stone-300 font-medium ml-2">
              {gameData.activities.length} activit{gameData.activities.length === 1 ? "y" : "ies"}
              {(() => {
                const latestActivity = gameData.activities[0]?.timestamp;
                const latestFeed = gameData.feedEvents?.[0]?.timestamp;
                const mostRecent = latestActivity && latestFeed
                  ? (latestActivity > latestFeed ? latestActivity : latestFeed)
                  : latestActivity || latestFeed;
                return mostRecent ? <> · {formatRelativeTime(mostRecent)}</> : null;
              })()}
            </span>
            <div className="ml-auto" />
            {isActivityExpanded && (
              <button
                onClick={() => exportGameData(gameData)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors duration-200"
                title="Export your data as JSON"
              >
                <Download size={14} />
                Export
              </button>
            )}
          </div>
          {isActivityExpanded && (
            <ActivityLog feedEvents={gameData.feedEvents ?? []} definitions={definitions} />
          )}
        </section>
      )}



      {/* Post-verdict XP toasts */}
      {xpToasts.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
          {xpToasts.map((toast) => (
            <div
              key={toast.id}
              className="animate-xpToast flex items-center gap-2 px-4 py-2 rounded-xl border"
              style={{
                backgroundColor: toast.color + "12",
                borderColor: toast.color + "30",
                boxShadow: `0 4px 12px ${toast.color}20`,
              }}
            >
              <div style={{ color: toast.color }}><StatIcon iconKey={toast.iconKey} className="w-5 h-5" /></div>
              <span className="text-sm font-bold" style={{ color: toast.color }}>
                {toast.name}
              </span>
              <span className="text-sm font-extrabold" style={{ color: toast.color }}>
                +{toast.amount} XP
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Judge Modal */}
      {showJudge && (
        <JudgeModal
          gameData={gameData}
          definitions={definitions}
          overallLevel={overallLevel}
          rank={getRankTitle(overallLevel)}
          profilePicture={gameData.profilePicture ?? null}
          onAcceptVerdict={handleJudgeVerdict}
          onCancel={() => setShowJudge(false)}
        />
      )}

      {/* Companion Modal */}
      {showCompanion && (
        <CompanionModal
          profilePicture={gameData.profilePicture ?? null}
          onClose={() => setShowCompanion(false)}
        />
      )}


      {/* Level-up celebration overlay */}
      {celebrationInfo && (
        <LevelUpCelebration
          statKey={celebrationInfo.statKey}
          newLevel={celebrationInfo.newLevel}
          statColor={celebrationInfo.statColor}
          isOverallLevelUp={celebrationInfo.isOverallLevelUp}
          overallNewLevel={celebrationInfo.overallNewLevel}
          overallNewRank={celebrationInfo.overallNewRank}
          onComplete={() => {
            setCelebrationInfo(null);
          }}
        />
      )}
    </main>
  );
}
