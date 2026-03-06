import { GameData, StatKey, HabitKey, DamageKey, Activity, StatProgress, CustomStatOverride, FeedEvent } from "./types";
import { STAT_KEYS, STAT_DEFINITIONS, StatDefinition, COLOR_PRESETS } from "./stats";
import { getRankTitle } from "./ranks";

const STORAGE_KEY = "dreamboard-data";

// Fibonacci-ish XP thresholds: how much XP is needed to go from level N to N+1
// Level 1→2: 3, Level 2→3: 5, Level 3→4: 8, Level 4→5: 13, etc.
const XP_THRESHOLDS = [3, 5, 8, 13, 21, 34, 55, 89, 144, 233];

export function getXPForNextLevel(currentLevel: number): number {
  const index = currentLevel - 1;
  if (index < XP_THRESHOLDS.length) {
    return XP_THRESHOLDS[index];
  }
  // Beyond our table, keep using the fibonacci pattern
  return XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + (index - XP_THRESHOLDS.length + 1) * 100;
}

function createDefaultStats(): Record<StatKey, StatProgress> {
  const stats = {} as Record<StatKey, StatProgress>;
  for (const key of STAT_KEYS) {
    stats[key] = { xp: 0, level: 1 };
  }
  return stats;
}

function createDefaultGameData(): GameData {
  return {
    stats: createDefaultStats(),
    activities: [],
  };
}

export function loadGameData(): GameData {
  if (typeof window === "undefined") {
    return createDefaultGameData();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return createDefaultGameData();
  }

  try {
    const parsed = JSON.parse(stored) as GameData;
    // Ensure all stat keys exist (in case we add new stats later)
    for (const key of STAT_KEYS) {
      if (!parsed.stats[key]) {
        parsed.stats[key] = { xp: 0, level: 1 };
      }
    }

    // Migration: remove future-dated habit entries caused by old UTC bug
    if (parsed.healthyHabits) {
      const todayStr = getTodayString();
      let hadFutureDates = false;
      for (const habitKey of Object.keys(parsed.healthyHabits) as HabitKey[]) {
        const dates = parsed.healthyHabits[habitKey];
        if (!dates) continue;
        const filtered = dates.filter((d) => d <= todayStr);
        if (filtered.length !== dates.length) {
          parsed.healthyHabits[habitKey] = filtered;
          hadFutureDates = true;
        }
      }
      if (hadFutureDates) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }

    return parsed;
  } catch {
    return createDefaultGameData();
  }
}

