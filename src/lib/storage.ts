import { GameData, StatKey, DamageKey, Activity, StatProgress, CustomStatOverride, FeedEvent, PlayerInventory, EquipmentSlot, Prize, Challenge, ChainStep, VisionCard, BoardReading, SecondaryStats, ItemResistances, CustomHabitDefinition, CustomDamageDefinition, MAX_CUSTOM_HABITS, MAX_CUSTOM_DAMAGE } from "./types";
import { getItemById, getLevelRewardItems } from "./items";
import { STAT_KEYS, STAT_DEFINITIONS, StatDefinition, COLOR_PRESETS } from "./stats";
import { getRankTitle } from "./ranks";
import { MAX_USER_PRIZES } from "./prizes";
import { MAX_VISION_CARDS, VISION_COLORS } from "./visionColors";

const STORAGE_KEY = "dreamboard-data";

// --- Schema Versioning & Data Migrations ---
// Self-healing data layer: new fields never corrupt old data.
// Add migrations here when GameData shape changes.

const SCHEMA_VERSION = 1;

interface SchemaMigration {
  version: number;
  name: string;
  migrate: (data: GameData) => GameData;
}

const SCHEMA_MIGRATIONS: SchemaMigration[] = [
  {
    version: 1,
    name: "clean_future_dated_habits",
    migrate: (data: GameData): GameData => {
      if (!data.healthyHabits) return data;
      const todayStr = getTodayString();
      let changed = false;
      const cleanedHabits = { ...data.healthyHabits };
      for (const habitKey of Object.keys(cleanedHabits)) {
        const dates = cleanedHabits[habitKey];
        if (!dates) continue;
        const filtered = dates.filter((d) => d <= todayStr);
        if (filtered.length !== dates.length) {
          cleanedHabits[habitKey] = filtered;
          changed = true;
        }
      }
      return changed ? { ...data, healthyHabits: cleanedHabits } : data;
    },
  },
];

/** Run all pending schema migrations and return the upgraded data. */
function migrateGameData(data: GameData): { data: GameData; migrated: boolean } {
  const currentVersion = data.schemaVersion ?? 0;
  if (currentVersion >= SCHEMA_VERSION) return { data, migrated: false };

  let result = data;
  for (const migration of SCHEMA_MIGRATIONS) {
    if (migration.version > currentVersion) {
      result = migration.migrate(result);
    }
  }
  result = { ...result, schemaVersion: SCHEMA_VERSION };
  return { data: result, migrated: true };
}

