"use client";

import { FeedEvent, StatKey } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { HABIT_DEFINITIONS, HABIT_LABELS } from "@/lib/habits";
import { DAMAGE_DEFINITIONS, DAMAGE_LABELS } from "@/lib/damage";
import { StatIcon } from "./StatIcons";
import { Trophy } from "lucide-react";

interface ActivityLogProps {
  feedEvents: FeedEvent[];
  definitions: Record<StatKey, StatDefinition>;
}

// Build emoji lookup maps from shared definitions
const HABIT_EMOJI = Object.fromEntries(HABIT_DEFINITIONS.map((h) => [h.key, h.emoji]));
const DAMAGE_EMOJI = Object.fromEntries(DAMAGE_DEFINITIONS.map((d) => [d.key, d.emoji]));

// --- Grouping types ---

interface ActivityGroup {
  kind: "activity_group";
  note: string;
  timestamp: string;
  xpGains: Extract<FeedEvent, { type: "xp_gain" }>[];
  levelUps: Extract<FeedEvent, { type: "level_up" }>[];
  overallLevelUps: Extract<FeedEvent, { type: "overall_level_up" }>[];
  rankUps: Extract<FeedEvent, { type: "rank_up" }>[];
}

interface UngroupedEvent {
  kind: "ungrouped";
  event: FeedEvent;
}

type FeedItem = ActivityGroup | UngroupedEvent;

const GROUPING_WINDOW_MS = 5000;

function isWithinWindow(timestampA: string, timestampB: string): boolean {
  return Math.abs(new Date(timestampA).getTime() - new Date(timestampB).getTime()) <= GROUPING_WINDOW_MS;
}

function groupFeedEvents(events: FeedEvent[]): FeedItem[] {
  const result: FeedItem[] = [];
  let currentGroup: ActivityGroup | null = null;

  for (const event of events) {
    if (event.type === "xp_gain") {
      // Try to add to current group if same note and within time window
      if (currentGroup && currentGroup.note === event.note && isWithinWindow(currentGroup.timestamp, event.timestamp)) {
        currentGroup.xpGains.push(event);
      } else {
        // Flush previous group and start a new one
        if (currentGroup) result.push(currentGroup);
        currentGroup = {
          kind: "activity_group",
          note: event.note,
          timestamp: event.timestamp,
          xpGains: [event],
          levelUps: [],
          overallLevelUps: [],
          rankUps: [],
        };
      }
    } else if (event.type === "level_up") {
      // Attach to current group if within time window
      if (currentGroup && isWithinWindow(currentGroup.timestamp, event.timestamp)) {
        currentGroup.levelUps.push(event);
      } else {
        if (currentGroup) { result.push(currentGroup); currentGroup = null; }
        result.push({ kind: "ungrouped", event });
      }
    } else if (event.type === "overall_level_up") {
      if (currentGroup && isWithinWindow(currentGroup.timestamp, event.timestamp)) {
        currentGroup.overallLevelUps.push(event);
      } else {
        if (currentGroup) { result.push(currentGroup); currentGroup = null; }
        result.push({ kind: "ungrouped", event });
      }
    } else if (event.type === "rank_up") {
      if (currentGroup && isWithinWindow(currentGroup.timestamp, event.timestamp)) {
        currentGroup.rankUps.push(event);
      } else {
        if (currentGroup) { result.push(currentGroup); currentGroup = null; }
        result.push({ kind: "ungrouped", event });
      }
    } else {
      // Habits/damage — flush current group, then add as ungrouped
      if (currentGroup) { result.push(currentGroup); currentGroup = null; }
      result.push({ kind: "ungrouped", event });
    }
  }

  // Flush final group
  if (currentGroup) result.push(currentGroup);
  return result;
}

