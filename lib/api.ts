import type {
  Alert,
  AlertDetail,
  Forecast,
  NodeInfo,
  Overview,
  RouteRecommendation,
  SecurityEvent,
  SensorStat,
} from "./types";
import {
  demoAlertDetail,
  demoAlerts,
  demoEvents,
  demoForecast,
  demoNodes,
  demoOverview,
  demoRouteRecommendation,
  demoSensors,
  demoTimeseries,
} from "./demo";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
// Demo operator token — in production this comes from an auth session.
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "dev-operator-token";

// Short timeout so the UI falls back to demo data quickly when offline.
async function withTimeout(input: string, init?: RequestInit, ms = 2500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Try the live backend; on any failure, resolve with elegant demo data. */
async function getOrDemo<T>(path: string, fallback: () => T): Promise<T> {
  try {
    const res = await withTimeout(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

async function send<T>(path: string, method: string, body?: unknown, fallback?: () => T): Promise<T> {
  try {
    const res = await withTimeout(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    if (fallback) return fallback();
    throw e;
  }
}

export const api = {
  base: BASE,
  overview: () => getOrDemo<Overview>("/overview", demoOverview),
  nodes: () => getOrDemo<NodeInfo[]>("/nodes", demoNodes),
  events: (limit = 100, node?: string) =>
    getOrDemo<SecurityEvent[]>(
      `/events?limit=${limit}${node ? `&node_id=${node}` : ""}`,
      () => demoEvents(limit)
    ),
  alerts: (status?: string) =>
    getOrDemo<Alert[]>(`/alerts${status ? `?status=${status}` : ""}`, () =>
      status ? demoAlerts().filter((a) => a.status === status) : demoAlerts()
    ),
  alert: (id: number) => getOrDemo<AlertDetail>(`/alerts/${id}`, () => demoAlertDetail(id)),
  timeseries: (hours = 6, bucket = 10) =>
    getOrDemo<{ ts: string; risk_score: number; event_count: number }[]>(
      `/analytics/timeseries?hours=${hours}&bucket_minutes=${bucket}`,
      () => demoTimeseries(hours)
    ),
  sensors: (hours = 24) => getOrDemo<SensorStat[]>(`/analytics/sensors?hours=${hours}`, demoSensors),
  heatmap: (hours = 6) =>
    getOrDemo<{ zone: string; intensity: number; events: number }[]>(
      `/analytics/heatmap?hours=${hours}`,
      () => demoNodes().map((n) => ({ zone: n.zone, intensity: n.current_risk / 100, events: 5 }))
    ),
  forecast: (hours = 6) => getOrDemo<Forecast>(`/analytics/forecast?hours=${hours}`, demoForecast),
  riskConfig: () => getOrDemo<any>("/risk/config", () => ({})),
  routeRecommendation: () =>
    getOrDemo<RouteRecommendation>("/routes/recommend", demoRouteRecommendation),

  // writes
  updateAlert: (id: number, body: { status?: string; acknowledged?: boolean; note?: string }) =>
    send<AlertDetail>(`/alerts/${id}`, "PATCH", body, () => ({
      ...demoAlertDetail(id),
      ...(body.status ? { status: body.status as AlertDetail["status"] } : {}),
      ...(body.acknowledged != null ? { acknowledged: body.acknowledged } : {}),
    })),
  simulate: (frame: Record<string, unknown>) =>
    send<{ ok: boolean; event: SecurityEvent }>("/simulate/telemetry", "POST", frame, () => ({
      ok: true,
      event: demoEvents(1)[0],
    })),
};

export const fetcher = (path: string) => getOrDemo(path, () => ({}) as any);
