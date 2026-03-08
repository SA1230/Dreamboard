"use client";

import { useState, useEffect, useMemo } from "react";
import { GameData, Activity, StatKey, HabitKey, DamageKey } from "@/lib/types";
import { loadGameData, getEffectiveDefinitions, getActivitiesByDay, getHabitsByDay, getDamageByDay, getEnabledHabits, getEnabledDamage } from "@/lib/storage";
import { StatDefinition } from "@/lib/stats";
import { MonthCalendar } from "@/components/MonthCalendar";
import { StatIcon } from "@/components/StatIcons";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { ModalBackdrop } from "@/components/ModalBackdrop";
import { HABIT_PAST_LABELS } from "@/lib/habits";
import { DAMAGE_PAST_LABELS } from "@/lib/damage";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function DayDetailModal({
  day,
  month,
  year,
  activities,
  habits,
  damage,
  definitions,
  onClose,
}: {
  day: number;
  month: number;
  year: number;
  activities: Activity[];
  habits: HabitKey[];
  damage: DamageKey[];
  definitions: Record<StatKey, StatDefinition>;
  onClose: () => void;
}) {
  const totalXP = activities.reduce((sum, a) => sum + (a.amount ?? 1), 0);

  // Group activities by note (same verdict produces multiple stat entries with same note)
  const groupedActivities: { note: string; awards: { stat: StatKey; amount: number }[] }[] = [];
  for (const activity of activities) {
    const existing = groupedActivities.find((g) => g.note === activity.note);
    if (existing) {
      existing.awards.push({ stat: activity.stat, amount: activity.amount ?? 1 });
    } else {
      groupedActivities.push({
        note: activity.note,
        awards: [{ stat: activity.stat, amount: activity.amount ?? 1 }],
      });
    }
  }

  const dateLabel = `${MONTH_NAMES[month]} ${day}, ${year}`;

  return (
    <ModalBackdrop onClose={onClose} align="bottom" backdropStyle="medium">
      <div
        className="w-full max-w-lg rounded-t-2xl p-6 pb-8 max-h-[70vh] overflow-y-auto"
        style={{
          backgroundColor: "#faf8f5",
          animation: "modalSlideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-700">{dateLabel}</h3>
            {totalXP > 0 && (
              <p className="text-sm text-stone-400">{totalXP} XP earned</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Activities */}
        {groupedActivities.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Activities</p>
            <div className="flex flex-col gap-2">
              {groupedActivities.map((group, index) => (
                <div
                  key={index}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                  <p className="text-sm text-stone-600 mb-1.5">{group.note}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.awards.map(({ stat, amount }) => {
                      const def = definitions[stat];
                      return (
                        <span
                          key={stat}
                          className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-0.5"
                          style={{
                            backgroundColor: def.color + "18",
                            color: def.color,
                          }}
                        >
                          <StatIcon iconKey={def.iconKey} className="w-3.5 h-3.5" />
                          {def.name} +{amount}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits */}
        {habits.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Healthy Habits</p>
            <div className="flex flex-wrap gap-1.5">
              {habits.map((habitKey) => (
                <span
                  key={habitKey}
                  className="inline-flex items-center text-xs font-medium rounded-lg px-2.5 py-1"
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    color: "#059669",
                  }}
                >
                  {HABIT_PAST_LABELS[habitKey]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Damage */}
        {damage.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Daily Damage</p>
            <div className="flex flex-wrap gap-1.5">
              {damage.map((damageKey) => (
                <span
                  key={damageKey}
                  className="inline-flex items-center text-xs font-medium rounded-lg px-2.5 py-1"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "#dc2626",
                  }}
                >
                  {DAMAGE_PAST_LABELS[damageKey]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty fallback — shouldn't happen since only tappable days have content */}
        {groupedActivities.length === 0 && habits.length === 0 && damage.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-4">No activity recorded this day.</p>
        )}
      </div>
    </ModalBackdrop>
  );
}

export default function CalendarPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setGameData(loadGameData());
  }, []);

  const definitions = useMemo(() => {
    if (!gameData) return null;
    return getEffectiveDefinitions(gameData);
  }, [gameData]);

  const activitiesByDay = useMemo(() => {
    if (!gameData) return {};
    return getActivitiesByDay(gameData.activities, year, month);
  }, [gameData, year, month]);

  const habitsByDay = useMemo(() => {
    if (!gameData) return {};
    return getHabitsByDay(gameData, year, month);
  }, [gameData, year, month]);

  const damageByDay = useMemo(() => {
    if (!gameData) return {};
    return getDamageByDay(gameData, year, month);
  }, [gameData, year, month]);

  // Count total XP for the displayed month
  const monthTotalXP = useMemo(() => {
    return Object.values(activitiesByDay).reduce((sum, dayStats) => {
      return sum + Object.values(dayStats).reduce((s, count) => s + (count ?? 0), 0);
    }, 0);
  }, [activitiesByDay]);

  // Get full Activity objects for the selected day (for the detail modal)
  const selectedDayActivities = useMemo(() => {
    if (!gameData || selectedDay === null) return [];
    return gameData.activities.filter((activity) => {
      const date = new Date(activity.timestamp);
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === selectedDay;
    });
  }, [gameData, year, month, selectedDay]);

  // Get habits and damage for selected day, filtered by enabled
  const selectedDayHabits = useMemo(() => {
    if (!gameData || selectedDay === null) return [];
    const dayHabits = habitsByDay[selectedDay] ?? [];
    const enabled = getEnabledHabits(gameData);
    return dayHabits.filter((h) => enabled.includes(h));
  }, [gameData, habitsByDay, selectedDay]);

  const selectedDayDamage = useMemo(() => {
    if (!gameData || selectedDay === null) return [];
    const dayDamage = damageByDay[selectedDay] ?? [];
    const enabled = getEnabledDamage(gameData);
    return dayDamage.filter((d) => enabled.includes(d));
  }, [gameData, damageByDay, selectedDay]);

  function goToPreviousMonth() {
    setSelectedDay(null);
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return;
    setSelectedDay(null);
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToCurrentMonth() {
    setSelectedDay(null);
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  if (!gameData || !definitions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 sm:px-8 py-8 pb-20 lg:px-16">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-700">Calendar</h1>
        </div>
        {!isCurrentMonth && (
          <button
            onClick={goToCurrentMonth}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Today
          </button>
        )}
      </header>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-stone-600">
            {MONTH_NAMES[month]} {year}
          </h2>
          <p className="text-xs text-stone-400">
            {monthTotalXP} XP earned this month
          </p>
        </div>
        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isCurrentMonth
              ? "bg-stone-50 text-stone-200 cursor-not-allowed"
              : "bg-stone-100 hover:bg-stone-200 text-stone-500"
          }`}
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar */}
      <MonthCalendar
        year={year}
        month={month}
        activitiesByDay={activitiesByDay}
        habitsByDay={habitsByDay}
        damageByDay={damageByDay}
        definitions={definitions}
        gameData={gameData}
        onDayTap={setSelectedDay}
        selectedDay={selectedDay}
      />

      {/* Day detail modal */}
      {selectedDay !== null && definitions && (
        <DayDetailModal
          day={selectedDay}
          month={month}
          year={year}
          activities={selectedDayActivities}
          habits={selectedDayHabits}
          damage={selectedDayDamage}
          definitions={definitions}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </main>
  );
}
