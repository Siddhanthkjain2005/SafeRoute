"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Search } from "lucide-react";
import { NAV } from "./Sidebar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  label: string;
  group: string;
  icon?: typeof Search;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items: Item[] = useMemo(() => {
    const nav: Item[] = NAV.map((n) => ({
      id: `nav:${n.href}`,
      label: n.label,
      group: "Navigate",
      icon: n.icon,
      run: () => router.push(n.href),
    }));
    const sims: Item[] = [
      { key: "night_intrusion", label: "Run scenario · Night Intrusion", frames: [{ darkness: 0.85 }, { motion: true, darkness: 0.85 }, { motion: true, sound: 0.8, vibration: true, darkness: 0.85 }] },
      { key: "fire", label: "Run scenario · Fire Hazard", frames: [{ smoke: 0.9 }, { smoke: 0.97, motion: true }] },
      { key: "motion", label: "Inject · Motion event", frames: [{ motion: true, darkness: 0.8 }] },
      { key: "smoke", label: "Inject · Smoke event", frames: [{ smoke: 0.92 }] },
    ].map((s) => ({
      id: `sim:${s.key}`,
      label: s.label,
      group: "Simulate",
      run: async () => {
        for (const f of s.frames) {
          await api.simulate({ node_id: "virtual-3", ...f }).catch(() => {});
          await new Promise((r) => setTimeout(r, 700));
        }
      },
    }));
    return [...nav, ...sims];
  }, [router]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(t) || i.group.toLowerCase().includes(t));
  }, [q, items]);

  // open via ⌘K / Ctrl+K or topbar event
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("nightguard:command", onEvt as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nightguard:command", onEvt as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
    }
  }, [open]);
  useEffect(() => setActive(0), [q]);

  const choose = (i: Item) => {
    setOpen(false);
    i.run();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-surface-0/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="glass relative z-10 w-[560px] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
          >
            <div className="flex items-center gap-3 border-b border-hairline/10 px-4">
              <Search className="h-4 w-4 text-content-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onListKey}
                placeholder="Search pages, run scenarios, inject events…"
                className="h-12 flex-1 bg-transparent text-sm text-content-strong outline-none placeholder:text-content-faint"
              />
              <kbd className="rounded border border-hairline/15 bg-surface-3/60 px-1.5 py-0.5 text-[10px] text-content-faint">
                esc
              </kbd>
            </div>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-content-faint">No matches</div>
              )}
              {filtered.map((i, idx) => {
                const showGroup = i.group !== lastGroup;
                lastGroup = i.group;
                const Icon = i.icon;
                return (
                  <div key={i.id}>
                    {showGroup && (
                      <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-content-faint">
                        {i.group}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => choose(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                        idx === active ? "bg-accent/12 text-content-strong" : "text-content-muted"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 text-content-faint" />}
                      <span className="flex-1">{i.label}</span>
                      {idx === active && <CornerDownLeft className="h-3.5 w-3.5 text-content-faint" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
