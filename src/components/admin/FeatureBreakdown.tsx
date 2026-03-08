interface FeatureBreakdownProps {
  title: string;
  data: { label: string; count: number }[];
  barColor?: string;
}

const FRIENDLY_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/calendar": "Calendar",
  "/settings": "Settings",
  "/shop": "Shop",
  "/prizes": "Prizes",
  "/vision": "Vision Board",
  "/admin": "Admin",
  xp_earned: "XP Earned",
  habit_toggled: "Habit Toggle",
  damage_toggled: "Damage Toggle",
  vision_added: "Vision Added",
  shop_purchase: "Shop Purchase",
  user_identified: "User Identified",
  feature_used: "Feature Used",
  challenge_completed: "Challenge Done",
};

export function FeatureBreakdown({
  title,
  data,
  barColor = "rgb(168, 162, 158)",
}: FeatureBreakdownProps) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  if (data.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          {title}
        </p>
        <div className="flex items-center justify-center text-stone-400 text-xs h-20">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="space-y-1.5">
        {data.slice(0, 10).map((item) => {
          const width = Math.max(2, (item.count / maxCount) * 100);
          const friendlyLabel = FRIENDLY_LABELS[item.label] ?? item.label;

          return (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500 w-24 truncate font-medium">
                {friendlyLabel}
              </span>
              <div className="flex-1 h-4 bg-stone-100 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-stone-500 w-8 text-right">
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
