import { describe, it, expect } from "vitest";
import {
  ITEM_CATALOG,
  RARITY_COLORS,
  VISIBLE_SLOTS,
  getItemById,
  getItemsBySlot,
  getAffordableItems,
} from "../items";

// ─── ITEM_CATALOG constants ───

describe("ITEM_CATALOG", () => {
  it("has at least one item", () => {
    expect(ITEM_CATALOG.length).toBeGreaterThan(0);
  });

  it("every item has required fields", () => {
    for (const item of ITEM_CATALOG) {
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.name).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(typeof item.slot).toBe("string");
      expect(typeof item.rarity).toBe("string");
      expect(typeof item.cost).toBe("number");
      expect(item.cost).toBeGreaterThan(0);
    }
  });

  it("all item IDs are unique", () => {
    const ids = ITEM_CATALOG.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all rarities are valid", () => {
    const validRarities = ["common", "uncommon", "rare", "epic", "legendary"];
    for (const item of ITEM_CATALOG) {
      expect(validRarities).toContain(item.rarity);
    }
  });
});

describe("RARITY_COLORS", () => {
  it("has entries for all 5 rarities", () => {
    const rarities = ["common", "uncommon", "rare", "epic", "legendary"] as const;
    for (const rarity of rarities) {
      expect(RARITY_COLORS[rarity]).toBeDefined();
      expect(RARITY_COLORS[rarity].text).toBeDefined();
      expect(RARITY_COLORS[rarity].background).toBeDefined();
      expect(RARITY_COLORS[rarity].border).toBeDefined();
    }
  });
});

describe("VISIBLE_SLOTS", () => {
  it("has 8 visible slots", () => {
    expect(VISIBLE_SLOTS.length).toBe(8);
  });

  it("includes head, chest, legs, robe, hands, feet, primary, secondary", () => {
    const slotNames = VISIBLE_SLOTS.map((s) => s.slot);
    expect(slotNames).toContain("head");
    expect(slotNames).toContain("chest");
    expect(slotNames).toContain("legs");
    expect(slotNames).toContain("robe");
    expect(slotNames).toContain("hands");
    expect(slotNames).toContain("feet");
    expect(slotNames).toContain("primary");
    expect(slotNames).toContain("secondary");
  });
});

// ─── getItemById ───

