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
import { activateDemo, demoEngine, isDemoActive } from "./demoEngine";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
// Demo operator token — in production this comes from an auth session.
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "dev-operator-token";

/** Race a backend request against a short timeout so demo fallback is snappy. */
function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}

async function get<T>(path: string, demo: () => T): Promise<T> {
  // Once demo mode is active, stay there — backend isn't coming back this session.
  if (isDemoActive()) return demo();
  const { signal, clear } = withTimeout(1500);
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store", signal });
    clear();
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch {
    clear();
    activateDemo();
    return demo();
  }
}

async function send<T>(path: string, method: string, body: unknown, demo: () => T): Promise<T> {
  if (isDemoActive()) return demo();
  const { signal, clear } = withTimeout(1500);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
    clear();
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return (await res.json()) as T;
  } catch {
    clear();
    activateDemo();
    return demo();
  }
}

const E = () => demoEngine();

export const api = {
  base: BASE,
  overview: () => get<Overview>("/overview", () => E().overview()),
  nodes: () => get<NodeInfo[]>("/nodes", () => E().nodesList()),
  events: (limit = 100, node?: string) =>
    get<SecurityEvent[]>(
      `/events?limit=${limit}${node ? `&node_id=${node}` : ""}`,
      () => E().eventsList(limit, node)
    ),
  alerts: (status?: string) =>
    get<Alert[]>(`/alerts${status ? `?status=${status}` : ""}`, () => E().alertsList(status)),
  alert: (id: number) => get<AlertDetail>(`/alerts/${id}`, () => E().alertDetail(id)),
  timeseries: (hours = 6, bucket = 10) =>
    get<{ ts: string; risk_score: number; event_count: number }[]>(
      `/analytics/timeseries?hours=${hours}&bucket_minutes=${bucket}`,
      () => E().timeseries(hours)
    ),
  sensors: (hours = 24) => get<SensorStat[]>(`/analytics/sensors?hours=${hours}`, () => E().sensors()),
  heatmap: (hours = 6) =>
    get<{ zone: string; intensity: number; events: number }[]>(
      `/analytics/heatmap?hours=${hours}`,
      () => E().heatmap()
    ),
  forecast: (hours = 6) => get<Forecast>(`/analytics/forecast?hours=${hours}`, () => E().forecast(hours)),
  riskConfig: () => get<any>("/risk/config", () => E().riskConfig()),
  routeRecommendation: () =>
    get<RouteRecommendation>("/routes/recommend", () => E().recommendation()),

  // writes
  updateAlert: (id: number, body: { status?: string; acknowledged?: boolean; note?: string }) =>
    send<AlertDetail>(`/alerts/${id}`, "PATCH", body, () => E().updateAlert(id, body)),
  simulate: (frame: Record<string, unknown>) =>
    send<{ ok: boolean; event: SecurityEvent }>(
      "/simulate/telemetry",
      "POST",
      frame,
      () => ({ ok: true, event: E().simulate(frame) })
    ),
};

export const fetcher = (path: string) => get(path, () => ({}));
