"use client";

import { useState, useEffect, useCallback } from "react";
import { HealthyHabitsData, HealthyHabitKey, loadHealthyHabits, toggleHealthyHabit, isHabitDoneToday } from "@/lib/storage";

function WaterBottleIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" className="w-16 h-16 transition-all duration-400">
      {/* Bottle cap */}
      <rect x="28" y="2" width="24" height="14" rx="3"
        className="transition-all duration-400"
        fill={active ? "#1e88e5" : "#c4bdb4"} />
      {/* Bottle neck */}
      <rect x="30" y="16" width="20" height="10"
        className="transition-all duration-400"
        fill={active ? "#e3f2fd" : "#d6d0c8"}
        stroke={active ? "#90caf9" : "#b8b2a8"}
        strokeWidth="1" />
      {/* Bottle body */}
      <path d="M30 26 L22 42 L22 108 Q22 116 30 116 L50 116 Q58 116 58 108 L58 42 L50 26 Z"
        className="transition-all duration-400"
        fill={active ? "#e3f2fd" : "#d6d0c8"}
        stroke={active ? "#90caf9" : "#b8b2a8"}
        strokeWidth="1" />
      {/* Water fill */}
      <path d="M23 60 L57 60 L57 108 Q57 115 50 115 L30 115 Q23 115 23 108 Z"
        className="transition-all duration-400"
        fill={active ? "#42a5f5" : "#c4bdb4"} />
      {/* 64 oz label */}
      <text x="40" y="92" textAnchor="middle"
        className="transition-all duration-400"
        fill={active ? "#ffffff" : "#9e9789"}
        fontSize="14" fontWeight="700" fontFamily="inherit">
        64 oz
      </text>
    </svg>
  );
}

function NailsIcon({ active }: { active: boolean }) {
  const skin = active ? "#f5cba7" : "#d6d0c8";
  const skinStroke = active ? "#e0a97a" : "#b8b2a8";
  const nail = active ? "#f48fb1" : "#b8b2a8";
  const nailStroke = active ? "#e91e63" : "#9e9789";

  return (
    <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 transition-all duration-400">
      {/* Palm */}
      <ellipse cx="50" cy="72" rx="28" ry="22"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      {/* Thumb */}
      <rect x="14" y="48" width="14" height="30" rx="7" transform="rotate(-20 14 48)"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      <ellipse cx="17" cy="47" rx="6" ry="5" transform="rotate(-20 17 47)"
        className="transition-all duration-400" fill={nail} stroke={nailStroke} strokeWidth="0.5" />
      {/* Index finger */}
      <rect x="27" y="22" width="12" height="36" rx="6"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      <ellipse cx="33" cy="23" rx="5" ry="5"
        className="transition-all duration-400" fill={nail} stroke={nailStroke} strokeWidth="0.5" />
      {/* Middle finger */}
      <rect x="42" y="16" width="12" height="40" rx="6"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      <ellipse cx="48" cy="17" rx="5" ry="5"
        className="transition-all duration-400" fill={nail} stroke={nailStroke} strokeWidth="0.5" />
      {/* Ring finger */}
      <rect x="57" y="22" width="12" height="36" rx="6"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      <ellipse cx="63" cy="23" rx="5" ry="5"
        className="transition-all duration-400" fill={nail} stroke={nailStroke} strokeWidth="0.5" />
      {/* Pinky finger */}
      <rect x="70" y="30" width="11" height="30" rx="5.5"
        className="transition-all duration-400" fill={skin} stroke={skinStroke} strokeWidth="0.5" />
      <ellipse cx="75.5" cy="31" rx="4.5" ry="4.5"
        className="transition-all duration-400" fill={nail} stroke={nailStroke} strokeWidth="0.5" />
    </svg>
  );
}

export function HealthyHabits() {
  const [habits, setHabits] = useState<HealthyHabitsData | null>(null);

  useEffect(() => {
    setHabits(loadHealthyHabits());
  }, []);

  const handleToggle = useCallback((habit: HealthyHabitKey) => {
    setHabits((current) => {
      if (!current) return current;
      return toggleHealthyHabit(current, habit);
    });
  }, []);

  if (!habits) return null;

  const waterDone = isHabitDoneToday(habits, "water");
  const nailsDone = isHabitDoneToday(habits, "nails");

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-stone-600 mb-4">Healthy Habits</h2>
      <div className="flex gap-4">
        <button
          onClick={() => handleToggle("water")}
          className="flex-1 flex flex-col items-center gap-3 rounded-2xl px-4 py-5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            backgroundColor: waterDone ? "#e3f2fd" : "#f5f0e8",
            borderWidth: 2,
            borderColor: waterDone ? "#90caf9" : "#e7e0d5",
            boxShadow: waterDone ? "0 4px 16px rgba(66, 165, 245, 0.2)" : "none",
          }}
        >
          <WaterBottleIcon active={waterDone} />
          <span className={`text-sm font-semibold transition-colors duration-300 ${waterDone ? "text-blue-600" : "text-stone-400"}`}>
            Water
          </span>
        </button>

        <button
          onClick={() => handleToggle("nails")}
          className="flex-1 flex flex-col items-center gap-3 rounded-2xl px-4 py-5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            backgroundColor: nailsDone ? "#fce4ec" : "#f5f0e8",
            borderWidth: 2,
            borderColor: nailsDone ? "#f48fb1" : "#e7e0d5",
            boxShadow: nailsDone ? "0 4px 16px rgba(244, 143, 177, 0.25)" : "none",
          }}
        >
          <NailsIcon active={nailsDone} />
          <span className={`text-sm font-semibold transition-colors duration-300 ${nailsDone ? "text-pink-600" : "text-stone-400"}`}>
            No Nail Biting
          </span>
        </button>
      </div>
    </section>
  );
}
