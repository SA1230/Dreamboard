"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, LogIn } from "lucide-react";
import type {
  OverviewMetrics,
  MetricsData,
  EventsResponse,
  UserSummary,
} from "@/lib/adminQueries";
import { MetricCard } from "@/components/admin/MetricCard";
import { BarChart } from "@/components/admin/BarChart";
import { SparklineChart } from "@/components/admin/SparklineChart";
import { ActivityHeatmap } from "@/components/admin/ActivityHeatmap";
import { FeatureBreakdown } from "@/components/admin/FeatureBreakdown";
import { RetentionTable } from "@/components/admin/RetentionTable";
import { UserTable } from "@/components/admin/UserTable";
import { LiveEventFeed } from "@/components/admin/LiveEventFeed";

type Period = "7d" | "30d" | "90d";
type AuthState = "loading" | "unauthenticated" | "forbidden" | "authorized";

const STAT_COLORS: Record<string, string> = {
  strength: "#e57373",
  wisdom: "#7986cb",
  vitality: "#81c784",
  charisma: "#ffb74d",
  craft: "#a1887f",
  discipline: "#90a4ae",
  spirit: "#ce93d8",
  wealth: "#ffd54f",
};

export default function AdminPage() {
  const { status: sessionStatus } = useSession();

  // Auth state
  const [authState, setAuthState] = useState<AuthState>("loading");

  // Data
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [metrics, setMetrics] = useState<
    (MetricsData & { users: UserSummary[] }) | null
  >(null);
  const [events, setEvents] = useState<EventsResponse | null>(null);

  // UI state
  const [period, setPeriod] = useState<Period>("7d");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch functions ──

  const fetchOverview = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401) {
        setAuthState("unauthenticated");
        return false;
      }
      if (res.status === 403) {
        setAuthState("forbidden");
        return false;
      }
      if (!res.ok) return false;
      const data = await res.json();
      setOverview(data);
      setAuthState("authorized");
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchMetrics = useCallback(async (p: Period) => {
    try {
      const res = await fetch(`/api/admin/metrics?period=${p}`);
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data);
    } catch {
      // silently fail
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/events?limit=50");
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data);
    } catch {
      // silently fail
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchOverview(), fetchMetrics(period), fetchEvents()]);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, [fetchOverview, fetchMetrics, fetchEvents, period]);

  // ── Initial load ──

  useEffect(() => {
    if (sessionStatus === "loading") return;

    async function init() {
      const authorized = await fetchOverview();
      if (authorized) {
        await Promise.all([fetchMetrics(period), fetchEvents()]);
        setLastUpdated(new Date());
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus]);

  // ── Period change ──

  useEffect(() => {
    if (authState !== "authorized") return;
    fetchMetrics(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // ── Auto-refresh every 30s ──

  useEffect(() => {
    if (authState !== "authorized") return;

    intervalRef.current = setInterval(async () => {
      await Promise.all([fetchOverview(), fetchEvents()]);
      setLastUpdated(new Date());
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [authState, fetchOverview, fetchEvents]);

  // ── Time since last update ──

  const [secondsAgo, setSecondsAgo] = useState(0);
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // ── Loading state ──

  if (authState === "loading" || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  // ── Unauthenticated ──

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <LogIn size={32} className="text-stone-400 mx-auto mb-3" />
          <p className="text-stone-600 font-semibold">Sign in to continue</p>
          <p className="text-stone-400 text-sm mt-1">
            Admin access requires authentication
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-300 transition-colors"
          >
            Back to app
          </Link>
        </div>
      </div>
    );
  }

  // ── Forbidden ──

  if (authState === "forbidden") {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-stone-700 mb-2">403</p>
          <p className="text-stone-500 text-sm">
            You do not have admin access
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-xl bg-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-300 transition-colors"
          >
            Back to app
          </Link>
        </div>
      </div>
    );
  }

  // ── Dashboard ──

  const sessionsChartData = (metrics?.sessionsPerDay ?? []).map((d) => ({
    label: d.date.substring(5), // MM-DD
    value: d.sessions,
    sublabel: `sessions (${d.uniqueUsers} users)`,
  }));

  const xpSparklineData = (metrics?.xpPerDay ?? []).map((d) => d.totalXP);
  const latestXP =
    metrics?.xpPerDay?.reduce((sum, d) => sum + d.totalXP, 0) ?? 0;

  const statDistData = (metrics?.statDistribution ?? []).map((d) => ({
    label: d.stat,
    count: d.totalXP,
  }));

  const habitData = (metrics?.habitStats ?? []).map((d) => ({
    label: d.habitKey,
    count: d.toggleCount,
  }));

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-800 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-sm font-bold tracking-wide">
                Dreamboard Admin
              </h1>
              <p className="text-[10px] text-stone-400">
                {lastUpdated
                  ? `Updated ${secondsAgo}s ago`
                  : "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex bg-stone-700 rounded-lg p-0.5">
              {(["7d", "30d", "90d"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                    period === p
                      ? "bg-stone-500 text-white"
                      : "text-stone-400 hover:text-stone-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Refresh button */}
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Section 1: Vital Signs */}
        <section>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Active Today"
              value={overview?.dauToday ?? 0}
              previousValue={overview?.dauYesterday}
              subtitle="vs yesterday"
              accentColor="#f59e0b"
            />
            <MetricCard
              label="Active This Week"
              value={overview?.wauThisWeek ?? 0}
              previousValue={overview?.wauLastWeek}
              subtitle="vs last week"
              accentColor="#f59e0b"
            />
            <MetricCard
              label="Total Users"
              value={overview?.totalUsers ?? 0}
              subtitle={`${overview?.authenticatedUsers ?? 0} authenticated`}
              accentColor="#6366f1"
            />
            <MetricCard
              label="XP Awarded"
              value={overview?.totalXPAwarded ?? 0}
              subtitle={`avg ${overview?.avgXPPerSession ?? 0} per session`}
              accentColor="#10b981"
            />
          </div>
        </section>

        {/* Section 2: Usage */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Sessions / Day
            </p>
            {metrics ? (
              <BarChart data={sessionsChartData} />
            ) : (
              <Skeleton height={160} />
            )}
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <>
                <FeatureBreakdown
                  title="Page Views"
                  data={(metrics.pageViews ?? []).map((d) => ({
                    label: d.page,
                    count: d.count,
                  }))}
                  barColor="rgb(120, 134, 203)"
                />
                <div className="mt-4">
                  <FeatureBreakdown
                    title="Events"
                    data={(metrics.eventCounts ?? []).map((d) => ({
                      label: d.eventType,
                      count: d.count,
                    }))}
                    barColor="rgb(245, 158, 11)"
                  />
                </div>
              </>
            ) : (
              <Skeleton height={200} />
            )}
          </div>
        </section>

        {/* Section 3: Engagement */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <SparklineChart
                data={xpSparklineData}
                label="XP Trend"
                currentValue={latestXP}
              />
            ) : (
              <Skeleton height={100} />
            )}
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <FeatureBreakdown
                title="Stat Distribution"
                data={statDistData}
                barColor="rgb(168, 162, 158)"
              />
            ) : (
              <Skeleton height={100} />
            )}
            {/* Color the bars by stat */}
            {metrics && statDistData.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {statDistData.map((s) => (
                  <span
                    key={s.label}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        (STAT_COLORS[s.label] ?? "#a8a29e") + "20",
                      color: STAT_COLORS[s.label] ?? "#a8a29e",
                    }}
                  >
                    {s.label}: {s.count}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <FeatureBreakdown
                title="Habit Engagement"
                data={habitData}
                barColor="rgb(129, 199, 132)"
              />
            ) : (
              <Skeleton height={100} />
            )}
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <ActivityHeatmap data={metrics.sessionHeatmap ?? []} />
            ) : (
              <Skeleton height={140} />
            )}
          </div>
        </section>

        {/* Section 4: Retention + Users */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <RetentionTable data={metrics.retention ?? []} />
            ) : (
              <Skeleton height={200} />
            )}
          </div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
            {metrics ? (
              <UserTable users={metrics.users ?? []} />
            ) : (
              <Skeleton height={200} />
            )}
          </div>
        </section>

        {/* Section 5: Live Feed */}
        <section className="rounded-xl bg-stone-50 border border-stone-200 p-4">
          {events ? (
            <LiveEventFeed events={events.events} total={events.total} />
          ) : (
            <Skeleton height={200} />
          )}
        </section>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}

// Simple skeleton placeholder
function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="bg-stone-200 rounded-lg animate-pulse"
      style={{ height }}
    />
  );
}
