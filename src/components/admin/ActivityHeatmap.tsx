import type { HeatmapCell } from "@/lib/adminQueries";

interface ActivityHeatmapProps {
  data: HeatmapCell[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center text-stone-400 text-xs h-32">
        No session data yet
      </div>
    );
  }

  // Build a lookup: dayOfWeek-hour → count
  const cellMap = new Map<string, number>();
  for (const cell of data) {
    cellMap.set(`${cell.dayOfWeek}-${cell.hour}`, cell.count);
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
        Session Activity
      </p>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] pt-4">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-[8px] text-stone-400 h-[14px] flex items-center"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1 overflow-hidden">
          {/* Hour labels */}
          <div className="grid grid-cols-24 gap-[3px] mb-[3px]">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-center">
                {h % 4 === 0 && (
                  <span className="text-[7px] text-stone-400">{h}</span>
                )}
              </div>
            ))}
          </div>
          {/* Cells */}
          {DAY_LABELS.map((_, dow) => (
            <div key={dow} className="grid grid-cols-24 gap-[3px] mb-[3px]">
              {Array.from({ length: 24 }, (__, h) => {
                const count = cellMap.get(`${dow}-${h}`) ?? 0;
                const opacity = count > 0 ? 0.15 + (count / maxCount) * 0.85 : 0.05;
                return (
                  <div
                    key={h}
                    className="aspect-square rounded-[2px] relative group"
                    style={{
                      backgroundColor: `rgba(245, 158, 11, ${opacity})`,
                    }}
                  >
                    {count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-stone-700 text-white text-[9px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                        {count}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
