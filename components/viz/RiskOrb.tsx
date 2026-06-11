"use client";
import { motion } from "framer-motion";
import type { ThreatLevel } from "@/lib/types";
import { threatMeta } from "@/lib/utils";

/**
 * Risk Orb — the platform's central intelligence widget.
 * Concentric rotating rings, a progress arc encoding the 0–100 risk score, an
 * inner confidence ring, a pulsing core glow tinted by threat level, and live
 * numerics. Built in pure SVG so it scales crisply and stays GPU-light.
 */
export function RiskOrb({
  score,
  level,
  confidence,
  size = 280,
}: {
  score: number;
  level: ThreatLevel;
  confidence: number; // 0..1
  size?: number;
}) {
  const m = threatMeta(level);
  const s = Math.max(0, Math.min(100, score));
  const c = size / 2;

  const R = c - 22; // main arc radius
  const RC = c - 46; // confidence ring radius
  const circ = 2 * Math.PI * R;
  const circC = 2 * Math.PI * RC;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* ambient glow */}
      <motion.div
        className="absolute inset-6 rounded-full blur-3xl"
        style={{ background: m.glow }}
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.92, 1.04, 0.92] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox={`0 0 ${size} ${size}`} className="relative h-full w-full">
        <defs>
          <linearGradient id="orbArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={m.hex} stopOpacity={0.4} />
            <stop offset="100%" stopColor={m.hex} />
          </linearGradient>
          <radialGradient id="orbCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={m.hex} stopOpacity={0.18} />
            <stop offset="70%" stopColor={m.hex} stopOpacity={0.04} />
            <stop offset="100%" stopColor={m.hex} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* rotating tick ring (outer) */}
        <motion.g
          style={{ transformOrigin: `${c}px ${c}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * 2 * Math.PI;
            const major = i % 5 === 0;
            const r1 = c - 6;
            const r2 = c - (major ? 14 : 10);
            return (
              <line
                key={i}
                x1={c + r1 * Math.cos(a)}
                y1={c + r1 * Math.sin(a)}
                x2={c + r2 * Math.cos(a)}
                y2={c + r2 * Math.sin(a)}
                stroke="hsl(160 8% 70%)"
                strokeOpacity={major ? 0.35 : 0.15}
                strokeWidth={major ? 1.5 : 1}
              />
            );
          })}
        </motion.g>

        {/* core glow */}
        <circle cx={c} cy={c} r={RC - 6} fill="url(#orbCore)" />

        {/* track + risk arc */}
        <circle cx={c} cy={c} r={R} fill="none" stroke="hsl(160 8% 70% / 0.1)" strokeWidth={10} />
        <motion.circle
          cx={c}
          cy={c}
          r={R}
          fill="none"
          stroke="url(#orbArc)"
          strokeWidth={10}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - s / 100) }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${m.glow})` }}
        />

        {/* confidence ring (inner, dashed) */}
        <circle cx={c} cy={c} r={RC} fill="none" stroke="hsl(160 8% 70% / 0.08)" strokeWidth={3} />
        <motion.circle
          cx={c}
          cy={c}
          r={RC}
          fill="none"
          stroke="hsl(172 70% 50%)"
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          strokeDasharray={`${circC}`}
          initial={{ strokeDashoffset: circC }}
          animate={{ strokeDashoffset: circC * (1 - Math.max(0, Math.min(1, confidence))) }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
          opacity={0.7}
        />
      </svg>

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-label">Global Risk</span>
        <div className="num mt-1 text-6xl font-semibold leading-none text-content-strong">
          {s.toFixed(0)}
        </div>
        <span className={`mt-2 text-sm font-bold uppercase tracking-[0.2em] ${m.text}`}>{m.label}</span>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          {(confidence * 100).toFixed(0)}% confidence
        </div>
      </div>
    </div>
  );
}
