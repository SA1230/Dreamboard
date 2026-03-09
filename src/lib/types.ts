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
  /** The Judge's full verdict text (sassy flavor text) — only present for Judge-awarded XP */
  verdictMessage?: string;
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
  /** Slots this item visually overrides (e.g. robe overrides chest+legs) */
  overridesSlots?: VisibleSlot[];
}

export interface PlayerInventory {
  ownedItemIds: string[];
  equippedItems: Partial<Record<EquipmentSlot, string>>;
}

// --- Challenges (Judge-issued) ---

/** A challenge issued by the Judge — one active at a time */
export interface Challenge {
  id: string;
  description: string;
  stat: StatKey;
  bonusXP: number;
  issuedAt: string;
  completedAt?: string;
  /** If part of a chain: shared ID across all steps */
  chainId?: string;
  /** 1-based index within the chain (e.g. 1 of 3) */
  chainIndex?: number;
  /** Total steps in the chain */
  chainTotal?: number;
}

/** A pending step in a challenge chain, waiting to be issued */
export interface ChainStep {
  description: string;
  stat: StatKey;
  bonusXP: number;
}

// --- Vision Board ---

/** A single card on the user's Vision Board */
export interface VisionCard {
  id: string;
  rawText: string;       // user's original words
  weavedText: string;    // Oracle-enhanced (or same as rawText if skipped)
  colorIndex: number;    // index into VISION_COLORS palette (0-5)
  createdAt: string;
  pinned?: boolean;
  /** Base64 data URL of the card image — either AI-generated or user-uploaded */
  imageBase64?: string;
}

/** Snapshot of an AI "Board Reading" — the Oracle's interpretation of the whole board */
export interface BoardReading {
  id: string;
  text: string;
  createdAt: string;
}

// --- Prize Track ---

/** A user-created IRL prize/reward that unlocks at a specific overall level */
export interface Prize {
  id: string;
  name: string;
  unlockLevel: number;
  link?: string;
  createdAt: string;
}

// Discriminated union for all events that appear in the activity feed
export type FeedEvent =
  | { type: "xp_gain"; id: string; timestamp: string; stat: StatKey; note: string; amount?: number; verdictMessage?: string }
  | { type: "habit_completed"; id: string; timestamp: string; habitKey: HabitKey }
  | { type: "habit_removed"; id: string; timestamp: string; habitKey: HabitKey }
  | { type: "damage_marked"; id: string; timestamp: string; damageKey: DamageKey }
  | { type: "damage_removed"; id: string; timestamp: string; damageKey: DamageKey }
  | { type: "level_up"; id: string; timestamp: string; stat: StatKey; newLevel: number }
  | { type: "overall_level_up"; id: string; timestamp: string; newLevel: number; previousLevel: number }
  | { type: "rank_up"; id: string; timestamp: string; newRank: string; newLevel: number }
  | { type: "prize_unlocked"; id: string; timestamp: string; prizeId: string; prizeName: string; unlockLevel: number }
  | { type: "challenge_issued"; id: string; timestamp: string; challengeId: string; description: string; stat: StatKey; bonusXP: number }
  | { type: "challenge_completed"; id: string; timestamp: string; challengeId: string; description: string; stat: StatKey; bonusXP: number };

export interface GameData {
  /** Schema version for data migrations — auto-upgraded on load */
  schemaVersion?: number;
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
  /** Custom name for the mascot (defaults to "Skipper", unlocks at level 5) */
  mascotName?: string;
  /** User-created IRL prize rewards, unlocked at specific overall levels */
  prizes?: Prize[];
  /** The current active challenge issued by the Judge (one at a time) */
  activeChallenge?: Challenge;
  /** Remaining steps in a challenge chain — auto-issued as each step completes */
  pendingChainSteps?: ChainStep[];
  /** Vision Board cards — dreams, goals, vibes collected by the user */
  visionCards?: VisionCard[];
  /** Most recent Board Reading from the Oracle */
  lastBoardReading?: BoardReading;
}
