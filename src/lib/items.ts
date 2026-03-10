import { ShopItem, ItemRarity, EquipmentSlot, VisibleSlot, ItemSet } from "./types";

/** Color scheme per rarity tier — warm earth tones matching the app palette */
export const RARITY_COLORS: Record<ItemRarity, { text: string; background: string; border: string }> = {
  common:    { text: "#6B7B8D", background: "#EEF1F4", border: "#D0D8E0" },
  uncommon:  { text: "#6A8E5B", background: "#EFF5EC", border: "#B5D4A5" },
  rare:      { text: "#5B7AA5", background: "#EDF2F8", border: "#A0BDD8" },
  epic:      { text: "#8B6BA5", background: "#F3EFF7", border: "#C4A8D8" },
  legendary: { text: "#C9943E", background: "#FDF6EC", border: "#E5C880" },
};

/** All visible slot names for display in the shop UI */
export const VISIBLE_SLOTS: { slot: VisibleSlot; label: string }[] = [
  { slot: "head", label: "Head" },
  { slot: "chest", label: "Chest" },
  { slot: "legs", label: "Legs" },
  { slot: "robe", label: "Robe" },
  { slot: "hands", label: "Hands" },
  { slot: "feet", label: "Feet" },
  { slot: "primary", label: "Primary" },
  { slot: "secondary", label: "Secondary" },
];

/** Display labels for secondary stats */
export const SECONDARY_STAT_LABELS: Record<string, { label: string; suffix?: string }> = {
  ac: { label: "AC" },
  hp: { label: "HP" },
  mana: { label: "Mana" },
  attack: { label: "Attack" },
  haste: { label: "Haste", suffix: "%" },
  hpRegen: { label: "HP Regen" },
  manaRegen: { label: "Mana Regen" },
  spellDmg: { label: "Spell Dmg" },
  healAmt: { label: "Heal Amt" },
  damageShield: { label: "Dmg Shield" },
  shielding: { label: "Shielding", suffix: "%" },
  avoidance: { label: "Avoidance", suffix: "%" },
  accuracy: { label: "Accuracy", suffix: "%" },
};

/** Display labels for resistance types */
export const RESIST_LABELS: Record<string, { label: string; color: string }> = {
  substance: { label: "SbR", color: "#C45C3E" },
  screentime: { label: "ScR", color: "#5B7AA5" },
  junkfood: { label: "JfR", color: "#C9943E" },
  badsleep: { label: "BsR", color: "#8B6BA5" },
};

/**
 * Item catalog — EQ-style items with diverse stat bundles.
 * Common items: 1-2 stats, simple. Higher rarity = more stats + effects.
 * All secondary stats and resistances are display-only in v1 — they become
 * mechanically active when the RPG combat system ships.
 */
