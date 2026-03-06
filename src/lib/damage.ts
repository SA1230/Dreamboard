import { DamageKey } from "./types";

export interface DamageDefinition {
  key: DamageKey;
  label: string;
  description: string;
  emoji: string;
  color: string;
  enabledBackground: string;
}

export const DAMAGE_DEFINITIONS: DamageDefinition[] = [
  { key: "substance", label: "Substances", description: "Alcohol, nicotine, or other substances", emoji: "🍺", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "screentime", label: "Excess screen time", description: "Doomscrolling or binge-watching", emoji: "📱", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "junkfood", label: "Junk food", description: "Fast food, snacks, or processed food", emoji: "🍔", color: "#ef4444", enabledBackground: "#fef2f2" },
  { key: "badsleep", label: "Bad sleep", description: "Late nights or disrupted sleep", emoji: "🌙", color: "#ef4444", enabledBackground: "#fef2f2" },
];

// Quick lookup by key for components that need a single damage label
export const DAMAGE_LABELS: Record<DamageKey, string> = Object.fromEntries(
  DAMAGE_DEFINITIONS.map((d) => [d.key, d.label])
) as Record<DamageKey, string>;
