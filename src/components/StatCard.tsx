"use client";

import { StatProgress } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { getXPForNextLevel, formatRelativeTime } from "@/lib/storage";
import { StatIcon } from "./StatIcons";
import { Flame } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface StatCardProps {
  definition: StatDefinition;
  progress: StatProgress;
  leveledUp: boolean;
  justGainedXP: boolean;
  streak: number;
  isActiveThisMonth: boolean;
  lastLoggedTimestamp: string | null;
  previousLevel?: number;
}

export function StatCard({
  definition,
  progress,
  leveledUp,
  justGainedXP,
  streak,
  isActiveThisMonth,
  lastLoggedTimestamp,
  previousLevel,
}: StatCardProps) {
  const xpNeeded = getXPForNextLevel(progress.level);
  const progressPercent = Math.min((progress.xp / xpNeeded) * 100, 100);
  const [showXPPop, setShowXPPop] = useState(false);

  // Phased level-up animation state
  const [beat, setBeat] = useState<0 | 1 | 2 | 3>(0); // 0 = no animation
  const [displayedLevel, setDisplayedLevel] = useState(progress.level);
  const [barOverridePercent, setBarOverridePercent] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Beat 1-3 orchestration
  useEffect(() => {
    if (!leveledUp) {
      setBeat(0);
      setBarOverridePercent(null);
      return;
    }

    // Show the OLD level initially
    if (previousLevel) {
      setDisplayedLevel(previousLevel);
    }

    // Beat 1: Bar fills to 100% (starts immediately)
    setBeat(1);
    setBarOverridePercent(100);

    // Beat 1→2 transition: bar resets, badge transforms (~300ms)
    const beat2Timer = setTimeout(() => {
      setBarOverridePercent(null); // reset to real XP
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
      setBarOverridePercent(null);
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

  // The effective bar width: during beat 1 it overflows to 100%, otherwise real percent
  const effectiveBarPercent = barOverridePercent !== null ? barOverridePercent : progressPercent;

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        !isActiveThisMonth ? "opacity-50 saturate-[0.3]" : ""
      } ${beat === 3 ? "animate-cardLift" : ""} ${beat === 3 ? "animate-saturationBoost" : ""}`}
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
          +1 XP
        </div>
      )}

      {/* Icon and stat name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Empty (unfilled) icon layer */}
            <div style={{ color: `${definition.color}30` }} className="absolute inset-0">
              <StatIcon iconKey={definition.iconKey} className="w-10 h-10" />
            </div>
            {/* Filled icon layer — clips from bottom up based on XP progress */}
            <div
              className="absolute inset-0 transition-[clip-path] duration-700 ease-out"
              style={{
                color: definition.color,
                clipPath: `inset(${100 - progressPercent}% 0 0 0)`,
              }}
            >
              <StatIcon iconKey={definition.iconKey} className="w-10 h-10" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: definition.color }}>
              {definition.name}
            </h3>
            <p className="text-xs opacity-60" style={{ color: definition.color }}>
              {definition.description}
            </p>
          </div>
        </div>
      </div>

      {/* Level badge + streak */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center ${
            beat === 2 ? "animate-badgeGlow" : ""
          }`}
          style={{
            backgroundColor: `${definition.color}18`,
            color: definition.color,
            "--glow-color": `${definition.color}50`,
          } as React.CSSProperties}
        >
          <span className="mr-0.5">Lv.</span>
          <span
            key={displayedLevel}
            className={
              beat === 2 ? "animate-levelIn" : ""
            }
          >
            {displayedLevel}
          </span>
        </span>
        <span className="text-xs opacity-50" style={{ color: definition.color }}>
          {progress.xp} / {xpNeeded} XP
        </span>
        {streak >= 2 && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
            style={{
              backgroundColor: `${definition.color}18`,
              color: definition.color,
            }}
          >
            <Flame size={12} />
            {streak}d
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        className={`h-2.5 rounded-full overflow-hidden ${beat === 1 ? "animate-barFlash" : ""}`}
        style={{
          backgroundColor: `${definition.color}15`,
          "--flash-color": `${definition.color}60`,
        } as React.CSSProperties}
      >
        <div
          className={`h-full rounded-full ${
            beat === 1 ? "animate-barFill" : "transition-all duration-700 ease-out"
          }`}
          style={{
            width: beat === 1 ? undefined : `${effectiveBarPercent}%`,
            backgroundColor: definition.progressColor,
            "--bar-from": "85%",
            "--bar-to": `${progressPercent}%`,
          } as React.CSSProperties}
        />
      </div>

      {/* Last logged timestamp */}
      {lastLoggedTimestamp && (
        <p
          className="text-[10px] mt-1.5 text-right"
          style={{ color: `${definition.color}50` }}
        >
          {formatRelativeTime(lastLoggedTimestamp)}
        </p>
      )}
    </div>
  );
}
