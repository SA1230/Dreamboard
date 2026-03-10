import { describe, it, expect } from "vitest";
import {
  getEquippedBonuses,
  applyEquipmentBonus,
  addXP,
} from "../storage";
import type { GameData, StatKey, EquipmentBonuses } from "../types";
import { STAT_KEYS } from "../stats";
import {
  getItemById,
  ITEM_CATALOG,
  SECONDARY_STAT_LABELS,
  RESIST_LABELS,
} from "../items";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

function makeGameData(overrides?: Partial<GameData>): GameData {
  const stats = {} as Record<StatKey, { xp: number; level: number }>;
  for (const key of STAT_KEYS) {
    stats[key] = { xp: 0, level: 1 };
  }
  return { stats, activities: [], ...overrides };
}

// ─── getEquippedBonuses ───

describe("getEquippedBonuses", () => {
  it("returns empty bonuses when no items are equipped", () => {
    const data = makeGameData();
    const bonuses = getEquippedBonuses(data);
    expect(Object.keys(bonuses.statModifiers)).toHaveLength(0);
    expect(Object.keys(bonuses.secondaryStats)).toHaveLength(0);
    expect(Object.keys(bonuses.resistances)).toHaveLength(0);
  });

  it("returns empty bonuses when inventory exists but nothing equipped", () => {
    const data = makeGameData({
      inventory: { ownedItemIds: ["wooden-sword"], equippedItems: {} },
    });
    const bonuses = getEquippedBonuses(data);
    expect(Object.keys(bonuses.statModifiers)).toHaveLength(0);
  });

  it("aggregates stat modifiers from a single equipped item", () => {
    // iron-helm: +1 discipline flat
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["iron-helm"],
        equippedItems: { head: "iron-helm" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(bonuses.statModifiers.discipline).toBeDefined();
    expect(bonuses.statModifiers.discipline!.flatBonus).toBe(1);
  });

  it("aggregates secondary stats from equipped item", () => {
    // iron-helm: ac: 3, hp: 10
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["iron-helm"],
        equippedItems: { head: "iron-helm" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(bonuses.secondaryStats.ac).toBe(3);
    expect(bonuses.secondaryStats.hp).toBe(10);
  });

  it("aggregates resistances from equipped item", () => {
    // iron-helm has resistances
    const item = getItemById("iron-helm");
    if (item?.resistances) {
      const data = makeGameData({
        inventory: {
          ownedItemIds: ["iron-helm"],
          equippedItems: { head: "iron-helm" },
        },
      });
      const bonuses = getEquippedBonuses(data);
      for (const [key, value] of Object.entries(item.resistances)) {
        if (value) {
          expect((bonuses.resistances as Record<string, number>)[key]).toBe(value);
        }
      }
    }
  });

  it("stacks flat bonuses from multiple equipped items", () => {
    // chain-mail: +1 strength, +1 vitality
    // iron-helm: +1 discipline
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["chain-mail", "iron-helm"],
        equippedItems: { chest: "chain-mail", head: "iron-helm" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(bonuses.statModifiers.strength?.flatBonus).toBe(1);
    expect(bonuses.statModifiers.vitality?.flatBonus).toBe(1);
    expect(bonuses.statModifiers.discipline?.flatBonus).toBe(1);
  });

  it("stacks flat bonuses for same stat across items", () => {
    // plate-greaves: +2 strength
    // chain-mail: +1 strength, +1 vitality
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["plate-greaves", "chain-mail"],
        equippedItems: { legs: "plate-greaves", chest: "chain-mail" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(bonuses.statModifiers.strength?.flatBonus).toBe(3); // 2 + 1
  });

  it("includes focus effect modifiers stacked with stat modifiers", () => {
    // crystal-staff: statMods: +2 wisdom, +1 craft
    //   focusEffect: Arcane Clarity, +1 wisdom
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["crystal-staff"],
        equippedItems: { primary: "crystal-staff" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    // wisdom: +2 (statMod) + 1 (focusEffect) = +3
    expect(bonuses.statModifiers.wisdom?.flatBonus).toBe(3);
    // craft: +1 (statMod only)
    expect(bonuses.statModifiers.craft?.flatBonus).toBe(1);
  });

  it("stacks focus effect with stat modifiers from wanderer-robe", () => {
    // wanderer-robe: statMods: +1 spirit, +1 wisdom
    //   focusEffect: Wanderer's Resolve, +1 spirit
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["wanderer-robe"],
        equippedItems: { robe: "wanderer-robe" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    // spirit: +1 (statMod) + 1 (focusEffect) = +2
    expect(bonuses.statModifiers.spirit?.flatBonus).toBe(2);
    // wisdom: +1 (statMod only)
    expect(bonuses.statModifiers.wisdom?.flatBonus).toBe(1);
  });

  it("stacks secondary stats across multiple items", () => {
    // iron-helm: ac: 3, hp: 10
    // chain-mail: ac: 8, hp: 20, damageShield: 1
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["iron-helm", "chain-mail"],
        equippedItems: { head: "iron-helm", chest: "chain-mail" },
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(bonuses.secondaryStats.ac).toBe(11); // 3 + 8
    expect(bonuses.secondaryStats.hp).toBe(30); // 10 + 20
  });

  it("ignores items that are not in ITEM_CATALOG", () => {
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["fake-item"],
        equippedItems: { head: "fake-item" } as Record<string, string>,
      },
    });
    const bonuses = getEquippedBonuses(data);
    expect(Object.keys(bonuses.statModifiers)).toHaveLength(0);
  });
});

// ─── applyEquipmentBonus ───

describe("applyEquipmentBonus", () => {
  it("returns base amount when no bonus exists for the stat", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: {},
      secondaryStats: {},
      resistances: {},
    };
    expect(applyEquipmentBonus(5, "strength", bonuses)).toBe(5);
  });

  it("applies flat bonus", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: { strength: { flatBonus: 2 } },
      secondaryStats: {},
      resistances: {},
    };
    // base 5 + flat 2 = 7
    expect(applyEquipmentBonus(5, "strength", bonuses)).toBe(7);
  });

  it("handles large flat bonuses correctly", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: { strength: { flatBonus: 5 } },
      secondaryStats: {},
      resistances: {},
    };
    // base 3 + flat 5 = 8
    expect(applyEquipmentBonus(3, "strength", bonuses)).toBe(8);
  });

  it("never reduces XP below base amount", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: { strength: { flatBonus: -3 } },
      secondaryStats: {},
      resistances: {},
    };
    // base 5 + flat -3 = 2, but floor at base 5
    expect(applyEquipmentBonus(5, "strength", bonuses)).toBe(5);
  });

  it("returns base amount for zero bonus", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: { strength: { flatBonus: 0 } },
      secondaryStats: {},
      resistances: {},
    };
    expect(applyEquipmentBonus(5, "strength", bonuses)).toBe(5);
  });

  it("does not apply bonus from unrelated stat", () => {
    const bonuses: EquipmentBonuses = {
      statModifiers: { wisdom: { flatBonus: 3 } },
      secondaryStats: {},
      resistances: {},
    };
    expect(applyEquipmentBonus(5, "strength", bonuses)).toBe(5);
  });
});