// --- Formatting ---

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function XPGainRow({ event, definitions }: { event: Extract<FeedEvent, { type: "xp_gain" }>; definitions: Record<StatKey, StatDefinition> }) {
  const definition = definitions[event.stat];
  return (
    <div className="px-4 py-3 rounded-xl bg-white/60">
      <div className="flex items-center gap-3">
        <div style={{ color: definition.color }} className="flex-shrink-0">
          <StatIcon iconKey={definition.iconKey} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: definition.color }}>
              {definition.name}
            </span>
            <span className="text-xs text-stone-300">+{event.amount ?? 1} XP</span>
          </div>
          {event.note && (
            <p className="text-xs text-stone-400 truncate">{event.note}</p>
          )}
        </div>
        <span className="text-xs text-stone-300 flex-shrink-0">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>
      {event.verdictMessage && (
        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-stone-100">
          <img
            src="/mascots/judge-hero.svg"
            alt=""
            className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 p-0.5 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-stone-400 italic leading-relaxed">{event.verdictMessage}</p>
        </div>
      )}
    </div>
  );
}

function HabitRow({ event }: { event: Extract<FeedEvent, { type: "habit_completed" | "habit_removed" }> }) {
  const isCompleted = event.type === "habit_completed";
  const label = HABIT_LABELS[event.habitKey];
  const emoji = HABIT_EMOJI[event.habitKey];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: isCompleted ? "rgba(220, 252, 231, 0.5)" : "rgba(255, 255, 255, 0.6)",
        borderColor: isCompleted ? "#86efac" : "#e7e5e4",
      }}
    >
      <span className="flex-shrink-0 text-base">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${isCompleted ? "text-emerald-600" : "text-stone-400"}`}>
            {label}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isCompleted
              ? "bg-emerald-100 text-emerald-600"
              : "bg-stone-100 text-stone-400"
          }`}>
            {isCompleted ? "+1 PP" : "Undone"}
          </span>
        </div>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

function DamageRow({ event }: { event: Extract<FeedEvent, { type: "damage_marked" | "damage_removed" }> }) {
  const isMarked = event.type === "damage_marked";
  const label = DAMAGE_LABELS[event.damageKey];
  const emoji = DAMAGE_EMOJI[event.damageKey];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: isMarked ? "rgba(254, 226, 226, 0.5)" : "rgba(255, 255, 255, 0.6)",
        borderColor: isMarked ? "#fca5a5" : "#e7e5e4",
      }}
    >
      <span className="flex-shrink-0 text-base">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${isMarked ? "text-red-500" : "text-stone-400"}`}>
            {label}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            isMarked
              ? "bg-red-100 text-red-500"
              : "bg-stone-100 text-stone-400"
          }`}>
            {isMarked ? "-1 PP" : "Undone"}
          </span>
        </div>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

function LevelUpRow({ event, definitions }: { event: Extract<FeedEvent, { type: "level_up" }>; definitions: Record<StatKey, StatDefinition> }) {
  const definition = definitions[event.stat];
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
      style={{
        backgroundColor: definition.color + "12",
        borderColor: definition.color + "60",
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: definition.color + "20", color: definition.color }}>
        <StatIcon iconKey={definition.iconKey} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: definition.color }}>Level Up!</span>
          <span className="text-xs font-semibold" style={{ color: definition.color }}>
            {definition.name}
          </span>
        </div>
        <p className="text-xs" style={{ color: definition.color + "90" }}>
          Reached level {event.newLevel}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1">
        <span className="text-lg font-black" style={{ color: definition.color }}>{event.newLevel}</span>
      </div>
    </div>
  );
}

