"use client";

import { useRef, useEffect } from "react";
import { Prize } from "@/lib/types";
import { SYSTEM_REWARDS, getVisibleRange, SystemReward } from "@/lib/prizes";
import { getRankColorPair } from "@/lib/ranks";
import { Lock, Trophy, ExternalLink, Gift } from "lucide-react";

interface PrizeTimelineProps {
  currentLevel: number;
  prizes: Prize[];
  onEditPrize: (prize: Prize) => void;
}

// Merge system reward levels + user prize levels + current level into sorted unique positions
function getTimelinePositions(
  currentLevel: number,
  prizes: Prize[],
  visibleRange: ReturnType<typeof getVisibleRange>
): number[] {
  const levels = new Set<number>();

  // All system reward levels that are visible
  for (const reward of SYSTEM_REWARDS) {
    if (reward.level <= (visibleRange.teased?.end ?? visibleRange.fullyVisible.end)) {
      levels.add(reward.level);
    }
  }

  // All user prize levels (always visible regardless of fog)
  for (const prize of prizes) {
    levels.add(prize.unlockLevel);
  }

  // Current level marker
  levels.add(currentLevel);

  return Array.from(levels).sort((a, b) => a - b);
}

function getNodeState(
  level: number,
  currentLevel: number,
  visibleRange: ReturnType<typeof getVisibleRange>
): "completed" | "current" | "active" | "teased" | "hidden" {
  if (level === currentLevel) return "current";
  if (level < currentLevel) return "completed";
  if (level <= visibleRange.fullyVisible.end) return "active";
  if (visibleRange.teased && level <= visibleRange.teased.end) return "teased";
  return "hidden";
}

export function PrizeTimeline({ currentLevel, prizes, onEditPrize }: PrizeTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentLevelRef = useRef<HTMLDivElement>(null);

  const visibleRange = getVisibleRange(currentLevel);
  const positions = getTimelinePositions(currentLevel, prizes, visibleRange);

  // Build lookups
  const systemRewardsByLevel = new Map<number, SystemReward>();
  for (const reward of SYSTEM_REWARDS) {
    systemRewardsByLevel.set(reward.level, reward);
  }

  const prizesByLevel = new Map<number, Prize[]>();
  for (const prize of prizes) {
    const existing = prizesByLevel.get(prize.unlockLevel) ?? [];
    existing.push(prize);
    prizesByLevel.set(prize.unlockLevel, existing);
  }

  // Scroll to current level on mount
  useEffect(() => {
    if (currentLevelRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const marker = currentLevelRef.current;
      const scrollLeft = marker.offsetLeft - container.clientWidth / 2 + marker.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }
  }, []);

  // Visible (non-hidden) positions for rendering
  const visiblePositions = positions.filter(
    (level) => getNodeState(level, currentLevel, visibleRange) !== "hidden"
  );

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto w-full"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Flex container — nodes spread evenly across full width */}
      <div className="relative flex justify-evenly items-start w-full min-w-[400px]">
        {/* Center line — spans from first to last node */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-stone-200"
          style={{ top: 160 }}
        />

        {/* Dashed continuation if there's more beyond teased */}
        {visibleRange.teased && (
          <div
            className="absolute right-0 h-[2px] border-t-2 border-dashed border-stone-200"
            style={{ top: 160, width: 40 }}
          />
        )}

        {/* Level nodes */}
        {visiblePositions.map((level) => {
          const state = getNodeState(level, currentLevel, visibleRange);

          const systemReward = systemRewardsByLevel.get(level);
          const levelPrizes = prizesByLevel.get(level) ?? [];
          const isTeased = state === "teased";
          const isCompleted = state === "completed";
          const isCurrent = state === "current";
          const isUnlocked = level <= currentLevel;
          const [rankStartColor] = getRankColorPair(level);

          return (
            <div
              key={level}
              className="flex flex-col items-center flex-1 min-w-[130px]"
              style={{
                opacity: isTeased ? 0.4 : 1,
                filter: isTeased ? "grayscale(0.6)" : "none",
              }}
              ref={isCurrent ? currentLevelRef : undefined}
            >
              {/* Top track: System rewards */}
              <div className="h-[148px] flex flex-col justify-end items-center pb-3">
                {systemReward && (
                  <div
                    className={`rounded-xl px-3 py-2.5 text-center w-[116px] border ${
                      isUnlocked
                        ? "border-stone-300 bg-white/80"
                        : "border-stone-200 bg-stone-50"
                    }`}
                  >
                    {isTeased ? (
                      <Lock size={18} className="mx-auto text-stone-300 mb-1" />
                    ) : (
                      <Trophy
                        size={18}
                        className="mx-auto mb-1"
                        style={{ color: isUnlocked ? rankStartColor : "#a8a29e" }}
                      />
                    )}
                    <p
                      className="text-xs font-bold leading-tight"
                      style={{ color: isUnlocked ? rankStartColor : "#a8a29e" }}
                    >
                      {systemReward.title}
                    </p>
                    <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                      Lv. {systemReward.level}
                    </p>
                  </div>
                )}
              </div>

              {/* Center: Level marker */}
              <div className="relative flex items-center justify-center h-[24px]">
                <div
                  className={`rounded-full transition-all ${
                    isCurrent
                      ? "w-6 h-6 animate-levelPulse"
                      : isCompleted
                      ? "w-3.5 h-3.5"
                      : "w-3.5 h-3.5"
                  }`}
                  style={{
                    backgroundColor: isCurrent
                      ? "#f59e0b"
                      : isCompleted
                      ? "#a8a29e"
                      : isTeased
                      ? "#e7e5e4"
                      : "#d6d3d1",
                    border: isCurrent ? "2px solid #d97706" : "none",
                  }}
                />
                {/* Level number below the marker */}
                <span
                  className={`absolute top-full mt-1 text-[10px] font-semibold ${
                    isCurrent
                      ? "text-amber-600"
                      : isCompleted
                      ? "text-stone-400"
                      : isTeased
                      ? "text-stone-200"
                      : "text-stone-300"
                  }`}
                >
                  {level}
                </span>
              </div>

              {/* Bottom track: User prizes */}
              <div className="h-[148px] flex flex-col justify-start items-center pt-5">
                {levelPrizes.map((prize) => (
                  <button
                    key={prize.id}
                    onClick={() => onEditPrize(prize)}
                    className={`rounded-xl px-3 py-2.5 text-center w-[116px] border cursor-pointer transition-colors mb-1 ${
                      isUnlocked
                        ? "border-amber-200 bg-amber-50/80 hover:bg-amber-100/80"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                    }`}
                  >
                    {isUnlocked ? (
                      <Gift size={18} className="mx-auto mb-1 text-amber-500" />
                    ) : (
                      <Lock size={18} className="mx-auto mb-1 text-stone-300" />
                    )}
                    <p
                      className={`text-xs font-bold leading-tight line-clamp-2 ${
                        isUnlocked ? "text-amber-700" : "text-stone-400"
                      }`}
                    >
                      {prize.name}
                    </p>
                    {prize.link && (
                      <ExternalLink size={10} className="mx-auto mt-1 text-stone-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
