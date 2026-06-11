"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "text-accent",
  delay = 0,
  spark,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
  delay?: number;
  spark?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass glass-hover relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="stat-label">{label}</div>
          <div className="num mt-2 text-3xl font-semibold text-content-strong">{value}</div>
          {hint && <div className="mt-1 text-xs text-content-muted">{hint}</div>}
        </div>
        <div className={cn("rounded-xl bg-surface-3/50 p-2.5 ring-1 ring-hairline/12", accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {spark && <div className="mt-3">{spark}</div>}
    </motion.div>
  );
}
