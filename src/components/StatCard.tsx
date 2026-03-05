"use client";

import { StatProgress } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { getXPForNextLevel, formatRelativeTime } from "@/lib/storage";
import { StatIcon } from "./StatIcons";
import { Plus, Flame } from "lucide-react";
import { useState, useEffect } from "react";

// Pre-generated particle positions for the level-up celebration
const PARTICLE_POSITIONS = [
  { left: 25, top: 30, tx: -30, ty: -40 },
  { left: 50, top: 20, tx: 10, ty: -50 },
  { left: 75, top: 30, tx: 35, ty: -35 },
  { left: 80, top: 50, tx: 40, ty: 10 },
  { left: 70, top: 70, tx: 30, ty: 40 },
  { left: 40, top: 75, tx: -10, ty: 45 },
  { left: 20, top: 60, tx: -40, ty: 20 },
  { left: 30, top: 45, tx: -35, ty: -15 },
];

interface StatCardProps {
  definition: StatDefinition;
  progress: StatProgress;
  onAddXP: () => void;
  leveledUp: boolean;
  justGainedXP: boolean;
  streak: number;
  isActiveThisMonth: boolean;
  lastLoggedTimestamp: string | null;
}

export function StatCard({
  definition,
  progress,
  onAddXP,
  leveledUp,
  justGainedXP,
  streak,
  isActiveThisMonth,
  lastLoggedTimestamp,
}: StatCardProps) {
  const xpNeeded = getXPForNextLevel(progress.level);
  const progressPercent = Math.min((progress.xp / xpNeeded) * 100, 100);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showXPPop, setShowXPPop] = useState(false);

  useEffect(() => {
    if (leveledUp) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [leveledUp]);

  useEffect(() => {
    if (justGainedXP) {
      setShowXPPop(true);
      const timer = setTimeout(() => setShowXPPop(false), 800);
      return () => clearTimeout(timer);
    }
  }, [justGainedXP]);

  return (
    <div
      className={`relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        !isActiveThisMonth ? "opacity-50 saturate-[0.3]" : ""
      }`}
      style={{ backgroundColor: definition.backgroundColor }}
    >
      {/* Level-up celebration overlay */}
      {showLevelUp && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 animate-levelUpGlow">
          <div className="absolute inset-0 rounded-2xl" style={{
            boxShadow: `0 0 30px ${definition.color}40, 0 0 60px ${definition.color}20`,
          }} />
          {/* Particles */}
          {PARTICLE_POSITIONS.map((pos, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-particle"
              style={{
                backgroundColor: definition.color,
                left: `${pos.left}%`,
                top: `${pos.top}%`,
                "--tx": `${pos.tx}px`,
                "--ty": `${pos.ty}px`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.6,
              } as React.CSSProperties}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg font-bold animate-levelUpText"
              style={{ color: definition.color }}
            >
              Level Up!
            </span>
          </div>
        </div>
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
        <button
          onClick={onAddXP}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
          style={{
            backgroundColor: definition.color,
            color: definition.backgroundColor,
          }}
          aria-label={`Add XP to ${definition.name}`}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Level badge + streak */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${definition.color}18`,
            color: definition.color,
          }}
        >
          Lv. {progress.level}
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
        className="h-2.5 rounded-full overflow-hidden"
        style={{ backgroundColor: `${definition.color}15` }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: definition.progressColor,
          }}
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
