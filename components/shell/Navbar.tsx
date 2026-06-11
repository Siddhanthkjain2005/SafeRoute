"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Radio, Route, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveStore } from "@/lib/store";

export const NAV = [
  { href: "/", label: "Safe Route", icon: Route, hint: "Recommendation" },
  { href: "/live", label: "Live", icon: Radio, hint: "Sensor streams" },
  { href: "/analytics", label: "Analytics", icon: Activity, hint: "Trends & graphs" },
  { href: "/incidents", label: "Incidents", icon: ShieldAlert, hint: "Alerts" },
];

export function Navbar() {
  const path = usePathname();
  const connected = useLiveStore((s) => s.connected);
  const openAlerts = useLiveStore((s) => s.alerts.filter((a) => a.status === "open").length);

  const openPalette = () => window.dispatchEvent(new CustomEvent("nightguard:command"));

  return (
    <header className="sticky top-0 z-30 border-b border-hairline/12 bg-surface-0/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-8">
        {/* brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
            <span className="absolute inset-0 animate-pulse-ring rounded-xl ring-1 ring-accent/40" />
            <ShieldCheck className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-content-strong">
            Night<span className="text-accent">Guard</span>
          </span>
        </Link>

        {/* center nav */}
        <nav className="hidden items-center gap-1 rounded-full border border-hairline/12 bg-surface-2/70 p-1 shadow-sm md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "text-white" : "text-content-muted hover:text-content-strong"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-accent shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-[15px] w-[15px]" />
                <span className="relative z-10">{label}</span>
                {href === "/incidents" && openAlerts > 0 && (
                  <span className="relative z-10 ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-threat-critical px-1 text-[9px] font-bold text-white">
                    {openAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* right cluster */}
        <div className="flex items-center gap-2">
          <button
            onClick={openPalette}
            aria-label="Open command palette"
            className="flex items-center gap-2 rounded-full border border-hairline/14 bg-surface-2/70 px-3 py-1.5 text-xs text-content-muted transition-colors hover:text-content-strong"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden items-center rounded border border-hairline/16 bg-surface-3/70 px-1.5 py-0.5 text-[10px] sm:flex">
              ⌘K
            </kbd>
          </button>
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ring-1",
              connected
                ? "bg-threat-safe/10 text-threat-safe ring-threat-safe/25"
                : "bg-threat-high/10 text-threat-high ring-threat-high/25"
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              {connected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-threat-safe opacity-70" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  connected ? "bg-threat-safe" : "bg-threat-high"
                )}
              />
            </span>
            <span className="hidden sm:inline">{connected ? "Live" : "Offline"}</span>
          </span>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-hairline/10 px-4 py-2 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                active ? "bg-accent text-white" : "text-content-muted"
              )}
            >
              <Icon className="h-[15px] w-[15px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
