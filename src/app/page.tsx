"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

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
          <h1 className="text-4xl font-bold">Welcome to MilkMinder</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Please sign in to continue
          </p>
          <Link href="/auth/signin">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl space-y-8 p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {session.user?.email}
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => signOut()} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
