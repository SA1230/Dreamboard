interface BarChartProps {
  data: { label: string; value: number; sublabel?: string }[];
  barColor?: string;
  height?: number;
}

export function BarChart({
  data,
  barColor = "rgb(245, 158, 11)",
  height = 160,
}: BarChartProps) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-stone-400 text-xs"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-end gap-[2px]"
        style={{ height }}
      >
        {data.map((item, i) => {
          const barHeight =
            item.value > 0 ? Math.max(2, (item.value / maxValue) * height) : 0;

          return (
            <div
              key={i}
              className="flex-1 relative group"
              style={{ height: "100%" }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-opacity hover:opacity-80"
                style={{
                  height: barHeight,
                  backgroundColor: barColor,
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md bg-stone-700 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {item.value.toLocaleString()}
                {item.sublabel ? ` ${item.sublabel}` : ""}
              </div>
            </div>
          );
        })}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-[2px] mt-1">
        {data.map((item, i) => {
          // Show every Nth label to avoid overcrowding
          const showLabel =
            data.length <= 10 ||
            i === 0 ||
            i === data.length - 1 ||
            i % Math.ceil(data.length / 7) === 0;
          return (
            <div key={i} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[8px] text-stone-400">{item.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
