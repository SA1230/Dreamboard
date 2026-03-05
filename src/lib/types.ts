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

export type DamageKey = "substance" | "screentime" | "junkfood" | "badsleep";

export interface PointsWallet {
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface GameData {
  stats: Record<StatKey, StatProgress>;
  activities: Activity[];
  customDefinitions?: Partial<Record<StatKey, CustomStatOverride>>;
  healthyHabits?: Partial<Record<HabitKey, string[]>>;
  enabledHabits?: HabitKey[];
  /** Maps level thresholds to mascot image filenames in /mascots/ (e.g. { 1: "skipper-default.svg", 10: "skipper-cool.svg" }) */
  mascotOverrides?: Record<number, string>;
  /** Daily damage tracking — same structure as healthyHabits (date strings per damage type) */
  dailyDamage?: Partial<Record<DamageKey, string[]>>;
  /** Which damage items are visible on the dashboard */
  enabledDamage?: DamageKey[];
  /** Points wallet for the AA system — tracks lifetime earned and spent */
  pointsWallet?: PointsWallet;
}