function OverallLevelUpRow({ event }: { event: Extract<FeedEvent, { type: "overall_level_up" }> }) {
  return (
    <div className="overall-levelup-border relative rounded-xl overflow-hidden">
      {/* Pulsing corner sparkle */}
      <div
        className="absolute top-2 left-2.5 pointer-events-none"
        style={{ animation: "sparkle 2.4s ease-in-out infinite" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#d4a017" opacity="0.7" />
        </svg>
      </div>
      {/* Second sparkle, offset timing */}
      <div
        className="absolute top-3.5 left-8 pointer-events-none"
        style={{ animation: "sparkle 2.4s ease-in-out infinite 1.2s" }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#f5c842" opacity="0.5" />
        </svg>
      </div>
      <div className="relative flex items-center gap-3 px-5 py-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-300/60 overflow-hidden">
          <img src="/mascots/level-up-hero.svg" alt="Skipper" className="w-[3.25rem] h-[3.25rem]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-extrabold tracking-wide" style={{ color: "#8b6914" }}>Level Up!</span>
          <p className="text-xs text-stone-400 mt-0.5">
            Level {event.previousLevel} <span className="text-stone-300">&rarr;</span> <span className="font-bold text-amber-700">{event.newLevel}</span>
          </p>
        </div>
        <span className="text-xs text-stone-300 flex-shrink-0">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>
    </div>
  );
}

function RankUpRow({ event }: { event: Extract<FeedEvent, { type: "rank_up" }> }) {
  return (
    <div
      className="relative px-4 py-4 rounded-xl border-2 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 50%, rgba(217, 119, 6, 0.15) 100%)",
        borderColor: "#f59e0b",
      }}
    >
      {/* Decorative shimmer */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          animation: "shimmerSlide 3s ease-in-out infinite",
        }}
      />
      <div className="relative flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 border-2 border-amber-300">
          <span className="text-lg">&#x2B50;</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-amber-700 uppercase tracking-wide">New Rank!</span>
          </div>
          <p className="text-xs text-amber-600/80 mt-0.5">
            Promoted to <span className="font-bold">{event.newRank}</span> at level {event.newLevel}
          </p>
        </div>
        <span className="text-xs text-amber-500/60 flex-shrink-0">
          {formatTimestamp(event.timestamp)}
        </span>
      </div>
    </div>
  );
}

