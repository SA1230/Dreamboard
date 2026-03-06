"use client";

import { useRef } from "react";
import { getNextRankTitle, getRankProgress, getRankColorPair, interpolateHexColor } from "@/lib/ranks";
import { useLevelUpAnimation } from "@/hooks/useLevelUpAnimation";
import { useParallaxTilt } from "@/hooks/useParallaxTilt";

export function LevelDisplay({
  level,
  progressPercent,
  xpIntoLevel,
  xpForNextLevel,
  isLevelingUp,
  previousOverallLevel,
  onShake,
  mascotSrc,
}: {
  level: number;
  progressPercent: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  isLevelingUp?: boolean;
  previousOverallLevel?: number;
  onShake?: () => void;
  mascotSrc: string;
}) {
  const numberRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { animPhase, displayedLevel, displayedRank, rankChanging, shatterFragments } =
    useLevelUpAnimation({ level, isLevelingUp, previousOverallLevel, onShake });

  useParallaxTilt(containerRef, numberRef);

  const isMaxLevel = level >= 60;

  // Rank-specific colors — ring gradient + title color
  // rankProgress (slow): tracks position across the full rank bracket, used for shimmer/glow thresholds
  const rankProgress = getRankProgress(displayedLevel, progressPercent / 100);
  const [rankStartColor, rankEndColor] = getRankColorPair(displayedLevel);
  // Title color tracks the ring fill directly — full gradient sweep every level for maximum dynamism
  const rankEdgeColor = interpolateHexColor(rankStartColor, rankEndColor, progressPercent / 100);

  // SVG ring dimensions
  const ringSize = 160;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetStrokeDashoffset = circumference - (circumference * progressPercent) / 100;

  // During ring-fill phase, animate to full (offset 0), then after number-swap settle to new progress
  const isAnimatingRing = animPhase === "ring-fill";
  // Hide the main ring during shatter and number-swap (fragments are visible instead)
  const isRingHidden = animPhase === "shatter" || animPhase === "number-swap";
  const effectiveStrokeDashoffset = isAnimatingRing ? 0 : targetStrokeDashoffset;

  // Glow effect on the container during level-up
  const isGlowing = animPhase === "ring-fill" || animPhase === "shatter" || animPhase === "number-swap";
  const isAnticipating = animPhase === "anticipation";

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center rounded-2xl px-8 py-6 relative cursor-default w-full"
      style={{
        background: "linear-gradient(135deg, #fefcf9 0%, #f5f0e8 50%, #ede4d6 100%)",
        boxShadow: isGlowing
          ? "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 24px rgba(245, 158, 11, 0.25)"
          : isAnticipating
          ? "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 12px rgba(245, 158, 11, 0.12)"
          : "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "box-shadow 0.4s ease-out",
      }}
    >
      {/* Rank title — color matches the leading edge of the ring gradient */}
      {(() => {
        // Glow intensifies quadratically as player nears next rank
        const glowIntensity = rankProgress * rankProgress;
        const glowRadius = 4 + glowIntensity * 14;
        const glowAlpha = 0.1 + glowIntensity * 0.4;
        const textShadow = glowIntensity > 0.05
          ? `0 0 ${glowRadius}px ${rankEdgeColor.replace("rgb", "rgba").replace(")", `, ${glowAlpha})`)}`
          : "none";
        // Shimmer kicks in past 50% rank progress — uses a lighter tint of the end color, not white
        const shimmerHighlight = interpolateHexColor(rankEndColor, "#ffffff", 0.5);
        const shimmerClass = rankProgress > 0.5 ? "animate-rankShimmer" : "";
        return (
          <span
            className={`text-sm font-extrabold uppercase tracking-[0.25em] mb-0.5 ${
              rankChanging ? "animate-titleReveal" : ""
            } ${shimmerClass}`}
            key={displayedRank}
            style={{
              color: rankEdgeColor,
              textShadow,
              // Shimmer: a tinted highlight sweeps across, using a light version of the rank end color
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
        const nextRank = getNextRankTitle(displayedLevel);
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

      {/* Ring + Number */}
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        {/* Anticipation glow — warm pulse around the ring before level-up */}
        {animPhase === "anticipation" && (
          <div
            className="absolute rounded-full animate-anticipationGlow"
            style={{ inset: "-12px" }}
          />
        )}
        {/* SVG progress ring — hidden during shatter so fragments take over */}
        <svg
          width={ringSize}
          height={ringSize}
          className="absolute inset-0 -rotate-90"
          style={{
            opacity: isRingHidden ? 0 : 1,
            transition: isRingHidden ? "opacity 0.15s ease-out" : "opacity 0.4s ease-in",
          }}
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

        {/* Shatter fragments — arc pieces that fly outward when ring breaks */}
        {shatterFragments.length > 0 && (
          <div className="absolute inset-0" style={{ overflow: "visible" }}>
            {shatterFragments.map((fragment) => {
              // Each fragment flies outward from its position on the ring
              const flyDistance = 60 + Math.random() * 20;
              const translateX = Math.cos(fragment.flyAngle) * flyDistance;
              const translateY = Math.sin(fragment.flyAngle) * flyDistance;
              const rotationDeg = ((fragment.flyAngle * 180) / Math.PI) + (Math.random() - 0.5) * 60;

              // Build the arc path for this fragment
              const cx = ringSize / 2;
              const cy = ringSize / 2;
              const x1 = cx + radius * Math.cos(fragment.startAngle);
              const y1 = cy + radius * Math.sin(fragment.startAngle);
              const x2 = cx + radius * Math.cos(fragment.endAngle);
              const y2 = cy + radius * Math.sin(fragment.endAngle);

              return (
                <svg
                  key={fragment.id}
                  width={ringSize}
                  height={ringSize}
                  className="absolute inset-0"
                  style={{
                    overflow: "visible",
                    animation: `shatterFly 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${fragment.delay}ms forwards`,
                    // CSS custom properties for the keyframe
                    ["--shatter-tx" as string]: `${translateX}px`,
                    ["--shatter-ty" as string]: `${translateY}px`,
                    ["--shatter-rotate" as string]: `${rotationDeg}deg`,
                  }}
                >
                  <path
                    d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth + 1}
                    strokeLinecap="round"
                  />
                </svg>
              );
            })}
          </div>
        )}

        {/* Skipper mascot inside the ring */}
        <div
          ref={numberRef}
          className="absolute inset-0 flex items-center justify-center select-none overflow-visible"
          style={{ transition: "transform 0.2s ease-out" }}
        >
          <img
            key={mascotSrc}
            src={mascotSrc}
            alt={`Level ${displayedLevel} mascot`}
            className={`w-[108px] h-[108px] object-contain ${animPhase === "number-swap" ? "animate-levelIn" : animPhase === "anticipation" ? "animate-mascotAnticipate" : ""}`}
            style={{ filter: "drop-shadow(0 2px 4px rgba(80,50,15,0.2))" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Level badge below the ring */}
      <span
        className="text-lg font-black mt-2 select-none text-black"
      >
        <span className="text-sm font-bold mr-0.5">Lv.</span>
        <span
          key={displayedLevel}
          className={animPhase === "number-swap" ? "animate-levelIn inline-block" : "inline-block"}
        >
          {displayedLevel}
        </span>
      </span>

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
