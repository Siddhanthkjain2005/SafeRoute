"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SecurityEvent, ThreatLevel } from "@/lib/types";
import { ACCENT, SENSOR_LABEL, threatMeta } from "@/lib/utils";

type NodeType = "core" | "zone" | "sensor" | "threat";
interface GNode {
  id: string;
  label: string;
  type: NodeType;
  level?: ThreatLevel;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}
interface GLink {
  s: string;
  t: string;
  active?: boolean;
}

const TYPE_COLOR: Record<NodeType, string> = {
  core: ACCENT.blue,
  zone: ACCENT.cyan,
  sensor: ACCENT.purple,
  threat: ACCENT.red,
};

/**
 * Force-directed correlation graph (custom velocity-Verlet simulation — no
 * heavyweight graph lib). Shows how the core relates to zones, which sensors
 * each zone has fired, and the threats those produced. Hovering a node
 * highlights its relationships.
 */
export function ThreatCorrelationGraph({
  events,
  width = 560,
  height = 360,
}: {
  events: SecurityEvent[];
  width?: number;
  height?: number;
}) {
  const [, force] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const nodesRef = useRef<GNode[]>([]);
  const linksRef = useRef<GLink[]>([]);

  // Build the graph from recent events (recompute when the event set shifts).
  const graphKey = useMemo(
    () => events.slice(0, 24).map((e) => `${e.node_id}:${e.active_sensors.join("")}:${e.threat_level}`).join("|"),
    [events]
  );

  useEffect(() => {
    const cx = width / 2;
    const cy = height / 2;
    const prev = new Map(nodesRef.current.map((n) => [n.id, n]));
    const nodes: GNode[] = [];
    const links: GLink[] = [];
    const seen = new Set<string>();

    const add = (id: string, label: string, type: NodeType, r: number, level?: ThreatLevel) => {
      if (seen.has(id)) return;
      seen.add(id);
      const p = prev.get(id);
      nodes.push({
        id,
        label,
        type,
        level,
        r,
        x: p?.x ?? cx + (Math.random() - 0.5) * 160,
        y: p?.y ?? cy + (Math.random() - 0.5) * 160,
        vx: 0,
        vy: 0,
      });
    };

    add("core", "NightGuard", "core", 26);

    const recent = events.slice(0, 24);
    const zones = new Map<string, ThreatLevel>();
    const zoneSensors = new Map<string, Set<string>>();
    for (const e of recent) {
      const z = e.zone || e.node_id;
      const cur = zones.get(z);
      if (!cur || rank(e.threat_level) > rank(cur)) zones.set(z, e.threat_level);
      if (!zoneSensors.has(z)) zoneSensors.set(z, new Set());
      e.active_sensors.forEach((s) => zoneSensors.get(z)!.add(s));
    }
    // ensure the three known zones exist even when idle
    ["Zone A", "Zone B", "Virtual"].forEach((z) => {
      if (!zones.has(z)) zones.set(z, "safe");
    });

    for (const [z, lvl] of zones) {
      const zid = `zone:${z}`;
      add(zid, z, "zone", 16, lvl);
      links.push({ s: "core", t: zid });
      for (const s of zoneSensors.get(z) ?? []) {
        const sid = `sensor:${z}:${s}`;
        add(sid, SENSOR_LABEL[s] ?? s, "sensor", 9);
        links.push({ s: zid, t: sid, active: true });
      }
    }

    // top threats as their own nodes
    recent
      .filter((e) => rank(e.threat_level) >= rank("high"))
      .slice(0, 4)
      .forEach((e, i) => {
        const tid = `threat:${e.id}`;
        add(tid, `${e.threat_level} · ${(e.zone || e.node_id)}`, "threat", 11, e.threat_level);
        links.push({ s: `zone:${e.zone || e.node_id}`, t: tid, active: true });
      });

    nodesRef.current = nodes;
    linksRef.current = links;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphKey, width, height]);

  // simulation loop
  useEffect(() => {
    let raf = 0;
    const cx = width / 2;
    const cy = height / 2;
    const step = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy || 0.01;
          const d = Math.sqrt(d2);
          const rep = 2600 / d2;
          const fx = (dx / d) * rep;
          const fy = (dy / d) * rep;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      // springs
      const byId = new Map(nodes.map((n) => [n.id, n]));
      for (const l of links) {
        const a = byId.get(l.s);
        const b = byId.get(l.t);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const target = a.type === "core" || b.type === "core" ? 120 : 64;
        const f = (d - target) * 0.015;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
      // centering + integrate + damping
      let moving = 0;
      for (const n of nodes) {
        if (n.id === "core") {
          n.x = cx;
          n.y = cy;
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx += (cx - n.x) * 0.006;
        n.vy += (cy - n.y) * 0.006;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(n.r + 4, Math.min(width - n.r - 4, n.x));
        n.y = Math.max(n.r + 4, Math.min(height - n.r - 4, n.y));
        moving += Math.abs(n.vx) + Math.abs(n.vy);
      }
      force((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  const nodes = nodesRef.current;
  const links = linksRef.current;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const connected = (id: string) =>
    new Set(
      links
        .filter((l) => l.s === id || l.t === id)
        .flatMap((l) => [l.s, l.t])
    );
  const hi = hover ? connected(hover) : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {links.map((l, i) => {
        const a = byId.get(l.s);
        const b = byId.get(l.t);
        if (!a || !b) return null;
        const dim = hi && !(hi.has(l.s) && hi.has(l.t));
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={l.active ? ACCENT.cyan : "hsl(215 30% 60%)"}
            strokeOpacity={dim ? 0.05 : l.active ? 0.35 : 0.14}
            strokeWidth={l.active ? 1.4 : 1}
          />
        );
      })}
      {nodes.map((n) => {
        const color = n.type === "threat" || n.type === "zone" ? threatMeta(n.level ?? "safe").hex : TYPE_COLOR[n.type];
        const dim = hi && !hi.has(n.id);
        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            opacity={dim ? 0.3 : 1}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
          >
            {(n.type === "core" || n.type === "threat") && (
              <circle r={n.r + 6} fill="none" stroke={color} strokeOpacity={0.25}>
                <animate attributeName="r" values={`${n.r};${n.r + 8};${n.r}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={n.r} fill={`${color}22`} stroke={color} strokeWidth={1.5} style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
            {n.type === "core" && (
              <text textAnchor="middle" dy="0.35em" fontSize="9" fontWeight={700} fill="hsl(213 31% 95%)">
                NG
              </text>
            )}
            <text
              textAnchor="middle"
              y={n.r + 12}
              fontSize={n.type === "sensor" ? 8.5 : 10}
              fill="hsl(215 20% 78%)"
              style={{ pointerEvents: "none" }}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function rank(l: ThreatLevel): number {
  return ["safe", "low", "medium", "high", "critical", "emergency"].indexOf(l);
}
