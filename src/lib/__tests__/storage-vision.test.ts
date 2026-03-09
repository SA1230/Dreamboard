import { describe, it, expect, beforeEach } from "vitest";
import {
  getVisionCards,
  addVisionCard,
  deleteVisionCard,
  togglePinVisionCard,
  saveBoardReading,
  getLastBoardReading,
  getActiveChallenge,
  issueChallenge,
  issueChallengeChain,
  completeChallenge,
  dismissChallenge,
  formatRelativeTime,
  getMascotName,
  setMascotName,
  isMascotNameUnlocked,
  getProfilePicture,
  saveProfilePicture,
} from "../storage";
import type { GameData, StatKey, VisionCard, ChainStep } from "../types";
import { STAT_KEYS } from "../stats";
import { MAX_VISION_CARDS } from "../visionColors";

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
  for (const key of STAT_KEYS) stats[key] = { xp: 0, level: 1 };
  return { stats, activities: [], ...overrides };
}

function makeVisionCard(overrides?: Partial<VisionCard>): VisionCard {
  return {
    id: crypto.randomUUID(),
    rawText: "test dream",
    weavedText: "A beautiful test dream",
    colorIndex: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorageMock.clear();
});

// ═══════════════════════════════════
// Vision Board
// ═══════════════════════════════════

describe("getVisionCards", () => {
  it("returns empty array when no vision cards exist", () => {
    expect(getVisionCards(makeGameData())).toEqual([]);
  });

  it("returns cards sorted newest first", () => {
    const cards = [
      makeVisionCard({ id: "old", createdAt: "2026-01-01T00:00:00Z" }),
      makeVisionCard({ id: "new", createdAt: "2026-03-01T00:00:00Z" }),
    ];
    const data = makeGameData({ visionCards: cards });
    const sorted = getVisionCards(data);
    expect(sorted[0].id).toBe("new");
    expect(sorted[1].id).toBe("old");
  });

  it("sorts pinned cards before unpinned", () => {
    const cards = [
      makeVisionCard({ id: "unpinned-new", createdAt: "2026-03-01T00:00:00Z" }),
      makeVisionCard({ id: "pinned-old", createdAt: "2026-01-01T00:00:00Z", pinned: true }),
    ];
    const data = makeGameData({ visionCards: cards });
    const sorted = getVisionCards(data);
    expect(sorted[0].id).toBe("pinned-old");
    expect(sorted[1].id).toBe("unpinned-new");
  });

  it("does not mutate original array", () => {
    const cards = [
      makeVisionCard({ id: "a", createdAt: "2026-03-01T00:00:00Z" }),
      makeVisionCard({ id: "b", createdAt: "2026-01-01T00:00:00Z" }),
    ];
    const data = makeGameData({ visionCards: cards });
    getVisionCards(data);
    expect(data.visionCards![0].id).toBe("a"); // original order preserved
  });
});

describe("addVisionCard", () => {
  it("adds a card to empty board", () => {
    const data = makeGameData();
    const result = addVisionCard(data, "My dream", "A vivid dream");
    expect(result).not.toBeNull();
    expect(result!.visionCards).toHaveLength(1);
    expect(result!.visionCards![0].rawText).toBe("My dream");
    expect(result!.visionCards![0].weavedText).toBe("A vivid dream");
  });

  it("trims whitespace from text", () => {
    const result = addVisionCard(makeGameData(), "  padded  ", "  also padded  ");
    expect(result!.visionCards![0].rawText).toBe("padded");
    expect(result!.visionCards![0].weavedText).toBe("also padded");
  });

  it("assigns rotating color index", () => {
    let data = makeGameData();
    data = addVisionCard(data, "card 1", "card 1")!;
    data = addVisionCard(data, "card 2", "card 2")!;
    data = addVisionCard(data, "card 3", "card 3")!;
    expect(data.visionCards![0].colorIndex).toBe(0);
    expect(data.visionCards![1].colorIndex).toBe(1);
    expect(data.visionCards![2].colorIndex).toBe(2);
  });

  it("returns null when at max capacity", () => {
    const cards = Array.from({ length: MAX_VISION_CARDS }, (_, i) =>
      makeVisionCard({ id: `card-${i}` })
    );
    const data = makeGameData({ visionCards: cards });
    expect(addVisionCard(data, "one more", "one more")).toBeNull();
  });

  it("stores optional imageBase64", () => {
    const result = addVisionCard(makeGameData(), "dream", "dream", "data:image/png;base64,abc");
    expect(result!.visionCards![0].imageBase64).toBe("data:image/png;base64,abc");
  });

  it("omits imageBase64 when not provided", () => {
    const result = addVisionCard(makeGameData(), "dream", "dream");
    expect(result!.visionCards![0].imageBase64).toBeUndefined();
  });
});

