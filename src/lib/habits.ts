import { HabitKey, GameData } from "./types";

export interface HabitDefinition {
  key: HabitKey;
  label: string;
  pastTenseLabel: string;
  completedLabel: string;
  description: string;
  emoji: string;
  color: string;
  enabledBackground: string;
}

export const HABIT_DEFINITIONS: HabitDefinition[] = [
  { key: "water", label: "Drink 64oz", pastTenseLabel: "Drank 64oz water", completedLabel: "64oz done!", description: "Track daily water intake", emoji: "💧", color: "#3b82f6", enabledBackground: "#eff6ff" },
  { key: "nails", label: "No nail biting", pastTenseLabel: "No nail biting", completedLabel: "Nails safe!", description: "Keep nails healthy", emoji: "💅", color: "#ec4899", enabledBackground: "#fdf2f8" },
  { key: "brush", label: "Brush 2x", pastTenseLabel: "Brushed 2x", completedLabel: "Brushed!", description: "Brush teeth morning & night", emoji: "🪥", color: "#14b8a6", enabledBackground: "#f0fdfa" },
  { key: "nosugar", label: "No sugar", pastTenseLabel: "No sugar", completedLabel: "Sugar free!", description: "Avoid added sugars", emoji: "🍩", color: "#f59e0b", enabledBackground: "#fffbeb" },
  { key: "floss", label: "Floss teeth", pastTenseLabel: "Flossed teeth", completedLabel: "Flossed!", description: "Floss at least once daily", emoji: "🦷", color: "#8b5cf6", enabledBackground: "#f5f3ff" },
  { key: "steps", label: "10k steps", pastTenseLabel: "10k steps", completedLabel: "10k done!", description: "Walk 10,000 steps", emoji: "👟", color: "#10b981", enabledBackground: "#ecfdf5" },
];

// The 6 built-in habit keys (custom habits use dynamic keys prefixed with "custom_habit_")
export const BUILTIN_HABIT_KEYS: HabitKey[] = HABIT_DEFINITIONS.map((h) => h.key);

// Quick lookup by key for components that need a single habit's label
export const HABIT_LABELS: Record<string, string> = Object.fromEntries(
  HABIT_DEFINITIONS.map((h) => [h.key, h.label])
);

// Past-tense lookup for retrospective views (calendar day detail)
export const HABIT_PAST_LABELS: Record<string, string> = Object.fromEntries(
  HABIT_DEFINITIONS.map((h) => [h.key, h.pastTenseLabel])
);

/** Unified lookup: finds a habit definition by key, checking built-in first, then custom.
 *  Returns a normalized shape with optional emoji (built-in) or iconKey (custom). */
export function findHabitDefinition(
  data: GameData,
  key: string
): { label: string; pastTenseLabel: string; completedLabel: string; emoji?: string; iconKey?: string; color: string; enabledBackground: string } | undefined {
  const builtIn = HABIT_DEFINITIONS.find((h) => h.key === key);
  if (builtIn) return { label: builtIn.label, pastTenseLabel: builtIn.pastTenseLabel, completedLabel: builtIn.completedLabel, emoji: builtIn.emoji, color: builtIn.color, enabledBackground: builtIn.enabledBackground };
  const custom = (data.customHabitDefinitions ?? []).find((h) => h.key === key);
  if (custom) return { label: custom.label, pastTenseLabel: custom.pastTenseLabel, completedLabel: custom.completedLabel, iconKey: custom.iconKey, color: custom.color, enabledBackground: custom.enabledBackground };
  return undefined;
}
