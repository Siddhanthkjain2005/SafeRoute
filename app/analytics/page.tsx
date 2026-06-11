"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Page } from "@/components/shell/Page";
import { CardHeader, MotionCard } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TrendChart } from "@/components/viz/TrendChart";
import { useForecast, useSensors, useTimeseries } from "@/lib/hooks";
import { useLiveStore } from "@/lib/store";

const SENSOR_COLORS = ["#5b4dd6", "#f59e0b", "#e0245e", "#25a575", "#9b7df0"];
const TOOLTIP = {
  background: "rgba(255,255,255,0.96)",
  border: "1px solid rgba(100,116,160,0.18)",
  borderRadius: 12,
  fontSize: 12,
  color: "#1b2240",
  boxShadow: "0 12px 32px -12px rgba(40,50,90,0.35)",
};

export default function AnalyticsPage() {
  const { data: ts } = useTimeseries(24);
  const { data: sensors } = useSensors(24);
  const { data: forecast } = useForecast(6);
  const events = useLiveStore((s) => s.events);

  const fseries = [
    ...(forecast?.series ?? []),
    ...(forecast?.forecast ?? []).map((f) => ({
      ts: `+${f.step * 10}m`,
      risk_score: f.risk_score,
      upper: f.upper,
      lower: f.lower,
    })),
  ];

  const trend = forecast?.trend ?? "stable";
  const TrendIcon = trend === "rising" ? TrendingUp : trend === "falling" ? TrendingDown : Minus;
  const trendColor = trend === "rising" ? "text-threat-high" : trend === "falling" ? "text-threat-safe" : "text-content-muted";

  // risk distribution from recent live events
  const dist = ["safe", "low", "medium", "high", "critical", "emergency"].map((lvl, i) => ({
    name: lvl,
    value: events.filter((e) => e.threat_level === lvl).length,
    color: ["#25a575", "#0e95e6", "#f59e0b", "#f0673a", "#e0245e", "#dc2680"][i],
  })).filter((d) => d.value > 0);

  return (
    <Page>
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-content-strong">Analytics</h1>
        <p className="mt-1 text-sm text-content-muted">
          How environmental risk has trended across the network — historical patterns, sensor
          activity, and a short-term forecast.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        <MotionCard delay={0.05} className="lg:col-span-8">
          <CardHeader title="Risk Time Series" subtitle="last 24 hours · max risk per bucket" />
          {ts ? <TrendChart data={ts} height={260} /> : <Skeleton className="h-[260px]" />}
        </MotionCard>

        <MotionCard delay={0.12} className="lg:col-span-4">
          <CardHeader title="Risk Distribution" subtitle="recent event mix" />
          {dist.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
                  {dist.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-content-faint">No events yet</div>
          )}
          <div className="flex flex-wrap gap-3">
            {dist.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] capitalize text-content-muted">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} /> {d.name} ({d.value})
              </span>
            ))}
          </div>
        </MotionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <MotionCard delay={0.05} className="lg:col-span-5">
          <CardHeader title="Activation Statistics" subtitle="sensor triggers (24h)" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sensors ?? []} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 60% / 0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={92} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "hsl(215 30% 60% / 0.06)" }} />
              <Bar dataKey="activations" radius={[0, 6, 6, 0]}>
                {(sensors ?? []).map((_, i) => <Cell key={i} fill={SENSOR_COLORS[i % SENSOR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </MotionCard>

        <MotionCard delay={0.12} className="lg:col-span-7">
          <CardHeader title="Risk Forecast" subtitle="trend extrapolation (~next hour) with uncertainty band"
            right={<span className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}><TrendIcon className="h-4 w-4" /> {trend}</span>} />
          <TrendChart data={fseries} height={250} showForecastBand />
        </MotionCard>
      </div>

      <MotionCard delay={0.1} className="mt-4">
        <CardHeader title="Sensor Performance" subtitle="weight vs. measured activity (24h)" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(sensors ?? []).map((s, i) => (
            <div key={s.sensor} className="rounded-lg border border-hairline/10 bg-surface-2/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-content">{s.label}</span>
                <span className="num text-xs text-content-faint">w={s.weight}</span>
              </div>
              <div className="num mt-2 text-2xl font-semibold text-content-strong">{s.activations}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3/50">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, s.activations * 4)}%`, background: SENSOR_COLORS[i % SENSOR_COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>
      </MotionCard>
    </Page>
  );
}
