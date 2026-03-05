export type StatKey =
  | "strength"
  | "wisdom"
  | "vitality"
  | "charisma"
  | "craft"
  | "discipline"
  | "spirit"
  | "wealth";

export interface StatProgress {
  xp: number;
  level: number;
}

export interface Activity {
  id: string;
  stat: StatKey;
  note: string;
  timestamp: string;
}

export interface CustomStatOverride {
  name?: string;
  description?: string;
  earnsXP?: string;
  color?: string;
  iconKey?: string;
}

export type HabitKey = "water" | "nails" | "brush" | "nosugar" | "floss" | "steps";

export interface GameData {
  stats: Record<StatKey, StatProgress>;
  activities: Activity[];
  customDefinitions?: Partial<Record<StatKey, CustomStatOverride>>;
  healthyHabits?: Partial<Record<HabitKey, string[]>>;
  enabledHabits?: HabitKey[];
}
