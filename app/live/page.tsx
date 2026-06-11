"use client";

import { useNodes, useOverview } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";
import { Page } from "@/components/shell/Page";
import { CardHeader, MotionCard } from "@/components/ui/Card";
import { NodeStatus } from "@/components/viz/NodeStatus";
import { ActivityFeed } from "@/components/viz/ActivityFeed";
import { SimulatorPanel } from "@/components/viz/SimulatorPanel";
import { Activity, Radio, ShieldCheck, TriangleAlert } from "lucide-react";

export default function LivePage() {
  const { data: nodes } = useNodes();
  const { data: overview } = useOverview();
  const events = useLiveStore((s) => s.events);

  const list = nodes ?? [];
  const online = list.filter((n) => n.online).length;
  const total = list.length;
  const elevated = list.filter((n) => n.current_risk >= 65).length;

  const stats = [
    { label: "Nodes online", value: total ? `${online}/${total}` : "—", icon: Radio, tone: "text-threat-safe", bg: "bg-threat-safe/10" },
    { label: "Live events", value: events.length, icon: Activity, tone: "text-secondary", bg: "bg-secondary/10" },
    { label: "Elevated zones", value: elevated, icon: TriangleAlert, tone: "text-threat-high", bg: "bg-threat-high/10" },
    {
      label: "Network health",
      value: total ? `${Math.round((online / total) * 100)}%` : "—",
      icon: ShieldCheck,
      tone: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <Page
      title="Live Network"
      subtitle="Real-time telemetry streaming from every NightGuard sensor node across the city."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <MotionCard key={s.label} delay={i * 0.05} className="flex items-center gap-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${s.bg} ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="num text-2xl font-semibold text-content-strong">{s.value}</div>
              <div className="truncate text-xs text-content-muted">{s.label}</div>
            </div>
          </MotionCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <MotionCard delay={0.1}>
          <CardHeader
            title="Sensor nodes"
            subtitle="liveness, firmware and live risk per node"
            right={
              <span className="flex items-center gap-1.5 text-xs text-content-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-threat-safe opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-threat-safe" />
                </span>
                streaming
              </span>
            }
          />
          <NodeStatus nodes={list} />
        </MotionCard>

        <div className="flex flex-col gap-6">
          <MotionCard delay={0.15}>
            <CardHeader title="Simulation mode" subtitle="inject scenarios & sensor frames" />
            <SimulatorPanel />
          </MotionCard>
          <MotionCard delay={0.2}>
            <CardHeader title="Zone activity" subtitle="streaming events" />
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <ActivityFeed limit={18} />
            </div>
          </MotionCard>
        </div>
      </div>
    </Page>
  );
}
