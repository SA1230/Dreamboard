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

// --- Custom Habits & Damage ---

export const MAX_CUSTOM_HABITS = 6;
export const MAX_CUSTOM_DAMAGE = 4;

/** User-created habit definition — stored in GameData.customHabitDefinitions */
export interface CustomHabitDefinition {
  key: string;
  label: string;
  pastTenseLabel: string;
  completedLabel: string;
  description: string;
  iconKey: string;
  color: string;
  enabledBackground: string;
  createdAt: string;
}

/** User-created damage/vice definition — stored in GameData.customDamageDefinitions */
export interface CustomDamageDefinition {
  key: string;
  label: string;
  pastTenseLabel: string;
  description: string;
  iconKey: string;
  color: string;
  enabledBackground: string;
  createdAt: string;
}

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

/** A stat modifier on an item — flat XP bonus or percentage XP multiplier */
export interface ItemStatModifier {
  stat: StatKey;
  /** Flat bonus XP added to every gain in this stat (e.g. +1 means every Wisdom gain gets 1 extra XP) */
  flatBonus: number;
}

/** Secondary stats on items (EQ-style AC, HP, Mana, etc.) — display-only now, mechanically active in future RPG system */
export interface SecondaryStats {
  /** Armor Class — reduces PP damage penalty (future: real AC in combat) */
  ac?: number;
  /** Hit Points — display-only now, becomes combat health pool in RPG system */
  hp?: number;
  /** Mana — display-only now, becomes ability resource in RPG system */
  mana?: number;
  /** Attack — flat bonus XP on activities */
  attack?: number;
  /** Haste % — proc chance for bonus XP on any activity (future: turn speed in combat) */
  haste?: number;
  /** HP Regen — passive PP earned per day (future: combat HP regen per tick) */
  hpRegen?: number;
  /** Mana Regen — clicky cooldown reduction (future: combat mana regen per tick) */
  manaRegen?: number;
  /** Spell Damage — bonus to mental stat XP (future: spell damage in combat) */
  spellDmg?: number;
  /** Heal Amount — streak protection (future: heal power in combat) */
  healAmt?: number;
  /** Damage Shield — PP gain when damage is marked (future: reflect damage in combat) */
  damageShield?: number;
  /** Shielding % — percentage reduction on damage PP penalty */
  shielding?: number;
  /** Avoidance — % chance to ignore a damage mark's PP penalty */
  avoidance?: number;
  /** Accuracy — % chance for +1 bonus XP on any activity */
  accuracy?: number;
}

/** Resistance to damage types — reduces PP loss now, reduces combat damage in future RPG system */
export interface ItemResistances {
  substance?: number;
  screentime?: number;
  junkfood?: number;
  badsleep?: number;
}

/** Shared effect payload used by procs, clickies, and worn effects */
export type ItemEffectPayload =
  | { type: "xp_multiplier"; multiplier: number; durationMinutes: number }
  | { type: "grant_pp"; amount: number }
  | { type: "bonus_xp"; stat: StatKey; amount: number }
  | { type: "streak_shield"; durationDays: number }
  | { type: "resist_boost"; resist: DamageKey; amount: number; durationHours: number }
  | { type: "haste_burst"; hasteBonus: number; durationMinutes: number };

/** Proc effect — random chance trigger on weapon hit / activity log */
export interface ProcEffect {
  name: string;
  description: string;
  /** Chance to trigger (0-100 percentage) */
  chance: number;
  effect: ItemEffectPayload;
}

/** Weapon-specific stats (EQ DMG/DLY). Only relevant for primary/secondary slot items */
export interface WeaponStats {
  /** DMG — primary weapon power (future: combat damage per hit) */
  damage: number;
  /** DLY — attack speed, lower is faster (future: combat attack delay) */
  delay: number;
  /** Weapon type classification */
  weaponType?: "1HS" | "2HS" | "1HB" | "2HB" | "Piercing" | "Staff" | "H2H";
  /** Random trigger on activity log (future: procs during combat rounds) */
  proc?: ProcEffect;
}

/** Named passive bonus on an item (like EQ's "Improved Healing III") */
export interface FocusEffect {
  name: string;
  description: string;
  /** Tier for progression (I=1, II=2, III=3, etc.) */
  tier?: number;
  modifiers: ItemStatModifier[];
}

/** Activated ability with cooldown ("right-clicky" in EQ terms) */
export interface ItemAbility {
  name: string;
  description: string;
  /** Cooldown in hours between activations */
  cooldownHours: number;
  effect: ItemEffectPayload;
}

