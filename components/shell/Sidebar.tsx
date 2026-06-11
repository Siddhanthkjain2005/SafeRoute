"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  Radio,
  Route,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveStore } from "@/lib/store";

export const NAV = [
  { href: "/", label: "Safe Route", icon: Route, hint: "Recommendation" },
  { href: "/live", label: "Live Monitoring", icon: Radio, hint: "Sensor streams" },
  { href: "/analytics", label: "Analytics", icon: Activity, hint: "Trends & graphs" },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert, hint: "Alerts" },
];

export function Sidebar() {
  const path = usePathname();
  const connected = useLiveStore((s) => s.connected);
  const openAlerts = useLiveStore((s) => s.alerts.filter((a) => a.status === "open").length);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-hairline/10 bg-surface-1/60 backdrop-blur-2xl lg:flex">
      {/* brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
          <span className="absolute inset-0 animate-pulse-ring rounded-xl ring-1 ring-accent/40" />
          <ShieldAlert className="h-[18px] w-[18px] text-accent" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight text-content-strong">
            Night<span className="text-accent">Guard</span>
          </div>
          <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-content-faint">
            Security Intel
          </div>
        </div>
      </div>

      <div className="mx-5 mb-3 h-px bg-gradient-to-r from-transparent via-hairline/15 to-transparent" />

      {/* nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon, hint }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "text-content-strong" : "text-content-muted hover:text-content"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-accent/10 ring-1 ring-accent/25"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-[18px] w-[18px] transition-colors",
                  active ? "text-accent" : "text-content-faint group-hover:text-content"
                )}
              />
              <span className="relative z-10 flex-1 font-medium">{label}</span>
              {href === "/incidents" && openAlerts > 0 && (
                <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-threat-critical/20 px-1.5 text-[10px] font-bold text-threat-critical ring-1 ring-threat-critical/40">
                  {openAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* system status footer */}
      <div className="m-3 rounded-xl border border-hairline/10 bg-surface-2/50 p-3">
        <div className="flex items-center justify-between">
          <span className="stat-label">System</span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold",
              connected ? "text-threat-safe" : "text-threat-high"
            )}
          >
            <span className="relative flex h-2 w-2">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-threat-safe opacity-75" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  connected ? "bg-threat-safe" : "bg-threat-high"
                )}
              />
            </span>
            {connected ? "Online" : "Offline"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10.5px] text-content-faint">
          <span>2 nodes · 2 paths</span>
          <span className="num">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
