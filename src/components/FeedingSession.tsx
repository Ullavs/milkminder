"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTimer } from "@/hooks/useTimer";
import { Play, X } from "lucide-react";

interface FeedingSessionProps {
  onSessionSaved?: () => void;
}

const FEEDING_TAGS = ["GOOD", "MEDIUM", "BAD", "CLUSTER", "SLEEPY"];

export function FeedingSession({ onSessionSaved }: FeedingSessionProps) {
  const { elapsedSeconds, isRunning, start, pause, reset, formatTime } =
    useTimer();
  const [selectedSide, setSelectedSide] = useState<"LEFT" | "RIGHT" | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartQuick = (side: "LEFT" | "RIGHT") => {
    if (!isRunning) {
      setSelectedSide(side);
      start();
    }
  };

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSaveSession = useCallback(async () => {
    if (!selectedSide || elapsedSeconds === 0) {
      setError("Please select a side and let timer run for at least 1 second");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const now = new Date();
      const startedAt = new Date(now.getTime() - elapsedSeconds * 1000);

      const response = await fetch("/api/feedings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          side: selectedSide,
          startedAt: startedAt.toISOString(),
          endedAt: now.toISOString(),
          notes: notes || null,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save feeding session");
      }

      // Reset form
      reset();
      setSelectedSide(null);
      setNotes("");
      setSelectedTags([]);
      setError("");

      if (onSessionSaved) {
        onSessionSaved();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedSide,
    elapsedSeconds,
    notes,
    selectedTags,
    reset,
    onSessionSaved,
  ]);

  const handleCancel = () => {
    reset();
    setSelectedSide(null);
    setNotes("");
    setSelectedTags([]);
    setError("");
  };

  const handleStop = () => {
    pause();
  };

  return (
    <div className="space-y-4">
      {/* Quick Start Buttons */}
      {!isRunning && !selectedSide && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="default"
            onClick={() => handleStartQuick("LEFT")}
            className="h-16 text-base font-semibold"
          >
            Start Left
          </Button>
          <Button
            size="lg"
            variant="default"
            onClick={() => handleStartQuick("RIGHT")}
            className="h-16 text-base font-semibold"
          >
            Start Right
          </Button>
        </div>
      )}

      {/* Timer Display - Clickable to stop */}
      {isRunning && selectedSide && (
        <button
          onClick={handleStop}
          className="w-full cursor-pointer rounded-lg border-2 border-blue-500 bg-blue-50 p-6 text-center transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-950 dark:hover:bg-blue-900"
        >
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {selectedSide === "LEFT" ? "Left" : "Right"} Breast
          </p>
          <p className="text-4xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {formatTime(elapsedSeconds)}
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Tap to stop
          </p>
        </button>
      )}

      {/* Form (shown when stopped) */}
      {selectedSide && !isRunning && (
        <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-medium">Duration</p>
            <p className="text-2xl font-mono font-bold">
              {formatTime(elapsedSeconds)}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium">
              Notes (optional)
            </label>
            <Textarea
              placeholder="e.g. baby sleepy, cluster feeding..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block text-xs font-medium">Add Tags</label>
            <Select onValueChange={handleAddTag}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select a tag..." />
              </SelectTrigger>
              <SelectContent>
                {FEEDING_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer gap-1 text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="cursor-pointer transition-opacity hover:opacity-70"
                      aria-label="Remove tag"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => start()}
              className="flex-1"
            >
              <Play className="mr-1 h-3 w-3" />
              Resume
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSession}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Saving..." : "Save Session"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
