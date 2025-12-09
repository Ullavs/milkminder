"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to MilkMinder
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your GitHub account to continue
          </p>
        </div>

        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full"
          size="lg"
        >
          <Github className="mr-2 h-5 w-5" />
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}
