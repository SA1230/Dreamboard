import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyXPSummaryProps {
  currentMonthXP: number;
  lastMonthXP: number;
}

export function MonthlyXPSummary({ currentMonthXP, lastMonthXP }: MonthlyXPSummaryProps) {
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

  return (
    <div className="mb-8 rounded-2xl bg-stone-50 border border-stone-200 p-5">
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
    </div>
  );
}
