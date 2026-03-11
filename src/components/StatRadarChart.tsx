"use client";

import { StatKey } from "@/lib/types";
import { STAT_KEYS, StatDefinition } from "@/lib/stats";
import { StatProgress } from "@/lib/types";

interface StatRadarChartProps {
  stats: Record<StatKey, StatProgress>;
  definitions: Record<StatKey, StatDefinition>;
}

// SVG viewBox dimensions — extra padding for labels
const SIZE = 380;
const CENTER = SIZE / 2;
const RADIUS = 110;
const LABEL_RADIUS = RADIUS + 30;
const NUM_RINGS = 4;
const NUM_AXES = STAT_KEYS.length; // 8

function polarToCartesian(
  angleDeg: number,
  radius: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180; // -90 so 0° is top
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  };
}

function getAngleForIndex(index: number): number {
  return (360 / NUM_AXES) * index;
}

/** Build an octagonal polygon path at a given fraction of RADIUS */
function ringPath(fraction: number): string {
  const r = RADIUS * fraction;
  const points = Array.from({ length: NUM_AXES }, (_, i) => {
    const { x, y } = polarToCartesian(getAngleForIndex(i), r);
    return `${x},${y}`;
  });
  return `M${points.join("L")}Z`;
}

export function StatRadarChart({ stats, definitions }: StatRadarChartProps) {
  // Determine scale: highest stat level, minimum 5
  const maxLevel = Math.max(
    ...STAT_KEYS.map((key) => stats[key]?.level ?? 1),
    5
  );

  // Build the player polygon
  const playerPoints = STAT_KEYS.map((key, i) => {
    const level = stats[key]?.level ?? 1;
    const fraction = level / maxLevel;
    const angle = getAngleForIndex(i);
    return polarToCartesian(angle, RADIUS * fraction);
  });

  const playerPath =
    "M" + playerPoints.map((p) => `${p.x},${p.y}`).join("L") + "Z";

  return (
    <div className="relative w-full max-w-xs mx-auto bg-white/50 rounded-2xl border border-stone-200/40 py-3 px-2">
      <p className="text-center text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">Your Build</p>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-auto"
        role="img"
        aria-label="Stat radar chart showing your character build"
      >
        <defs>
          {/* Warm gold gradient for the player polygon */}
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5C842" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D4A017" stopOpacity="0.12" />
          </radialGradient>

          {/* Subtle glow filter for the player polygon */}
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric octagonal guide rings */}
        {Array.from({ length: NUM_RINGS }, (_, i) => {
          const fraction = (i + 1) / NUM_RINGS;
          return (
            <path
              key={`ring-${i}`}
              d={ringPath(fraction)}
              fill="none"
              stroke="#D4C5B5"
              strokeWidth={i === NUM_RINGS - 1 ? 1.2 : 0.6}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* Axis lines — each colored by its stat */}
        {STAT_KEYS.map((key, i) => {
          const angle = getAngleForIndex(i);
          const outer = polarToCartesian(angle, RADIUS);
          const def = definitions[key];
          return (
            <line
              key={`axis-${key}`}
              x1={CENTER}
              y1={CENTER}
              x2={outer.x}
              y2={outer.y}
              stroke={def.color}
              strokeWidth={1}
              strokeOpacity={0.3}
            />
          );
        })}

        {/* Player polygon — filled shape */}
        <path
          d={playerPath}
          fill="url(#radarFill)"
          stroke="#D4A017"
          strokeWidth={2}
          strokeLinejoin="round"
          filter="url(#radarGlow)"
          className="animate-radarReveal"
        />

        {/* Vertex dots on the player polygon */}
        {playerPoints.map((point, i) => {
          const key = STAT_KEYS[i];
          const def = definitions[key];
          return (
            <circle
              key={`dot-${key}`}
              cx={point.x}
              cy={point.y}
              r={3.5}
              fill={def.color}
              stroke="#FDF8F4"
              strokeWidth={1.5}
              className="animate-radarReveal"
            />
          );
        })}

        {/* Scale labels along first axis (top) */}
        {Array.from({ length: NUM_RINGS }, (_, i) => {
          const fraction = (i + 1) / NUM_RINGS;
          const value = Math.round(maxLevel * fraction);
          const { x, y } = polarToCartesian(0, RADIUS * fraction);
          return (
            <text
              key={`scale-${i}`}
              x={x + 6}
              y={y + 1}
              fontSize="8"
              fill="#A0917F"
              fontWeight="500"
              textAnchor="start"
              dominantBaseline="middle"
            >
              {value}
            </text>
          );
        })}

        {/* Stat labels around the perimeter */}
        {STAT_KEYS.map((key, i) => {
          const angle = getAngleForIndex(i);
          const { x, y } = polarToCartesian(angle, LABEL_RADIUS);
          const def = definitions[key];
          const level = stats[key]?.level ?? 1;

          // Text anchor based on position
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (x < CENTER - 20) textAnchor = "end";
          else if (x > CENTER + 20) textAnchor = "start";

          // Slight vertical offset for top/bottom labels
          let dy = 0;
          if (y < CENTER - 60) dy = -4;
          else if (y > CENTER + 60) dy = 8;

          return (
            <g key={`label-${key}`}>
              <text
                x={x}
                y={y + dy}
                fontSize="10"
                fontWeight="700"
                fill={def.color}
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                {def.name}
              </text>
              <text
                x={x}
                y={y + dy + 12}
                fontSize="9"
                fontWeight="500"
                fill="#A0917F"
                textAnchor={textAnchor}
                dominantBaseline="middle"
              >
                Lv {level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
