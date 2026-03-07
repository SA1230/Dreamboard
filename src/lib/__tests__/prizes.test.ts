import { describe, it, expect } from "vitest";
import {
  SYSTEM_REWARDS,
  MAX_USER_PRIZES,
  getCurrentBracket,
  getVisibleRange,
} from "../prizes";
import { RANK_TITLES } from "../ranks";

// ─── SYSTEM_REWARDS ───

describe("SYSTEM_REWARDS", () => {
  it("has one entry per rank title", () => {
    expect(SYSTEM_REWARDS.length).toBe(RANK_TITLES.length);
  });

  it("each reward has level, title, and description", () => {
    for (const reward of SYSTEM_REWARDS) {
      expect(typeof reward.level).toBe("number");
      expect(typeof reward.title).toBe("string");
      expect(typeof reward.description).toBe("string");
      expect(reward.title.length).toBeGreaterThan(0);
      expect(reward.description.length).toBeGreaterThan(0);
    }
  });

  it("first reward is level 1 with 'Your journey begins' description", () => {
    expect(SYSTEM_REWARDS[0].level).toBe(1);
    expect(SYSTEM_REWARDS[0].title).toBe("Novice");
    expect(SYSTEM_REWARDS[0].description).toBe("Your journey begins");
  });

  it("non-first rewards use 'Rank up to <title>' description", () => {
    for (let i = 1; i < SYSTEM_REWARDS.length; i++) {
      expect(SYSTEM_REWARDS[i].description).toBe(`Rank up to ${SYSTEM_REWARDS[i].title}`);
    }
  });

  it("levels match RANK_TITLES levels", () => {
    for (let i = 0; i < SYSTEM_REWARDS.length; i++) {
      expect(SYSTEM_REWARDS[i].level).toBe(RANK_TITLES[i][0]);
      expect(SYSTEM_REWARDS[i].title).toBe(RANK_TITLES[i][1]);
    }
  });

  it("last reward is level 60 Transcendent", () => {
    const last = SYSTEM_REWARDS[SYSTEM_REWARDS.length - 1];
    expect(last.level).toBe(60);
    expect(last.title).toBe("Transcendent");
  });
});

// ─── MAX_USER_PRIZES ───

describe("MAX_USER_PRIZES", () => {
  it("is 15", () => {
    expect(MAX_USER_PRIZES).toBe(15);
  });
});

// ─── getCurrentBracket ───

describe("getCurrentBracket", () => {
  it("returns the first bracket for level 1", () => {
    const bracket = getCurrentBracket(1);
    expect(bracket.start).toBe(1);
    expect(bracket.end).toBe(4); // next rank starts at 5, so end = 4
  });

  it("returns the first bracket for levels 2-4", () => {
    for (let level = 2; level <= 4; level++) {
      const bracket = getCurrentBracket(level);
      expect(bracket.start).toBe(1);
      expect(bracket.end).toBe(4);
    }
  });

  it("returns the second bracket for level 5", () => {
    const bracket = getCurrentBracket(5);
    expect(bracket.start).toBe(5);
    expect(bracket.end).toBe(9); // next rank starts at 10, so end = 9
  });

  it("returns the correct bracket for level 10 (Journeyman)", () => {
    const bracket = getCurrentBracket(10);
    expect(bracket.start).toBe(10);
    expect(bracket.end).toBe(14);
  });

  it("returns the correct bracket for a mid-bracket level", () => {
    const bracket = getCurrentBracket(12);
    expect(bracket.start).toBe(10);
    expect(bracket.end).toBe(14);
  });

  it("returns the last bracket for level 60 (max)", () => {
    const bracket = getCurrentBracket(60);
    expect(bracket.start).toBe(60);
    expect(bracket.end).toBe(60); // 61 - 1 = 60, no next rank
  });

  it("returns the correct bracket for level 55 (Mythic)", () => {
    const bracket = getCurrentBracket(55);
    expect(bracket.start).toBe(55);
    expect(bracket.end).toBe(59);
  });

  it("returns the correct bracket for level 59", () => {
    const bracket = getCurrentBracket(59);
    expect(bracket.start).toBe(55);
    expect(bracket.end).toBe(59);
  });
});

// ─── getVisibleRange ───

describe("getVisibleRange", () => {
  it("returns fullyVisible as the current bracket", () => {
    const range = getVisibleRange(1);
    expect(range.fullyVisible.start).toBe(1);
    expect(range.fullyVisible.end).toBe(4);
  });

  it("returns the next bracket as teased", () => {
    const range = getVisibleRange(1);
    expect(range.teased).not.toBeNull();
    expect(range.teased!.start).toBe(5);
    expect(range.teased!.end).toBe(9);
  });

  it("returns correct teased bracket for mid-range level", () => {
    const range = getVisibleRange(12);
    expect(range.fullyVisible.start).toBe(10);
    expect(range.fullyVisible.end).toBe(14);
    expect(range.teased).not.toBeNull();
    expect(range.teased!.start).toBe(15);
    expect(range.teased!.end).toBe(19);
  });

  it("returns null teased at the last bracket (level 60)", () => {
    const range = getVisibleRange(60);
    expect(range.fullyVisible.start).toBe(60);
    expect(range.fullyVisible.end).toBe(60);
    expect(range.teased).toBeNull();
  });

  it("returns correct range at boundary level 5", () => {
    const range = getVisibleRange(5);
    expect(range.fullyVisible.start).toBe(5);
    expect(range.fullyVisible.end).toBe(9);
    expect(range.teased).not.toBeNull();
    expect(range.teased!.start).toBe(10);
    expect(range.teased!.end).toBe(14);
  });

  it("returns correct teased for level 55 (Mythic)", () => {
    const range = getVisibleRange(55);
    expect(range.fullyVisible.start).toBe(55);
    expect(range.fullyVisible.end).toBe(59);
    expect(range.teased).not.toBeNull();
    expect(range.teased!.start).toBe(60);
    expect(range.teased!.end).toBe(60);
  });

  it("fullyVisible always matches getCurrentBracket", () => {
    for (const level of [1, 5, 10, 15, 20, 30, 45, 60]) {
      const range = getVisibleRange(level);
      const bracket = getCurrentBracket(level);
      expect(range.fullyVisible).toEqual(bracket);
    }
  });
});
