"use client";

import { FeedEvent, StatKey, HabitKey, DamageKey } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { StatIcon } from "./StatIcons";

interface ActivityLogProps {
  feedEvents: FeedEvent[];
  definitions: Record<StatKey, StatDefinition>;
}

// Human-readable labels for habits and damage types
const HABIT_LABELS: Record<HabitKey, string> = {
  water: "Drink 64oz",
  nails: "No nail biting",
  brush: "Brush 2x",
  nosugar: "No sugar",
  floss: "Floss teeth",
  steps: "10k steps",
};

const HABIT_EMOJI: Record<HabitKey, string> = {
  water: "\u{1F4A7}",
  nails: "\u{1F485}",
  brush: "\u{1FAA5}",
  nosugar: "\u{1F6AB}",
  floss: "\u{1F9B7}",
  steps: "\u{1F6B6}",
};

const DAMAGE_LABELS: Record<DamageKey, string> = {
  substance: "Substance used",
  screentime: "Excess screen time",
  junkfood: "Junk food eaten",
  badsleep: "Bad sleep",
};

const DAMAGE_EMOJI: Record<DamageKey, string> = {
  substance: "\u{1F37A}",
  screentime: "\u{1F4F1}",
  junkfood: "\u{1F354}",
  badsleep: "\u{1F319}",
};

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
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60">
      <div style={{ color: definition.color }} className="flex-shrink-0">
        <StatIcon iconKey={definition.iconKey} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: definition.color }}>
            {definition.name}
          </span>
          <span className="text-xs text-stone-300">+1 XP</span>
        </div>
        {event.note && (
          <p className="text-xs text-stone-400 truncate">{event.note}</p>
        )}
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
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
        backgroundColor: "rgba(254, 243, 199, 0.5)",
        borderColor: "#fbbf24",
        borderStyle: "solid",
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: definition.color + "20", color: definition.color }}>
        <StatIcon iconKey={definition.iconKey} className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-700">Level Up!</span>
          <span className="text-xs font-semibold" style={{ color: definition.color }}>
            {definition.name}
          </span>
        </div>
        <p className="text-xs text-amber-600/70">
          Reached level {event.newLevel}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1">
        <span className="text-lg font-black text-amber-500">{event.newLevel}</span>
      </div>
    </div>
  );
}

function OverallLevelUpRow({ event }: { event: Extract<FeedEvent, { type: "overall_level_up" }> }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
      style={{
        background: "linear-gradient(135deg, rgba(180, 150, 100, 0.08) 0%, rgba(200, 170, 110, 0.12) 100%)",
        borderColor: "#c4a265",
      }}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 border border-stone-300">
        <span className="text-sm">&#x1F427;</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: "#8b6914" }}>Overall Level Up!</span>
        </div>
        <p className="text-xs text-stone-400">
          Level {event.previousLevel} → <span className="font-semibold text-stone-600">{event.newLevel}</span>
        </p>
      </div>
      <span className="text-xs text-stone-300 flex-shrink-0">
        {formatTimestamp(event.timestamp)}
      </span>
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

export function ActivityLog({ feedEvents, definitions }: ActivityLogProps) {
  const recentEvents = feedEvents.slice(0, 30);

  if (recentEvents.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-sm">No activities yet. Click a + button to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentEvents.map((event) => {
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
          default:
            return null;
        }
      })}
    </div>
  );
}
