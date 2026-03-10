import {
  AchievementDefinition,
  AchievementCategory,
  GameData,
  FeedEvent,
  StatKey,
} from "./types";
import { STAT_KEYS } from "./stats";
import {
  getOverallLevel,
  getStatStreaks,
  getInventory,
  getEnabledDamage,
  countTotalHabitCompletions,
  saveGameData,
} from "./storage";
import { VISIBLE_SLOTS } from "./items";

// ─── Achievement Category Metadata ────────────────────────────────────────────

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; name: string; description: string }[] = [
  { id: "journey", name: "The Journey", description: "Activity volume and XP milestones" },
  { id: "rites", name: "Rites of Passage", description: "Level and rank progression" },
  { id: "vigil", name: "The Vigil", description: "Habit streaks and consistency" },
  { id: "lore", name: "Lorekeeper", description: "Multi-stat diversity" },
  { id: "hoard", name: "The Hoard", description: "PP economy, items, and the shop" },
  { id: "dreamer", name: "Dreamweaver", description: "Vision board and challenges" },
];

// ─── Achievement Definitions (32 total) ───────────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // === The Journey (activity milestones) ===
  { id: "first-steps", name: "First Steps", description: "Log your first activity.", category: "journey", tier: "common", secret: false, iconKey: "footprints" },
  { id: "ten-fold", name: "Tenfold", description: "Log 10 activities.", category: "journey", tier: "common", secret: false, iconKey: "layers" },
  { id: "century", name: "Century", description: "Log 100 activities.", category: "journey", tier: "uncommon", secret: false, iconKey: "milestone" },
  { id: "five-hundred", name: "The Five Hundred", description: "Log 500 activities.", category: "journey", tier: "rare", secret: false, iconKey: "mountain" },
  { id: "the-thousandth", name: "The Thousandth", description: "Log 1,000 activities.", category: "journey", tier: "epic", secret: false, iconKey: "crown" },
  { id: "big-haul", name: "Big Haul", description: "Earn 8+ XP from a single verdict.", category: "journey", tier: "uncommon", secret: false, iconKey: "gem" },
  { id: "perfect-score", name: "Perfect Score", description: "Earn 10 XP from a single activity.", category: "journey", tier: "rare", secret: true, iconKey: "star" },

  // === Rites of Passage (level/rank progression) ===
  { id: "awakened", name: "Awakened", description: "Reach overall level 5.", category: "rites", tier: "common", secret: false, iconKey: "sunrise" },
  { id: "tempered", name: "Tempered", description: "Reach overall level 15.", category: "rites", tier: "uncommon", secret: false, iconKey: "flame" },
  { id: "ascendant", name: "Ascendant", description: "Reach overall level 30.", category: "rites", tier: "rare", secret: false, iconKey: "rocket" },
  { id: "transcendent-path", name: "The Transcendent Path", description: "Reach overall level 50.", category: "rites", tier: "epic", secret: false, iconKey: "infinity" },
  { id: "max-level", name: "Apotheosis", description: "Reach overall level 60.", category: "rites", tier: "legendary", secret: true, iconKey: "sparkles" },
  { id: "first-promotion", name: "First Promotion", description: "Earn your first rank-up.", category: "rites", tier: "common", secret: false, iconKey: "award" },
  { id: "stat-specialist", name: "Stat Specialist", description: "Reach level 5 in any stat.", category: "rites", tier: "common", secret: false, iconKey: "target" },
  { id: "double-digit", name: "Double Digits", description: "Reach level 10 in any stat.", category: "rites", tier: "uncommon", secret: false, iconKey: "trophy" },

  // === The Vigil (habits + streaks) ===
  { id: "first-light", name: "First Light", description: "Complete your first habit.", category: "vigil", tier: "common", secret: false, iconKey: "sun" },
  { id: "steady-hand", name: "Steady Hand", description: "Complete 7 total habits.", category: "vigil", tier: "common", secret: false, iconKey: "heart-handshake" },
  { id: "iron-will", name: "Iron Will", description: "Complete 30 total habits.", category: "vigil", tier: "uncommon", secret: false, iconKey: "shield" },
  { id: "eternal-flame", name: "Eternal Flame", description: "Complete 100 total habits.", category: "vigil", tier: "rare", secret: false, iconKey: "flame" },
  { id: "devotee", name: "Devotee", description: "Complete 300 total habits.", category: "vigil", tier: "epic", secret: false, iconKey: "heart" },
  { id: "streak-kindled", name: "Streak Kindled", description: "Reach a 3-day streak in any stat.", category: "vigil", tier: "common", secret: false, iconKey: "zap" },
  { id: "streak-ablaze", name: "Streak Ablaze", description: "Reach a 7-day streak in any stat.", category: "vigil", tier: "uncommon", secret: false, iconKey: "flame" },
  { id: "inferno", name: "Inferno", description: "Reach a 14-day streak in any stat.", category: "vigil", tier: "rare", secret: false, iconKey: "fire-extinguisher" },
  { id: "undying", name: "Undying", description: "Reach a 30-day streak in any stat.", category: "vigil", tier: "epic", secret: true, iconKey: "shield-check" },
  { id: "clean-slate", name: "Clean Slate", description: "Complete a habit with zero damage in a day.", category: "vigil", tier: "uncommon", secret: false, iconKey: "sparkle" },

  // === Lorekeeper (multi-stat diversity) ===
  { id: "well-rounded", name: "Well-Rounded", description: "Earn XP in 4 or more stats.", category: "lore", tier: "common", secret: false, iconKey: "compass" },
  { id: "renaissance", name: "Renaissance", description: "Log an activity in all 8 stats.", category: "lore", tier: "uncommon", secret: false, iconKey: "palette" },
  { id: "balanced-soul", name: "Balanced Soul", description: "Reach level 3 in all 8 stats.", category: "lore", tier: "rare", secret: false, iconKey: "scale" },
  { id: "omni-master", name: "Omni-Master", description: "Reach level 5 in all 8 stats.", category: "lore", tier: "epic", secret: true, iconKey: "brain" },

  // === The Hoard (economy) ===
  { id: "first-purchase", name: "First Purchase", description: "Buy your first item from the shop.", category: "hoard", tier: "common", secret: false, iconKey: "shopping-bag" },
  { id: "collector", name: "Collector", description: "Own 5 or more items.", category: "hoard", tier: "uncommon", secret: false, iconKey: "package" },
  { id: "big-spender", name: "Big Spender", description: "Spend 50 or more Power Points.", category: "hoard", tier: "rare", secret: false, iconKey: "coins" },
  { id: "fully-equipped", name: "Fully Equipped", description: "Fill all 8 visible equipment slots.", category: "hoard", tier: "rare", secret: false, iconKey: "swords" },

  // === Dreamweaver (vision + challenges) ===
  { id: "first-dream", name: "First Dream", description: "Add your first vision card.", category: "dreamer", tier: "common", secret: false, iconKey: "cloud" },
  { id: "dream-gallery", name: "Dream Gallery", description: "Collect 10 vision cards.", category: "dreamer", tier: "uncommon", secret: false, iconKey: "image" },
  { id: "oracle-consulted", name: "Oracle Consulted", description: "Receive a Board Reading from the Oracle.", category: "dreamer", tier: "uncommon", secret: false, iconKey: "eye" },
  { id: "quest-accepted", name: "Quest Accepted", description: "Complete your first challenge.", category: "dreamer", tier: "common", secret: false, iconKey: "scroll" },
  { id: "chain-breaker", name: "Chain Breaker", description: "Complete a full challenge chain.", category: "dreamer", tier: "rare", secret: true, iconKey: "link" },
];

