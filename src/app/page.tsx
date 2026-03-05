"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameData, StatKey, HabitKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getOverallLevel, exportGameData, getEffectiveDefinitions, getStatStreaks, getMonthlyXPTotals, getActivitiesByDay, toggleHabitForToday, getLastActivityTimestamps, formatRelativeTime } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { HealthyHabits } from "@/components/HealthyHabits";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { Download, Settings, CalendarDays } from "lucide-react";
import Link from "next/link";

// Rank titles that change every ~5 levels
const RANK_TITLES: [number, string][] = [
  [1, "Novice"],
  [5, "Apprentice"],
  [10, "Journeyman"],
  [15, "Adept"],
  [20, "Expert"],
  [25, "Veteran"],
  [30, "Elite"],
  [35, "Master"],
  [40, "Grandmaster"],
  [45, "Champion"],
  [50, "Legend"],
  [55, "Mythic"],
  [60, "Transcendent"],
];

function getRankTitle(level: number): string {
  let title = "Novice";
  for (const [threshold, name] of RANK_TITLES) {
    if (level >= threshold) title = name;
  }
  return title;
}

function LevelDisplay({
  level,
  progressPercent,
  xpIntoLevel,
  xpForNextLevel,
  isLevelingUp,
  previousOverallLevel,
}: {
  level: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  isLevelingUp?: boolean;
  previousOverallLevel?: number;
}) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Phased animation state for overall level-up
  const [animPhase, setAnimPhase] = useState<"idle" | "ring-fill" | "number-swap" | "done">("idle");
  const [displayedLevel, setDisplayedLevel] = useState(level);
  const [displayedRank, setDisplayedRank] = useState(getRankTitle(level));
  const [rankChanging, setRankChanging] = useState(false);

  // Orchestrate the overall level-up animation
  // isLevelingUp is set immediately; this effect adds a 1400ms internal delay to align with Beat 4
  useEffect(() => {
    if (!isLevelingUp || !previousOverallLevel) {
      // Don't reset to idle here — let the animation finish naturally
      return;
    }

    // Show old level initially
    setDisplayedLevel(previousOverallLevel);
    setDisplayedRank(getRankTitle(previousOverallLevel));

    // Wait 1400ms (Beat 4 timing) before starting the ring animation
    const startTimer = setTimeout(() => {
      // Phase 1: Ring fills to 100%
      setAnimPhase("ring-fill");

      // Phase 2: Swap the number with bounce (~600ms after ring starts)
      setTimeout(() => {
        setAnimPhase("number-swap");
        setDisplayedLevel(level);

        // Check if rank title changed
        const oldRank = getRankTitle(previousOverallLevel);
        const newRank = getRankTitle(level);
        if (oldRank !== newRank) {
          setRankChanging(true);
          setTimeout(() => {
            setDisplayedRank(newRank);
            setTimeout(() => setRankChanging(false), 500);
          }, 150);
        }
      }, 600);

      // Phase 3: Done — settle back to normal
      setTimeout(() => {
        setAnimPhase("done");
      }, 1400);

      // Full cleanup
      setTimeout(() => {
        setAnimPhase("idle");
        setRankChanging(false);
      }, 2200);
    }, 1400);

    return () => {
      clearTimeout(startTimer);
    };
  }, [isLevelingUp, previousOverallLevel, level]);

  // Keep displayed values in sync when not animating
  useEffect(() => {
    if (!isLevelingUp) {
      setDisplayedLevel(level);
      setDisplayedRank(getRankTitle(level));
    }
  }, [level, isLevelingUp]);

  // Parallax tilt on hover (desktop) and scroll (mobile)
  useEffect(() => {
    const numberElement = numberRef.current;
    const containerElement = containerRef.current;
    if (!numberElement || !containerElement) return;

    // Desktop: tilt toward mouse position
    function handleMouseMove(event: MouseEvent) {
      if (!containerElement || !numberElement) return;
      const rect = containerElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = ((event.clientX - centerX) / (rect.width / 2)) * 6;
      const offsetY = ((event.clientY - centerY) / (rect.height / 2)) * 6;
      numberElement.style.transform = `perspective(200px) rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`;
    }

    function handleMouseLeave() {
      if (!numberElement) return;
      numberElement.style.transform = "perspective(200px) rotateY(0deg) rotateX(0deg)";
    }

    // Mobile: subtle float based on scroll position
    function handleScroll() {
      if (!containerElement || !numberElement) return;
      const rect = containerElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = (rect.top + rect.height / 2 - viewportCenter) / viewportCenter;
      const tiltX = distanceFromCenter * 4;
      numberElement.style.transform = `perspective(200px) rotateX(${tiltX}deg)`;
    }

    containerElement.addEventListener("mousemove", handleMouseMove);
    containerElement.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      containerElement.removeEventListener("mousemove", handleMouseMove);
      containerElement.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isMaxLevel = level >= 60;

  // SVG ring dimensions
  const ringSize = 160;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetStrokeDashoffset = circumference - (circumference * progressPercent) / 100;

  // During ring-fill phase, animate to full (offset 0), then after number-swap settle to new progress
  const isAnimatingRing = animPhase === "ring-fill";
  const effectiveStrokeDashoffset = isAnimatingRing ? 0 : targetStrokeDashoffset;

  // Glow effect on the container during level-up
  const isGlowing = animPhase === "ring-fill" || animPhase === "number-swap";

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center rounded-2xl px-8 py-6 relative cursor-default w-full"
      style={{
        background: "linear-gradient(135deg, #fefcf9 0%, #f5f0e8 50%, #ede4d6 100%)",
        boxShadow: isGlowing
          ? "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 24px rgba(245, 158, 11, 0.25)"
          : "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "box-shadow 0.4s ease-out",
      }}
    >
      {/* Rank title */}
      <span
        className={`text-xs font-bold uppercase tracking-[0.2em] text-amber-600/70 mb-3 ${
          rankChanging ? "animate-titleReveal" : ""
        }`}
        key={displayedRank}
      >
        {displayedRank}
      </span>

      {/* Ring + Number */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        {/* SVG progress ring */}
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute inset-0 -rotate-90"
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="#e7e0d5"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          {!isMaxLevel && (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={effectiveStrokeDashoffset}
              className={
                isAnimatingRing
                  ? "transition-[stroke-dashoffset] duration-500 ease-out"
                  : "transition-all duration-700 ease-out"
              }
            />
          )}
          {/* Full ring for max level */}
          {isMaxLevel && (
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
            />
          )}
        </svg>

        {/* Level number with 3D effect */}
        <span
          ref={numberRef}
          className="absolute inset-0 flex items-center justify-center text-6xl font-black select-none"
          style={{
            transition: "transform 0.2s ease-out",
            background: "linear-gradient(180deg, #c47a20 0%, #8b5a1a 60%, #6b4215 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            filter: "drop-shadow(0 1px 0 rgba(120,80,30,0.4)) drop-shadow(0 2px 1px rgba(100,60,20,0.25)) drop-shadow(0 4px 3px rgba(80,50,15,0.15))",
          }}
        >
          <span className="text-2xl font-bold mr-0.5" style={{ background: "inherit", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Lv.</span>
          <span
            key={displayedLevel}
            className={animPhase === "number-swap" ? "animate-levelIn inline-block" : "inline-block"}
          >
            {displayedLevel}
          </span>
        </span>
      </div>

      {/* Mascot slot — ready for Skipper the penguin */}
      {/* <div className="absolute -top-6 -right-4 w-16 h-16">mascot image here</div> */}

      {/* XP text */}
      {!isMaxLevel ? (
        <span className="text-xs text-stone-400 mt-3 font-medium">
          {xpIntoLevel} / {xpForNextLevel} XP to Level {level + 1}
        </span>
      ) : (
        <span className="text-xs text-amber-600 font-bold mt-3 uppercase tracking-wider">
          Max Level
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [activeModal, setActiveModal] = useState<StatKey | null>(null);
  const [leveledUpStat, setLeveledUpStat] = useState<StatKey | null>(null);
  const [xpGainedStat, setXpGainedStat] = useState<StatKey | null>(null);
  const [previousStatLevel, setPreviousStatLevel] = useState<number | undefined>(undefined);
  // Overall level-up animation state for the LevelDisplay ring
  const [isOverallLevelingUp, setIsOverallLevelingUp] = useState(false);
  const [previousOverallLevel, setPreviousOverallLevel] = useState<number | undefined>(undefined);
  // Celebration overlay state
  const [celebrationInfo, setCelebrationInfo] = useState<{
    statKey: StatKey;
    newLevel: number;
    statColor: string;
    isOverallLevelUp: boolean;
    overallNewLevel?: number;
    overallNewRank?: string;
  } | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setGameData(loadGameData());
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

  // Build an array of daily XP totals for the sparkline chart
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

  // Last activity timestamp per stat (for "2h ago" display on cards)
  const lastActivityTimestamps = useMemo(() => {
    if (!gameData) return null;
    return getLastActivityTimestamps(gameData.activities);
  }, [gameData]);

  // Tick every 60 seconds to keep relative timestamps fresh
  const [, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeTick((tick) => tick + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddXP = useCallback(
    (statKey: StatKey, note: string) => {
      if (!gameData || !definitions) return;

      // Capture overall level BEFORE the XP is added
      const overallBefore = getOverallLevel(gameData.activities.length);

      const { newData, leveledUp, previousLevel } = addXP(gameData, statKey, note);
      setGameData(newData);
      setActiveModal(null);

      // Trigger XP gain animation
      setXpGainedStat(statKey);
      setTimeout(() => setXpGainedStat(null), 900);

      // Trigger level-up animation
      if (leveledUp) {
        setPreviousStatLevel(previousLevel);
        setLeveledUpStat(statKey);
        setTimeout(() => setLeveledUpStat(null), 2100);

        // Check if overall level also went up
        const overallAfter = getOverallLevel(newData.activities.length);
        const isOverallLevelUp = overallAfter.level > overallBefore.level;

        // Get the stat color for confetti
        const statColor = definitions[statKey].color;

        // Trigger LevelDisplay ring animation if overall level went up (immediately — LevelDisplay handles its own timing)
        if (isOverallLevelUp) {
          setPreviousOverallLevel(overallBefore.level);
          setIsOverallLevelingUp(true);
        }

        setCelebrationInfo({
          statKey,
          newLevel: newData.stats[statKey].level,
          statColor,
          isOverallLevelUp,
          overallNewLevel: isOverallLevelUp ? overallAfter.level : undefined,
          overallNewRank: isOverallLevelUp ? getRankTitle(overallAfter.level) : undefined,
        });
      }
    },
    [gameData, definitions]
  );

  const handleToggleHabit = useCallback(
    (habitKey: HabitKey) => {
      if (!gameData) return;
      const newData = toggleHabitForToday(gameData, habitKey);
      setGameData(newData);
    },
    [gameData]
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
  const { level: overallLevel, xpIntoLevel, xpForNextLevel } = getOverallLevel(gameData.activities.length);
  const overallProgressPercent = xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * 100) : 100;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <header className="text-center mb-10 relative">
        <div className="absolute right-0 top-1 flex items-center gap-2">
          <Link
            href="/calendar"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Monthly calendar"
          >
            <CalendarDays size={18} />
          </Link>
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
            title="Customize stats"
          >
            <Settings size={18} />
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold text-stone-700 mb-1">
          Dreamboard
        </h1>
        <p className="text-stone-400 text-sm">
          {gameData.activities.length} activit{gameData.activities.length === 1 ? "y" : "ies"} logged
          {gameData.activities.length > 0 && (
            <span className="text-stone-300"> · {formatRelativeTime(gameData.activities[0].timestamp)}</span>
          )}
        </p>
      </header>

      {/* Monthly XP Summary + Today's XP + Level Display — wider than card grid */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:-mx-12">
        <div className="flex-1 min-w-0">
          <MonthlyXPSummary
            currentMonthXP={monthlyXP.currentMonthXP}
            lastMonthXP={monthlyXP.lastMonthXP}
            dailyXP={dailyXPForMonth}
          />
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-stone-50 border border-stone-200 px-16 py-5 shrink-0">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Today</p>
          <p className="text-4xl font-extrabold text-emerald-500 mt-1">
            {dailyXPForMonth[new Date().getDate() - 1] ?? 0}
          </p>
          <p className="text-[10px] font-medium text-stone-400 mt-1">XP earned</p>
        </div>
        <div className="flex items-stretch">
          <LevelDisplay
            level={overallLevel}
            progressPercent={overallProgressPercent}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            isLevelingUp={isOverallLevelingUp}
            previousOverallLevel={previousOverallLevel}
          />
        </div>
      </div>

      {/* Stat Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {STAT_KEYS.map((key) => (
          <StatCard
            key={key}
            definition={definitions[key]}
            progress={gameData.stats[key]}
            onAddXP={() => setActiveModal(key)}
            leveledUp={leveledUpStat === key}
            justGainedXP={xpGainedStat === key}
            streak={streaks[key]}
            isActiveThisMonth={activeStatsThisMonth.has(key)}
            lastLoggedTimestamp={lastActivityTimestamps?.[key] ?? null}
            previousLevel={leveledUpStat === key ? previousStatLevel : undefined}
          />
        ))}
      </div>

      {/* Healthy Habits */}
      <HealthyHabits gameData={gameData} onToggleHabit={handleToggleHabit} />

      {/* Activity Log */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-600">Recent Activity</h2>
          <button
            onClick={() => exportGameData(gameData)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors duration-200"
            title="Export your data as JSON"
          >
            <Download size={14} />
            Export
          </button>
        </div>
        <ActivityLog activities={gameData.activities} definitions={definitions} />
      </section>

      {/* AddXP Modal */}
      {activeModal && (
        <AddXPModal
          definition={definitions[activeModal]}
          onConfirm={(note) => handleAddXP(activeModal, note)}
          onCancel={() => setActiveModal(null)}
        />
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
