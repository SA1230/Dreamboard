import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyXPSummaryProps {
  currentMonthXP: number;
  lastMonthXP: number;
  dailyXP: number[];
}

export function MonthlyXPSummary({ currentMonthXP, lastMonthXP, dailyXP }: MonthlyXPSummaryProps) {
  // Calculate percentage change from last month to this month
  let percentChange = 0;
  if (lastMonthXP > 0) {
    percentChange = Math.round(((currentMonthXP - lastMonthXP) / lastMonthXP) * 100);
  } else if (currentMonthXP > 0) {
    percentChange = 100; // Went from 0 to something = 100% gain
  }

  const isUp = percentChange > 0;
  const isDown = percentChange < 0;

  // Month names for labels
  const now = new Date();
  const currentMonthName = now.toLocaleString("default", { month: "long" });
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthName = lastMonthDate.toLocaleString("default", { month: "short" });

  // Sparkline: show all days of the month, not just up to today
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const todayDate = now.getDate();
  const maxXP = Math.max(...dailyXP, 1);
  const chartHeight = 48;

  return (
    <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 h-full">
      <div className="flex items-center justify-between">
        {/* This month's XP */}
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
            {currentMonthName} XP
          </p>
          <p className="text-3xl font-extrabold text-stone-700 mt-1">
            {currentMonthXP}
          </p>
        </div>

        {/* Trend indicator and last month */}
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

      {/* Daily XP sparkline bar chart */}
      {dailyXP.length > 0 && (
        <div className="mt-4">
          {/* Bars */}
          <div className="flex items-end gap-[2px]" style={{ height: chartHeight }}>
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const xp = dailyXP[index] ?? 0;
              const isFutureDay = day > todayDate;
              const isToday = day === todayDate;
              const heightPercent = xp === 0 ? 0 : (xp / maxXP) * 100;

              return (
                <div key={day} className="flex-1 flex items-end h-full">
                  {isFutureDay ? (
                    <div className="w-full h-[1px] bg-stone-100 rounded-sm" />
                  ) : xp === 0 ? (
                    <div className="w-full h-[2px] bg-stone-200 rounded-sm" />
                  ) : (
                    <div
                      className={`w-full rounded-sm ${isToday ? "bg-emerald-500" : "bg-emerald-300"}`}
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    />
                  )}
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
      )}
    </div>
  );
}
