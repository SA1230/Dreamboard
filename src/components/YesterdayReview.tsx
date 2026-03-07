"use client";

import { GameData, HabitKey, DamageKey } from "@/lib/types";
import {
  getYesterdayString,
  isHabitCompletedForDate,
  isDamageMarkedForDate,
  getEnabledHabits,
  getEnabledDamage,
  getPointsBalance,
} from "@/lib/storage";
import { HABIT_DEFINITIONS } from "@/lib/habits";
import { DAMAGE_DEFINITIONS } from "@/lib/damage";

interface YesterdayReviewProps {
  gameData: GameData;
  onToggleHabit: (habitKey: HabitKey) => void;
  onToggleDamage: (damageKey: DamageKey) => void;
  ppToast?: { text: string; color: string } | null;
}

/** Format yesterday's date as "Wed, March 5" */
function formatYesterdayDate(dateString: string): string {
  // Parse YYYY-MM-DD as local date (not UTC)
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  return `${dayName}, ${monthName} ${day}`;
}

export function YesterdayReview({ gameData, onToggleHabit, onToggleDamage, ppToast }: YesterdayReviewProps) {
  // Compute once — stable even if clock passes midnight while page is open
  const yesterdayString = getYesterdayString();

  const enabledHabits = getEnabledHabits(gameData);
  const enabledDamage = getEnabledDamage(gameData);

  // Count yesterday's habits and damage for the PP summary
  const habitsCompletedCount = enabledHabits.filter(
    (key) => isHabitCompletedForDate(gameData, key, yesterdayString)
  ).length;
  const damageMarkedCount = enabledDamage.filter(
    (key) => isDamageMarkedForDate(gameData, key, yesterdayString)
  ).length;
  const yesterdayNet = habitsCompletedCount - damageMarkedCount;

  const pointsBalance = getPointsBalance(gameData);

  // Nothing to show if user has no habits or damage enabled
  if (enabledHabits.length === 0 && enabledDamage.length === 0) return null;

  return (
    <section className="mb-6">
      <div
        className="rounded-2xl border border-stone-200 overflow-hidden"
        style={{ backgroundColor: "#FDFBF7" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-base font-bold text-stone-700">How was yesterday?</h2>
          <span className="text-xs font-medium text-stone-400">
            {formatYesterdayDate(yesterdayString)}
          </span>
        </div>

        {/* Habit checklist */}
        {enabledHabits.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Habits
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {enabledHabits.map((habitKey) => {
                const completed = isHabitCompletedForDate(gameData, habitKey, yesterdayString);
                const definition = HABIT_DEFINITIONS.find((h) => h.key === habitKey);
                if (!definition) return null;

                return (
                  <button
                    key={habitKey}
                    onClick={() => onToggleHabit(habitKey)}
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
                const marked = isDamageMarkedForDate(gameData, damageKey, yesterdayString);
                const definition = DAMAGE_DEFINITIONS.find((d) => d.key === damageKey);
                if (!definition) return null;

                return (
                  <button
                    key={damageKey}
                    onClick={() => onToggleDamage(damageKey)}
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
                <span className={`font-semibold ${yesterdayNet >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {yesterdayNet >= 0 ? "+" : ""}{yesterdayNet} PP
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
