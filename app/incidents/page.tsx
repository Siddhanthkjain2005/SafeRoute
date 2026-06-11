"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Search, ShieldX } from "lucide-react";
import { Page } from "@/components/shell/Page";
import { CardHeader, MotionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThreatBadge } from "@/components/ui/ThreatBadge";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useAlert, useAlerts, useUpdateAlert } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";
import { cn, fmtRelative, fmtTime } from "@/lib/utils";

const STATUS_FILTERS = ["open", "investigating", "resolved", "dismissed"];

export default function IncidentsPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<number | null>(null);
  const { data: alerts, isLoading } = useAlerts(filter);
  const { data: detail } = useAlert(selected);
  const liveAlerts = useLiveStore((s) => s.alerts);
  const update = useUpdateAlert();

  useEffect(() => {
    if (selected === null && alerts && alerts.length) setSelected(alerts[0].id);
  }, [alerts, selected]);

  const act = (body: { status?: string; acknowledged?: boolean; note?: string }) => {
    if (selected === null) return;
    update.mutate({ id: selected, body });
  };

  return (
    <Page>
      <div className="grid gap-4 lg:grid-cols-5">
        {/* List */}
        <MotionCard delay={0.05} className="lg:col-span-2">
          <CardHeader title="Active Incidents" subtitle={`${alerts?.length ?? 0} matching`} />
          <div className="mb-3 flex flex-wrap gap-1.5">
            <Chip label="all" active={!filter} onClick={() => setFilter(undefined)} />
            {STATUS_FILTERS.map((s) => (
              <Chip key={s} label={s} active={filter === s} onClick={() => setFilter(s)} />
            ))}
          </div>
          <div className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
            {isLoading && <SkeletonRows rows={6} />}
            {!isLoading && (alerts ?? []).length === 0 && (
              <div className="py-10 text-center text-sm text-content-faint">No incidents. The campus is quiet.</div>
            )}
            {(alerts ?? []).map((a) => (
              <motion.button
                key={a.id}
                layout
                onClick={() => setSelected(a.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  selected === a.id
                    ? "border-accent/40 bg-accent/8"
                    : "border-hairline/10 bg-surface-2/40 hover:bg-surface-2/70"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-content-strong">
                    <span className="num rounded bg-surface-3/60 px-1.5 py-0.5">P{a.priority}</span>
                    <span className="truncate">{a.title}</span>
                  </span>
                  <ThreatBadge level={a.category} />
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-content-muted">{a.summary}</p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-content-faint">
                  <span>{fmtRelative(a.created_at)}</span>
                  <span className="uppercase tracking-wider">{a.status}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </MotionCard>

        {/* Detail */}
        <MotionCard delay={0.12} className="lg:col-span-3">
          {!detail ? (
            <div className="flex h-[620px] items-center justify-center text-sm text-content-faint">
              Select an incident to investigate
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ThreatBadge level={detail.category} pulse={detail.status === "open"} />
                    <span className="num rounded bg-surface-3/60 px-1.5 py-0.5 text-xs text-content">Priority {detail.priority}</span>
                    <span className="num text-xs text-content-faint">#{detail.id}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-content-strong">{detail.title}</h2>
                  <p className="mt-1 text-sm text-content-muted">{detail.summary}</p>
                </div>
                <div className="text-right">
                  <div className="num text-3xl font-semibold text-content-strong">{detail.risk_score.toFixed(0)}</div>
                  <div className="stat-label">risk score</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Meta label="Node" value={detail.node_id ?? "—"} />
                <Meta label="Status" value={detail.status} />
                <Meta label="Sensors" value={detail.sensors.join(", ") || "—"} />
                <Meta label="Correlated" value={detail.correlated_nodes.join(", ") || "none"} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => act({ acknowledged: true })}>
                  <CheckCircle2 className="h-4 w-4" /> Acknowledge
                </Button>
                <Button variant="ghost" size="sm" onClick={() => act({ status: "investigating" })}>
                  <Search className="h-4 w-4" /> Investigate
                </Button>
                <Button variant="primary" size="sm" onClick={() => act({ status: "resolved" })}>
                  <CheckCircle2 className="h-4 w-4" /> Resolve
                </Button>
                <Button variant="danger" size="sm" onClick={() => act({ status: "dismissed" })}>
                  <ShieldX className="h-4 w-4" /> Dismiss
                </Button>
              </div>

              <div className="mt-6">
                <div className="stat-label mb-3">Investigation Timeline</div>
                <div className="relative space-y-4 border-l border-hairline/15 pl-5">
                  {detail.timeline.map((t) => (
                    <div key={t.id} className="relative">
                      <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-surface-1" />
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="num text-content-faint">{fmtTime(t.ts)}</span>
                        <span className="rounded bg-surface-3/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-content-muted">{t.kind}</span>
                        <span className="text-content-faint">· {t.actor}</span>
                      </div>
                      <p className="mt-1 text-sm text-content">{t.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </MotionCard>
      </div>
    </Page>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
        active ? "bg-accent/15 text-accent ring-1 ring-accent/30" : "bg-surface-3/40 text-content-muted hover:text-content-strong"
      )}
    >
      {label}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hairline/10 bg-surface-2/40 p-2.5">
      <div className="stat-label">{label}</div>
      <div className="mt-1 truncate text-sm capitalize text-content">{value}</div>
    </div>
  );
}
