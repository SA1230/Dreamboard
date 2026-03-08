import type { RawEvent } from "@/lib/adminQueries";
import {
  Zap,
  PlayCircle,
  Eye,
  Heart,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  UserCheck,
  Star,
} from "lucide-react";

interface LiveEventFeedProps {
  events: RawEvent[];
  total: number;
}

const EVENT_CONFIG: Record<
  string,
  { icon: typeof Zap; color: string; bgColor: string; label: string }
> = {
  session_start: {
    icon: PlayCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Session",
  },
  page_view: {
    icon: Eye,
    color: "text-stone-500",
    bgColor: "bg-stone-100",
    label: "Page View",
  },
  xp_earned: {
    icon: Zap,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    label: "XP Earned",
  },
  habit_toggled: {
    icon: Heart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Habit",
  },
  damage_toggled: {
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-50",
    label: "Damage",
  },
  vision_added: {
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Vision",
  },
  shop_purchase: {
    icon: ShoppingBag,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    label: "Purchase",
  },
  user_identified: {
    icon: UserCheck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    label: "Identified",
  },
};

const DEFAULT_CONFIG = {
  icon: Star,
  color: "text-stone-500",
  bgColor: "bg-stone-100",
  label: "Event",
};

function formatTime(dateString: string): string {
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  if (diffMs < 60000) return "just now";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEventDetail(event: RawEvent): string {
  const data = event.eventData;
  switch (event.eventType) {
    case "page_view":
      return (data.page as string) ?? "";
    case "xp_earned":
      return `${data.totalXP ?? 0} XP`;
    case "habit_toggled":
      return `${data.habitKey ?? ""}${(data.completed as boolean) ? " ON" : " OFF"}`;
    case "damage_toggled":
      return `${data.damageKey ?? ""}${(data.marked as boolean) ? " ON" : " OFF"}`;
    case "vision_added":
      return (data.oracleUsed as boolean) ? "with Oracle" : "plain";
    case "shop_purchase":
      return (data.itemName as string) ?? "";
    case "session_start":
      return `${data.screenWidth ?? "?"}x${data.screenHeight ?? "?"}`;
    default:
      return "";
  }
}

export function LiveEventFeed({ events, total }: LiveEventFeedProps) {
  if (events.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Live Feed
        </p>
        <div className="flex items-center justify-center text-stone-400 text-xs h-20">
          No events yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Live Feed
        </p>
        <span className="text-[10px] text-stone-400">
          {total.toLocaleString()} total events
        </span>
      </div>
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {events.map((event) => {
          const config = EVENT_CONFIG[event.eventType] ?? DEFAULT_CONFIG;
          const Icon = config.icon;
          const detail = getEventDetail(event);

          return (
            <div
              key={event.id}
              className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-stone-100 transition-colors animate-fadeIn"
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
              >
                <Icon size={10} className={config.color} />
              </div>
              <span
                className={`text-[10px] font-bold w-16 flex-shrink-0 ${config.color}`}
              >
                {config.label}
              </span>
              <span className="text-[10px] text-stone-500 truncate flex-1">
                {detail}
              </span>
              <span className="text-[9px] text-stone-400 flex-shrink-0 font-mono">
                {event.userId}
              </span>
              <span className="text-[9px] text-stone-400 flex-shrink-0 w-14 text-right">
                {formatTime(event.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
