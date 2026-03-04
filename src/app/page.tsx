"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameData, StatKey, HabitKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getOverallLevel, exportGameData, getEffectiveDefinitions, getStatStreaks, getMonthlyXPTotals, getActivitiesByDay, toggleHabitForToday } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { HealthyHabits } from "@/components/HealthyHabits";
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
}: {
  level: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  const rank = getRankTitle(level);

  // SVG ring dimensions
  const ringSize = 160;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center rounded-2xl px-8 py-6 relative cursor-default w-full"
      style={{
        background: "linear-gradient(135deg, #fefcf9 0%, #f5f0e8 50%, #ede4d6 100%)",
        boxShadow: "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      {/* Rank title */}
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600/70 mb-3">
        {rank}
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
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
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
          {level}
        </span>
      </div>

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

  const handleAddXP = useCallback(
    (statKey: StatKey, note: string) => {
      if (!gameData) return;
      const { newData, leveledUp } = addXP(gameData, statKey, note);
      setGameData(newData);
      setActiveModal(null);

      // Trigger XP gain animation
      setXpGainedStat(statKey);
      setTimeout(() => setXpGainedStat(null), 900);

      // Trigger level-up animation
      if (leveledUp) {
        setLeveledUpStat(statKey);
        setTimeout(() => setLeveledUpStat(null), 2100);
      }
    },
    [gameData]
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
    <main className="max-w-3xl mx-auto px-4 py-8 pb-20">
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
        </p>
      </header>

      {/* Monthly XP Summary + Level Display — side by side on desktop, stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <MonthlyXPSummary
            currentMonthXP={monthlyXP.currentMonthXP}
            lastMonthXP={monthlyXP.lastMonthXP}
            dailyXP={dailyXPForMonth}
          />
        </div>
        <div className="flex items-stretch">
          <LevelDisplay
            level={overallLevel}
            progressPercent={overallProgressPercent}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
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
    </main>
  );
}
