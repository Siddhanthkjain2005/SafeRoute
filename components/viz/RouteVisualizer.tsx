"use client";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import type { RouteAssessment, ThreatLevel } from "@/lib/types";
import { threatMeta } from "@/lib/utils";

/**
 * Custom route visualization (not a generic map). Two organic paths sweep from
 * a Source pin on the left, through each route's node, to a Destination pin on
 * the right. The recommended path is brighter, thicker, and carries an animated
 * traveling pulse; the alternative is dimmed.
 */
export function RouteVisualizer({
  source,
  destination,
  routes,
  recommendedId,
}: {
  source: string;
  destination: string;
  routes: RouteAssessment[];
  recommendedId: string | null;
}) {
  const W = 800;
  const H = 360;
  const sx = 70;
  const sy = H / 2;
  const dx = W - 70;
  const dy = H / 2;

  // up to two paths; first bows up, second bows down
  const lanes = routes.slice(0, 2).map((r, i) => {
    const up = i === 0;
    const midY = up ? H * 0.26 : H * 0.74;
    const nodeX = W / 2;
    const d = `M ${sx} ${sy} C ${W * 0.3} ${sy}, ${W * 0.32} ${midY}, ${nodeX} ${midY} S ${W * 0.7} ${dy}, ${dx} ${dy}`;
    const level = (r.available ? r.threat_level : "safe") as ThreatLevel;
    return { route: r, d, nodeX, midY, level, recommended: r.id === recommendedId };
  });

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-surface-1/60 to-surface-2/40">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {lanes.map((l, i) => {
            const m = threatMeta(l.level);
            return (
              <linearGradient key={i} id={`lane-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#5b4dd6" />
                <stop offset="50%" stopColor={m.hex} />
                <stop offset="100%" stopColor="#1390e8" />
              </linearGradient>
            );
          })}
        </defs>

        {/* faint reference grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1={(W / 9) * i}
            y1="0"
            x2={(W / 9) * i}
            y2={H}
            stroke="hsl(230 24% 56% / 0.06)"
            strokeWidth="1"
          />
        ))}

        {lanes.map((l, i) => {
          const m = threatMeta(l.level);
          const rec = l.recommended;
          return (
            <g key={l.route.id} opacity={rec ? 1 : 0.5}>
              {/* base track */}
              <path d={l.d} fill="none" stroke="hsl(230 24% 56% / 0.18)" strokeWidth={rec ? 10 : 7} strokeLinecap="round" />
              {/* colored route */}
              <motion.path
                d={l.d}
                fill="none"
                stroke={`url(#lane-${i})`}
                strokeWidth={rec ? 5 : 3.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: i * 0.15 }}
              />
              {/* traveling pulse on recommended path */}
              {rec && (
                <motion.path
                  d={l.d}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray="2 60"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -620 }}
                  transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
                  opacity={0.9}
                />
              )}

              {/* node marker */}
              <g>
                <circle cx={l.nodeX} cy={l.midY} r={rec ? 22 : 18} fill="white" stroke={m.hex} strokeWidth={rec ? 3 : 2} />
                {rec && (
                  <circle cx={l.nodeX} cy={l.midY} r={22} fill="none" stroke={m.hex} strokeWidth={2} opacity={0.4}>
                    <animate attributeName="r" from="22" to="40" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={l.nodeX} y={l.midY + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={m.hex}>
                  {String.fromCharCode(65 + i)}
                </text>
                <text
                  x={l.nodeX}
                  y={l.midY + (l.midY < H / 2 ? -32 : 40)}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="hsl(232 40% 14%)"
                >
                  {l.route.name}
                </text>
                <text
                  x={l.nodeX}
                  y={l.midY + (l.midY < H / 2 ? -16 : 56)}
                  textAnchor="middle"
                  fontSize="11"
                  fill={m.hex}
                  fontWeight="600"
                >
                  {l.route.safety_score != null ? `${l.route.safety_score.toFixed(0)}/100` : "—"}
                </text>
              </g>
            </g>
          );
        })}

        {/* Source pin */}
        <g>
          <circle cx={sx} cy={sy} r="26" fill="#5b4dd6" opacity="0.12" />
          <circle cx={sx} cy={sy} r="15" fill="#5b4dd6" />
          <circle cx={sx} cy={sy} r="5" fill="white" />
        </g>
        {/* Destination pin */}
        <g>
          <circle cx={dx} cy={dy} r="26" fill="#1390e8" opacity="0.12" />
          <circle cx={dx} cy={dy} r="15" fill="#1390e8" />
          <circle cx={dx} cy={dy} r="5" fill="white" />
        </g>
      </svg>

      {/* labels overlaid for crisp text */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[3%] top-1/2 -translate-y-1/2">
          <Endpoint icon={<MapPin className="h-3.5 w-3.5" />} label="From" value={source} tint="#5b4dd6" />
        </div>
        <div className="absolute right-[3%] top-1/2 -translate-y-1/2 text-right">
          <Endpoint icon={<Navigation className="h-3.5 w-3.5" />} label="To" value={destination} tint="#1390e8" align="right" />
        </div>
      </div>
    </div>
  );
}

function Endpoint({
  icon,
  label,
  value,
  tint,
  align = "left",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tint: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "flex flex-col items-end" : ""}>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ background: `${tint}1a`, color: tint }}
      >
        {icon}
        {label}
      </span>
      <div className="mt-1 max-w-[140px] truncate rounded-lg bg-white/80 px-2 py-0.5 text-[13px] font-semibold text-content-strong backdrop-blur-sm">
        {value}
      </div>
    </div>
  );
}
