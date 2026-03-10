"use client";

import { useRef, useEffect } from "react";
import { Prize, ShopItem } from "@/lib/types";
import { SYSTEM_REWARDS, getVisibleRange, SystemReward } from "@/lib/prizes";
import { getRankColorPair } from "@/lib/ranks";
import { getLevelRewardItems, RARITY_COLORS } from "@/lib/items";
import { Lock, Trophy, ExternalLink, Gift, Check, Sword, Shield } from "lucide-react";

interface PrizeTimelineProps {
  currentLevel: number;
  prizes: Prize[];
  onEditPrize: (prize: Prize) => void;
  ownedItemIds?: string[];
}

const REWARD_ITEMS = getLevelRewardItems();

function getItemIcon(slot: string) {
  if (slot === "secondary") return Shield;
  if (slot === "primary") return Sword;
  return Sword;
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

  // All item reward levels that are visible
  for (const item of REWARD_ITEMS) {
    if (item.levelReward! <= (visibleRange.teased?.end ?? visibleRange.fullyVisible.end)) {
      levels.add(item.levelReward!);
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

export function PrizeTimeline({ currentLevel, prizes, onEditPrize, ownedItemIds = [] }: PrizeTimelineProps) {
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

  const itemRewardsByLevel = new Map<number, ShopItem[]>();
  for (const item of REWARD_ITEMS) {
    const level = item.levelReward!;
    const existing = itemRewardsByLevel.get(level) ?? [];
    existing.push(item);
    itemRewardsByLevel.set(level, existing);
  }

  const ownedSet = new Set(ownedItemIds);

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

  // Progress percentage: how far along the current level node sits
  // With justify-between, first node is at 0% and last is at 100%
  const currentIndex = visiblePositions.indexOf(currentLevel);
  const lastIndex = visiblePositions.length - 1;
  const progressPercent =
    lastIndex > 0 && currentIndex >= 0
      ? (currentIndex / lastIndex) * 100
      : currentIndex === 0 && lastIndex === 0
      ? 100
      : 0;

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto w-full"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Flex container — nodes spread across full width, edge to edge */}
      {/* pt-3/pb-2 gives room for checkmark badges that overflow card edges */}
      <div
        className="relative flex justify-between items-start w-full pt-3 pb-2"
        style={{ minWidth: Math.max(400, visiblePositions.length * 140), paddingLeft: 24, paddingRight: 24 }}
      >
        {/* Center line — gray base + amber progress fill */}
        <div
          className="absolute h-[2px] bg-stone-200"
          style={{ top: 176, left: 24, right: 24 }}
        />
        {/* Amber fill — scales from left edge to current level position */}
        <div
          className="absolute h-[2px] bg-amber-400"
          style={{
            top: 176,
            left: 24,
            right: 24,
            transformOrigin: "left",
            transform: `scaleX(${progressPercent / 100})`,
          }}
        />

        {/* Dashed continuation if there's more beyond teased */}
        {visibleRange.teased && (
          <>
            <div
              className="absolute right-0 h-[2px] border-t-2 border-dashed border-stone-200"
              style={{ top: 176, width: 24 }}
            />
            {/* Fog gradient overlay on teased nodes */}
            <div
              className="absolute top-0 bottom-0 right-0 pointer-events-none z-20"
              style={{
                width: 120,
                background: "linear-gradient(to right, transparent, #FDF8F4 90%)",
              }}
            />
          </>
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
              className="flex flex-col items-center shrink-0"
              style={{
                width: 140,
                opacity: isTeased ? 0.45 : 1,
                filter: isTeased ? "grayscale(0.5) blur(0.5px)" : "none",
              }}
              ref={isCurrent ? currentLevelRef : undefined}
            >
              {/* Top track: System rewards + Item rewards */}
              <div className="h-[148px] flex flex-col justify-end items-center pb-0 overflow-visible">
                {(() => {
                  const levelItemRewards = itemRewardsByLevel.get(level) ?? [];
                  const hasTopContent = systemReward || levelItemRewards.length > 0;
                  if (!hasTopContent) return null;

                  return (
                    <>
                      {/* Item reward cards */}
                      {levelItemRewards.map((item) => {
                        const rarityColors = RARITY_COLORS[item.rarity];
                        const isOwned = ownedSet.has(item.id);
                        const ItemIcon = getItemIcon(item.slot);

                        return (
                          <div
                            key={item.id}
                            className="relative rounded-xl px-3 py-2.5 text-center w-[116px] border overflow-visible mb-1"
                            style={{
                              borderColor: isUnlocked ? rarityColors.border : "#e7e5e4",
                              backgroundColor: isUnlocked ? rarityColors.background : "#fafaf9",
                            }}
                          >
                            {/* Owned badge */}
                            {isOwned && !isTeased && (
                              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center z-10">
                                <Check size={12} className="text-white" strokeWidth={3} />
                              </div>
                            )}
                            {isTeased ? (
                              <Lock size={18} className="mx-auto text-stone-300 mb-1" />
                            ) : (
                              <ItemIcon
                                size={18}
                                className="mx-auto mb-1"
                                style={{ color: isUnlocked ? rarityColors.text : "#a8a29e" }}
                              />
                            )}
                            <p
                              className="text-xs font-bold leading-tight line-clamp-2"
                              style={{ color: isUnlocked ? rarityColors.text : "#a8a29e" }}
                            >
                              {item.name}
                            </p>
                            <p
                              className="text-[10px] leading-tight mt-0.5 capitalize"
                              style={{ color: isTeased ? "#d6d3d1" : rarityColors.text, opacity: 0.7 }}
                            >
                              {item.rarity}
                            </p>
                          </div>
                        );
                      })}

                      {/* System reward card */}
                      {systemReward && (
                        <div
                          className={`relative rounded-xl px-3 py-2.5 text-center w-[116px] border overflow-visible ${
                            isUnlocked
                              ? "border-stone-300 bg-white/80"
                              : "border-stone-200 bg-stone-50"
                          }`}
                        >
                          {/* Earned badge — shows for completed AND current rank */}
                          {isUnlocked && !isTeased && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center z-10">
                              <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                          )}
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

                      {/* Connector line down to dot */}
                      <div
                        className="w-[1px] flex-1 min-h-[8px]"
                        style={{
                          backgroundColor: isUnlocked ? "#d6d3d1" : "#e7e5e4",
                        }}
                      />
                    </>
                  );
                })()}
              </div>

              {/* Center: Level marker */}
              <div className="relative flex items-center justify-center h-[32px]">
                {/* Outer glow ring for current level */}
                {isCurrent && (
                  <div
                    className="absolute w-10 h-10 rounded-full animate-ping"
                    style={{ backgroundColor: "rgba(245, 158, 11, 0.2)" }}
                  />
                )}
                <div
                  className={`rounded-full transition-all relative z-10 ${
                    isCurrent
                      ? "w-8 h-8"
                      : isCompleted
                      ? "w-3.5 h-3.5"
                      : "w-3.5 h-3.5"
                  }`}
                  style={{
                    backgroundColor: isCurrent
                      ? "#f59e0b"
                      : isCompleted
                      ? "#d6b060"
                      : isTeased
                      ? "#e7e5e4"
                      : "#d6d3d1",
                    border: isCurrent ? "3px solid #d97706" : "none",
                    boxShadow: isCurrent
                      ? "0 0 12px rgba(245, 158, 11, 0.4)"
                      : "none",
                  }}
                />
                {/* Level number below the marker */}
                <span
                  className={`absolute top-full mt-1 font-bold ${
                    isCurrent
                      ? "text-xs text-amber-600"
                      : isCompleted
                      ? "text-[10px] text-stone-400"
                      : isTeased
                      ? "text-[10px] text-stone-200"
                      : "text-[10px] text-stone-300"
                  }`}
                >
                  {level}
                </span>
              </div>

              {/* Bottom track: User prizes */}
              <div className="h-[148px] flex flex-col justify-start items-center pt-0 overflow-visible">
                {levelPrizes.length > 0 && (
                  <div
                    className="w-[1px] min-h-[8px] h-[16px]"
                    style={{
                      backgroundColor: isUnlocked ? "#fbbf24" : "#e7e5e4",
                    }}
                  />
                )}
                {levelPrizes.map((prize) => (
                  <div key={prize.id} className="relative mb-1 overflow-visible">
                    <button
                      onClick={() => onEditPrize(prize)}
                      className={`relative rounded-xl px-3 py-2.5 text-center w-[116px] border cursor-pointer transition-colors overflow-visible ${
                        isUnlocked
                          ? "border-amber-300 bg-amber-50/80 hover:bg-amber-100/80"
                          : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                      }`}
                      style={{
                        boxShadow: isUnlocked
                          ? "0 0 8px rgba(245, 158, 11, 0.15)"
                          : "none",
                      }}
                    >
                      {/* Unlocked badge */}
                      {isUnlocked && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center z-10">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
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
                    </button>
                    {/* Visit link button — only for unlocked prizes with a URL */}
                    {isUnlocked && prize.link && (
                      <a
                        href={prize.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1 mt-1 py-1 rounded-lg text-[10px] font-semibold text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <ExternalLink size={10} />
                        Visit
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
