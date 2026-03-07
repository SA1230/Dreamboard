import { HabitKey } from "./types";

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

// Quick lookup by key for components that need a single habit's label
export const HABIT_LABELS: Record<HabitKey, string> = Object.fromEntries(
  HABIT_DEFINITIONS.map((h) => [h.key, h.label])
) as Record<HabitKey, string>;

// Past-tense lookup for retrospective views (calendar day detail)
export const HABIT_PAST_LABELS: Record<HabitKey, string> = Object.fromEntries(
  HABIT_DEFINITIONS.map((h) => [h.key, h.pastTenseLabel])
) as Record<HabitKey, string>;
