"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GameData, StatKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getTotalLevel, exportGameData, getEffectiveDefinitions, getStatStreaks } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
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
  if (!gameData || !definitions || !streaks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  const totalLevel = getTotalLevel(gameData);

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
          Total Level{" "}
          <span className="font-bold text-stone-500">{totalLevel}</span>
          <span className="mx-1.5 text-stone-300">&middot;</span>
          <span className="text-stone-400">
            {gameData.activities.length} activit{gameData.activities.length === 1 ? "y" : "ies"} logged
          </span>
        </p>
      </header>

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
