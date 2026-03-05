"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameData, StatKey, HabitKey, DamageKey } from "@/lib/types";
import { STAT_KEYS } from "@/lib/stats";
import { loadGameData, addXP, getOverallLevel, exportGameData, getEffectiveDefinitions, getStatStreaks, getMonthlyXPTotals, getActivitiesByDay, toggleHabitForToday, toggleDamageForToday, getPointsBalance, getLastActivityTimestamps, formatRelativeTime, getMascotForLevel } from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { AddXPModal } from "@/components/AddXPModal";
import { ActivityLog } from "@/components/ActivityLog";
import { MonthlyXPSummary } from "@/components/MonthlyXPSummary";
import { HealthyHabits } from "@/components/HealthyHabits";
import { DailyDamage } from "@/components/DailyDamage";
import { LevelUpCelebration } from "@/components/LevelUpCelebration";
import { Download, Settings, CalendarDays } from "lucide-react";
import Link from "next/link";

// Rank titles that change every ~5 levels
const RANK_TITLES: [number, string][] = [
  [1, "Novice"],
  [5, "Apprentice"],
  [10, "Journeyman"],
  [15, "Adept"],
  [20, "Expert"],
  [25, "Veteran"],
  [30, "Elite"],
  [35, "Master"],
  [40, "Grandmaster"],
  [45, "Champion"],
  [50, "Legend"],
  [55, "Mythic"],
  [60, "Transcendent"],
];

function getRankTitle(level: number): string {
  let title = "Novice";
  for (const [threshold, name] of RANK_TITLES) {
    if (level >= threshold) title = name;
  }
  return title;
}

// Returns 0–1 representing fine-grained progress through the current rank bracket.
// levelFraction (0–1) is XP progress within the current level, so the color shifts smoothly per XP.
function getRankProgress(level: number, levelFraction: number = 0): number {
  let currentThreshold = 1;
  let nextThreshold: number | null = null;
  for (let i = 0; i < RANK_TITLES.length; i++) {
    if (level >= RANK_TITLES[i][0]) {
      currentThreshold = RANK_TITLES[i][0];
      nextThreshold = i + 1 < RANK_TITLES.length ? RANK_TITLES[i + 1][0] : null;
    }
  }
  if (nextThreshold === null) return 1; // max rank reached
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 1;
  return Math.min(1, (level - currentThreshold + levelFraction) / range);
}

// Each rank has a unique [startColor, endColor] gradient — high contrast pairs so the shift is visible
const RANK_COLORS: Record<number, [string, string]> = {
  1:  ["#c07858", "#d4a030"],  // Novice: warm clay → golden amber
  5:  ["#48a870", "#2078a0"],  // Apprentice: emerald → ocean blue
  10: ["#5088c0", "#8050d0"],  // Journeyman: sky blue → violet
  15: ["#e06848", "#c03080"],  // Adept: coral → magenta
  20: ["#c89810", "#d04810"],  // Expert: gold → burnt red
  25: ["#388880", "#30b868"],  // Veteran: teal → bright green
  30: ["#4858c8", "#a038c8"],  // Elite: royal blue → purple
  35: ["#d03838", "#e8a008"],  // Master: red → golden amber
  40: ["#7840c0", "#e03078"],  // Grandmaster: purple → hot pink
  45: ["#2070d0", "#18c0c8"],  // Champion: blue → cyan
  50: ["#189060", "#c8a818"],  // Legend: emerald → gold
  55: ["#7018a8", "#e028e0"],  // Mythic: deep purple → bright magenta
  60: ["#c89820", "#f0c030"],  // Transcendent: rich gold → brilliant gold
};

// Get the color pair for the player's current rank
function getRankColorPair(level: number): [string, string] {
  let colors: [string, string] = RANK_COLORS[1];
  for (const [threshold] of RANK_TITLES) {
    if (level >= threshold && RANK_COLORS[threshold]) {
      colors = RANK_COLORS[threshold];
    }
  }
  return colors;
}

