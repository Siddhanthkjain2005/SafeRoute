"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Route, Radio, BarChart3, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveStore } from "@/lib/store";

export const NAV = [
  { href: "/", label: "Plan Route", icon: Route },
  { href: "/live", label: "Live Nodes", icon: Radio },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const connected = useLiveStore((s) => s.connected);
  const openAlerts = useLiveStore((s) => s.alerts.filter((a) => a.status === "open").length);

  return (
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-hairline/[0.07] bg-surface-1/70 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-10 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-glow">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-sans text-[15px] font-semibold tracking-tight text-content-strong">
            NightGuard
          </div>
          <div className="text-[11px] font-medium text-content-muted">Safe Route Intelligence</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-primary" : "text-content-muted hover:text-content-strong"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-primary/[0.08] ring-1 ring-primary/15"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                className={cn(
                  "relative h-[18px] w-[18px] transition-transform group-hover:scale-110",
                  active ? "text-primary" : "text-content-muted"
                )}
              />
              <span className="relative flex-1">{item.label}</span>
              {item.href === "/incidents" && openAlerts > 0 && (
                <span className="relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-threat-critical/12 px-1.5 text-[10px] font-bold text-threat-critical ring-1 ring-threat-critical/30">
                  {openAlerts}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-hairline/[0.07] bg-gradient-to-br from-primary/[0.05] to-secondary/[0.05] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-content-strong">
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
          {connected ? "Sensor mesh online" : "Reconnecting…"}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-content-muted">
          Real-time safety scoring across all monitored corridors.
        </p>
      </div>
    </aside>
  );
}
