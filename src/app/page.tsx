"use client";

import { useState, useEffect, useCallback } from "react";
import { GameData, StatKey } from "@/lib/types";
import { STAT_DEFINITIONS, STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getTotalLevel, exportGameData } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
import { Download } from "lucide-react";

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [activeModal, setActiveModal] = useState<StatKey | null>(null);
  const [leveledUpStat, setLeveledUpStat] = useState<StatKey | null>(null);
  const [xpGainedStat, setXpGainedStat] = useState<StatKey | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    setGameData(loadGameData());
  }, []);

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
  if (!gameData) {
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
      <header className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-stone-700 mb-1">
          Your Quest Log
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
            definition={STAT_DEFINITIONS[key]}
            progress={gameData.stats[key]}
            onAddXP={() => setActiveModal(key)}
            leveledUp={leveledUpStat === key}
            justGainedXP={xpGainedStat === key}
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
        <ActivityLog activities={gameData.activities} />
      </section>

      {/* AddXP Modal */}
      {activeModal && (
        <AddXPModal
          definition={STAT_DEFINITIONS[activeModal]}
          onConfirm={(note) => handleAddXP(activeModal, note)}
          onCancel={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}
