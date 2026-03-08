import { createServiceClient } from "./supabase";

// ─── Auth ────────────────────────────────────────────────────────

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

// ─── Types ───────────────────────────────────────────────────────

export interface OverviewMetrics {
  totalUsers: number;
  authenticatedUsers: number;
  totalSessions: number;
  dauToday: number;
  dauYesterday: number;
  wauThisWeek: number;
  wauLastWeek: number;
  totalXPAwarded: number;
  avgXPPerSession: number;
  totalHabitToggles: number;
  totalVisionCards: number;
}

export interface DailySessionCount {
  date: string;
  sessions: number;
  uniqueUsers: number;
}

export interface PageViewCount {
  page: string;
  count: number;
}

export interface EventTypeCount {
  eventType: string;
  count: number;
}

export interface DailyXP {
  date: string;
  totalXP: number;
  submissions: number;
}

export interface StatXPDistribution {
  stat: string;
  totalXP: number;
}

export interface HeatmapCell {
  dayOfWeek: number;
  hour: number;
  count: number;
}

export interface HabitStat {
  habitKey: string;
  toggleCount: number;
  uniqueUsers: number;
}

export interface RetentionCohort {
  cohortDate: string;
  cohortSize: number;
  d1: number;
  d7: number;
  d30: number;
}

export interface UserSummary {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  lastActive: string;
  sessionCount: number;
  totalXP: number;
  isAuthenticated: boolean;
}

export interface RawEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  createdAt: string;
}

export interface MetricsData {
  sessionsPerDay: DailySessionCount[];
  pageViews: PageViewCount[];
  eventCounts: EventTypeCount[];
  xpPerDay: DailyXP[];
  statDistribution: StatXPDistribution[];
  sessionHeatmap: HeatmapCell[];
  habitStats: HabitStat[];
  retention: RetentionCohort[];
}

