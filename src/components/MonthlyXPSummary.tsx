import { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatDefinition, STAT_KEYS } from "@/lib/stats";
import { StatKey, HabitKey } from "@/lib/types";

interface MonthlyXPSummaryProps {
  currentMonthXP: number;
  lastMonthXP: number;
  activitiesByDay: Record<number, Partial<Record<StatKey, number>>>;
  habitsByDay: Record<number, HabitKey[]>;
  statDefinitions: Record<StatKey, StatDefinition> | null;
}

// Emoji representations of each habit — compact and recognizable at small sizes
const HABIT_EMOJI: Record<HabitKey, string> = {
  water: "\u{1F4A7}",
  nails: "\u{1F485}",
  brush: "\u{1FAA5}",
  nosugar: "\u{1F6AB}",
  floss: "\u{1F9B7}",
  steps: "\u{1F6B6}",
};

export function MonthlyXPSummary({
  currentMonthXP,
  lastMonthXP,
  activitiesByDay,
  habitsByDay,
  statDefinitions,
}: MonthlyXPSummaryProps) {
  // Calculate percentage change from last month to this month
  let percentChange = 0;
  if (lastMonthXP > 0) {
    percentChange = Math.round(((currentMonthXP - lastMonthXP) / lastMonthXP) * 100);
  } else if (currentMonthXP > 0) {
    percentChange = 100;
  }

  const isUp = percentChange > 0;
  const isDown = percentChange < 0;

  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const dayOfWeek = now.toLocaleString("default", { weekday: "short" });
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthName = lastMonthDate.toLocaleString("default", { month: "short" });

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDate = now.getDate();

  // Find the max total XP for any single day (for height scaling)
  let maxDayXP = 1;
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStats = activitiesByDay[day];
    if (dayStats) {
      const total = Object.values(dayStats).reduce((sum, xp) => sum + (xp ?? 0), 0);
      if (total > maxDayXP) maxDayXP = total;
    }
  }

  const blockGap = 2; // pixel gap between blocks

  // Measure actual chart height so blocks scale to fill available space
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartHeight, setChartHeight] = useState(80);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartHeight(entry.contentRect.height);
      }
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  // Scale blocks to fill the chart, but cap so they look like chunky squares, not tall strips
  const maxBlockHeight = 18;
  const blockHeight = Math.min(maxBlockHeight, Math.max(Math.floor((chartHeight - (maxDayXP - 1) * blockGap) / maxDayXP), 4));

  function getStatColor(stat: string): string {
    return statDefinitions?.[stat as StatKey]?.progressColor ?? "#a8a29e";
  }

  function getStatName(stat: string): string {
    return statDefinitions?.[stat as StatKey]?.name ?? stat;
  }

  return (
    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              {currentMonthName}
            </p>
            <p className="text-3xl font-extrabold text-stone-700 mt-0.5">
              {todayDate}
            </p>
            <p className="text-xs font-medium text-stone-400 -mt-0.5">
              {dayOfWeek}
            </p>
          </div>
          <div className="self-center px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">
            <span className="text-xs font-bold text-stone-500">{currentMonthXP} XP</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-stone-400">
            vs {lastMonthName}: <span className="font-bold text-stone-500">{lastMonthXP} XP</span>
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-1.5">
            {isUp && (
              <>
                <TrendingUp size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-500">+{percentChange}%</span>
              </>
            )}
            {isDown && (
              <>
                <TrendingDown size={18} className="text-red-400" />
                <span className="text-sm font-bold text-red-400">{percentChange}%</span>
              </>
            )}
            {!isUp && !isDown && (
              <>
                <Minus size={18} className="text-stone-400" />
                <span className="text-sm font-bold text-stone-400">0%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stacked block chart — each 1 XP = 1 discrete block, consistent stat order */}
      <div className="mt-3 flex-1 flex flex-col min-h-0">
        <div ref={chartRef} className="flex items-end gap-[2px] flex-1 min-h-[60px]">
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const isToday = day === todayDate;
            const isFutureDay = day > todayDate;
            const dayStats = activitiesByDay[day];

            const todayHighlight = isToday ? "bg-amber-50 rounded-sm" : "";

            if (isFutureDay) {
              return (
                <div key={day} className="flex-1 flex items-end h-full">
                  <div className="w-full h-[1px] bg-stone-100 rounded-sm" />
                </div>
              );
            }

            if (!dayStats || Object.keys(dayStats).length === 0) {
              return (
                <div key={day} className={`flex-1 flex items-end h-full ${todayHighlight}`}>
                  <div className="w-full h-[2px] bg-stone-200 rounded-sm" />
                </div>
              );
            }

            // Group blocks by stat, sorted by XP count descending (most at bottom).
            const statGroups = STAT_KEYS
              .filter((stat) => (dayStats[stat] ?? 0) > 0)
              .sort((a, b) => (dayStats[b] ?? 0) - (dayStats[a] ?? 0))
              .map((stat) => ({
                stat,
                xp: dayStats[stat] ?? 0,
                color: getStatColor(stat),
                name: getStatName(stat),
              }));

            return (
              <div
                key={day}
                className={`flex-1 flex flex-col-reverse items-stretch h-full justify-start ${todayHighlight}`}
              >
                <div
                  className="flex flex-col-reverse"
                  style={{ gap: blockGap }}
                >
                  {statGroups.map((group) => (
                    <div
                      key={group.stat}
                      className="relative group/stat flex flex-col-reverse"
                      style={{ gap: blockGap }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-stone-700 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover/stat:opacity-100 pointer-events-none transition-opacity z-10 shadow-md">
                        <span style={{ color: group.color }}>{group.name}</span>
                        <span className="text-stone-300 ml-1">{group.xp} XP</span>
                      </div>
                      {/* Blocks — 3D raised tile effect via inset highlights + bottom shadow */}
                      {Array.from({ length: group.xp }, (_, blockIndex) => (
                        <div
                          key={blockIndex}
                          className="w-full rounded-sm"
                          style={{
                            height: blockHeight,
                            backgroundColor: group.color,
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.1)`,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day labels — today always shown + highlighted */}
        <div className="flex gap-[2px] mt-1">
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const isToday = day === todayDate;
            const showLabel = isToday || day === 1 || day % 5 === 0 || day === daysInMonth;
            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                {showLabel && (
                  <span className={`text-[9px] ${isToday ? "font-bold text-amber-600" : "text-stone-300"}`}>
                    {day}
                  </span>
                )}
                {isToday && (
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Healthy habit icons below each day */}
        <div className="flex gap-[2px] mt-0.5">
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const habits = habitsByDay[day];

            if (!habits || habits.length === 0) {
              return <div key={day} className="flex-1" />;
            }

            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                {habits.map((habitKey) => (
                  <span key={habitKey} className="text-[8px] leading-none">
                    {HABIT_EMOJI[habitKey]}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