// ─── Helper Accessors ─────────────────────────────────────────────────────────

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((a) => a.category === category);
}

export function getUnlockedAchievements(data: GameData): AchievementDefinition[] {
  const unlocked = new Set(data.unlockedAchievements ?? []);
  return ACHIEVEMENT_DEFINITIONS.filter((a) => unlocked.has(a.id));
}

export function isAchievementUnlocked(data: GameData, achievementId: string): boolean {
  return (data.unlockedAchievements ?? []).includes(achievementId);
}

// ─── Progress Helpers (for progressive chains) ────────────────────────────────

/** Returns current value and target for progressive achievements (used for progress bars) */
export function getAchievementProgress(
  data: GameData,
  achievementId: string,
): { current: number; target: number } | null {
  const derived = computeDerivedData(data);

  switch (achievementId) {
    // Activity count chain
    case "first-steps": return { current: derived.activityCount, target: 1 };
    case "ten-fold": return { current: derived.activityCount, target: 10 };
    case "century": return { current: derived.activityCount, target: 100 };
    case "five-hundred": return { current: derived.activityCount, target: 500 };
    case "the-thousandth": return { current: derived.activityCount, target: 1000 };

    // Habit completion chain
    case "first-light": return { current: derived.totalHabitCompletions, target: 1 };
    case "steady-hand": return { current: derived.totalHabitCompletions, target: 7 };
    case "iron-will": return { current: derived.totalHabitCompletions, target: 30 };
    case "eternal-flame": return { current: derived.totalHabitCompletions, target: 100 };
    case "devotee": return { current: derived.totalHabitCompletions, target: 300 };

    // Level chain
    case "awakened": return { current: derived.overallLevel, target: 5 };
    case "tempered": return { current: derived.overallLevel, target: 15 };
    case "ascendant": return { current: derived.overallLevel, target: 30 };
    case "transcendent-path": return { current: derived.overallLevel, target: 50 };
    case "max-level": return { current: derived.overallLevel, target: 60 };

    // Streak chain
    case "streak-kindled": return { current: derived.maxStreak, target: 3 };
    case "streak-ablaze": return { current: derived.maxStreak, target: 7 };
    case "inferno": return { current: derived.maxStreak, target: 14 };
    case "undying": return { current: derived.maxStreak, target: 30 };

    // Collection counts
    case "collector": return { current: derived.ownedItemCount, target: 5 };
    case "dream-gallery": return { current: derived.visionCardCount, target: 10 };

    // Multi-stat
    case "well-rounded": return { current: derived.statsWithXP, target: 4 };
    case "renaissance": return { current: derived.statsWithActivity, target: 8 };

    default: return null;
  }
}

