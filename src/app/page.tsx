"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FeedingSession } from "@/components/FeedingSession";
import { FeedingHistory } from "@/components/FeedingHistory";
import Link from "next/link";
import { LogOut, History } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">🍼 MilkMinder</h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Breastfeeding Tracker
            </p>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in to start tracking your breastfeeding sessions
          </p>
          <Link href="/auth/signin">
            <Button size="lg">Sign In with GitHub</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🍼 MilkMinder</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Welcome, {session.user?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Start New Session */}
          <Card>
            <CardHeader>
              <CardTitle>Start New Session</CardTitle>
              <CardDescription>Log a new breastfeeding session</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedingSession onSessionSaved={handleSessionSaved} />
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>
                Your last 5 breastfeeding sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedingHistory
                key={refreshKey}
                limit={5}
                showViewAllLink={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