// ─── addXP with equipment bonuses ───

describe("addXP with equipment bonuses", () => {
  it("boosts XP when items with matching stat are equipped", () => {
    // chain-mail: +1 strength flat
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["chain-mail"],
        equippedItems: { chest: "chain-mail" },
      },
    });
    const { newData } = addXP(data, "strength", "test", 5);
    // 5 + 1 = 6
    expect(newData.activities[0].amount).toBe(6);
  });

  it("does not boost XP for unrelated stats", () => {
    // chain-mail: strength + vitality bonuses only
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["chain-mail"],
        equippedItems: { chest: "chain-mail" },
      },
    });
    const { newData } = addXP(data, "charisma", "test", 5);
    // No charisma bonuses from chain-mail → stays at 5
    expect(newData.activities[0].amount).toBe(5);
  });

  it("applies base amount when no items equipped", () => {
    const data = makeGameData();
    const { newData } = addXP(data, "strength", "test", 3);
    expect(newData.activities[0].amount).toBe(3);
  });

  it("stores boosted amount in feed events", () => {
    // chain-mail: +1 strength flat
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["chain-mail"],
        equippedItems: { chest: "chain-mail" },
      },
    });
    const { newData } = addXP(data, "strength", "test", 5);
    // Find xp_gain event among feed events (may not be first due to level-up events)
    const xpEvent = newData.feedEvents?.find((e) => e.type === "xp_gain");
    expect(xpEvent).toBeDefined();
    if (xpEvent?.type === "xp_gain") {
      expect(xpEvent.amount).toBe(6); // boosted
    }
  });

  it("applies stacked flat bonuses from multiple items", () => {
    // chain-mail: +1 strength, plate-greaves: +2 strength
    const data = makeGameData({
      inventory: {
        ownedItemIds: ["chain-mail", "plate-greaves"],
        equippedItems: { chest: "chain-mail", legs: "plate-greaves" },
      },
    });
    const { newData } = addXP(data, "strength", "test", 5);
    // 5 + 1 + 2 = 8
    expect(newData.activities[0].amount).toBe(8);
  });
});

