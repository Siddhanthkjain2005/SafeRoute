"use client";
/**
 * ─────────────────────────────────────────────────────────────────────────
 *  NightGuard Demo Engine
 * ─────────────────────────────────────────────────────────────────────────
 *  A self-contained, stateful simulator that stands in for the Python
 *  backend whenever it is unreachable (preview, offline demo, judging table).
 *
 *  It models a small mesh of IoT sensor nodes guarding two campus paths,
 *  evolves their environmental risk over time, reacts to operator
 *  "simulate" frames, and exposes the exact same shapes as the real API.
 *
 *  When the real backend is online, none of this runs.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type {
  Alert,
  AlertDetail,
  Forecast,
  NodeInfo,
  Overview,
  RouteAssessment,
  RouteNode,
  RouteRecommendation,
  SecurityEvent,
  SensorStat,
  ThreatLevel,
  TimePoint,
} from "./types";

type Listener = (msg: { type: "event" | "alert" | "overview"; payload: any }) => void;

interface NodeState {
  id: string;
  name: string;
  zone: string;
  kind: string;
  lat: number;
  lng: number;
  online: boolean;
  // live analog readings (0..1)
  motion: number;
  vibration: number;
  smoke: number;
  sound: number;
  darkness: number;
  risk: number; // smoothed 0..100
  lastSeen: number;
  // transient spike envelope driven by disturb()
  spike: number;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const now = () => Date.now();
const iso = (t: number) => new Date(t).toISOString();
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);

function levelFromRisk(r: number): ThreatLevel {
  if (r >= 82) return "emergency";
  if (r >= 66) return "critical";
  if (r >= 46) return "high";
  if (r >= 28) return "medium";
  if (r >= 12) return "low";
  return "safe";
}

const SENSOR_WEIGHTS: Record<string, number> = {
  motion: 22,
  vibration: 16,
  smoke: 30,
  sound: 14,
  darkness: 18,
};

class DemoEngine {
  nodes: NodeState[];
  events: SecurityEvent[] = [];
  alerts: Alert[] = [];
  timeline: Record<number, AlertDetail["timeline"]> = {};
  history: TimePoint[] = [];
  private eventSeq = 1;
  private alertSeq = 1;
  private listeners = new Set<Listener>();
  private started = false;
  private nightFactor = 0.78; // ambient darkness baseline (it's night)

  constructor() {
    this.nodes = [
      { id: "zone-a", name: "Maple Walk", zone: "North Quad", kind: "path-guardian", lat: 37.4292, lng: -122.1701, online: true, motion: 0.05, vibration: 0.03, smoke: 0.02, sound: 0.18, darkness: 0.34, risk: 8, lastSeen: now(), spike: 0 },
      { id: "zone-b", name: "Cedar Underpass", zone: "Riverside", kind: "path-guardian", lat: 37.4271, lng: -122.1689, online: true, motion: 0.12, vibration: 0.06, smoke: 0.02, sound: 0.3, darkness: 0.7, risk: 22, lastSeen: now(), spike: 0 },
      { id: "zone-c", name: "Library Court", zone: "Central", kind: "area-sentinel", lat: 37.4281, lng: -122.1712, online: true, motion: 0.08, vibration: 0.04, smoke: 0.02, sound: 0.22, darkness: 0.25, risk: 10, lastSeen: now(), spike: 0 },
      { id: "zone-d", name: "East Lot", zone: "Parking", kind: "area-sentinel", lat: 37.4263, lng: -122.1675, online: true, motion: 0.1, vibration: 0.05, smoke: 0.02, sound: 0.26, darkness: 0.62, risk: 16, lastSeen: now(), spike: 0 },
    ];
    // seed some history so charts aren't empty
    const t0 = now() - 6 * 3600_000;
    for (let i = 0; i <= 36; i++) {
      const t = t0 + i * 10 * 60_000;
      this.history.push({
        ts: iso(t),
        risk_score: Math.round(clamp(18 + 14 * Math.sin(i / 4) + rnd(-6, 6), 0, 100)),
        event_count: Math.round(rnd(1, 6)),
      });
    }
  }

  /* ── pub/sub ──────────────────────────────────────────────────────── */
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit(type: "event" | "alert" | "overview", payload: any) {
    this.listeners.forEach((l) => l({ type, payload }));
  }

  /* ── simulation loop ──────────────────────────────────────────────── */
  start() {
    if (this.started) return;
    this.started = true;
    // physics tick — evolve readings & decay spikes
    setInterval(() => this.tick(), 1100);
  }

  private tick() {
    const t = now();
    for (const n of this.nodes) {
      // ambient wander
      n.darkness = clamp(this.nightFactor + Math.sin(t / 9000 + n.lat) * 0.08 + rnd(-0.03, 0.03));
      n.sound = clamp(n.sound * 0.9 + rnd(0, 0.12) + n.spike * 0.5);
      n.motion = clamp(n.motion * 0.82 + (Math.random() < 0.12 ? rnd(0.2, 0.6) : 0) + n.spike * 0.7);
      n.vibration = clamp(n.vibration * 0.85 + n.spike * 0.6);
      n.smoke = clamp(n.smoke * 0.96 + n.spike * 0.25);
      n.spike = Math.max(0, n.spike - 0.12); // envelope decay

      const target = this.scoreNode(n);
      n.risk = clamp(n.risk + (target - n.risk) * 0.35, 0, 100);
      n.lastSeen = t;
    }
    // occasionally emit a telemetry event from a random node
    const emitter = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    this.publishEvent(emitter);
    this.emit("overview", this.overview());
  }

  private scoreNode(n: NodeState): number {
    const active = this.activeSensors(n);
    let raw = 0;
    if (active.includes("motion")) raw += SENSOR_WEIGHTS.motion * n.motion;
    if (active.includes("vibration")) raw += SENSOR_WEIGHTS.vibration * n.vibration;
    if (active.includes("smoke")) raw += SENSOR_WEIGHTS.smoke * n.smoke;
    if (active.includes("sound")) raw += SENSOR_WEIGHTS.sound * n.sound;
    raw += SENSOR_WEIGHTS.darkness * n.darkness * 0.5; // poor visibility always adds some risk
    // correlation bonus: multiple active sensors compound
    if (active.length >= 3) raw *= 1.25;
    return clamp(raw, 0, 100);
  }

  private activeSensors(n: NodeState): string[] {
    const s: string[] = [];
    if (n.motion > 0.4) s.push("motion");
    if (n.vibration > 0.4) s.push("vibration");
    if (n.smoke > 0.3) s.push("smoke");
    if (n.sound > 0.5) s.push("sound");
    if (n.darkness > 0.6) s.push("darkness");
    return s;
  }

  private factors(n: NodeState): string[] {
    const f: string[] = [];
    if (n.darkness > 0.6) f.push("Low visibility");
    else if (n.darkness < 0.35) f.push("Well lit");
    if (n.motion > 0.4) f.push("Movement detected");
    if (n.sound > 0.5) f.push("Elevated noise");
    if (n.vibration > 0.4) f.push("Vibration");
    if (n.smoke > 0.3) f.push("Smoke present");
    if (f.length === 0) f.push("All clear");
    return f;
  }

  private toEvent(n: NodeState): SecurityEvent {
    const active = this.activeSensors(n);
    const level = levelFromRisk(n.risk);
    return {
      id: this.eventSeq++,
      node_id: n.id,
      zone: n.zone,
      ts: iso(n.lastSeen),
      motion: n.motion > 0.4,
      vibration: n.vibration > 0.4,
      smoke: Number(n.smoke.toFixed(2)),
      sound: Number(n.sound.toFixed(2)),
      darkness: Number(n.darkness.toFixed(2)),
      active_sensors: active,
      risk_score: Math.round(n.risk),
      threat_level: level,
      confidence: clamp(0.55 + active.length * 0.1 + n.risk / 300, 0, 0.99),
      rule_score: Math.round(n.risk * 0.6),
      ml_score: Math.round(n.risk * 0.4),
      matched_rules: active.length >= 3 ? ["multi-sensor-correlation"] : [],
      correlated_nodes: [],
      rationale: this.factors(n),
      factors: this.factors(n),
    };
  }

  private publishEvent(n: NodeState) {
    const ev = this.toEvent(n);
    this.events.unshift(ev);
    this.events = this.events.slice(0, 200);
    this.emit("event", ev);

    // raise an alert on high-severity readings (debounced per node)
    if (n.risk >= 46) {
      const recent = this.alerts.find(
        (a) => a.node_id === n.id && a.status === "open" && now() - new Date(a.created_at).getTime() < 20000
      );
      if (!recent) {
        const level = levelFromRisk(n.risk);
        const id = this.alertSeq++;
        const alert: Alert = {
          id,
          node_id: n.id,
          event_id: ev.id,
          created_at: iso(now()),
          updated_at: iso(now()),
          category: level,
          priority: n.risk >= 66 ? 1 : 2,
          risk_score: Math.round(n.risk),
          title: `${this.factors(n)[0]} on ${n.name}`,
          summary: `${n.name} (${n.zone}) is reporting ${this.activeSensors(n).join(", ") || "elevated"} activity with a risk score of ${Math.round(n.risk)}.`,
          sensors: this.activeSensors(n),
          correlated_nodes: [],
          status: "open",
          acknowledged: false,
          resolved_at: null,
        };
        this.alerts.unshift(alert);
        this.timeline[id] = [
          { id: 1, ts: alert.created_at, kind: "created", message: "Alert raised by correlation engine", actor: "system" },
        ];
        this.emit("alert", alert);
      }
    }
  }

  /* ── operator actions ─────────────────────────────────────────────── */
  simulate(frame: Record<string, any>): SecurityEvent {
    const id = frame.node_id ?? this.nodes[0].id;
    const n = this.nodes.find((x) => x.id === id) ?? this.nodes[0];
    if (typeof frame.motion === "boolean") n.motion = frame.motion ? clamp(rnd(0.6, 0.95)) : 0.05;
    if (typeof frame.vibration === "boolean") n.vibration = frame.vibration ? clamp(rnd(0.6, 0.9)) : 0.03;
    if (typeof frame.smoke === "number") n.smoke = clamp(frame.smoke);
    if (typeof frame.sound === "number") n.sound = clamp(frame.sound);
    if (typeof frame.darkness === "number") n.darkness = clamp(frame.darkness);
    // a manual frame injects a spike so the change is felt immediately
    n.spike = Math.max(n.spike, 0.8);
    n.risk = clamp(this.scoreNode(n), 0, 100);
    n.lastSeen = now();
    this.publishEvent(n);
    this.emit("overview", this.overview());
    return this.toEvent(n);
  }

  updateAlert(id: number, body: { status?: string; acknowledged?: boolean; note?: string }): AlertDetail {
    const a = this.alerts.find((x) => x.id === id);
    if (!a) throw new Error("not found");
    if (body.status) a.status = body.status as Alert["status"];
    if (body.acknowledged != null) a.acknowledged = body.acknowledged;
    if (body.status === "resolved" || body.status === "dismissed") a.resolved_at = iso(now());
    a.updated_at = iso(now());
    const tl = this.timeline[id] ?? (this.timeline[id] = []);
    tl.push({
      id: tl.length + 1,
      ts: iso(now()),
      kind: body.status ?? (body.acknowledged ? "acknowledged" : "note"),
      message: body.note || `Status changed to ${body.status ?? "updated"}`,
      actor: "operator",
    });
    return { ...a, timeline: tl };
  }

  /* ── read endpoints (mirror api.ts) ───────────────────────────────── */
  nodesList(): NodeInfo[] {
    return this.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      zone: n.zone,
      kind: n.kind,
      latitude: n.lat,
      longitude: n.lng,
      firmware: "ng-2.4.1",
      last_seen: iso(n.lastSeen),
      online: n.online,
      current_risk: Math.round(n.risk),
    }));
  }

  eventsList(limit = 100, node?: string): SecurityEvent[] {
    const list = node ? this.events.filter((e) => e.node_id === node) : this.events;
    if (list.length === 0) return this.nodes.map((n) => this.toEvent(n));
    return list.slice(0, limit);
  }

  overview(): Overview {
    const zonesMap = new Map<string, NodeState[]>();
    for (const n of this.nodes) {
      const arr = zonesMap.get(n.zone) ?? [];
      arr.push(n);
      zonesMap.set(n.zone, arr);
    }
    const zones = [...zonesMap.entries()].map(([zone, ns]) => {
      const risk = Math.round(ns.reduce((s, x) => s + x.risk, 0) / ns.length);
      return {
        zone,
        risk_score: risk,
        threat_level: levelFromRisk(risk),
        online_nodes: ns.filter((x) => x.online).length,
        total_nodes: ns.length,
      };
    });
    const overall = Math.round(this.nodes.reduce((s, x) => s + x.risk, 0) / this.nodes.length);
    return {
      threat_level: levelFromRisk(overall),
      risk_score: overall,
      active_nodes: this.nodes.filter((n) => n.online).length,
      total_nodes: this.nodes.length,
      open_alerts: this.alerts.filter((a) => a.status === "open").length,
      critical_alerts: this.alerts.filter((a) => a.status === "open" && (a.category === "critical" || a.category === "emergency")).length,
      zones,
      updated_at: iso(now()),
    };
  }

  alertsList(status?: string): Alert[] {
    if (this.alerts.length === 0) return [];
    return status ? this.alerts.filter((a) => a.status === status) : this.alerts;
  }

  alertDetail(id: number): AlertDetail {
    const a = this.alerts.find((x) => x.id === id);
    if (!a) throw new Error("not found");
    return { ...a, timeline: this.timeline[id] ?? [] };
  }

  private routeNode(n: NodeState): RouteNode {
    return {
      node_id: n.id,
      name: n.name,
      zone: n.zone,
      online: n.online,
      fresh: now() - n.lastSeen < 30000,
      risk_score: Math.round(n.risk),
      threat_level: levelFromRisk(n.risk),
      confidence: clamp(0.6 + this.activeSensors(n).length * 0.08, 0, 0.98),
      active_sensors: this.activeSensors(n),
      factors: this.factors(n),
      last_seen: iso(n.lastSeen),
    };
  }

  private assess(id: string, name: string, node: NodeState): RouteAssessment {
    const rn = this.routeNode(node);
    const risk = node.risk;
    return {
      id,
      name,
      node_ids: [node.id],
      nodes: [rn],
      route_risk: Math.round(risk),
      safety_score: Math.round(100 - risk),
      mean_risk: Math.round(risk),
      historical_activity: Math.round(rnd(2, 9)),
      confidence: rn.confidence,
      threat_level: levelFromRisk(risk),
      available: true,
    };
  }

  recommendation(): RouteRecommendation {
    const a = this.assess("route-a", "Maple Walk", this.nodes[0]);
    const b = this.assess("route-b", "Cedar Underpass", this.nodes[1]);
    const routes = [a, b];
    const best = [...routes].sort((x, y) => (y.safety_score ?? 0) - (x.safety_score ?? 0))[0];
    const gap = Math.abs((a.safety_score ?? 0) - (b.safety_score ?? 0));
    let reason: string;
    if (gap < 6) {
      reason = `Both paths are comparable right now. ${best.name} edges ahead with a safety score of ${best.safety_score}.`;
    } else {
      const other = best.id === a.id ? b : a;
      reason = `${best.name} is clearly safer (${best.safety_score} vs ${other.safety_score}) — ${other.nodes[0].factors[0].toLowerCase()} on ${other.name} is raising risk.`;
    }
    return {
      source: "West Residence Halls",
      destination: "Science Library",
      routes,
      recommended_route_id: best.id,
      reason,
      updated_at: iso(now()),
    };
  }

  timeseries(hours = 6): TimePoint[] {
    const cutoff = now() - hours * 3600_000;
    const pts = this.history.filter((p) => new Date(p.ts).getTime() >= cutoff);
    // append a live-ish tail
    const overall = Math.round(this.nodes.reduce((s, x) => s + x.risk, 0) / this.nodes.length);
    pts.push({ ts: iso(now()), risk_score: overall, event_count: Math.round(rnd(1, 5)) });
    return pts;
  }

  sensors(): SensorStat[] {
    const labels: Record<string, string> = { motion: "Motion", vibration: "Vibration", smoke: "Smoke", sound: "Sound", darkness: "Darkness" };
    return Object.keys(SENSOR_WEIGHTS).map((s) => {
      const activations = this.events.filter((e) => e.active_sensors.includes(s)).length + Math.round(rnd(4, 20));
      return { sensor: s, label: labels[s], activations, weight: SENSOR_WEIGHTS[s] };
    });
  }

  heatmap() {
    return this.nodes.map((n) => ({
      zone: n.zone,
      intensity: Math.round(n.risk),
      events: this.events.filter((e) => e.node_id === n.id).length + Math.round(rnd(2, 12)),
    }));
  }

  forecast(hours = 6): Forecast {
    const series = this.timeseries(hours);
    const last = series[series.length - 1]?.risk_score ?? 20;
    const slope = (series[series.length - 1]?.risk_score ?? 20) - (series[0]?.risk_score ?? 20);
    const forecast = Array.from({ length: 8 }).map((_, i) => {
      const v = clamp(last + (slope / 8) * (i + 1) + Math.sin(i) * 3, 0, 100);
      return { step: i + 1, risk_score: Math.round(v), lower: Math.round(clamp(v - 8, 0, 100)), upper: Math.round(clamp(v + 8, 0, 100)) };
    });
    return { forecast, trend: slope > 4 ? "rising" : slope < -4 ? "falling" : "steady", slope, series };
  }

  riskConfig() {
    return { weights: SENSOR_WEIGHTS, thresholds: { medium: 28, high: 46, critical: 66 }, mode: "hybrid" };
  }
}

/* singleton */
let _engine: DemoEngine | null = null;
export function demoEngine(): DemoEngine {
  if (!_engine) {
    _engine = new DemoEngine();
    _engine.start();
  }
  return _engine;
}

/** Flipped to true the first time a real backend request fails. */
let _demoActive = false;
export const isDemoActive = () => _demoActive;
export function activateDemo() {
  if (!_demoActive) {
    _demoActive = true;
    demoEngine();
  }
}
