"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, Clock } from "lucide-react";
import { NAV } from "./Sidebar";
import { useLiveStore } from "@/lib/store";
import { useOverview } from "@/lib/hooks";
import { cn, threatMeta } from "@/lib/utils";

export function Topbar() {
  const path = usePathname();
  const connected = useLiveStore((s) => s.connected);
  const { data: ov } = useOverview();
  const [clock, setClock] = useState("--:--:--");
  const current =
    NAV.find((n) => (n.href === "/" ? path === "/" : path.startsWith(n.href))) ?? NAV[0];

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const level = ov?.threat_level ?? "safe";
  const m = threatMeta(level);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-hairline/[0.07] glass px-5 lg:px-7">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-content-faint">
          NightGuard
        </span>
        <span className="text-content-faint/40">/</span>
        <h1 className="text-[15px] font-semibold tracking-tight text-content-strong">
          {current.label}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 md:flex",
            m.bg,
            m.text,
            m.ring
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: m.hex }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ background: m.hex }}
            />
          </span>
          Area {m.label}
          <span className="num text-content-strong">{(ov?.risk_score ?? 0).toFixed(0)}</span>
        </div>

        <span className="num hidden items-center gap-1.5 text-sm text-content-muted lg:flex">
          <Clock className="h-3.5 w-3.5" />
          {clock}
        </span>

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
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