describe("deleteVisionCard", () => {
  it("removes a card by ID", () => {
    const cards = [makeVisionCard({ id: "keep" }), makeVisionCard({ id: "delete-me" })];
    const data = makeGameData({ visionCards: cards });
    const result = deleteVisionCard(data, "delete-me");
    expect(result.visionCards).toHaveLength(1);
    expect(result.visionCards![0].id).toBe("keep");
  });

  it("returns unchanged data when ID not found", () => {
    const cards = [makeVisionCard({ id: "only" })];
    const data = makeGameData({ visionCards: cards });
    const result = deleteVisionCard(data, "nonexistent");
    expect(result.visionCards).toHaveLength(1);
  });

  it("handles empty visionCards gracefully", () => {
    const result = deleteVisionCard(makeGameData(), "any-id");
    expect(result.visionCards).toEqual([]);
  });
});

describe("togglePinVisionCard", () => {
  it("pins an unpinned card", () => {
    const cards = [makeVisionCard({ id: "card1", pinned: false })];
    const data = makeGameData({ visionCards: cards });
    const result = togglePinVisionCard(data, "card1");
    expect(result).not.toBeNull();
    expect(result!.visionCards![0].pinned).toBe(true);
  });

  it("unpins a pinned card", () => {
    const cards = [makeVisionCard({ id: "card1", pinned: true })];
    const data = makeGameData({ visionCards: cards });
    const result = togglePinVisionCard(data, "card1");
    expect(result!.visionCards![0].pinned).toBe(false);
  });

  it("returns null for nonexistent card ID", () => {
    const data = makeGameData({ visionCards: [makeVisionCard()] });
    expect(togglePinVisionCard(data, "nonexistent")).toBeNull();
  });

  it("returns null when visionCards is empty", () => {
    expect(togglePinVisionCard(makeGameData(), "any")).toBeNull();
  });
});

describe("saveBoardReading / getLastBoardReading", () => {
  it("returns null when no reading exists", () => {
    expect(getLastBoardReading(makeGameData())).toBeNull();
  });

  it("saves and retrieves a board reading", () => {
    const data = saveBoardReading(makeGameData(), "You are a dreamer.");
    const reading = getLastBoardReading(data);
    expect(reading).not.toBeNull();
    expect(reading!.text).toBe("You are a dreamer.");
  });

  it("trims whitespace from reading text", () => {
    const data = saveBoardReading(makeGameData(), "  padded text  ");
    expect(getLastBoardReading(data)!.text).toBe("padded text");
  });

  it("overwrites previous reading", () => {
    let data = saveBoardReading(makeGameData(), "first reading");
    data = saveBoardReading(data, "second reading");
    expect(getLastBoardReading(data)!.text).toBe("second reading");
  });
});

// ═══════════════════════════════════
// Challenges
// ═══════════════════════════════════

describe("getActiveChallenge", () => {
  it("returns null when no active challenge", () => {
    expect(getActiveChallenge(makeGameData())).toBeNull();
  });

  it("returns the active challenge", () => {
    const challenge = {
      id: "c1",
      description: "Do pushups",
      stat: "strength" as StatKey,
      bonusXP: 3,
      issuedAt: "2026-03-09T10:00:00Z",
    };
    const data = makeGameData({ activeChallenge: challenge });
    expect(getActiveChallenge(data)).toEqual(challenge);
  });
});

