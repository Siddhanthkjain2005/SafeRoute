"use client";

import { useEffect } from "react";
import { useRealtime } from "@/lib/useRealtime";
import { useLiveStore } from "@/lib/store";
import { demoEvents } from "@/lib/demo";
import type { SecurityEvent } from "@/lib/types";

/**
 * Mounts the single WebSocket connection for the whole app. When the live
 * backend is unreachable (e.g. preview / offline demo), it seeds the live
 * store with gently-evolving synthetic telemetry so the UI always feels alive.
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  useRealtime();
  const connected = useLiveStore((s) => s.connected);
  const pushEvent = useLiveStore((s) => s.pushEvent);

  useEffect(() => {
    // Give the socket a moment to connect; if it doesn't, run demo telemetry.
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      if (useLiveStore.getState().connected) return;
      // Backfill a short history, then stream new frames.
      const seed = demoEvents(16).reverse();
      seed.forEach((e, i) => pushEvent({ ...e, id: Date.now() + i } as SecurityEvent));
      timer = setInterval(() => {
        if (useLiveStore.getState().connected) return;
        const [e] = demoEvents(1);
        pushEvent({ ...e, id: Date.now(), ts: new Date().toISOString() });
      }, 2600);
    }, 1800);

    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [connected, pushEvent]);

  return <>{children}</>;
}
