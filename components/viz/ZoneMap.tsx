"use client";
import { Fragment, useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip as LTooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { NodeInfo } from "@/lib/types";
import { useLiveStore } from "@/lib/store";
import { threatMeta } from "@/lib/utils";

const CENTER: [number, number] = [
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT) || 12.9716,
  Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG) || 77.5946,
];

/** Animated, threat-tinted node marker built from an L.divIcon. */
function pulseIcon(hex: string, online: boolean, risk: number) {
  const size = 18 + Math.min(18, risk / 6);
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;transform:translate(-50%,-50%)">
        ${online ? `<span style="position:absolute;inset:0;border-radius:9999px;border:2px solid ${hex};opacity:0.6;animation:ngpulse 2s ease-out infinite"></span>` : ""}
        <span style="position:absolute;inset:25%;border-radius:9999px;background:${hex};box-shadow:0 0 12px ${hex}">
        </span>
      </div>`,
    iconSize: [size, size],
  });
}

function FitBounds({ nodes }: { nodes: NodeInfo[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = nodes.filter((n) => n.latitude && n.longitude).map((n) => [n.latitude, n.longitude]) as [number, number][];
    if (pts.length > 1) map.fitBounds(pts, { padding: [60, 60], maxZoom: 17 });
  }, [nodes, map]);
  return null;
}

export default function ZoneMap({ nodes }: { nodes: NodeInfo[] }) {
  const lastByNode = useLiveStore((s) => s.lastEventByNode);

  return (
    <MapContainer
      center={CENTER}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: 16 }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      <FitBounds nodes={nodes} />
      {nodes
        .filter((n) => n.latitude && n.longitude)
        .map((n) => {
          const ev = lastByNode[n.id];
          const level = ev?.threat_level ?? "safe";
          const m = threatMeta(level);
          const risk = ev?.risk_score ?? 0;
          const pos: [number, number] = [n.latitude as number, n.longitude as number];
          return (
            <Fragment key={n.id}>
              {/* threat zone */}
              <Circle
                center={pos}
                radius={40 + risk * 1.6}
                pathOptions={{ color: m.hex, fillColor: m.hex, fillOpacity: 0.08, weight: 1, opacity: 0.4 }}
              />
              <Marker position={pos} icon={pulseIcon(m.hex, n.online, risk)}>
                <LTooltip direction="top" offset={[0, -10]}>
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                    <strong>{n.name}</strong>
                    <br />
                    {n.zone} · {n.online ? "online" : "offline"}
                    <br />
                    risk {risk.toFixed(0)} · {m.label}
                  </div>
                </LTooltip>
              </Marker>
            </Fragment>
          );
        })}
    </MapContainer>
  );
}