/** Set bonus at a specific piece count threshold */
export interface ItemSetBonus {
  /** Number of pieces required */
  count: number;
  /** Display label (e.g. "2/4") */
  label: string;
  modifiers?: ItemStatModifier[];
  secondaryStats?: Partial<SecondaryStats>;
}

/** Item set definition — wearing multiple pieces grants escalating bonuses */
export interface ItemSet {
  id: string;
  name: string;
  itemIds: string[];
  bonuses: ItemSetBonus[];
}

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

  // --- EQ-style stats ---

  /** Primary stat modifiers — flat XP bonuses and/or percentage multipliers */
  statModifiers?: ItemStatModifier[];
  /** Secondary stats (AC, HP, Mana, Haste, etc.) */
  secondaryStats?: SecondaryStats;
  /** Resistance to damage types */
  resistances?: ItemResistances;
  /** Weapon stats — damage/delay/type/proc (primary + secondary slots only) */
  weaponStats?: WeaponStats;

  // --- Item properties ---

  /** Item weight (flavor now, encumbrance in future) */
  weight?: number;
  /** Material composition (e.g. "Leather", "Iron", "Crystal", "Dragonscale") */
  material?: string;
  /** Recommended level (softer gate than levelRequirement — shows warning but doesn't prevent equip) */
  recommendedLevel?: number;

  // --- Effects ---

  /** Named passive bonus (e.g. "Improved Physical Training III") */
  focusEffect?: FocusEffect;
  /** Activated ability with cooldown */
  ability?: ItemAbility;

  // --- Set & future ---

  /** Item set this belongs to (matches ItemSet.id) */
  setId?: string;
  /** Number of augmentation sockets (future) */
  augSlots?: number;
  /** Whether this item levels up with use (future) */
  evolving?: boolean;

  // --- Level reward ---

  /** Overall level at which this item is automatically granted as a reward (no PP cost). Only used by LEVEL_REWARD_ITEMS */
  levelReward?: number;
}

export interface PlayerInventory {
  ownedItemIds: string[];
  equippedItems: Partial<Record<EquipmentSlot, string>>;
  /** Tracks when each clicky ability was last activated — keyed by item ID, value is ISO timestamp */
  abilityCooldowns?: Record<string, string>;
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
  | { type: "habit_completed"; id: string; timestamp: string; habitKey: string }
  | { type: "habit_removed"; id: string; timestamp: string; habitKey: string }
  | { type: "damage_marked"; id: string; timestamp: string; damageKey: string }
  | { type: "damage_removed"; id: string; timestamp: string; damageKey: string }
  | { type: "level_up"; id: string; timestamp: string; stat: StatKey; newLevel: number }
  | { type: "overall_level_up"; id: string; timestamp: string; newLevel: number; previousLevel: number }
  | { type: "rank_up"; id: string; timestamp: string; newRank: string; newLevel: number }
  | { type: "prize_unlocked"; id: string; timestamp: string; prizeId: string; prizeName: string; unlockLevel: number }
  | { type: "item_reward_unlocked"; id: string; timestamp: string; itemId: string; itemName: string; unlockLevel: number }
  | { type: "challenge_issued"; id: string; timestamp: string; challengeId: string; description: string; stat: StatKey; bonusXP: number }
  | { type: "challenge_completed"; id: string; timestamp: string; challengeId: string; description: string; stat: StatKey; bonusXP: number };

export interface GameData {
  /** Schema version for data migrations — auto-upgraded on load */
  schemaVersion?: number;
  stats: Record<StatKey, StatProgress>;
  activities: Activity[];
  customDefinitions?: Partial<Record<StatKey, CustomStatOverride>>;
  healthyHabits?: Partial<Record<string, string[]>>;
  enabledHabits?: string[];
  /** User-created custom habit definitions */
  customHabitDefinitions?: CustomHabitDefinition[];
  /** Maps level thresholds to mascot image filenames in /mascots/ (e.g. { 1: "skipper-default.svg", 10: "skipper-cool.svg" }) */
  mascotOverrides?: Record<number, string>;
  /** Daily damage tracking — same structure as healthyHabits (date strings per damage type) */
  dailyDamage?: Partial<Record<string, string[]>>;
  /** Which damage items are visible on the dashboard */
  enabledDamage?: string[];
  /** User-created custom damage/vice definitions */
  customDamageDefinitions?: CustomDamageDefinition[];
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
