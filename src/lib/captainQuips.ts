import { Activity, StatKey, Challenge } from "./types";
import { StatDefinition } from "./stats";
import { getTodayString } from "./storage";

// --- Daily seed ---

/** Deterministic daily index: same quip all day, different tomorrow */
function getDailyIndex(poolSize: number, salt: string = ""): number {
  const today = getTodayString() + salt;
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % poolSize;
}

/** Extract the first sentence from a verdict message */
function firstSentence(text: string): string {
  // Match up to the first sentence-ending punctuation followed by a space or end of string
  const match = text.match(/^.+?[.!?](?:\s|$)/);
  if (match) return match[0].trim();
  // No punctuation found — return up to 100 chars
  return text.length > 100 ? text.slice(0, 97) + "..." : text;
}

// --- Template pools ---

const ABSENCE_QUIPS = [
  "Haven't seen you in {days} days. Did you forget I keep score?",
  "You've been awfully quiet, adventurer. {days} days of silence speaks volumes.",
  "{days} days? I was starting to think you'd retired. Prove me wrong.",
  "I've been counting. {days} days without a report. My pen is getting dusty.",
];

const LONG_ABSENCE_QUIPS = [
  "Well, look who finally remembered. I've been here the whole time, you know.",
  "I was about to send a search party. Welcome back, stranger.",
  "Oh, you're alive. Good. I was starting to prepare a eulogy.",
];

const STREAK_QUIPS = [
  "{days}-day {stat} streak. Don't let it die — I'm watching.",
  "You've hit {stat} {days} days straight. I'm starting to believe you.",
  "That {stat} streak is {days} days strong. Not bad for someone your level.",
  "{days} days of {stat} in a row. Keep it going, or I'll notice.",
];

const CHALLENGE_QUIPS = [
  "That side quest isn't going to complete itself, you know.",
  "I'm still waiting on that challenge. No pressure. Well, some pressure.",
  "You've got an open quest. I don't forget, and neither should you.",
  "About that challenge I gave you — any progress, adventurer?",
];

const LOW_LEVEL_QUIPS = [
  "Level {level}. Every legend started somewhere, I suppose.",
  "A {rank} at level {level}. We all start at the bottom.",
  "You're level {level}. Plenty of room to impress me.",
];

const MID_LEVEL_QUIPS = [
  "A {rank}, huh? You're getting there. Slowly.",
  "Level {level}. I'll admit, you haven't quit on me yet.",
  "A {rank} at level {level}. You're past the \"just trying it out\" phase.",
];

const HIGH_LEVEL_QUIPS = [
  "A {rank} at level {level}. I'll admit, I'm mildly impressed.",
  "Level {level}. You've earned the right to swagger a little.",
  "A {rank}. You've been at this a while. Respect.",
];

const FALLBACK_QUIPS = [
  "Another day, another chance to impress me. Or disappoint me. Your call.",
  "I'm not saying I missed you, but the tavern was getting quiet.",
  "You know what separates legends from stories? Showing up.",
  "Ready when you are, adventurer. My scoring pen is sharp.",
  "Every day you don't log something, a stat gathers dust. Just saying.",
];

// --- Interpolation ---

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? key));
}

// --- Main function ---

export interface QuipParams {
  activities: Activity[];
  streaks: Record<StatKey, number>;
  activeChallenge: Challenge | null;
  overallLevel: number;
  rank: string;
  definitions: Record<StatKey, StatDefinition>;
}

/** Returns a daily quip string, or null if user has no activities yet */
export function getCaptainQuip(params: QuipParams): string | null {
  const { activities, streaks, activeChallenge, overallLevel, rank, definitions } = params;

  // No activities = first-run, don't show quip
  if (activities.length === 0) return null;

  const todayStr = getTodayString();
  const lastActivity = activities[0];
  const lastDate = lastActivity.timestamp.slice(0, 10); // "YYYY-MM-DD"

  // Priority 1: Today's verdict excerpt
  if (lastDate === todayStr && lastActivity.verdictMessage) {
    return firstSentence(lastActivity.verdictMessage);
  }

  // Priority 2: Absence (2+ days since last activity)
  const daysSinceLastActivity = Math.floor(
    (new Date(todayStr + "T12:00:00").getTime() - new Date(lastDate + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActivity >= 8) {
    const pool = LONG_ABSENCE_QUIPS;
    return pool[getDailyIndex(pool.length, "absence")];
  }

  if (daysSinceLastActivity >= 2) {
    const pool = ABSENCE_QUIPS;
    return interpolate(pool[getDailyIndex(pool.length, "absence")], { days: daysSinceLastActivity });
  }

  // Priority 3: Active streak (3+ days on any stat)
  const statKeys = Object.keys(streaks) as StatKey[];
  const bestStreak = statKeys
    .filter((k) => streaks[k] >= 3)
    .sort((a, b) => streaks[b] - streaks[a] || a.localeCompare(b))[0];

  if (bestStreak) {
    const pool = STREAK_QUIPS;
    return interpolate(pool[getDailyIndex(pool.length, "streak")], {
      days: streaks[bestStreak],
      stat: definitions[bestStreak]?.name ?? bestStreak,
    });
  }

  // Priority 4: Active challenge nudge
  if (activeChallenge) {
    const pool = CHALLENGE_QUIPS;
    return pool[getDailyIndex(pool.length, "challenge")];
  }

  // Priority 5: Level/rank quip
  if (overallLevel >= 30) {
    const pool = HIGH_LEVEL_QUIPS;
    return interpolate(pool[getDailyIndex(pool.length, "level")], { level: overallLevel, rank });
  }
  if (overallLevel >= 10) {
    const pool = MID_LEVEL_QUIPS;
    return interpolate(pool[getDailyIndex(pool.length, "level")], { level: overallLevel, rank });
  }
  if (overallLevel >= 3) {
    const pool = LOW_LEVEL_QUIPS;
    return interpolate(pool[getDailyIndex(pool.length, "level")], { level: overallLevel, rank });
  }

  // Priority 6: Fallback
  const pool = FALLBACK_QUIPS;
  return pool[getDailyIndex(pool.length, "fallback")];
}
