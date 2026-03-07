"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Download, Settings, CalendarDays, ShoppingBag, Trophy } from "lucide-react";
import Link from "next/link";
import { getRankTitle } from "@/lib/ranks";
import { UserMenu } from "@/components/UserMenu";
import { CaptainQuip } from "@/components/CaptainQuip";
import { getCaptainQuip } from "@/lib/captainQuips";

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [xpGainedStat, setXpGainedStat] = useState<{ stat: StatKey; amount: number } | null>(null);
  // Overall level-up animation state for the LevelDisplay ring
  const [isOverallLevelingUp, setIsOverallLevelingUp] = useState(false);
  const [previousOverallLevel, setPreviousOverallLevel] = useState<number | undefined>(undefined);
  // Page-wide screen shake on overall level-up
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  const [showJudge, setShowJudge] = useState(false);

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

          if (isOverallLevelUp) {
            setPreviousOverallLevel(overallBefore.level);
            setIsOverallLevelingUp(true);
          }
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

  // Daily Captain quip (deterministic — same all day, rotates tomorrow)
  const quipText = !isFirstRun && definitions && streaks
    ? getCaptainQuip({
        activities: gameData.activities,
        streaks,
        activeChallenge: gameData.activeChallenge ?? null,
        overallLevel,
        rank: getRankTitle(overallLevel),
        definitions,
      })
    : null;

  // Weekly quote — hidden for now, may bring back later
  // const weeklyQuotes / currentWeekNumber / weeklyQuote removed from render

  return (
    <main
      className={`max-w-4xl mx-auto px-4 py-8 pb-20 ${isScreenShaking ? "animate-screenShake" : ""}`}
      onAnimationEnd={() => setIsScreenShaking(false)}
    >
      {/* Header */}
      <header className="text-center mb-10 relative sticky top-0 z-50 bg-[#FDF8F4]/80 backdrop-blur-md -mx-4 px-4 py-3 border-b border-stone-200/50">
        <div className="absolute left-0 top-2">
          <UserMenu />
        </div>
        <div className="absolute right-0 top-1 flex items-center gap-2">
          <Link
            href="/calendar"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Monthly calendar"
            aria-label="Monthly calendar"
          >
            <CalendarDays size={18} />
          </Link>
          <Link
            href="/shop"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Power-Up Store"
            aria-label="Shop"
          >
            <ShoppingBag size={18} />
          </Link>
          <Link
            href="/prizes"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Prize Track"
            aria-label="Prize Track"
          >
            <Trophy size={18} />
          </Link>
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Customize stats"
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
        <h1 className="mb-1 flex items-center justify-center gap-1.5">
          <img
            src="/logos/dreambound-icon-blue.svg"
            alt=""
            className="h-7 inline-block"
          />
          <img
            src="/logos/dreambound-wordmark-blue.svg"
            alt="Dreamboard"
            className="h-7 inline-block"
          />
        </h1>
      </header>

      {/* Yesterday Review — retrospective habit/damage checklist (hidden for first-run users) */}
      {!isFirstRun && (
        <div className="mt-14 mb-4 animate-fadeIn">
          <YesterdayReview
            gameData={gameData}
            onToggleHabit={handleToggleHabit}
            onToggleDamage={handleToggleDamage}
            ppToast={ppToast}
          />
        </div>
      )}

      {/* Welcome Card — shown only on first run */}
      {isFirstRun && (
        <div className="mt-14 mb-6 animate-fadeIn">
          <div className="rounded-2xl border border-stone-200 p-5 text-center" style={{ backgroundColor: "#FDFBF7" }}>
            <h2 className="text-lg font-bold text-stone-700 mb-2">Welcome to Dreambound</h2>
            <p className="text-sm text-stone-500 leading-relaxed">
              Track your real-life accomplishments like an RPG character.
              Tell the Captain what you did today — they&apos;ll interview you,
              judge your effort with some sass, and award XP across your stats.
            </p>
            <p className="text-xs text-stone-400 mt-3">
              Tap below to log your first activity and start leveling up.
            </p>
          </div>
        </div>
      )}

      {/* Captain CTA — full hero card for first-run, compact bar for returning users */}
      {isFirstRun ? (
        <div className="mb-6">
          <button
            onClick={() => setShowJudge(true)}
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

      {/* Daily Captain Quip */}
      {!isFirstRun && quipText && (
        <div className="mb-4 animate-fadeIn">
          <CaptainQuip quipText={quipText} />
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
                          backgroundColor: i < gameData.activeChallenge!.chainIndex!
                            ? (definitions[gameData.activeChallenge!.stat]?.color ?? "#d4a44a")
                            : i === gameData.activeChallenge!.chainIndex! - 1
                            ? (definitions[gameData.activeChallenge!.stat]?.color ?? "#d4a44a")
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

      {/* Level Display — Skipper character with progress ring */}
      <div className={`flex justify-center mb-6${isFirstRun ? "" : ""}`}>
        <div style={{ transform: "scale(1.05)", transformOrigin: "center center" }}>
          <LevelDisplay
            level={overallLevel}
            progressPercent={overallProgressPercent}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            isLevelingUp={isOverallLevelingUp}
            previousOverallLevel={previousOverallLevel}
            onShake={() => setIsScreenShaking(true)}
            equippedItems={getInventory(gameData).equippedItems}
            mascotName={getMascotName(gameData)}
          />
        </div>
      </div>

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
        <div className="mb-8">
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
        <section>
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

      {/* Floating Captain FAB — always visible in bottom-right corner */}
      {!showJudge && (
        <button
          onClick={() => setShowJudge(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #D4A44A 0%, #B4722A 100%)",
            boxShadow: "0 4px 16px rgba(180, 114, 42, 0.35), 0 2px 4px rgba(0,0,0,0.1)",
          }}
          aria-label="Tell the Captain what you accomplished"
        >
          <img
            src="/mascots/judge-hero.svg"
            alt="The Captain"
            className="w-full h-full rounded-full p-1.5"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
          />
        </button>
      )}

      {/* Level-up celebration overlay (confetti + toast + overall level-up) */}
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
            setIsOverallLevelingUp(false);
            setPreviousOverallLevel(undefined);
          }}
        />
      )}
    </main>
  );
}