export const ITEM_CATALOG: ShopItem[] = [
  // === HEAD SLOT ===
  {
    id: "leather-cap",
    name: "Leather Cap",
    description: "A sturdy cap for aspiring adventurers.",
    slot: "head",
    rarity: "common",
    cost: 3,
    svgAssetKey: "leather-cap",
    weight: 0.5,
    material: "Leather",
    secondaryStats: { ac: 1, hp: 5 },
  },
  {
    id: "iron-helm",
    name: "Iron Helm",
    description: "Forged in the fires of commitment.",
    slot: "head",
    rarity: "uncommon",
    cost: 8,
    levelRequirement: 5,
    svgAssetKey: "iron-helm",
    weight: 2.0,
    material: "Iron",
    statModifiers: [
      { stat: "discipline", flatBonus: 1 },
    ],
    secondaryStats: { ac: 3, hp: 10 },
    resistances: { screentime: 5 },
  },

  // === CHEST SLOT ===
  {
    id: "cloth-tunic",
    name: "Cloth Tunic",
    description: "Simple but dignified. Every journey starts here.",
    slot: "chest",
    rarity: "common",
    cost: 3,
    svgAssetKey: "cloth-tunic",
    weight: 0.3,
    material: "Cloth",
    secondaryStats: { ac: 1, hp: 5 },
  },
  {
    id: "chain-mail",
    name: "Chain Mail",
    description: "Woven links of dedication and discipline.",
    slot: "chest",
    rarity: "rare",
    cost: 15,
    levelRequirement: 10,
    svgAssetKey: "chain-mail",
    weight: 4.0,
    material: "Steel",
    statModifiers: [
      { stat: "strength", flatBonus: 1 },
      { stat: "vitality", flatBonus: 1 },
    ],
    secondaryStats: { ac: 8, hp: 20, damageShield: 1 },
    resistances: { substance: 5, junkfood: 5 },
  },

  // === PRIMARY WEAPON ===
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    description: "Every warrior begins with wood.",
    slot: "primary",
    rarity: "common",
    cost: 2,
    svgAssetKey: "wooden-sword",
    weight: 1.0,
    material: "Wood",
    weaponStats: { damage: 2, delay: 30, weaponType: "1HS" },
    secondaryStats: { attack: 1 },
  },
  {
    id: "crystal-staff",
    name: "Crystal Staff",
    description: "Channels the wisdom of a thousand logged habits.",
    slot: "primary",
    rarity: "epic",
    cost: 25,
    levelRequirement: 15,
    svgAssetKey: "crystal-staff",
    weight: 3.5,
    material: "Crystal",
    statModifiers: [
      { stat: "wisdom", flatBonus: 2 },
      { stat: "craft", flatBonus: 1 },
    ],
    weaponStats: { damage: 6, delay: 38, weaponType: "Staff" },
    secondaryStats: { mana: 15, spellDmg: 3, attack: 3 },
    focusEffect: {
      name: "Arcane Clarity",
      description: "Enhances mental focus and insight.",
      tier: 1,
      modifiers: [
        { stat: "wisdom", flatBonus: 1 },
      ],
    },
  },

  // === SECONDARY SLOT ===
  {
    id: "buckler-shield",
    name: "Buckler Shield",
    description: "A small shield. Big on heart.",
    slot: "secondary",
    rarity: "common",
    cost: 3,
    svgAssetKey: "buckler-shield",
    weight: 1.5,
    material: "Wood",
    secondaryStats: { ac: 2, hp: 5 },
  },

  // === FEET SLOT ===
  {
    id: "wanderer-boots",
    name: "Wanderer's Boots",
    description: "For those who walk the path daily.",
    slot: "feet",
    rarity: "uncommon",
    cost: 5,
    svgAssetKey: "wanderer-boots",
    weight: 1.0,
    material: "Leather",
    statModifiers: [
      { stat: "vitality", flatBonus: 1 },
    ],
    secondaryStats: { ac: 2, hp: 5, haste: 1 },
  },

  // === LEGS SLOT ===
  {
    id: "cloth-pants",
    name: "Cloth Pants",
    description: "Humble legwear for the first steps of any quest.",
    slot: "legs",
    rarity: "common",
    cost: 3,
    svgAssetKey: "cloth-pants",
    weight: 0.3,
    material: "Cloth",
    secondaryStats: { ac: 1, hp: 5 },
  },
  {
    id: "plate-greaves",
    name: "Plate Greaves",
    description: "Steel-plated leg armor. Built for those who don't skip leg day.",
    slot: "legs",
    rarity: "rare",
    cost: 12,
    levelRequirement: 8,
    svgAssetKey: "plate-greaves",
    weight: 3.5,
    material: "Steel",
    statModifiers: [
      { stat: "strength", flatBonus: 2 },
    ],
    secondaryStats: { ac: 6, hp: 15 },
    resistances: { substance: 5 },
  },

  // === HANDS SLOT ===
  {
    id: "leather-gloves",
    name: "Leather Gloves",
    description: "Keeps your flippers warm and your grip steady.",
    slot: "hands",
    rarity: "common",
    cost: 2,
    svgAssetKey: "leather-gloves",
    weight: 0.3,
    material: "Leather",
    secondaryStats: { ac: 1, attack: 1 },
  },
  {
    id: "iron-gauntlets",
    name: "Iron Gauntlets",
    description: "Armored hand guards forged with quiet determination.",
    slot: "hands",
    rarity: "uncommon",
    cost: 6,
    levelRequirement: 5,
    svgAssetKey: "iron-gauntlets",
    weight: 1.5,
    material: "Iron",
    statModifiers: [
      { stat: "craft", flatBonus: 1 },
      { stat: "discipline", flatBonus: 1 },
    ],
    secondaryStats: { ac: 3, hp: 5, attack: 2 },
  },

  // === ROBE SLOT ===
  {
    id: "wanderer-robe",
    name: "Wanderer's Robe",
    description: "A flowing robe that whispers of journeys yet to come.",
    slot: "robe",
    rarity: "epic",
    cost: 20,
    levelRequirement: 12,
    svgAssetKey: "wanderer-robe",
    overridesSlots: ["chest", "legs"],
    weight: 1.5,
    material: "Enchanted Silk",
    statModifiers: [
      { stat: "spirit", flatBonus: 1 },
      { stat: "wisdom", flatBonus: 1 },
    ],
    secondaryStats: { ac: 5, hp: 15, mana: 10, hpRegen: 1 },
    resistances: { substance: 5, screentime: 5, junkfood: 5, badsleep: 5 },
    focusEffect: {
      name: "Wanderer's Resolve",
      description: "Strengthens spiritual endurance on long journeys.",
      tier: 1,
      modifiers: [
        { stat: "spirit", flatBonus: 1 },
      ],
    },
  },
];

/**
 * Level reward items — unique items auto-granted when the player reaches specific overall levels.
 * These are NOT purchasable in the shop. Power scales with level. Slots alternate for diversity:
 * hands → weapon → head → legs → shield → chest → robe
 */
