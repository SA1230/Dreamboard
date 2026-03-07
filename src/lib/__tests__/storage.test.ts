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
  getTodayString,
  getYesterdayString,
  isHabitCompletedForDate,
  toggleHabitForDate,
  isDamageMarkedForDate,
  toggleDamageForDate,
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
  it("returns empty array when not set (damage is opt-in)", () => {
    const data = makeGameData();
    const enabled = getEnabledDamage(data);
    expect(enabled).toEqual([]);
  });
});

// ─── Date-parameterized functions ───

describe("getTodayString", () => {
  it("returns a YYYY-MM-DD string for today", () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Should match today's local date
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });
});

describe("getYesterdayString", () => {
  it("returns a YYYY-MM-DD string for yesterday", () => {
    const result = getYesterdayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const expected = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    expect(result).toBe(expected);
  });

  it("returns a different date than getTodayString", () => {
    expect(getYesterdayString()).not.toBe(getTodayString());
  });
});

describe("isHabitCompletedForDate", () => {
  it("returns false when no habits exist", () => {
    const data = makeGameData();
    expect(isHabitCompletedForDate(data, "water", "2026-03-05")).toBe(false);
  });

  it("returns true when habit is completed for that date", () => {
    const data = makeGameData({
      healthyHabits: { water: ["2026-03-05"], brush: [], nails: [], nosugar: [], floss: [], steps: [] },
    });
    expect(isHabitCompletedForDate(data, "water", "2026-03-05")).toBe(true);
  });

  it("returns false for a different date", () => {
    const data = makeGameData({
      healthyHabits: { water: ["2026-03-05"], brush: [], nails: [], nosugar: [], floss: [], steps: [] },
    });
    expect(isHabitCompletedForDate(data, "water", "2026-03-06")).toBe(false);
  });
});

describe("toggleHabitForDate", () => {
  it("adds date when habit is not completed", () => {
    const data = makeGameData();
    const result = toggleHabitForDate(data, "water", "2026-03-05");
    expect(result.healthyHabits?.water).toContain("2026-03-05");
  });

  it("removes date when habit is already completed", () => {
    const data = makeGameData({
      healthyHabits: { water: ["2026-03-05"], brush: [], nails: [], nosugar: [], floss: [], steps: [] },
    });
    const result = toggleHabitForDate(data, "water", "2026-03-05");
    expect(result.healthyHabits?.water).not.toContain("2026-03-05");
  });

  it("works with arbitrary date strings", () => {
    const data = makeGameData();
    const result = toggleHabitForDate(data, "brush", "2025-12-31");
    expect(result.healthyHabits?.brush).toContain("2025-12-31");
  });

  it("adds a feed event", () => {
    const data = makeGameData();
    const result = toggleHabitForDate(data, "water", "2026-03-05");
    expect(result.feedEvents?.length).toBe(1);
    expect(result.feedEvents?.[0].type).toBe("habit_completed");
  });
});

describe("isDamageMarkedForDate", () => {
  it("returns false when no damage exists", () => {
    const data = makeGameData();
    expect(isDamageMarkedForDate(data, "substance", "2026-03-05")).toBe(false);
  });

  it("returns true when damage is marked for that date", () => {
    const data = makeGameData({
      dailyDamage: { substance: ["2026-03-05"], screentime: [], junkfood: [], badsleep: [] },
    });
    expect(isDamageMarkedForDate(data, "substance", "2026-03-05")).toBe(true);
  });

  it("returns false for a different date", () => {
    const data = makeGameData({
      dailyDamage: { substance: ["2026-03-05"], screentime: [], junkfood: [], badsleep: [] },
    });
    expect(isDamageMarkedForDate(data, "substance", "2026-03-06")).toBe(false);
  });
});

describe("toggleDamageForDate", () => {
  it("adds date when damage is not marked", () => {
    const data = makeGameData();
    const result = toggleDamageForDate(data, "substance", "2026-03-05");
    expect(result.dailyDamage?.substance).toContain("2026-03-05");
  });

  it("removes date when damage is already marked", () => {
    const data = makeGameData({
      dailyDamage: { substance: ["2026-03-05"], screentime: [], junkfood: [], badsleep: [] },
    });
    const result = toggleDamageForDate(data, "substance", "2026-03-05");
    expect(result.dailyDamage?.substance).not.toContain("2026-03-05");
  });

  it("adds a feed event", () => {
    const data = makeGameData();
    const result = toggleDamageForDate(data, "junkfood", "2026-03-05");
    expect(result.feedEvents?.length).toBe(1);
    expect(result.feedEvents?.[0].type).toBe("damage_marked");
  });
});

// ─── Power Points: no-debt carryover ───

describe("calculateLifetimePoints (floor-at-zero)", () => {
  it("returns 0 when no habits or damage", () => {
    const data = makeGameData();
    expect(calculateLifetimePoints(data)).toBe(0);
  });

  it("counts habits normally when no damage", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02"],
        floss: ["2026-03-01"],
      },
    });
    expect(calculateLifetimePoints(data)).toBe(3);
  });

  it("damage reduces balance but not below zero", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01"],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
        screentime: ["2026-03-01"],
        junkfood: ["2026-03-01"],
      },
    });
    // Day 1: +1 habit, -3 damage = net -2, floored to 0
    expect(calculateLifetimePoints(data)).toBe(0);
  });

  it("does not carry debt to next day", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02"],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
        screentime: ["2026-03-01"],
        junkfood: ["2026-03-01"],
      },
    });
    // Day 1: +1 habit, -3 damage = floored to 0 (no debt)
    // Day 2: +1 habit, 0 damage = balance is 1 (not stuck at 0)
    expect(calculateLifetimePoints(data)).toBe(1);
  });

  it("accumulates across good days", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02", "2026-03-03"],
        floss: ["2026-03-02"],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
      },
    });
    // Day 1: +1 - 1 = 0, balance = 0
    // Day 2: +2 - 0 = +2, balance = 2
    // Day 3: +1 - 0 = +1, balance = 3
    expect(calculateLifetimePoints(data)).toBe(3);
  });
});

describe("getPointsBalance (floor-at-zero)", () => {
  it("balance reflects effective points minus spent", () => {
    const data = makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02", "2026-03-03"],
      },
      dailyDamage: {
        substance: ["2026-03-01"],
      },
      pointsWallet: { lifetimeEarned: 0, lifetimeSpent: 1 },
    });
    // Day 1: +1 -1 = 0. Day 2: +1 = 1. Day 3: +1 = 2.
    // Effective = 2, spent = 1, balance = 1
    const result = getPointsBalance(data);
    expect(result.balance).toBe(1);
    expect(result.lifetimeEarned).toBe(3);
    expect(result.lifetimeDamage).toBe(1);
  });
});