// ─── Derived Data (computed once per check cycle) ─────────────────────────────

interface DerivedAchievementData {
  activityCount: number;
  overallLevel: number;
  totalXP: number;
  statLevels: Record<StatKey, number>;
  statsWithXP: number;
  statsWithActivity: number;
  maxStreak: number;
  streaks: Record<string, number>;
  totalHabitCompletions: number;
  ownedItemCount: number;
  equippedSlotCount: number;
  lifetimeSpent: number;
  visionCardCount: number;
  hasBoardReading: boolean;
  maxSingleActivityXP: number;
  maxSingleVerdictXP: number;
  hasRankUp: boolean;
  hasCompletedChallenge: boolean;
  hasCompletedChain: boolean;
  hasCleanSlateDay: boolean;
}

function computeDerivedData(data: GameData): DerivedAchievementData {
  const stats = data.stats;
  const activities = data.activities ?? [];
  const feedEvents = data.feedEvents ?? [];

  // Activity count
  const activityCount = activities.length;

  // Total XP across all stats
  let totalXP = 0;
  const statLevels: Record<string, number> = {};
  let statsWithXP = 0;

  for (const key of STAT_KEYS) {
    const stat = stats[key];
    totalXP += stat.xp;
    statLevels[key] = stat.level;
    if (stat.xp > 0) statsWithXP++;
  }

  const overallLevel = getOverallLevel(totalXP).level;

  // Stats with at least one activity logged
  const statsWithActivitySet = new Set<string>();
  for (const activity of activities) {
    statsWithActivitySet.add(activity.stat);
  }
  const statsWithActivity = statsWithActivitySet.size;

  // Streaks
  const streakMap = getStatStreaks(activities);
  let maxStreak = 0;
  for (const streak of Object.values(streakMap)) {
    if (streak > maxStreak) maxStreak = streak;
  }

  // Habit completions
  const totalHabitCompletions = countTotalHabitCompletions(data);

  // Inventory
  const inventory = getInventory(data);
  const ownedItemCount = inventory.ownedItemIds.length;
  const equippedSlotCount = VISIBLE_SLOTS.filter(
    ({ slot }) => inventory.equippedItems[slot] != null
  ).length;

  // Economy
  const lifetimeSpent = data.pointsWallet?.lifetimeSpent ?? 0;

  // Vision
  const visionCardCount = (data.visionCards ?? []).length;
  const hasBoardReading = data.lastBoardReading != null;

  // Max single-activity XP (for perfect-score)
  let maxSingleActivityXP = 0;
  for (const activity of activities) {
    const amount = activity.amount ?? 1;
    if (amount > maxSingleActivityXP) maxSingleActivityXP = amount;
  }

  // Max single-verdict XP (sum of all activities with the same verdictMessage — for big-haul)
  let maxSingleVerdictXP = 0;
  const verdictXPMap = new Map<string, number>();
  for (const activity of activities) {
    if (activity.verdictMessage) {
      const current = verdictXPMap.get(activity.verdictMessage) ?? 0;
      const newTotal = current + (activity.amount ?? 1);
      verdictXPMap.set(activity.verdictMessage, newTotal);
      if (newTotal > maxSingleVerdictXP) maxSingleVerdictXP = newTotal;
    }
  }

  // Feed event checks
  let hasRankUp = false;
  let hasCompletedChallenge = false;
  let hasCompletedChain = false;

  // Track completed chain IDs and their completed step counts
  const chainCompletions = new Map<string, { completed: number; total: number }>();

  for (const event of feedEvents) {
    if (event.type === "rank_up") hasRankUp = true;
    if (event.type === "challenge_completed") {
      hasCompletedChallenge = true;
      if (event.chainId && event.chainTotal) {
        const entry = chainCompletions.get(event.chainId) ?? { completed: 0, total: event.chainTotal };
        entry.completed++;
        chainCompletions.set(event.chainId, entry);
      }
    }
  }

  // A chain is complete when completed count equals total
  for (const entry of chainCompletions.values()) {
    if (entry.completed >= entry.total) {
      hasCompletedChain = true;
      break;
    }
  }

  // Clean Slate: any day with 1+ habit completed AND 0 enabled damage
  let hasCleanSlateDay = false;
  const habitDates = new Set<string>();
  const habits = data.healthyHabits ?? {};
  for (const dates of Object.values(habits)) {
    if (Array.isArray(dates)) {
      for (const d of dates) habitDates.add(d);
    }
  }

  if (habitDates.size > 0) {
    const enabledDamageKeys = new Set(getEnabledDamage(data));
    const damageDates = new Set<string>();
    const damage = data.dailyDamage ?? {};
    for (const [key, dates] of Object.entries(damage)) {
      if (enabledDamageKeys.has(key) && Array.isArray(dates)) {
        for (const d of dates) damageDates.add(d);
      }
    }

    for (const date of habitDates) {
      if (!damageDates.has(date)) {
        hasCleanSlateDay = true;
        break;
      }
    }
  }

  return {
    activityCount,
    overallLevel,
    totalXP,
    statLevels: statLevels as Record<StatKey, number>,
    statsWithXP,
    statsWithActivity,
    maxStreak,
    streaks: streakMap,
    totalHabitCompletions,
    ownedItemCount,
    equippedSlotCount,
    lifetimeSpent,
    visionCardCount,
    hasBoardReading,
    maxSingleActivityXP,
    maxSingleVerdictXP,
    hasRankUp,
    hasCompletedChallenge,
    hasCompletedChain,
    hasCleanSlateDay,
  };
}

