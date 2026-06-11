"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, Flame, ShieldAlert, X } from "lucide-react";
import { useLiveStore } from "@/lib/store";
import { threatMeta } from "@/lib/utils";
import type { ThreatLevel } from "@/lib/types";

const ICON: Partial<Record<ThreatLevel, typeof ShieldAlert>> = {
  emergency: Flame,
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertTriangle,
};

export function Toaster() {
  const toasts = useLiveStore((s) => s.toasts);
  const dismiss = useLiveStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed right-5 top-20 z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const m = threatMeta(t.level);
          const Icon = ICON[t.level] ?? ShieldAlert;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="card pointer-events-auto relative overflow-hidden p-3.5"
            >
              {/* severity rail */}
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: m.hex }} />
              {/* progress bar */}
              <motion.span
                className="absolute bottom-0 left-0 h-0.5"
                style={{ background: m.hex }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 7, ease: "linear" }}
                onAnimationComplete={() => dismiss(t.id)}
              />
              <div className="flex items-start gap-3 pl-1.5">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1"
                  style={{ background: `${m.hex}1a`, color: m.hex, borderColor: `${m.hex}55` }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${m.text}`}>
                      {m.label}
                    </span>
                    <button
                      onClick={() => dismiss(t.id)}
                      className="text-content-faint transition-colors hover:text-content-strong"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-semibold text-content-strong">{t.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-content-muted">{t.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
