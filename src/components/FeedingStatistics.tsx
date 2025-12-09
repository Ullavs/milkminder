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

interface StatPeriod {
  label: string;
  days: number;
}

interface Stats {
  sessions: number;
  totalSeconds: number;
  averageSeconds: number;
  avgSessionsPerDay: number;
}

const PERIODS: StatPeriod[] = [
  { label: "Today", days: 0 },
  { label: "Last 3 Days", days: 3 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
];

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

export function FeedingStatistics() {
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const [earliestDate, setEarliestDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/feedings");
        if (!response.ok) throw new Error("Failed to fetch feedings");

        const feedings = await response.json();

        // Find the earliest date
        if (feedings.length > 0) {
          const dates = feedings.map(
            (feeding: any) => new Date(feeding.startedAt)
          );
          const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
          setEarliestDate(earliest);
        }

        const newStats: Record<string, Stats> = {};

        PERIODS.forEach((period) => {
          const { start, end } = getDateRange(period.days);
          const periodFeedings = feedings.filter((feeding: any) => {
            const startedAt = new Date(feeding.startedAt);
            return startedAt >= start && startedAt <= end;
          });

          const totalSeconds = periodFeedings.reduce(
            (sum: number, feeding: any) => sum + (feeding.durationSeconds || 0),
            0
          );

          const daysInPeriod = period.days === 0 ? 1 : period.days;
          newStats[period.label] = {
            sessions: periodFeedings.length,
            totalSeconds,
            averageSeconds:
              periodFeedings.length > 0
                ? Math.round(totalSeconds / periodFeedings.length)
                : 0,
            avgSessionsPerDay:
              periodFeedings.length > 0
                ? Math.round((periodFeedings.length / daysInPeriod) * 10) / 10
                : 0,
          };
        });

        setStats(newStats);
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {PERIODS.map((period) => (
          <div
            key={period.label}
            className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {PERIODS.map((period) => {
        const periodStats = stats[period.label] || {
          sessions: 0,
          totalSeconds: 0,
          averageSeconds: 0,
          avgSessionsPerDay: 0,
        };

        // Check if user has been logging long enough for this period
        const hasEnoughData = (() => {
          if (period.days === 0) return true; // Today always shows
          if (!earliestDate) return false;

          const now = new Date();
          const daysLogging = Math.floor(
            (now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysLogging >= period.days;
        })();

        return (
          <Card key={period.label} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {period.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!hasEnoughData ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No data yet for this period.
                </p>
              ) : (
                <>
                  {/* Sessions Count */}
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Sessions
                      </span>
                      <span className="text-lg font-bold">
                        {periodStats.sessions}
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Per Day
                      </span>
                      <span className="text-xs font-semibold">
                        {periodStats.avgSessionsPerDay.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Total Time */}
                  <div className="flex items-baseline justify-between">
                    <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <Clock className="h-3 w-3" />
                      Total
                    </span>
                    <span className="text-sm font-semibold">
                      {formatDuration(periodStats.totalSeconds)}
                    </span>
                  </div>

                  {/* Average Time */}
                  <div className="flex items-baseline justify-between">
                    <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                      <TrendingUp className="h-3 w-3" />
                      Avg Time
                    </span>
                    <span className="text-sm font-semibold">
                      {formatDuration(periodStats.averageSeconds)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
