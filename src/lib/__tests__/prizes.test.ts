import { describe, it, expect } from "vitest";
import { getCurrentBracket, getVisibleRange, SYSTEM_REWARDS, MAX_USER_PRIZES } from "../prizes";

// ─── getCurrentBracket ───

describe("getCurrentBracket", () => {
  it("returns first bracket for level 1", () => {
    const bracket = getCurrentBracket(1);
    expect(bracket.start).toBe(1);
    expect(bracket.end).toBe(4); // next rank starts at 5
  });

  it("returns correct bracket at a rank boundary", () => {
    const bracket = getCurrentBracket(5);
    expect(bracket.start).toBe(5);
    expect(bracket.end).toBe(9); // next rank starts at 10
  });

  it("returns correct bracket mid-range", () => {
    const bracket = getCurrentBracket(7);
    expect(bracket.start).toBe(5);
    expect(bracket.end).toBe(9);
  });

  it("returns last bracket at max level", () => {
    const bracket = getCurrentBracket(60);
    expect(bracket.start).toBe(60);
    expect(bracket.end).toBe(60); // 61 - 1
  });

  it("returns correct bracket for high level", () => {
    const bracket = getCurrentBracket(42);
    expect(bracket.start).toBe(40);
    expect(bracket.end).toBe(44);
  });
});

// ─── getVisibleRange ───

describe("getVisibleRange", () => {
  it("returns first bracket as fully visible and second as teased for level 1", () => {
    const range = getVisibleRange(1);
    expect(range.fullyVisible).toEqual({ start: 1, end: 4 });
    expect(range.teased).toEqual({ start: 5, end: 9 });
  });

  it("returns next bracket as teased", () => {
    const range = getVisibleRange(12);
    expect(range.fullyVisible).toEqual({ start: 10, end: 14 });
    expect(range.teased).toEqual({ start: 15, end: 19 });
  });

  it("returns null teased at max bracket", () => {
    const range = getVisibleRange(60);
    expect(range.fullyVisible).toEqual({ start: 60, end: 60 });
    expect(range.teased).toBeNull();
  });

  it("teased bracket for second-to-last rank ends at 60", () => {
    const range = getVisibleRange(55);
    expect(range.fullyVisible).toEqual({ start: 55, end: 59 });
    expect(range.teased).toEqual({ start: 60, end: 60 });
  });
});

// ─── SYSTEM_REWARDS ───

describe("SYSTEM_REWARDS", () => {
  it("has one reward per rank title", () => {
    expect(SYSTEM_REWARDS.length).toBe(13);
  });

  it("first reward is Novice at level 1", () => {
    expect(SYSTEM_REWARDS[0].level).toBe(1);
    expect(SYSTEM_REWARDS[0].title).toBe("Novice");
  });

  it("last reward is Transcendent at level 60", () => {
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
