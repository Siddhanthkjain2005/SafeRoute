"use client";
import { Page } from "@/components/shell/Page";
import { CardHeader, MotionCard } from "@/components/ui/Card";
import { ActivityFeed } from "@/components/viz/ActivityFeed";
import { NodeStatus } from "@/components/viz/NodeStatus";
import { SimulatorPanel } from "@/components/viz/SimulatorPanel";
import { SecurityPulse } from "@/components/viz/SecurityPulse";
import { ZoneMapDynamic } from "@/components/viz/ZoneMapDynamic";
import { useLiveStore } from "@/lib/store";
import { useNodes } from "@/lib/hooks";
import { fmtTime, threatMeta } from "@/lib/utils";

export default function LivePage() {
  const { data: nodes } = useNodes();
  const events = useLiveStore((s) => s.events);

  return (
    <Page>
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Zone intelligence map */}
        <MotionCard delay={0.05} className="lg:col-span-8">
          <CardHeader title="Zone Intelligence Map" subtitle="node positions · threat zones · live activity"
            right={<span className="text-[11px] text-content-faint">marker size = live risk</span>} />
          <div className="h-[380px] w-full overflow-hidden rounded-xl">
            <ZoneMapDynamic nodes={nodes ?? []} />
          </div>
          <div className="mt-3 border-t border-hairline/10 pt-3">
            <div className="stat-label mb-1.5">System Activity Pulse</div>
            <SecurityPulse height={56} />
          </div>
        </MotionCard>

        {/* Node health */}
        <MotionCard delay={0.12} className="lg:col-span-4">
          <CardHeader title="Node Status" subtitle="liveness & firmware" />
          <NodeStatus nodes={nodes ?? []} />
        </MotionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Live feed */}
        <MotionCard delay={0.05} className="lg:col-span-4">
          <CardHeader title="Zone Activity" subtitle="streaming events" />
          <div className="max-h-[440px] overflow-y-auto pr-1">
            <ActivityFeed limit={18} />
          </div>
        </MotionCard>

        {/* Telemetry console */}
        <MotionCard delay={0.12} className="lg:col-span-4">
          <CardHeader title="Telemetry Console" subtitle="decoded MQTT frames" />
          <div className="num h-[440px] overflow-y-auto rounded-lg border border-hairline/10 bg-surface-0/50 p-3 text-[11px] leading-relaxed text-content-muted">
            {events.length === 0 && <div className="text-content-faint">awaiting frames…</div>}
            {events.slice(0, 50).map((e) => {
              const m = threatMeta(e.threat_level);
              return (
                <div key={e.id} className="whitespace-pre-wrap py-0.5">
                  <span className="text-content-faint">{fmtTime(e.ts)}</span>{" "}
                  <span className="text-accent-cyan">nightguard/{e.node_id}/telemetry</span>{" "}
                  <span style={{ color: m.hex }}>risk={e.risk_score.toFixed(0)} {e.threat_level}</span>{" "}
                  <span className="text-content">
                    {JSON.stringify({ m: +e.motion, v: +e.vibration, smoke: e.smoke, sound: e.sound, dark: e.darkness })}
                  </span>
                </div>
              );
            })}
          </div>
        </MotionCard>

        {/* Simulator */}
        <MotionCard delay={0.18} className="lg:col-span-4">
          <CardHeader title="Simulation Mode" subtitle="Virtual Node 3 · inject scenarios & sensors" />
          <SimulatorPanel />
        </MotionCard>
      </div>
    </Page>
  );
}
