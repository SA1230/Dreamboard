// Rank titles that change every ~5 levels — single source of truth
// Used by page.tsx (LevelDisplay), storage.ts (feed event generation), and components
export const RANK_TITLES: [number, string][] = [
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

// Each rank has a unique [startColor, endColor] gradient for the LevelDisplay ring
export const RANK_COLORS: Record<number, [string, string]> = {
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

export function getRankTitle(level: number): string {
  let title = "Novice";
  for (const [threshold, name] of RANK_TITLES) {
    if (level >= threshold) title = name;
  }
  return title;
}

// Returns the next rank name the player will reach, or null if already at max rank
export function getNextRankTitle(level: number): string | null {
  for (const [threshold, name] of RANK_TITLES) {
    if (threshold > level) return name;
  }
  return null;
}

// Returns 0–1 representing fine-grained progress through the current rank bracket.
// levelFraction (0–1) is XP progress within the current level, so the color shifts smoothly per XP.
export function getRankProgress(level: number, levelFraction: number = 0): number {
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

// Get the color pair for the player's current rank
export function getRankColorPair(level: number): [string, string] {
  let colors: [string, string] = RANK_COLORS[1];
  for (const [threshold] of RANK_TITLES) {
    if (level >= threshold && RANK_COLORS[threshold]) {
      colors = RANK_COLORS[threshold];
    }
  }
  return colors;
}

// Linearly interpolate between two hex colors (e.g. "#ff0000", "#00ff00", 0.5 → "#808000")
export function interpolateHexColor(hexA: string, hexB: string, t: number): string {
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