export const LEVEL_REWARD_ITEMS: ShopItem[] = [
  {
    id: "adventurer-band",
    name: "Adventurer's Band",
    description: "A simple leather wrap. Every journey starts with a single step.",
    slot: "hands",
    rarity: "common",
    cost: 0,
    levelReward: 2,
    weight: 0.2,
    material: "Leather",
    secondaryStats: { ac: 1, hp: 5 },
  },
  {
    id: "pathfinder-blade",
    name: "Pathfinder's Blade",
    description: "A trusty short sword for those who've found their path.",
    slot: "primary",
    rarity: "common",
    cost: 0,
    levelReward: 5,
    weight: 1.2,
    material: "Iron",
    statModifiers: [
      { stat: "strength", flatBonus: 1 },
    ],
    weaponStats: { damage: 3, delay: 28, weaponType: "1HS" },
    secondaryStats: { attack: 2 },
  },
  {
    id: "seeker-hood",
    name: "Seeker's Hood",
    description: "Worn by those who question everything — and learn from the answers.",
    slot: "head",
    rarity: "uncommon",
    cost: 0,
    levelReward: 8,
    weight: 0.4,
    material: "Woven Cloth",
    statModifiers: [
      { stat: "wisdom", flatBonus: 1 },
    ],
    secondaryStats: { ac: 3, hp: 10 },
    resistances: { screentime: 5 },
  },
  {
    id: "guardian-greaves",
    name: "Guardian's Greaves",
    description: "Steel-plated protection for those who show up every day.",
    slot: "legs",
    rarity: "uncommon",
    cost: 0,
    levelReward: 12,
    weight: 2.5,
    material: "Steel",
    statModifiers: [
      { stat: "discipline", flatBonus: 1 },
      { stat: "vitality", flatBonus: 1 },
    ],
    secondaryStats: { ac: 4, hp: 15 },
  },
  {
    id: "mentor-shield",
    name: "Mentor's Shield",
    description: "Carried by those who lift others while standing firm themselves.",
    slot: "secondary",
    rarity: "rare",
    cost: 0,
    levelReward: 16,
    weight: 3.0,
    material: "Reinforced Oak",
    statModifiers: [
      { stat: "charisma", flatBonus: 1 },
      { stat: "spirit", flatBonus: 1 },
    ],
    secondaryStats: { ac: 6, hp: 20, mana: 10 },
    resistances: { substance: 3, screentime: 3, junkfood: 3, badsleep: 3 },
  },
  {
    id: "wayfarer-vestment",
    name: "Wayfarer's Vestment",
    description: "Woven by hands that never stopped creating.",
    slot: "chest",
    rarity: "rare",
    cost: 0,
    levelReward: 20,
    weight: 1.8,
    material: "Enchanted Linen",
    statModifiers: [
      { stat: "craft", flatBonus: 2 },
      { stat: "wealth", flatBonus: 1 },
    ],
    secondaryStats: { ac: 7, hp: 25, mana: 10 },
    focusEffect: {
      name: "Maker's Touch",
      description: "Sharpens creative instincts and craftsmanship.",
      tier: 1,
      modifiers: [
        { stat: "craft", flatBonus: 1 },
      ],
    },
  },
  {
    id: "dreamer-cloak",
    name: "Dreamer's Cloak",
    description: "A flowing cloak that shimmers with every dream you've chased.",
    slot: "robe",
    rarity: "epic",
    cost: 0,
    levelReward: 25,
    overridesSlots: ["chest", "legs"],
    weight: 1.0,
    material: "Dreamweave Silk",
    statModifiers: [
      { stat: "spirit", flatBonus: 2 },
      { stat: "wisdom", flatBonus: 1 },
      { stat: "charisma", flatBonus: 1 },
    ],
    secondaryStats: { ac: 8, hp: 25, mana: 15 },
    resistances: { substance: 8, screentime: 8, junkfood: 8, badsleep: 8 },
    focusEffect: {
      name: "Dreamer's Vision",
      description: "Deepens spiritual awareness and inner clarity.",
      tier: 2,
      modifiers: [
        { stat: "spirit", flatBonus: 1 },
      ],
    },
  },
];

/** Item sets — wearing multiple pieces grants escalating bonuses */
export const ITEM_SETS: ItemSet[] = [
  // No sets in v1 — sets come with catalog expansion in follow-up PRs
];

export function getItemById(id: string): ShopItem | undefined {
  return ITEM_CATALOG.find((item) => item.id === id)
    ?? LEVEL_REWARD_ITEMS.find((item) => item.id === id);
}

/** Get all items that are auto-granted as level-up rewards */
export function getLevelRewardItems(): ShopItem[] {
  return LEVEL_REWARD_ITEMS;
}

export function getItemsBySlot(slot: EquipmentSlot): ShopItem[] {
  return ITEM_CATALOG.filter((item) => item.slot === slot);
}

export function getAffordableItems(balance: number, level: number): ShopItem[] {
  return ITEM_CATALOG.filter(
    (item) => item.cost <= balance && (item.levelRequirement ?? 0) <= level
  );
}

/** Get all item sets */
export function getItemSets(): ItemSet[] {
  return ITEM_SETS;
}

/** Check which sets the player has pieces of, and how many */
export function getActiveSetBonuses(equippedItemIds: string[]): { set: ItemSet; activeCount: number }[] {
  return ITEM_SETS.map((set) => {
    const activeCount = set.itemIds.filter((id) => equippedItemIds.includes(id)).length;
    return { set, activeCount };
  }).filter(({ activeCount }) => activeCount > 0);
}
