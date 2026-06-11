"use client";
import dynamic from "next/dynamic";
import type { NodeInfo } from "@/lib/types";

// Leaflet touches `window`, so load it client-side only.
const ZoneMap = dynamic(() => import("./ZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="shimmer flex h-full items-center justify-center rounded-xl text-sm text-content-faint">
      Initializing zone intelligence map…
    </div>
  ),
});

export function ZoneMapDynamic({ nodes }: { nodes: NodeInfo[] }) {
  return <ZoneMap nodes={nodes} />;
}
