"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { track, identifyUser } from "@/lib/tracker";

/**
 * TrackerProvider — handles automatic tracking of session_start and page_view.
 * Place inside AuthProvider so it has access to the session.
 *
 * Feature-specific events (xp_earned, habit_toggled, etc.) are tracked
 * directly via track() calls in the relevant code paths.
 */
export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionTracked = useRef(false);

  // Identify user when session becomes available
  useEffect(() => {
    if (session?.user?.googleSub) {
      identifyUser(session.user.googleSub);
    }
  }, [session?.user?.googleSub]);

  // Track session_start once per page load
  useEffect(() => {
    if (!sessionTracked.current) {
      sessionTracked.current = true;
      track("session_start", {
        referrer: document.referrer || undefined,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      });
    }
  }, []);

  // Track page_view on route changes
  useEffect(() => {
    track("page_view", { page: pathname });
  }, [pathname]);

  return <>{children}</>;
}
