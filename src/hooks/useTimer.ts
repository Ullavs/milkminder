"use client";

import { useState, useEffect, useCallback } from "react";

interface UseTimerReturn {
  elapsedSeconds: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
}

export function useTimer(): UseTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    elapsedSeconds,
    isRunning,
    start,
    stop,
    pause,
    reset,
    formatTime,
  };
}
