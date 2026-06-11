"use client";
import { motion } from "framer-motion";
import type { ThreatLevel } from "@/lib/types";
import { threatMeta } from "@/lib/utils";

/** Semicircular animated risk gauge (0–100). */
export function RiskGauge({ score, level }: { score: number; level: ThreatLevel }) {
  const m = threatMeta(level);
  const clamped = Math.max(0, Math.min(100, score));
  // semicircle: -90deg (left) → +90deg (right)
  const angle = -90 + (clamped / 100) * 180;
  const R = 90;
  const CX = 110;
  const CY = 110;

  // arc path helper (semicircle background)
  const arc = (startPct: number, endPct: number) => {
    const a0 = Math.PI - (startPct / 100) * Math.PI;
    const a1 = Math.PI - (endPct / 100) * Math.PI;
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY - R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY - R * Math.sin(a1);
    return `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 140" className="w-full max-w-[280px]">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
        {/* track */}
        <path d={arc(0, 100)} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={14} strokeLinecap="round" />
        {/* value arc */}
        <motion.path
          d={arc(0, 100)}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray="1 1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped / 100 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* needle */}
        <motion.line
          x1={CX}
          y1={CY}
          x2={CX}
          y2={CY - R + 6}
          stroke={m.hex}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 60, damping: 14 }}
        />
        <circle cx={CX} cy={CY} r={6} fill={m.hex} />
      </svg>
      <div className="-mt-6 text-center">
        <div className="num text-4xl font-semibold text-content-strong">
          {clamped.toFixed(0)}
          <span className="text-lg text-content-faint">/100</span>
        </div>
        <div className={`mt-1 text-sm font-semibold uppercase tracking-widest ${m.text}`}>{m.label}</div>
      </div>
    </div>
  );
}
