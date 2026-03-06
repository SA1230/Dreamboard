import { describe, it, expect } from "vitest";
import {
  getXPForNextLevel,
  getOverallLevel,
  getActivitiesByDay,
  getMascotForLevel,
  calculateLifetimePoints,
  getPointsBalance,
  getHabitsByDay,
  getDamageByDay,
  getEnabledHabits,
  getEnabledDamage,
} from "../storage";
import type { GameData, Activity, StatKey } from "../types";
import { STAT_KEYS } from "../stats";

// Mock localStorage so storage.ts doesn't blow up in Node
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

// Helper to build a minimal GameData
function makeGameData(overrides?: Partial<GameData>): GameData {
  const stats = {} as Record<StatKey, { xp: number; level: number }>;
  for (const key of STAT_KEYS) {
    stats[key] = { xp: 0, level: 1 };
  }
  return { stats, activities: [], ...overrides };
}

// Helper to build an Activity
function makeActivity(
  stat: StatKey,
  timestamp: string,
  amount?: number
): Activity {
  return {
    id: crypto.randomUUID(),
    stat,
    note: "test",
    timestamp,
    ...(amount !== undefined ? { amount } : {}),
  };
}

// ─── getXPForNextLevel ───

describe("getXPForNextLevel", () => {
  it("returns first threshold for level 1", () => {
    expect(getXPForNextLevel(1)).toBe(3);
  });

  it("returns correct known thresholds", () => {
    expect(getXPForNextLevel(2)).toBe(5);
    expect(getXPForNextLevel(3)).toBe(8);
    expect(getXPForNextLevel(4)).toBe(13);
    expect(getXPForNextLevel(5)).toBe(21);
  });

  it("returns extrapolated value beyond threshold table", () => {
    // Table has 10 entries. Level 11 is the first beyond.
    // XP_THRESHOLDS[9] = 233, index = 10, formula: 233 + (10 - 10 + 1) * 100 = 333
    expect(getXPForNextLevel(11)).toBe(333);
  });
});

// ─── getOverallLevel ───

describe("getOverallLevel", () => {
  it("returns level 1 with 0 XP", () => {
    const result = getOverallLevel(0);
    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(0);
  });

  it("returns level 1 with partial XP", () => {
    // Level 1 requires getXPRequiredForLevel(1) = round(0.1*1 + 3*1 + 2) = round(5.1) = 5
    const result = getOverallLevel(3);
    expect(result.level).toBe(1);
    expect(result.xpIntoLevel).toBe(3);
    expect(result.xpForNextLevel).toBe(5);
  });

  it("levels up correctly at threshold", () => {
    // 5 XP should put us at level 2 with 0 into next
    const result = getOverallLevel(5);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(0);
  });

  it("caps at level 60", () => {
    const result = getOverallLevel(999999);
    expect(result.level).toBe(60);
    expect(result.xpForNextLevel).toBe(0);
  });
});

// ─── getActivitiesByDay ───

describe("getActivitiesByDay", () => {
  it("returns empty for no activities", () => {
    expect(getActivitiesByDay([], 2026, 2)).toEqual({});
  });

  it("groups activities by day and stat", () => {
    const activities: Activity[] = [
      makeActivity("strength", "2026-03-05T10:00:00Z", 3),
      makeActivity("wisdom", "2026-03-05T14:00:00Z", 2),
      makeActivity("strength", "2026-03-05T18:00:00Z", 1),
      makeActivity("vitality", "2026-03-10T09:00:00Z", 5),
    ];

    const result = getActivitiesByDay(activities, 2026, 2); // month 2 = March
    expect(result[5]).toEqual({ strength: 4, wisdom: 2 });
    expect(result[10]).toEqual({ vitality: 5 });
  });

  it("filters by year and month", () => {
    const activities: Activity[] = [
      makeActivity("strength", "2026-03-15T10:00:00Z"),
      makeActivity("strength", "2026-04-15T10:00:00Z"), // different month
      makeActivity("strength", "2025-03-15T10:00:00Z"), // different year
    ];

    const result = getActivitiesByDay(activities, 2026, 2);
    expect(Object.keys(result)).toEqual(["15"]);
  });

  it("defaults amount to 1 for legacy activities", () => {
    const activities: Activity[] = [
      makeActivity("charisma", "2026-03-01T10:00:00Z"), // no amount
    ];

    const result = getActivitiesByDay(activities, 2026, 2);
    expect(result[1]).toEqual({ charisma: 1 });
  });
});

// ─── getHabitsByDay / getDamageByDay ───

