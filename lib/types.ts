export type ThreatLevel =
  | "safe" | "low" | "medium" | "high" | "critical" | "emergency";

export interface NodeInfo {
  id: string;
  name: string;
  zone: string;
  kind: string;
  latitude: number | null;
  longitude: number | null;
  firmware: string | null;
  last_seen: string | null;
  online: boolean;
  current_risk: number;
}

export interface SecurityEvent {
  id: number;
  node_id: string;
  zone?: string;
  ts: string;
  motion: boolean;
  vibration: boolean;
  smoke: number;
  sound: number;
  darkness: number;
  active_sensors: string[];
  risk_score: number;
  threat_level: ThreatLevel;
  confidence: number;
  rule_score: number;
  ml_score: number;
  matched_rules?: string[];
  correlated_nodes?: string[];
  rationale?: string[];
  factors?: string[];
  correlation?: Record<string, unknown>;
}

export interface ZoneStatus {
  zone: string;
  risk_score: number;
  threat_level: ThreatLevel;
  online_nodes: number;
  total_nodes: number;
}

export interface Overview {
  threat_level: ThreatLevel;
  risk_score: number;
  active_nodes: number;
  total_nodes: number;
  open_alerts: number;
  critical_alerts: number;
  zones: ZoneStatus[];
  updated_at: string;
}

export interface Alert {
  id: number;
  node_id: string | null;
  event_id: number | null;
  created_at: string;
  updated_at: string;
  category: ThreatLevel;
  priority: number;
  risk_score: number;
  title: string;
  summary: string;
  sensors: string[];
  correlated_nodes: string[];
  status: "open" | "investigating" | "resolved" | "dismissed";
  acknowledged: boolean;
  resolved_at: string | null;
}

export interface TimelineEntry {
  id: number;
  ts: string;
  kind: string;
  message: string;
  actor: string;
}

export interface AlertDetail extends Alert {
  timeline: TimelineEntry[];
}

export interface TimePoint {
  ts: string;
  risk_score: number;
  event_count: number;
}

export interface SensorStat {
  sensor: string;
  label: string;
  activations: number;
  weight: number;
}

export interface ForecastPoint {
  step: number;
  risk_score: number;
  lower: number;
  upper: number;
}

export interface Forecast {
  forecast: ForecastPoint[];
  trend: string;
  slope?: number;
  series: TimePoint[];
}

export interface WSMessage {
  type: "hello" | "event" | "alert" | "overview";
  payload: any;
}


export interface RouteNode {
  node_id: string;
  name: string;
  zone: string;
  online: boolean;
  fresh: boolean;
  risk_score: number | null;
  threat_level: ThreatLevel | "unknown";
  confidence: number;
  active_sensors: string[];
  factors: string[];
  last_seen: string | null;
}

export interface RouteAssessment {
  id: string;
  name: string;
  node_ids: string[];
  nodes: RouteNode[];
  route_risk: number | null;
  safety_score: number | null;
  mean_risk: number | null;
  historical_activity: number;
  confidence: number;
  threat_level: ThreatLevel | "unknown";
  available: boolean;
}

export interface RouteRecommendation {
  source: string;
  destination: string;
  routes: RouteAssessment[];
  recommended_route_id: string | null;
  reason: string;
  updated_at: string;
}
