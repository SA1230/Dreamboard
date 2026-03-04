export type StatKey =
  | "strength"
  | "wisdom"
  | "vitality"
  | "charisma"
  | "craft"
  | "discipline"
  | "spirit"
  | "wealth";

export interface StatProgress {
  xp: number;
  level: number;
}

export interface Activity {
  id: string;
  stat: StatKey;
  note: string;
  timestamp: string;
}

export interface CustomStatOverride {
  name?: string;
  description?: string;
  earnsXP?: string;
  color?: string;
  iconKey?: string;
}

export interface GameData {
  stats: Record<StatKey, StatProgress>;
  activities: Activity[];
  customDefinitions?: Partial<Record<StatKey, CustomStatOverride>>;
}
