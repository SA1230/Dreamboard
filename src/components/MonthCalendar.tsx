"use client";

import { StatKey, HabitKey } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { StatIcon } from "./StatIcons";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TinyWaterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
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
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
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
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
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
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="24" cy="24" r="6" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#dc2626" strokeWidth="3" />
      <line x1="10" y1="10" x2="38" y2="38" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  activitiesByDay: Record<number, Partial<Record<StatKey, number>>>;
  habitsByDay: Record<number, HabitKey[]>;
  definitions: Record<StatKey, StatDefinition>;
}

export function MonthCalendar({
  year,
  month,
  activitiesByDay,
  habitsByDay,
  definitions,
}: MonthCalendarProps) {
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

          return (
            <div
              key={day}
              className="min-h-[120px] rounded-xl p-2.5 transition-colors duration-200"
              style={{
                backgroundColor: isToday
                  ? "rgba(201, 148, 62, 0.08)"
                  : totalXP > 0
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(255, 255, 255, 0.3)",
                border: isToday ? "2px solid rgba(201, 148, 62, 0.3)" : "2px solid transparent",
              }}
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
                <div className="flex flex-wrap gap-x-1 gap-y-0.5">
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
                            className="w-3.5 h-3.5"
                          />
                        </div>
                        <span
                          className="text-[9px] font-bold leading-none -ml-0.5 -mt-1.5"
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
              {habitsByDay[day] && habitsByDay[day].length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {habitsByDay[day].includes("water") && (
                    <div title="Drank 64oz water">
                      <TinyWaterIcon />
                    </div>
                  )}
                  {habitsByDay[day].includes("nails") && (
                    <div title="No nail biting">
                      <TinyNailsIcon />
                    </div>
                  )}
                  {habitsByDay[day].includes("brush") && (
                    <div title="Brushed 2x">
                      <TinyBrushIcon />
                    </div>
                  )}
                  {habitsByDay[day].includes("nosugar") && (
                    <div title="No sugar">
                      <TinyNoSugarIcon />
                    </div>
                  )}
                </div>
              )}

              {/* Total XP at bottom */}
              {totalXP > 0 && (
                <div className="text-[9px] font-semibold text-stone-400 mt-auto pt-0.5">
                  {totalXP} XP
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
