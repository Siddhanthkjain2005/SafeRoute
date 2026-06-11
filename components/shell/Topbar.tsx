"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Command, Search, Wifi, WifiOff } from "lucide-react";
import { NAV } from "./Sidebar";
import { useLiveStore } from "@/lib/store";
import { useOverview } from "@/lib/hooks";
import { cn, threatMeta } from "@/lib/utils";

export function Topbar() {
  const path = usePathname();
  const connected = useLiveStore((s) => s.connected);
  const { data: ov } = useOverview();
  const [clock, setClock] = useState("--:--:--");
  const current = NAV.find((n) => n.href === path) ?? NAV[0];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const level = ov?.threat_level ?? "safe";
  const m = threatMeta(level);

  const openPalette = () =>
    window.dispatchEvent(new CustomEvent("nightguard:command"));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-accent/10 bg-gradient-to-r from-surface-0/70 to-surface-0/50 px-5 backdrop-blur-xl lg:px-7">
      <div className="flex items-center gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.20em] text-accent/80">
          Safe Route
        </div>
        <span className="text-accent/30">/</span>
        <h1 className="text-[16px] font-bold tracking-tight text-content-strong">
          {current.label}
        </h1>
        <span className="hidden text-xs text-content-muted sm:inline">— {current.hint}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* global threat chip */}
        <div
          className={cn("hidden items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 md:flex backdrop-blur-sm", m.bg, m.text, m.ring)}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse rounded-full opacity-70" style={{ background: m.hex }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: m.hex }} />
          </span>
          Risk: {m.label}
          <span className="num text-content-strong">{(ov?.risk_score ?? 0).toFixed(0)}</span>
        </div>

        {/* command trigger */}
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-lg border border-accent/20 bg-surface-2/50 px-2.5 py-1.5 text-xs text-content-muted transition-all hover:border-accent/40 hover:bg-surface-2/70 hover:text-accent"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-accent/15 bg-surface-3/60 px-1.5 py-0.5 text-[10px] text-content-faint sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <span className="num hidden text-sm text-accent/60 lg:block">{clock}</span>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 backdrop-blur-sm",
            connected
              ? "bg-accent/15 text-accent ring-accent/40"
              : "bg-accent-2/15 text-accent-2 ring-accent-2/40"
          )}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{connected ? "Live" : "Reconnecting"}</span>
        </div>
      </div>
    </header>
  );
}
