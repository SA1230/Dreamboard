"use client";

import { useState, useEffect } from "react";
import { AuthGate } from "@/components/AuthProvider";
import { GameData, AchievementTier } from "@/lib/types";
import { loadGameData } from "@/lib/storage";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFINITIONS,
  getAchievementsByCategory,
  isAchievementUnlocked,
  getAchievementProgress,
  checkAchievementUnlocks,
} from "@/lib/achievements";
import { RARITY_COLORS } from "@/lib/items";
import { ArrowLeft, Award, Lock, HelpCircle } from "lucide-react";
import { icons } from "lucide-react";
import Link from "next/link";

export default function AchievementsPage() {
  return (
    <AuthGate>
      <AchievementsPageContent />
    </AuthGate>
  );
}

function AchievementsPageContent() {
  const [gameData, setGameData] = useState<GameData | null>(null);

  useEffect(() => {
    let data = loadGameData();
    data = checkAchievementUnlocks(data);
    setGameData(data);
  }, []);

  // Listen for Supabase hydration
  useEffect(() => {
    const handleHydration = () => {
      let data = loadGameData();
      data = checkAchievementUnlocks(data);
      setGameData(data);
    };
    window.addEventListener("dreamboard-data-hydrated", handleHydration);
    return () => window.removeEventListener("dreamboard-data-hydrated", handleHydration);
  }, []);

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  const unlockedCount = gameData.unlockedAchievements?.length ?? 0;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-200 transition-colors text-stone-500"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-800">Achievements</h1>
          <p className="text-sm text-stone-500">
            {unlockedCount} / {totalCount} Unlocked
          </p>
        </div>
        <Award size={24} className="text-stone-300" />
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-stone-200 mb-8 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      {/* Category sections */}
      <div className="space-y-8">
        {ACHIEVEMENT_CATEGORIES.map((category) => {
          const achievements = getAchievementsByCategory(category.id);
          const categoryUnlocked = achievements.filter((a) =>
            isAchievementUnlocked(gameData, a.id)
          ).length;

          return (
            <section key={category.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                  {category.name}
                </h2>
                <span className="text-xs text-stone-400">
                  {categoryUnlocked}/{achievements.length}
                </span>
              </div>
              <p className="text-xs text-stone-400 mb-3">{category.description}</p>

              {/* Achievement cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement) => {
                  const unlocked = isAchievementUnlocked(gameData, achievement.id);
                  const isSecret = achievement.secret && !unlocked;

                  return (
                    <AchievementCard
                      key={achievement.id}
                      name={isSecret ? "???" : achievement.name}
                      description={isSecret ? "Hidden until earned" : achievement.description}
                      tier={achievement.tier}
                      iconKey={isSecret ? "help-circle" : achievement.iconKey}
                      unlocked={unlocked}
                      earnedDate={unlocked ? getEarnedDate(gameData, achievement.id) : undefined}
                      progress={!unlocked && !isSecret ? getAchievementProgress(gameData, achievement.id) : null}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

// ─── Achievement Card ──────────────────────────────────────────────────────────

function AchievementCard({
  name,
  description,
  tier,
  iconKey,
  unlocked,
  earnedDate,
  progress,
}: {
  name: string;
  description: string;
  tier: AchievementTier;
  iconKey: string;
  unlocked: boolean;
  earnedDate?: string;
  progress: { current: number; target: number } | null;
}) {
  const rarityColors = RARITY_COLORS[tier];

  // Resolve lucide icon dynamically — convert kebab-case to PascalCase
  const iconName = iconKey
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("") as keyof typeof icons;
  const IconComponent = icons[iconName] ?? Award;

  if (unlocked) {
    return (
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-colors"
        style={{ background: rarityColors.background, borderColor: rarityColors.border }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border mt-0.5"
          style={{ backgroundColor: rarityColors.background, borderColor: rarityColors.border }}
        >
          <IconComponent size={18} style={{ color: rarityColors.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: rarityColors.text }}>
            {name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: rarityColors.text, opacity: 0.7 }}>
            {description}
          </p>
          {earnedDate && (
            <p className="text-xs mt-1 opacity-50" style={{ color: rarityColors.text }}>
              Earned {earnedDate}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Locked card
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50/50 opacity-60">
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-stone-200 bg-stone-100 mt-0.5">
        {name === "???" ? (
          <HelpCircle size={18} className="text-stone-300" />
        ) : (
          <IconComponent size={18} className="text-stone-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-400">{name}</p>
        <p className="text-xs mt-0.5 text-stone-400">{description}</p>
        {progress && progress.target > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-stone-400">
                {Math.min(progress.current, progress.target)}/{progress.target}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-stone-300 transition-all duration-500"
                style={{
                  width: `${Math.min((progress.current / progress.target) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getEarnedDate(data: GameData, achievementId: string): string | undefined {
  const event = (data.feedEvents ?? []).find(
    (e) => e.type === "achievement_unlocked" && e.achievementId === achievementId,
  );
  if (!event) return undefined;
  const date = new Date(event.timestamp);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