describe("getItemById", () => {
  it("returns the correct item for a known ID", () => {
    const item = getItemById("wooden-sword");
    expect(item).toBeDefined();
    expect(item!.name).toBe("Wooden Sword");
    expect(item!.slot).toBe("primary");
    expect(item!.rarity).toBe("common");
    expect(item!.cost).toBe(2);
  });

  it("returns undefined for a non-existent ID", () => {
    expect(getItemById("nonexistent-item")).toBeUndefined();
  });

  it("returns undefined for an empty string", () => {
    expect(getItemById("")).toBeUndefined();
  });

  it("finds each item in the catalog", () => {
    for (const item of ITEM_CATALOG) {
      const found = getItemById(item.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(item.id);
    }
  });

  it("returns item with levelRequirement when it has one", () => {
    const item = getItemById("iron-helm");
    expect(item).toBeDefined();
    expect(item!.levelRequirement).toBe(5);
  });

  it("returns item without levelRequirement when it has none", () => {
    const item = getItemById("leather-cap");
    expect(item).toBeDefined();
    expect(item!.levelRequirement).toBeUndefined();
  });

  it("returns item with overridesSlots when it has them", () => {
    const item = getItemById("wanderer-robe");
    expect(item).toBeDefined();
    expect(item!.overridesSlots).toEqual(["chest", "legs"]);
  });
});

// ─── getItemsBySlot ───

describe("getItemsBySlot", () => {
  it("returns items matching the given slot", () => {
    const headItems = getItemsBySlot("head");
    expect(headItems.length).toBeGreaterThan(0);
    for (const item of headItems) {
      expect(item.slot).toBe("head");
    }
  });

  it("returns multiple items for a slot with several options", () => {
    const primaryItems = getItemsBySlot("primary");
    expect(primaryItems.length).toBe(2); // wooden-sword and crystal-staff
  });

  it("returns empty array for a slot with no items", () => {
    // Hidden slots have no items in the current catalog
    const ringItems = getItemsBySlot("ring1");
    expect(ringItems).toEqual([]);
  });

  it("returns correct items for chest slot", () => {
    const chestItems = getItemsBySlot("chest");
    expect(chestItems.length).toBe(2); // cloth-tunic and chain-mail
    const ids = chestItems.map((i) => i.id);
    expect(ids).toContain("cloth-tunic");
    expect(ids).toContain("chain-mail");
  });

  it("returns correct items for feet slot", () => {
    const feetItems = getItemsBySlot("feet");
    expect(feetItems.length).toBe(1);
    expect(feetItems[0].id).toBe("wanderer-boots");
  });

  it("returns correct items for hands slot", () => {
    const handsItems = getItemsBySlot("hands");
    expect(handsItems.length).toBe(2);
    const ids = handsItems.map((i) => i.id);
    expect(ids).toContain("leather-gloves");
    expect(ids).toContain("iron-gauntlets");
  });

  it("returns correct items for robe slot", () => {
    const robeItems = getItemsBySlot("robe");
    expect(robeItems.length).toBe(1);
    expect(robeItems[0].id).toBe("wanderer-robe");
  });
});

// ─── getAffordableItems ───

describe("getAffordableItems", () => {
  it("returns items the player can afford at their level", () => {
    // Balance of 100, level 20 — should get all items
    const items = getAffordableItems(100, 20);
    expect(items.length).toBe(ITEM_CATALOG.length);
  });

  it("filters out items that cost more than balance", () => {
    // Balance of 2 — only items costing <= 2
    const items = getAffordableItems(2, 60);
    for (const item of items) {
      expect(item.cost).toBeLessThanOrEqual(2);
    }
    // Should include wooden-sword (2) and leather-gloves (2)
    const ids = items.map((i) => i.id);
    expect(ids).toContain("wooden-sword");
    expect(ids).toContain("leather-gloves");
  });

  it("filters out items above the player level", () => {
    // Level 1 should exclude items with levelRequirement > 1
    const items = getAffordableItems(1000, 1);
    for (const item of items) {
      expect(item.levelRequirement ?? 0).toBeLessThanOrEqual(1);
    }
    // Should not include iron-helm (requires level 5)
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("iron-helm");
    // Should include leather-cap (no level requirement)
    expect(ids).toContain("leather-cap");
  });

  it("returns empty array when balance is 0", () => {
    const items = getAffordableItems(0, 60);
    expect(items).toEqual([]);
  });

  it("returns empty array when balance is negative", () => {
    const items = getAffordableItems(-5, 60);
    expect(items).toEqual([]);
  });

  it("includes items with no levelRequirement at any level", () => {
    const items = getAffordableItems(100, 1);
    const noLevelReqItems = ITEM_CATALOG.filter((i) => !i.levelRequirement);
    for (const item of noLevelReqItems) {
      if (item.cost <= 100) {
        expect(items.map((i) => i.id)).toContain(item.id);
      }
    }
  });

  it("includes item at exact cost and level threshold", () => {
    // iron-helm: cost 8, levelRequirement 5
    const items = getAffordableItems(8, 5);
    const ids = items.map((i) => i.id);
    expect(ids).toContain("iron-helm");
  });

  it("excludes item one below cost threshold", () => {
    // iron-helm costs 8, try with balance 7
    const items = getAffordableItems(7, 5);
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("iron-helm");
  });

  it("excludes item one below level threshold", () => {
    // iron-helm requires level 5, try with level 4
    const items = getAffordableItems(100, 4);
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("iron-helm");
  });
});
