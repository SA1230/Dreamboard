import { describe, it, expect } from "vitest";
import { STAT_KEYS, STAT_DEFINITIONS, COLOR_PRESETS } from "../stats";
import { HABIT_DEFINITIONS, HABIT_LABELS, HABIT_PAST_LABELS } from "../habits";
import { DAMAGE_DEFINITIONS, DAMAGE_LABELS, DAMAGE_PAST_LABELS } from "../damage";
import { VISION_COLORS, VISION_GRADIENTS, MAX_VISION_CARDS, getCardGradient } from "../visionColors";
import { RANK_TITLES, RANK_COLORS, interpolateHexColor } from "../ranks";
import type { StatKey, HabitKey, DamageKey } from "../types";

// ═══════════════════════════════════
// Stats
// ═══════════════════════════════════

describe("STAT_KEYS", () => {
  it("has exactly 8 stat keys", () => {
    expect(STAT_KEYS).toHaveLength(8);
  });

  it("contains all expected keys", () => {
    const expected: StatKey[] = ["strength", "wisdom", "vitality", "charisma", "craft", "discipline", "spirit", "wealth"];
    expect(STAT_KEYS).toEqual(expected);
  });
});

describe("STAT_DEFINITIONS", () => {
  it("has a definition for every STAT_KEY", () => {
    for (const key of STAT_KEYS) {
      expect(STAT_DEFINITIONS[key]).toBeDefined();
      expect(STAT_DEFINITIONS[key].key).toBe(key);
    }
  });

  it("every definition has all required fields", () => {
    for (const key of STAT_KEYS) {
      const def = STAT_DEFINITIONS[key];
      expect(def.name).toBeTruthy();
      expect(def.description).toBeTruthy();
      expect(def.earnsXP).toBeTruthy();
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(def.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(def.progressColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(def.iconKey).toBeTruthy();
    }
  });
});

describe("COLOR_PRESETS", () => {
  it("has at least 8 presets (one per stat minimum)", () => {
    expect(COLOR_PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it("every preset has valid hex colors", () => {
    for (const preset of COLOR_PRESETS) {
      expect(preset.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.backgroundColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.progressColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(preset.label).toBeTruthy();
    }
  });

  it("has unique labels", () => {
    const labels = COLOR_PRESETS.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

// ═══════════════════════════════════
// Habits
// ═══════════════════════════════════

describe("HABIT_DEFINITIONS", () => {
  const expectedKeys: HabitKey[] = ["water", "nails", "brush", "nosugar", "floss", "steps"];

  it("has exactly 6 habits", () => {
    expect(HABIT_DEFINITIONS).toHaveLength(6);
  });

  it("every habit has all required fields", () => {
    for (const habit of HABIT_DEFINITIONS) {
      expect(expectedKeys).toContain(habit.key);
      expect(habit.label).toBeTruthy();
      expect(habit.pastTenseLabel).toBeTruthy();
      expect(habit.completedLabel).toBeTruthy();
      expect(habit.description).toBeTruthy();
      expect(habit.emoji).toBeTruthy();
      expect(habit.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(habit.enabledBackground).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has unique keys", () => {
    const keys = HABIT_DEFINITIONS.map((h) => h.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("HABIT_LABELS / HABIT_PAST_LABELS", () => {
  it("has an entry for every HabitKey", () => {
    const expectedKeys: HabitKey[] = ["water", "nails", "brush", "nosugar", "floss", "steps"];
    for (const key of expectedKeys) {
      expect(HABIT_LABELS[key]).toBeTruthy();
      expect(HABIT_PAST_LABELS[key]).toBeTruthy();
    }
  });

  it("matches definitions", () => {
    for (const def of HABIT_DEFINITIONS) {
      expect(HABIT_LABELS[def.key]).toBe(def.label);
      expect(HABIT_PAST_LABELS[def.key]).toBe(def.pastTenseLabel);
    }
  });
});

// ═══════════════════════════════════
// Damage
// ═══════════════════════════════════

describe("DAMAGE_DEFINITIONS", () => {
  const expectedKeys: DamageKey[] = ["substance", "screentime", "junkfood", "badsleep"];

  it("has exactly 4 damage types", () => {
    expect(DAMAGE_DEFINITIONS).toHaveLength(4);
  });

  it("every damage type has all required fields", () => {
    for (const damage of DAMAGE_DEFINITIONS) {
      expect(expectedKeys).toContain(damage.key);
      expect(damage.label).toBeTruthy();
      expect(damage.pastTenseLabel).toBeTruthy();
      expect(damage.description).toBeTruthy();
      expect(damage.emoji).toBeTruthy();
      expect(damage.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(damage.enabledBackground).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("has unique keys", () => {
    const keys = DAMAGE_DEFINITIONS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("DAMAGE_LABELS / DAMAGE_PAST_LABELS", () => {
  it("has an entry for every DamageKey", () => {
    const expectedKeys: DamageKey[] = ["substance", "screentime", "junkfood", "badsleep"];
    for (const key of expectedKeys) {
      expect(DAMAGE_LABELS[key]).toBeTruthy();
      expect(DAMAGE_PAST_LABELS[key]).toBeTruthy();
    }
  });

  it("matches definitions", () => {
    for (const def of DAMAGE_DEFINITIONS) {
      expect(DAMAGE_LABELS[def.key]).toBe(def.label);
      expect(DAMAGE_PAST_LABELS[def.key]).toBe(def.pastTenseLabel);
    }
  });
});

// ═══════════════════════════════════
// Vision Colors
// ═══════════════════════════════════

describe("VISION_COLORS", () => {
  it("has exactly 6 colors", () => {
    expect(VISION_COLORS).toHaveLength(6);
  });

  it("every color has name, bg, and border", () => {
    for (const color of VISION_COLORS) {
      expect(color.name).toBeTruthy();
      expect(color.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(color.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("VISION_GRADIENTS", () => {
  it("has exactly 6 gradients", () => {
    expect(VISION_GRADIENTS).toHaveLength(6);
  });

  it("every gradient has from, to, and accent colors", () => {
    for (const gradient of VISION_GRADIENTS) {
      expect(gradient.name).toBeTruthy();
      expect(gradient.from).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(gradient.to).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(gradient.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("MAX_VISION_CARDS", () => {
  it("is 20", () => {
    expect(MAX_VISION_CARDS).toBe(20);
  });
});

describe("getCardGradient", () => {
  it("returns a gradient for any card ID", () => {
    const gradient = getCardGradient("test-id-123");
    expect(gradient.name).toBeTruthy();
    expect(gradient.from).toBeTruthy();
  });

  it("is deterministic — same ID returns same gradient", () => {
    const a = getCardGradient("my-card");
    const b = getCardGradient("my-card");
    expect(a).toEqual(b);
  });

  it("varies across different IDs", () => {
    // Not guaranteed to differ (hash collision), but test that function runs for different inputs
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(getCardGradient(`card-${i}`).name);
    }
    // With 6 gradients and 20 inputs, we should hit multiple
    expect(results.size).toBeGreaterThan(1);
  });
});

// ═══════════════════════════════════
// Ranks
// ═══════════════════════════════════

describe("RANK_TITLES", () => {
  it("starts at level 1", () => {
    expect(RANK_TITLES[0][0]).toBe(1);
  });

  it("ends at level 60", () => {
    expect(RANK_TITLES[RANK_TITLES.length - 1][0]).toBe(60);
  });

  it("thresholds are strictly ascending", () => {
    for (let i = 1; i < RANK_TITLES.length; i++) {
      expect(RANK_TITLES[i][0]).toBeGreaterThan(RANK_TITLES[i - 1][0]);
    }
  });

  it("has unique rank names", () => {
    const names = RANK_TITLES.map(([, name]) => name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("RANK_COLORS", () => {
  it("has a color pair for every rank threshold", () => {
    for (const [threshold] of RANK_TITLES) {
      expect(RANK_COLORS[threshold]).toBeDefined();
      expect(RANK_COLORS[threshold]).toHaveLength(2);
    }
  });

  it("all colors are valid hex", () => {
    for (const [start, end] of Object.values(RANK_COLORS)) {
      expect(start).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(end).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("interpolateHexColor", () => {
  it("returns first color at t=0", () => {
    expect(interpolateHexColor("#ff0000", "#0000ff", 0)).toBe("rgb(255, 0, 0)");
  });

  it("returns second color at t=1", () => {
    expect(interpolateHexColor("#ff0000", "#0000ff", 1)).toBe("rgb(0, 0, 255)");
  });

  it("returns midpoint at t=0.5", () => {
    const result = interpolateHexColor("#000000", "#ffffff", 0.5);
    expect(result).toBe("rgb(128, 128, 128)");
  });
});
