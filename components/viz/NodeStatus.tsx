"use client";
import { Cpu, MapPin } from "lucide-react";
import type { NodeInfo } from "@/lib/types";
import { useLiveStore } from "@/lib/store";
import { cn, fmtRelative, threatMeta } from "@/lib/utils";

export function NodeStatus({ nodes }: { nodes: NodeInfo[] }) {
  const lastByNode = useLiveStore((s) => s.lastEventByNode);
  return (
    <div className="space-y-2">
      {nodes.map((n) => {
        const ev = lastByNode[n.id];
        const m = threatMeta(ev?.threat_level ?? "safe");
        return (
          <div
            key={n.id}
            className="flex items-center gap-3 rounded-lg border border-hairline/8 bg-surface-2/40 px-3 py-2.5"
          >
            <div
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg ring-1",
                n.online ? "bg-threat-safe/10 ring-threat-safe/30" : "bg-surface-3/40 ring-hairline/10"
              )}
            >
              <Cpu className={cn("h-4 w-4", n.online ? "text-threat-safe" : "text-content-faint")} />
              {n.online && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-threat-safe ring-2 ring-surface-1" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-content-strong">{n.name}</span>
                <span className="rounded bg-surface-3/60 px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-content-faint">
                  {n.kind}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-content-faint">
                <MapPin className="h-3 w-3" /> {n.zone}
                <span className="mx-1">·</span>
                {n.online ? `seen ${fmtRelative(n.last_seen)}` : `offline · ${fmtRelative(n.last_seen)}`}
              </div>
            </div>
            <div className="text-right">
              <div className={cn("num text-sm font-semibold", m.text)}>{(ev?.risk_score ?? 0).toFixed(0)}</div>
              <div className="num text-[9.5px] text-content-faint">{n.firmware ?? "—"}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
