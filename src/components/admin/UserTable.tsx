import type { UserSummary } from "@/lib/adminQueries";
import { User } from "lucide-react";

interface UserTableProps {
  users: UserSummary[];
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div>
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Users
        </p>
        <div className="flex items-center justify-center text-stone-400 text-xs h-20">
          No users yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
        Users ({users.length})
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left py-1 pr-2 font-semibold text-stone-500">
                User
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                Last Active
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                Sessions
              </th>
              <th className="text-right py-1 px-2 font-semibold text-stone-500">
                XP
              </th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 25).map((user) => (
              <tr
                key={user.userId}
                className="border-b border-stone-100"
              >
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="w-5 h-5 rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center">
                        <User size={10} className="text-stone-400" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-600 truncate max-w-[120px]">
                        {user.firstName
                          ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                          : user.userId.substring(0, 8)}
                      </span>
                      {user.email && (
                        <span className="text-[9px] text-stone-400 truncate max-w-[120px]">
                          {user.email}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-1.5 px-2 text-right text-stone-500">
                  {timeAgo(user.lastActive)}
                </td>
                <td className="py-1.5 px-2 text-right font-bold text-stone-600">
                  {user.sessionCount}
                </td>
                <td className="py-1.5 px-2 text-right font-bold text-stone-600">
                  {user.totalXP}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
