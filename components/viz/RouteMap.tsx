"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { threatMeta } from "@/lib/utils";
import type { RouteAssessment } from "@/lib/types";

/**
 * Signature animated route map. Draws each candidate path as a flowing curve
 * between origin and destination, coloured by its live threat level. The
 * recommended path is emphasised with an animated dashed "flow" overlay.
 */
export function RouteMap({
  routes,
  recommendedId,
  source,
  destination,
}: {
  routes: RouteAssessment[];
  recommendedId: string | null;
  source: string;
  destination: string;
}) {
  const W = 760;
  const H = 300;
  const ox = 70;
  const oy = H / 2;
  const dx = W - 70;
  const dy = H / 2;

  // Spread paths vertically so two routes arc above/below the centre line.
  const curves = routes.slice(0, 3).map((r, i) => {
    const offset = routes.length === 1 ? 0 : (i - (routes.length - 1) / 2) * 150;
    const cx1 = ox + (dx - ox) * 0.32;
    const cx2 = ox + (dx - ox) * 0.68;
    const midY = oy + offset;
    const d = `M ${ox} ${oy} C ${cx1} ${midY}, ${cx2} ${midY}, ${dx} ${dy}`;
    const level = (r.available ? r.threat_level : "low") as Parameters<typeof threatMeta>[0];
    const m = threatMeta(level);
    return { r, d, hex: m.hex, midX: (cx1 + cx2) / 2, midY, recommended: r.id === recommendedId };
  });

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-hairline/[0.07] bg-surface-1/60">
      <div className="dot-bg absolute inset-0 opacity-60" />
      <svg viewBox={`0 0 ${W} ${H}`} className="relative h-auto w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* base + recommended flow */}
        {curves.map(({ d, hex, recommended, r }) => (
          <g key={r.id}>
            <motion.path
              d={d}
              fill="none"
              stroke={hex}
              strokeWidth={recommended ? 5 : 3}
              strokeLinecap="round"
              opacity={recommended ? 0.95 : 0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              filter={recommended ? "url(#soft)" : undefined}
            />
            {recommended && (
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeWidth={1.6}
                strokeDasharray="2 10"
                strokeLinecap="round"
                className="animate-dash-flow"
                opacity={0.9}
              />
            )}
            {/* mid label */}
            <foreignObject
              x={curves.find((c) => c.r.id === r.id)!.midX - 70}
              y={curves.find((c) => c.r.id === r.id)!.midY - (curves.find((c) => c.r.id === r.id)!.midY < oy ? 44 : -14)}
              width="140"
              height="34"
            >
              <div className="flex items-center justify-center">
                <span
                  className="num inline-flex items-center gap-1.5 rounded-full bg-surface-0 px-2.5 py-1 text-[11px] font-semibold shadow-soft ring-1"
                  style={{ color: hex, boxShadow: `0 6px 18px -8px ${hex}88` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: hex }} />
                  {r.name} · {r.safety_score?.toFixed(0) ?? "—"}
                </span>
              </div>
            </foreignObject>
          </g>
        ))}

        {/* origin */}
        <g>
          <circle cx={ox} cy={oy} r={20} fill="hsl(var(--primary) / 0.12)" />
          <circle cx={ox} cy={oy} r={9} fill="hsl(var(--primary))" />
          <circle cx={ox} cy={oy} r={4} fill="white" />
        </g>
        {/* destination */}
        <g>
          <circle cx={dx} cy={dy} r={20} fill="hsl(var(--secondary) / 0.12)" />
          <circle cx={dx} cy={dy} r={9} fill="hsl(var(--secondary))" />
          <circle cx={dx} cy={dy} r={4} fill="white" />
        </g>
      </svg>

      {/* endpoint labels */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 rounded-xl bg-surface-0/80 px-3 py-2 shadow-soft backdrop-blur">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
            <MapPin className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[9px] uppercase tracking-[0.16em] text-content-faint">From</div>
            <div className="text-xs font-semibold text-content-strong">{source}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-surface-0/80 px-3 py-2 shadow-soft backdrop-blur">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary/12 text-secondary">
            <Navigation className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-[9px] uppercase tracking-[0.16em] text-content-faint">To</div>
            <div className="text-xs font-semibold text-content-strong">{destination}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
