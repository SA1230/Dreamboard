"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GameData, StatKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getOverallLevel, exportGameData, getEffectiveDefinitions, getStatStreaks, getMonthlyXPTotals, getActivitiesByDay } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { Download, Settings, CalendarDays } from "lucide-react";
import Link from "next/link";

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
        <p className="text-stone-400 text-sm mb-4">
          {gameData.activities.length} activit{gameData.activities.length === 1 ? "y" : "ies"} logged
        </p>

        {/* Prominent level display */}
        <div className="inline-flex flex-col items-center bg-stone-100 rounded-2xl px-8 py-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Current Level</span>
          <span className="text-5xl font-extrabold text-stone-700 leading-none">{overallLevel}</span>
          {overallLevel < 60 ? (
            <>
              <div className="w-48 h-2 bg-stone-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
              <span className="text-xs text-stone-400 mt-1.5">
                {xpIntoLevel} / {xpForNextLevel} XP to Level {overallLevel + 1}
              </span>
            </>
          ) : (
            <span className="text-xs text-amber-500 font-semibold mt-2">MAX LEVEL</span>
          )}
        </div>
      </header>

      {/* Monthly XP Summary */}
      <MonthlyXPSummary
        currentMonthXP={monthlyXP.currentMonthXP}
        lastMonthXP={monthlyXP.lastMonthXP}
        dailyXP={dailyXPForMonth}
      />

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
