"use client";
import { motion } from "framer-motion";
import type { ZoneStatus } from "@/lib/types";
import { threatMeta } from "@/lib/utils";

/**
 * Threat Radar — a SOC-style radar scope. Zones are plotted as blips (radius
 * encodes risk); a sweep line rotates continuously and blips pulse.
 */
export function ThreatRadar({ zones, size = 260 }: { zones: ZoneStatus[]; size?: number }) {
  const C = size / 2;
  const maxR = C - 18;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(222 100% 60% / 0.16)" />
            <stop offset="100%" stopColor="hsl(222 100% 60% / 0)" />
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(190 95% 55% / 0)" />
            <stop offset="100%" stopColor="hsl(190 95% 55% / 0.5)" />
          </linearGradient>
        </defs>

        <circle cx={C} cy={C} r={maxR} fill="url(#radarGlow)" />
        {[0.33, 0.66, 1].map((f) => (
          <circle key={f} cx={C} cy={C} r={maxR * f} fill="none" stroke="hsl(215 30% 60% / 0.12)" />
        ))}
        <line x1={C} y1={C - maxR} x2={C} y2={C + maxR} stroke="hsl(215 30% 60% / 0.08)" />
        <line x1={C - maxR} y1={C} x2={C + maxR} y2={C} stroke="hsl(215 30% 60% / 0.08)" />

        {/* sweep */}
        <motion.g
          style={{ transformOrigin: `${C}px ${C}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <path
            d={`M ${C} ${C} L ${C} ${C - maxR} A ${maxR} ${maxR} 0 0 1 ${C + maxR * 0.52} ${C - maxR * 0.85} Z`}
            fill="url(#sweepGrad)"
          />
          <line x1={C} y1={C} x2={C} y2={C - maxR} stroke="hsl(190 95% 55% / 0.7)" strokeWidth={1.5} />
        </motion.g>

        {/* blips */}
        {zones.map((z, i) => {
          const a = (i / Math.max(1, zones.length)) * 2 * Math.PI - Math.PI / 2;
          const r = (z.risk_score / 100) * maxR * 0.84 + 10;
          const x = C + r * Math.cos(a);
          const y = C + r * Math.sin(a);
          const m = threatMeta(z.threat_level);
          return (
            <g key={z.zone}>
              <motion.circle
                cx={x}
                cy={y}
                r={6}
                fill={m.hex}
                style={{ filter: `drop-shadow(0 0 5px ${m.glow})` }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
              <circle cx={x} cy={y} r={11} fill="none" stroke={m.hex} strokeOpacity={0.35} />
              <text x={x} y={y - 15} textAnchor="middle" fontSize="9" fontWeight={600} fill="hsl(215 20% 78%)">
                {z.zone}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={3} fill="hsl(190 95% 55%)" />
      </svg>
    </div>
  );
}