// ─── Achievement Condition Evaluators ─────────────────────────────────────────

function evaluateCondition(id: string, derived: DerivedAchievementData): boolean {
  switch (id) {
    // The Journey
    case "first-steps": return derived.activityCount >= 1;
    case "ten-fold": return derived.activityCount >= 10;
    case "century": return derived.activityCount >= 100;
    case "five-hundred": return derived.activityCount >= 500;
    case "the-thousandth": return derived.activityCount >= 1000;
    case "big-haul": return derived.maxSingleVerdictXP >= 8;
    case "perfect-score": return derived.maxSingleActivityXP >= 10;

    // Rites of Passage
    case "awakened": return derived.overallLevel >= 5;
    case "tempered": return derived.overallLevel >= 15;
    case "ascendant": return derived.overallLevel >= 30;
    case "transcendent-path": return derived.overallLevel >= 50;
    case "max-level": return derived.overallLevel >= 60;
    case "first-promotion": return derived.hasRankUp;
    case "stat-specialist": return Object.values(derived.statLevels).some((level) => level >= 5);
    case "double-digit": return Object.values(derived.statLevels).some((level) => level >= 10);

    // The Vigil
    case "first-light": return derived.totalHabitCompletions >= 1;
    case "steady-hand": return derived.totalHabitCompletions >= 7;
    case "iron-will": return derived.totalHabitCompletions >= 30;
    case "eternal-flame": return derived.totalHabitCompletions >= 100;
    case "devotee": return derived.totalHabitCompletions >= 300;
    case "streak-kindled": return derived.maxStreak >= 3;
    case "streak-ablaze": return derived.maxStreak >= 7;
    case "inferno": return derived.maxStreak >= 14;
    case "undying": return derived.maxStreak >= 30;
    case "clean-slate": return derived.hasCleanSlateDay;

    // Lorekeeper
    case "well-rounded": return derived.statsWithXP >= 4;
    case "renaissance": return derived.statsWithActivity >= 8;
    case "balanced-soul": return Object.values(derived.statLevels).every((level) => level >= 3);
    case "omni-master": return Object.values(derived.statLevels).every((level) => level >= 5);

    // The Hoard
    case "first-purchase": return derived.ownedItemCount >= 1 && derived.lifetimeSpent > 0;
    case "collector": return derived.ownedItemCount >= 5;
    case "big-spender": return derived.lifetimeSpent >= 50;
    case "fully-equipped": return derived.equippedSlotCount >= 8;

    // Dreamweaver
    case "first-dream": return derived.visionCardCount >= 1;
    case "dream-gallery": return derived.visionCardCount >= 10;
    case "oracle-consulted": return derived.hasBoardReading;
    case "quest-accepted": return derived.hasCompletedChallenge;
    case "chain-breaker": return derived.hasCompletedChain;

    default: return false;
  }
}

