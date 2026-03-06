import { describe, it, expect } from "vitest";
import {
  getRankTitle,
  getNextRankTitle,
  getRankProgress,
  getRankColorPair,
} from "../ranks";

describe("getRankTitle", () => {
  it("returns Novice for level 1", () => {
    expect(getRankTitle(1)).toBe("Novice");
  });

  it("returns Apprentice at level 5", () => {
    expect(getRankTitle(5)).toBe("Apprentice");
  });

  it("returns Transcendent at level 60", () => {
    expect(getRankTitle(60)).toBe("Transcendent");
  });

  it("picks highest threshold below current level", () => {
    // Level 7 is between Apprentice (5) and Journeyman (10)
    expect(getRankTitle(7)).toBe("Apprentice");
  });
});

describe("getNextRankTitle", () => {
  it("returns next rank for low levels", () => {
    expect(getNextRankTitle(1)).toBe("Apprentice");
  });

  it("returns null at max rank", () => {
    expect(getNextRankTitle(60)).toBeNull();
  });
});

describe("getRankProgress", () => {
  it("returns 0 at rank boundary start", () => {
    const progress = getRankProgress(5);
    expect(progress).toBe(0);
  });

  it("returns fractional progress within a rank", () => {
    // Level 7 is between Apprentice (5) and Journeyman (10)
    // Progress = (7 - 5) / (10 - 5) = 0.4
    const progress = getRankProgress(7);
    expect(progress).toBeCloseTo(0.4);
  });

  it("returns 1 at max level", () => {
    expect(getRankProgress(60)).toBe(1);
  });
});

describe("getRankColorPair", () => {
  it("returns color strings", () => {
    const [from, to] = getRankColorPair(1);
    expect(from).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(to).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
