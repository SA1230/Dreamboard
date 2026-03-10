import { DamageKey, GameData } from "./types";

export interface DamageDefinition {
  key: DamageKey;
  label: string;
  pastTenseLabel: string;
  description: string;
  emoji: string;
  color: string;
  enabledBackground: string;
}

export const DAMAGE_DEFINITIONS: DamageDefinition[] = [
  { key: "substance", label: "Substances", pastTenseLabel: "Used substances", description: "Alcohol, nicotine, or other substances", emoji: "🍺", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "screentime", label: "Excess screen time", pastTenseLabel: "Excess screen time", description: "Doomscrolling or binge-watching", emoji: "📱", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "junkfood", label: "Junk food", pastTenseLabel: "Ate junk food", description: "Fast food, snacks, or processed food", emoji: "🍔", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "badsleep", label: "Bad sleep", pastTenseLabel: "Slept badly", description: "Late nights or disrupted sleep", emoji: "🌙", color: "#ef4444", enabledBackground: "#fef2f2" },
];

// The 4 built-in damage keys (custom damage uses dynamic keys prefixed with "custom_damage_")
export const BUILTIN_DAMAGE_KEYS: DamageKey[] = DAMAGE_DEFINITIONS.map((d) => d.key);

// Quick lookup by key for components that need a single damage label
export const DAMAGE_LABELS: Record<string, string> = Object.fromEntries(
  DAMAGE_DEFINITIONS.map((d) => [d.key, d.label])
);

// Past-tense lookup for retrospective views (calendar day detail, activity feed)
export const DAMAGE_PAST_LABELS: Record<string, string> = Object.fromEntries(
  DAMAGE_DEFINITIONS.map((d) => [d.key, d.pastTenseLabel])
);

/** Unified lookup: finds a damage definition by key, checking built-in first, then custom.
 *  Returns a normalized shape with optional emoji (built-in) or iconKey (custom). */
export function findDamageDefinition(
  data: GameData,
  key: string
): { label: string; pastTenseLabel: string; emoji?: string; iconKey?: string; color: string; enabledBackground: string } | undefined {
  const builtIn = DAMAGE_DEFINITIONS.find((d) => d.key === key);
  if (builtIn) return { label: builtIn.label, pastTenseLabel: builtIn.pastTenseLabel, emoji: builtIn.emoji, color: builtIn.color, enabledBackground: builtIn.enabledBackground };
  const custom = (data.customDamageDefinitions ?? []).find((d) => d.key === key);
  if (custom) return { label: custom.label, pastTenseLabel: custom.pastTenseLabel, iconKey: custom.iconKey, color: custom.color, enabledBackground: custom.enabledBackground };
  return undefined;
}