// Linearly interpolate between two hex colors (e.g. "#ff0000", "#00ff00", 0.5 → "#808000")
function interpolateHexColor(hexA: string, hexB: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const a = parse(hexA);
  const b = parse(hexB);
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function LevelDisplay({
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

  // Stabilize onShake callback so it doesn't re-trigger the animation effect
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  // Phased animation state for overall level-up
  // idle → ring-fill → shatter → number-swap → done → idle
  const [animPhase, setAnimPhase] = useState<"idle" | "anticipation" | "ring-fill" | "shatter" | "number-swap" | "done">("idle");
  const [displayedLevel, setDisplayedLevel] = useState(level);
  const [displayedRank, setDisplayedRank] = useState(getRankTitle(level));
  const [rankChanging, setRankChanging] = useState(false);

  // Shatter fragment state — arc pieces that fly outward
  const [shatterFragments, setShatterFragments] = useState<
    { id: number; startAngle: number; endAngle: number; flyAngle: number; delay: number }[]
  >([]);

  // Orchestrate the overall level-up animation
  // isLevelingUp is set immediately; this effect adds a 1400ms internal delay to align with Beat 4
  useEffect(() => {
    if (!isLevelingUp || !previousOverallLevel) {
      return;
    }

    // Show old level initially
    setDisplayedLevel(previousOverallLevel);
    setDisplayedRank(getRankTitle(previousOverallLevel));

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 0: Anticipation — ring glows, mascot bounces (600ms before ring fills)
    timers.push(setTimeout(() => {
      setAnimPhase("anticipation");
    }, 800));

    // Wait 1400ms (Beat 4 timing) before starting the ring animation
    timers.push(setTimeout(() => {
      // Phase 1: Ring fills to 100%
      setAnimPhase("ring-fill");

      // Phase 2: Shatter — ring breaks into arc fragments (~500ms after ring starts filling)
      timers.push(setTimeout(() => {
        // Generate 8 arc fragments evenly around the ring
        const fragmentCount = 8;
        const fragments = Array.from({ length: fragmentCount }, (_, index) => {
          const segmentAngle = (Math.PI * 2) / fragmentCount;
          const startAngle = index * segmentAngle - Math.PI / 2; // start from top
          const endAngle = startAngle + segmentAngle;
          const flyAngle = startAngle + segmentAngle / 2; // fly outward from midpoint
          return {
            id: index,
            startAngle,
            endAngle,
            flyAngle,
            delay: index * 25, // slight stagger for each fragment
          };
        });
        setShatterFragments(fragments);
        setAnimPhase("shatter");
        // Trigger page-wide screen shake at the moment of shatter
        onShakeRef.current?.();
      }, 500));

      // Phase 3: Swap the number with bounce (~400ms after shatter starts, fragments are flying)
      timers.push(setTimeout(() => {
        setAnimPhase("number-swap");
        setDisplayedLevel(level);

        // Check if rank title changed
        const oldRank = getRankTitle(previousOverallLevel);
        const newRank = getRankTitle(level);
        if (oldRank !== newRank) {
          setRankChanging(true);
          timers.push(setTimeout(() => {
            setDisplayedRank(newRank);
            timers.push(setTimeout(() => setRankChanging(false), 500));
          }, 150));
        }
      }, 900));

      // Phase 4: Done — settle back to normal
      timers.push(setTimeout(() => {
        setAnimPhase("done");
        setShatterFragments([]);
      }, 1600));

      // Full cleanup
      timers.push(setTimeout(() => {
        setAnimPhase("idle");
        setRankChanging(false);
      }, 2400));
    }, 1400));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isLevelingUp, previousOverallLevel, level]);

  // Keep displayed values in sync when not animating
  useEffect(() => {
    if (!isLevelingUp) {
      setDisplayedLevel(level);
      setDisplayedRank(getRankTitle(level));
    }
  }, [level, isLevelingUp]);

  // Parallax tilt on hover (desktop) and scroll (mobile)
  useEffect(() => {
    const numberElement = numberRef.current;
    const containerElement = containerRef.current;
    if (!numberElement || !containerElement) return;

    // Desktop: tilt toward mouse position
    function handleMouseMove(event: MouseEvent) {
      if (!containerElement || !numberElement) return;
      const rect = containerElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const offsetX = ((event.clientX - centerX) / (rect.width / 2)) * 6;
      const offsetY = ((event.clientY - centerY) / (rect.height / 2)) * 6;
      numberElement.style.transform = `perspective(200px) rotateY(${offsetX}deg) rotateX(${-offsetY}deg)`;
    }

    function handleMouseLeave() {
      if (!numberElement) return;
      numberElement.style.transform = "perspective(200px) rotateY(0deg) rotateX(0deg)";
    }

    // Mobile: subtle float based on scroll position
    function handleScroll() {
      if (!containerElement || !numberElement) return;
      const rect = containerElement.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = (rect.top + rect.height / 2 - viewportCenter) / viewportCenter;
      const tiltX = distanceFromCenter * 4;
      numberElement.style.transform = `perspective(200px) rotateX(${tiltX}deg)`;
    }

    containerElement.addEventListener("mousemove", handleMouseMove);
    containerElement.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      containerElement.removeEventListener("mousemove", handleMouseMove);
      containerElement.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
            className={`text-sm font-extrabold uppercase tracking-[0.25em] mb-3 ${
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
        className="text-lg font-black mt-2 select-none"
        style={{
          background: "linear-gradient(180deg, #c47a20 0%, #8b5a1a 60%, #6b4215 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 1px 0 rgba(120,80,30,0.3))",
        }}
      >
        <span className="text-sm font-bold mr-0.5" style={{ background: "inherit", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Lv.</span>
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

export default function Home() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [activeModal, setActiveModal] = useState<StatKey | null>(null);
  const [leveledUpStat, setLeveledUpStat] = useState<StatKey | null>(null);
  const [xpGainedStat, setXpGainedStat] = useState<StatKey | null>(null);
  const [previousStatLevel, setPreviousStatLevel] = useState<number | undefined>(undefined);
  // Overall level-up animation state for the LevelDisplay ring
  const [isOverallLevelingUp, setIsOverallLevelingUp] = useState(false);
  const [previousOverallLevel, setPreviousOverallLevel] = useState<number | undefined>(undefined);
  // Page-wide screen shake on overall level-up
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isActivityExpanded, setIsActivityExpanded] = useState(true);
  // Celebration overlay state
  const [celebrationInfo, setCelebrationInfo] = useState<{
    statKey: StatKey;
    newLevel: number;
    statColor: string;
    isOverallLevelUp: boolean;
    overallNewLevel?: number;
    overallNewRank?: string;
  } | null>(null);

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

  // Calculate monthly XP totals for trend display
  const monthlyXP = useMemo(() => {
    if (!gameData) return null;
    return getMonthlyXPTotals(gameData.activities);
  }, [gameData]);

  // Determine which stats have at least one activity this month
  const activeStatsThisMonth = useMemo(() => {
    if (!gameData) return new Set<StatKey>();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const activeStats = new Set<StatKey>();
    for (const activity of gameData.activities) {
      const date = new Date(activity.timestamp);
      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        activeStats.add(activity.stat);
      }
    }
    return activeStats;
  }, [gameData]);

  // Build an array of daily XP totals for the sparkline chart
  const dailyXPForMonth = useMemo(() => {
    if (!gameData) return [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const activitiesByDay = getActivitiesByDay(gameData.activities, year, month);

    // Create an array from day 1 to today, summing all stat XP per day
    return Array.from({ length: today }, (_, index) => {
      const day = index + 1;
      const dayStats = activitiesByDay[day];
      if (!dayStats) return 0;
      return Object.values(dayStats).reduce((sum, xp) => sum + (xp ?? 0), 0);
    });
  }, [gameData]);

  // Last activity timestamp per stat (for "2h ago" display on cards)
  const lastActivityTimestamps = useMemo(() => {
    if (!gameData) return null;
    return getLastActivityTimestamps(gameData.activities);
  }, [gameData]);

  // Tick every 60 seconds to keep relative timestamps fresh
  const [, setTimeTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTimeTick((tick) => tick + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddXP = useCallback(
    (statKey: StatKey, note: string) => {
      if (!gameData || !definitions) return;

      // Capture overall level BEFORE the XP is added
      const overallBefore = getOverallLevel(gameData.activities.length);

      const { newData, leveledUp, previousLevel } = addXP(gameData, statKey, note);
      setGameData(newData);
      setActiveModal(null);

      // Trigger XP gain animation
      setXpGainedStat(statKey);
      setTimeout(() => setXpGainedStat(null), 900);

      // Check if overall level went up (independent of stat level-up)
      const overallAfter = getOverallLevel(newData.activities.length);
      const isOverallLevelUp = overallAfter.level > overallBefore.level;

      // Trigger stat level-up animation
      if (leveledUp) {
        setPreviousStatLevel(previousLevel);
        setLeveledUpStat(statKey);
        setTimeout(() => setLeveledUpStat(null), 2100);

        // Get the stat color for confetti
        const statColor = definitions[statKey].color;

        setCelebrationInfo({
          statKey,
          newLevel: newData.stats[statKey].level,
          statColor,
          isOverallLevelUp,
          overallNewLevel: isOverallLevelUp ? overallAfter.level : undefined,
          overallNewRank: isOverallLevelUp ? getRankTitle(overallAfter.level) : undefined,
        });
      }

      // Trigger LevelDisplay ring animation if overall level went up (fires even without stat level-up)
      if (isOverallLevelUp) {
        setPreviousOverallLevel(overallBefore.level);
        setIsOverallLevelingUp(true);

        // If no stat celebration to handle cleanup, auto-cleanup after animation completes
        if (!leveledUp) {
          setTimeout(() => {
            setIsOverallLevelingUp(false);
            setPreviousOverallLevel(undefined);
          }, 4000);
        }
      }
    },
    [gameData, definitions]
  );

  const handleToggleHabit = useCallback(
    (habitKey: HabitKey) => {
      if (!gameData) return;
      const newData = toggleHabitForToday(gameData, habitKey);
      setGameData(newData);
    },
    [gameData]
  );

  const handleToggleDamage = useCallback(
    (damageKey: DamageKey) => {
      if (!gameData) return;
      const newData = toggleDamageForToday(gameData, damageKey);
      setGameData(newData);
    },
    [gameData]
  );

  // AA points balance derived from habits vs damage
  const pointsBalance = useMemo(() => {
    if (!gameData) return null;
    return getPointsBalance(gameData);
  }, [gameData]);

  // Show nothing while loading from localStorage (prevents hydration flash)
  if (!gameData || !definitions || !streaks || !monthlyXP) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  // Overall player level based on total lifetime XP (activities logged)
  const { level: overallLevel, xpIntoLevel, xpForNextLevel } = getOverallLevel(gameData.activities.length);
  const overallProgressPercent = xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * 100) : 100;

  // Weekly quote — one per week of the year, rotates by week number
  const weeklyQuotes: { text: string; author: string }[] = [
    { text: "The secret of getting ahead is getting started.", author: "Mark T." },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin S." },
    { text: "We are what we repeatedly do.", author: "Aristotle" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao T." },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Do something today that your future self will thank you for.", author: "Sean P." },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert C." },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Z." },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham L." },
    { text: "The only way to do great work is to love what you do.", author: "Steve J." },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "Motivation gets you going. Habit keeps you there.", author: "Jim R." },
    { text: "Be not afraid of going slowly; be afraid only of standing still.", author: "Chinese Proverb" },
    { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen R." },
    { text: "The harder you work, the luckier you get.", author: "Gary P." },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur A." },
    { text: "Consistency is the true foundation of trust.", author: "Roy B." },
    { text: "Action is the foundational key to all success.", author: "Pablo P." },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "One day or day one. You decide.", author: "Paulo C." },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert K." },
    { text: "The pain of discipline is far less than the pain of regret.", author: "Sarah B." },
    { text: "Champions keep playing until they get it right.", author: "Billie J." },
    { text: "Dream big. Start small. Act now.", author: "Robin S." },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam L." },
    { text: "Believe you can and you're halfway there.", author: "Theodore R." },
    { text: "If you want something you've never had, do something you've never done.", author: "Thomas J." },
    { text: "Excellence is not a destination but a continuously growing process.", author: "Ed F." },
    { text: "The difference between try and triumph is a little umph.", author: "Marvin P." },
    { text: "Good habits formed at youth make all the difference.", author: "Aristotle" },
    { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne J." },
    { text: "Every accomplishment starts with the decision to try.", author: "John F." },
    { text: "Energy and persistence conquer all things.", author: "Benjamin F." },
    { text: "With self-discipline most anything is possible.", author: "Theodore R." },
    { text: "A little progress each day adds up to big results.", author: "Satya N." },
    { text: "Strive for progress, not perfection.", author: "David P." },
    { text: "The way to get started is to quit talking and begin doing.", author: "Walt D." },
    { text: "Setting goals is the first step in turning the invisible into the visible.", author: "Tony R." },
    { text: "Don't count the days. Make the days count.", author: "Muhammad A." },
    { text: "It always seems impossible until it's done.", author: "Nelson M." },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. L." },
    { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah G." },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim N." },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin R." },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Ben F." },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "It's not about having time. It's about making time.", author: "Unknown" },
    { text: "Be stronger than your excuses.", author: "Unknown" },
    { text: "Stay patient and trust your journey.", author: "Unknown" },
    { text: "The best project you'll ever work on is you.", author: "Unknown" },
  ];
  const currentWeekNumber = (() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1;
    return Math.ceil(dayOfYear / 7);
  })();
  const weeklyQuote = weeklyQuotes[(currentWeekNumber - 1) % weeklyQuotes.length];

  return (
    <main
      className={`max-w-4xl mx-auto px-4 py-8 pb-20 ${isScreenShaking ? "animate-screenShake" : ""}`}
      onAnimationEnd={() => setIsScreenShaking(false)}
    >
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
        <h1 className="mb-1">
          <img
            src="/logos/dreambound-wordmark-black.svg"
            alt="Dreambound"
            className="h-8 inline-block"
          />
        </h1>
        <p className="text-stone-400 text-sm">
          {gameData.activities.length} activit{gameData.activities.length === 1 ? "y" : "ies"} logged
          {gameData.activities.length > 0 && (
            <span className="text-stone-300"> · {formatRelativeTime(gameData.activities[0].timestamp)}</span>
          )}
          <span className="text-stone-300"> | Week {currentWeekNumber}/52</span>
        </p>
        <p className="text-stone-300 text-sm italic mt-0.5">
          &ldquo;{weeklyQuote.text}&rdquo; — {weeklyQuote.author}
        </p>
      </header>

      {/* Monthly XP Summary + Today's XP + Level Display — wider than card grid */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 mb-8 sm:-mx-12">
        <div className="flex-1 min-w-0">
          <MonthlyXPSummary
            currentMonthXP={monthlyXP.currentMonthXP}
            lastMonthXP={monthlyXP.lastMonthXP}
            dailyXP={dailyXPForMonth}
          />
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-stone-50 border border-stone-200 px-16 py-5 shrink-0">
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Today</p>
          <p className="text-6xl font-extrabold text-emerald-500 mt-3">
            {dailyXPForMonth[new Date().getDate() - 1] ?? 0}
          </p>
          <p className="text-[10px] font-medium text-stone-400 mt-2">XP earned</p>
        </div>
        <div className="flex" style={{ transform: "scale(1.05)", transformOrigin: "center center" }}>
          <LevelDisplay
            level={overallLevel}
            progressPercent={overallProgressPercent}
            xpIntoLevel={xpIntoLevel}
            xpForNextLevel={xpForNextLevel}
            isLevelingUp={isOverallLevelingUp}
            previousOverallLevel={previousOverallLevel}
            onShake={() => setIsScreenShaking(true)}
            mascotSrc={getMascotForLevel(overallLevel, gameData.mascotOverrides)}
          />
        </div>
      </div>

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
            isActiveThisMonth={activeStatsThisMonth.has(key)}
            lastLoggedTimestamp={lastActivityTimestamps?.[key] ?? null}
            previousLevel={leveledUpStat === key ? previousStatLevel : undefined}
          />
        ))}
      </div>

      {/* Healthy Habits */}
      <HealthyHabits gameData={gameData} onToggleHabit={handleToggleHabit} />

      {/* Daily Damage */}
      <DailyDamage gameData={gameData} onToggleDamage={handleToggleDamage} />

      {/* Points Balance */}
      {pointsBalance && (
        <section className="mb-12">
        <h2 className="text-lg font-bold text-stone-600 mb-4 flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 1L4 11h5.5L8.5 19 16 9h-5.5L11.5 1z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          Power Points
          <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded-full">
            Shop coming soon
          </span>
        </h2>
        <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-stone-50 border border-stone-200 mx-auto w-fit">
          {/* Earned */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold text-emerald-600">+{pointsBalance.lifetimeEarned}</span>
            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">earned</span>
          </div>
          {/* Divider */}
          <div className="w-px h-8 bg-stone-200" />
          {/* Balance (hero number) */}
          <div className="flex flex-col items-center gap-0.5 px-3">
            <span className="text-3xl font-extrabold text-amber-600">{pointsBalance.balance}</span>
            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">balance</span>
          </div>
          {/* Divider */}
          <div className="w-px h-8 bg-stone-200" />
          {/* Damage */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-bold text-red-500">-{pointsBalance.lifetimeDamage}</span>
            <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">damage</span>
          </div>
        </div>
        </section>
      )}

      {/* Activity Log */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsActivityExpanded(!isActivityExpanded)}
            className="flex items-center gap-2 group"
          >
            <h2 className="text-lg font-bold text-stone-600 group-hover:text-stone-700 transition-colors">Recent Activity</h2>
            <span
              className="text-stone-400 text-xs transition-transform duration-200 inline-block"
              style={{ transform: isActivityExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▶
            </span>
          </button>
          {isActivityExpanded && (
            <button
              onClick={() => exportGameData(gameData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors duration-200"
              title="Export your data as JSON"
            >
              <Download size={14} />
              Export
            </button>
          )}
        </div>
        {isActivityExpanded && (
          <ActivityLog feedEvents={gameData.feedEvents ?? []} definitions={definitions} />
        )}
      </section>

      {/* AddXP Modal */}
      {activeModal && (
        <AddXPModal
          definition={definitions[activeModal]}
          onConfirm={(note) => handleAddXP(activeModal, note)}
          onCancel={() => setActiveModal(null)}
        />
      )}

      {/* Level-up celebration overlay (confetti + toast + overall level-up) */}
      {celebrationInfo && (
        <LevelUpCelebration
          statKey={celebrationInfo.statKey}
          newLevel={celebrationInfo.newLevel}
          statColor={celebrationInfo.statColor}
          isOverallLevelUp={celebrationInfo.isOverallLevelUp}
          overallNewLevel={celebrationInfo.overallNewLevel}
          overallNewRank={celebrationInfo.overallNewRank}
          onComplete={() => {
            setCelebrationInfo(null);
            setIsOverallLevelingUp(false);
            setPreviousOverallLevel(undefined);
          }}
        />
      )}
    </main>
  );
}
