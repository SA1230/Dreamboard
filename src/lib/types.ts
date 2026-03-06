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

// --- Equipment & Shop ---

/** Visible slots — SVG layers rendered on Skipper's character model */
export type VisibleSlot = "head" | "chest" | "legs" | "robe" | "hands" | "feet" | "primary" | "secondary";

/** Hidden slots — inventory-only, no visual on character (future stat items) */
export type HiddenSlot = "ring1" | "ring2" | "ear1" | "ear2" | "neck" | "shoulders" | "back" | "bracers" | "ranged";

/** All equipment slots (visible + hidden) */
export type EquipmentSlot = VisibleSlot | HiddenSlot;

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  cost: number;
  levelRequirement?: number;
  /** Maps to SVG content in itemSvgs registry (only for visible slots) */
  svgAssetKey?: string;
  /** Preview image path for shop grid */
  thumbnailSrc: string;
  /** Slots this item visually overrides (e.g. robe overrides chest+legs) */
  overridesSlots?: VisibleSlot[];
}

export interface PlayerInventory {
  ownedItemIds: string[];
  equippedItems: Partial<Record<EquipmentSlot, string>>;
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
  /** Player's item inventory and equipment loadout */
  inventory?: PlayerInventory;
}