describe("issueChallenge", () => {
  it("sets the active challenge", () => {
    const data = issueChallenge(makeGameData(), "Do pushups", "strength", 3);
    const challenge = getActiveChallenge(data);
    expect(challenge).not.toBeNull();
    expect(challenge!.description).toBe("Do pushups");
    expect(challenge!.stat).toBe("strength");
    expect(challenge!.bonusXP).toBe(3);
  });

  it("pushes a challenge_issued feed event", () => {
    const data = issueChallenge(makeGameData(), "Do pushups", "strength", 3);
    const events = data.feedEvents ?? [];
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].type).toBe("challenge_issued");
  });

  it("creates a standalone challenge (no chain fields)", () => {
    const data = issueChallenge(makeGameData(), "Test", "wisdom", 2);
    const challenge = getActiveChallenge(data)!;
    expect(challenge.chainId).toBeUndefined();
    expect(challenge.chainIndex).toBeUndefined();
    expect(challenge.chainTotal).toBeUndefined();
  });
});

describe("issueChallengeChain", () => {
  const steps: ChainStep[] = [
    { description: "Step 1", stat: "strength", bonusXP: 2 },
    { description: "Step 2", stat: "wisdom", bonusXP: 3 },
    { description: "Step 3", stat: "vitality", bonusXP: 4 },
  ];

  it("sets first step as active challenge", () => {
    const data = issueChallengeChain(makeGameData(), steps);
    const challenge = getActiveChallenge(data)!;
    expect(challenge.description).toBe("Step 1");
    expect(challenge.chainIndex).toBe(1);
    expect(challenge.chainTotal).toBe(3);
  });

  it("stores remaining steps as pending", () => {
    const data = issueChallengeChain(makeGameData(), steps);
    expect(data.pendingChainSteps).toHaveLength(2);
    expect(data.pendingChainSteps![0].description).toBe("Step 2");
    expect(data.pendingChainSteps![1].description).toBe("Step 3");
  });

  it("returns unchanged data for empty steps array", () => {
    const original = makeGameData();
    const result = issueChallengeChain(original, []);
    expect(getActiveChallenge(result)).toBeNull();
  });

  it("handles single-step chain", () => {
    const data = issueChallengeChain(makeGameData(), [steps[0]]);
    const challenge = getActiveChallenge(data)!;
    expect(challenge.chainTotal).toBe(1);
    expect(data.pendingChainSteps).toBeUndefined();
  });

  it("pushes a challenge_issued feed event", () => {
    const data = issueChallengeChain(makeGameData(), steps);
    const events = data.feedEvents ?? [];
    expect(events[0].type).toBe("challenge_issued");
  });
});

describe("completeChallenge", () => {
  it("returns null when no active challenge", () => {
    expect(completeChallenge(makeGameData())).toBeNull();
  });

  it("awards bonus XP and clears the challenge", () => {
    const data = issueChallenge(makeGameData(), "Run 5K", "strength", 5);
    const result = completeChallenge(data)!;
    expect(result.newData.activeChallenge).toBeUndefined();
    expect(result.nextChainStep).toBe(false);
    // Bonus XP should have been added
    expect(result.newData.activities.length).toBeGreaterThan(0);
  });

  it("pushes challenge_completed feed event", () => {
    const data = issueChallenge(makeGameData(), "Run 5K", "strength", 5);
    const result = completeChallenge(data)!;
    const completedEvents = (result.newData.feedEvents ?? []).filter(
      (e) => e.type === "challenge_completed"
    );
    expect(completedEvents.length).toBe(1);
  });

  it("auto-issues next chain step", () => {
    const steps: ChainStep[] = [
      { description: "Step 1", stat: "strength", bonusXP: 2 },
      { description: "Step 2", stat: "wisdom", bonusXP: 3 },
    ];
    const data = issueChallengeChain(makeGameData(), steps);
    const result = completeChallenge(data)!;
    expect(result.nextChainStep).toBe(true);
    const nextChallenge = getActiveChallenge(result.newData)!;
    expect(nextChallenge.description).toBe("Step 2");
    expect(nextChallenge.chainIndex).toBe(2);
  });

  it("clears pending steps after last chain step completes", () => {
    const steps: ChainStep[] = [
      { description: "Step 1", stat: "strength", bonusXP: 2 },
      { description: "Step 2", stat: "wisdom", bonusXP: 3 },
    ];
    const data = issueChallengeChain(makeGameData(), steps);
    // Complete step 1
    const after1 = completeChallenge(data)!;
    // Complete step 2
    const after2 = completeChallenge(after1.newData)!;
    expect(after2.nextChainStep).toBe(false);
    expect(after2.newData.activeChallenge).toBeUndefined();
    expect(after2.newData.pendingChainSteps).toBeUndefined();
  });
});

