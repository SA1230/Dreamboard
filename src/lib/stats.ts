import { StatKey } from "./types";

export interface StatDefinition {
  key: StatKey;
  name: string;
  description: string;
  earnsXP: string;
  color: string;
  backgroundColor: string;
  progressColor: string;
  iconKey: string;
}

// Preset color palettes — each has primary, background, and progress colors
export interface ColorPreset {
  color: string;
  backgroundColor: string;
  progressColor: string;
  label: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { color: "#C45C3E", backgroundColor: "#FDF0EC", progressColor: "#E07A5F", label: "Terracotta" },
  { color: "#5B7AA5", backgroundColor: "#EDF2F8", progressColor: "#7BA0C9", label: "Ocean" },
  { color: "#6A8E5B", backgroundColor: "#EFF5EC", progressColor: "#8AB878", label: "Sage" },
  { color: "#C9943E", backgroundColor: "#FDF6EC", progressColor: "#E5B85C", label: "Gold" },
  { color: "#8B6B4A", backgroundColor: "#F5F0EB", progressColor: "#B08E6A", label: "Walnut" },
  { color: "#6B7B8D", backgroundColor: "#EEF1F4", progressColor: "#8DA0B3", label: "Slate" },
  { color: "#8B6BA5", backgroundColor: "#F3EFF7", progressColor: "#A98DC4", label: "Lavender" },
  { color: "#B8963E", backgroundColor: "#F9F4E8", progressColor: "#D4B05C", label: "Honey" },
  { color: "#C46B8A", backgroundColor: "#FDF0F4", progressColor: "#D88BA3", label: "Rose" },
  { color: "#5B9E8F", backgroundColor: "#ECF5F3", progressColor: "#7BBFAF", label: "Teal" },
  { color: "#A0785C", backgroundColor: "#F6F0EB", progressColor: "#BF9A7E", label: "Copper" },
  { color: "#7B8B5B", backgroundColor: "#F1F3EC", progressColor: "#9AAD78", label: "Olive" },
  { color: "#8B5C5C", backgroundColor: "#F5ECEC", progressColor: "#AD7E7E", label: "Dusty Red" },
  { color: "#5C6B8B", backgroundColor: "#ECEFF5", progressColor: "#7E8DAD", label: "Steel Blue" },
];

export const STAT_DEFINITIONS: Record<StatKey, StatDefinition> = {
  strength: {
    key: "strength",
    name: "Strength",
    description: "e.g. Gym, running, sports",
    earnsXP: "Went to the gym / completed a workout",
    color: "#C45C3E",
    backgroundColor: "#FDF0EC",
    progressColor: "#E07A5F",
    iconKey: "strength",
  },
  wisdom: {
    key: "wisdom",
    name: "Wisdom",
    description: "e.g. Reading, courses, podcasts",
    earnsXP: "Read a chapter or listened to an audiobook section",
    color: "#5B7AA5",
    backgroundColor: "#EDF2F8",
    progressColor: "#7BA0C9",
    iconKey: "wisdom",
  },
  vitality: {
    key: "vitality",
    name: "Vitality",
    description: "e.g. Healthy meals, sleep, hydration",
    earnsXP: "Cooked a healthy meal / got 7+ hrs sleep",
    color: "#6A8E5B",
    backgroundColor: "#EFF5EC",
    progressColor: "#8AB878",
    iconKey: "vitality",
  },
  charisma: {
    key: "charisma",
    name: "Charisma",
    description: "e.g. Social events, networking, dates",
    earnsXP: "Attended a social event / meaningful conversation",
    color: "#C9943E",
    backgroundColor: "#FDF6EC",
    progressColor: "#E5B85C",
    iconKey: "charisma",
  },
  craft: {
    key: "craft",
    name: "Craft",
    description: "e.g. Side projects, coding, creative work",
    earnsXP: "Worked on Made That or a side project",
    color: "#8B6B4A",
    backgroundColor: "#F5F0EB",
    progressColor: "#B08E6A",
    iconKey: "craft",
  },
  discipline: {
    key: "discipline",
    name: "Discipline",
    description: "e.g. Chores, errands, hard tasks",
    earnsXP: "Did a chore, errand, or hard task I was avoiding",
    color: "#6B7B8D",
    backgroundColor: "#EEF1F4",
    progressColor: "#8DA0B3",
    iconKey: "discipline",
  },
  spirit: {
    key: "spirit",
    name: "Spirit",
    description: "e.g. Meditation, journaling, gratitude",
    earnsXP: "Meditated, journaled, or reflected",
    color: "#8B6BA5",
    backgroundColor: "#F3EFF7",
    progressColor: "#A98DC4",
    iconKey: "spirit",
  },
  wealth: {
    key: "wealth",
    name: "Wealth",
    description: "e.g. Saving, budgeting, investing",
    earnsXP: "Saved money or took a financial action",
    color: "#B8963E",
    backgroundColor: "#F9F4E8",
    progressColor: "#D4B05C",
    iconKey: "wealth",
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
