import type {
  Alert,
  AlertDetail,
  Forecast,
  NodeInfo,
  Overview,
  RouteRecommendation,
  SecurityEvent,
  SensorStat,
  ThreatLevel,
} from "./types";

/**
 * Elegant, deterministic demo data. Used as a graceful fallback when the live
 * NightGuard backend (NEXT_PUBLIC_API_BASE) is unreachable — so the product
 * always feels alive in a preview or offline demo.
 */

const now = () => new Date();
const iso = (offsetSec = 0) => new Date(Date.now() - offsetSec * 1000).toISOString();

function levelFromScore(score: number): ThreatLevel {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  if (score >= 18) return "low";
  return "safe";
}

// Slowly drifting risk per node so the demo subtly breathes.
function drift(seed: number, base: number, amp: number) {
  const t = Date.now() / 1000;
  return Math.max(0, Math.min(100, base + Math.sin(t / 11 + seed) * amp + Math.cos(t / 7 + seed) * (amp / 2)));
}

export const DEMO_NODES_META = [
  { id: "node-a", name: "Maple Walk", zone: "North Quad", base: 14, amp: 8 },
  { id: "node-b", name: "Riverside Path", zone: "East Commons", base: 58, amp: 14 },
  { id: "node-c", name: "Library Cut", zone: "Central", base: 28, amp: 10 },
  { id: "node-d", name: "Stadium Loop", zone: "South Fields", base: 41, amp: 12 },
];

export function demoNodes(): NodeInfo[] {
  return DEMO_NODES_META.map((n, i) => {
    const risk = Math.round(drift(i, n.base, n.amp));
    return {
      id: n.id,
      name: n.name,
      zone: n.zone,
      kind: "sensor-node",
      latitude: 40.11 + i * 0.004,
      longitude: -88.22 + i * 0.005,
      firmware: "v2.4.1",
      last_seen: iso(2 + i),
      online: true,
      current_risk: risk,
    };
  });
}

function sensorsFor(risk: number) {
  return {
    motion: risk > 30,
    vibration: risk > 60,
    smoke: risk > 80 ? 0.4 : 0.02,
    sound: Math.min(1, risk / 120 + 0.05),
    darkness: 0.7,
  };
}

function activeSensors(risk: number): string[] {
  const s: string[] = [];
  if (risk > 30) s.push("motion");
  if (risk > 60) s.push("vibration");
  if (risk > 45) s.push("sound");
  s.push("darkness");
  return s;
}

function factorsFor(risk: number): string[] {
  if (risk < 18) return ["Calm corridor", "Good visibility", "No recent activity"];
  if (risk < 40) return ["Light foot traffic", "Stable readings"];
  if (risk < 65) return ["Elevated motion", "Some noise detected"];
  return ["Sustained motion", "Vibration + noise spike", "Low visibility"];
}

export function demoRouteRecommendation(): RouteRecommendation {
  const nodes = demoNodes();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const mk = (id: string, name: string, nodeId: string) => {
    const n = byId[nodeId];
    const risk = n.current_risk;
    const level = levelFromScore(risk);
    return {
      id,
      name,
      node_ids: [nodeId],
      nodes: [
        {
          node_id: nodeId,
          name: n.name,
          zone: n.zone,
          online: true,
          fresh: true,
          risk_score: risk,
          threat_level: level,
          confidence: 0.78 + (1 - risk / 100) * 0.18,
          active_sensors: activeSensors(risk),
          factors: factorsFor(risk),
          last_seen: n.last_seen,
        },
      ],
      route_risk: risk,
      safety_score: Math.round(100 - risk),
      mean_risk: risk,
      historical_activity: Math.round(risk / 8),
      confidence: 0.78 + (1 - risk / 100) * 0.18,
      threat_level: level,
      available: true,
    };
  };

  const routeA = mk("route-a", "Maple Walk", "node-a");
  const routeB = mk("route-b", "Riverside Path", "node-b");
  const routes = [routeA, routeB];
  const best = [...routes].sort((a, b) => (b.safety_score ?? 0) - (a.safety_score ?? 0))[0];

  return {
    source: "Engineering Hall",
    destination: "West Residences",
    routes,
    recommended_route_id: best.id,
    reason: `${best.name} is currently the safest corridor with a safety score of ${best.safety_score}. ${
      best.id === "route-a"
        ? "Riverside Path shows elevated motion and noise, so traffic is steered to the quieter quad."
        : "Conditions favor this path right now."
    }`,
    updated_at: now().toISOString(),
  };
}

export function demoOverview(): Overview {
  const nodes = demoNodes();
  const avg = Math.round(nodes.reduce((s, n) => s + n.current_risk, 0) / nodes.length);
  return {
    threat_level: levelFromScore(avg),
    risk_score: avg,
    active_nodes: nodes.length,
    total_nodes: nodes.length,
    open_alerts: 2,
    critical_alerts: 0,
    zones: nodes.map((n) => ({
      zone: n.zone,
      risk_score: n.current_risk,
      threat_level: levelFromScore(n.current_risk),
      online_nodes: 1,
      total_nodes: 1,
    })),
    updated_at: now().toISOString(),
  };
}