describe("dismissChallenge", () => {
  it("clears active challenge", () => {
    const data = issueChallenge(makeGameData(), "Test", "strength", 3);
    const result = dismissChallenge(data);
    expect(result.activeChallenge).toBeUndefined();
  });

  it("clears pending chain steps too", () => {
    const steps: ChainStep[] = [
      { description: "Step 1", stat: "strength", bonusXP: 2 },
      { description: "Step 2", stat: "wisdom", bonusXP: 3 },
    ];
    const data = issueChallengeChain(makeGameData(), steps);
    const result = dismissChallenge(data);
    expect(result.activeChallenge).toBeUndefined();
    expect(result.pendingChainSteps).toBeUndefined();
  });

  it("is safe to call with no active challenge", () => {
    const data = makeGameData();
    const result = dismissChallenge(data);
    expect(result.activeChallenge).toBeUndefined();
  });
});

// ═══════════════════════════════════
// formatRelativeTime
// ═══════════════════════════════════

describe("formatRelativeTime", () => {
  it("returns 'Just now' for timestamps under 1 minute ago", () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo.toISOString())).toBe("Just now");
  });

  it("returns minutes for timestamps under 1 hour ago", () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo.toISOString())).toBe("5m ago");
  });
});

// ═══════════════════════════════════
// Mascot Name
// ═══════════════════════════════════

describe("getMascotName / setMascotName", () => {
  it("defaults to Skipper", () => {
    expect(getMascotName(makeGameData())).toBe("Skipper");
  });

  it("returns custom name", () => {
    const data = makeGameData({ mascotName: "Waddles" });
    expect(getMascotName(data)).toBe("Waddles");
  });

  it("sets and retrieves a name", () => {
    const data = setMascotName(makeGameData(), "Waddles");
    expect(getMascotName(data)).toBe("Waddles");
  });

  it("trims and caps name at 20 chars", () => {
    const data = setMascotName(makeGameData(), "  " + "A".repeat(30) + "  ");
    expect(getMascotName(data)).toBe("A".repeat(20));
  });

  it("defaults to Skipper for empty name", () => {
    const data = setMascotName(makeGameData(), "   ");
    expect(getMascotName(data)).toBe("Skipper");
  });
});

describe("isMascotNameUnlocked", () => {
  it("returns false below level 5", () => {
    expect(isMascotNameUnlocked(4)).toBe(false);
  });

  it("returns true at level 5", () => {
    expect(isMascotNameUnlocked(5)).toBe(true);
  });

  it("returns true above level 5", () => {
    expect(isMascotNameUnlocked(30)).toBe(true);
  });
});

// ═══════════════════════════════════
// Profile Picture
// ═══════════════════════════════════

describe("getProfilePicture / saveProfilePicture", () => {
  it("returns null when no picture set", () => {
    expect(getProfilePicture(makeGameData())).toBeNull();
  });

  it("saves and retrieves a picture", () => {
    const data = saveProfilePicture(makeGameData(), "data:image/png;base64,abc");
    expect(getProfilePicture(data)).toBe("data:image/png;base64,abc");
  });

  it("removes picture when null is passed", () => {
    let data = saveProfilePicture(makeGameData(), "data:image/png;base64,abc");
    data = saveProfilePicture(data, null);
    expect(getProfilePicture(data)).toBeNull();
  });
});
