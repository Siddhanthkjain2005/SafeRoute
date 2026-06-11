"use client";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveStore } from "./store";
import type { WSMessage } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/stream";

/**
 * Single app-wide WebSocket. Feeds the zustand live store, raises toasts on
 * significant alerts, and nudges React Query to refresh derived queries.
 * Auto-reconnects with exponential backoff.
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

    const connect = () => {
      if (closed) return;
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        retry.current = 800;
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) {
          timer = setTimeout(connect, retry.current);
          retry.current = Math.min(retry.current * 1.7, 15000);
        }
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (ev) => {
        let msg: WSMessage;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.type === "event") {
          pushEvent(msg.payload);
          // throttle cache invalidation to ~1/s to keep charts smooth
          const now = Date.now();
          if (now - lastInvalidate.current > 1000) {
            lastInvalidate.current = now;
            qc.invalidateQueries({ queryKey: ["overview"] });
            qc.invalidateQueries({ queryKey: ["nodes"] });
          }
        } else if (msg.type === "alert") {
          const a = msg.payload;
          pushAlert(a);
          qc.invalidateQueries({ queryKey: ["alerts"] });
          pushToast({
            level: a.category,
            title: a.title,
            message: a.summary,
          });
        }
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
