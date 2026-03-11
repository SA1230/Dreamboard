import { describe, it, expect, beforeEach } from "vitest";
import type { GameData, Activity, StatKey, FeedEvent, VisionCard } from "../types";
import { STAT_KEYS } from "../stats";

// Mock localStorage + saveGameData so achievements.ts doesn't blow up in Node
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

import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_CATEGORIES,
  getAchievementById,
  getAchievementsByCategory,
  getUnlockedAchievements,
  isAchievementUnlocked,
  getAchievementProgress,
  checkAchievementUnlocks,
} from "../achievements";

beforeEach(() => {
  localStorageMock.clear();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeGameData(overrides?: Partial<GameData>): GameData {
  const stats = {} as Record<StatKey, { xp: number; level: number }>;
  for (const key of STAT_KEYS) {
    stats[key] = { xp: 0, level: 1 };
  }
  return { stats, activities: [], ...overrides };
}

function makeActivity(stat: StatKey, timestamp: string, amount?: number, verdictMessage?: string): Activity {
  return {
    id: crypto.randomUUID(),
    stat,
    note: "test",
    timestamp,
    ...(amount !== undefined ? { amount } : {}),
    ...(verdictMessage ? { verdictMessage } : {}),
  };
}

function makeFeedEvent(type: string, overrides?: Record<string, unknown>): FeedEvent {
  return {
    type,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...overrides,
  } as FeedEvent;
}

// ─── Definition Tests ─────────────────────────────────────────────────────────

describe("Achievement Definitions", () => {
  it("has 38 achievements total", () => {
    expect(ACHIEVEMENT_DEFINITIONS).toHaveLength(38);
  });

  it("has 6 categories", () => {
    expect(ACHIEVEMENT_CATEGORIES).toHaveLength(6);
  });

  it("has no duplicate IDs", () => {
    const ids = ACHIEVEMENT_DEFINITIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every achievement has a valid category", () => {
    const validCategories = new Set(ACHIEVEMENT_CATEGORIES.map((c) => c.id));
    for (const a of ACHIEVEMENT_DEFINITIONS) {
      expect(validCategories.has(a.category)).toBe(true);
    }
  });

  it("has 5 secret achievements", () => {
    const secrets = ACHIEVEMENT_DEFINITIONS.filter((a) => a.secret);
    expect(secrets).toHaveLength(5);
  });

  it("tier distribution is correct (12C, 11U, 9R, 5E, 1L)", () => {
    const counts = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const a of ACHIEVEMENT_DEFINITIONS) counts[a.tier]++;
    expect(counts.common).toBe(12);
    expect(counts.uncommon).toBe(11);
    expect(counts.rare).toBe(9);
    expect(counts.epic).toBe(5);
    expect(counts.legendary).toBe(1);
  });
});

// ─── Accessor Tests ───────────────────────────────────────────────────────────

describe("Achievement Accessors", () => {
  it("getAchievementById returns the right achievement", () => {
    const a = getAchievementById("first-steps");
    expect(a).toBeDefined();
    expect(a!.name).toBe("First Steps");
  });

  it("getAchievementById returns undefined for bad ID", () => {
    expect(getAchievementById("nonexistent")).toBeUndefined();
  });

  it("getAchievementsByCategory filters correctly", () => {
    const journey = getAchievementsByCategory("journey");
    expect(journey.length).toBe(7);
    expect(journey.every((a) => a.category === "journey")).toBe(true);
  });

  it("getUnlockedAchievements returns only unlocked", () => {
    const data = makeGameData({ unlockedAchievements: ["first-steps", "awakened"] });
    const unlocked = getUnlockedAchievements(data);
    expect(unlocked).toHaveLength(2);
    expect(unlocked.map((a) => a.id)).toContain("first-steps");
    expect(unlocked.map((a) => a.id)).toContain("awakened");
  });

  it("isAchievementUnlocked works", () => {
    const data = makeGameData({ unlockedAchievements: ["first-steps"] });
    expect(isAchievementUnlocked(data, "first-steps")).toBe(true);
    expect(isAchievementUnlocked(data, "ten-fold")).toBe(false);
  });
});

// ─── Detection Engine Tests ───────────────────────────────────────────────────

describe("checkAchievementUnlocks", () => {
  it("unlocks first-steps with 1 activity", () => {
    const data = makeGameData({
      activities: [makeActivity("strength", "2026-03-01T10:00:00Z")],
    });
    const result = checkAchievementUnlocks(data);
    expect(result.unlockedAchievements).toContain("first-steps");
    expect(result.feedEvents?.some((e) => e.type === "achievement_unlocked" && e.achievementId === "first-steps")).toBe(true);
  });

  it("does not duplicate already-unlocked achievements", () => {
    const data = makeGameData({
      activities: [makeActivity("strength", "2026-03-01T10:00:00Z")],
      unlockedAchievements: ["first-steps"],
      feedEvents: [makeFeedEvent("achievement_unlocked", { achievementId: "first-steps", achievementName: "First Steps", tier: "common" })],
    });
    const result = checkAchievementUnlocks(data);
    const firstStepsEvents = result.feedEvents?.filter(
      (e) => e.type === "achievement_unlocked" && e.achievementId === "first-steps"
    );
    expect(firstStepsEvents).toHaveLength(1);
  });

  it("deduplicates via feedEvents even if unlockedAchievements is missing", () => {
    const data = makeGameData({
      activities: [makeActivity("strength", "2026-03-01T10:00:00Z")],
      unlockedAchievements: undefined,
      feedEvents: [makeFeedEvent("achievement_unlocked", { achievementId: "first-steps", achievementName: "First Steps", tier: "common" })],
    });
    const result = checkAchievementUnlocks(data);
    const events = result.feedEvents?.filter(
      (e) => e.type === "achievement_unlocked" && e.achievementId === "first-steps"
    );
    expect(events).toHaveLength(1);
  });

  it("unlocks ten-fold with 10 activities", () => {
    const activities = Array.from({ length: 10 }, (_, i) =>
      makeActivity("wisdom", `2026-03-0${(i % 9) + 1}T10:00:00Z`)
    );
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).toContain("ten-fold");
    expect(result.unlockedAchievements).toContain("first-steps"); // also unlocked
  });

  it("does not unlock ten-fold with 9 activities", () => {
    const activities = Array.from({ length: 9 }, (_, i) =>
      makeActivity("wisdom", `2026-03-0${i + 1}T10:00:00Z`)
    );
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).not.toContain("ten-fold");
  });

  it("unlocks awakened at overall level 5+", () => {
    // Overall level 5 needs ~45 total XP (from getOverallLevel curve)
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 0, level: 1 };
    stats.strength = { xp: 50, level: 5 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements).toContain("awakened");
  });

  it("unlocks well-rounded with 4+ stats having XP > 0", () => {
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 0, level: 1 };
    stats.strength = { xp: 5, level: 2 };
    stats.wisdom = { xp: 3, level: 1 };
    stats.vitality = { xp: 2, level: 1 };
    stats.charisma = { xp: 1, level: 1 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements).toContain("well-rounded");
  });

  it("does not unlock well-rounded with only 3 stats having XP > 0", () => {
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 0, level: 1 };
    stats.strength = { xp: 5, level: 2 };
    stats.wisdom = { xp: 3, level: 1 };
    stats.vitality = { xp: 2, level: 1 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements ?? []).not.toContain("well-rounded");
  });

  it("unlocks renaissance when all 8 stats have activities", () => {
    const activities = STAT_KEYS.map((stat) =>
      makeActivity(stat, "2026-03-01T10:00:00Z")
    );
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).toContain("renaissance");
  });

  it("unlocks balanced-soul when all 8 stats are level 3+", () => {
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 10, level: 3 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements).toContain("balanced-soul");
  });

  it("does not unlock balanced-soul when one stat is below level 3", () => {
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 10, level: 3 };
    stats.wealth = { xp: 1, level: 2 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements ?? []).not.toContain("balanced-soul");
  });

  it("unlocks first-light with 1 habit completion", () => {
    const result = checkAchievementUnlocks(makeGameData({
      healthyHabits: { water: ["2026-03-01"] },
    }));
    expect(result.unlockedAchievements).toContain("first-light");
  });

  it("unlocks steady-hand with 7 habit completions", () => {
    const result = checkAchievementUnlocks(makeGameData({
      healthyHabits: {
        water: ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"],
        brush: ["2026-03-01", "2026-03-02", "2026-03-03"],
      },
    }));
    expect(result.unlockedAchievements).toContain("steady-hand");
  });

  it("unlocks streak-kindled with a 3-day streak ending today", () => {
    // getStatStreaks uses local dates via toISOString().split("T")[0] on a Date
    // with hours zeroed — we must match that format exactly to avoid timezone drift
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const activities = [
      makeActivity("strength", `${formatDate(dayBefore)}T10:00:00.000Z`),
      makeActivity("strength", `${formatDate(yesterday)}T10:00:00.000Z`),
      makeActivity("strength", `${formatDate(today)}T10:00:00.000Z`),
    ];
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).toContain("streak-kindled");
  });

  it("unlocks first-promotion when rank_up exists in feed", () => {
    const result = checkAchievementUnlocks(makeGameData({
      feedEvents: [makeFeedEvent("rank_up", { newRank: "Seeker", newLevel: 5 })],
    }));
    expect(result.unlockedAchievements).toContain("first-promotion");
  });

  it("unlocks stat-specialist when any stat reaches level 5", () => {
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 0, level: 1 };
    stats.craft = { xp: 20, level: 5 };

    const result = checkAchievementUnlocks(makeGameData({ stats }));
    expect(result.unlockedAchievements).toContain("stat-specialist");
  });

  it("unlocks first-purchase with owned item + spent PP", () => {
    const result = checkAchievementUnlocks(makeGameData({
      inventory: { ownedItemIds: ["leather-cap"], equippedItems: {} },
      pointsWallet: { lifetimeEarned: 10, lifetimeSpent: 3 },
    }));
    expect(result.unlockedAchievements).toContain("first-purchase");
  });

  it("does not unlock first-purchase with 0 lifetime spent (level reward items)", () => {
    const result = checkAchievementUnlocks(makeGameData({
      inventory: { ownedItemIds: ["adventurer-band"], equippedItems: {} },
      pointsWallet: { lifetimeEarned: 0, lifetimeSpent: 0 },
    }));
    expect(result.unlockedAchievements ?? []).not.toContain("first-purchase");
  });

  it("unlocks fully-equipped when all 8 visible slots filled", () => {
    const equippedItems: Record<string, string> = {
      head: "iron-helm",
      chest: "cloth-tunic",
      legs: "cloth-pants",
      robe: "wanderer-robe",
      hands: "leather-gloves",
      feet: "wanderer-boots",
      primary: "wooden-sword",
      secondary: "buckler-shield",
    };
    const result = checkAchievementUnlocks(makeGameData({
      inventory: { ownedItemIds: Object.values(equippedItems), equippedItems },
    }));
    expect(result.unlockedAchievements).toContain("fully-equipped");
  });

  it("unlocks first-dream with 1 vision card", () => {
    const card: VisionCard = {
      id: "v1",
      rawText: "test",
      weavedText: "test",
      colorIndex: 0,
      createdAt: new Date().toISOString(),
    };
    const result = checkAchievementUnlocks(makeGameData({ visionCards: [card] }));
    expect(result.unlockedAchievements).toContain("first-dream");
  });

  it("unlocks oracle-consulted with a board reading", () => {
    const result = checkAchievementUnlocks(makeGameData({
      lastBoardReading: { id: "r1", text: "Your board speaks...", createdAt: new Date().toISOString() },
    }));
    expect(result.unlockedAchievements).toContain("oracle-consulted");
  });

  it("unlocks quest-accepted with a completed challenge in feed", () => {
    const result = checkAchievementUnlocks(makeGameData({
      feedEvents: [makeFeedEvent("challenge_completed", {
        challengeId: "c1", description: "Do something", stat: "strength", bonusXP: 5,
      })],
    }));
    expect(result.unlockedAchievements).toContain("quest-accepted");
  });

  it("unlocks chain-breaker when all chain steps completed", () => {
    const chainId = "chain-1";
    const feedEvents: FeedEvent[] = [
      makeFeedEvent("challenge_completed", { challengeId: "c1", description: "Step 1", stat: "strength", bonusXP: 3, chainId, chainIndex: 1, chainTotal: 3 }) as FeedEvent,
      makeFeedEvent("challenge_completed", { challengeId: "c2", description: "Step 2", stat: "wisdom", bonusXP: 3, chainId, chainIndex: 2, chainTotal: 3 }) as FeedEvent,
      makeFeedEvent("challenge_completed", { challengeId: "c3", description: "Step 3", stat: "vitality", bonusXP: 3, chainId, chainIndex: 3, chainTotal: 3 }) as FeedEvent,
    ];
    const result = checkAchievementUnlocks(makeGameData({ feedEvents }));
    expect(result.unlockedAchievements).toContain("chain-breaker");
  });

  it("does not unlock chain-breaker with partial chain", () => {
    const chainId = "chain-1";
    const feedEvents: FeedEvent[] = [
      makeFeedEvent("challenge_completed", { challengeId: "c1", description: "Step 1", stat: "strength", bonusXP: 3, chainId, chainIndex: 1, chainTotal: 3 }) as FeedEvent,
      makeFeedEvent("challenge_completed", { challengeId: "c2", description: "Step 2", stat: "wisdom", bonusXP: 3, chainId, chainIndex: 2, chainTotal: 3 }) as FeedEvent,
    ];
    const result = checkAchievementUnlocks(makeGameData({ feedEvents }));
    expect(result.unlockedAchievements ?? []).not.toContain("chain-breaker");
  });

  it("unlocks big-haul when a verdict sums to 8+ XP", () => {
    const verdict = "Great job doing all the things!";
    const activities = [
      makeActivity("strength", "2026-03-01T10:00:00Z", 3, verdict),
      makeActivity("wisdom", "2026-03-01T10:00:01Z", 3, verdict),
      makeActivity("vitality", "2026-03-01T10:00:02Z", 2, verdict),
    ];
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).toContain("big-haul");
  });

  it("does not unlock big-haul when verdict sums to 7", () => {
    const verdict = "Nice but not amazing";
    const activities = [
      makeActivity("strength", "2026-03-01T10:00:00Z", 4, verdict),
      makeActivity("wisdom", "2026-03-01T10:00:01Z", 3, verdict),
    ];
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements ?? []).not.toContain("big-haul");
  });

  it("unlocks perfect-score with a 10 XP single activity", () => {
    const activities = [makeActivity("strength", "2026-03-01T10:00:00Z", 10)];
    const result = checkAchievementUnlocks(makeGameData({ activities }));
    expect(result.unlockedAchievements).toContain("perfect-score");
  });

  it("unlocks clean-slate on a day with habits and no damage", () => {
    const result = checkAchievementUnlocks(makeGameData({
      healthyHabits: { water: ["2026-03-01"], brush: ["2026-03-01"] },
      dailyDamage: { screentime: ["2026-03-02"] }, // damage on different day
      enabledDamage: ["screentime"],
    }));
    expect(result.unlockedAchievements).toContain("clean-slate");
  });

  it("does not unlock clean-slate when damage occurs on same day as habits", () => {
    const result = checkAchievementUnlocks(makeGameData({
      healthyHabits: { water: ["2026-03-01"] },
      dailyDamage: { screentime: ["2026-03-01"] },
      enabledDamage: ["screentime"],
    }));
    expect(result.unlockedAchievements ?? []).not.toContain("clean-slate");
  });

  it("returns same data reference when no new unlocks", () => {
    const data = makeGameData();
    const result = checkAchievementUnlocks(data);
    // No activities, no habits, nothing — no achievements should unlock
    expect(result).toBe(data);
  });

  it("unlocks multiple achievements in one pass", () => {
    // 8 activities (one per stat) + stats with XP → unlocks first-steps, well-rounded, renaissance
    const activities = STAT_KEYS.map((stat) =>
      makeActivity(stat, "2026-03-01T10:00:00Z")
    );
    const stats = {} as Record<StatKey, { xp: number; level: number }>;
    for (const key of STAT_KEYS) stats[key] = { xp: 1, level: 1 };

    const result = checkAchievementUnlocks(makeGameData({ activities, stats }));
    expect(result.unlockedAchievements).toContain("first-steps");
    expect(result.unlockedAchievements).toContain("well-rounded");
    expect(result.unlockedAchievements).toContain("renaissance");
  });
});

// ─── Progress Helpers ─────────────────────────────────────────────────────────

describe("getAchievementProgress", () => {
  it("returns correct progress for activity chain", () => {
    const activities = Array.from({ length: 47 }, (_, i) =>
      makeActivity("strength", `2026-03-01T${String(i).padStart(2, "0")}:00:00Z`)
    );
    const data = makeGameData({ activities });

    expect(getAchievementProgress(data, "century")).toEqual({ current: 47, target: 100 });
    expect(getAchievementProgress(data, "first-steps")).toEqual({ current: 47, target: 1 });
  });

  it("returns correct progress for habit chain", () => {
    const data = makeGameData({
      healthyHabits: { water: ["2026-03-01", "2026-03-02", "2026-03-03"] },
    });
    expect(getAchievementProgress(data, "steady-hand")).toEqual({ current: 3, target: 7 });
  });

  it("returns null for non-progressive achievements", () => {
    const data = makeGameData();
    expect(getAchievementProgress(data, "clean-slate")).toBeNull();
    expect(getAchievementProgress(data, "first-promotion")).toBeNull();
  });
});
