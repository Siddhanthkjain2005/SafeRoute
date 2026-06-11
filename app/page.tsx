"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Navigation, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Page } from "@/components/shell/Page";
import { PathCard } from "@/components/viz/PathCard";
import { RouteMap } from "@/components/viz/RouteMap";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { useEvents, useRouteRecommendation } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";
import { cn, threatMeta } from "@/lib/utils";
import type { SecurityEvent, ThreatLevel } from "@/lib/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function HomePage() {
  const { data: rec, isLoading } = useRouteRecommendation();
  const { data: events } = useEvents(80);
  const connected = useLiveStore((s) => s.connected);
  const [busy, setBusy] = useState<string | null>(null);

  const latestByNode = useMemo(() => {
    const m: Record<string, SecurityEvent> = {};
    for (const e of events ?? []) if (!m[e.node_id]) m[e.node_id] = e;
    return m;
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card mesh relative overflow-hidden p-6 lg:p-8"
      >
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/20">
              <Navigation className="h-4 w-4 text-primary" />
            </span>
            <span className="stat-label">Safe Route Recommendation</span>
            <span
              className={cn(
                "ml-1 flex items-center gap-1.5 text-[11px] font-medium",
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
          <h1 className="max-w-2xl text-pretty text-3xl font-semibold tracking-tight text-content-strong lg:text-4xl">
            The safest way from{" "}
            <span className="text-primary">{rec?.source ?? "here"}</span> to{" "}
            <span className="text-secondary">{rec?.destination ?? "there"}</span>.
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-content-muted">
            NightGuard scores every corridor in real time using a mesh of IoT safety sensors,
            then routes you along the calmest, best-lit path.
          </p>
        </div>

        {/* animated route map */}
        <div className="relative mt-6">
          {isLoading && routes.length === 0 ? (
            <Skeleton className="h-[300px] w-full rounded-2xl" />
          ) : (
            <RouteMap
              routes={routes}
              recommendedId={recId}
              source={rec?.source ?? "Source"}
              destination={rec?.destination ?? "Destination"}
            />
          )}
        </div>

        {/* recommendation summary */}
        <div className="relative mt-6 flex flex-col gap-4 border-t border-hairline/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <Skeleton className="h-12 w-full max-w-md" />
          ) : recRoute ? (
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1"
                style={{ background: `${m.hex}1a`, color: m.hex, borderColor: `${m.hex}44` }}
              >
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-content-muted">
                  Recommended
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-content-strong">
                    {recRoute.name}
                  </span>
                  <span className="num text-sm" style={{ color: m.hex }}>
                    safety {recRoute.safety_score?.toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-content-muted">
              <Sparkles className="h-4 w-4 text-content-faint" /> Awaiting live telemetry to
              recommend a route…
            </div>
          )}
          {rec?.reason && (
            <p className="max-w-xl text-[13px] leading-relaxed text-content-muted">{rec.reason}</p>
          )}
        </div>
      </motion.section>

      {/* ── The candidate paths ──────────────────────────────────────────── */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {isLoading && routes.length === 0
          ? [0, 1].map((i) => <Skeleton key={i} className="h-[460px] rounded-lg" />)
          : routes.map((r, i) => (
              <PathCard
                key={r.id}
                route={r}
                event={latestByNode[r.node_ids[0]] ?? null}
                recommended={r.id === recId}
                index={i}
              />
            ))}
      </div>

      {/* ── Demo controls ────────────────────────────────────────────────── */}
      <div className="mt-5 card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="panel-title">Try it — simulate activity</div>
            <p className="mt-0.5 text-xs text-content-muted">
              Inject a short intrusion on a path and watch the risk rise and the recommendation
              switch to the safer route.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DemoButton
              busy={busy === "A"}
              disabled={!!busy}
              onClick={() => demo("A", nodeA, intrusion)}
              label={`Intrusion on ${routes[0]?.name ?? "Path A"}`}
            />
            <DemoButton
              busy={busy === "B"}
              disabled={!!busy}
              onClick={() => demo("B", nodeB, intrusion)}
              label={`Intrusion on ${routes[1]?.name ?? "Path B"}`}
            />
            <DemoButton
              busy={busy === "R"}
              disabled={!!busy}
              variant="ghost"
              onClick={() => demo("R", nodeA, calm).then(() => demo("R", nodeB, calm))}
              label="Calm both"
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
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors disabled:opacity-50",
        variant === "solid"
          ? "border border-hairline/[0.08] bg-surface-2 text-content hover:text-content-strong"
          : "text-content-muted hover:text-content"
      )}
    >
      {busy ? (
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Navigation className="h-3.5 w-3.5" />
      )}
      {label}
    </motion.button>
  );
}
