import { describe, it, expect } from "vitest";
import { getItemById, getItemsBySlot, getAffordableItems, ITEM_CATALOG } from "../items";

// ─── getItemById ───

describe("getItemById", () => {
  it("returns an item that exists", () => {
    const item = getItemById("wooden-sword");
    expect(item).toBeDefined();
    expect(item!.name).toBe("Wooden Sword");
    expect(item!.slot).toBe("primary");
  });

  it("returns undefined for non-existent ID", () => {
    expect(getItemById("nonexistent")).toBeUndefined();
  });

  it("returns correct cost and rarity", () => {
    const item = getItemById("leather-cap");
    expect(item).toBeDefined();
    expect(item!.cost).toBe(3);
    expect(item!.rarity).toBe("common");
  });
});

// ─── getItemsBySlot ───

describe("getItemsBySlot", () => {
  it("returns items for a populated slot", () => {
    const headItems = getItemsBySlot("head");
    expect(headItems.length).toBeGreaterThan(0);
    for (const item of headItems) {
      expect(item.slot).toBe("head");
    }
  });

  it("returns empty array for a slot with no items", () => {
    // ring1 is a hidden slot with no items in the catalog
    const items = getItemsBySlot("ring1");
    expect(items).toEqual([]);
  });

  it("returns multiple items for primary slot", () => {
    const primaryItems = getItemsBySlot("primary");
    expect(primaryItems.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── getAffordableItems ───

describe("getAffordableItems", () => {
  it("returns items within budget and level", () => {
    // wooden-sword costs 2, no level req
    const items = getAffordableItems(2, 1);
    const ids = items.map((i) => i.id);
    expect(ids).toContain("wooden-sword");
  });

  it("excludes items over budget", () => {
    const items = getAffordableItems(1, 1); // 1 PP — wooden-sword costs 2
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("wooden-sword");
  });

  it("excludes items above level requirement", () => {
    // iron-helm costs 8, requires level 5
    const items = getAffordableItems(100, 1);
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("iron-helm");
  });

  it("includes level-gated items when level is met", () => {
    const items = getAffordableItems(100, 10);
    const ids = items.map((i) => i.id);
    expect(ids).toContain("iron-helm"); // requires level 5
  });

  it("returns empty array with 0 balance", () => {
    const items = getAffordableItems(0, 1);
    expect(items).toEqual([]);
  });
});

// ─── ITEM_CATALOG consistency ───

describe("ITEM_CATALOG", () => {
  it("all items have required fields", () => {
    for (const item of ITEM_CATALOG) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.slot).toBeTruthy();
      expect(item.rarity).toBeTruthy();
      expect(item.cost).toBeGreaterThan(0);
    }
  });

  it("all item IDs are unique", () => {
    const ids = ITEM_CATALOG.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
