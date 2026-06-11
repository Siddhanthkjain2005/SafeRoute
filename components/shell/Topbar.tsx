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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-hairline/10 bg-surface-0/60 px-5 backdrop-blur-2xl lg:px-7">
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-content-faint">
          NightGuard
        </div>
        <span className="text-content-faint/40">/</span>
        <h1 className="text-[15px] font-semibold tracking-tight text-content-strong">
          {current.label}
        </h1>
        <span className="hidden text-xs text-content-faint sm:inline">· {current.hint}</span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* global threat chip */}
        <div
          className={cn("hidden items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 md:flex", m.bg, m.text, m.ring)}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: m.hex }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: m.hex }} />
          </span>
          Threat {m.label}
          <span className="num text-content-strong">{(ov?.risk_score ?? 0).toFixed(0)}</span>
        </div>

        {/* command trigger */}
        <button
          onClick={openPalette}
          className="flex items-center gap-2 rounded-lg border border-hairline/12 bg-surface-2/60 px-2.5 py-1.5 text-xs text-content-muted transition-colors hover:text-content-strong"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-hairline/15 bg-surface-3/60 px-1.5 py-0.5 text-[10px] sm:flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        <span className="num hidden text-sm text-content-muted lg:block">{clock}</span>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1",
            connected
              ? "bg-threat-safe/10 text-threat-safe ring-threat-safe/30"
              : "bg-threat-high/10 text-threat-high ring-threat-high/30"
          )}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{connected ? "Live" : "Reconnecting"}</span>
        </div>
      </div>
    </header>
  );
}
