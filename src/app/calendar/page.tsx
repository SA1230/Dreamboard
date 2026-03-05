"use client";

import { useState, useEffect, useMemo } from "react";
import { GameData } from "@/lib/types";
import { loadGameData, getEffectiveDefinitions, getActivitiesByDay, getHabitsByDay } from "@/lib/storage";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

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

  // Count total XP for the displayed month
  const monthTotalXP = useMemo(() => {
    return Object.values(activitiesByDay).reduce((sum, dayStats) => {
      return sum + Object.values(dayStats).reduce((s, count) => s + (count ?? 0), 0);
    }, 0);
  }, [activitiesByDay]);

  function goToPreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToCurrentMonth() {
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
    <main className="mx-auto px-8 py-8 pb-20 lg:px-16">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500"
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
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500"
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
        definitions={definitions}
        gameData={gameData}
      />
    </main>
  );
}
