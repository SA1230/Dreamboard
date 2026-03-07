import { describe, it, expect } from "vitest";
import {
  getStatStreaks,
  getMonthlyXPTotals,
  getPrizes,
  addPrize,
  updatePrize,
  deletePrize,
  checkPrizeUnlocks,
} from "../storage";
import type { GameData, Activity, StatKey, Prize, FeedEvent } from "../types";
import { STAT_KEYS } from "../stats";
import { MAX_USER_PRIZES } from "../prizes";

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

// Helper to build a Prize
function makePrize(overrides?: Partial<Prize>): Prize {
  return {
    id: crypto.randomUUID(),
    name: "Test Prize",
    unlockLevel: 5,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ─── getStatStreaks ───

describe("getStatStreaks", () => {
  it("returns 0 for all stats when no activities", () => {
    const streaks = getStatStreaks([]);
    for (const key of STAT_KEYS) {
      expect(streaks[key]).toBe(0);
    }
  });

  it("returns 0 for stats with no activities", () => {
    const activities = [
      makeActivity("strength", "2026-03-05T10:00:00Z"),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.wisdom).toBe(0);
    expect(streaks.vitality).toBe(0);
    expect(streaks.charisma).toBe(0);
  });

  it("counts a single day of activity today as streak of 1", () => {
    // getStatStreaks uses: new Date() → setHours(0,0,0,0) → toISOString().split("T")[0]
    // We must match that exact approach to get the "today" string it expects.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];
    const activities = [
      makeActivity("strength", `${todayString}T10:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.strength).toBe(1);
  });

  it("counts consecutive days ending today", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    const activities = [
      makeActivity("strength", `${today.toISOString().split("T")[0]}T10:00:00Z`),
      makeActivity("strength", `${yesterday.toISOString().split("T")[0]}T10:00:00Z`),
      makeActivity("strength", `${dayBefore.toISOString().split("T")[0]}T10:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.strength).toBe(3);
  });

  it("allows streak to continue from yesterday if no activity today", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    const activities = [
      makeActivity("wisdom", `${yesterday.toISOString().split("T")[0]}T10:00:00Z`),
      makeActivity("wisdom", `${dayBefore.toISOString().split("T")[0]}T10:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.wisdom).toBe(2);
  });

  it("returns 0 if no activity today or yesterday", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const activities = [
      makeActivity("strength", `${twoDaysAgo.toISOString().split("T")[0]}T10:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.strength).toBe(0);
  });

  it("handles multiple activities on the same day as one streak day", () => {
    // Match getStatStreaks internal date computation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split("T")[0];
    const activities = [
      makeActivity("craft", `${todayString}T08:00:00Z`),
      makeActivity("craft", `${todayString}T12:00:00Z`),
      makeActivity("craft", `${todayString}T18:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.craft).toBe(1);
  });

  it("tracks streaks independently per stat", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = today.toISOString().split("T")[0];
    const yesterdayString = yesterday.toISOString().split("T")[0];

    const activities = [
      makeActivity("strength", `${todayString}T10:00:00Z`),
      makeActivity("strength", `${yesterdayString}T10:00:00Z`),
      makeActivity("wisdom", `${todayString}T10:00:00Z`),
    ];
    const streaks = getStatStreaks(activities);
    expect(streaks.strength).toBe(2);
    expect(streaks.wisdom).toBe(1);
  });
});

// ─── getMonthlyXPTotals ───

describe("getMonthlyXPTotals", () => {
  it("returns 0 for both months when no activities", () => {
    const totals = getMonthlyXPTotals([]);
    expect(totals.currentMonthXP).toBe(0);
    expect(totals.lastMonthXP).toBe(0);
  });

  it("counts activities in the current month", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const activities = [
      makeActivity("strength", `${year}-${month}-05T10:00:00Z`, 3),
      makeActivity("wisdom", `${year}-${month}-10T10:00:00Z`, 5),
    ];
    const totals = getMonthlyXPTotals(activities);
    expect(totals.currentMonthXP).toBe(8);
  });

  it("counts activities in last month", () => {
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const year = lastMonthDate.getFullYear();
    const month = String(lastMonthDate.getMonth() + 1).padStart(2, "0");

    const activities = [
      makeActivity("strength", `${year}-${month}-05T10:00:00Z`, 2),
      makeActivity("wisdom", `${year}-${month}-15T10:00:00Z`, 4),
    ];
    const totals = getMonthlyXPTotals(activities);
    expect(totals.lastMonthXP).toBe(6);
  });

  it("excludes activities from two months ago", () => {
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const year = twoMonthsAgo.getFullYear();
    const month = String(twoMonthsAgo.getMonth() + 1).padStart(2, "0");

    const activities = [
      makeActivity("strength", `${year}-${month}-05T10:00:00Z`, 10),
    ];
    const totals = getMonthlyXPTotals(activities);
    expect(totals.currentMonthXP).toBe(0);
    expect(totals.lastMonthXP).toBe(0);
  });

  it("defaults amount to 1 for legacy activities", () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const activities = [
      makeActivity("charisma", `${year}-${month}-01T10:00:00Z`), // no amount
    ];
    const totals = getMonthlyXPTotals(activities);
    expect(totals.currentMonthXP).toBe(1);
  });

  it("separates current and last month correctly", () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    const lastMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
    const lastYear = lastMonthDate.getFullYear();
    const lastMonth = String(lastMonthDate.getMonth() + 1).padStart(2, "0");

    const activities = [
      makeActivity("strength", `${currentYear}-${currentMonth}-05T10:00:00Z`, 3),
      makeActivity("wisdom", `${lastYear}-${lastMonth}-15T10:00:00Z`, 7),
    ];
    const totals = getMonthlyXPTotals(activities);
    expect(totals.currentMonthXP).toBe(3);
    expect(totals.lastMonthXP).toBe(7);
  });
});

// ─── getPrizes ───

describe("getPrizes", () => {
  it("returns empty array when no prizes exist", () => {
    const data = makeGameData();
    expect(getPrizes(data)).toEqual([]);
  });

  it("returns prizes sorted by unlockLevel ascending", () => {
    const prize1 = makePrize({ unlockLevel: 10, name: "Prize A" });
    const prize2 = makePrize({ unlockLevel: 5, name: "Prize B" });
    const prize3 = makePrize({ unlockLevel: 15, name: "Prize C" });
    const data = makeGameData({ prizes: [prize1, prize2, prize3] });

    const result = getPrizes(data);
    expect(result[0].unlockLevel).toBe(5);
    expect(result[1].unlockLevel).toBe(10);
    expect(result[2].unlockLevel).toBe(15);
  });

  it("does not mutate the original prizes array", () => {
    const prize1 = makePrize({ unlockLevel: 10 });
    const prize2 = makePrize({ unlockLevel: 5 });
    const data = makeGameData({ prizes: [prize1, prize2] });
    const originalOrder = [...data.prizes!];

    getPrizes(data);
    expect(data.prizes![0].id).toBe(originalOrder[0].id);
    expect(data.prizes![1].id).toBe(originalOrder[1].id);
  });

  it("handles single prize", () => {
    const prize = makePrize({ unlockLevel: 3 });
    const data = makeGameData({ prizes: [prize] });
    const result = getPrizes(data);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(prize.id);
  });
});

// ─── addPrize ───

describe("addPrize", () => {
  it("adds a prize to empty prizes list", () => {
    const data = makeGameData();
    const result = addPrize(data, "New Phone", 10);
    expect(result).not.toBeNull();
    expect(result!.prizes!.length).toBe(1);
    expect(result!.prizes![0].name).toBe("New Phone");
    expect(result!.prizes![0].unlockLevel).toBe(10);
  });

  it("adds a prize with a link", () => {
    const data = makeGameData();
    const result = addPrize(data, "Headphones", 15, "https://example.com/headphones");
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBe("https://example.com/headphones");
  });

  it("trims the name to 60 characters", () => {
    const data = makeGameData();
    const longName = "A".repeat(100);
    const result = addPrize(data, longName, 5);
    expect(result).not.toBeNull();
    expect(result!.prizes![0].name.length).toBe(60);
  });

  it("trims whitespace from name", () => {
    const data = makeGameData();
    const result = addPrize(data, "  Spaced Name  ", 5);
    expect(result).not.toBeNull();
    expect(result!.prizes![0].name).toBe("Spaced Name");
  });

  it("clamps unlockLevel to minimum of 1", () => {
    const data = makeGameData();
    const result = addPrize(data, "Prize", 0);
    expect(result).not.toBeNull();
    expect(result!.prizes![0].unlockLevel).toBe(1);
  });

  it("clamps unlockLevel to maximum of 60", () => {
    const data = makeGameData();
    const result = addPrize(data, "Prize", 100);
    expect(result).not.toBeNull();
    expect(result!.prizes![0].unlockLevel).toBe(60);
  });

  it("sets link to undefined when link is empty string", () => {
    const data = makeGameData();
    const result = addPrize(data, "Prize", 5, "");
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBeUndefined();
  });

  it("trims whitespace from link", () => {
    const data = makeGameData();
    const result = addPrize(data, "Prize", 5, "  https://example.com  ");
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBe("https://example.com");
  });

  it("returns null when at the soft limit", () => {
    const prizes: Prize[] = [];
    for (let i = 0; i < MAX_USER_PRIZES; i++) {
      prizes.push(makePrize({ name: `Prize ${i}`, unlockLevel: i + 1 }));
    }
    const data = makeGameData({ prizes });
    const result = addPrize(data, "One Too Many", 30);
    expect(result).toBeNull();
  });

  it("allows adding up to the soft limit", () => {
    const prizes: Prize[] = [];
    for (let i = 0; i < MAX_USER_PRIZES - 1; i++) {
      prizes.push(makePrize({ name: `Prize ${i}`, unlockLevel: i + 1 }));
    }
    const data = makeGameData({ prizes });
    const result = addPrize(data, "Last One", 30);
    expect(result).not.toBeNull();
    expect(result!.prizes!.length).toBe(MAX_USER_PRIZES);
  });

  it("generates a unique ID for each prize", () => {
    const data = makeGameData();
    const result1 = addPrize(data, "Prize A", 5);
    const result2 = addPrize(result1!, "Prize B", 10);
    expect(result2!.prizes![0].id).not.toBe(result2!.prizes![1].id);
  });

  it("includes a createdAt timestamp", () => {
    const data = makeGameData();
    const result = addPrize(data, "Prize", 5);
    expect(result!.prizes![0].createdAt).toBeDefined();
    expect(typeof result!.prizes![0].createdAt).toBe("string");
  });

  it("does not mutate the original data", () => {
    const data = makeGameData();
    addPrize(data, "Test", 5);
    expect(data.prizes).toBeUndefined();
  });
});

// ─── updatePrize ───

describe("updatePrize", () => {
  it("updates the name of an existing prize", () => {
    const prize = makePrize({ name: "Old Name", unlockLevel: 5 });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { name: "New Name" });
    expect(result).not.toBeNull();
    expect(result!.prizes![0].name).toBe("New Name");
  });

  it("updates the unlockLevel", () => {
    const prize = makePrize({ unlockLevel: 5 });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { unlockLevel: 20 });
    expect(result).not.toBeNull();
    expect(result!.prizes![0].unlockLevel).toBe(20);
  });

  it("updates the link", () => {
    const prize = makePrize({ link: "https://old.com" });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { link: "https://new.com" });
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBe("https://new.com");
  });

  it("removes the link when set to null", () => {
    const prize = makePrize({ link: "https://example.com" });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { link: null });
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBeUndefined();
  });

  it("removes the link when set to empty string", () => {
    const prize = makePrize({ link: "https://example.com" });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { link: "" });
    expect(result).not.toBeNull();
    expect(result!.prizes![0].link).toBeUndefined();
  });

  it("trims name to 60 characters", () => {
    const prize = makePrize();
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { name: "B".repeat(100) });
    expect(result!.prizes![0].name.length).toBe(60);
  });

  it("clamps unlockLevel to 1-60 range", () => {
    const prize = makePrize();
    const data = makeGameData({ prizes: [prize] });

    const low = updatePrize(data, prize.id, { unlockLevel: -5 });
    expect(low!.prizes![0].unlockLevel).toBe(1);

    const high = updatePrize(data, prize.id, { unlockLevel: 999 });
    expect(high!.prizes![0].unlockLevel).toBe(60);
  });

  it("returns null for non-existent prize ID", () => {
    const data = makeGameData({ prizes: [makePrize()] });
    const result = updatePrize(data, "nonexistent-id", { name: "Nope" });
    expect(result).toBeNull();
  });

  it("returns null when no prizes exist", () => {
    const data = makeGameData();
    const result = updatePrize(data, "any-id", { name: "Nope" });
    expect(result).toBeNull();
  });

  it("preserves fields not being updated", () => {
    const prize = makePrize({
      name: "Original",
      unlockLevel: 10,
      link: "https://example.com",
    });
    const data = makeGameData({ prizes: [prize] });
    const result = updatePrize(data, prize.id, { name: "Updated" });
    expect(result!.prizes![0].unlockLevel).toBe(10);
    expect(result!.prizes![0].link).toBe("https://example.com");
    expect(result!.prizes![0].createdAt).toBe(prize.createdAt);
  });

  it("does not affect other prizes", () => {
    const prize1 = makePrize({ name: "First", unlockLevel: 5 });
    const prize2 = makePrize({ name: "Second", unlockLevel: 10 });
    const data = makeGameData({ prizes: [prize1, prize2] });
    const result = updatePrize(data, prize1.id, { name: "Updated" });
    expect(result!.prizes![1].name).toBe("Second");
  });
});

// ─── deletePrize ───

describe("deletePrize", () => {
  it("removes a prize by ID", () => {
    const prize = makePrize();
    const data = makeGameData({ prizes: [prize] });
    const result = deletePrize(data, prize.id);
    expect(result.prizes!.length).toBe(0);
  });

  it("removes only the specified prize", () => {
    const prize1 = makePrize({ name: "Keep" });
    const prize2 = makePrize({ name: "Delete" });
    const data = makeGameData({ prizes: [prize1, prize2] });
    const result = deletePrize(data, prize2.id);
    expect(result.prizes!.length).toBe(1);
    expect(result.prizes![0].name).toBe("Keep");
  });

  it("is a no-op when prize ID does not exist", () => {
    const prize = makePrize();
    const data = makeGameData({ prizes: [prize] });
    const result = deletePrize(data, "nonexistent-id");
    expect(result.prizes!.length).toBe(1);
  });

  it("handles deletion from empty prizes array", () => {
    const data = makeGameData({ prizes: [] });
    const result = deletePrize(data, "any-id");
    expect(result.prizes!.length).toBe(0);
  });

  it("handles deletion when prizes is undefined", () => {
    const data = makeGameData();
    const result = deletePrize(data, "any-id");
    expect(result.prizes!.length).toBe(0);
  });

  it("does not mutate the original data", () => {
    const prize = makePrize();
    const data = makeGameData({ prizes: [prize] });
    deletePrize(data, prize.id);
    expect(data.prizes!.length).toBe(1);
  });
});

// ─── checkPrizeUnlocks ───

describe("checkPrizeUnlocks", () => {
  it("returns unchanged data when no prizes exist", () => {
    const data = makeGameData();
    const result = checkPrizeUnlocks(data, 10);
    expect(result.feedEvents).toBeUndefined();
  });

  it("returns unchanged data when no prizes are unlockable", () => {
    const prize = makePrize({ unlockLevel: 20 });
    const data = makeGameData({ prizes: [prize] });
    const result = checkPrizeUnlocks(data, 10);
    // No new feed events added
    expect(result.feedEvents ?? []).toEqual([]);
  });

  it("creates a prize_unlocked feed event for newly unlocked prize", () => {
    const prize = makePrize({ unlockLevel: 5, name: "Cool Prize" });
    const data = makeGameData({ prizes: [prize] });
    const result = checkPrizeUnlocks(data, 5);
    const unlockEvents = (result.feedEvents ?? []).filter(
      (e) => e.type === "prize_unlocked"
    );
    expect(unlockEvents.length).toBe(1);
    const event = unlockEvents[0] as Extract<FeedEvent, { type: "prize_unlocked" }>;
    expect(event.prizeId).toBe(prize.id);
    expect(event.prizeName).toBe("Cool Prize");
    expect(event.unlockLevel).toBe(5);
  });

  it("does not create duplicate feed events for already unlocked prizes", () => {
    const prize = makePrize({ unlockLevel: 5, name: "Cool Prize" });
    const existingEvent: FeedEvent = {
      type: "prize_unlocked",
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      prizeId: prize.id,
      prizeName: "Cool Prize",
      unlockLevel: 5,
    };
    const data = makeGameData({
      prizes: [prize],
      feedEvents: [existingEvent],
    });
    const result = checkPrizeUnlocks(data, 10);
    const unlockEvents = (result.feedEvents ?? []).filter(
      (e) => e.type === "prize_unlocked"
    );
    expect(unlockEvents.length).toBe(1); // still just the original
  });

  it("unlocks multiple prizes at once", () => {
    const prize1 = makePrize({ unlockLevel: 3, name: "Prize A" });
    const prize2 = makePrize({ unlockLevel: 5, name: "Prize B" });
    const prize3 = makePrize({ unlockLevel: 10, name: "Prize C" });
    const data = makeGameData({ prizes: [prize1, prize2, prize3] });
    const result = checkPrizeUnlocks(data, 7);
    const unlockEvents = (result.feedEvents ?? []).filter(
      (e) => e.type === "prize_unlocked"
    );
    // prize1 (level 3) and prize2 (level 5) should unlock; prize3 (level 10) should not
    expect(unlockEvents.length).toBe(2);
    const unlockedIds = unlockEvents.map(
      (e) => (e as Extract<FeedEvent, { type: "prize_unlocked" }>).prizeId
    );
    expect(unlockedIds).toContain(prize1.id);
    expect(unlockedIds).toContain(prize2.id);
    expect(unlockedIds).not.toContain(prize3.id);
  });

  it("unlocks prize at exact level boundary", () => {
    const prize = makePrize({ unlockLevel: 10 });
    const data = makeGameData({ prizes: [prize] });
    const result = checkPrizeUnlocks(data, 10);
    const unlockEvents = (result.feedEvents ?? []).filter(
      (e) => e.type === "prize_unlocked"
    );
    expect(unlockEvents.length).toBe(1);
  });

  it("does not unlock prize one level below requirement", () => {
    const prize = makePrize({ unlockLevel: 10 });
    const data = makeGameData({ prizes: [prize] });
    const result = checkPrizeUnlocks(data, 9);
    const unlockEvents = (result.feedEvents ?? []).filter(
      (e) => e.type === "prize_unlocked"
    );
    expect(unlockEvents.length).toBe(0);
  });

  it("preserves existing non-prize feed events", () => {
    const prize = makePrize({ unlockLevel: 5 });
    const existingEvent: FeedEvent = {
      type: "xp_gain",
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      stat: "strength",
      note: "test",
      amount: 3,
    };
    const data = makeGameData({
      prizes: [prize],
      feedEvents: [existingEvent],
    });
    const result = checkPrizeUnlocks(data, 10);
    const xpEvents = (result.feedEvents ?? []).filter((e) => e.type === "xp_gain");
    expect(xpEvents.length).toBe(1);
  });
});
