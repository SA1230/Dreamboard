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