/** The current schema version — exported for tests */
export { SCHEMA_VERSION };

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

    // Run schema migrations (self-healing: auto-upgrades data on load)
    const { data: migrated, migrated: didMigrate } = migrateGameData(parsed);
    if (didMigrate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }

    return migrated;
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
  amount: number = 1,
  verdictMessage?: string
): { newData: GameData; leveledUp: boolean; previousLevel: number } {
  // Apply equipment bonuses: flat + percent from equipped items
  const equipBonuses = getEquippedBonuses(data);
  const boostedAmount = applyEquipmentBonus(amount, statKey, equipBonuses);

  const previousLevel = data.stats[statKey].level;
  const stat = { ...data.stats[statKey] };
  stat.xp += boostedAmount;

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
    amount: boostedAmount,
    timestamp: now,
    ...(verdictMessage ? { verdictMessage } : {}),
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
    amount: boostedAmount,
    ...(verdictMessage ? { verdictMessage } : {}),
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

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getYesterdayString(): string {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- Generic date-entry toggle (shared by habits and damage) ---

/** Check if a key has a date entry in a date-string map */
function isDateEntryPresent<K extends string>(
  dateMap: Partial<Record<K, string[]>> | undefined,
  key: K,
  dateString: string
): boolean {
  const dates = dateMap?.[key];
  return dates ? dates.includes(dateString) : false;
}

/** Toggle a date entry on/off, returning the updated date-string map field */
function toggleDateEntry<K extends string>(
  dateMap: Partial<Record<K, string[]>> | undefined,
  key: K,
  dateString: string
): { updatedMap: Partial<Record<K, string[]>>; wasPresent: boolean } {
  const currentDates = dateMap?.[key] ?? [];
  const wasPresent = currentDates.includes(dateString);
  const updatedDates = wasPresent
    ? currentDates.filter((date) => date !== dateString)
    : [...currentDates, dateString];
  return {
    updatedMap: { ...dateMap, [key]: updatedDates },
    wasPresent,
  };
}

// --- Date-parameterized habit functions ---

export function isHabitCompletedForDate(data: GameData, habitKey: string, dateString: string): boolean {
  return isDateEntryPresent(data.healthyHabits, habitKey, dateString);
}

export function toggleHabitForDate(data: GameData, habitKey: string, dateString: string): GameData {
  const { updatedMap, wasPresent } = toggleDateEntry(data.healthyHabits, habitKey, dateString);

  let newData: GameData = { ...data, healthyHabits: updatedMap };

  newData = pushFeedEvent(newData, {
    type: wasPresent ? "habit_removed" : "habit_completed",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    habitKey,
  });

  saveGameData(newData);
  return newData;
}

// Convenience wrappers for today
export function isHabitCompletedToday(data: GameData, habitKey: string): boolean {
  return isHabitCompletedForDate(data, habitKey, getTodayString());
}

export function toggleHabitForToday(data: GameData, habitKey: string): GameData {
  return toggleHabitForDate(data, habitKey, getTodayString());
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

// Group healthy habits by day for a given month (includes custom habits)
// Returns: { dayNumber: ["water", "nails", "custom_habit_meditation_..."] }
export function getHabitsByDay(
  data: GameData,
  year: number,
  month: number
): Record<number, string[]> {
  const allKeys = Object.keys(data.healthyHabits ?? {});
  return groupDateEntriesByDay(data.healthyHabits, allKeys, year, month);
}

// --- Enabled Habits (which habits appear on the dashboard) ---

const DEFAULT_ENABLED_HABITS: string[] = ["water", "nails", "brush", "nosugar"];

export function getEnabledHabits(data: GameData): string[] {
  return data.enabledHabits ?? DEFAULT_ENABLED_HABITS;
}

export function saveEnabledHabits(data: GameData, enabledHabits: string[]): GameData {
  const newData: GameData = {
    ...data,
    enabledHabits,
  };
  saveGameData(newData);
  return newData;
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

// --- Mascot Name ---

const MASCOT_NAME_UNLOCK_LEVEL = 5;

export function getMascotName(data: GameData): string {
  return data.mascotName ?? "Skipper";
}

export function setMascotName(data: GameData, name: string): GameData {
  const trimmed = name.trim().slice(0, 20);
  const updated = { ...data, mascotName: trimmed || "Skipper" };
  saveGameData(updated);
  return updated;
}

export function isMascotNameUnlocked(level: number): boolean {
  return level >= MASCOT_NAME_UNLOCK_LEVEL;
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

const DEFAULT_ENABLED_DAMAGE: string[] = [];

// --- Date-parameterized damage functions ---

export function isDamageMarkedForDate(data: GameData, damageKey: string, dateString: string): boolean {
  return isDateEntryPresent(data.dailyDamage, damageKey, dateString);
}

export function toggleDamageForDate(data: GameData, damageKey: string, dateString: string): GameData {
  const { updatedMap, wasPresent } = toggleDateEntry(data.dailyDamage, damageKey, dateString);

  let newData: GameData = { ...data, dailyDamage: updatedMap };

  newData = pushFeedEvent(newData, {
    type: wasPresent ? "damage_removed" : "damage_marked",
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    damageKey,
  });

  saveGameData(newData);
  return newData;
}

// Convenience wrappers for today
export function isDamageMarkedToday(data: GameData, damageKey: string): boolean {
  return isDamageMarkedForDate(data, damageKey, getTodayString());
}

export function toggleDamageForToday(data: GameData, damageKey: string): GameData {
  return toggleDamageForDate(data, damageKey, getTodayString());
}

export function getDamageByDay(
  data: GameData,
  year: number,
  month: number
): Record<number, string[]> {
  const allKeys = Object.keys(data.dailyDamage ?? {});
  return groupDateEntriesByDay(data.dailyDamage, allKeys, year, month);
}

export function getEnabledDamage(data: GameData): string[] {
  return data.enabledDamage ?? DEFAULT_ENABLED_DAMAGE;
}

export function saveEnabledDamage(data: GameData, enabledDamage: string[]): GameData {
  const newData: GameData = {
    ...data,
    enabledDamage,
  };
  saveGameData(newData);
  return newData;
}

// --- Custom Habits & Damage CRUD ---

/** Generate a unique key for a custom habit or damage type */
export function generateCustomKey(prefix: string, label: string): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `custom_${prefix}_${slug}_${Date.now()}`;
}

/** Get all custom habit definitions */
export function getCustomHabits(data: GameData): CustomHabitDefinition[] {
  return data.customHabitDefinitions ?? [];
}

/** Add a custom habit definition. Returns null if at cap. */
export function addCustomHabit(data: GameData, def: CustomHabitDefinition): GameData | null {
  const current = getCustomHabits(data);
  if (current.length >= MAX_CUSTOM_HABITS) return null;
  const newData: GameData = {
    ...data,
    customHabitDefinitions: [...current, def],
    enabledHabits: [...getEnabledHabits(data), def.key],
  };
  saveGameData(newData);
  return newData;
}

/** Delete a custom habit definition. Historical date data is preserved for PP integrity. */
export function deleteCustomHabit(data: GameData, key: string): GameData {
  const current = getCustomHabits(data);
  const newData: GameData = {
    ...data,
    customHabitDefinitions: current.filter((h) => h.key !== key),
    enabledHabits: getEnabledHabits(data).filter((k) => k !== key),
  };
  saveGameData(newData);
  return newData;
}

/** Get all custom damage definitions */
export function getCustomDamage(data: GameData): CustomDamageDefinition[] {
  return data.customDamageDefinitions ?? [];
}

/** Add a custom damage definition. Returns null if at cap. */
export function addCustomDamage(data: GameData, def: CustomDamageDefinition): GameData | null {
  const current = getCustomDamage(data);
  if (current.length >= MAX_CUSTOM_DAMAGE) return null;
  const newData: GameData = {
    ...data,
    customDamageDefinitions: [...current, def],
    enabledDamage: [...getEnabledDamage(data), def.key],
  };
  saveGameData(newData);
  return newData;
}

/** Delete a custom damage definition. Historical date data is preserved for PP integrity. */
export function deleteCustomDamage(data: GameData, key: string): GameData {
  const current = getCustomDamage(data);
  const newData: GameData = {
    ...data,
    customDamageDefinitions: current.filter((d) => d.key !== key),
    enabledDamage: getEnabledDamage(data).filter((k) => k !== key),
  };
  saveGameData(newData);
  return newData;
}

// --- Points Wallet (AA System) ---

/** Count total date entries across all keys in a date-string map */
function countDateEntries<K extends string>(dateMap: Partial<Record<K, string[]>> | undefined): number {
  if (!dateMap) return 0;
  let total = 0;
  for (const dates of Object.values(dateMap)) {
    if (Array.isArray(dates)) total += dates.length;
  }
  return total;
}

// Counts total habit completions across all time
function countTotalHabitCompletions(data: GameData): number {
  return countDateEntries(data.healthyHabits);
}

// Counts total damage marks across all time (only enabled damage types)
function countTotalDamageMarks(data: GameData): number {
  const enabledKeys = new Set<string>(getEnabledDamage(data));
  const damage = data.dailyDamage ?? {};
  let total = 0;
  for (const [key, dates] of Object.entries(damage)) {
    if (enabledKeys.has(key) && Array.isArray(dates)) total += dates.length;
  }
  return total;
}

// Calculates effective points using day-by-day floor-at-zero logic.
// Damage can reduce your balance to 0 on any given day, but never below.
// This prevents a "debt spiral" where past damage blocks future habit earnings.
export function calculateLifetimePoints(data: GameData): number {
  return calculateEffectivePoints(data);
}

// Process habits and damage chronologically, flooring at 0 each day.
// This means damage on a bad day doesn't create debt that carries forward.
// Only enabled damage types count — disabled damage is invisible to the user
// and should not silently drain PP.
function calculateEffectivePoints(data: GameData): number {
  const habits = data.healthyHabits ?? {};
  const damage = data.dailyDamage ?? {};
  const enabledDamageKeys = new Set<string>(getEnabledDamage(data));

  // Collect all unique dates from habits and enabled damage
  const allDates = new Set<string>();
  for (const dates of Object.values(habits)) {
    if (Array.isArray(dates)) {
      for (const d of dates) allDates.add(d);
    }
  }
  for (const [key, dates] of Object.entries(damage)) {
    if (enabledDamageKeys.has(key) && Array.isArray(dates)) {
      for (const d of dates) allDates.add(d);
    }
  }

  // Process each day chronologically
  const sortedDates = Array.from(allDates).sort();
  let balance = 0;

  for (const date of sortedDates) {
    let dayHabits = 0;
    let dayDamage = 0;

    for (const dates of Object.values(habits)) {
      if (Array.isArray(dates) && dates.includes(date)) dayHabits++;
    }
    for (const [key, dates] of Object.entries(damage)) {
      if (enabledDamageKeys.has(key) && Array.isArray(dates) && dates.includes(date)) dayDamage++;
    }

    balance = Math.max(0, balance + dayHabits - dayDamage);
  }

  return balance;
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
  const effectivePoints = calculateEffectivePoints(data);
  return {
    lifetimeEarned,
    lifetimeDamage,
    lifetimeSpent,
    balance: Math.max(0, effectivePoints - lifetimeSpent),
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

// --- Inventory & Equipment ---

/** Returns the player's inventory, with safe defaults if none exists yet. */
export function getInventory(data: GameData): PlayerInventory {
  return data.inventory ?? { ownedItemIds: [], equippedItems: {} };
}

/** Purchase an item from the shop. Returns updated GameData, or null if can't afford / already owned / level too low. */
export function purchaseItem(data: GameData, itemId: string): GameData | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const inventory = getInventory(data);
  if (inventory.ownedItemIds.includes(itemId)) return null;

  // Level requirement check
  if (item.levelRequirement) {
    const totalXP = getTotalLifetimeXP(data);
    const { level } = getOverallLevel(totalXP);
    if (level < item.levelRequirement) return null;
  }

  // Check balance
  const { balance } = getPointsBalance(data);
  if (item.cost > balance) return null;

  // Single atomic save: deduct points + add item in one write
  const currentSpent = data.pointsWallet?.lifetimeSpent ?? 0;
  const newData: GameData = {
    ...data,
    pointsWallet: {
      lifetimeEarned: calculateLifetimePoints(data),
      lifetimeSpent: currentSpent + item.cost,
    },
    inventory: {
      ...inventory,
      ownedItemIds: [...inventory.ownedItemIds, itemId],
    },
  };
  saveGameData(newData);
  return newData;
}

/** Equip an owned item into its slot. Returns updated GameData, or null if not owned. */
export function equipItem(data: GameData, itemId: string): GameData | null {
  const item = getItemById(itemId);
  if (!item) return null;

  const inventory = getInventory(data);
  if (!inventory.ownedItemIds.includes(itemId)) return null;

  const newInventory: PlayerInventory = {
    ...inventory,
    equippedItems: { ...inventory.equippedItems, [item.slot]: itemId },
  };

  const newData: GameData = { ...data, inventory: newInventory };
  saveGameData(newData);
  return newData;
}

/** Unequip an item from a slot. */
export function unequipSlot(data: GameData, slot: EquipmentSlot): GameData {
  const inventory = getInventory(data);
  const newEquipped = { ...inventory.equippedItems };
  delete newEquipped[slot];

  const newData: GameData = {
    ...data,
    inventory: { ...inventory, equippedItems: newEquipped },
  };
  saveGameData(newData);
  return newData;
}

// --- Equipment Bonus Engine ---

/** Aggregated bonuses from all equipped items */
export interface EquipmentBonuses {
  /** Flat XP bonuses per stat (from statModifiers + focusEffect modifiers) */
  statModifiers: Partial<Record<StatKey, { flatBonus: number }>>;
  /** Totaled secondary stats (AC, HP, Mana, etc.) */
  secondaryStats: SecondaryStats;
  /** Totaled resistances */
  resistances: ItemResistances;
}

/** Aggregate all stat bonuses from currently equipped items into a single bonus object. */
export function getEquippedBonuses(data: GameData): EquipmentBonuses {
  const inventory = getInventory(data);
  const bonuses: EquipmentBonuses = {
    statModifiers: {},
    secondaryStats: {},
    resistances: {},
  };

  for (const itemId of Object.values(inventory.equippedItems)) {
    if (!itemId) continue;
    const item = getItemById(itemId);
    if (!item) continue;

    // Aggregate primary stat modifiers
    if (item.statModifiers) {
      for (const mod of item.statModifiers) {
        if (!bonuses.statModifiers[mod.stat]) {
          bonuses.statModifiers[mod.stat] = { flatBonus: 0 };
        }
        bonuses.statModifiers[mod.stat]!.flatBonus += mod.flatBonus;
      }
    }

    // Focus effect modifiers stack with primary stat modifiers
    if (item.focusEffect) {
      for (const mod of item.focusEffect.modifiers) {
        if (!bonuses.statModifiers[mod.stat]) {
          bonuses.statModifiers[mod.stat] = { flatBonus: 0 };
        }
        bonuses.statModifiers[mod.stat]!.flatBonus += mod.flatBonus;
      }
    }

    // Aggregate secondary stats
    if (item.secondaryStats) {
      for (const [key, value] of Object.entries(item.secondaryStats)) {
        if (value !== undefined) {
          (bonuses.secondaryStats as Record<string, number>)[key] =
            ((bonuses.secondaryStats as Record<string, number>)[key] ?? 0) + value;
        }
      }
    }

    // Aggregate resistances
    if (item.resistances) {
      for (const [key, value] of Object.entries(item.resistances)) {
        if (value !== undefined) {
          (bonuses.resistances as Record<string, number>)[key] =
            ((bonuses.resistances as Record<string, number>)[key] ?? 0) + value;
        }
      }
    }
  }

  return bonuses;
}

/** Apply equipment bonuses to a base XP amount for a specific stat.
 *  Returns the boosted amount (always at least the base amount — equipment never reduces XP). */
export function applyEquipmentBonus(baseAmount: number, statKey: StatKey, bonuses: EquipmentBonuses): number {
  const statBonus = bonuses.statModifiers[statKey];
  if (!statBonus) return baseAmount;

  const boosted = baseAmount + statBonus.flatBonus;
  // Ensure equipment never reduces XP below the base amount
  return Math.max(baseAmount, boosted);
}

// --- Prize Track ---

/** Get all user prizes, sorted by unlock level ascending */
export function getPrizes(data: GameData): Prize[] {
  return [...(data.prizes ?? [])].sort((a, b) => a.unlockLevel - b.unlockLevel);
}

/** Add a new user prize. Returns updated GameData, or null if at the soft limit (15). */
export function addPrize(data: GameData, name: string, unlockLevel: number, link?: string): GameData | null {
  const existing = data.prizes ?? [];
  if (existing.length >= MAX_USER_PRIZES) return null;

  const prize: Prize = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 60),
    unlockLevel: Math.max(1, Math.min(60, unlockLevel)),
    link: link?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const newData: GameData = {
    ...data,
    prizes: [...existing, prize],
  };
  saveGameData(newData);
  return newData;
}

/** Update an existing prize. Returns updated GameData, or null if prize not found. */
export function updatePrize(
  data: GameData,
  prizeId: string,
  updates: { name?: string; unlockLevel?: number; link?: string | null }
): GameData | null {
  const existing = data.prizes ?? [];
  const index = existing.findIndex((p) => p.id === prizeId);
  if (index === -1) return null;

  const updated = { ...existing[index] };
  if (updates.name !== undefined) updated.name = updates.name.trim().slice(0, 60);
  if (updates.unlockLevel !== undefined) updated.unlockLevel = Math.max(1, Math.min(60, updates.unlockLevel));
  if (updates.link !== undefined) updated.link = updates.link?.trim() || undefined;

  const newPrizes = [...existing];
  newPrizes[index] = updated;

  const newData: GameData = { ...data, prizes: newPrizes };
  saveGameData(newData);
  return newData;
}

/** Delete a prize by ID. */
export function deletePrize(data: GameData, prizeId: string): GameData {
  const newData: GameData = {
    ...data,
    prizes: (data.prizes ?? []).filter((p) => p.id !== prizeId),
  };
  saveGameData(newData);
  return newData;
}

/** Check for newly unlocked prizes and generate feed events for any that haven't been recorded yet. */
export function checkPrizeUnlocks(data: GameData, currentLevel: number): GameData {
  const prizes = data.prizes ?? [];
  const feedEvents = data.feedEvents ?? [];

  // Find prize IDs that already have unlock feed events
  const alreadyUnlockedIds = new Set(
    feedEvents
      .filter((e): e is Extract<FeedEvent, { type: "prize_unlocked" }> => e.type === "prize_unlocked")
      .map((e) => e.prizeId)
  );

  // Find prizes that should be unlocked but haven't generated events yet
  const newlyUnlocked = prizes.filter(
    (p) => p.unlockLevel <= currentLevel && !alreadyUnlockedIds.has(p.id)
  );

  if (newlyUnlocked.length === 0) return data;

  const now = new Date().toISOString();
  let updatedData = data;

  for (const prize of newlyUnlocked) {
    updatedData = pushFeedEvent(updatedData, {
      type: "prize_unlocked",
      id: crypto.randomUUID(),
      timestamp: now,
      prizeId: prize.id,
      prizeName: prize.name,
      unlockLevel: prize.unlockLevel,
    });
  }

  saveGameData(updatedData);
  return updatedData;
}

/** Check for newly unlocked level-reward items and grant them + generate feed events. */
export function checkItemRewardUnlocks(data: GameData, currentLevel: number): GameData {
  const rewardItems = getLevelRewardItems();
  const feedEvents = data.feedEvents ?? [];
  const inventory = getInventory(data);

  // Find item IDs that already have unlock feed events
  const alreadyUnlockedIds = new Set(
    feedEvents
      .filter((e): e is Extract<FeedEvent, { type: "item_reward_unlocked" }> => e.type === "item_reward_unlocked")
      .map((e) => e.itemId)
  );

  // Find items that should be unlocked but haven't generated events yet
  const newlyUnlocked = rewardItems.filter(
    (item) => item.levelReward! <= currentLevel && !alreadyUnlockedIds.has(item.id)
  );

  if (newlyUnlocked.length === 0) return data;

  const now = new Date().toISOString();
  let updatedData = data;
  const updatedOwnedIds = [...inventory.ownedItemIds];

  for (const item of newlyUnlocked) {
    // Add to inventory if not already owned
    if (!updatedOwnedIds.includes(item.id)) {
      updatedOwnedIds.push(item.id);
    }

    updatedData = pushFeedEvent(updatedData, {
      type: "item_reward_unlocked",
      id: crypto.randomUUID(),
      timestamp: now,
      itemId: item.id,
      itemName: item.name,
      unlockLevel: item.levelReward!,
    });
  }

  // Update inventory with any newly granted items
  updatedData = {
    ...updatedData,
    inventory: {
      ...getInventory(updatedData),
      ownedItemIds: updatedOwnedIds,
    },
  };

  saveGameData(updatedData);
  return updatedData;
}

// --- Challenges (Judge-issued) ---

/** Returns the current active challenge, or null if none. */
export function getActiveChallenge(data: GameData): Challenge | null {
  return data.activeChallenge ?? null;
}

/** Issue a new standalone challenge from the Judge. Stores it as the active challenge and pushes a feed event. */
export function issueChallenge(
  data: GameData,
  description: string,
  stat: StatKey,
  bonusXP: number
): GameData {
  const challenge: Challenge = {
    id: crypto.randomUUID(),
    description,
    stat,
    bonusXP,
    issuedAt: new Date().toISOString(),
  };

  let newData: GameData = {
    ...data,
    activeChallenge: challenge,
  };

  newData = pushFeedEvent(newData, {
    type: "challenge_issued",
    id: crypto.randomUUID(),
    timestamp: challenge.issuedAt,
    challengeId: challenge.id,
    description: challenge.description,
    stat: challenge.stat,
    bonusXP: challenge.bonusXP,
  });

  saveGameData(newData);
  return newData;
}

/** Issue a challenge chain — sets the first step as active and queues the rest as pending steps. */
export function issueChallengeChain(
  data: GameData,
  steps: ChainStep[]
): GameData {
  if (steps.length === 0) return data;

  const chainId = crypto.randomUUID();
  const firstStep = steps[0];
  const remainingSteps = steps.slice(1);

  const challenge: Challenge = {
    id: crypto.randomUUID(),
    description: firstStep.description,
    stat: firstStep.stat,
    bonusXP: firstStep.bonusXP,
    issuedAt: new Date().toISOString(),
    chainId,
    chainIndex: 1,
    chainTotal: steps.length,
  };

  let newData: GameData = {
    ...data,
    activeChallenge: challenge,
    pendingChainSteps: remainingSteps.length > 0 ? remainingSteps : undefined,
  };

  newData = pushFeedEvent(newData, {
    type: "challenge_issued",
    id: crypto.randomUUID(),
    timestamp: challenge.issuedAt,
    challengeId: challenge.id,
    description: challenge.description,
    stat: challenge.stat,
    bonusXP: challenge.bonusXP,
  });

  saveGameData(newData);
  return newData;
}

/** Complete the active challenge — awards bonus XP and clears it. If part of a chain, auto-issues the next step. Returns null if no active challenge. */
export function completeChallenge(data: GameData): { newData: GameData; nextChainStep: boolean } | null {
  const challenge = data.activeChallenge;
  if (!challenge) return null;

  const now = new Date().toISOString();
  const completedChallenge: Challenge = { ...challenge, completedAt: now };

  // Award the bonus XP
  const { newData: afterXP } = addXP(data, challenge.stat, `Challenge: ${challenge.description}`, challenge.bonusXP);

  // Push completion feed event and clear the active challenge
  let newData: GameData = {
    ...afterXP,
    activeChallenge: undefined,
  };

  newData = pushFeedEvent(newData, {
    type: "challenge_completed",
    id: crypto.randomUUID(),
    timestamp: now,
    challengeId: completedChallenge.id,
    description: completedChallenge.description,
    stat: completedChallenge.stat,
    bonusXP: completedChallenge.bonusXP,
  });

  // If this was a chain step and there are more pending steps, auto-issue the next one
  const pendingSteps = data.pendingChainSteps;
  if (challenge.chainId && pendingSteps && pendingSteps.length > 0) {
    const nextStep = pendingSteps[0];
    const remainingSteps = pendingSteps.slice(1);

    const nextChallenge: Challenge = {
      id: crypto.randomUUID(),
      description: nextStep.description,
      stat: nextStep.stat,
      bonusXP: nextStep.bonusXP,
      issuedAt: now,
      chainId: challenge.chainId,
      chainIndex: (challenge.chainIndex ?? 1) + 1,
      chainTotal: challenge.chainTotal,
    };

    newData = {
      ...newData,
      activeChallenge: nextChallenge,
      pendingChainSteps: remainingSteps.length > 0 ? remainingSteps : undefined,
    };

    newData = pushFeedEvent(newData, {
      type: "challenge_issued",
      id: crypto.randomUUID(),
      timestamp: now,
      challengeId: nextChallenge.id,
      description: nextChallenge.description,
      stat: nextChallenge.stat,
      bonusXP: nextChallenge.bonusXP,
    });

    saveGameData(newData);
    return { newData, nextChainStep: true };
  }

  // Clear any leftover pending steps
  newData = { ...newData, pendingChainSteps: undefined };

  saveGameData(newData);
  return { newData, nextChainStep: false };
}

/** Dismiss the active challenge without completing it. Also clears any pending chain steps. */
export function dismissChallenge(data: GameData): GameData {
  const newData: GameData = {
    ...data,
    activeChallenge: undefined,
    pendingChainSteps: undefined,
  };
  saveGameData(newData);
  return newData;
}

// --- Vision Board ---

/** Get all vision cards, sorted with pinned first, then newest first. */
export function getVisionCards(data: GameData): VisionCard[] {
  const cards = [...(data.visionCards ?? [])];
  return cards.sort((a, b) => {
    // Pinned cards first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** Add a new vision card. Returns updated GameData, or null if at the 20-card cap. */
export function addVisionCard(data: GameData, rawText: string, weavedText: string, imageBase64?: string): GameData | null {
  const existing = data.visionCards ?? [];
  if (existing.length >= MAX_VISION_CARDS) return null;

  const card: VisionCard = {
    id: crypto.randomUUID(),
    rawText: rawText.trim(),
    weavedText: weavedText.trim(),
    colorIndex: existing.length % VISION_COLORS.length,
    createdAt: new Date().toISOString(),
    ...(imageBase64 ? { imageBase64 } : {}),
  };

  const newData: GameData = {
    ...data,
    visionCards: [...existing, card],
  };
  saveGameData(newData);
  return newData;
}

/** Delete a vision card by ID. */
export function deleteVisionCard(data: GameData, cardId: string): GameData {
  const newData: GameData = {
    ...data,
    visionCards: (data.visionCards ?? []).filter((c) => c.id !== cardId),
  };
  saveGameData(newData);
  return newData;
}

/** Toggle the pinned state of a vision card. */
export function togglePinVisionCard(data: GameData, cardId: string): GameData | null {
  const existing = data.visionCards ?? [];
  const index = existing.findIndex((c) => c.id === cardId);
  if (index === -1) return null;

  const updated = { ...existing[index], pinned: !existing[index].pinned };
  const newCards = [...existing];
  newCards[index] = updated;

  const newData: GameData = { ...data, visionCards: newCards };
  saveGameData(newData);
  return newData;
}

/** Save the Oracle's board reading. */
export function saveBoardReading(data: GameData, text: string): GameData {
  const reading: BoardReading = {
    id: crypto.randomUUID(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const newData: GameData = { ...data, lastBoardReading: reading };
  saveGameData(newData);
  return newData;
}

/** Get the most recent board reading, or null if none exists. */
export function getLastBoardReading(data: GameData): BoardReading | null {
  return data.lastBoardReading ?? null;
}
