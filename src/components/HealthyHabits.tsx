"use client";

import { GameData, HabitKey } from "@/lib/types";
import { isHabitCompletedToday } from "@/lib/storage";

interface HealthyHabitsProps {
  gameData: GameData;
  onToggleHabit: (habitKey: HabitKey) => void;
}

function WaterBottleIcon({ completed }: { completed: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: completed
          ? "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))"
          : "none",
      }}
    >
      {/* Cap */}
      <rect
        x="18"
        y="4"
        width="12"
        height="6"
        rx="2"
        fill={completed ? "#3b82f6" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Neck */}
      <rect
        x="20"
        y="10"
        width="8"
        height="4"
        fill={completed ? "#60a5fa" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Body */}
      <path
        d="M16 14h16v26a4 4 0 01-4 4H20a4 4 0 01-4-4V14z"
        fill={completed ? "#dbeafe" : "#f3f4f6"}
        stroke={completed ? "#3b82f6" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Water fill */}
      <path
        d="M16.75 24h14.5v16a3.25 3.25 0 01-3.25 3.25H20a3.25 3.25 0 01-3.25-3.25V24z"
        fill={completed ? "#3b82f6" : "transparent"}
        className="transition-all duration-500"
        style={{
          opacity: completed ? 0.7 : 0,
        }}
      />
      {/* Wave line */}
      {completed && (
        <path
          d="M17 24c2-1.5 4 1.5 6 0s4 1.5 6 0s3-1 4 0"
          stroke="#2563eb"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      )}
      {/* 64oz label */}
      <text
        x="24"
        y="35"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill={completed ? "#1e40af" : "#9ca3af"}
        className="transition-colors duration-500"
      >
        64oz
      </text>
    </svg>
  );
}

function NailsIcon({ completed }: { completed: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: completed
          ? "drop-shadow(0 2px 8px rgba(236, 72, 153, 0.4))"
          : "none",
      }}
    >
      {/* Hand/palm base */}
      <ellipse
        cx="24"
        cy="38"
        rx="14"
        ry="8"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Fingers - 5 rounded rectangles fanning out */}
      {/* Pinky */}
      <rect
        x="8"
        y="16"
        width="5"
        height="18"
        rx="2.5"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Ring */}
      <rect
        x="14"
        y="10"
        width="5"
        height="22"
        rx="2.5"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Middle */}
      <rect
        x="21"
        y="7"
        width="5.5"
        height="25"
        rx="2.75"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Index */}
      <rect
        x="28"
        y="10"
        width="5"
        height="22"
        rx="2.5"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Thumb */}
      <rect
        x="34"
        y="18"
        width="5"
        height="16"
        rx="2.5"
        fill={completed ? "#fce7f3" : "#f3f4f6"}
        stroke={completed ? "#ec4899" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Nails - small rounded rects at fingertips */}
      {/* Pinky nail */}
      <rect
        x="8.75"
        y="16"
        width="3.5"
        height="4.5"
        rx="1.75"
        fill={completed ? "#ec4899" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Ring nail */}
      <rect
        x="14.75"
        y="10"
        width="3.5"
        height="4.5"
        rx="1.75"
        fill={completed ? "#ec4899" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Middle nail */}
      <rect
        x="22"
        y="7"
        width="3.5"
        height="5"
        rx="1.75"
        fill={completed ? "#ec4899" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Index nail */}
      <rect
        x="28.75"
        y="10"
        width="3.5"
        height="4.5"
        rx="1.75"
        fill={completed ? "#ec4899" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Thumb nail */}
      <rect
        x="34.75"
        y="18"
        width="3.5"
        height="4.5"
        rx="1.75"
        fill={completed ? "#ec4899" : "#d1d5db"}
        className="transition-colors duration-500"
      />
    </svg>
  );
}

const HABIT_CONFIG: Record<HabitKey, { label: string; completedLabel: string }> = {
  water: { label: "Drink 64oz", completedLabel: "64oz done!" },
  nails: { label: "No nail biting", completedLabel: "Nails safe!" },
};

export function HealthyHabits({ gameData, onToggleHabit }: HealthyHabitsProps) {
  const waterCompleted = isHabitCompletedToday(gameData, "water");
  const nailsCompleted = isHabitCompletedToday(gameData, "nails");

  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-stone-600 mb-4">Healthy Habits</h2>
      <div className="flex gap-4">
        {/* Water Bottle */}
        <button
          onClick={() => onToggleHabit("water")}
          className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: waterCompleted ? "#eff6ff" : "#fafaf9",
            border: waterCompleted ? "2px solid #3b82f6" : "2px solid #e7e5e4",
            transform: waterCompleted ? "scale(1)" : "scale(1)",
          }}
        >
          <div
            className="transition-transform duration-300"
            style={{ transform: waterCompleted ? "scale(1.1)" : "scale(1)" }}
          >
            <WaterBottleIcon completed={waterCompleted} />
          </div>
          <span
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: waterCompleted ? "#2563eb" : "#a8a29e" }}
          >
            {waterCompleted ? HABIT_CONFIG.water.completedLabel : HABIT_CONFIG.water.label}
          </span>
        </button>

        {/* Nails */}
        <button
          onClick={() => onToggleHabit("nails")}
          className="flex-1 flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: nailsCompleted ? "#fdf2f8" : "#fafaf9",
            border: nailsCompleted ? "2px solid #ec4899" : "2px solid #e7e5e4",
          }}
        >
          <div
            className="transition-transform duration-300"
            style={{ transform: nailsCompleted ? "scale(1.1)" : "scale(1)" }}
          >
            <NailsIcon completed={nailsCompleted} />
          </div>
          <span
            className="text-xs font-semibold transition-colors duration-300"
            style={{ color: nailsCompleted ? "#db2777" : "#a8a29e" }}
          >
            {nailsCompleted ? HABIT_CONFIG.nails.completedLabel : HABIT_CONFIG.nails.label}
          </span>
        </button>
      </div>
    </section>
  );
}
