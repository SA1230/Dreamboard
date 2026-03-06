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
    thumbnailSrc: "/items/thumbnails/leather-cap.png",
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
    thumbnailSrc: "/items/thumbnails/iron-helm.png",
  },
  {
    id: "cloth-tunic",
    name: "Cloth Tunic",
    description: "Simple but dignified. Every journey starts here.",
    slot: "chest",
    rarity: "common",
    cost: 3,
    svgAssetKey: "cloth-tunic",
    thumbnailSrc: "/items/thumbnails/cloth-tunic.png",
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
    thumbnailSrc: "/items/thumbnails/chain-mail.png",
  },
  {
    id: "wooden-sword",
    name: "Wooden Sword",
    description: "Every warrior begins with wood.",
    slot: "primary",
    rarity: "common",
    cost: 2,
    svgAssetKey: "wooden-sword",
    thumbnailSrc: "/items/thumbnails/wooden-sword.png",
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
    thumbnailSrc: "/items/thumbnails/crystal-staff.png",
  },
  {
    id: "buckler-shield",
    name: "Buckler Shield",
    description: "A small shield. Big on heart.",
    slot: "secondary",
    rarity: "common",
    cost: 3,
    svgAssetKey: "buckler-shield",
    thumbnailSrc: "/items/thumbnails/buckler-shield.png",
  },
  {
    id: "wanderer-boots",
    name: "Wanderer's Boots",
    description: "For those who walk the path daily.",
    slot: "feet",
    rarity: "uncommon",
    cost: 5,
    svgAssetKey: "wanderer-boots",
    thumbnailSrc: "/items/thumbnails/wanderer-boots.png",
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
