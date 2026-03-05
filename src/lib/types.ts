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
  /** XP amount awarded (defaults to 1 for backward compat with pre-judge activities) */
  amount?: number;
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

// Discriminated union for all events that appear in the activity feed
export type FeedEvent =
  | { type: "xp_gain"; id: string; timestamp: string; stat: StatKey; note: string; amount?: number }
  | { type: "habit_completed"; id: string; timestamp: string; habitKey: HabitKey }
  | { type: "habit_removed"; id: string; timestamp: string; habitKey: HabitKey }
  | { type: "damage_marked"; id: string; timestamp: string; damageKey: DamageKey }
  | { type: "damage_removed"; id: string; timestamp: string; damageKey: DamageKey }
  | { type: "level_up"; id: string; timestamp: string; stat: StatKey; newLevel: number }
  | { type: "overall_level_up"; id: string; timestamp: string; newLevel: number; previousLevel: number }
  | { type: "rank_up"; id: string; timestamp: string; newRank: string; newLevel: number };

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
  /** Timestamped feed of all actions (XP gains, habits, damage, level-ups, rank changes) — newest first */
  feedEvents?: FeedEvent[];
  /** Base64 data URL of the user's profile picture (shown in Judge chat) */
  profilePicture?: string;
}
