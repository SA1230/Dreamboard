"use client";

import { StatKey } from "@/lib/types";
import { StatDefinition } from "@/lib/stats";
import { StatIcon } from "./StatIcons";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  activitiesByDay: Record<number, Partial<Record<StatKey, number>>>;
  definitions: Record<StatKey, StatDefinition>;
}

export function MonthCalendar({
  year,
  month,
  activitiesByDay,
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
      <div className="grid grid-cols-7 gap-1">
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
              className="min-h-[80px] rounded-xl p-1.5 transition-colors duration-200"
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
                className={`text-xs font-bold mb-1 ${
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
