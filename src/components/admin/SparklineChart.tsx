interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  currentValue?: number;
}

export function SparklineChart({
  data,
  width = 280,
  height = 80,
  color = "rgb(245, 158, 11)",
  label,
  currentValue,
}: SparklineChartProps) {
  if (data.length === 0 || data.every((d) => d === 0)) {
    return (
      <div>
        {label && (
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            {label}
          </p>
        )}
        <div
          className="flex items-center justify-center text-stone-400 text-xs"
          style={{ height }}
        >
          No data yet
        </div>
      </div>
    );
  }

  const maxVal = Math.max(1, ...data);
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxVal) * chartHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");

  // Fill polygon: line points + bottom-right + bottom-left
  const fillPoints = [
    ...points,
    `${padding + chartWidth},${padding + chartHeight}`,
    `${padding},${padding + chartHeight}`,
  ].join(" ");

  return (
    <div>
      {(label || currentValue !== undefined) && (
        <div className="flex items-baseline justify-between mb-1">
          {label && (
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              {label}
            </p>
          )}
          {currentValue !== undefined && (
            <p className="text-lg font-extrabold text-stone-700">
              {currentValue.toLocaleString()}
            </p>
          )}
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill="url(#sparkline-fill)" />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
