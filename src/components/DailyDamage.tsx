"use client";

import { GameData, DamageKey } from "@/lib/types";
import { isDamageMarkedToday, getEnabledDamage } from "@/lib/storage";

interface DailyDamageProps {
  gameData: GameData;
  onToggleDamage: (damageKey: DamageKey) => void;
}

function SubstanceIcon({ marked }: { marked: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: marked
          ? "drop-shadow(0 2px 8px rgba(239, 68, 68, 0.4))"
          : "none",
      }}
    >
      {/* Bottle body */}
      <path
        d="M16 18h16v22a4 4 0 01-4 4H20a4 4 0 01-4-4V18z"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Bottle neck */}
      <rect
        x="20"
        y="10"
        width="8"
        height="8"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Cap */}
      <rect
        x="19"
        y="6"
        width="10"
        height="5"
        rx="1.5"
        fill={marked ? "#ef4444" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Liquid fill */}
      <path
        d="M16.75 28h14.5v12a3.25 3.25 0 01-3.25 3.25H20a3.25 3.25 0 01-3.25-3.25V28z"
        fill={marked ? "#ef4444" : "transparent"}
        opacity={marked ? 0.4 : 0}
        className="transition-all duration-500"
      />
      {/* Label */}
      <rect
        x="19"
        y="22"
        width="10"
        height="6"
        rx="1"
        fill={marked ? "#ef4444" : "#d1d5db"}
        opacity={marked ? 0.3 : 0.2}
        className="transition-all duration-500"
      />
      {/* Skull on label when marked */}
      {marked && (
        <>
          <circle cx="24" cy="24.5" r="1.5" fill="#991b1b" opacity="0.6" />
          <rect x="22.5" y="26" width="3" height="1" rx="0.5" fill="#991b1b" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

function ScreenTimeIcon({ marked }: { marked: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: marked
          ? "drop-shadow(0 2px 8px rgba(239, 68, 68, 0.4))"
          : "none",
      }}
    >
      {/* Phone body */}
      <rect
        x="14"
        y="4"
        width="20"
        height="36"
        rx="4"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Screen */}
      <rect
        x="16"
        y="8"
        width="16"
        height="26"
        rx="1"
        fill={marked ? "#7f1d1d" : "#e7e5e4"}
        className="transition-colors duration-500"
      />
      {/* Screen glow when marked */}
      {marked && (
        <rect
          x="16"
          y="8"
          width="16"
          height="26"
          rx="1"
          fill="#3b82f6"
          opacity="0.3"
        />
      )}
      {/* Home button */}
      <circle
        cx="24"
        cy="38"
        r="2"
        fill={marked ? "#ef4444" : "#d1d5db"}
        className="transition-colors duration-500"
      />
      {/* Hypnotic spiral lines when marked */}
      {marked && (
        <>
          <circle cx="24" cy="21" r="3" stroke="#ef4444" strokeWidth="0.8" fill="none" opacity="0.6" />
          <circle cx="24" cy="21" r="6" stroke="#ef4444" strokeWidth="0.8" fill="none" opacity="0.4" />
          <circle cx="24" cy="21" r="9" stroke="#ef4444" strokeWidth="0.8" fill="none" opacity="0.2" />
        </>
      )}
      {/* Radiation lines from screen */}
      {marked && (
        <>
          <line x1="10" y1="12" x2="13" y2="14" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          <line x1="10" y1="24" x2="13" y2="24" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          <line x1="35" y1="14" x2="38" y2="12" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          <line x1="35" y1="24" x2="38" y2="24" stroke="#ef4444" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function JunkFoodIcon({ marked }: { marked: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: marked
          ? "drop-shadow(0 2px 8px rgba(239, 68, 68, 0.4))"
          : "none",
      }}
    >
      {/* Top bun */}
      <path
        d="M8 22c0-8 7-14 16-14s16 6 16 14H8z"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Sesame seeds */}
      <ellipse cx="18" cy="14" rx="1.5" ry="1" fill={marked ? "#ef4444" : "#d1d5db"} opacity={marked ? 0.5 : 0.3} className="transition-all duration-500" />
      <ellipse cx="28" cy="12" rx="1.5" ry="1" fill={marked ? "#ef4444" : "#d1d5db"} opacity={marked ? 0.5 : 0.3} className="transition-all duration-500" />
      <ellipse cx="23" cy="11" rx="1.5" ry="1" fill={marked ? "#ef4444" : "#d1d5db"} opacity={marked ? 0.5 : 0.3} className="transition-all duration-500" />
      {/* Lettuce */}
      <path
        d="M7 24c2-1 4 1 6 0s4-1 6 0 4 1 6 0 4-1 6 0 4 1 6 0 3-1 4 0"
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        className="transition-colors duration-500"
        opacity={marked ? 0.6 : 1}
      />
      {/* Patty */}
      <rect
        x="8"
        y="26"
        width="32"
        height="5"
        rx="2.5"
        fill={marked ? "#991b1b" : "#d6d3d1"}
        className="transition-colors duration-500"
      />
      {/* Cheese */}
      <path
        d="M7 26l3 4h28l3-4"
        stroke={marked ? "#f59e0b" : "#d1d5db"}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        className="transition-colors duration-500"
        opacity={marked ? 0.7 : 0.3}
      />
      {/* Bottom bun */}
      <path
        d="M8 31h32v5a4 4 0 01-4 4H12a4 4 0 01-4-4v-5z"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function BadSleepIcon({ marked }: { marked: boolean }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-500 ease-out"
      style={{
        filter: marked
          ? "drop-shadow(0 2px 8px rgba(239, 68, 68, 0.4))"
          : "none",
      }}
    >
      {/* Moon (crescent) */}
      <path
        d="M28 6c-8 0-15 7-15 15s7 15 15 15c-4 0-8-3-8-8 0-6 5-10 10-10 3 0 5 1 7 3-1-8-8-15-9-15z"
        fill={marked ? "#fecaca" : "#f3f4f6"}
        stroke={marked ? "#ef4444" : "#d1d5db"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {/* Cracked/broken Z's to show bad sleep */}
      <text
        x="32"
        y="16"
        fontSize="10"
        fontWeight="bold"
        fill={marked ? "#ef4444" : "#d1d5db"}
        className="transition-colors duration-500"
        opacity={marked ? 0.8 : 0.5}
      >
        Z
      </text>
      <text
        x="36"
        y="10"
        fontSize="7"
        fontWeight="bold"
        fill={marked ? "#ef4444" : "#d1d5db"}
        className="transition-colors duration-500"
        opacity={marked ? 0.6 : 0.3}
      >
        Z
      </text>
      {/* Slash through moon when marked (disrupted sleep) */}
      {marked && (
        <>
          <line
            x1="14"
            y1="8"
            x2="34"
            y2="34"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Bags under eyes (tired face indicator) */}
          <path
            d="M18 38c2 2 5 4 8 4s6-2 8-4"
            stroke="#ef4444"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      )}
    </svg>
  );
}

const DAMAGE_CONFIG: Record<DamageKey, { label: string; markedLabel: string }> = {
  substance: { label: "No substances", markedLabel: "Substance used" },
  screentime: { label: "Screen time OK", markedLabel: "Excess screen" },
  junkfood: { label: "Ate clean", markedLabel: "Junk food eaten" },
  badsleep: { label: "Slept well", markedLabel: "Bad sleep" },
};

const DAMAGE_ICONS: Record<DamageKey, React.ComponentType<{ marked: boolean }>> = {
  substance: SubstanceIcon,
  screentime: ScreenTimeIcon,
  junkfood: JunkFoodIcon,
  badsleep: BadSleepIcon,
};

const DAMAGE_ORDER: DamageKey[] = ["substance", "screentime", "junkfood", "badsleep"];

export function DailyDamage({ gameData, onToggleDamage }: DailyDamageProps) {
  const enabledDamage = getEnabledDamage(gameData);
  const visibleDamage = DAMAGE_ORDER.filter((key) => enabledDamage.includes(key));

  if (visibleDamage.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-lg font-bold text-stone-600 mb-4">
        Daily Damage
        <span className="ml-3 text-sm font-normal text-stone-400">
          tap if you took damage today
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {visibleDamage.map((damageKey) => {
          const marked = isDamageMarkedToday(gameData, damageKey);
          const config = DAMAGE_CONFIG[damageKey];
          const IconComponent = DAMAGE_ICONS[damageKey];

          return (
            <button
              key={damageKey}
              onClick={() => onToggleDamage(damageKey)}
              className="flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: marked ? "#fef2f2" : "#fafaf9",
                border: marked
                  ? "2px solid #ef4444"
                  : "2px solid #e7e5e4",
              }}
            >
              <div
                className="transition-transform duration-300"
                style={{ transform: marked ? "scale(1.1)" : "scale(1)" }}
              >
                <IconComponent marked={marked} />
              </div>
              <span
                className="text-xs font-semibold transition-colors duration-300"
                style={{ color: marked ? "#dc2626" : "#a8a29e" }}
              >
                {marked ? config.markedLabel : config.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