export function demoEvents(limit = 80): SecurityEvent[] {
  const nodes = demoNodes();
  const out: SecurityEvent[] = [];
  for (let i = 0; i < limit; i++) {
    const n = nodes[i % nodes.length];
    const risk = Math.max(0, Math.round(n.current_risk + Math.sin(i / 3) * 12));
    const s = sensorsFor(risk);
    out.push({
      id: 100000 - i,
      node_id: n.id,
      zone: n.zone,
      ts: iso(i * 7),
      motion: s.motion,
      vibration: s.vibration,
      smoke: s.smoke,
      sound: s.sound,
      darkness: s.darkness,
      active_sensors: activeSensors(risk),
      risk_score: risk,
      threat_level: levelFromScore(risk),
      confidence: 0.8,
      rule_score: risk * 0.6,
      ml_score: risk * 0.4,
      factors: factorsFor(risk),
    });
  }
  return out;
}

export function demoTimeseries(hours = 24) {
  const pts: { ts: string; risk_score: number; event_count: number }[] = [];
  const buckets = hours * 6;
  for (let i = buckets; i >= 0; i--) {
    const t = Date.now() - i * 10 * 60 * 1000;
    const base = 30 + Math.sin(i / 8) * 18 + Math.cos(i / 21) * 10;
    pts.push({
      ts: new Date(t).toISOString(),
      risk_score: Math.max(4, Math.round(base + (i % 9 === 0 ? 22 : 0))),
      event_count: Math.round(4 + Math.abs(Math.sin(i / 5)) * 9),
    });
  }
  return pts;
}

export function demoSensors(): SensorStat[] {
  return [
    { sensor: "motion", label: "Motion", activations: 142, weight: 0.3 },
    { sensor: "sound", label: "Noise", activations: 98, weight: 0.25 },
    { sensor: "darkness", label: "Low Light", activations: 211, weight: 0.2 },
    { sensor: "vibration", label: "Vibration", activations: 37, weight: 0.15 },
    { sensor: "smoke", label: "Smoke", activations: 6, weight: 0.1 },
  ];
}

export function demoForecast(): Forecast {
  const series = demoTimeseries(6);
  const last = series[series.length - 1]?.risk_score ?? 30;
  const forecast = Array.from({ length: 6 }, (_, i) => {
    const v = Math.max(2, last - i * 3 + Math.sin(i) * 4);
    return { step: i + 1, risk_score: Math.round(v), lower: Math.round(v - 8), upper: Math.round(v + 8) };
  });
  return { forecast, trend: "falling", slope: -2.4, series };
}

export function demoAlerts(): Alert[] {
  return [
    {
      id: 5012,
      node_id: "node-b",
      event_id: 99231,
      created_at: iso(320),
      updated_at: iso(120),
      category: "high",
      priority: 2,
      risk_score: 71,
      title: "Sustained activity · Riverside Path",
      summary: "Motion and noise persisted for over a minute in low light near East Commons.",
      sensors: ["motion", "sound", "darkness"],
      correlated_nodes: ["node-d"],
      status: "investigating",
      acknowledged: true,
      resolved_at: null,
    },
    {
      id: 5011,
      node_id: "node-d",
      event_id: 99180,
      created_at: iso(900),
      updated_at: iso(880),
      category: "medium",
      priority: 3,
      risk_score: 47,
      title: "Brief motion spike · Stadium Loop",
      summary: "Short-lived movement detected, no correlated nodes. Auto-monitoring.",
      sensors: ["motion"],
      correlated_nodes: [],
      status: "open",
      acknowledged: false,
      resolved_at: null,
    },
    {
      id: 5009,
      node_id: "node-a",
      event_id: 98744,
      created_at: iso(3600),
      updated_at: iso(2400),
      category: "low",
      priority: 4,
      risk_score: 21,
      title: "Routine check-in · Maple Walk",
      summary: "Light foot traffic on the recommended corridor. No action required.",
      sensors: ["motion"],
      correlated_nodes: [],
      status: "resolved",
      acknowledged: true,
      resolved_at: iso(2400),
    },
  ];
}

export function demoAlertDetail(id: number): AlertDetail {
  const base = demoAlerts().find((a) => a.id === id) ?? demoAlerts()[0];
  return {
    ...base,
    timeline: [
      { id: 1, ts: base.created_at, kind: "detected", message: "Anomaly detected by risk engine.", actor: "system" },
      { id: 2, ts: iso(280), kind: "correlate", message: "Cross-checked neighboring nodes for corroboration.", actor: "engine" },
      { id: 3, ts: iso(200), kind: "alert", message: "Incident raised and routed to operators.", actor: "system" },
      { id: 4, ts: iso(120), kind: "ack", message: "Acknowledged by operator on duty.", actor: "operator" },
    ],
  };
}
