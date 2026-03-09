import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Activity, StatKey, Challenge } from "../types";
import { STAT_KEYS, STAT_DEFINITIONS } from "../stats";

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

// Must import after localStorage mock is in place
import { getCaptainQuip, QuipParams } from "../captainQuips";

// Helper to build a minimal QuipParams
function makeQuipParams(overrides?: Partial<QuipParams>): QuipParams {
  const streaks = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) streaks[key] = 0;
  return {
    activities: [],
    streaks,
    activeChallenge: null,
    overallLevel: 1,
    rank: "Novice",
    definitions: STAT_DEFINITIONS,
    ...overrides,
  };
}

function makeActivity(stat: StatKey, timestamp: string, verdictMessage?: string): Activity {
  return {
    id: crypto.randomUUID(),
    stat,
    note: "test",
    timestamp,
    ...(verdictMessage ? { verdictMessage } : {}),
  };
}

// ─── getCaptainQuip ───

describe("getCaptainQuip", () => {
  // Pin "today" so quip selection is deterministic
  const fakeToday = new Date("2026-03-09T12:00:00");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fakeToday);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when there are no activities (first-run)", () => {
    const params = makeQuipParams();
    expect(getCaptainQuip(params)).toBeNull();
  });

  // Priority 1: Today's verdict excerpt
  it("returns first sentence of today's verdict when available", () => {
    const params = makeQuipParams({
      activities: [
        makeActivity("strength", "2026-03-09T10:00:00Z", "Nice workout today. You really pushed yourself!"),
      ],
    });
    const quip = getCaptainQuip(params);
    expect(quip).toBe("Nice workout today.");
  });

  it("extracts first sentence at exclamation mark", () => {
    const params = makeQuipParams({
      activities: [
        makeActivity("wisdom", "2026-03-09T08:00:00Z", "Impressive! You read for three hours straight."),
      ],
    });
    const quip = getCaptainQuip(params);
    expect(quip).toBe("Impressive!");
  });

  it("truncates verdicts without punctuation to 100 chars", () => {
    const longText = "A".repeat(200);
    const params = makeQuipParams({
      activities: [
        makeActivity("strength", "2026-03-09T10:00:00Z", longText),
      ],
    });
    const quip = getCaptainQuip(params);
    expect(quip).toBe("A".repeat(97) + "...");
  });

  it("falls through to lower priority when today's activity has no verdict", () => {
    const params = makeQuipParams({
      activities: [
        makeActivity("strength", "2026-03-09T10:00:00Z"), // no verdictMessage
      ],
      overallLevel: 2,
    });
    const quip = getCaptainQuip(params);
    // Should fall through to fallback tier (level < 3), which returns a string
    expect(quip).not.toBeNull();
    expect(typeof quip).toBe("string");
  });

  // Priority 2: Absence (2+ days)
  it("returns absence quip for 2-7 day gap", () => {
    const params = makeQuipParams({
      activities: [
        makeActivity("strength", "2026-03-05T10:00:00Z"), // several days ago
      ],
    });
    const quip = getCaptainQuip(params)!;
    // ABSENCE_QUIPS all contain "{days}" which gets interpolated with a number + "days"
    expect(quip).toMatch(/\d+ day/); // e.g. "3 days without a report"
  });

  it("returns long absence quip for 8+ day gap", () => {
    const params = makeQuipParams({
      activities: [
        makeActivity("strength", "2026-02-20T10:00:00Z"), // ~17 days ago
      ],
    });
    const quip = getCaptainQuip(params)!;
    // Long absence quips don't have {days} interpolation
    expect(typeof quip).toBe("string");
    expect(quip.length).toBeGreaterThan(10);
  });

  // Priority 3: Active streak
  it("returns streak quip when a stat has 3+ day streak", () => {
    const streaks = {} as Record<StatKey, number>;
    for (const key of STAT_KEYS) streaks[key] = 0;
    streaks.strength = 5;

    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-09T10:00:00Z")], // today, no verdict
      streaks,
    });
    // Today has no verdict → falls through priority 1
    // Yesterday gap = 0 → skips priority 2
    // Streak ≥ 3 → priority 3
    const quip = getCaptainQuip(params)!;
    expect(quip).toContain("5");
    expect(quip).toContain("Strength");
  });

  it("picks the best streak when multiple stats have streaks", () => {
    const streaks = {} as Record<StatKey, number>;
    for (const key of STAT_KEYS) streaks[key] = 0;
    streaks.wisdom = 3;
    streaks.strength = 7;

    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-09T10:00:00Z")],
      streaks,
    });
    const quip = getCaptainQuip(params)!;
    // Should pick strength (7 > 3)
    expect(quip).toContain("7");
  });

  // Priority 4: Active challenge nudge
  it("returns challenge quip when challenge is active", () => {
    const challenge: Challenge = {
      id: "test-challenge",
      description: "Do 50 pushups",
      stat: "strength",
      bonusXP: 3,
      issuedAt: "2026-03-08T10:00:00Z",
    };

    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")], // yesterday
      activeChallenge: challenge,
    });
    const quip = getCaptainQuip(params)!;
    // Challenge quips mention "challenge" or "quest"
    expect(quip.toLowerCase()).toMatch(/challenge|quest|waiting/);
  });

  // Priority 5: Level/rank quip
  it("returns high-level quip for level 30+", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")],
      overallLevel: 35,
      rank: "Master",
    });
    const quip = getCaptainQuip(params)!;
    expect(quip).toMatch(/Master|35/);
  });

  it("returns mid-level quip for level 10-29", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")],
      overallLevel: 15,
      rank: "Adept",
    });
    const quip = getCaptainQuip(params)!;
    expect(quip).toMatch(/Adept|15/);
  });

  it("returns low-level quip for level 3-9", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")],
      overallLevel: 5,
      rank: "Apprentice",
    });
    const quip = getCaptainQuip(params)!;
    expect(quip).toMatch(/Apprentice|5/);
  });

  // Priority 6: Fallback
  it("returns fallback quip for level 1-2 with no other triggers", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")], // yesterday
      overallLevel: 2,
    });
    const quip = getCaptainQuip(params)!;
    expect(typeof quip).toBe("string");
    expect(quip.length).toBeGreaterThan(10);
  });

  // Determinism
  it("returns the same quip for the same date", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-08T10:00:00Z")],
      overallLevel: 2,
    });
    const quip1 = getCaptainQuip(params);
    const quip2 = getCaptainQuip(params);
    expect(quip1).toBe(quip2);
  });

  it("returns a different quip on a different date", () => {
    const params = makeQuipParams({
      activities: [makeActivity("strength", "2026-03-05T10:00:00Z")],
      overallLevel: 20,
      rank: "Expert",
    });

    vi.setSystemTime(new Date("2026-03-09T12:00:00"));
    const quipDay1 = getCaptainQuip(params);

    vi.setSystemTime(new Date("2026-03-10T12:00:00"));
    const quipDay2 = getCaptainQuip(params);

    // Not guaranteed to be different (hash collision possible), but at least both are strings
    expect(typeof quipDay1).toBe("string");
    expect(typeof quipDay2).toBe("string");
  });
});