describe("getHabitsByDay", () => {
  it("returns empty for no habits", () => {
    const data = makeGameData();
    expect(getHabitsByDay(data, 2026, 2)).toEqual({});
  });

  it("groups habits by day", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-05", "2026-03-10"],
        brush: ["2026-03-05"],
        nails: [],
        nosugar: [],
        floss: [],
        steps: [],
      },
    });

    const result = getHabitsByDay(data, 2026, 2);
    expect(result[5]).toContain("water");
    expect(result[5]).toContain("brush");
    expect(result[10]).toEqual(["water"]);
  });
});

describe("getDamageByDay", () => {
  it("returns empty for no damage", () => {
    const data = makeGameData();
    expect(getDamageByDay(data, 2026, 2)).toEqual({});
  });

  it("groups damage by day", () => {
    const data = makeGameData({
      dailyDamage: {
        substance: ["2026-03-01"],
        screentime: ["2026-03-01", "2026-03-15"],
        junkfood: [],
        badsleep: [],
      },
    });

    const result = getDamageByDay(data, 2026, 2);
    expect(result[1]).toContain("substance");
    expect(result[1]).toContain("screentime");
    expect(result[15]).toEqual(["screentime"]);
  });
});

// ─── getMascotForLevel ───

describe("getMascotForLevel", () => {
  it("returns default with no overrides", () => {
    expect(getMascotForLevel(5)).toBe("/mascots/skipper-default.svg");
  });

  it("returns default with empty overrides", () => {
    expect(getMascotForLevel(5, {})).toBe("/mascots/skipper-default.svg");
  });

  it("picks highest threshold below current level", () => {
    const overrides = { 1: "basic.svg", 10: "cool.svg", 20: "epic.svg" };
    expect(getMascotForLevel(15, overrides)).toBe("/mascots/cool.svg");
    expect(getMascotForLevel(25, overrides)).toBe("/mascots/epic.svg");
    expect(getMascotForLevel(10, overrides)).toBe("/mascots/cool.svg");
  });

  it("returns default if level is below all thresholds", () => {
    const overrides = { 5: "mid.svg" };
    expect(getMascotForLevel(3, overrides)).toBe("/mascots/skipper-default.svg");
  });
});

// ─── Points system ───

describe("calculateLifetimePoints", () => {
  it("returns 0 for empty data", () => {
    expect(calculateLifetimePoints(makeGameData())).toBe(0);
  });

  it("counts habit completions minus damage", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02", "2026-03-03"],
        brush: ["2026-03-01"],
        nails: [],
        nosugar: [],
        floss: [],
        steps: [],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
        screentime: [],
        junkfood: [],
        badsleep: [],
      },
    });

    // 4 habit completions - 1 damage = 3
    expect(calculateLifetimePoints(data)).toBe(3);
  });

  it("floors at 0 when damage exceeds habits", () => {
    const data = makeGameData({
      dailyDamage: {
        substance: ["2026-03-01", "2026-03-02"],
        screentime: [],
        junkfood: [],
        badsleep: [],
      },
    });

    expect(calculateLifetimePoints(data)).toBe(0);
  });
});

describe("getPointsBalance", () => {
  it("subtracts spent from earned minus damage", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05"],
        brush: [],
        nails: [],
        nosugar: [],
        floss: [],
        steps: [],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
        screentime: [],
        junkfood: [],
        badsleep: [],
      },
      pointsWallet: { lifetimeEarned: 0, lifetimeSpent: 2 },
    });

    const balance = getPointsBalance(data);
    expect(balance.lifetimeEarned).toBe(5);
    expect(balance.lifetimeDamage).toBe(1);
    expect(balance.lifetimeSpent).toBe(2);
    expect(balance.balance).toBe(2); // 5 - 1 - 2
  });
});

// ─── getEnabledHabits / getEnabledDamage defaults ───

describe("getEnabledHabits", () => {
  it("returns defaults when not set", () => {
    const data = makeGameData();
    const enabled = getEnabledHabits(data);
    expect(enabled).toContain("water");
    expect(enabled).toContain("brush");
    expect(enabled.length).toBeGreaterThan(0);
  });

  it("returns custom list when set", () => {
    const data = makeGameData({ enabledHabits: ["water", "floss"] });
    expect(getEnabledHabits(data)).toEqual(["water", "floss"]);
  });
});

describe("getEnabledDamage", () => {
  it("returns all 4 defaults when not set", () => {
    const data = makeGameData();
    const enabled = getEnabledDamage(data);
    expect(enabled).toEqual(["substance", "screentime", "junkfood", "badsleep"]);
  });
});