function PrizeUnlockedRow({ event }: { event: Extract<FeedEvent, { type: "prize_unlocked" }> }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
      style={{
        background: "rgba(245, 158, 11, 0.08)",
        borderColor: "#e5c880",
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 border border-amber-200">
        <Trophy size={16} className="text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-amber-700">Prize Unlocked!</span>
        <p className="text-xs text-amber-600/80">
          {event.prizeName} <span className="text-stone-300">at Lv. {event.unlockLevel}</span>
        </p>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

function ChallengeIssuedRow({ event, definitions }: { event: Extract<FeedEvent, { type: "challenge_issued" }>; definitions: Record<StatKey, StatDefinition> }) {
  const definition = definitions[event.stat];
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{
        background: `${definition?.color ?? "#d4a44a"}08`,
        borderColor: `${definition?.color ?? "#d4a44a"}30`,
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${definition?.color ?? "#d4a44a"}15`, color: definition?.color ?? "#d4a44a" }}
      >
        <StatIcon iconKey={definition?.iconKey ?? "sword"} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Challenge</span>
        <p className="text-xs text-stone-500 mt-0.5">{event.description}</p>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

function ChallengeCompletedRow({ event }: { event: Extract<FeedEvent, { type: "challenge_completed" }> }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
      style={{
        background: "rgba(16, 185, 129, 0.08)",
        borderColor: "#6ee7b7",
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-200">
        <span className="text-sm">&#x2694;</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-emerald-600">Quest Complete!</span>
        <p className="text-xs text-emerald-500/80 mt-0.5">
          {event.description} <span className="font-semibold">+{event.bonusXP} bonus XP</span>
        </p>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
    </div>
  );
}

function ActivityGroupCard({ group, definitions }: { group: ActivityGroup; definitions: Record<StatKey, StatDefinition> }) {
  const totalXP = group.xpGains.reduce((sum, e) => sum + (e.amount ?? 1), 0);
  const hasLevelUps = group.levelUps.length > 0 || group.overallLevelUps.length > 0 || group.rankUps.length > 0;
  const verdictMessage = group.xpGains[0]?.verdictMessage;

  return (
    <div className="px-4 py-3 rounded-xl bg-white/60">
      {/* Activity description */}
      {group.note && (
        <p className="text-xs text-stone-500 mb-1.5">{group.note}</p>
      )}

      {/* Captain's verdict quote */}
      {verdictMessage && (
        <div className="flex items-start gap-2 mb-2">
          <img
            src="/mascots/judge-hero.svg"
            alt=""
            className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 p-0.5 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-stone-400 italic leading-relaxed">{verdictMessage}</p>
        </div>
      )}

      {/* XP pills row */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {group.xpGains.map((event, index) => {
          const definition = definitions[event.stat];
          return (
            <span key={event.id} className="inline-flex items-center gap-1">
              {index > 0 && <span className="text-stone-200 text-xs mr-0.5">&middot;</span>}
              <span style={{ color: definition.color }} className="flex-shrink-0">
                <StatIcon iconKey={definition.iconKey} className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold" style={{ color: definition.color }}>
                {definition.name}
              </span>
              <span className="text-xs text-stone-300">+{event.amount ?? 1}</span>
            </span>
          );
        })}
        {group.xpGains.length > 1 && (
          <span className="text-xs font-semibold text-stone-400 ml-1">{totalXP} XP</span>
        )}
      </div>

      {/* Level-up sub-items */}
      {hasLevelUps && (
        <div className="border-t border-stone-100 mt-2 pt-2 space-y-1">
          {group.levelUps.map((event) => {
            const definition = definitions[event.stat];
            return (
              <div key={event.id} className="flex items-center gap-1.5">
                <span style={{ color: definition.color }} className="flex-shrink-0">
                  <StatIcon iconKey={definition.iconKey} className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold" style={{ color: definition.color }}>
                  {definition.name} reached level {event.newLevel}!
                </span>
              </div>
            );
          })}
          {group.overallLevelUps.map((event) => (
            <div key={event.id} className="flex items-center gap-1.5">
              <span className="text-xs">&#x2B50;</span>
              <span className="text-xs font-bold text-amber-700">
                Level {event.previousLevel} &rarr; {event.newLevel}
              </span>
            </div>
          ))}
          {group.rankUps.map((event) => (
            <div key={event.id} className="flex items-center gap-1.5">
              <span className="text-xs">&#x2B50;</span>
              <span className="text-xs font-bold text-amber-700">
                Promoted to {event.newRank}!
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div className="flex justify-end mt-1.5">
        <span className="text-xs text-stone-300">{formatTimestamp(group.timestamp)}</span>
      </div>
    </div>
  );
}

export function ActivityLog({ feedEvents, definitions }: ActivityLogProps) {
  const recentEvents = feedEvents.slice(0, 30);

  if (recentEvents.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-sm">No activities yet. Tell the Captain what you did to earn your first XP!</p>
      </div>
    );
  }

  const feedItems = groupFeedEvents(recentEvents);

  return (
    <div className="space-y-2">
      {feedItems.map((item, index) => {
        if (item.kind === "activity_group") {
          return (
            <ActivityGroupCard
              key={item.xpGains[0]?.id ?? `group-${index}`}
              group={item}
              definitions={definitions}
            />
          );
        }

        const event = item.event;
        switch (event.type) {
          case "xp_gain":
            return <XPGainRow key={event.id} event={event} definitions={definitions} />;
          case "habit_completed":
          case "habit_removed":
            return <HabitRow key={event.id} event={event} />;
          case "damage_marked":
          case "damage_removed":
            return <DamageRow key={event.id} event={event} />;
          case "level_up":
            return <LevelUpRow key={event.id} event={event} definitions={definitions} />;
          case "overall_level_up":
            return <OverallLevelUpRow key={event.id} event={event} />;
          case "rank_up":
            return <RankUpRow key={event.id} event={event} />;
          case "prize_unlocked":
            return <PrizeUnlockedRow key={event.id} event={event} />;
          case "challenge_issued":
            return <ChallengeIssuedRow key={event.id} event={event} definitions={definitions} />;
          case "challenge_completed":
            return <ChallengeCompletedRow key={event.id} event={event} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