export interface EventsResponse {
  events: RawEvent[];
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

function getSinceDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "7d":
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

// ─── Overview Metrics ────────────────────────────────────────────

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const supabase = createServiceClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const yesterdayStart = startOfDay(
    new Date(now.getTime() - 24 * 60 * 60 * 1000)
  ).toISOString();
  const weekAgoStart = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const twoWeeksAgoStart = new Date(
    now.getTime() - 14 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Fetch all events — dataset is small enough for a solo founder app
  const { data: allEvents } = await supabase
    .from("events")
    .select("user_id, event_type, event_data, created_at")
    .neq("event_data->>page", "/admin")
    .order("created_at", { ascending: false });

  const events = allEvents ?? [];

  // Total unique users
  const allUserIds = new Set(events.map((e) => e.user_id));
  const totalUsers = allUserIds.size;

  // Authenticated users (from user_identified events)
  const authEvents = events.filter((e) => e.event_type === "user_identified");
  const authenticatedIds = new Set(
    authEvents.map(
      (e) => (e.event_data as Record<string, string>).authenticatedId
    )
  );
  const authenticatedUsers = authenticatedIds.size;

  // Sessions
  const sessionEvents = events.filter((e) => e.event_type === "session_start");
  const totalSessions = sessionEvents.length;

  // DAU today
  const todaySessions = sessionEvents.filter(
    (e) => e.created_at >= todayStart
  );
  const dauToday = new Set(todaySessions.map((e) => e.user_id)).size;

  // DAU yesterday
  const yesterdaySessions = sessionEvents.filter(
    (e) => e.created_at >= yesterdayStart && e.created_at < todayStart
  );
  const dauYesterday = new Set(yesterdaySessions.map((e) => e.user_id)).size;

  // WAU this week
  const thisWeekSessions = sessionEvents.filter(
    (e) => e.created_at >= weekAgoStart
  );
  const wauThisWeek = new Set(thisWeekSessions.map((e) => e.user_id)).size;

  // WAU last week
  const lastWeekSessions = sessionEvents.filter(
    (e) => e.created_at >= twoWeeksAgoStart && e.created_at < weekAgoStart
  );
  const wauLastWeek = new Set(lastWeekSessions.map((e) => e.user_id)).size;

  // XP
  const xpEvents = events.filter((e) => e.event_type === "xp_earned");
  let totalXPAwarded = 0;
  for (const e of xpEvents) {
    const data = e.event_data as Record<string, unknown>;
    totalXPAwarded += (data.totalXP as number) ?? 0;
  }
  const avgXPPerSession =
    xpEvents.length > 0 ? Math.round(totalXPAwarded / xpEvents.length) : 0;

  // Habit toggles
  const totalHabitToggles = events.filter(
    (e) => e.event_type === "habit_toggled"
  ).length;

  // Vision cards
  const totalVisionCards = events.filter(
    (e) => e.event_type === "vision_added"
  ).length;

  return {
    totalUsers,
    authenticatedUsers,
    totalSessions,
    dauToday,
    dauYesterday,
    wauThisWeek,
    wauLastWeek,
    totalXPAwarded,
    avgXPPerSession,
    totalHabitToggles,
    totalVisionCards,
  };
}

// ─── Time-Series Metrics ─────────────────────────────────────────

export async function getMetrics(period: string): Promise<MetricsData> {
  const supabase = createServiceClient();
  const since = getSinceDate(period);
  const sinceISO = since.toISOString();

  const { data: allEvents } = await supabase
    .from("events")
    .select("user_id, event_type, event_data, created_at")
    .gte("created_at", sinceISO)
    .neq("event_data->>page", "/admin")
    .order("created_at", { ascending: true });

  const events = allEvents ?? [];

  // ── Sessions per day ──
  const sessionsByDay = new Map<
    string,
    { sessions: number; users: Set<string> }
  >();
  for (const e of events) {
    if (e.event_type !== "session_start") continue;
    const date = toDateString(e.created_at);
    const entry = sessionsByDay.get(date) ?? {
      sessions: 0,
      users: new Set<string>(),
    };
    entry.sessions++;
    entry.users.add(e.user_id);
    sessionsByDay.set(date, entry);
  }

  // Fill in missing days with zeros
  const sessionsPerDay: DailySessionCount[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  for (
    let d = new Date(since);
    d <= now;
    d = new Date(d.getTime() + dayMs)
  ) {
    const dateStr = toDateString(d);
    const entry = sessionsByDay.get(dateStr);
    sessionsPerDay.push({
      date: dateStr,
      sessions: entry?.sessions ?? 0,
      uniqueUsers: entry?.users.size ?? 0,
    });
  }

  // ── Page views ──
  const pageCountMap = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== "page_view") continue;
    const page =
      (e.event_data as Record<string, string>).page ?? "unknown";
    if (page === "/admin") continue;
    pageCountMap.set(page, (pageCountMap.get(page) ?? 0) + 1);
  }
  const pageViews: PageViewCount[] = Array.from(pageCountMap.entries())
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count);

  // ── Event type counts ──
  const eventTypeMap = new Map<string, number>();
  for (const e of events) {
    if (e.event_type === "page_view" || e.event_type === "session_start")
      continue;
    eventTypeMap.set(e.event_type, (eventTypeMap.get(e.event_type) ?? 0) + 1);
  }
  const eventCounts: EventTypeCount[] = Array.from(eventTypeMap.entries())
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count);

  // ── XP per day ──
  const xpByDay = new Map<string, { totalXP: number; submissions: number }>();
  for (const e of events) {
    if (e.event_type !== "xp_earned") continue;
    const date = toDateString(e.created_at);
    const data = e.event_data as Record<string, unknown>;
    const xp = (data.totalXP as number) ?? 0;
    const entry = xpByDay.get(date) ?? { totalXP: 0, submissions: 0 };
    entry.totalXP += xp;
    entry.submissions++;
    xpByDay.set(date, entry);
  }
  const xpPerDay: DailyXP[] = [];
  for (
    let d = new Date(since);
    d <= now;
    d = new Date(d.getTime() + dayMs)
  ) {
    const dateStr = toDateString(d);
    const entry = xpByDay.get(dateStr);
    xpPerDay.push({
      date: dateStr,
      totalXP: entry?.totalXP ?? 0,
      submissions: entry?.submissions ?? 0,
    });
  }

  // ── Stat distribution ──
  const statXPMap = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== "xp_earned") continue;
    const data = e.event_data as Record<string, unknown>;
    const stats = data.stats as Array<{ stat: string; amount: number }> | undefined;
    if (stats) {
      for (const s of stats) {
        statXPMap.set(s.stat, (statXPMap.get(s.stat) ?? 0) + s.amount);
      }
    }
  }
  const statDistribution: StatXPDistribution[] = Array.from(
    statXPMap.entries()
  )
    .map(([stat, totalXP]) => ({ stat, totalXP }))
    .sort((a, b) => b.totalXP - a.totalXP);

  // ── Session heatmap ──
  const heatmapMap = new Map<string, number>();
  for (const e of events) {
    if (e.event_type !== "session_start") continue;
    const d = new Date(e.created_at);
    const dayOfWeek = d.getUTCDay(); // 0=Sun
    const hour = d.getUTCHours();
    const key = `${dayOfWeek}-${hour}`;
    heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + 1);
  }
  const sessionHeatmap: HeatmapCell[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let h = 0; h < 24; h++) {
      const count = heatmapMap.get(`${dow}-${h}`) ?? 0;
      sessionHeatmap.push({ dayOfWeek: dow, hour: h, count });
    }
  }

  // ── Habit stats ──
  const habitMap = new Map<
    string,
    { toggleCount: number; users: Set<string> }
  >();
  for (const e of events) {
    if (e.event_type !== "habit_toggled") continue;
    const data = e.event_data as Record<string, unknown>;
    const key = (data.habitKey as string) ?? "unknown";
    const entry = habitMap.get(key) ?? {
      toggleCount: 0,
      users: new Set<string>(),
    };
    entry.toggleCount++;
    entry.users.add(e.user_id);
    habitMap.set(key, entry);
  }
  const habitStats: HabitStat[] = Array.from(habitMap.entries())
    .map(([habitKey, entry]) => ({
      habitKey,
      toggleCount: entry.toggleCount,
      uniqueUsers: entry.users.size,
    }))
    .sort((a, b) => b.toggleCount - a.toggleCount);

  // ── Retention cohorts ──
  // Find first session date per user, then check if they returned on D+1, D+7, D+30
  const firstSessionByUser = new Map<string, string>();
  const allSessionDaysByUser = new Map<string, Set<string>>();
  for (const e of events) {
    if (e.event_type !== "session_start") continue;
    const date = toDateString(e.created_at);
    if (
      !firstSessionByUser.has(e.user_id) ||
      date < firstSessionByUser.get(e.user_id)!
    ) {
      firstSessionByUser.set(e.user_id, date);
    }
    const days = allSessionDaysByUser.get(e.user_id) ?? new Set<string>();
    days.add(date);
    allSessionDaysByUser.set(e.user_id, days);
  }

  // Also look at events BEFORE the period to get accurate first-session data
  // For retention, we need the full history. Fetch all session_start events.
  const { data: allSessionEvents } = await supabase
    .from("events")
    .select("user_id, created_at")
    .eq("event_type", "session_start")
    .order("created_at", { ascending: true });

  const fullFirstSession = new Map<string, string>();
  const fullSessionDays = new Map<string, Set<string>>();
  for (const e of allSessionEvents ?? []) {
    const date = toDateString(e.created_at);
    if (
      !fullFirstSession.has(e.user_id) ||
      date < fullFirstSession.get(e.user_id)!
    ) {
      fullFirstSession.set(e.user_id, date);
    }
    const days = fullSessionDays.get(e.user_id) ?? new Set<string>();
    days.add(date);
    fullSessionDays.set(e.user_id, days);
  }

  // Group users by cohort date, compute retention
  const cohortUsers = new Map<string, string[]>();
  for (const [userId, cohortDate] of fullFirstSession) {
    const users = cohortUsers.get(cohortDate) ?? [];
    users.push(userId);
    cohortUsers.set(cohortDate, users);
  }

  const retention: RetentionCohort[] = [];
  const sortedCohortDates = Array.from(cohortUsers.keys()).sort();
  for (const cohortDate of sortedCohortDates) {
    const users = cohortUsers.get(cohortDate)!;
    const cohortDateObj = new Date(cohortDate);
    let d1 = 0;
    let d7 = 0;
    let d30 = 0;

    for (const userId of users) {
      const sessionDays = fullSessionDays.get(userId)!;
      const d1Date = toDateString(
        new Date(cohortDateObj.getTime() + 1 * dayMs)
      );
      const d7Dates = Array.from({ length: 7 }, (_, i) =>
        toDateString(new Date(cohortDateObj.getTime() + (i + 1) * dayMs))
      );
      const d30Dates = Array.from({ length: 30 }, (_, i) =>
        toDateString(new Date(cohortDateObj.getTime() + (i + 1) * dayMs))
      );

      if (sessionDays.has(d1Date)) d1++;
      if (d7Dates.some((d) => sessionDays.has(d))) d7++;
      if (d30Dates.some((d) => sessionDays.has(d))) d30++;
    }

    retention.push({
      cohortDate,
      cohortSize: users.length,
      d1,
      d7,
      d30,
    });
  }

  return {
    sessionsPerDay,
    pageViews,
    eventCounts,
    xpPerDay,
    statDistribution,
    sessionHeatmap,
    habitStats,
    retention,
  };
}

