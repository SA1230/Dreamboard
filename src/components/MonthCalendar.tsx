"use client";

import { StatKey, HabitKey, DamageKey, GameData } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { getEnabledHabits, getEnabledDamage } from "@/lib/storage";
import { HABIT_LABELS } from "@/lib/habits";
import { DAMAGE_LABELS } from "@/lib/damage";
import { StatIcon } from "./StatIcons";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TinyWaterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="18" y="4" width="12" height="6" rx="2" fill="#3b82f6" />
      <rect x="20" y="10" width="8" height="4" fill="#60a5fa" />
      <path
        d="M16 14h16v26a4 4 0 01-4 4H20a4 4 0 01-4-4V14z"
        fill="#dbeafe"
        stroke="#3b82f6"
        strokeWidth="2"
      />
      <path
        d="M16.75 24h14.5v16a3.25 3.25 0 01-3.25 3.25H20a3.25 3.25 0 01-3.25-3.25V24z"
        fill="#3b82f6"
        opacity="0.7"
      />
    </svg>
  );
}

function TinyNailsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <ellipse cx="24" cy="38" rx="14" ry="8" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="8" y="16" width="5" height="18" rx="2.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="14" y="10" width="5" height="22" rx="2.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="21" y="7" width="5.5" height="25" rx="2.75" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="28" y="10" width="5" height="22" rx="2.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="34" y="18" width="5" height="16" rx="2.5" fill="#fce7f3" stroke="#ec4899" strokeWidth="2" />
      <rect x="8.75" y="16" width="3.5" height="4.5" rx="1.75" fill="#ec4899" />
      <rect x="14.75" y="10" width="3.5" height="4.5" rx="1.75" fill="#ec4899" />
      <rect x="22" y="7" width="3.5" height="5" rx="1.75" fill="#ec4899" />
      <rect x="28.75" y="10" width="3.5" height="4.5" rx="1.75" fill="#ec4899" />
      <rect x="34.75" y="18" width="3.5" height="4.5" rx="1.75" fill="#ec4899" />
    </svg>
  );
}

function TinyBrushIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="6" width="16" height="10" rx="3" fill="#ccfbf1" stroke="#14b8a6" strokeWidth="2" />
      {[12, 15, 18, 21, 24].map((x) => (
        <rect key={x} x={x} y="2" width="1.5" height="5" rx="0.75" fill="#14b8a6" />
      ))}
      <rect x="15" y="16" width="6" height="28" rx="3" fill="#99f6e4" stroke="#14b8a6" strokeWidth="2" />
    </svg>
  );
}

function TinyNoSugarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="24" cy="24" r="6" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#dc2626" strokeWidth="3" />
      <line x1="10" y1="10" x2="38" y2="38" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function TinyFlossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="12" y="6" width="24" height="28" rx="5" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="2" />
      <circle cx="24" cy="18" r="6" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
      <circle cx="24" cy="18" r="2.5" fill="#8b5cf6" />
      <path d="M24 34 Q24 38 20 40 Q16 42 14 44" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TinyStepsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <ellipse cx="17" cy="28" rx="5" ry="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2" transform="rotate(-10 17 28)" />
      <circle cx="13" cy="19" r="2" fill="#10b981" />
      <circle cx="16" cy="18" r="2" fill="#10b981" />
      <circle cx="19.5" cy="18.5" r="1.8" fill="#10b981" />
      <ellipse cx="31" cy="20" rx="5" ry="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2" transform="rotate(10 31 20)" />
      <circle cx="28" cy="11" r="1.8" fill="#10b981" />
      <circle cx="31" cy="10" r="2" fill="#10b981" />
      <circle cx="34.5" cy="11" r="2" fill="#10b981" />
    </svg>
  );
}

const TINY_HABIT_ICONS: Record<HabitKey, { component: React.ComponentType; title: string }> = {
  water: { component: TinyWaterIcon, title: HABIT_LABELS.water },
  nails: { component: TinyNailsIcon, title: HABIT_LABELS.nails },
  brush: { component: TinyBrushIcon, title: HABIT_LABELS.brush },
  nosugar: { component: TinyNoSugarIcon, title: HABIT_LABELS.nosugar },
  floss: { component: TinyFlossIcon, title: HABIT_LABELS.floss },
  steps: { component: TinyStepsIcon, title: HABIT_LABELS.steps },
};

function TinySubstanceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M16 18h16v22a4 4 0 01-4 4H20a4 4 0 01-4-4V18z" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
      <rect x="20" y="10" width="8" height="8" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
      <rect x="19" y="6" width="10" height="5" rx="1.5" fill="#ef4444" />
    </svg>
  );
}

function TinyScreenTimeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <rect x="14" y="4" width="20" height="36" rx="4" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
      <rect x="16" y="8" width="16" height="26" rx="1" fill="#7f1d1d" />
      <circle cx="24" cy="38" r="2" fill="#ef4444" />
    </svg>
  );
}

function TinyJunkFoodIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M8 22c0-8 7-14 16-14s16 6 16 14H8z" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
      <rect x="8" y="26" width="32" height="5" rx="2.5" fill="#991b1b" />
      <path d="M8 31h32v5a4 4 0 01-4 4H12a4 4 0 01-4-4v-5z" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
    </svg>
  );
}

function TinyBadSleepIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M28 6c-8 0-15 7-15 15s7 15 15 15c-4 0-8-3-8-8 0-6 5-10 10-10 3 0 5 1 7 3-1-8-8-15-9-15z" fill="#fecaca" stroke="#ef4444" strokeWidth="2" />
      <text x="32" y="16" fontSize="10" fontWeight="bold" fill="#ef4444" opacity="0.8">Z</text>
      <line x1="14" y1="8" x2="34" y2="34" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const TINY_DAMAGE_ICONS: Record<DamageKey, { component: React.ComponentType; title: string }> = {
  substance: { component: TinySubstanceIcon, title: DAMAGE_LABELS.substance },
  screentime: { component: TinyScreenTimeIcon, title: DAMAGE_LABELS.screentime },
  junkfood: { component: TinyJunkFoodIcon, title: DAMAGE_LABELS.junkfood },
  badsleep: { component: TinyBadSleepIcon, title: DAMAGE_LABELS.badsleep },
};

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  activitiesByDay: Record<number, Partial<Record<StatKey, number>>>;
  habitsByDay: Record<number, HabitKey[]>;
  damageByDay: Record<number, DamageKey[]>;
  definitions: Record<StatKey, StatDefinition>;
  gameData: GameData;
  /** Called when a day cell with content is tapped. Passes the day number (1-31). */
  onDayTap?: (day: number) => void;
  /** The currently selected day (highlights the cell). */
  selectedDay?: number | null;
}

export function MonthCalendar({
  year,
  month,
  activitiesByDay,
  habitsByDay,
  damageByDay,
  definitions,
  gameData,
  onDayTap,
  selectedDay,
}: MonthCalendarProps) {
  const enabledHabits = getEnabledHabits(gameData);
  const enabledDamage = getEnabledDamage(gameData);
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Build array of cells: empty slots for offset, then day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-semibold text-stone-400 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const dayActivities = activitiesByDay[day];
          const statEntries = dayActivities
            ? Object.entries(dayActivities) as [StatKey, number][]
            : [];
          const totalXP = statEntries.reduce(
            (sum, [, count]) => sum + count,
            0
          );
          const isToday = isCurrentMonth && day === todayDate;
          const dayHabits = habitsByDay[day] ?? [];
          const dayDamage = damageByDay[day] ?? [];
          const hasContent = totalXP > 0 || dayHabits.length > 0 || dayDamage.length > 0;
          const isSelected = selectedDay === day;

          return (
            <div
              key={day}
              className={`min-h-[120px] rounded-xl p-2.5 flex flex-col transition-colors duration-200 ${
                hasContent ? "cursor-pointer" : ""
              }`}
              style={{
                backgroundColor: isSelected
                  ? "rgba(201, 148, 62, 0.14)"
                  : isToday
                    ? "rgba(201, 148, 62, 0.08)"
                    : totalXP > 0
                      ? "rgba(255, 255, 255, 0.6)"
                      : "rgba(255, 255, 255, 0.3)",
                border: isSelected
                  ? "2px solid rgba(201, 148, 62, 0.5)"
                  : isToday
                    ? "2px solid rgba(201, 148, 62, 0.3)"
                    : "2px solid transparent",
              }}
              onClick={hasContent && onDayTap ? () => onDayTap(day) : undefined}
              role={hasContent && onDayTap ? "button" : undefined}
              aria-label={hasContent && onDayTap ? `View details for day ${day}` : undefined}
              tabIndex={hasContent && onDayTap ? 0 : undefined}
            >
              {/* Day number */}
              <div
                className={`text-sm font-bold mb-1 ${
                  isToday ? "text-amber-600" : "text-stone-400"
                }`}
              >
                {day}
              </div>

              {/* Stat icons with XP count */}
              {statEntries.length > 0 && (
                <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                  {statEntries.map(([statKey, count]) => {
                    const definition = definitions[statKey];
                    if (!definition) return null;
                    return (
                      <div
                        key={statKey}
                        className="flex items-center"
                        title={`${definition.name}: +${count} XP`}
                      >
                        <div style={{ color: definition.color }}>
                          <StatIcon
                            iconKey={definition.iconKey}
                            className="w-6 h-6"
                          />
                        </div>
                        <span
                          className="text-[11px] font-bold leading-none -ml-0.5 -mt-2"
                          style={{ color: definition.color }}
                        >
                          +{count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Healthy habit icons */}
              {habitsByDay[day] && habitsByDay[day].length > 0 && (() => {
                const visibleHabits = habitsByDay[day].filter((h) => enabledHabits.includes(h));
                if (visibleHabits.length === 0) return null;
                return (
                  <div className="flex gap-1 mt-auto pt-1">
                    {visibleHabits.map((habitKey) => {
                      const habit = TINY_HABIT_ICONS[habitKey];
                      const IconComponent = habit.component;
                      return (
                        <div key={habitKey} title={habit.title}>
                          <IconComponent />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Daily damage icons */}
              {damageByDay[day] && damageByDay[day].length > 0 && (() => {
                const visibleDamage = damageByDay[day].filter((d) => enabledDamage.includes(d));
                if (visibleDamage.length === 0) return null;
                return (
                  <div className="flex gap-1 mt-auto pt-0.5" style={{ opacity: 0.85 }}>
                    {visibleDamage.map((damageKey) => {
                      const damage = TINY_DAMAGE_ICONS[damageKey];
                      const IconComponent = damage.component;
                      return (
                        <div key={damageKey} title={damage.title}>
                          <IconComponent />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          );
        })}
      </div>
    </div>
  );
}
