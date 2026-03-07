"use client";

import { StatProgress } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { getXPForNextLevel } from "@/lib/storage";
import { StatIcon } from "./StatIcons";
import { Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface StatCardProps {
  definition: StatDefinition;
  progress: StatProgress;
  leveledUp: boolean;
  justGainedXP: number | false;
  streak: number;
  isActiveThisMonth: boolean;
  previousLevel?: number;
}

// SVG ring constants (compact)
const RING_SIZE = 44;
const STROKE_WIDTH = 3.5;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatCard({
  definition,
  progress,
  leveledUp,
  justGainedXP,
  streak,
  isActiveThisMonth,
  previousLevel,
}: StatCardProps) {
  const xpNeeded = getXPForNextLevel(progress.level);
  const progressPercent = Math.min((progress.xp / xpNeeded) * 100, 100);
  const [showXPPop, setShowXPPop] = useState(false);

  // Ring offset for current progress
  const targetStrokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

  // Phased level-up animation state
  const [beat, setBeat] = useState<0 | 1 | 2 | 3>(0); // 0 = no animation
  const [displayedLevel, setDisplayedLevel] = useState(progress.level);
  const [ringOverridePercent, setRingOverridePercent] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // During beat 1, override ring to full (offset 0), otherwise use real progress
  const effectiveOffset = ringOverridePercent !== null
    ? CIRCUMFERENCE - (CIRCUMFERENCE * ringOverridePercent) / 100
    : targetStrokeDashoffset;

  // Beat 1-3 orchestration
  useEffect(() => {
    if (!leveledUp) {
      setBeat(0);
      setRingOverridePercent(null);
      return;
    }

    // Show the OLD level initially
    if (previousLevel) {
      setDisplayedLevel(previousLevel);
    }

    // Beat 1: Ring fills to 100% (starts immediately)
    setBeat(1);
    setRingOverridePercent(100);

    // Beat 1→2 transition: ring resets, badge transforms (~300ms)
    const beat2Timer = setTimeout(() => {
      setRingOverridePercent(null); // reset to real XP
      setBeat(2);
      // Swap to the new level number during the badge animation
      setTimeout(() => {
        setDisplayedLevel(progress.level);
      }, 200);
    }, 300);

    // Beat 2→3 transition: card celebrates (~700ms)
    const beat3Timer = setTimeout(() => {
      setBeat(3);
    }, 700);

    // End all animations (~1800ms)
    const endTimer = setTimeout(() => {
      setBeat(0);
      setRingOverridePercent(null);
    }, 1800);

    return () => {
      clearTimeout(beat2Timer);
      clearTimeout(beat3Timer);
      clearTimeout(endTimer);
    };
  }, [leveledUp, previousLevel, progress.level]);

  // Keep displayed level in sync when not animating
  useEffect(() => {
    if (!leveledUp) {
      setDisplayedLevel(progress.level);
    }
  }, [progress.level, leveledUp]);

  useEffect(() => {
    if (justGainedXP) {
      setShowXPPop(true);
      const timer = setTimeout(() => setShowXPPop(false), 800);
      return () => clearTimeout(timer);
    }
  }, [justGainedXP]);

  const gradientId = `statRing-${definition.key}`;

  // Inactive cards render as a compact single-line row
  if (!isActiveThisMonth) {
    return (
      <div
        ref={cardRef}
        className="relative rounded-xl px-3 py-2.5 transition-all duration-300 opacity-50 saturate-[0.3] hover:opacity-70"
        style={{ backgroundColor: definition.backgroundColor }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex-shrink-0 w-5 h-5" style={{ color: `${definition.color}60` }}>
            <StatIcon iconKey={definition.iconKey} className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm flex-1 min-w-0" style={{ color: definition.color }}>
            {definition.name}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${definition.color}10`,
              color: `${definition.color}90`,
              border: `1px solid ${definition.color}20`,
            }}
          >
            Lv.{displayedLevel}
          </span>
        </div>
      </div>
    );
  }

  // Active cards render as compact cards with ring, name, and XP
  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        beat === 3 ? "animate-cardLift" : ""
      } ${beat === 3 ? "animate-saturationBoost" : ""}`}
      style={{
        backgroundColor: definition.backgroundColor,
        "--lift-shadow": `${definition.color}25`,
      } as React.CSSProperties}
    >
      {/* Beat 3: Radial glow pulse */}
      {beat === 3 && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-0 animate-radialGlow"
          style={{
            background: `radial-gradient(circle at center, ${definition.color}20, transparent 70%)`,
          }}
        />
      )}

      {/* XP pop animation */}
      {showXPPop && (
        <div
          className="absolute top-2 right-12 animate-xpPop pointer-events-none z-10 font-bold text-sm"
          style={{ color: definition.color }}
        >
          +{justGainedXP || 1} XP
        </div>
      )}

      {/* Ring + Icon + Text row */}
      <div className="flex items-center gap-3">
        {/* Ring container */}
        <div className="relative flex-shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className={`absolute inset-0 -rotate-90 ${beat === 1 ? "animate-ringFlash" : ""}`}
            style={{
              "--flash-color": `${definition.color}60`,
            } as React.CSSProperties}
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={definition.color} />
                <stop offset="100%" stopColor={definition.progressColor} />
              </linearGradient>
            </defs>
            {/* Background track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={`${definition.color}20`}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Progress arc */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={effectiveOffset}
              className={
                beat === 1
                  ? "animate-ringFill"
                  : "transition-all duration-700 ease-out"
              }
              style={
                beat === 1
                  ? ({
                      "--ring-from": `${CIRCUMFERENCE - (CIRCUMFERENCE * 85) / 100}`,
                      "--ring-to": `${targetStrokeDashoffset}`,
                    } as React.CSSProperties)
                  : undefined
              }
            />
          </svg>

          {/* Icon centered inside ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-6 h-6">
              {/* Ghost icon layer */}
              <div style={{ color: `${definition.color}30` }} className="absolute inset-0">
                <StatIcon iconKey={definition.iconKey} className="w-6 h-6" />
              </div>
              {/* Filled icon layer — clips from bottom up based on XP progress */}
              <div
                className="absolute inset-0 transition-[clip-path] duration-700 ease-out"
                style={{
                  color: definition.color,
                  clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
                }}
              >
                <StatIcon iconKey={definition.iconKey} className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Level badge overlapping ring bottom-right */}
          <span
            className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 ${
              beat === 2 ? "animate-badgeGlow" : ""
            }`}
            style={{
              backgroundColor: definition.backgroundColor,
              color: definition.color,
              border: `1.5px solid ${definition.color}30`,
              "--glow-color": `${definition.color}50`,
            } as React.CSSProperties}
          >
            <span
              key={displayedLevel}
              className={beat === 2 ? "animate-levelIn inline-block" : "inline-block"}
            >
              Lv.{displayedLevel}
            </span>
          </span>
        </div>

        {/* Stat name + XP + streak (no description, no timestamp) */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm" style={{ color: definition.color }}>
            {definition.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs opacity-50" style={{ color: definition.color }}>
              {progress.xp} / {xpNeeded} XP
            </span>
            {streak >= 2 && (
              <span
                className="flex items-center gap-0.5 text-xs font-semibold"
                style={{ color: definition.color }}
              >
                <Flame size={10} />
                {streak}d
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
