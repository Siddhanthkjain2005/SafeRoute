"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "@/lib/utils";

interface Point {
  ts: string;
  risk_score: number;
  event_count?: number;
  upper?: number;
  lower?: number;
}

export function TrendChart({
  data,
  height = 240,
  showForecastBand = false,
}: {
  data: Point[];
  height?: number;
  showForecastBand?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b8cff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#5b8cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="ts"
          tickFormatter={fmtTime}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(11,16,32,0.95)",
            border: "1px solid rgba(148,163,184,0.18)",
            borderRadius: 12,
            color: "#e2e8f0",
            fontSize: 12,
          }}
          labelFormatter={(v) => fmtTime(String(v))}
        />
        {showForecastBand && (
          <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(244,114,182,0.12)" />
        )}
        <Area
          type="monotone"
          dataKey="risk_score"
          stroke="#7aa2ff"
          strokeWidth={2}
          fill="url(#riskFill)"
        />
        {showForecastBand && (
          <Line type="monotone" dataKey="lower" stroke="rgba(244,114,182,0.4)" dot={false} strokeDasharray="4 4" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
