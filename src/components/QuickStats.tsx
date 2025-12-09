"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";

interface Stats {
  sessions: number;
  totalSeconds: number;
  averageSeconds: number;
  avgSessionsPerDay: number;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function getDateRange(daysAgo: number): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  if (daysAgo === 0) {
    // Today
    start.setHours(0, 0, 0, 0);
  } else {
    // N days ago
    start.setDate(start.getDate() - daysAgo);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export function QuickStats() {
  const [todayStats, setTodayStats] = useState<Stats>({
    sessions: 0,
    totalSeconds: 0,
    averageSeconds: 0,
    avgSessionsPerDay: 0,
  });
  const [last3DaysStats, setLast3DaysStats] = useState<Stats>({
    sessions: 0,
    totalSeconds: 0,
    averageSeconds: 0,
    avgSessionsPerDay: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/feedings");
        if (!response.ok) throw new Error("Failed to fetch feedings");

        const feedings = await response.json();

        // Today stats
        const { start: todayStart, end: todayEnd } = getDateRange(0);
        const todayFeedings = feedings.filter((feeding: any) => {
          const startedAt = new Date(feeding.startedAt);
          return startedAt >= todayStart && startedAt <= todayEnd;
        });
        const todayTotalSeconds = todayFeedings.reduce(
          (sum: number, feeding: any) => sum + (feeding.durationSeconds || 0),
          0
        );

        setTodayStats({
          sessions: todayFeedings.length,
          totalSeconds: todayTotalSeconds,
          averageSeconds:
            todayFeedings.length > 0
              ? Math.round(todayTotalSeconds / todayFeedings.length)
              : 0,
          avgSessionsPerDay: todayFeedings.length,
        });

        // Last 3 days stats
        const { start: last3DaysStart, end: last3DaysEnd } = getDateRange(3);
        const last3DaysFeedings = feedings.filter((feeding: any) => {
          const startedAt = new Date(feeding.startedAt);
          return startedAt >= last3DaysStart && startedAt <= last3DaysEnd;
        });
        const last3DaysTotalSeconds = last3DaysFeedings.reduce(
          (sum: number, feeding: any) => sum + (feeding.durationSeconds || 0),
          0
        );

        setLast3DaysStats({
          sessions: last3DaysFeedings.length,
          totalSeconds: last3DaysTotalSeconds,
          averageSeconds:
            last3DaysFeedings.length > 0
              ? Math.round(last3DaysTotalSeconds / last3DaysFeedings.length)
              : 0,
          avgSessionsPerDay:
            last3DaysFeedings.length > 0
              ? Math.round((last3DaysFeedings.length / 3) * 10) / 10
              : 0,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
        <div className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Today Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                Sessions
              </span>
              <span className="text-lg font-bold">{todayStats.sessions}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
              <Clock className="h-3 w-3" />
              Total
            </span>
            <span className="text-sm font-semibold">
              {formatDuration(todayStats.totalSeconds)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
              <TrendingUp className="h-3 w-3" />
              Avg Time
            </span>
            <span className="text-sm font-semibold">
              {formatDuration(todayStats.averageSeconds)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Last 3 Days Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Last 3 Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {last3DaysStats.sessions === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No data yet. Come back after logging sessions over multiple days.
            </p>
          ) : (
            <>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Sessions
                  </span>
                  <span className="text-lg font-bold">{last3DaysStats.sessions}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Per Day
                  </span>
                  <span className="text-xs font-semibold">
                    {last3DaysStats.avgSessionsPerDay.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <Clock className="h-3 w-3" />
                  Total
                </span>
                <span className="text-sm font-semibold">
                  {formatDuration(last3DaysStats.totalSeconds)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <TrendingUp className="h-3 w-3" />
                  Avg Time
                </span>
                <span className="text-sm font-semibold">
                  {formatDuration(last3DaysStats.averageSeconds)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
