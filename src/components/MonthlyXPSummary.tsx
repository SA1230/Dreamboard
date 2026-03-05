import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StatDefinition, STAT_KEYS } from "@/lib/stats";
import { StatKey } from "@/lib/types";

interface MonthlyXPSummaryProps {
  currentMonthXP: number;
  lastMonthXP: number;
  activitiesByDay: Record<number, Partial<Record<StatKey, number>>>;
  statDefinitions: Record<StatKey, StatDefinition> | null;
}

export function MonthlyXPSummary({
  currentMonthXP,
  lastMonthXP,
  activitiesByDay,
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

  const chartHeight = 64;
  const blockGap = 1; // pixel gap between blocks

  function getStatColor(stat: string): string {
    return statDefinitions?.[stat as StatKey]?.progressColor ?? "#a8a29e";
  }

  // Each 1 XP = 1 block. Block height scales so the tallest day fills the chart.
  const blockHeight = Math.max(Math.floor((chartHeight - (maxDayXP - 1) * blockGap) / maxDayXP), 3);

  return (
    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
            {currentMonthName} XP
          </p>
          <p className="text-3xl font-extrabold text-stone-700 mt-1">
            {currentMonthXP}
          </p>
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
      <div className="mt-4">
        <div className="flex items-end gap-[2px]" style={{ height: chartHeight }}>
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const isFutureDay = day > todayDate;
            const dayStats = activitiesByDay[day];

            if (isFutureDay) {
              return (
                <div key={day} className="flex-1 flex items-end h-full">
                  <div className="w-full h-[1px] bg-stone-100 rounded-sm" />
                </div>
              );
            }

            if (!dayStats || Object.keys(dayStats).length === 0) {
              return (
                <div key={day} className="flex-1 flex items-end h-full">
                  <div className="w-full h-[2px] bg-stone-200 rounded-sm" />
                </div>
              );
            }

            // Build individual blocks sorted by XP count descending (most at bottom).
            // Each XP point for a stat = one block of that stat's color.
            const statEntries = STAT_KEYS
              .filter((stat) => (dayStats[stat] ?? 0) > 0)
              .sort((a, b) => (dayStats[b] ?? 0) - (dayStats[a] ?? 0));

            const blocks: { stat: string; color: string }[] = [];
            for (const stat of statEntries) {
              const xp = dayStats[stat] ?? 0;
              for (let i = 0; i < xp; i++) {
                blocks.push({ stat, color: getStatColor(stat) });
              }
            }

            return (
              <div
                key={day}
                className="flex-1 flex flex-col-reverse items-stretch h-full justify-start"
              >
                <div
                  className="flex flex-col-reverse"
                  style={{ gap: blockGap }}
                >
                  {blocks.map((block, blockIndex) => (
                    <div
                      key={`${block.stat}-${blockIndex}`}
                      className="w-full rounded-[1px]"
                      style={{
                        height: blockHeight,
                        backgroundColor: block.color,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex gap-[2px] mt-1">
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const showLabel = day === 1 || day % 5 === 0 || day === daysInMonth;
            return (
              <div key={day} className="flex-1 text-center">
                {showLabel && (
                  <span className="text-[9px] text-stone-300">{day}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
