"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Page } from "@/components/shell/Page";
import { PathCard } from "@/components/viz/PathCard";
import { RouteVisualizer } from "@/components/viz/RouteVisualizer";
import { AnimatedNumber } from "@/components/viz/AnimatedNumber";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useEvents, useRouteRecommendation } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";
import { cn, safetyVerdict, threatMeta } from "@/lib/utils";
import type { SecurityEvent, ThreatLevel } from "@/lib/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function HomePage() {
  const { data: rec, isLoading } = useRouteRecommendation();
  const { data: events } = useEvents(80);
  const connected = useLiveStore((s) => s.connected);
  const [busy, setBusy] = useState<string | null>(null);

  const latestByNode = useMemo(() => {
    const map: Record<string, SecurityEvent> = {};
    for (const e of events ?? []) if (!map[e.node_id]) map[e.node_id] = e;
    return map;
  }, [events]);

  const routes = rec?.routes ?? [];
  const recId = rec?.recommended_route_id ?? null;
  const recRoute = routes.find((r) => r.id === recId) ?? null;
  const recLevel = (recRoute?.threat_level ?? "safe") as ThreatLevel;
  const m = threatMeta(recLevel);

  const fire = (node: string, frame: Record<string, unknown>) =>
    api.simulate({ node_id: node, ...frame }).catch(() => {});
  const demo = async (label: string, node: string, frames: Record<string, unknown>[]) => {
    setBusy(label);
    try {
      for (const f of frames) {
        await fire(node, f);
        await sleep(700);
      }
    } finally {
      setBusy(null);
    }
  };
  const nodeA = routes[0]?.node_ids[0] ?? "zone-a";
  const nodeB = routes[1]?.node_ids[0] ?? "zone-b";
  const intrusion = [
    { motion: true, darkness: 0.85 },
    { motion: true, sound: 0.7, darkness: 0.85 },
    { motion: true, vibration: true, sound: 0.8, darkness: 0.85 },
    { motion: true, vibration: true, sound: 0.85, darkness: 0.85 },
  ];
  const calm = [{ darkness: 0.15 }, { darkness: 0.1 }];

  return (
    <Page>
      {/* ── Hero headline ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline/14 bg-surface-2/70 px-3.5 py-1.5 text-xs font-medium text-content-muted shadow-sm"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-accent-teal" />
          Powered by live IoT sensor intelligence
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-content-strong sm:text-5xl lg:text-6xl"
        >
          Find the <span className="text-gradient">safest route</span>
          <br className="hidden sm:block" /> across campus, in real time.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-content-muted sm:text-lg"
        >
          NightGuard reads the environment along every path — visibility, noise, motion —
          and recommends where you should walk tonight.
        </motion.p>
      </section>

      {/* ── Route visualization centerpiece ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="glass relative mt-10 overflow-hidden p-4 sm:p-6"
      >
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/12 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="stat-label">Live Route Map</span>
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-medium",
              connected ? "text-threat-safe" : "text-content-faint"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                connected ? "animate-pulse bg-threat-safe" : "bg-content-faint"
              )}
            />
            {connected ? "live" : "offline"}
          </span>
        </div>

        {isLoading && routes.length === 0 ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <RouteVisualizer
            source={rec?.source ?? "Source"}
            destination={rec?.destination ?? "Destination"}
            routes={routes}
            recommendedId={recId}
          />
        )}

        {/* recommendation banner */}
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-hairline/12 bg-surface-1/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <Skeleton className="h-14 w-full max-w-sm" />
          ) : recRoute ? (
            <>
              <div className="flex items-center gap-3.5">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: `${m.hex}16`, color: m.hex }}
                >
                  <ShieldCheck className="h-7 w-7" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
                    Recommended route
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight text-content-strong">
                      {recRoute.name}
                    </span>
                    <span className="num text-sm font-semibold" style={{ color: m.hex }}>
                      <AnimatedNumber value={recRoute.safety_score ?? 0} /> safety
                    </span>
                  </div>
                </div>
              </div>
              <p className="max-w-md text-[13px] leading-relaxed text-content-muted">
                {rec?.reason || safetyVerdict(recRoute.safety_score)}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-content-muted">
              <Sparkles className="h-4 w-4 text-content-faint" /> Awaiting live telemetry to recommend a
              route…
            </div>
          )}
        </div>
      </motion.div>

      {/* ── The two paths ─────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {isLoading && routes.length === 0
          ? [0, 1].map((i) => <Skeleton key={i} className="h-[480px]" />)
          : routes.map((r, i) => (
              <PathCard
                key={r.id}
                route={r}
                event={latestByNode[r.node_ids[0]] ?? null}
                recommended={r.id === recId}
                index={i}
                letter={String.fromCharCode(65 + i)}
              />
            ))}
      </div>

      {/* ── Try-it demo ───────────────────────────────────────────────── */}
      <div className="glass mt-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-amber/14 text-accent-amber">
              <Zap className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="panel-title">See it react</div>
              <p className="mt-0.5 max-w-md text-xs text-content-muted">
                Simulate activity on a path and watch the safety score drop and the recommendation
                switch to the calmer route.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DemoButton
              busy={busy === "A"}
              disabled={!!busy}
              onClick={() => demo("A", nodeA, intrusion)}
              label={`Disturb ${routes[0]?.name ?? "Path A"}`}
            />
            <DemoButton
              busy={busy === "B"}
              disabled={!!busy}
              onClick={() => demo("B", nodeB, intrusion)}
              label={`Disturb ${routes[1]?.name ?? "Path B"}`}
            />
            <DemoButton
              busy={busy === "R"}
              disabled={!!busy}
              variant="ghost"
              onClick={() => demo("R", nodeA, calm).then(() => demo("R", nodeB, calm))}
              label="Calm everything"
            />
          </div>
        </div>
      </div>
    </Page>
  );
}

function DemoButton({
  label,
  onClick,
  busy,
  disabled,
  variant = "solid",
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50",
        variant === "solid"
          ? "border border-hairline/14 bg-surface-2/80 text-content hover:text-content-strong hover:border-accent/30"
          : "text-content-muted hover:text-content"
      )}
    >
      {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
      {label}
    </motion.button>
  );
}
