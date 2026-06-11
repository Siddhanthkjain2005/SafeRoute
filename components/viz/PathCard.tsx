"use client";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { SensorReadout } from "@/components/viz/SensorReadout";
import { AnimatedNumber } from "@/components/viz/AnimatedNumber";
import { ThreatBadge } from "@/components/ui/ThreatBadge";
import { cn, fmtRelative, safetyVerdict, threatMeta } from "@/lib/utils";
import type { RouteAssessment, SecurityEvent, ThreatLevel } from "@/lib/types";

export function PathCard({
  route,
  event,
  recommended,
  index,
  letter,
}: {
  route: RouteAssessment;
  event: SecurityEvent | null;
  recommended: boolean;
  index: number;
  letter: string;
}) {
  const node = route.nodes[0];
  const available = route.available && route.route_risk != null;
  const level = (available ? route.threat_level : "safe") as ThreatLevel;
  const m = threatMeta(level);
  const safety = route.safety_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative overflow-hidden p-6",
        recommended && "ring-2 ring-threat-safe/40"
      )}
      style={
        recommended
          ? { boxShadow: "0 24px 70px -28px rgba(37,165,117,0.5)" }
          : undefined
      }
    >
      {/* soft top color wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-[0.10]"
        style={{ background: `radial-gradient(70% 100% at 50% 0%, ${available ? m.hex : "#25a575"}, transparent)` }}
      />

      {/* header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold"
            style={{ background: `${m.hex}16`, color: m.hex }}
          >
            {letter}
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-content-strong">{route.name}</h3>
            <p className="flex items-center gap-1 text-xs text-content-muted">
              <MapPin className="h-3 w-3" /> via {node?.name ?? route.node_ids.join(", ")}
            </p>
          </div>
        </div>
        {recommended && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-threat-safe px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-white">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recommended
          </span>
        )}
      </div>

      {!available ? (
        <div className="relative mt-6 flex h-[300px] flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-3/60 text-content-faint">
            <WifiOff className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-content-muted">Awaiting live readings</p>
          <p className="max-w-[230px] text-xs text-content-faint">
            We need fresh telemetry from {node?.name ?? "this node"} before we can score this path.
          </p>
          {node?.last_seen && (
            <p className="text-[11px] text-content-faint">last seen {fmtRelative(node.last_seen)}</p>
          )}
        </div>
      ) : (
        <>
          {/* safety score headline */}
          <div className="relative mt-6 flex items-end justify-between">
            <div>
              <div className="stat-label mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Safety Score
              </div>
              <div className="flex items-baseline gap-1.5">
                <AnimatedNumber
                  value={safety ?? 0}
                  className="num text-6xl font-semibold leading-none tracking-tight"
                  style={{ color: m.hex }}
                />
                <span className="text-lg text-content-faint">/100</span>
              </div>
            </div>
            <div className="text-right">
              <ThreatBadge level={level} pulse={recommended} />
              <div className="mt-2 text-[11px] text-content-muted">
                confidence{" "}
                <span className="num font-semibold text-content-strong">
                  {Math.round(route.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* safety bar */}
          <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-surface-3/70">
            <motion.div
              className="h-full rounded-full"
              style={{ background: m.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, safety ?? 0))}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="relative mt-2.5 text-[13px] leading-relaxed text-content-muted">
            {safetyVerdict(safety)}
          </p>

          {/* per-node sensor readings */}
          <div className="relative mt-5">
            <div className="stat-label mb-2.5">Conditions at {node?.name}</div>
            <SensorReadout event={event} />
          </div>

          {/* why (factors) */}
          {node?.factors && node.factors.length > 0 && (
            <div className="relative mt-4">
              <div className="stat-label mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Why this score
              </div>
              <div className="flex flex-wrap gap-1.5">
                {node.factors.map((f) => (
                  <span
                    key={f}
                    className="rounded-lg border border-hairline/12 bg-surface-1/60 px-2.5 py-1 text-[11.5px] text-content-muted"
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
