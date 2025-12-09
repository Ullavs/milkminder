"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

interface Feeding {
  id: string;
  side: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  notes: string | null;
  tags: Array<{ id: string; tag: string }>;
}

interface FeedingHistoryProps {
  limit?: number;
  showViewAllLink?: boolean;
}

const FEEDING_TAGS = ["GOOD", "MEDIUM", "BAD", "CLUSTER", "SLEEPY"];

export function FeedingHistory({
  limit = 100,
  showViewAllLink = false,
}: FeedingHistoryProps) {
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Feeding> | null>(null);

  const fetchFeedings = async (tag?: string) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/feedings", window.location.origin);
      url.searchParams.set("limit", limit.toString());
      if (tag) {
        url.searchParams.set("tag", tag);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch feedings");
      }

      const data = await response.json();
      setFeedings(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedings(selectedTag || undefined);
  }, [selectedTag, limit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      const response = await fetch(`/api/feedings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete feeding");
      }

      setFeedings(feedings.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete feeding");
    }
  };

  const handleEditStart = (feeding: Feeding) => {
    setEditingId(feeding.id);
    setEditData({
      ...feeding,
    });
  };

  const handleEditSave = async (id: string) => {
    if (!editData) return;

    try {
      const response = await fetch(`/api/feedings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          side: editData.side,
          startedAt: editData.startedAt,
          endedAt: editData.endedAt,
          notes: editData.notes,
          tags: editData.tags?.map((t) => t.tag) || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feeding");
      }

      const updated = await response.json();
      setFeedings(feedings.map((f) => (f.id === id ? updated : f)));
      setEditingId(null);
      setEditData(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update feeding");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter by tag */}
      <div className="flex gap-2">
        <Select
          value={selectedTag || "__all__"}
          onValueChange={(value) =>
            setSelectedTag(value === "__all__" ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by tag..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All sessions</SelectItem>
            {FEEDING_TAGS.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {feedings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              No feeding sessions recorded yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedings.map((feeding) => (
            <Card key={feeding.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {feeding.side === "LEFT" ? "👈" : "👉"} {feeding.side}
                      </CardTitle>
                      <Badge variant="outline">
                        {formatTime(feeding.durationSeconds)}
                      </Badge>
                    </div>
                    <CardDescription>
                      {formatDateTime(feeding.startedAt)}
                    </CardDescription>
                  </div>
                  {editingId !== feeding.id && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(feeding)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feeding.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              {feeding.notes && !editingId && (
                <CardContent className="pb-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feeding.notes}
                  </p>
                </CardContent>
              )}

              {feeding.tags.length > 0 && !editingId && (
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-2">
                    {feeding.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}

              {editingId === feeding.id && editData && (
                <CardContent className="space-y-3 pb-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Notes
                    </label>
                    <textarea
                      value={editData.notes || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, notes: e.target.value })
                      }
                      className="w-full rounded border border-zinc-300 p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(feeding.id)}
                      className="flex-1"
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {showViewAllLink && feedings.length > 0 && (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/history">View All Sessions</Link>
        </Button>
      )}
    </div>
  );
}
