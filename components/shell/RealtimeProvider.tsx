"use client";
import { useRealtime } from "@/lib/useRealtime";

/** Mounts the single WebSocket connection for the whole app. */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime();
  return <>{children}</>;
}