// ─── Item EQ properties validation ───

describe("item EQ properties", () => {
  it("wooden-sword has weaponStats", () => {
    const item = getItemById("wooden-sword");
    expect(item?.weaponStats).toBeDefined();
    expect(item?.weaponStats?.damage).toBeGreaterThan(0);
    expect(item?.weaponStats?.delay).toBeGreaterThan(0);
  });

  it("crystal-staff has focusEffect with modifiers", () => {
    const item = getItemById("crystal-staff");
    expect(item?.focusEffect).toBeDefined();
    expect(item?.focusEffect?.name).toBe("Arcane Clarity");
    expect(item?.focusEffect?.modifiers.length).toBeGreaterThan(0);
  });

  it("all items have weight and material", () => {
    for (const item of ITEM_CATALOG) {
      expect(item.weight).toBeDefined();
      expect(typeof item.weight).toBe("number");
      expect(item.material).toBeDefined();
      expect(typeof item.material).toBe("string");
    }
  });

  it("only primary/secondary weapons have weaponStats", () => {
    for (const item of ITEM_CATALOG) {
      if (item.weaponStats) {
        expect(["primary", "secondary"]).toContain(item.slot);
      }
    }
  });

  it("SECONDARY_STAT_LABELS covers common stats", () => {
    expect(SECONDARY_STAT_LABELS.ac).toBeDefined();
    expect(SECONDARY_STAT_LABELS.hp).toBeDefined();
    expect(SECONDARY_STAT_LABELS.mana).toBeDefined();
    expect(SECONDARY_STAT_LABELS.haste).toBeDefined();
  });

  it("RESIST_LABELS covers all 4 damage types", () => {
    expect(RESIST_LABELS.substance).toBeDefined();
    expect(RESIST_LABELS.screentime).toBeDefined();
    expect(RESIST_LABELS.junkfood).toBeDefined();
    expect(RESIST_LABELS.badsleep).toBeDefined();
  });

  it("all stat modifiers use flat bonuses only", () => {
    for (const item of ITEM_CATALOG) {
      if (item.statModifiers) {
        for (const mod of item.statModifiers) {
          expect(typeof mod.flatBonus).toBe("number");
          expect((mod as Record<string, unknown>).percentBonus).toBeUndefined();
        }
      }
    }
  });
});
