"use client";

import { useState, useEffect, useMemo } from "react";
import { AuthGate } from "@/components/AuthProvider";
import { GameData, StatKey } from "@/lib/types";
import {
  loadGameData,
  getOverallLevel,
  getTotalLifetimeXP,
  getEffectiveDefinitions,
  getStatStreaks,
  getMonthlyXPTotals,
  getActivitiesByDay,
  getHabitsByDay,
  getInventory,
  getMascotName,
} from "@/lib/storage";
import { STAT_KEYS } from "@/lib/stats";
import { StatCard } from "@/components/StatCard";
import { StatRadarChart } from "@/components/StatRadarChart";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { LevelDisplay } from "@/components/LevelDisplay";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StatsPage() {
  return (
    <AuthGate>
      <StatsPageContent />
    </AuthGate>
  );
}

function StatsPageContent() {
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    const data = loadGameData();
    setGameData(data);
  }, []);

  // Re-hydrate if Supabase data arrived after initial localStorage load
  useEffect(() => {
    const handleHydration = () => {
      const data = loadGameData();
      setGameData(data);
    };
    window.addEventListener("dreamboard-data-hydrated", handleHydration);
    return () => window.removeEventListener("dreamboard-data-hydrated", handleHydration);
  }, []);

  const definitions = useMemo(() => {
    if (!gameData) return null;
    return getEffectiveDefinitions(gameData);
  }, [gameData]);

  const streaks = useMemo(() => {
    if (!gameData) return null;
    return getStatStreaks(gameData.activities);
  }, [gameData]);

  const monthlyXP = useMemo(() => {
    if (!gameData) return null;
    return getMonthlyXPTotals(gameData.activities);
  }, [gameData]);

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

  const dailyXPForMonth = useMemo(() => {
    if (!gameData) return [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const activitiesByDay = getActivitiesByDay(gameData.activities, year, month);
    return Array.from({ length: today }, (_, index) => {
      const day = index + 1;
      const dayStats = activitiesByDay[day];
      if (!dayStats) return 0;
      return Object.values(dayStats).reduce((sum, xp) => sum + (xp ?? 0), 0);
    });
  }, [gameData]);

  const activitiesByDayForMonth = useMemo(() => {
    if (!gameData) return {} as Record<number, Partial<Record<StatKey, number>>>;
    const now = new Date();
    return getActivitiesByDay(gameData.activities, now.getFullYear(), now.getMonth());
  }, [gameData]);

  const habitsByDayForMonth = useMemo(() => {
    if (!gameData) return {} as Record<number, string[]>;
    const now = new Date();
    return getHabitsByDay(gameData, now.getFullYear(), now.getMonth());
  }, [gameData]);

  if (!gameData || !definitions || !streaks || !monthlyXP) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  const { level: overallLevel, xpIntoLevel, xpForNextLevel } = getOverallLevel(getTotalLifetimeXP(gameData));
  const overallProgressPercent = xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * 100) : 100;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-800">Stats</h1>
        </div>
      </header>

      {/* Level Display — Skipper character with progress ring */}
      <div className="flex justify-center mb-6">
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

      {/* Stat Radar Chart */}
      <div className="mb-6">
        <StatRadarChart stats={gameData.stats} definitions={definitions} />
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
            justGainedXP={false}
            streak={streaks[key]}
            isActiveThisMonth={activeStatsThisMonth.has(key)}
            previousLevel={undefined}
            isFirstRun={false}
          />
        ))}
      </div>

      {/* Monthly XP Summary */}
      <div className="mb-8">
        <MonthlyXPSummary
          currentMonthXP={monthlyXP.currentMonthXP}
          lastMonthXP={monthlyXP.lastMonthXP}
          activitiesByDay={activitiesByDayForMonth}
          habitsByDay={habitsByDayForMonth}
          statDefinitions={definitions}
          todayXP={dailyXPForMonth[new Date().getDate() - 1] ?? 0}
          todayXPPulsing={false}
        />
      </div>
    </main>
  );
}