export function saveGameData(data: GameData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addXP(
  data: GameData,
  statKey: StatKey,
  note: string,
  amount: number = 1
): { newData: GameData; leveledUp: boolean; previousLevel: number } {
  const previousLevel = data.stats[statKey].level;
  const stat = { ...data.stats[statKey] };
  stat.xp += amount;

  let leveledUp = false;
  // Loop to handle multi-level gains from large XP awards
  let xpNeeded = getXPForNextLevel(stat.level);
  while (stat.xp >= xpNeeded) {
    stat.level += 1;
    stat.xp = stat.xp - xpNeeded;
    leveledUp = true;
    xpNeeded = getXPForNextLevel(stat.level);
  }

  const now = new Date().toISOString();

  const activity: Activity = {
    id: crypto.randomUUID(),
    stat: statKey,
    note,
    amount,
    timestamp: now,
  };

  let newData: GameData = {
    ...data,
    stats: { ...data.stats, [statKey]: stat },
    activities: [activity, ...data.activities],
  };

  // Push XP gain feed event
  newData = pushFeedEvent(newData, {
    type: "xp_gain",
    id: crypto.randomUUID(),
    timestamp: now,
    stat: statKey,
    note,
    amount,
  });

  // Push level-up feed event if stat leveled up
  if (leveledUp) {
    newData = pushFeedEvent(newData, {
      type: "level_up",
      id: crypto.randomUUID(),
      timestamp: now,
      stat: statKey,
      newLevel: stat.level,
    });
  }

  // Check if overall level changed (can happen on any XP gain, not just stat level-ups)
  const overallBefore = getOverallLevel(getTotalLifetimeXP(data));
  const overallAfter = getOverallLevel(getTotalLifetimeXP(newData));

  if (overallAfter.level > overallBefore.level) {
    newData = pushFeedEvent(newData, {
      type: "overall_level_up",
      id: crypto.randomUUID(),
      timestamp: now,
      newLevel: overallAfter.level,
      previousLevel: overallBefore.level,
    });

    // Check if rank title also changed
    const rankBefore = getRankTitle(overallBefore.level);
    const rankAfter = getRankTitle(overallAfter.level);
    if (rankAfter !== rankBefore) {
      newData = pushFeedEvent(newData, {
        type: "rank_up",
        id: crypto.randomUUID(),
        timestamp: now,
        newRank: rankAfter,
        newLevel: overallAfter.level,
      });
    }
  }

  saveGameData(newData);
  return { newData, leveledUp, previousLevel };
}

export function getTotalLevel(data: GameData): number {
  return STAT_KEYS.reduce((sum, key) => sum + data.stats[key].level, 0);
}

/** Sum all XP ever earned across all activities (respects variable amounts from judge) */
export function getTotalLifetimeXP(data: GameData): number {
  return data.activities.reduce((sum, activity) => sum + (activity.amount ?? 1), 0);
}

// --- Overall player level (based on total lifetime XP, EQ-inspired curve) ---

const MAX_OVERALL_LEVEL = 60;

// Hell levels require significantly more XP to push past, like EverQuest
const HELL_LEVELS = new Set([30, 35, 40, 45, 50, 55]);

// XP required to advance past a given level
function getXPRequiredForLevel(level: number): number {
  // Gentle quadratic curve: 5 at level 1, visibly grows each level
  // L1→2: 5, L2→3: 8, L3→4: 12, L5→6: 20, L10→11: 42, L20→21: 102
  const base = Math.round(0.1 * level * level + 3 * level + 2);

  // Level 59 is the ultimate hell level before cap
  if (level === 59) return Math.round(base * 2.5);

  // Other hell levels require 1.5x XP
  if (HELL_LEVELS.has(level)) return Math.round(base * 1.5);

  return base;
}

// Given total lifetime XP (= total activities logged), compute overall level + progress
export function getOverallLevel(totalXP: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  let xpRemaining = totalXP;

  for (let level = 1; level < MAX_OVERALL_LEVEL; level++) {
    const xpNeeded = getXPRequiredForLevel(level);
    if (xpRemaining < xpNeeded) {
      return { level, xpIntoLevel: xpRemaining, xpForNextLevel: xpNeeded };
    }
    xpRemaining -= xpNeeded;
  }

  // Max level reached
  return { level: MAX_OVERALL_LEVEL, xpIntoLevel: 0, xpForNextLevel: 0 };
}

// getRankTitle is imported from ./ranks (single source of truth for rank definitions)

// Push a feed event onto the front of the feedEvents array (newest first)
function pushFeedEvent(data: GameData, event: FeedEvent): GameData {
  const existingEvents = data.feedEvents ?? [];
  return { ...data, feedEvents: [event, ...existingEvents] };
}

export function getEffectiveDefinitions(data: GameData): Record<StatKey, StatDefinition> {
  const result = {} as Record<StatKey, StatDefinition>;
  for (const key of STAT_KEYS) {
    const base = STAT_DEFINITIONS[key];
    const override = data.customDefinitions?.[key];
    if (override) {
      // If color was overridden, find matching preset for bg/progress colors
      let backgroundColor = base.backgroundColor;
      let progressColor = base.progressColor;
      if (override.color) {
        const preset = COLOR_PRESETS.find((p) => p.color === override.color);
        if (preset) {
          backgroundColor = preset.backgroundColor;
          progressColor = preset.progressColor;
        }
      }
      result[key] = {
        ...base,
        name: override.name ?? base.name,
        description: override.description ?? base.description,
        earnsXP: override.earnsXP ?? base.earnsXP,
        color: override.color ?? base.color,
        backgroundColor,
        progressColor,
        iconKey: override.iconKey ?? base.iconKey,
      };
    } else {
      result[key] = base;
    }
  }
  return result;
}

export function saveCustomDefinitions(
  data: GameData,
  customDefinitions: Partial<Record<StatKey, CustomStatOverride>>
): GameData {
  const newData: GameData = {
    ...data,
    customDefinitions,
  };
  saveGameData(newData);
  return newData;
}

export function resetCustomDefinitions(data: GameData): GameData {
  const newData: GameData = {
    ...data,
    customDefinitions: undefined,
  };
  saveGameData(newData);
  return newData;
}

// Group activities by day for a given month (year, month are 0-indexed month)
// Returns: { dayNumber: { statKey: xpCount } } e.g. { 5: { strength: 2, wisdom: 1 } }
export function getActivitiesByDay(
  activities: Activity[],
  year: number,
  month: number
): Record<number, Partial<Record<StatKey, number>>> {
  const result: Record<number, Partial<Record<StatKey, number>>> = {};

  for (const activity of activities) {
    const date = new Date(activity.timestamp);
    if (date.getFullYear() !== year || date.getMonth() !== month) continue;

    const day = date.getDate();
    if (!result[day]) result[day] = {};
    result[day][activity.stat] = (result[day][activity.stat] ?? 0) + (activity.amount ?? 1);
  }

  return result;
}

// Calculate current streak per stat (consecutive days ending today/yesterday with activity)
// Returns: { strength: 3, wisdom: 0, ... }
export function getStatStreaks(activities: Activity[]): Record<StatKey, number> {
  // Build a set of "YYYY-MM-DD" strings per stat for fast lookup
  const daysPerStat: Record<string, Set<string>> = {};
  for (const activity of activities) {
    const dateString = activity.timestamp.split("T")[0];
    if (!daysPerStat[activity.stat]) daysPerStat[activity.stat] = new Set();
    daysPerStat[activity.stat].add(dateString);
  }

  const result = {} as Record<StatKey, number>;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const key of STAT_KEYS) {
    const days = daysPerStat[key];
    if (!days || days.size === 0) {
      result[key] = 0;
      continue;
    }

    // Start checking from today, then yesterday, etc.
    let streak = 0;
    const checkDate = new Date(today);

    // If no activity today, check if yesterday had activity (streak is still alive)
    const todayString = checkDate.toISOString().split("T")[0];
    if (!days.has(todayString)) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayString = checkDate.toISOString().split("T")[0];
      if (!days.has(yesterdayString)) {
        result[key] = 0;
        continue;
      }
    }

    // Count consecutive days backwards
    while (days.has(checkDate.toISOString().split("T")[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    result[key] = streak;
  }

  return result;
}

// Calculate total XP earned in the current month and last month
export function getMonthlyXPTotals(activities: Activity[]): {
  currentMonthXP: number;
  lastMonthXP: number;
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Calculate last month's year and month (handles January → December of previous year)
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonth = lastMonthDate.getMonth();

  let currentMonthXP = 0;
  let lastMonthXP = 0;

  for (const activity of activities) {
    const date = new Date(activity.timestamp);
    const activityYear = date.getFullYear();
    const activityMonth = date.getMonth();

    if (activityYear === currentYear && activityMonth === currentMonth) {
      currentMonthXP += activity.amount ?? 1;
    } else if (activityYear === lastMonthYear && activityMonth === lastMonth) {
      lastMonthXP += activity.amount ?? 1;
    }
  }

  return { currentMonthXP, lastMonthXP };
}

// --- Healthy Habits ---

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isHabitCompletedToday(data: GameData, habitKey: HabitKey): boolean {
  const dates = data.healthyHabits?.[habitKey];
  if (!dates) return false;
  return dates.includes(getTodayString());
}

export function toggleHabitForToday(data: GameData, habitKey: HabitKey): GameData {
  const today = getTodayString();
  const currentDates = data.healthyHabits?.[habitKey] ?? [];
  const alreadyCompleted = currentDates.includes(today);

  const updatedDates = alreadyCompleted
    ? currentDates.filter((date) => date !== today)
    : [...currentDates, today];

  let newData: GameData = {
    ...data,
    healthyHabits: {
      ...data.healthyHabits,
      [habitKey]: updatedDates,
    },
  };

  // Push feed event for habit toggle
  newData = pushFeedEvent(newData, {
    type: alreadyCompleted ? "habit_removed" : "habit_completed",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    habitKey,
  });

  saveGameData(newData);
  return newData;
}

// Generic helper: group date-string entries by calendar day for a given month
// Used by both getHabitsByDay and getDamageByDay to avoid duplicate iteration logic
function groupDateEntriesByDay<K extends string>(
  dateMap: Partial<Record<K, string[]>> | undefined,
  keys: K[],
  year: number,
  month: number
): Record<number, K[]> {
  const result: Record<number, K[]> = {};
  if (!dateMap) return result;

  for (const key of keys) {
    const dates = dateMap[key];
    if (!dates) continue;

    for (const dateString of dates) {
      const date = new Date(dateString + "T00:00:00");
      if (date.getFullYear() !== year || date.getMonth() !== month) continue;

      const day = date.getDate();
      if (!result[day]) result[day] = [];
      result[day].push(key);
    }
  }

  return result;
}

// Group healthy habits by day for a given month
// Returns: { dayNumber: ["water", "nails"] } for days where habits were completed
export function getHabitsByDay(
  data: GameData,
  year: number,
  month: number
): Record<number, HabitKey[]> {
  const habitKeys: HabitKey[] = ["water", "nails", "brush", "nosugar", "floss", "steps"];
  return groupDateEntriesByDay(data.healthyHabits, habitKeys, year, month);
}

// --- Enabled Habits (which habits appear on the dashboard) ---

const DEFAULT_ENABLED_HABITS: HabitKey[] = ["water", "nails", "brush", "nosugar"];

export function getEnabledHabits(data: GameData): HabitKey[] {
  return data.enabledHabits ?? DEFAULT_ENABLED_HABITS;
}

export function saveEnabledHabits(data: GameData, enabledHabits: HabitKey[]): GameData {
  const newData: GameData = {
    ...data,
    enabledHabits,
  };
  saveGameData(newData);
  return newData;
}

// Get the most recent activity timestamp per stat
// Returns null for stats that have never been logged
export function getLastActivityTimestamps(
  activities: Activity[]
): Record<StatKey, string | null> {
  const result = {} as Record<StatKey, string | null>;
  for (const key of STAT_KEYS) {
    result[key] = null;
  }
  // Activities are stored newest-first, so the first match per stat is the most recent
  for (const activity of activities) {
    if (result[activity.stat] === null) {
      result[activity.stat] = activity.timestamp;
    }
  }
  return result;
}

// Format a timestamp as relative time for display
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  // Under 1 minute
  if (diffMinutes < 1) return "Just now";

  // 1-59 minutes
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  // 1-23 hours — but check if it was yesterday first
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  if (then >= todayStart) {
    // Same calendar day
    return `${diffHours}h ago`;
  }

  if (then >= yesterdayStart) {
    return "Yesterday";
  }

  const diffDays = Math.floor((todayStart.getTime() - new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 6) return `${diffDays} days ago`;
  if (diffDays <= 13) return "1 week ago";
  if (diffDays <= 27) return `${Math.floor(diffDays / 7)} weeks ago`;

  const diffMonths = (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
  if (diffMonths <= 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

/** Returns the mascot image path for a given overall level.
 *  Uses threshold logic (like rank titles): picks the highest level key ≤ current level.
 *  Falls back to the default Skipper if no overrides match. */
export function getMascotForLevel(level: number, overrides?: Record<number, string>): string {
  const defaultImage = "/mascots/skipper-default.svg";
  if (!overrides || Object.keys(overrides).length === 0) return defaultImage;

  const thresholds = Object.keys(overrides)
    .map(Number)
    .sort((a, b) => b - a); // highest first

  for (const threshold of thresholds) {
    if (level >= threshold) return `/mascots/${overrides[threshold]}`;
  }

  return defaultImage;
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportGameData(data: GameData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dreamboard-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// --- Daily Damage ---

export const DAMAGE_KEYS: DamageKey[] = ["substance", "screentime", "junkfood", "badsleep"];

const DEFAULT_ENABLED_DAMAGE: DamageKey[] = ["substance", "screentime", "junkfood", "badsleep"];

export function isDamageMarkedToday(data: GameData, damageKey: DamageKey): boolean {
  const dates = data.dailyDamage?.[damageKey];
  if (!dates) return false;
  return dates.includes(getTodayString());
}

export function toggleDamageForToday(data: GameData, damageKey: DamageKey): GameData {
  const today = getTodayString();
  const currentDates = data.dailyDamage?.[damageKey] ?? [];
  const alreadyMarked = currentDates.includes(today);

  const updatedDates = alreadyMarked
    ? currentDates.filter((date) => date !== today)
    : [...currentDates, today];

  let newData: GameData = {
    ...data,
    dailyDamage: {
      ...data.dailyDamage,
      [damageKey]: updatedDates,
    },
  };

  // Push feed event for damage toggle
  newData = pushFeedEvent(newData, {
    type: alreadyMarked ? "damage_removed" : "damage_marked",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    damageKey,
  });

  saveGameData(newData);
  return newData;
}

export function getDamageByDay(
  data: GameData,
  year: number,
  month: number
): Record<number, DamageKey[]> {
  return groupDateEntriesByDay(data.dailyDamage, DAMAGE_KEYS, year, month);
}

export function getEnabledDamage(data: GameData): DamageKey[] {
  return data.enabledDamage ?? DEFAULT_ENABLED_DAMAGE;
}

export function saveEnabledDamage(data: GameData, enabledDamage: DamageKey[]): GameData {
  const newData: GameData = {
    ...data,
    enabledDamage,
  };
  saveGameData(newData);
  return newData;
}

// --- Points Wallet (AA System) ---

// Counts total habit completions across all time
function countTotalHabitCompletions(data: GameData): number {
  const habits = data.healthyHabits;
  if (!habits) return 0;
  let total = 0;
  for (const habitKey of Object.keys(habits) as HabitKey[]) {
    total += habits[habitKey]?.length ?? 0;
  }
  return total;
}

// Counts total damage marks across all time
function countTotalDamageMarks(data: GameData): number {
  const damage = data.dailyDamage;
  if (!damage) return 0;
  let total = 0;
  for (const damageKey of Object.keys(damage) as DamageKey[]) {
    total += damage[damageKey]?.length ?? 0;
  }
  return total;
}

// Calculates lifetime earned points from source data (habits - damage)
export function calculateLifetimePoints(data: GameData): number {
  const earned = countTotalHabitCompletions(data);
  const lost = countTotalDamageMarks(data);
  return Math.max(0, earned - lost);
}

// Returns the full points breakdown: earned, damage, spent, and current balance
export function getPointsBalance(data: GameData): {
  lifetimeEarned: number;
  lifetimeDamage: number;
  lifetimeSpent: number;
  balance: number;
} {
  const lifetimeEarned = countTotalHabitCompletions(data);
  const lifetimeDamage = countTotalDamageMarks(data);
  const lifetimeSpent = data.pointsWallet?.lifetimeSpent ?? 0;
  return {
    lifetimeEarned,
    lifetimeDamage,
    lifetimeSpent,
    balance: Math.max(0, lifetimeEarned - lifetimeDamage - lifetimeSpent),
  };
}

// Spend points from the wallet (for future shop purchases)
export function spendPoints(data: GameData, amount: number): GameData | null {
  const { balance } = getPointsBalance(data);
  if (amount > balance) return null;

  const currentSpent = data.pointsWallet?.lifetimeSpent ?? 0;
  const newData: GameData = {
    ...data,
    pointsWallet: {
      lifetimeEarned: calculateLifetimePoints(data),
      lifetimeSpent: currentSpent + amount,
    },
  };

  saveGameData(newData);
  return newData;
}

// --- Profile Picture ---

/** Save a base64 profile picture to game data. Pass null to remove it. */
export function saveProfilePicture(data: GameData, base64DataUrl: string | null): GameData {
  const newData: GameData = { ...data };
  if (base64DataUrl) {
    newData.profilePicture = base64DataUrl;
  } else {
    delete newData.profilePicture;
  }
  saveGameData(newData);
  return newData;
}

/** Get the profile picture data URL, or null if none is set. */
export function getProfilePicture(data: GameData): string | null {
  return data.profilePicture ?? null;
}
