"use client";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveStore } from "./store";
import { activateDemo, demoEngine, isDemoActive } from "./demoEngine";
import type { WSMessage } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/stream";

/**
 * Single app-wide WebSocket. Feeds the zustand live store, raises toasts on
 * significant alerts, and nudges React Query to refresh derived queries.
 * Auto-reconnects with exponential backoff. If the backend can't be reached,
 * it transparently switches to the in-browser demo engine so the experience
 * stays fully live for demos and previews.
 */
export function useRealtime() {
  const qc = useQueryClient();
  const { setConnected, pushEvent, pushAlert, pushToast } = useLiveStore();
  const retry = useRef(800);
  const lastInvalidate = useRef(0);

  useEffect(() => {
    let closed = false;
    let timer: ReturnType<typeof setTimeout>;
    let ws: WebSocket | null = null;
    let unsubDemo: (() => void) | null = null;

    const nudge = () => {
      const t = Date.now();
      if (t - lastInvalidate.current > 1000) {
        lastInvalidate.current = t;
        qc.invalidateQueries({ queryKey: ["overview"] });
        qc.invalidateQueries({ queryKey: ["nodes"] });
        qc.invalidateQueries({ queryKey: ["routeRec"] });
      }
    };

    const handle = (msg: { type: string; payload: any }) => {
      if (msg.type === "event") {
        pushEvent(msg.payload);
        nudge();
      } else if (msg.type === "alert") {
        const a = msg.payload;
        pushAlert(a);
        qc.invalidateQueries({ queryKey: ["alerts"] });
        pushToast({ level: a.category, title: a.title, message: a.summary });
      } else if (msg.type === "overview") {
        nudge();
      }
    };

    const startDemo = () => {
      if (unsubDemo) return;
      activateDemo();
      setConnected(true);
      unsubDemo = demoEngine().subscribe(handle);
    };

    const connect = () => {
      if (closed) return;
      if (isDemoActive()) {
        startDemo();
        return;
      }
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        startDemo();
        return;
      }

      // if the socket doesn't open quickly, assume no backend → demo mode
      const openTimer = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
          try {
            ws.close();
          } catch {}
          startDemo();
        }
      }, 1800);

      ws.onopen = () => {
        clearTimeout(openTimer);
        setConnected(true);
        retry.current = 800;
      };
      ws.onclose = () => {
        clearTimeout(openTimer);
        // If a backend request already failed elsewhere and switched us to demo
        // mode, hand over to the demo engine here too (subscribe to its stream).
        if (isDemoActive()) {
          startDemo();
          return;
        }
        setConnected(false);
        if (!closed) {
          timer = setTimeout(connect, retry.current);
          retry.current = Math.min(retry.current * 1.7, 15000);
        }
      };
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
      ws.onmessage = (ev) => {
        let msg: WSMessage;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        handle(msg);
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      unsubDemo?.();
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
