"use client";

import { useRef, useState, useCallback } from "react";
import { getRankTitle, getNextRankTitle, getRankProgress, getRankColorPair, interpolateHexColor } from "@/lib/ranks";
import { useParallaxTilt } from "@/hooks/useParallaxTilt";
import { SkipperCharacter } from "@/components/SkipperCharacter";
import { PlayerInventory } from "@/lib/types";
import { isMascotNameUnlocked } from "@/lib/storage";
import { Info } from "lucide-react";

const SKIPPER_REACTIONS = [
  { className: "animate-skipperWaddle", duration: 600 },
  { className: "animate-skipperHop", duration: 500 },
  { className: "animate-skipperSpin", duration: 600 },
  { className: "animate-skipperWobble", duration: 600 },
  { className: "animate-skipperPuffUp", duration: 700 },
  { className: "animate-skipperPeekaboo", duration: 700 },
] as const;

export function LevelDisplay({
  level,
  progressPercent,
  xpIntoLevel,
  xpForNextLevel,
  equippedItems,
  mascotName,
}: {
  level: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  equippedItems?: PlayerInventory["equippedItems"];
  mascotName?: string;
}) {
  const numberRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = mascotName ?? "Skipper";

  useParallaxTilt(containerRef, numberRef);

  // Random tap reaction pool
  const [tapReaction, setTapReaction] = useState<string | null>(null);

  const handleSkipperTap = useCallback(() => {
    if (tapReaction) return;

    const reaction = SKIPPER_REACTIONS[Math.floor(Math.random() * SKIPPER_REACTIONS.length)];
    setTapReaction(reaction.className);
    setTimeout(() => setTapReaction(null), reaction.duration);
  }, [tapReaction]);

  const isMaxLevel = level >= 60;

  // Rank-specific colors — ring gradient + title color
  const displayedRank = getRankTitle(level);
  const rankProgress = getRankProgress(level, progressPercent / 100);
  const [rankStartColor, rankEndColor] = getRankColorPair(level);
  const rankEdgeColor = interpolateHexColor(rankStartColor, rankEndColor, progressPercent / 100);

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
      {/* Rank title — color matches the leading edge of the ring gradient */}
      {(() => {
        const glowIntensity = rankProgress * rankProgress;
        const glowRadius = 4 + glowIntensity * 14;
        const glowAlpha = 0.1 + glowIntensity * 0.4;
        const textShadow = glowIntensity > 0.05
          ? `0 0 ${glowRadius}px ${rankEdgeColor.replace("rgb", "rgba").replace(")", `, ${glowAlpha})`)}`
          : "none";
        const shimmerHighlight = interpolateHexColor(rankEndColor, "#ffffff", 0.5);
        const shimmerClass = rankProgress > 0.5 ? "animate-rankShimmer" : "";
        return (
          <span
            className={`text-sm font-extrabold uppercase tracking-[0.25em] mb-0.5 ${shimmerClass}`}
            style={{
              color: rankEdgeColor,
              textShadow,
              ...(rankProgress > 0.5
                ? {
                    backgroundImage: `linear-gradient(
                      110deg,
                      ${rankEdgeColor} 0%,
                      ${rankEdgeColor} 38%,
                      ${shimmerHighlight} 50%,
                      ${rankEdgeColor} 62%,
                      ${rankEdgeColor} 100%
                    )`,
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
                : {}),
              transition: "color 0.3s, text-shadow 0.3s",
            }}
          >
            {displayedRank}
          </span>
        );
      })()}

      {/* Next rank milestone preview */}
      {(() => {
        const nextRank = getNextRankTitle(level);
        return nextRank ? (
          <span className="text-[10px] text-stone-300 font-medium mb-2">
            Next: {nextRank}
          </span>
        ) : (
          <span className="text-[10px] text-amber-400/60 font-medium mb-2">
            Max Rank
          </span>
        );
      })()}

      {/* Ring + Skipper */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute inset-0 -rotate-90"
        >
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={rankStartColor} />
              <stop offset="100%" stopColor={rankEndColor} />
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

        {/* Skipper mascot inside the ring */}
        <div
          ref={numberRef}
          className="absolute inset-0 flex items-center justify-center select-none overflow-visible"
          style={{ transition: "transform 0.2s ease-out" }}
        >
          <div
            className={`cursor-pointer ${tapReaction ?? ""}`}
            onClick={handleSkipperTap}
          >
            <SkipperCharacter
              equippedItems={equippedItems}
              size={108}
            />
          </div>
        </div>
      </div>

      {/* Level badge below the ring */}
      <span className="text-lg font-black mt-2 select-none text-black">
        <span className="text-sm font-bold mr-0.5">Lv.</span>
        <span className="inline-block">
          {level}
        </span>
      </span>

      {/* Mascot name — static display, with info teaser at level 3-4 */}
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-sm font-bold text-stone-600">
          {displayName}
        </span>
        {level >= 3 && !isMascotNameUnlocked(level) && (
          <div className="relative group">
            <Info size={12} className="text-stone-300 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-stone-500 bg-stone-100 border border-stone-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-10">
              Name change unlocks at Lv. 5
            </div>
          </div>
        )}
      </div>

      {/* XP text */}
      {!isMaxLevel ? (
        <span className="text-xs text-stone-400 mt-2 font-medium">
          {xpIntoLevel} / {xpForNextLevel} XP to Level {level + 1}
        </span>
      ) : (
        <span className="text-xs text-amber-600 font-bold mt-2 uppercase tracking-wider">
          Max Level
        </span>
      )}

    </div>
  );
}