// ─── Detection Engine ─────────────────────────────────────────────────────────

/**
 * Check for newly-unlocked achievements and generate feed events.
 * Follows the same idempotent pattern as checkPrizeUnlocks and checkItemRewardUnlocks.
 *
 * Returns updated GameData if any new achievements were unlocked, or the same data if none.
 */
export function checkAchievementUnlocks(data: GameData): GameData {
  // Build Set of already-unlocked achievement IDs (from both sources for dedup)
  const alreadyUnlocked = new Set(data.unlockedAchievements ?? []);

  // Also check feedEvents for dedup (in case unlockedAchievements was lost/reset)
  const existingFeedEvents = data.feedEvents ?? [];
  for (const event of existingFeedEvents) {
    if (event.type === "achievement_unlocked") {
      alreadyUnlocked.add(event.achievementId);
    }
  }

  // Pre-compute all derived data once
  const derived = computeDerivedData(data);

  // Evaluate each achievement
  const newUnlocks: AchievementDefinition[] = [];
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (alreadyUnlocked.has(achievement.id)) continue;
    if (evaluateCondition(achievement.id, derived)) {
      newUnlocks.push(achievement);
    }
  }

  if (newUnlocks.length === 0) return data;

  // Generate feed events + update unlockedAchievements
  const now = new Date().toISOString();
  const newFeedEvents: FeedEvent[] = newUnlocks.map((achievement) => ({
    type: "achievement_unlocked" as const,
    id: crypto.randomUUID(),
    timestamp: now,
    achievementId: achievement.id,
    achievementName: achievement.name,
    tier: achievement.tier,
  }));

  const updatedUnlocked = [
    ...(data.unlockedAchievements ?? []),
    ...newUnlocks.map((a) => a.id),
  ];

  const updatedData: GameData = {
    ...data,
    unlockedAchievements: updatedUnlocked,
    feedEvents: [...newFeedEvents, ...existingFeedEvents],
  };

  saveGameData(updatedData);
  return updatedData;
}