// ─── User Summaries ──────────────────────────────────────────────

export async function getUserSummaries(): Promise<UserSummary[]> {
  const supabase = createServiceClient();

  // Get profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("google_sub, email, first_name, last_name, avatar_url");

  const profileMap = new Map<
    string,
    {
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    }
  >();
  for (const p of profiles ?? []) {
    profileMap.set(p.google_sub, {
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      avatarUrl: p.avatar_url,
    });
  }

  // Get user_identified events to map anon IDs to authenticated IDs
  const { data: identEvents } = await supabase
    .from("events")
    .select("event_data")
    .eq("event_type", "user_identified");

  const anonToAuth = new Map<string, string>();
  for (const e of identEvents ?? []) {
    const data = e.event_data as Record<string, string>;
    if (data.anonymousId && data.authenticatedId) {
      anonToAuth.set(data.anonymousId, data.authenticatedId);
    }
  }

  // Get all events grouped by user
  const { data: allEvents } = await supabase
    .from("events")
    .select("user_id, event_type, event_data, created_at")
    .order("created_at", { ascending: false });

  const userStats = new Map<
    string,
    { lastActive: string; sessionCount: number; totalXP: number }
  >();

  for (const e of allEvents ?? []) {
    // Resolve anon IDs to authenticated IDs where possible
    const resolvedId = anonToAuth.get(e.user_id) ?? e.user_id;
    const stats = userStats.get(resolvedId) ?? {
      lastActive: e.created_at,
      sessionCount: 0,
      totalXP: 0,
    };
    if (e.created_at > stats.lastActive) stats.lastActive = e.created_at;
    if (e.event_type === "session_start") stats.sessionCount++;
    if (e.event_type === "xp_earned") {
      const data = e.event_data as Record<string, unknown>;
      stats.totalXP += (data.totalXP as number) ?? 0;
    }
    userStats.set(resolvedId, stats);
  }

  const summaries: UserSummary[] = [];
  for (const [userId, stats] of userStats) {
    const profile = profileMap.get(userId);
    summaries.push({
      userId,
      email: profile?.email ?? null,
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      lastActive: stats.lastActive,
      sessionCount: stats.sessionCount,
      totalXP: stats.totalXP,
      isAuthenticated: profileMap.has(userId),
    });
  }

  // Sort by last active descending
  summaries.sort(
    (a, b) =>
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );

  return summaries;
}

// ─── Recent Events Feed ──────────────────────────────────────────

export async function getRecentEvents(
  limit: number,
  offset: number
): Promise<EventsResponse> {
  const supabase = createServiceClient();

  const { data, count, error } = await supabase
    .from("events")
    .select("id, user_id, event_type, event_data, created_at", {
      count: "exact",
    })
    .neq("event_data->>page", "/admin")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Failed to fetch recent events:", error.message);
    return { events: [], total: 0 };
  }

  const events: RawEvent[] = (data ?? []).map((e) => ({
    id: e.id,
    userId: e.user_id.substring(0, 12),
    eventType: e.event_type,
    eventData: e.event_data as Record<string, unknown>,
    createdAt: e.created_at,
  }));

  return { events, total: count ?? 0 };
}
