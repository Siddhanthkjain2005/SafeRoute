"use client";
import { Activity, Eye, Flame, Volume2, Waves } from "lucide-react";
import { cn, humanReading } from "@/lib/utils";
import type { SecurityEvent } from "@/lib/types";

/** One sensor's live reading expressed in human-friendly language.
 *  Raw values stay hidden; we surface words like "Excellent" or "Low". */
type Row = {
  key: string;
  label: string;
  icon: typeof Activity;
  on: boolean;
  value: number; // 0..1
  tint: string;
};

function rows(ev: SecurityEvent | null): Row[] {
  const active = new Set(ev?.active_sensors ?? []);
  return [
    { key: "darkness", label: "Visibility", icon: Eye, on: active.has("darkness"), value: ev?.darkness ?? 0, tint: "#5b4dd6" },
    { key: "sound", label: "Noise", icon: Volume2, on: active.has("sound"), value: ev?.sound ?? 0, tint: "#1390e8" },
    { key: "motion", label: "Motion", icon: Activity, on: !!ev?.motion, value: ev?.motion ? 1 : 0, tint: "#f0673a" },
    { key: "vibration", label: "Vibration", icon: Waves, on: !!ev?.vibration, value: ev?.vibration ? 1 : 0, tint: "#f59e0b" },
    { key: "smoke", label: "Smoke", icon: Flame, on: active.has("smoke"), value: ev?.smoke ?? 0, tint: "#e0245e" },
  ];
}

export function SensorReadout({ event }: { event: SecurityEvent | null }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows(event).map((r) => {
        const Icon = r.icon;
        const reading = humanReading(r.key, r.value, r.on);
        return (
          <div
            key={r.key}
            className="flex items-center gap-2.5 rounded-xl border border-hairline/12 bg-surface-1/50 px-3 py-2.5"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${r.tint}14`, color: r.tint }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-content-muted">{r.label}</div>
              <div className={cn("text-[13.5px] font-semibold text-content-strong")}>{reading}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
