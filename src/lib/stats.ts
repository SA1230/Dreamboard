import { StatKey } from "./types";

export interface StatDefinition {
  key: StatKey;
  name: string;
  description: string;
  earnsXP: string;
  color: string;
  backgroundColor: string;
  progressColor: string;
}

export const STAT_DEFINITIONS: Record<StatKey, StatDefinition> = {
  strength: {
    key: "strength",
    name: "Strength",
    description: "Fiery, powerful",
    earnsXP: "Went to the gym / completed a workout",
    color: "#C45C3E",
    backgroundColor: "#FDF0EC",
    progressColor: "#E07A5F",
  },
  wisdom: {
    key: "wisdom",
    name: "Wisdom",
    description: "Deep, calm",
    earnsXP: "Read a chapter or listened to an audiobook section",
    color: "#5B7AA5",
    backgroundColor: "#EDF2F8",
    progressColor: "#7BA0C9",
  },
  vitality: {
    key: "vitality",
    name: "Vitality",
    description: "Fresh, alive",
    earnsXP: "Cooked a healthy meal / got 7+ hrs sleep",
    color: "#6A8E5B",
    backgroundColor: "#EFF5EC",
    progressColor: "#8AB878",
  },
  charisma: {
    key: "charisma",
    name: "Charisma",
    description: "Bright, warm",
    earnsXP: "Attended a social event / meaningful conversation",
    color: "#C9943E",
    backgroundColor: "#FDF6EC",
    progressColor: "#E5B85C",
  },
  craft: {
    key: "craft",
    name: "Craft",
    description: "Industrious, focused",
    earnsXP: "Worked on Made That or a side project",
    color: "#8B6B4A",
    backgroundColor: "#F5F0EB",
    progressColor: "#B08E6A",
  },
  discipline: {
    key: "discipline",
    name: "Discipline",
    description: "Sturdy, steady",
    earnsXP: "Did a chore, errand, or hard task I was avoiding",
    color: "#6B7B8D",
    backgroundColor: "#EEF1F4",
    progressColor: "#8DA0B3",
  },
  spirit: {
    key: "spirit",
    name: "Spirit",
    description: "Ethereal, peaceful",
    earnsXP: "Meditated, journaled, or reflected",
    color: "#8B6BA5",
    backgroundColor: "#F3EFF7",
    progressColor: "#A98DC4",
  },
  wealth: {
    key: "wealth",
    name: "Wealth",
    description: "Rich, golden",
    earnsXP: "Saved money or took a financial action",
    color: "#B8963E",
    backgroundColor: "#F9F4E8",
    progressColor: "#D4B05C",
  },
};

export const STAT_KEYS: StatKey[] = [
  "strength",
  "wisdom",
  "vitality",
  "charisma",
  "craft",
  "discipline",
  "spirit",
  "wealth",
];
