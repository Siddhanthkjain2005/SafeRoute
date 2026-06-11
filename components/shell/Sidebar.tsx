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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-accent/10 bg-gradient-to-b from-surface-1/80 to-surface-0/60 backdrop-blur-xl lg:flex">
      {/* brand */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-3 ring-1 ring-accent/40 shadow-lg shadow-accent/20">
          <ShieldAlert className="h-[18px] w-[18px] text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-content-strong">
            Safe<span className="text-accent">Route</span>
          </div>
          <div className="text-[9.5px] font-medium uppercase tracking-[0.22em] text-accent/70">
            Security
          </div>
        </div>
      </div>

      <div className="mx-5 mb-3 h-px bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0" />

      {/* nav */}
      <nav className="flex-1 space-y-1.5 px-3 py-2">
        {NAV.map(({ href, label, icon: Icon, hint }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-300",
                active 
                  ? "text-content-strong" 
                  : "text-content-muted hover:text-content-strong hover:bg-surface-2/50"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/20 to-accent-3/20 ring-1 ring-accent/40"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-[18px] w-[18px] transition-all",
                  active 
                    ? "text-accent drop-shadow-lg drop-shadow-accent/50" 
                    : "text-content-faint group-hover:text-accent"
                )}
              />
              <span className="relative z-10 flex-1 font-semibold">{label}</span>
              {href === "/incidents" && openAlerts > 0 && (
                <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-accent-2 to-accent-2/80 px-1.5 text-[10px] font-bold text-white ring-1 ring-accent-2/50">
                  {openAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* system status footer */}
      <div className="m-3 rounded-lg border border-accent/20 bg-gradient-to-br from-surface-2/60 to-surface-1/40 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="stat-label">System Status</span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-bold",
              connected ? "text-accent" : "text-accent-2"
            )}
          >
            <span className="relative flex h-2.5 w-2.5">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-accent opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2.5 w-2.5 rounded-full",
                  connected ? "bg-accent shadow-lg shadow-accent/50" : "bg-accent-2"
                )}
              />
            </span>
            {connected ? "Live" : "Offline"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-content-muted">
          <span>2 nodes · 2 routes</span>
          <span className="num text-accent/70">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
}
