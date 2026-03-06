import { ShopItem, ItemRarity, EquipmentSlot, VisibleSlot } from "./types";

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

/**
 * Starter item catalog — placeholder items for Phase 1.
 * svgAssetKey maps to the registry in itemSvgs.ts.
 * thumbnailSrc will use placeholder colors until real art is generated.
 */
export const ITEM_CATALOG: ShopItem[] = [
  {
    id: "leather-cap",
    name: "Leather Cap",
    description: "A sturdy cap for aspiring adventurers.",
    slot: "head",
    rarity: "common",
    cost: 3,
    svgAssetKey: "leather-cap",
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
  },
  {
    id: "cloth-tunic",
    name: "Cloth Tunic",
    description: "Simple but dignified. Every journey starts here.",
    slot: "chest",
    rarity: "common",
    cost: 3,
    svgAssetKey: "cloth-tunic",
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
  },
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    description: "Every warrior begins with wood.",
    slot: "primary",
    rarity: "common",
    cost: 2,
    svgAssetKey: "wooden-sword",
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
  },
  {
    id: "buckler-shield",
    name: "Buckler Shield",
    description: "A small shield. Big on heart.",
    slot: "secondary",
    rarity: "common",
    cost: 3,
    svgAssetKey: "buckler-shield",
  },
  {
    id: "wanderer-boots",
    name: "Wanderer's Boots",
    description: "For those who walk the path daily.",
    slot: "feet",
    rarity: "uncommon",
    cost: 5,
    svgAssetKey: "wanderer-boots",
  },
  {
    id: "cloth-pants",
    name: "Cloth Pants",
    description: "Humble legwear for the first steps of any quest.",
    slot: "legs",
    rarity: "common",
    cost: 3,
    svgAssetKey: "cloth-pants",
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
  },
  {
    id: "leather-gloves",
    name: "Leather Gloves",
    description: "Keeps your flippers warm and your grip steady.",
    slot: "hands",
    rarity: "common",
    cost: 2,
    svgAssetKey: "leather-gloves",
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
  },
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
  },
];

export function getItemById(id: string): ShopItem | undefined {
  return ITEM_CATALOG.find((item) => item.id === id);
}

export function getItemsBySlot(slot: EquipmentSlot): ShopItem[] {
  return ITEM_CATALOG.filter((item) => item.slot === slot);
}

export function getAffordableItems(balance: number, level: number): ShopItem[] {
  return ITEM_CATALOG.filter(
    (item) => item.cost <= balance && (item.levelRequirement ?? 0) <= level
  );
}
