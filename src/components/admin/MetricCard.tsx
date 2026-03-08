import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  previousValue?: number;
  subtitle?: string;
  accentColor?: string;
}

export function MetricCard({
  label,
  value,
  previousValue,
  subtitle,
  accentColor = "#d6d3d1",
}: MetricCardProps) {
  let percentChange = 0;
  let hasTrend = false;

  if (previousValue !== undefined && previousValue > 0) {
    percentChange = Math.round(
      ((value - previousValue) / previousValue) * 100
    );
    hasTrend = true;
  } else if (previousValue !== undefined && value > 0) {
    percentChange = 100;
    hasTrend = true;
  }

  const isUp = percentChange > 0;
  const isDown = percentChange < 0;

  return (
    <div
      className="rounded-xl bg-stone-50 border border-stone-200 p-4 flex flex-col gap-1"
      style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}
    >
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-stone-700">
        {value.toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        {hasTrend && (
          <span className="flex items-center gap-0.5">
            {isUp ? (
              <TrendingUp size={12} className="text-emerald-500" />
            ) : isDown ? (
              <TrendingDown size={12} className="text-red-400" />
            ) : (
              <Minus size={12} className="text-stone-400" />
            )}
            <span
              className={`text-[10px] font-bold ${
                isUp
                  ? "text-emerald-500"
                  : isDown
                    ? "text-red-400"
                    : "text-stone-400"
              }`}
            >
              {isUp ? "+" : ""}
              {percentChange}%
            </span>
          </span>
        )}
        {subtitle && (
          <span className="text-[10px] text-stone-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
