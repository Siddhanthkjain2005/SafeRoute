"use client";
import { create } from "zustand";
import type { Alert, SecurityEvent, ThreatLevel } from "./types";

export interface Toast {
  id: string;
  level: ThreatLevel;
  title: string;
  message: string;
  ts: number;
}

interface LiveState {
  connected: boolean;
  events: SecurityEvent[]; // newest first, capped
  alerts: Alert[];
  lastEventByNode: Record<string, SecurityEvent>;
  pulse: number; // increments on every event — drives SecurityPulse
  lastEventAt: number;
  toasts: Toast[];

  setConnected: (c: boolean) => void;
  pushEvent: (e: SecurityEvent) => void;
  pushAlert: (a: Alert) => void;
  pushToast: (t: Omit<Toast, "id" | "ts">) => void;
  dismissToast: (id: string) => void;
}

const CAP = 150;
let seq = 0;

export const useLiveStore = create<LiveState>((set) => ({
  connected: false,
  events: [],
  alerts: [],
  lastEventByNode: {},
  pulse: 0,
  lastEventAt: 0,
  toasts: [],

  setConnected: (c) => set({ connected: c }),

  pushEvent: (e) =>
    set((s) => ({
      events: [e, ...s.events].slice(0, CAP),
      lastEventByNode: { ...s.lastEventByNode, [e.node_id]: e },
      pulse: s.pulse + 1,
      lastEventAt: Date.now(),
    })),

  pushAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts].slice(0, 80) })),

  pushToast: (t) =>
    set((s) => ({
      toasts: [{ ...t, id: `t${++seq}`, ts: Date.now() }, ...s.toasts].slice(0, 5),
    })),

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
