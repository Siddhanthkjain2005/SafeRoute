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

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
// Demo operator token — in production this comes from an auth session.
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "dev-operator-token";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export const api = {
  base: BASE,
  overview: () => get<Overview>("/overview"),
  nodes: () => get<NodeInfo[]>("/nodes"),
  events: (limit = 100, node?: string) =>
    get<SecurityEvent[]>(`/events?limit=${limit}${node ? `&node_id=${node}` : ""}`),
  alerts: (status?: string) => get<Alert[]>(`/alerts${status ? `?status=${status}` : ""}`),
  alert: (id: number) => get<AlertDetail>(`/alerts/${id}`),
  timeseries: (hours = 6, bucket = 10) =>
    get<{ ts: string; risk_score: number; event_count: number }[]>(
      `/analytics/timeseries?hours=${hours}&bucket_minutes=${bucket}`
    ),
  sensors: (hours = 24) => get<SensorStat[]>(`/analytics/sensors?hours=${hours}`),
  heatmap: (hours = 6) =>
    get<{ zone: string; intensity: number; events: number }[]>(`/analytics/heatmap?hours=${hours}`),
  forecast: (hours = 6) => get<Forecast>(`/analytics/forecast?hours=${hours}`),
  riskConfig: () => get<any>("/risk/config"),
  routeRecommendation: () => get<RouteRecommendation>("/routes/recommend"),

  // writes
  updateAlert: (id: number, body: { status?: string; acknowledged?: boolean; note?: string }) =>
    send<AlertDetail>(`/alerts/${id}`, "PATCH", body),
  simulate: (frame: Record<string, unknown>) =>
    send<{ ok: boolean; event: SecurityEvent }>("/simulate/telemetry", "POST", frame),
};

export const fetcher = (path: string) => get(path);
