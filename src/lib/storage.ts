import { GameData, StatKey, Activity, StatProgress, CustomStatOverride } from "./types";
import { STAT_KEYS, STAT_DEFINITIONS, StatDefinition, COLOR_PRESETS } from "./stats";

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
  note: string
): { newData: GameData; leveledUp: boolean } {
  const stat = { ...data.stats[statKey] };
  stat.xp += 1;

  let leveledUp = false;
  const xpNeeded = getXPForNextLevel(stat.level);

  if (stat.xp >= xpNeeded) {
    stat.level += 1;
    stat.xp = stat.xp - xpNeeded;
    leveledUp = true;
  }

  const activity: Activity = {
    id: crypto.randomUUID(),
    stat: statKey,
    note,
    timestamp: new Date().toISOString(),
  };

  const newData: GameData = {
    stats: { ...data.stats, [statKey]: stat },
    activities: [activity, ...data.activities],
  };

  saveGameData(newData);
  return { newData, leveledUp };
}

export function getTotalLevel(data: GameData): number {
  return STAT_KEYS.reduce((sum, key) => sum + data.stats[key].level, 0);
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
    result[day][activity.stat] = (result[day][activity.stat] ?? 0) + 1;
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
      currentMonthXP++;
    } else if (activityYear === lastMonthYear && activityMonth === lastMonth) {
      lastMonthXP++;
    }
  }

  return { currentMonthXP, lastMonthXP };
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
