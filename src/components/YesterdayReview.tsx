"use client";

import { useState } from "react";
import { GameData, HabitKey, DamageKey } from "@/lib/types";
import {
  isHabitCompletedForDate,
  isDamageMarkedForDate,
  getEnabledHabits,
  getEnabledDamage,
  getPointsBalance,
} from "@/lib/storage";
import { HABIT_DEFINITIONS } from "@/lib/habits";
import { DAMAGE_DEFINITIONS } from "@/lib/damage";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YesterdayReviewProps {
  gameData: GameData;
  onToggleHabit: (habitKey: HabitKey, dateString: string) => void;
  onToggleDamage: (damageKey: DamageKey, dateString: string) => void;
  ppToast?: { text: string; color: string } | null;
}

/** Format a date string as "Wed, March 5" */
function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  return `${dayName}, ${monthName} ${day}`;
}

/** Get a date string N days ago from today */
function getDaysAgoString(daysAgo: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MAX_DAYS_BACK = 7;

export function YesterdayReview({ gameData, onToggleHabit, onToggleDamage, ppToast }: YesterdayReviewProps) {
  // daysAgo: 1 = yesterday (default), 2 = two days ago, etc. Max 7.
  const [daysAgo, setDaysAgo] = useState(1);
  const reviewDateString = getDaysAgoString(daysAgo);
  const isYesterday = daysAgo === 1;

  const enabledHabits = getEnabledHabits(gameData);
  const enabledDamage = getEnabledDamage(gameData);

  // Count this day's habits and damage for the PP summary
  const habitsCompletedCount = enabledHabits.filter(
    (key) => isHabitCompletedForDate(gameData, key, reviewDateString)
  ).length;
  const damageMarkedCount = enabledDamage.filter(
    (key) => isDamageMarkedForDate(gameData, key, reviewDateString)
  ).length;
  const dayNet = habitsCompletedCount - damageMarkedCount;

  const pointsBalance = getPointsBalance(gameData);

  // Nothing to show if user has no habits or damage enabled
  if (enabledHabits.length === 0 && enabledDamage.length === 0) return null;

  return (
    <section className="mb-6">
      <div
        className="rounded-2xl border border-stone-200 overflow-hidden"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        {/* Header with day navigation */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-base font-bold text-stone-700">
            {isYesterday ? "How was yesterday?" : "Catch up"}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDaysAgo((d) => Math.min(d + 1, MAX_DAYS_BACK))}
              disabled={daysAgo >= MAX_DAYS_BACK}
              className="p-0.5 rounded text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-stone-400 min-w-[100px] text-center">
              {formatDate(reviewDateString)}
            </span>
            <button
              onClick={() => setDaysAgo((d) => Math.max(d - 1, 1))}
              disabled={isYesterday}
              className="p-0.5 rounded text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Habit checklist */}
        {enabledHabits.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Habits
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {enabledHabits.map((habitKey) => {
                const completed = isHabitCompletedForDate(gameData, habitKey, reviewDateString);
                const definition = HABIT_DEFINITIONS.find((h) => h.key === habitKey);
                if (!definition) return null;

                return (
                  <button
                    key={habitKey}
                    onClick={() => onToggleHabit(habitKey, reviewDateString)}
                    className="flex items-center gap-2 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: completed ? definition.color : "transparent",
                        border: completed ? "none" : "2px solid #d6d3d1",
                      }}
                    >
                      {completed && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {/* Emoji + label */}
                    <span
                      className="text-sm transition-colors"
                      style={{ color: completed ? definition.color : "#a8a29e" }}
                    >
                      {definition.emoji} {definition.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Damage checklist */}
        {enabledDamage.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Damage
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {enabledDamage.map((damageKey) => {
                const marked = isDamageMarkedForDate(gameData, damageKey, reviewDateString);
                const definition = DAMAGE_DEFINITIONS.find((d) => d.key === damageKey);
                if (!definition) return null;

                return (
                  <button
                    key={damageKey}
                    onClick={() => onToggleDamage(damageKey, reviewDateString)}
                    className="flex items-center gap-2 py-1.5 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: marked ? "#ef4444" : "transparent",
                        border: marked ? "none" : "2px solid #d6d3d1",
                      }}
                    >
                      {marked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {/* Emoji + label */}
                    <span
                      className="text-sm transition-colors"
                      style={{ color: marked ? "#dc2626" : "#a8a29e" }}
                    >
                      {definition.emoji} {definition.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PP summary row */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50/80 border-t border-stone-100">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            {habitsCompletedCount > 0 && (
              <span className="text-emerald-600 font-semibold">+{habitsCompletedCount} habit{habitsCompletedCount !== 1 ? "s" : ""}</span>
            )}
            {habitsCompletedCount > 0 && damageMarkedCount > 0 && (
              <span className="text-stone-300">&middot;</span>
            )}
            {damageMarkedCount > 0 && (
              <span className="text-red-500 font-semibold">-{damageMarkedCount} damage</span>
            )}
            {habitsCompletedCount === 0 && damageMarkedCount === 0 && (
              <span className="text-stone-400">No entries yet</span>
            )}
            {(habitsCompletedCount > 0 || damageMarkedCount > 0) && (
              <>
                <span className="text-stone-300">&middot;</span>
                <span className={`font-semibold ${dayNet >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {dayNet >= 0 ? "+" : ""}{dayNet} PP
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M11.5 1L4 11h5.5L8.5 19 16 9h-5.5L11.5 1z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-bold text-amber-600">{pointsBalance.balance} PP</span>
            {ppToast && (
              <span
                className="text-xs font-bold animate-[xpPop_0.6s_ease-out_forwards]"
                style={{ color: ppToast.color }}
              >
                {ppToast.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
