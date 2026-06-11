"use client";
import { motion } from "framer-motion";
import { levelFromScore, threatMeta } from "@/lib/utils";

interface Cell {
  zone: string;
  intensity: number; // 0..100
  events: number;
}

export function Heatmap({ cells }: { cells: Cell[] }) {
  if (!cells.length) {
    return <div className="py-10 text-center text-sm text-content-faint">No activity in window.</div>;
  }
  return (
    <div className="space-y-3">
      {cells.map((c, i) => {
        const m = threatMeta(levelFromScore(c.intensity));
        return (
          <div key={c.zone} className="flex items-center gap-3">
            <div className="w-24 truncate text-sm text-content">{c.zone}</div>
            <div className="relative h-8 flex-1 overflow-hidden rounded-lg bg-surface-3/40 ring-1 ring-hairline/10">
              <motion.div
                className="h-full rounded-lg"
                style={{ background: `linear-gradient(90deg, ${m.hex}44, ${m.hex})`, boxShadow: `0 0 16px -2px ${m.glow}` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(4, c.intensity)}%` }}
                transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="num absolute right-2 top-1/2 -translate-y-1/2 text-xs text-content-strong">
                {c.intensity.toFixed(0)}
              </span>
            </div>
            <div className="w-14 text-right text-xs text-content-faint">{c.events} ev</div>
          </div>
        );
      })}
    </div>
  );
}
