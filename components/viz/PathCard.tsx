"use client";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Navigation, WifiOff } from "lucide-react";
import { SensorReadout } from "@/components/viz/SensorReadout";
import { ThreatBadge } from "@/components/ui/ThreatBadge";
import { cn, fmtRelative, threatMeta } from "@/lib/utils";
import type { RouteAssessment, SecurityEvent, ThreatLevel } from "@/lib/types";

export function PathCard({
  route,
  event,
  recommended,
  index,
}: {
  route: RouteAssessment;
  event: SecurityEvent | null;
  recommended: boolean;
  index: number;
}) {
  const node = route.nodes[0];
  const available = route.available && route.route_risk != null;
  const level = (available ? route.threat_level : "safe") as ThreatLevel;
  const m = threatMeta(level);
  const safety = route.safety_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative overflow-hidden p-6",
        recommended
          ? "ring-2 ring-threat-safe/50 shadow-[0_0_50px_-12px_rgba(18,183,106,0.4)]"
          : "ring-1 ring-hairline/10"
      )}
    >
      {/* soft color wash by threat */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-[0.10]"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, ${available ? m.hex : "#12b76a"}, transparent)` }}
      />

      {/* header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl ring-1"
            style={{ background: `${m.hex}1a`, color: m.hex, borderColor: `${m.hex}40` }}
          >
            <Navigation className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-content-strong">{route.name}</h3>
            <p className="flex items-center gap-1 text-xs text-content-muted">
              <MapPin className="h-3 w-3" /> via {node?.name ?? route.node_ids.join(", ")}
            </p>
          </div>
        </div>
        {recommended && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-threat-safe/15 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-threat-safe ring-1 ring-threat-safe/40">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recommended
          </span>
        )}
      </div>

      {!available ? (
        <div className="relative mt-6 flex h-[280px] flex-col items-center justify-center gap-2 text-center">
          <WifiOff className="h-7 w-7 text-content-faint" />
          <p className="text-sm font-medium text-content-muted">Node offline / stale</p>
          <p className="max-w-[220px] text-xs text-content-faint">
            Awaiting live telemetry from {node?.name ?? "this node"} to assess the path.
          </p>
          {node?.last_seen && (
            <p className="text-[11px] text-content-faint">last seen {fmtRelative(node.last_seen)}</p>
          )}
        </div>
      ) : (
        <>
          {/* safety score headline */}
          <div className="relative mt-5 flex items-end justify-between">
            <div>
              <div className="stat-label mb-1">Safety Score</div>
              <div className="flex items-baseline gap-1.5">
                <span className="num text-5xl font-semibold leading-none" style={{ color: m.hex }}>
                  {safety != null ? safety.toFixed(0) : "—"}
                </span>
                <span className="text-base text-content-faint">/100</span>
              </div>
            </div>
            <div className="text-right">
              <ThreatBadge level={level} pulse={recommended} />
              <div className="mt-1.5 text-[11px] text-content-muted">
                risk <span className="num text-content-strong">{route.route_risk?.toFixed(0)}</span> ·
                conf <span className="num text-content-strong">{Math.round(route.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* safety bar */}
          <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-surface-0/70">
            <motion.div
              className="h-full rounded-full"
              style={{ background: m.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, safety ?? 0))}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>

          {/* per-node sensor readings */}
          <div className="relative mt-5">
            <div className="stat-label mb-2">Live Sensors · {node?.name}</div>
            <SensorReadout event={event} />
          </div>

          {/* why (factors) */}
          {node?.factors && node.factors.length > 0 && (
            <div className="relative mt-4">
              <div className="stat-label mb-2">Why</div>
              <div className="flex flex-wrap gap-1.5">
                {node.factors.map((f) => (
                  <span
                    key={f}
                    className="rounded-md border border-hairline/12 bg-surface-2/50 px-2 py-1 text-[11.5px] text-content-muted"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
