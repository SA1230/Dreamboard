"use client";

import { Activity } from "@/lib/types";
import { STAT_DEFINITIONS } from "@/lib/stats";
import { StatIcon } from "./StatIcons";

interface ActivityLogProps {
  activities: Activity[];
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const recentActivities = activities.slice(0, 20);

  if (recentActivities.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-sm">No activities yet. Click a + button to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recentActivities.map((activity, index) => {
        const definition = STAT_DEFINITIONS[activity.stat];
        return (
          <div
            key={activity.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 transition-all duration-300"
            style={{
              animationDelay: `${index * 0.05}s`,
            }}
          >
            <div style={{ color: definition.color }} className="flex-shrink-0">
              <StatIcon stat={activity.stat} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: definition.color }}
                >
                  {definition.name}
                </span>
                <span className="text-xs text-stone-300">+1 XP</span>
              </div>
              {activity.note && (
                <p className="text-xs text-stone-400 truncate">{activity.note}</p>
              )}
            </div>
            <span className="text-xs text-stone-300 flex-shrink-0">
              {formatTimestamp(activity.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
