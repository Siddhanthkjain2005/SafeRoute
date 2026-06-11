"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useLiveStore } from "@/lib/store";
import { fmtTime, SENSOR_LABEL, threatMeta } from "@/lib/utils";
import type { SecurityEvent } from "@/lib/types";

export function ActivityFeed({ limit = 14 }: { limit?: number }) {
  const events = useLiveStore((s) => s.events).slice(0, limit);

  if (events.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center text-sm text-content-muted">
        <span className="mb-3 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        Awaiting live telemetry…
        <span className="mt-1 text-xs text-content-faint">run a scenario from ⌘K or the simulator</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {events.map((e: SecurityEvent) => {
          const m = threatMeta(e.threat_level);
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, x: -14, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 rounded-lg border border-hairline/8 bg-surface-2/40 px-3 py-2"
            >
              <span className="h-9 w-1 rounded-full" style={{ background: m.hex, boxShadow: `0 0 8px ${m.glow}` }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="num text-[11px] text-content-faint">{fmtTime(e.ts)}</span>
                  <span className="truncate text-sm font-medium text-content-strong">{e.zone || e.node_id}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {e.active_sensors.length ? (
                    e.active_sensors.map((s) => (
                      <span key={s} className="rounded bg-surface-3/60 px-1.5 py-0.5 text-[10px] text-content-muted">
                        {SENSOR_LABEL[s] || s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-content-faint">no active sensors</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`num text-sm font-semibold ${m.text}`}>{e.risk_score.toFixed(0)}</div>
                <div className="text-[9.5px] uppercase tracking-wider text-content-faint">{m.label}</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
