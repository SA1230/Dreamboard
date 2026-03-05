"use client";

import { GameData, HabitKey } from "@/lib/types";
import { isHabitCompletedToday, getEnabledHabits } from "@/lib/storage";

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

function ToothbrushIcon({ completed }: { completed: boolean }) {
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
          ? "drop-shadow(0 2px 8px rgba(20, 184, 166, 0.4))"
          : "none",
      }}
    >
      {/* Brush head */}
      <rect
        x="10"
        y="6"
        width="16"
        height="10"
        rx="3"
        fill={completed ? "#ccfbf1" : "#f3f4f6"}
        stroke={completed ? "#14b8a6" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Bristles */}
      {[12, 15, 18, 21, 24].map((x) => (
        <rect
          key={x}
          x={x}
          y="2"
          width="1.5"
          height="5"
          rx="0.75"
          fill={completed ? "#14b8a6" : "#d1d5db"}
          className="transition-colors duration-500"
        />
      ))}
      {/* Handle */}
      <rect
        x="15"
        y="16"
        width="6"
        height="28"
        rx="3"
        fill={completed ? "#99f6e4" : "#f3f4f6"}
        stroke={completed ? "#14b8a6" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Handle stripe */}
      <rect
        x="16.5"
        y="22"
        width="3"
        height="8"
        rx="1.5"
        fill={completed ? "#14b8a6" : "#d1d5db"}
        opacity={completed ? 0.5 : 0.3}
        className="transition-all duration-500"
      />
      {/* Sparkle when completed */}
      {completed && (
        <>
          <circle cx="32" cy="10" r="1.5" fill="#14b8a6" opacity="0.7" />
          <circle cx="35" cy="6" r="1" fill="#14b8a6" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function NoSugarIcon({ completed }: { completed: boolean }) {
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
          ? "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.4))"
          : "none",
      }}
    >
      {/* Donut body (outer ring) */}
      <circle
        cx="24"
        cy="24"
        r="16"
        fill={completed ? "#fef3c7" : "#f3f4f6"}
        stroke={completed ? "#f59e0b" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Donut hole */}
      <circle
        cx="24"
        cy="24"
        r="6"
        fill={completed ? "#fffbeb" : "#fafaf9"}
        stroke={completed ? "#f59e0b" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Frosting on top half */}
      <path
        d="M9 22c1 3 3 5 6 4s4-3 5-2 2 3 4 3 3-2 4-3 2 1 5 2 5-2 6-4"
        stroke={completed ? "#f472b6" : "#d1d5db"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        className="transition-colors duration-500"
      />
      {/* Sprinkles */}
      <rect
        x="14"
        y="14"
        width="3"
        height="1.5"
        rx="0.75"
        fill={completed ? "#ef4444" : "#e5e7eb"}
        transform="rotate(-30 14 14)"
        className="transition-colors duration-500"
      />
      <rect
        x="30"
        y="15"
        width="3"
        height="1.5"
        rx="0.75"
        fill={completed ? "#3b82f6" : "#e5e7eb"}
        transform="rotate(20 30 15)"
        className="transition-colors duration-500"
      />
      <rect
        x="22"
        y="11"
        width="3"
        height="1.5"
        rx="0.75"
        fill={completed ? "#22c55e" : "#e5e7eb"}
        transform="rotate(45 22 11)"
        className="transition-colors duration-500"
      />
      {/* Prohibition slash circle */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke={completed ? "#dc2626" : "#d1d5db"}
        strokeWidth="2.5"
        className="transition-colors duration-500"
      />
      {/* Diagonal slash */}
      <line
        x1="10"
        y1="10"
        x2="38"
        y2="38"
        stroke={completed ? "#dc2626" : "#d1d5db"}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-colors duration-500"
      />
    </svg>
  );
}

function FlossIcon({ completed }: { completed: boolean }) {
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
          ? "drop-shadow(0 2px 8px rgba(139, 92, 246, 0.4))"
          : "none",
      }}
    >
      {/* Floss container (rounded rectangle) */}
      <rect
        x="12"
        y="6"
        width="24"
        height="28"
        rx="5"
        fill={completed ? "#ede9fe" : "#f3f4f6"}
        stroke={completed ? "#8b5cf6" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Spool window */}
      <circle
        cx="24"
        cy="18"
        r="6"
        fill={completed ? "#f5f3ff" : "#fafaf9"}
        stroke={completed ? "#8b5cf6" : "#d1d5db"}
        strokeWidth="1.2"
        className="transition-all duration-500"
      />
      {/* Spool inner */}
      <circle
        cx="24"
        cy="18"
        r="2.5"
        fill={completed ? "#8b5cf6" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Label area */}
      <rect
        x="16"
        y="27"
        width="16"
        height="4"
        rx="1"
        fill={completed ? "#8b5cf6" : "#d1d5db"}
        opacity={completed ? 0.3 : 0.2}
        className="transition-all duration-500"
      />
      {/* Floss string coming out */}
      <path
        d="M24 34 Q24 38 20 40 Q16 42 14 44"
        stroke={completed ? "#8b5cf6" : "#d1d5db"}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        className="transition-colors duration-500"
      />
      {/* Sparkle when completed */}
      {completed && (
        <>
          <circle cx="36" cy="10" r="1.5" fill="#8b5cf6" opacity="0.7" />
          <circle cx="38" cy="14" r="1" fill="#8b5cf6" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function StepsIcon({ completed }: { completed: boolean }) {
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
          ? "drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))"
          : "none",
      }}
    >
      {/* Left footprint */}
      <ellipse
        cx="17"
        cy="28"
        rx="5"
        ry="8"
        fill={completed ? "#d1fae5" : "#f3f4f6"}
        stroke={completed ? "#10b981" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
        transform="rotate(-10 17 28)"
      />
      {/* Left toes */}
      <circle cx="13" cy="19" r="2" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      <circle cx="16" cy="18" r="2" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      <circle cx="19.5" cy="18.5" r="1.8" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      {/* Right footprint */}
      <ellipse
        cx="31"
        cy="20"
        rx="5"
        ry="8"
        fill={completed ? "#d1fae5" : "#f3f4f6"}
        stroke={completed ? "#10b981" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
        transform="rotate(10 31 20)"
      />
      {/* Right toes */}
      <circle cx="28" cy="11" r="1.8" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      <circle cx="31" cy="10" r="2" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      <circle cx="34.5" cy="11" r="2" fill={completed ? "#10b981" : "#d1d5db"} className="transition-colors duration-500" />
      {/* 10k text */}
      <text
        x="24"
        y="44"
        textAnchor="middle"
        fontSize="7"
        fontWeight="bold"
        fill={completed ? "#059669" : "#9ca3af"}
        className="transition-colors duration-500"
      >
        10k
      </text>
    </svg>
  );
}

const HABIT_CONFIG: Record<HabitKey, { label: string; completedLabel: string }> = {
  water: { label: "Drink 64oz", completedLabel: "64oz done!" },
  nails: { label: "No nail biting", completedLabel: "Nails safe!" },
  brush: { label: "Brush 2x", completedLabel: "Brushed!" },
  nosugar: { label: "No sugar", completedLabel: "Sugar free!" },
  floss: { label: "Floss teeth", completedLabel: "Flossed!" },
  steps: { label: "10k steps", completedLabel: "10k done!" },
};

const HABIT_STYLES: Record<HabitKey, { activeBackground: string; activeBorder: string; activeText: string }> = {
  water: { activeBackground: "#eff6ff", activeBorder: "#3b82f6", activeText: "#2563eb" },
  nails: { activeBackground: "#fdf2f8", activeBorder: "#ec4899", activeText: "#db2777" },
  brush: { activeBackground: "#f0fdfa", activeBorder: "#14b8a6", activeText: "#0d9488" },
  nosugar: { activeBackground: "#fffbeb", activeBorder: "#f59e0b", activeText: "#d97706" },
  floss: { activeBackground: "#f5f3ff", activeBorder: "#8b5cf6", activeText: "#7c3aed" },
  steps: { activeBackground: "#ecfdf5", activeBorder: "#10b981", activeText: "#059669" },
};

const HABIT_ICONS: Record<HabitKey, React.ComponentType<{ completed: boolean }>> = {
  water: WaterBottleIcon,
  nails: NailsIcon,
  brush: ToothbrushIcon,
  nosugar: NoSugarIcon,
  floss: FlossIcon,
  steps: StepsIcon,
};

const HABIT_ORDER: HabitKey[] = ["water", "nails", "brush", "nosugar", "floss", "steps"];

export function HealthyHabits({ gameData, onToggleHabit }: HealthyHabitsProps) {
  const enabledHabits = getEnabledHabits(gameData);
  const visibleHabits = HABIT_ORDER.filter((key) => enabledHabits.includes(key));

  if (visibleHabits.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-stone-600 mb-4">
        Healthy Habits
        <span className="ml-3 text-sm font-normal text-stone-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).replace(/\d+/, (day) => {
            const d = parseInt(day);
            const suffix = d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th';
            return d + suffix;
          })}
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {visibleHabits.map((habitKey) => {
          const completed = isHabitCompletedToday(gameData, habitKey);
          const styles = HABIT_STYLES[habitKey];
          const config = HABIT_CONFIG[habitKey];
          const IconComponent = HABIT_ICONS[habitKey];

          return (
            <button
              key={habitKey}
              onClick={() => onToggleHabit(habitKey)}
              className="flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: completed ? styles.activeBackground : "#fafaf9",
                border: completed
                  ? `2px solid ${styles.activeBorder}`
                  : "2px solid #e7e5e4",
              }}
            >
              <div
                className="transition-transform duration-300"
                style={{ transform: completed ? "scale(1.1)" : "scale(1)" }}
              >
                <IconComponent completed={completed} />
              </div>
              <span
                className="text-xs font-semibold transition-colors duration-300"
                style={{ color: completed ? styles.activeText : "#a8a29e" }}
              >
                {completed ? config.completedLabel : config.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
