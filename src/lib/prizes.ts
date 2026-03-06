import { RANK_TITLES } from "./ranks";

// --- System Rewards (Dreamboard-granted, read-only) ---

export interface SystemReward {
  level: number;
  title: string;
  description: string;
}

/** System rewards derived from rank milestones — one per rank threshold */
export const SYSTEM_REWARDS: SystemReward[] = RANK_TITLES.map(([level, title]) => ({
  level,
  title,
  description: level === 1 ? "Your journey begins" : `Rank up to ${title}`,
}));

// --- Fog of War bracket helpers ---

/** Maximum number of user-created prizes */
export const MAX_USER_PRIZES = 15;

/** Returns the rank bracket boundaries that contain the given level */
export function getCurrentBracket(level: number): { start: number; end: number } {
  let currentStart = 1;
  let nextStart = 61; // beyond max level
  for (let i = 0; i < RANK_TITLES.length; i++) {
    if (level >= RANK_TITLES[i][0]) {
      currentStart = RANK_TITLES[i][0];
      nextStart = i + 1 < RANK_TITLES.length ? RANK_TITLES[i + 1][0] : 61;
    }
  }
  return { start: currentStart, end: nextStart - 1 };
}

/**
 * Returns the visible level range for the fog-of-war timeline.
 * - fullyVisible: current rank bracket (all levels clear)
 * - teased: next rank bracket (visible but dimmed/locked)
 * - Past brackets (< fullyVisible.start) are also visible as completed
 */
export function getVisibleRange(level: number): {
  fullyVisible: { start: number; end: number };
  teased: { start: number; end: number } | null;
} {
  const current = getCurrentBracket(level);

  // Find the bracket after the current one
  let teasedStart: number | null = null;
  let teasedEnd: number | null = null;

  for (let i = 0; i < RANK_TITLES.length; i++) {
    if (RANK_TITLES[i][0] > current.end) {
      teasedStart = RANK_TITLES[i][0];
      teasedEnd = i + 1 < RANK_TITLES.length ? RANK_TITLES[i + 1][0] - 1 : 60;
      break;
    }
  }

  return {
    fullyVisible: current,
    teased: teasedStart && teasedEnd ? { start: teasedStart, end: teasedEnd } : null,
  };
}
