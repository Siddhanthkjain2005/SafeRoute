"use client";
import { Activity, Flame, Moon, Volume2, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SecurityEvent } from "@/lib/types";

/** One sensor's live reading. Digital sensors (motion/vibration) show ON/OFF;
 *  analog sensors (smoke/sound/darkness) show a 0–100% magnitude bar. */
type Row = {
  key: string;
  label: string;
  icon: typeof Activity;
  kind: "digital" | "analog";
  on: boolean;
  value: number; // 0..1 for analog, 0/1 for digital
  tint: string;
};

function rows(ev: SecurityEvent | null): Row[] {
  const active = new Set(ev?.active_sensors ?? []);
  return [
    { key: "motion", label: "Motion", icon: Activity, kind: "digital", on: !!ev?.motion, value: ev?.motion ? 1 : 0, tint: "#fb7a2c" },
    { key: "vibration", label: "Vibration", icon: Waves, kind: "digital", on: !!ev?.vibration, value: ev?.vibration ? 1 : 0, tint: "#f9b21a" },
    { key: "sound", label: "Sound", icon: Volume2, kind: "analog", on: active.has("sound"), value: ev?.sound ?? 0, tint: "#22d3ee" },
    { key: "smoke", label: "Smoke", icon: Flame, kind: "analog", on: active.has("smoke"), value: ev?.smoke ?? 0, tint: "#ec3f8f" },
    { key: "darkness", label: "Darkness", icon: Moon, kind: "analog", on: active.has("darkness"), value: ev?.darkness ?? 0, tint: "#a78bfa" },
  ];
}

export function SensorReadout({ event }: { event: SecurityEvent | null }) {
  return (
    <div className="space-y-1.5">
      {rows(event).map((r) => {
        const Icon = r.icon;
        const pct = Math.round(Math.max(0, Math.min(1, r.value)) * 100);
        return (
          <div
            key={r.key}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
              r.on ? "border-hairline/15 bg-surface-3/40" : "border-hairline/8 bg-surface-2/30"
            )}
          >
            <Icon
              className="h-4 w-4 shrink-0"
              style={{ color: r.on ? r.tint : "hsl(var(--text-faint))" }}
            />
            <span className={cn("w-20 shrink-0 text-[13px]", r.on ? "text-content-strong" : "text-content-muted")}>
              {r.label}
            </span>
            {r.kind === "digital" ? (
              <span
                className={cn(
                  "ml-auto rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider",
                  r.on ? "text-content-strong" : "text-content-faint"
                )}
                style={r.on ? { background: `${r.tint}22`, color: r.tint } : undefined}
              >
                {r.on ? "Detected" : "Clear"}
              </span>
            ) : (
              <>
                <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-surface-0/70 sm:w-32">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: r.tint, opacity: r.on ? 1 : 0.45 }}
                  />
                </div>
                <span className="num w-9 shrink-0 text-right text-[12px] text-content-muted">{pct}%</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
